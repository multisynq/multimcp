
import { test, expect } from '@playwright/test';

test.describe('MultiSynq MCP Inspector Interaction', () => {
  test('should connect to the inspector and verify MultiSynq endpoint', async ({ page }) => {
    await page.goto('/mcp-inspector');

    // Check for the main title
    await expect(page.locator('h1')).toHaveText('MCP Inspector');

    // Select the MultiSynq endpoint from the dropdown
    await page.selectOption('select[name="server-select"]', { label: 'MultiSynq Documentation' });

    // Click the connect button
    await page.click('button:has-text("Connect")');

    // Check for the connection status
    await expect(page.locator('text=Connected')).toBeVisible();

    // Check for the list of tools
    await expect(page.locator('text=Tools')).toBeVisible();
    await expect(page.locator('text=resolve-library-id')).toBeVisible();
    await expect(page.locator('text=get-library-docs')).toBeVisible();

    // Disconnect from the server
    await page.click('button:has-text("Disconnect")');
    await expect(page.locator('text=Disconnected')).toBeVisible();
  });
});
