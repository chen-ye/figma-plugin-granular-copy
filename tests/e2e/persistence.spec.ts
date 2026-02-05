import { test, expect } from '@playwright/test';

test.describe('Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/harness.html');
    await page.waitForFunction(() => (window as any).worker !== undefined);
  });

  test('should restore window size', async ({ page }) => {
    // 1. Simulate saving size (UI -> Main)
    await page.evaluate(() => {
      // @ts-ignore
      window.worker.postMessage({
        type: 'UI_TO_MAIN',
        payload: { type: 'SAVE_UI_SIZE', width: 400, height: 500 }
      });
    });

    // 2. Trigger open-ui (Main -> UI)
    // We need to capture the FIGMA_SHOW_UI message from the worker
    const showUIMessagePromise = page.evaluate(() => {
      return new Promise((resolve) => {
        const handler = (event) => {
          if (event.data.type === 'FIGMA_SHOW_UI') {
            // @ts-ignore
            window.worker.removeEventListener('message', handler);
            resolve(event.data);
          }
        };
        // @ts-ignore
        window.worker.addEventListener('message', handler);
        // @ts-ignore
        window.worker.postMessage({ type: 'RUN_COMMAND', payload: { command: 'open-ui' } });
      });
    });

    const message = await showUIMessagePromise;
    // @ts-ignore
    expect(message.options.width).toBe(400);
    // @ts-ignore
    expect(message.options.height).toBe(500);
  });
});
