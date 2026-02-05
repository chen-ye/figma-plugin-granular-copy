import { expect, test } from '@playwright/test';

const mockNode = {
  id: '1:1',
  type: 'RECTANGLE',
  fills: [],
};

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/e2e/harness.html');
    await page.waitForTimeout(1000);
  });

  test('Copy Failure', async ({ page }) => {
    const iframe = page.frameLocator('#plugin-ui');
    const copyButton = iframe.getByText('Copy Selection');
    const fillsButton = iframe.getByRole('button', { name: 'Fills' });

    // 1. Inject Error
    await page.evaluate(() => {
      // @ts-expect-error
      window.worker.postMessage({ type: 'MOCK_ERROR_NEXT' });
    });

    // 2. Set Selection
    await page.evaluate((node) => {
      // @ts-expect-error
      window.worker.postMessage({ type: 'SET_SELECTION', payload: [node] });
    }, mockNode);

    // 3. Click Copy (triggers main thread)
    await copyButton.click();

    // 4. Verify Buttons REMAIN Disabled (Failure to copy)
    // Wait a bit to ensure it had time to fail
    await page.waitForTimeout(500);
    await expect(fillsButton).toBeDisabled();
  });
});
