import { FastMCP } from "fastmcp";
import { z } from "zod";

export const server = new FastMCP({
  name: "My First MCP",
  version: "0.0.1"
});

server.tool(
  "hello",
  {
    input: z.object({
      name: z.string().optional()
    })
  },
  async ({ name }) => {
    return {
      message: `Hei ${name ?? "verden"} 👋`
    };
  }
);
