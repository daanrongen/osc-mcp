import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import { OscClientTest } from "../infra/OscClientTest.ts";
import { OscArg, OscBundle, OscMessage } from "./models.ts";
import { OscClient } from "./OscClient.ts";

describe("send", () => {
  it("send completes without error", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* OscClient;
        const msg = new OscMessage({ address: "/test", args: [] });
        yield* client.send(msg);
      }).pipe(Effect.provide(OscClientTest)),
    );
  });

  it("send with typed args completes without error", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* OscClient;
        const msg = new OscMessage({
          address: "/s_new",
          args: [
            new OscArg({ type: "s", value: "default" }),
            new OscArg({ type: "i", value: 1000 }),
            new OscArg({ type: "i", value: 0 }),
            new OscArg({ type: "i", value: 0 }),
          ],
        });
        yield* client.send(msg);
      }).pipe(Effect.provide(OscClientTest)),
    );
  });

  it("send multiple messages does not error", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* OscClient;
        yield* client.send(new OscMessage({ address: "/n_set", args: [] }));
        yield* client.send(new OscMessage({ address: "/n_free", args: [] }));
        yield* client.send(new OscMessage({ address: "/g_new", args: [] }));
      }).pipe(Effect.provide(OscClientTest)),
    );
  });

  it("sendBundle completes without error", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* OscClient;
        const bundle = new OscBundle({
          timeTag: { raw: [0, 1] as [number, number] },
          packets: [
            new OscMessage({
              address: "/n_set",
              args: [new OscArg({ type: "i", value: 1000 })],
            }),
            new OscMessage({
              address: "/n_set",
              args: [new OscArg({ type: "i", value: 1001 })],
            }),
          ],
        });
        yield* client.sendBundle(bundle);
      }).pipe(Effect.provide(OscClientTest)),
    );
  });

  it("sendBundle with empty packets completes", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* OscClient;
        const bundle = new OscBundle({
          timeTag: { raw: [0, 1] as [number, number] },
          packets: [],
        });
        yield* client.sendBundle(bundle);
      }).pipe(Effect.provide(OscClientTest)),
    );
  });
});

describe("listen", () => {
  it("listen with no matching messages fails with OscTimeoutError", async () => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const client = yield* OscClient;
        return yield* client.listen("/nonexistent", 0.1);
      }).pipe(Effect.provide(OscClientTest)),
    );
    expect(exit._tag).toBe("Failure");
  });

  it("listen with wildcard and no messages fails with OscTimeoutError", async () => {
    const exit = await Effect.runPromiseExit(
      Effect.gen(function* () {
        const client = yield* OscClient;
        return yield* client.listen("*", 0.1);
      }).pipe(Effect.provide(OscClientTest)),
    );
    expect(exit._tag).toBe("Failure");
  });
});

describe("status", () => {
  it("status returns isOpen true", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* OscClient;
        return yield* client.status();
      }).pipe(Effect.provide(OscClientTest)),
    );
    expect(result.isOpen).toBe(true);
  });

  it("status returns correct local address and port", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* OscClient;
        return yield* client.status();
      }).pipe(Effect.provide(OscClientTest)),
    );
    expect(result.localAddress).toBe("127.0.0.1");
    expect(result.localPort).toBe(57121);
  });

  it("status returns correct remote address and port", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const client = yield* OscClient;
        return yield* client.status();
      }).pipe(Effect.provide(OscClientTest)),
    );
    expect(result.remoteAddress).toBe("127.0.0.1");
    expect(result.remotePort).toBe(57110);
  });
});
