import { describe, expect, it } from "bun:test";
import { ConnectionStatus, ListenResult, OscArg, OscBundle, OscMessage } from "./models.ts";

describe("OscArg", () => {
  it('constructs with type "i"', () => {
    const arg = new OscArg({ type: "i", value: 42 });
    expect(arg.type).toBe("i");
    expect(arg.value).toBe(42);
  });

  it('constructs with type "f"', () => {
    const arg = new OscArg({ type: "f", value: 3.14 });
    expect(arg.type).toBe("f");
    expect(arg.value).toBe(3.14);
  });

  it('constructs with type "s"', () => {
    const arg = new OscArg({ type: "s", value: "hello" });
    expect(arg.type).toBe("s");
    expect(arg.value).toBe("hello");
  });

  it('constructs with type "b"', () => {
    const arg = new OscArg({ type: "b", value: 0 });
    expect(arg.type).toBe("b");
    expect(arg.value).toBe(0);
  });
});

describe("OscMessage", () => {
  it("constructs with empty args", () => {
    const msg = new OscMessage({ address: "/test", args: [] });
    expect(msg.address).toBe("/test");
    expect(msg.args).toEqual([]);
  });

  it("constructs with multiple args", () => {
    const msg = new OscMessage({
      address: "/s_new",
      args: [
        new OscArg({ type: "s", value: "default" }),
        new OscArg({ type: "i", value: 1000 }),
        new OscArg({ type: "f", value: 0.5 }),
      ],
    });
    expect(msg.address).toBe("/s_new");
    expect(msg.args).toHaveLength(3);
    expect(msg.args[0].type).toBe("s");
    expect(msg.args[1].type).toBe("i");
    expect(msg.args[2].type).toBe("f");
  });
});

describe("OscBundle", () => {
  it("constructs with multiple packets", () => {
    const bundle = new OscBundle({
      timeTag: { raw: [0, 1] as [number, number] },
      packets: [
        new OscMessage({ address: "/n_set", args: [new OscArg({ type: "i", value: 1 })] }),
        new OscMessage({ address: "/n_free", args: [] }),
      ],
    });
    expect(bundle.timeTag.raw).toEqual([0, 1]);
    expect(bundle.packets).toHaveLength(2);
    expect(bundle.packets[0].address).toBe("/n_set");
    expect(bundle.packets[1].address).toBe("/n_free");
  });

  it("constructs with empty packets", () => {
    const bundle = new OscBundle({
      timeTag: { raw: [1, 0] as [number, number] },
      packets: [],
    });
    expect(bundle.packets).toHaveLength(0);
  });
});

describe("ConnectionStatus", () => {
  it("constructs with all fields", () => {
    const status = new ConnectionStatus({
      localAddress: "0.0.0.0",
      localPort: 57121,
      remoteAddress: "127.0.0.1",
      remotePort: 57110,
      isOpen: true,
    });
    expect(status.localAddress).toBe("0.0.0.0");
    expect(status.localPort).toBe(57121);
    expect(status.remoteAddress).toBe("127.0.0.1");
    expect(status.remotePort).toBe(57110);
    expect(status.isOpen).toBe(true);
  });

  it("constructs with isOpen false", () => {
    const status = new ConnectionStatus({
      localAddress: "127.0.0.1",
      localPort: 9000,
      remoteAddress: "192.168.1.1",
      remotePort: 8000,
      isOpen: false,
    });
    expect(status.isOpen).toBe(false);
  });
});

describe("ListenResult", () => {
  it("constructs with address, messages, and duration", () => {
    const messages = [new OscMessage({ address: "/reply", args: [] })];
    const result = new ListenResult({ address: "/reply", messages, duration: 1.5 });
    expect(result.address).toBe("/reply");
    expect(result.messages).toHaveLength(1);
    expect(result.duration).toBe(1.5);
  });

  it("constructs with empty messages", () => {
    const result = new ListenResult({ address: "/any", messages: [], duration: 0.5 });
    expect(result.messages).toEqual([]);
  });
});
