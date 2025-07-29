
import { Page, expect } from '@playwright/test';

export class InspectorPage {
  constructor(public readonly page: Page) {}

  get serverSelector() {
    return this.page.locator('select[name="server-select"]');
  }

  get connectButton() {
    return this.page.locator('button:has-text("Connect")');
  }

  get errorMessage() {
    return this.page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/mcp-inspector');
  }

  async addNewServer() {
    await this.page.click('[data-testid="add-server"]');
    await this.page.fill('input[name="name"]', 'MultiSynq');
    await this.page.fill('input[name="url"]', '/sse');
    await this.page.click('button:has-text("Save")');
  }

  async connectToMultiSynqEndpoint() {
    await this.serverSelector.selectOption({ label: 'MultiSynq Documentation' });
    await this.connectButton.click();
  }

  async isConnected() {
    return await this.page.locator('text=Connected').isVisible();
  }

  async listTools() {
    const toolElements = await this.page.locator('[data-testid="tool-name"]').all();
    return Promise.all(toolElements.map(el => el.textContent()));
  }

  async executeTool(name, args) {
    await this.page.click(`[data-testid="tool-card-${name}"] button:has-text("Execute")`);
    // This is a simplified placeholder. A real implementation would fill in arguments.
    const response = await this.page.waitForResponse('**/mcp');
    return await response.json();
  }
}
