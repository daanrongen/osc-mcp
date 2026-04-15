import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Effect, type ManagedRuntime } from "effect";
import type { OscConnectionError, OscSendError, OscTimeoutError } from "../../domain/errors.ts";
import { OscClient } from "../../domain/OscClient.ts";
import { formatError, formatSuccess } from "../utils.ts";

export const registerStatusTools = (
  server: McpServer,
  runtime: ManagedRuntime.ManagedRuntime<
    OscClient,
    OscConnectionError | OscSendError | OscTimeoutError
  >,
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
    async () => {
      const result = await runtime.runPromiseExit(
        Effect.gen(function* () {
          const client = yield* OscClient;
          return yield* client.status();
        }),
      );
      if (result._tag === "Failure") return formatError(result.cause);
      return formatSuccess(result.value);
    },
  );
};
