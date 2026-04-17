import { Effect, Layer, Ref } from "effect";
import osc from "osc";
import { OscConfig } from "../config.ts";
import { OscConnectionError, OscSendError } from "../domain/errors.ts";
import { ConnectionStatus, ListenResult, OscArg, OscMessage } from "../domain/models.ts";
import { OscClient } from "../domain/OscClient.ts";

export const OscClientLive = Layer.scoped(
  OscClient,
  Effect.gen(function* () {
    const localAddress = yield* Effect.orDie(OscConfig.localAddress);
    const localPort = yield* Effect.orDie(OscConfig.localPort);
    const remoteAddress = yield* Effect.orDie(OscConfig.remoteAddress);
    const remotePort = yield* Effect.orDie(OscConfig.remotePort);
    const isOpenRef = yield* Ref.make(false);

    const udpPort = yield* Effect.acquireRelease(
      Effect.async<osc.UDPPort, OscConnectionError>((resume) => {
        const port = new osc.UDPPort({
          localAddress,
          localPort,
          remoteAddress,
          remotePort,
          metadata: true,
        });
        port.on("ready", () => resume(Effect.succeed(port)));
        port.on("error", (err: Error) =>
          resume(
            Effect.fail(new OscConnectionError({ message: "Failed to open UDP port", cause: err })),
          ),
        );
        port.open();
      }),
      (port) => Ref.set(isOpenRef, false).pipe(Effect.andThen(Effect.sync(() => port.close()))),
    );

    yield* Ref.set(isOpenRef, true);

    return OscClient.of({
      send: (msg) =>
        Effect.try({
          try: () => {
            udpPort.send({
              address: msg.address,
              args: msg.args.map((a) => ({ type: a.type, value: a.value })),
            });
          },
          catch: (e) => new OscSendError({ message: "Failed to send OSC message", cause: e }),
        }),

      sendBundle: (bundle) =>
        Effect.try({
          try: () => {
            udpPort.send({
              timeTag: { raw: [...bundle.timeTag.raw] as [number, number] },
              packets: bundle.packets.map((p) => ({
                address: p.address,
                args: p.args.map((a) => ({ type: a.type, value: a.value })),
              })),
            });
          },
          catch: (e) => new OscSendError({ message: "Failed to send OSC bundle", cause: e }),
        }),

      listen: (address, duration) =>
        Effect.async<ListenResult>((resume) => {
          const collected: OscMessage[] = [];

          const handler = (msg: {
            address: string;
            args: Array<{ type: string; value: unknown }>;
          }) => {
            if (msg.address === address || address === "*") {
              collected.push(
                new OscMessage({
                  address: msg.address,
                  args: (msg.args ?? []).map(
                    (a) =>
                      new OscArg({
                        type: a.type as "i" | "f" | "s" | "b",
                        value: a.value as number | string,
                      }),
                  ),
                }),
              );
            }
          };

          udpPort.on("message", handler);

          const timer = setTimeout(() => {
            udpPort.removeListener("message", handler);
            resume(Effect.succeed(new ListenResult({ address, messages: collected, duration })));
          }, duration * 1000);

          return Effect.sync(() => {
            clearTimeout(timer);
            udpPort.removeListener("message", handler);
          });
        }),

      status: () =>
        Ref.get(isOpenRef).pipe(
          Effect.map(
            (isOpen) =>
              new ConnectionStatus({ localAddress, localPort, remoteAddress, remotePort, isOpen }),
          ),
        ),
    });
  }),
);
