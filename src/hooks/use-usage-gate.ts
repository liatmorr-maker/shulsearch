"use client";

import { useState, useEffect } from "react";

const KEY = "ss_view_count";
const LIMIT = 5;

export function useUsageGate(isSignedIn: boolean) {
  const [count, setCount]       = useState(0);
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    if (isSignedIn) return; // signed-in users are never gated
    const stored = parseInt(localStorage.getItem(KEY) ?? "0", 10);
    setCount(stored);
  }, [isSignedIn]);

  function recordView() {
    if (isSignedIn) return false; // not gated

    const stored = parseInt(localStorage.getItem(KEY) ?? "0", 10);
    const next = stored + 1;
    localStorage.setItem(KEY, String(next));
    setCount(next);

    if (next > LIMIT) {
      setShowGate(true);
      return true; // gated — caller should block action
    }
    return false;
  }

  function dismissGate() {
    setShowGate(false);
  }

  const remaining = Math.max(0, LIMIT - count);

  return { showGate, recordView, dismissGate, count, remaining };
}
