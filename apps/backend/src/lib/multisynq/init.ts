import { 
  mcpServersRepository, 
  namespacesRepository, 
  endpointsRepository 
} from "../../db/repositories";
import { 
  MULTISYNQ_MCP_CONFIG, 
  MULTISYNQ_SERVER_CONFIG, 
  MULTISYNQ_NAMESPACE_CONFIG, 
  MULTISYNQ_ENDPOINT_CONFIG 
} from "./config";

/**
 * Initialize MultiSynq MCP server, namespace, and endpoint
 * This creates a dedicated root endpoint for MultiSynq documentation
 */
export async function initializeMultiSynqEndpoint() {
  try {
    console.log("🚀 Initializing MultiSynq MCP root endpoint...");

    // 1. Check if MultiSynq MCP server already exists
    let mcpServer = await mcpServersRepository.findByName(MULTISYNQ_SERVER_CONFIG.name);
    
    if (!mcpServer) {
      console.log("📦 Creating MultiSynq MCP server...");
      mcpServer = await mcpServersRepository.create({
        name: MULTISYNQ_SERVER_CONFIG.name,
        description: MULTISYNQ_SERVER_CONFIG.description,
        type: MULTISYNQ_MCP_CONFIG.type,
        command: MULTISYNQ_MCP_CONFIG.command,
        args: MULTISYNQ_MCP_CONFIG.args,
        env: MULTISYNQ_MCP_CONFIG.env,
        user_id: null // System server (public)
      });
      console.log(`✅ Created MultiSynq MCP server: ${mcpServer.uuid}`);
    } else {
      console.log(`📦 MultiSynq MCP server already exists: ${mcpServer.uuid}`);
    }

    // 2. Check if root namespace already exists
    let namespace = await namespacesRepository.findByNameAndUserId(MULTISYNQ_NAMESPACE_CONFIG.name, null);
    
    if (!namespace) {
      console.log("🏷️  Creating root namespace...");
      namespace = await namespacesRepository.create({
        name: MULTISYNQ_NAMESPACE_CONFIG.name,
        description: MULTISYNQ_NAMESPACE_CONFIG.description,
        mcpServerUuids: [mcpServer.uuid],
        user_id: null // System namespace (public)
      });
      console.log(`✅ Created root namespace: ${namespace.uuid}`);
    } else {
      console.log(`🏷️  Root namespace already exists: ${namespace.uuid}`);
    }

    // 3. Check if root endpoint already exists
    let endpoint = await endpointsRepository.findByName(MULTISYNQ_ENDPOINT_CONFIG.name);
    
    if (!endpoint) {
      console.log("🌐 Creating root public endpoint...");
      endpoint = await endpointsRepository.create({
        name: MULTISYNQ_ENDPOINT_CONFIG.name,
        description: MULTISYNQ_ENDPOINT_CONFIG.description,
        namespace_uuid: namespace.uuid,
        enable_api_key_auth: false, // Public endpoint - no auth required
        use_query_param_auth: false,
        user_id: null // System endpoint (public)
      });
      console.log(`✅ Created root endpoint: ${endpoint.uuid}`);
    } else {
      console.log(`🌐 Root endpoint already exists: ${endpoint.uuid}`);
    }

    console.log("🎉 MultiSynq MCP root endpoint initialization complete!");
    console.log("📋 Available at root endpoints:");
    console.log(`   SSE: /sse`);
    console.log(`   HTTP: /mcp`);
    console.log(`   OpenAPI: /api`);
    
    return {
      mcpServer,
      namespace,
      endpoint
    };
    
  } catch (error) {
    console.error("❌ Failed to initialize MultiSynq root endpoint:", error);
    // Don't throw - we want the app to still start even if this fails
  }
}
