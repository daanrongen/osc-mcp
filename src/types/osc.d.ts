declare module "osc" {
  interface UDPPortOptions {
    localAddress?: string;
    localPort?: number;
    remoteAddress?: string;
    remotePort?: number;
    metadata?: boolean;
    broadcast?: boolean;
    multicastTTL?: number;
    multicastMembership?: string[];
  }

  interface OscArg {
    type: string;
    value: unknown;
  }

  interface OscMessage {
    address: string;
    args?: OscArg[] | unknown[];
  }

  interface OscTimeTag {
    raw: [number, number];
  }

  interface OscBundle {
    timeTag: OscTimeTag;
    packets: (OscMessage | OscBundle)[];
  }

  // biome-ignore lint/suspicious/noUnsafeDeclarationMerging: needed for EventEmitter pattern
  interface UDPPort {
    on(event: "ready", listener: () => void): this;
    on(
      event: "message",
      listener: (msg: OscMessage, timeTag?: OscTimeTag, info?: unknown) => void,
    ): this;
    on(
      event: "bundle",
      listener: (bundle: OscBundle, timeTag?: OscTimeTag, info?: unknown) => void,
    ): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: string, listener: (...args: never[]) => void): this;
    removeListener(event: string, listener: (...args: never[]) => void): this;
  }

  // biome-ignore lint/suspicious/noUnsafeDeclarationMerging: needed for EventEmitter pattern
  class UDPPort {
    constructor(options?: UDPPortOptions);
    open(): void;
    close(): void;
    send(packet: OscMessage | OscBundle, address?: string, port?: number): void;
  }

  export { UDPPort };
  export type { OscArg, OscBundle, OscMessage, OscTimeTag, UDPPortOptions };
}
