import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import { OscClient } from "../../src/domain/OscClient.ts";
import { OscClientTest } from "../../src/infra/OscClientTest.ts";

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
