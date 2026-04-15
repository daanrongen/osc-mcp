import { Config } from "effect";

export const OscConfig = {
  localAddress: Config.withDefault(Config.string("OSC_LOCAL_ADDRESS"), "127.0.0.1"),
  localPort: Config.withDefault(Config.integer("OSC_LOCAL_PORT"), 57121),
  remoteAddress: Config.withDefault(Config.string("OSC_REMOTE_ADDRESS"), "127.0.0.1"),
  remotePort: Config.withDefault(Config.integer("OSC_REMOTE_PORT"), 57110),
};
