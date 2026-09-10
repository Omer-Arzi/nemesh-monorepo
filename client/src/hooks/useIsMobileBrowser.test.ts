import { describe, it, expect, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsMobileBrowser } from "./useIsMobileBrowser";

const realUA = navigator.userAgent;
const realTouch = navigator.maxTouchPoints;

function setUA(ua: string, maxTouchPoints = 0) {
  Object.defineProperty(navigator, "userAgent", { value: ua, configurable: true });
  Object.defineProperty(navigator, "maxTouchPoints", {
    value: maxTouchPoints,
    configurable: true,
  });
}

afterEach(() => {
  setUA(realUA, realTouch);
});

describe("useIsMobileBrowser", () => {
  it("is true for an iPhone user agent", () => {
    setUA(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    );
    const { result } = renderHook(() => useIsMobileBrowser());
    expect(result.current).toBe(true);
  });

  it("is true for an Android user agent", () => {
    setUA(
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    );
    const { result } = renderHook(() => useIsMobileBrowser());
    expect(result.current).toBe(true);
  });

  it("is true for an iPadOS 13+ desktop-class user agent with touch", () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      5,
    );
    const { result } = renderHook(() => useIsMobileBrowser());
    expect(result.current).toBe(true);
  });

  it("is false for a desktop Chrome user agent", () => {
    setUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      0,
    );
    const { result } = renderHook(() => useIsMobileBrowser());
    expect(result.current).toBe(false);
  });
});
