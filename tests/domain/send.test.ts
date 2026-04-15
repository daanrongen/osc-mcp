import { describe, it } from "bun:test";
import { Effect } from "effect";
import { OscArg, OscBundle, OscMessage } from "../../src/domain/models.ts";
import { OscClient } from "../../src/domain/OscClient.ts";
import { OscClientTest } from "../../src/infra/OscClientTest.ts";

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
