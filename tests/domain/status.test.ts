import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import { OscClient } from "../../src/domain/OscClient.ts";
import { OscClientTest } from "../../src/infra/OscClientTest.ts";

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
