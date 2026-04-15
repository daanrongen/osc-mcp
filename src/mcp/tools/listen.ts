import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Effect, type ManagedRuntime } from "effect";
import { z } from "zod";
import type { OscConnectionError } from "../../domain/errors.ts";
import { OscClient } from "../../domain/OscClient.ts";
import { runTool } from "../utils.ts";

export const registerListenTools = (
  server: McpServer,
  runtime: ManagedRuntime.ManagedRuntime<OscClient, OscConnectionError>,
) => {
  server.tool(
    "listen",
    "Listen for incoming OSC messages matching an address pattern for a specified duration. Returns all collected messages.",
    {
      address: z.string().describe("OSC address to match, e.g. /status.reply or * for all"),
      duration: z
        .number()
        .min(0.1)
        .max(30)
        .default(2)
        .describe("How long to listen in seconds (0.1–30)"),
    },
    {
      title: "Listen for OSC Messages",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async ({ address, duration }) =>
      runTool(
        runtime,
        Effect.gen(function* () {
          const client = yield* OscClient;
          return yield* client.listen(address, duration);
        }),
      ),
  );
};
