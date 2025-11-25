import { Composio } from "@composio/core";
import dotenv from "dotenv";

dotenv.config();

// Initialize Composio client
const apiKey = process.env.COMPOSIO_API_KEY;

let composioClient: Composio | null = null;
let initializationError: string | null = null;

if (!apiKey) {
  console.error("⚠️  COMPOSIO_API_KEY is not set in environment variables");
  console.error("   Please create a .env file with your API key");
  console.error("   Get your key from: https://app.composio.dev → Settings → API Keys");
  initializationError = "Composio API key not configured. Please set COMPOSIO_API_KEY environment variable.";
} else {
  try {
    composioClient = new Composio({
      apiKey,
    });
  } catch (error) {
    console.error("Failed to initialize Composio client:", error);
    initializationError = "Failed to initialize Composio client.";
  }
}

export function isComposioConfigured(): boolean {
  return composioClient !== null && initializationError === null;
}

export function getInitializationError(): string | null {
  return initializationError;
}

export async function executeComposioAction(
  actionName: string,
  params: Record<string, unknown>
) {
  if (!composioClient) {
    throw new Error(initializationError || "Composio client not initialized");
  }

  try {
    // Use the correct @composio/core API
    // Signature: execute(toolSlug, body, options)
    const client = composioClient.getClient();
    
    // Execute the tool action
    // Body should have 'arguments' not 'input'
    const result = await client.tools.execute(actionName, {
      arguments: params,
    });
    
    return result;
  } catch (error) {
    console.error(`Error executing Composio action ${actionName}:`, error);
    throw error;
  }
}
