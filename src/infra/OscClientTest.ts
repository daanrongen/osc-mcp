import { Effect, Layer, Ref } from "effect";
import { OscTimeoutError } from "../domain/errors.ts";
import {
  ConnectionStatus,
  ListenResult,
  type OscBundle,
  type OscMessage,
} from "../domain/models.ts";
import { OscClient } from "../domain/OscClient.ts";

export const makeOscClientTest = Effect.gen(function* () {
  const sentMessages = yield* Ref.make<OscMessage[]>([]);
  const sentBundles = yield* Ref.make<OscBundle[]>([]);
  const cannedResponses = yield* Ref.make<Map<string, OscMessage[]>>(new Map());

  const service = OscClient.of({
    send: (msg) => Ref.update(sentMessages, (msgs) => [...msgs, msg]),

    sendBundle: (bundle) => Ref.update(sentBundles, (bundles) => [...bundles, bundle]),

    listen: (address, duration) =>
      Effect.gen(function* () {
        const responses = yield* Ref.get(cannedResponses);
        const msgs = responses.get(address) ?? [];
        if (msgs.length === 0) {
          return yield* Effect.fail(new OscTimeoutError({ address, duration }));
        }
        return new ListenResult({ address, messages: msgs, duration });
      }),

    status: () =>
      Effect.succeed(
        new ConnectionStatus({
          localAddress: "127.0.0.1",
          localPort: 57121,
          remoteAddress: "127.0.0.1",
          remotePort: 57110,
          isOpen: true,
        }),
      ),
  });

  return { service, sentMessages, sentBundles, cannedResponses } as const;
});

export const OscClientTest = Layer.effect(
  OscClient,
  makeOscClientTest.pipe(Effect.map(({ service }) => service)),
);
