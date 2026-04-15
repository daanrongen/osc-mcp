import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ManagedRuntime } from "effect";
import type { OscConnectionError } from "../domain/errors.ts";
import type { OscClient } from "../domain/OscClient.ts";
import { registerListenTools } from "./tools/listen.ts";
import { registerSendTools } from "./tools/send.ts";
import { registerStatusTools } from "./tools/status.ts";

export const createMcpServer = (
  runtime: ManagedRuntime.ManagedRuntime<OscClient, OscConnectionError>,
): McpServer => {
  const server = new McpServer({
    name: "osc-mcp-server",
    version: "1.0.0",
  });

  registerSendTools(server, runtime);
  registerListenTools(server, runtime);
  registerStatusTools(server, runtime);

  return server;
};
