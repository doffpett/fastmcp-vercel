import { FastMCP } from "fastmcp";
import { z } from "zod";

export const server = new FastMCP({
  name: "My First MCP",
  version: "0.0.1"
});

const inputSchema = z.object({
  name: z.string().optional()
});

server.tool(
  "hello",
  {
    input: inputSchema
  },
  async ({ name }: z.infer<typeof inputSchema>) => {
    return {
      message: `Hei ${name ?? "verden"} 👋`
    };
  }
);
