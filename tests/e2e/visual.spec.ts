import { expect, test } from '@playwright/test';

const mockNode = {
  id: '1:1',
  type: 'TEXT',
  name: 'Mock Node',
  fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
  strokes: [{ type: 'SOLID', color: { r: 0, g: 0, b: 1 } }],
  strokeWeight: 2,
  strokeAlign: 'CENTER',
  dashPattern: [],
  strokeCap: 'NONE',
  strokeJoin: 'MITER',
  strokeMiterLimit: 4,
  effects: [
    {
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.5 },
      offset: { x: 0, y: 4 },
      radius: 4,
      visible: true,
      blendMode: 'NORMAL',
    },
  ],
  opacity: 0.5,
  cornerRadius: 8,
  topLeftRadius: 8,
  topRightRadius: 8,
  bottomLeftRadius: 8,
  bottomRightRadius: 8,
  blendMode: 'MULTIPLY',
  x: 100,
  y: 200,
  width: 320,
  height: 240,
  rotation: 45,
  layoutMode: 'HORIZONTAL',
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 10,
  paddingBottom: 10,
  itemSpacing: 8,
  primaryAxisAlignItems: 'CENTER',
  counterAxisAlignItems: 'CENTER',
  layoutWrap: 'NO_WRAP',
  constraints: { horizontal: 'SCALE', vertical: 'SCALE' },
  layoutGrids: [],
  characters: 'Visual Test',
  textStyleId: '',
  fontName: { family: 'Inter', style: 'Bold' },
  fontSize: 24,
  lineHeight: { value: 32, unit: 'PIXELS' },
  letterSpacing: { value: 0, unit: 'PIXELS' },
  paragraphSpacing: 0,
  paragraphIndent: 0,
  textCase: 'UPPER',
  textDecoration: 'UNDERLINE',
  exportSettings: [],
  listSpacing: 0,
};

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/harness.html');
    await page.waitForTimeout(1000);
  });

  test('Empty State', async ({ page }) => {
    await expect(
      page.frameLocator('#plugin-ui').locator('body')
    ).toHaveScreenshot('empty-state.png');
  });

  test('Populated State', async ({ page }) => {
    await page.evaluate((node) => {
      // @ts-expect-error
      window.worker.postMessage({ type: 'SET_SELECTION', payload: [node] });
      // @ts-expect-error
      window.worker.postMessage({
        type: 'RUN_COMMAND',
        payload: { command: 'copy' },
      });
    }, mockNode);

    // Wait for "Fills" button to be enabled as proxy for "rendered"
    await expect(
      page.frameLocator('#plugin-ui').getByRole('button', { name: 'Fills' })
    ).toBeEnabled();

    // Take screenshot
    await expect(
      page.frameLocator('#plugin-ui').locator('body')
    ).toHaveScreenshot('populated-state.png');
  });
});
