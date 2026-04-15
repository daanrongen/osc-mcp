import { Schema } from "effect";

export class OscArg extends Schema.Class<OscArg>("OscArg")({
  type: Schema.Literal("i", "f", "s", "b"),
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
