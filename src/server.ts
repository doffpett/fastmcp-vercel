import { FastMCP } from "fastmcp";
import { z } from "zod";

export const server = new FastMCP({
  name: "My First MCP",
  version: "0.0.1"
});

const inputSchema = z.object({
  name: z.string().optional()
});

server.addTool({
  name: "hello",
  description: "Say hello",
  parameters: inputSchema,
  execute: async ({ name }: z.infer<typeof inputSchema>) => {
    return `Hei ${name ?? "verden"} 👋`;
  }
});
