import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Effect, type ManagedRuntime } from "effect";
import { z } from "zod";
import type { OscConnectionError, OscSendError, OscTimeoutError } from "../../domain/errors.ts";
import { OscClient } from "../../domain/OscClient.ts";
import { formatError, formatSuccess } from "../utils.ts";

export const registerListenTools = (
  server: McpServer,
  runtime: ManagedRuntime.ManagedRuntime<
    OscClient,
    OscConnectionError | OscSendError | OscTimeoutError
  >,
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
    async ({ address, duration }) => {
      const result = await runtime.runPromiseExit(
        Effect.gen(function* () {
          const client = yield* OscClient;
          return yield* client.listen(address, duration);
        }),
      );
      if (result._tag === "Failure") return formatError(result.cause);
      return formatSuccess(result.value);
    },
  );
};
