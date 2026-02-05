import { expect, test } from '@playwright/test';

test.describe('UI Rendering', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
    await page.goto('/tests/e2e/harness.html');
  });

  test('should render the app', async ({ page }) => {
    // Wait for the iframe to be available
    const iframeElement = page.frameLocator('#plugin-ui');

    // Wait a bit
    await page.waitForTimeout(1000);

    // Trigger the plugin to open the UI
    await page.evaluate(() => {
      if (!(window as any).worker)
        throw new Error('Worker not found on window');
      // @ts-expect-error
      window.worker.postMessage({
        type: 'RUN_COMMAND',
        payload: { command: 'open-ui' },
      });
    });

    // Expect the UI to show the property categories
    await expect(
      iframeElement.getByRole('heading', { name: 'Visuals' })
    ).toBeVisible();
    await expect(
      iframeElement.getByRole('heading', { name: 'Layout' })
    ).toBeVisible();
  });
});
