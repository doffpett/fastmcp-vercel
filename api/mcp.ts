import { server } from "../src/server.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { FastMCPSession } from "fastmcp";

export const runtime = "edge";

// Create a transport instance (reused across requests in stateless mode)
const transport = new WebStandardStreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // Stateless mode for serverless
});

export default async function handler(request: Request): Promise<Response> {
  try {
    // Create a temporary session for this request
    // FastMCP manages sessions internally, so we need to create one manually
    const session = new FastMCPSession({
      auth: undefined,
      instructions: server.options.instructions,
      logger: server.options.logger || console,
      name: server.options.name,
      ping: server.options.ping,
      prompts: [], // FastMCP manages these internally
      resources: [], // FastMCP manages these internally
      resourcesTemplates: [], // FastMCP manages these internally
      roots: server.options.roots,
      sessionId: undefined,
      tools: [], // We'll get tools from server
      transportType: "httpStream",
      utils: server.options.utils,
      version: server.options.version,
    });

    // Connect the session to the transport
    await session.connect(transport);

    // Handle the request through the transport
    return await transport.handleRequest(request);
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
