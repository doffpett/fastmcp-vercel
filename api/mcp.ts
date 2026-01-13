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
    // Create a session with empty arrays - FastMCP will need to populate these
    // but since we can't access FastMCP's internal tools/prompts/resources,
    // we'll create a minimal session
    const session = new FastMCPSession({
      auth: undefined,
      instructions: server.options.instructions,
      logger: server.options.logger || console,
      name: server.options.name,
      ping: server.options.ping,
      prompts: [],
      resources: [],
      resourcesTemplates: [],
      roots: server.options.roots,
      sessionId: undefined,
      tools: [],
      transportType: "httpStream",
      utils: server.options.utils,
      version: server.options.version,
    });

    // Connect the session to the transport
    await session.connect(transport);

    // Create a new Request object to ensure it has proper Web Standard structure
    // This might help if Vercel's Request object has some quirks
    const normalizedRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: request.redirect,
    });

    // Handle the request through the transport
    return await transport.handleRequest(normalizedRequest);
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
