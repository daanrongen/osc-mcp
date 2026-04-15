import { describe, expect, it } from "bun:test";
import { OscConnectionError, OscSendError, OscTimeoutError } from "./errors.ts";

describe("OscConnectionError", () => {
  it('has _tag "OscConnectionError"', () => {
    const err = new OscConnectionError({ message: "connection refused" });
    expect(err._tag).toBe("OscConnectionError");
  });

  it("carries the message field", () => {
    const err = new OscConnectionError({ message: "port already in use" });
    expect(err.message).toBe("port already in use");
  });

  it("carries an optional cause", () => {
    const cause = new Error("underlying");
    const err = new OscConnectionError({ message: "failed", cause });
    expect(err.cause).toBe(cause);
  });

  it("has undefined cause when not provided", () => {
    const err = new OscConnectionError({ message: "failed" });
    expect(err.cause).toBeUndefined();
  });
});

describe("OscSendError", () => {
  it('has _tag "OscSendError"', () => {
    const err = new OscSendError({ message: "send failed" });
    expect(err._tag).toBe("OscSendError");
  });

  it("carries the message field", () => {
    const err = new OscSendError({ message: "socket closed" });
    expect(err.message).toBe("socket closed");
  });

  it("carries an optional cause", () => {
    const cause = new TypeError("bad buffer");
    const err = new OscSendError({ message: "encode error", cause });
    expect(err.cause).toBe(cause);
  });
});

describe("OscTimeoutError", () => {
  it('has _tag "OscTimeoutError"', () => {
    const err = new OscTimeoutError({ address: "/status", duration: 2 });
    expect(err._tag).toBe("OscTimeoutError");
  });

  it("carries the address field", () => {
    const err = new OscTimeoutError({ address: "/synth/reply", duration: 1.5 });
    expect(err.address).toBe("/synth/reply");
  });

  it("carries the duration field", () => {
    const err = new OscTimeoutError({ address: "/status", duration: 0.5 });
    expect(err.duration).toBe(0.5);
  });
});
