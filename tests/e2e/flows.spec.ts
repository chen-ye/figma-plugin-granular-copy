import { expect, test } from '@playwright/test';

const mockNode = {
  id: '1:1',
  type: 'TEXT',
  name: 'Mock Node',
  fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
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

test.describe('Complex Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/harness.html');
    await page.waitForTimeout(1000);

    // Setup spy
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
  });

  test('Copy & Paste Flow', async ({ page }) => {
    const iframe = page.frameLocator('#plugin-ui');
    const copyButton = iframe.getByText('Copy Selection');
    const pasteFillsButton = iframe.getByRole('button', { name: 'Fills' });

    // 1. Simulate Selection Change
    await page.evaluate((node) => {
      // @ts-expect-error
      window.worker.postMessage({ type: 'SET_SELECTION', payload: [node] });
    }, mockNode);

    // 2. Click Copy
    await copyButton.click();

    // 3. Verify State (Buttons enabled)
    await expect(pasteFillsButton).toBeEnabled();

    // 4. Click Paste
    const messagePromise = page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-expect-error
        window.onWorkerMessage = (msg) => {
          if (
            msg.type === 'UI_TO_MAIN' &&
            msg.payload.type === 'PASTE_PROPERTY'
          )
            resolve(msg.payload);
        };
      });
    });

    await pasteFillsButton.click();
    const payload: any = await messagePromise;
    expect(payload.granules).toContain('fills');
  });

  test('Preview Updates Flow', async ({ page }) => {
    const iframe = page.frameLocator('#plugin-ui');

    // 1. Select and Copy Text Node
    const textNode = { ...mockNode, type: 'TEXT', name: 'Text Node' };
    await page.evaluate((node) => {
      // @ts-expect-error
      window.worker.postMessage({ type: 'SET_SELECTION', payload: [node] });
      // @ts-expect-error
      window.worker.postMessage({
        type: 'RUN_COMMAND',
        payload: { command: 'copy' },
      });
    }, textNode);

    await expect(iframe.getByText('Text Node')).toBeVisible();

    // 2. Select and Copy Frame Node
    const frameNode = { ...mockNode, type: 'FRAME', name: 'Frame Node' };
    await page.evaluate((node) => {
      // @ts-expect-error
      window.worker.postMessage({ type: 'SET_SELECTION', payload: [node] });
      // @ts-expect-error
      window.worker.postMessage({
        type: 'RUN_COMMAND',
        payload: { command: 'copy' },
      });
    }, frameNode);

    await expect(iframe.getByText('Frame Node')).toBeVisible();
  });
});
