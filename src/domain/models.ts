import { Schema } from "effect";

/** Canonical OSC type tags — i=int32, f=float32, s=string, b=blob */
export const OSC_TYPE_TAGS = ["i", "f", "s", "b"] as const;
export type OscTypeTag = (typeof OSC_TYPE_TAGS)[number];

export class OscArg extends Schema.Class<OscArg>("OscArg")({
  type: Schema.Literal(...OSC_TYPE_TAGS),
  value: Schema.Union(Schema.Number, Schema.String),
}) {}

export class OscMessage extends Schema.Class<OscMessage>("OscMessage")({
  address: Schema.String,
  args: Schema.Array(OscArg),
}) {}

export class OscBundle extends Schema.Class<OscBundle>("OscBundle")({
  timeTag: Schema.Struct({
    raw: Schema.Tuple(Schema.Number, Schema.Number),
  }),
  packets: Schema.Array(OscMessage),
}) {}

export class ConnectionStatus extends Schema.Class<ConnectionStatus>("ConnectionStatus")({
  localAddress: Schema.String,
  localPort: Schema.Number,
  remoteAddress: Schema.String,
  remotePort: Schema.Number,
  isOpen: Schema.Boolean,
}) {}

export class ListenResult extends Schema.Class<ListenResult>("ListenResult")({
  address: Schema.String,
  messages: Schema.Array(OscMessage),
  duration: Schema.Number,
}) {}
