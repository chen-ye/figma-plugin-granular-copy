import { expect, test } from '@playwright/test';

const properties = [
  { name: 'Fills', granules: ['fills'] },
  {
    name: 'Strokes',
    granules: [
      'strokes',
      'strokeWeight',
      'strokeAlign',
      'dashPattern',
      'strokeCap',
      'strokeJoin',
      'strokeMiterLimit',
    ],
  },
  { name: 'Effects', granules: ['effects'] },
  { name: 'Opacity', granules: ['opacity'] },
  {
    name: 'Corner Radius',
    granules: [
      'cornerRadius',
      'topLeftRadius',
      'topRightRadius',
      'bottomLeftRadius',
      'bottomRightRadius',
    ],
  },
  { name: 'Blend Mode', granules: ['blendMode'] },
  { name: 'Position', granules: ['x', 'y'] },
  { name: 'Size', granules: ['width', 'height'] },
  { name: 'Rotation', granules: ['rotation'] },
  {
    name: 'Auto Layout',
    granules: [
      'paddingLeft',
      'paddingRight',
      'paddingTop',
      'paddingBottom',
      'itemSpacing',
      'primaryAxisAlignItems',
      'counterAxisAlignItems',
      'layoutMode',
      'layoutWrap',
    ],
  },
  { name: 'Constraints', granules: ['constraints'] },
  { name: 'Grids', granules: ['layoutGrids'] },
  { name: 'Text Content', granules: ['characters'] },
  {
    name: 'Text Styles',
    granules: [
      'textStyleId',
      'fontName',
      'fontSize',
      'lineHeight',
      'letterSpacing',
      'paragraphSpacing',
      'paragraphIndent',
      'textCase',
      'textDecoration',
    ],
  },
  { name: 'Export Settings', granules: ['exportSettings'] },
];

const mockNode = {
  id: '1:1',
  type: 'TEXT',
  name: 'Mock Node',
  fills: [],
  strokes: [],
  strokeWeight: 1,
  strokeAlign: 'CENTER',
  dashPattern: [],
  strokeCap: 'NONE',
  strokeJoin: 'MITER',
  strokeMiterLimit: 4,
  effects: [],
  opacity: 1,
  cornerRadius: 0,
  topLeftRadius: 0,
  topRightRadius: 0,
  bottomLeftRadius: 0,
  bottomRightRadius: 0,
  blendMode: 'PASS_THROUGH',
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  rotation: 0,
  layoutMode: 'NONE',
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
  itemSpacing: 0,
  primaryAxisAlignItems: 'MIN',
  counterAxisAlignItems: 'MIN',
  layoutWrap: 'NO_WRAP',
  constraints: { horizontal: 'MIN', vertical: 'MIN' },
  layoutGrids: [],
  characters: 'Test',
  textStyleId: '',
  fontName: { family: 'Inter', style: 'Regular' },
  fontSize: 12,
  lineHeight: { value: 14, unit: 'PIXELS' },
  letterSpacing: { value: 0, unit: 'PIXELS' },
  paragraphSpacing: 0,
  paragraphIndent: 0,
  textCase: 'ORIGINAL',
  textDecoration: 'NONE',
  exportSettings: [],
  listSpacing: 0,
};

test.describe('Property Logic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/harness.html');
    await page.waitForTimeout(1000); // Wait for worker

    // Setup spy on worker
    await page.evaluate(() => {
      // @ts-expect-error
      if (!window.originalPostMessage) {
        // @ts-expect-error
        window.originalPostMessage = window.worker.postMessage;
        // @ts-expect-error
        window.worker.postMessage = (msg) => {
          // @ts-expect-error
          if (window.onWorkerMessage) window.onWorkerMessage(msg);
          // @ts-expect-error
          window.originalPostMessage.call(window.worker, msg);
        };
      }
    });

    // Simulate selection and copy to enable buttons
    await page.evaluate((node) => {
      // @ts-expect-error
      window.worker.postMessage({
        type: 'SET_SELECTION',
        payload: [node],
      });
      // @ts-expect-error
      window.worker.postMessage({
        type: 'RUN_COMMAND',
        payload: { command: 'copy' },
      });
    }, mockNode);

    // Wait for copy to complete (buttons enabled)
    const iframe = page.frameLocator('#plugin-ui');
    await expect(iframe.getByRole('button', { name: 'Fills' })).toBeEnabled();
  });

  for (const prop of properties) {
    test(`should send correct message for ${prop.name}`, async ({ page }) => {
      const iframe = page.frameLocator('#plugin-ui');

      // Prepare promise to catch message
      const messagePromise = page.evaluate(() => {
        return new Promise((resolve) => {
          // @ts-expect-error
          window.onWorkerMessage = (msg) => {
            if (
              msg.type === 'UI_TO_MAIN' &&
              msg.payload.type === 'PASTE_PROPERTY'
            ) {
              resolve(msg.payload);
            }
          };
        });
      });

      // Click the button
      const button = iframe.getByRole('button', { name: prop.name });
      await button.click();

      const payload: any = await messagePromise;
      expect(payload.granules).toEqual(expect.arrayContaining(prop.granules));
    });
  }
});
