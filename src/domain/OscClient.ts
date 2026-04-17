import { Context, type Effect } from "effect";
import type { OscSendError } from "./errors.ts";
import type { ConnectionStatus, ListenResult, OscBundle, OscMessage } from "./models.ts";

export interface OscClientService {
  readonly send: (msg: OscMessage) => Effect.Effect<void, OscSendError>;
  readonly sendBundle: (bundle: OscBundle) => Effect.Effect<void, OscSendError>;
  readonly listen: (address: string, duration: number) => Effect.Effect<ListenResult>;
  readonly status: () => Effect.Effect<ConnectionStatus>;
}

export class OscClient extends Context.Tag("OscClient")<OscClient, OscClientService>() {}
