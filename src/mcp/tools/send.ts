import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Effect, type ManagedRuntime } from "effect";
import { z } from "zod";
import type { OscConnectionError, OscSendError, OscTimeoutError } from "../../domain/errors.ts";
import { OscArg, OscBundle, OscMessage } from "../../domain/models.ts";
import { OscClient } from "../../domain/OscClient.ts";
import { formatError, formatSuccess } from "../utils.ts";

const OscArgSchema = z.object({
  type: z.enum(["i", "f", "s", "b"]).describe("OSC type tag: i=int32, f=float32, s=string, b=blob"),
  value: z.union([z.number(), z.string()]).describe("Argument value"),
});

export const registerSendTools = (
  server: McpServer,
  runtime: ManagedRuntime.ManagedRuntime<
    OscClient,
    OscConnectionError | OscSendError | OscTimeoutError
  >,
) => {
  server.tool(
    "send",
    "Send an OSC message to the configured remote address and port.",
    {
      address: z.string().describe("OSC address pattern, e.g. /s_new or /n_set"),
      args: z.array(OscArgSchema).default([]).describe("Typed OSC arguments"),
    },
    {
      title: "Send OSC Message",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async ({ address, args }) => {
      const result = await runtime.runPromiseExit(
        Effect.gen(function* () {
          const client = yield* OscClient;
          const msg = new OscMessage({
            address,
            args: args.map((a) => new OscArg({ type: a.type, value: a.value as number | string })),
          });
          yield* client.send(msg);
          return { sent: true, address, argCount: args.length };
        }),
      );
      if (result._tag === "Failure") return formatError(result.cause);
      return formatSuccess(result.value);
    },
  );

  server.tool(
    "send_bundle",
    "Send a timed OSC bundle containing multiple messages. Use timeTag [0,1] for immediate delivery.",
    {
      timeTag: z
        .tuple([z.number().int(), z.number().int()])
        .describe("NTP timestamp as [seconds, fractional] — [0,1] means immediately"),
      packets: z
        .array(
          z.object({
            address: z.string().describe("OSC address pattern"),
            args: z.array(OscArgSchema).default([]),
          }),
        )
        .describe("Array of OSC messages to include in the bundle"),
    },
    {
      title: "Send OSC Bundle",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
    async ({ timeTag, packets }) => {
      const result = await runtime.runPromiseExit(
        Effect.gen(function* () {
          const client = yield* OscClient;
          const bundle = new OscBundle({
            timeTag: { raw: timeTag as [number, number] },
            packets: packets.map(
              (p) =>
                new OscMessage({
                  address: p.address,
                  args: p.args.map(
                    (a) => new OscArg({ type: a.type, value: a.value as number | string }),
                  ),
                }),
            ),
          });
          yield* client.sendBundle(bundle);
          return { sent: true, packetCount: packets.length };
        }),
      );
      if (result._tag === "Failure") return formatError(result.cause);
      return formatSuccess(result.value);
    },
  );
};
