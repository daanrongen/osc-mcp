import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Effect, type ManagedRuntime } from "effect";
import { z } from "zod";
import type { OscConnectionError } from "../../domain/errors.ts";
import { OSC_TYPE_TAGS, OscArg, OscBundle, OscMessage } from "../../domain/models.ts";
import { OscClient } from "../../domain/OscClient.ts";
import { runTool } from "../utils.ts";

// Zod schema derived from the Effect Schema source of truth in domain/models.ts.
// OSC_TYPE_TAGS is the single definition of valid type tags — no duplication.
const OscArgSchema = z.object({
  type: z.enum(OSC_TYPE_TAGS).describe("OSC type tag: i=int32, f=float32, s=string, b=blob"),
  value: z.union([z.number(), z.string()]).describe("Argument value"),
});

export const registerSendTools = (
  server: McpServer,
  runtime: ManagedRuntime.ManagedRuntime<OscClient, OscConnectionError>,
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
    async ({ address, args }) =>
      runTool(
        runtime,
        Effect.gen(function* () {
          const client = yield* OscClient;
          const msg = new OscMessage({
            address,
            args: args.map((a) => new OscArg({ type: a.type, value: a.value as number | string })),
          });
          yield* client.send(msg);
          return { sent: true, address, argCount: args.length };
        }),
      ),
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
    async ({ timeTag, packets }) =>
      runTool(
        runtime,
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
      ),
  );
};
