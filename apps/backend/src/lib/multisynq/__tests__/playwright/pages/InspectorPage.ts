import { Page, Locator, expect } from '@playwright/test';

export class InspectorPage {
  readonly page: Page;
  readonly serverSelector: Locator;
  readonly connectButton: Locator;
  readonly toolsList: Locator;
  readonly executeToolButton: Locator;
  readonly toolResult: Locator;
  readonly errorMessage: Locator;
  readonly statusIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.serverSelector = page.locator('[data-testid="server-selector"]');
    this.connectButton = page.locator('[data-testid="connect-button"]');
    this.toolsList = page.locator('[data-testid="tools-list"]');
    this.executeToolButton = page.locator('[data-testid="execute-tool"]');
    this.toolResult = page.locator('[data-testid="tool-result"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.statusIndicator = page.locator('[data-testid="status-indicator"]');
  }

  async goto() {
    await this.page.goto('/mcp-inspector');
  }

  async connectToMultiSynqEndpoint() {
    await this.goto();
    
    // Look for MultiSynq server in the list or add it
    await this.page.waitForSelector('[data-testid="server-selector"]', { timeout: 10000 });
    
    // Try to select MultiSynq server if it exists
    const multisynqOption = this.page.locator('option:has-text("MultiSynq")');
    if (await multisynqOption.count() > 0) {
      await this.serverSelector.selectOption({ label: 'MultiSynq' });
    } else {
      // Add new server configuration
      await this.addNewServer();
    }
    
    await this.connectButton.click();
    await this.waitForConnection();
  }

  async addNewServer() {
    const addServerButton = this.page.locator('[data-testid="add-server"]');
    await addServerButton.click();
    
    // Fill in MultiSynq server details
    await this.page.fill('[data-testid="server-name"]', 'MultiSynq-Docs');
    await this.page.selectOption('[data-testid="server-type"]', 'sse');
    await this.page.fill('[data-testid="server-url"]', '/sse');
    
    const saveButton = this.page.locator('[data-testid="save-server"]');
    await saveButton.click();
  }

  async waitForConnection() {
    // Wait for connection status to show connected
    await expect(this.statusIndicator).toContainText('Connected', { timeout: 15000 });
  }

  async listTools() {
    await this.page.click('[data-testid="list-tools-button"]');
    await this.page.waitForSelector('[data-testid="tools-list"]', { timeout: 10000 });
    
    const tools = await this.toolsList.locator('[data-testid="tool-item"]').all();
    return tools;
  }

  async executeTool(toolName: string, parameters: Record<string, any> = {}) {
    // Find and click the specific tool
    const toolItem = this.page.locator(`[data-testid="tool-item"]:has-text("${toolName}")`);
    await toolItem.click();
    
    // Fill in parameters if any
    for (const [key, value] of Object.entries(parameters)) {
      await this.page.fill(`[data-testid="param-${key}"]`, String(value));
    }
    
    // Execute the tool
    await this.executeToolButton.click();
    
    // Wait for result
    await this.page.waitForSelector('[data-testid="tool-result"]', { timeout: 15000 });
    
    return await this.toolResult.textContent();
  }

  async getToolResult() {
    await this.page.waitForSelector('[data-testid="tool-result"]', { timeout: 10000 });
    return await this.toolResult.textContent();
  }

  async getErrorMessage() {
    const errorElement = await this.errorMessage.first();
    return await errorElement.textContent();
  }

  async isConnected() {
    const status = await this.statusIndicator.textContent();
    return status?.includes('Connected') || false;
  }

  async disconnect() {
    const disconnectButton = this.page.locator('[data-testid="disconnect-button"]');
    await disconnectButton.click();
    await expect(this.statusIndicator).toContainText('Disconnected', { timeout: 5000 });
  }
}
