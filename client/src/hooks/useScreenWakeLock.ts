"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export function useScreenWakeLock() {
  const isSupported = typeof navigator !== "undefined" && "wakeLock" in navigator;
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const isEnabledRef = useRef(false);
  const [isEnabled, setIsEnabled] = useState(false);

  const doRelease = useCallback(() => {
    if (sentinelRef.current) {
      sentinelRef.current.release().catch(() => {});
      sentinelRef.current = null;
    }
  }, []);

  const doRequest = useCallback(async () => {
    if (!isSupported || sentinelRef.current) return;
    try {
      const sentinel = await navigator.wakeLock.request("screen");
      sentinelRef.current = sentinel;
      sentinel.addEventListener("release", () => {
        if (sentinelRef.current === sentinel) sentinelRef.current = null;
      });
    } catch {
      // If the request was denied or interrupted, roll back the enabled state
      isEnabledRef.current = false;
      setIsEnabled(false);
    }
  }, [isSupported]);

  const enable = useCallback(() => {
    if (!isSupported) return;
    isEnabledRef.current = true;
    setIsEnabled(true);
    void doRequest();
  }, [isSupported, doRequest]);

  const disable = useCallback(() => {
    isEnabledRef.current = false;
    setIsEnabled(false);
    doRelease();
  }, [doRelease]);

  // Re-acquire when the tab becomes visible again (OS releases the lock on hide)
  useEffect(() => {
    if (!isSupported) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isEnabledRef.current && !sentinelRef.current) {
        void doRequest();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isSupported, doRequest]);

  // Always release on unmount
  useEffect(() => {
    return () => doRelease();
  }, [doRelease]);

  return { isSupported, isEnabled, enable, disable };
}
