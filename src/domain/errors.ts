import { Data } from "effect";

export class OscConnectionError extends Data.TaggedError("OscConnectionError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class OscSendError extends Data.TaggedError("OscSendError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class OscTimeoutError extends Data.TaggedError("OscTimeoutError")<{
  readonly address: string;
  readonly duration: number;
}> {}
