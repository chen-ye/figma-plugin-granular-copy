import { expect, test } from '@playwright/test';

test.describe('Main-UI Communication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/harness.html');
    // Wait for worker to be ready
    await page.waitForFunction(() => (window as any).worker !== undefined);
  });

  test('should enable buttons when data is copied and selection matches', async ({
    page,
  }) => {
    const iframeElement = page.frameLocator('#plugin-ui');
    const fillsBtn = iframeElement.getByRole('button', { name: 'Fills' }); // Adjust selector if needed

    // 1. Set Selection in Worker (Mock)
    await page.evaluate(() => {
      // @ts-expect-error
      window.worker.postMessage({
        type: 'SET_SELECTION',
        payload: [
          {
            id: '1:1',
            type: 'RECTANGLE',
            fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }],
          },
        ],
      });
    });

    // 2. Run 'copy' command in Worker (Main)
    // This will extract properties from selection and send COPY_COMPLETED to UI
    await page.evaluate(() => {
      // @ts-expect-error
      window.worker.postMessage({
        type: 'RUN_COMMAND',
        payload: { command: 'copy' },
      });
    });

    // 3. Verify UI updates (Button enabled)
    // The button might need specific text or role. 'Fills' is inside a span.
    // The button itself has the click handler.
    await expect(fillsBtn).toBeEnabled();
  });
});
