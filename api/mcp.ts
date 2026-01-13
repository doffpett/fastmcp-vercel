import { server } from "../src/server.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { FastMCPSession } from "fastmcp";

export const runtime = "edge";

export default async function handler(request: Request): Promise<Response> {
  // Create a new transport for each request (stateless mode)
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // Stateless mode for serverless
  });

  try {
    // We need to get tools, prompts, and resources from the server
    // Since FastMCP doesn't expose them directly, we'll create a minimal session
    // The session will be set up when we connect the transport
    const session = new FastMCPSession({
      auth: undefined,
      instructions: server.options.instructions,
      logger: server.options.logger || console,
      name: server.options.name,
      ping: server.options.ping,
      prompts: [], // Will be populated by FastMCP when transport connects
      resources: [], // Will be populated by FastMCP when transport connects
      resourcesTemplates: [], // Will be populated by FastMCP when transport connects
      roots: server.options.roots,
      sessionId: undefined,
      tools: [], // Will be populated by FastMCP when transport connects
      transportType: "httpStream",
      utils: server.options.utils,
      version: server.options.version,
    });

    // The session will automatically set up message handlers when connected
    // No need to manually set transport.onmessage

    // Connect the session to the transport
    await session.connect(transport);

    // Handle the HTTP request through the transport
    return await transport.handleRequest(request);
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response(JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Internal error",
        data: String(error),
      },
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
