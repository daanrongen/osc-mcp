import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Effect, type ManagedRuntime } from "effect";
import type { OscConnectionError } from "../../domain/errors.ts";
import { OscClient } from "../../domain/OscClient.ts";
import { runTool } from "../utils.ts";

export const registerStatusTools = (
  server: McpServer,
  runtime: ManagedRuntime.ManagedRuntime<OscClient, OscConnectionError>,
) => {
  server.tool(
    "status",
    "Get the current OSC connection status: local and remote addresses/ports, and whether the port is open.",
    {},
    {
      title: "Get OSC Status",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    async () =>
      runTool(
        runtime,
        Effect.gen(function* () {
          const client = yield* OscClient;
          return yield* client.status();
        }),
      ),
  );
};
