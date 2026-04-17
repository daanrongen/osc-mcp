import { describe, expect, it } from "bun:test";
import { Effect, Ref } from "effect";
import { OscArg, OscBundle, OscMessage } from "../domain/models.ts";
import { makeOscClientTest } from "./OscClientTest.ts";

describe("makeOscClientTest", () => {
  it("sent messages accumulate in sentMessages ref", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const { service, sentMessages } = yield* makeOscClientTest;
        const msg1 = new OscMessage({ address: "/a", args: [] });
        const msg2 = new OscMessage({ address: "/b", args: [new OscArg({ type: "i", value: 7 })] });
        yield* service.send(msg1);
        yield* service.send(msg2);
        const recorded = yield* Ref.get(sentMessages);
        expect(recorded).toHaveLength(2);
        expect(recorded[0].address).toBe("/a");
        expect(recorded[1].address).toBe("/b");
      }),
    );
  });

  it("sent bundles accumulate in sentBundles ref", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const { service, sentBundles } = yield* makeOscClientTest;
        const bundle = new OscBundle({
          timeTag: { raw: [0, 1] as [number, number] },
          packets: [new OscMessage({ address: "/n_set", args: [] })],
        });
        yield* service.sendBundle(bundle);
        const recorded = yield* Ref.get(sentBundles);
        expect(recorded).toHaveLength(1);
        expect(recorded[0].packets[0].address).toBe("/n_set");
      }),
    );
  });

  it("multiple bundles accumulate in order", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const { service, sentBundles } = yield* makeOscClientTest;
        const bundleA = new OscBundle({
          timeTag: { raw: [0, 1] as [number, number] },
          packets: [],
        });
        const bundleB = new OscBundle({
          timeTag: { raw: [0, 2] as [number, number] },
          packets: [],
        });
        yield* service.sendBundle(bundleA);
        yield* service.sendBundle(bundleB);
        const recorded = yield* Ref.get(sentBundles);
        expect(recorded).toHaveLength(2);
        expect(recorded[0].timeTag.raw[1]).toBe(1);
        expect(recorded[1].timeTag.raw[1]).toBe(2);
      }),
    );
  });

  it("listen returns canned responses when set via cannedResponses ref", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const { service, cannedResponses } = yield* makeOscClientTest;
        const replyMsg = new OscMessage({ address: "/status.reply", args: [] });
        yield* Ref.update(cannedResponses, (m) => new Map(m).set("/status.reply", [replyMsg]));
        const result = yield* service.listen("/status.reply", 1);
        expect(result.address).toBe("/status.reply");
        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].address).toBe("/status.reply");
        expect(result.duration).toBe(1);
      }),
    );
  });

  it("listen returns empty result when no canned response is registered", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const { service } = yield* makeOscClientTest;
        const result = yield* service.listen("/unknown", 0.1);
        expect(result.messages).toHaveLength(0);
        expect(result.address).toBe("/unknown");
        expect(result.duration).toBe(0.1);
      }),
    );
  });

  it("listen returns empty result with correct address and duration when no messages", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const { service } = yield* makeOscClientTest;
        const result = yield* service.listen("/missing", 2.5);
        expect(result.messages).toHaveLength(0);
        expect(result.address).toBe("/missing");
        expect(result.duration).toBe(2.5);
      }),
    );
  });

  it("status always returns the fixed test connection info", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const { service } = yield* makeOscClientTest;
        const status = yield* service.status();
        expect(status.isOpen).toBe(true);
        expect(status.localAddress).toBe("127.0.0.1");
        expect(status.localPort).toBe(57121);
        expect(status.remoteAddress).toBe("127.0.0.1");
        expect(status.remotePort).toBe(57110);
      }),
    );
  });
});
