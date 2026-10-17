import { useState, useEffect } from "react";

// Safe storage — never crashes when localStorage/sessionStorage unavailable.
export function readSafe(key, session = false) {
  try {
    const store = session ? window.sessionStorage : window.localStorage;
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function writeSafe(key, value, session = false) {
  try {
    const store = session ? window.sessionStorage : window.localStorage;
    store.setItem(key, value);
  } catch {
    // storage unavailable — ignore
  }
}

export function useSafeSessionFlag(key) {
  const [val, setVal] = useState(null);
  useEffect(() => {
    setVal(readSafe(key, true));
  }, [key]);
  const set = (v) => {
    writeSafe(key, v, true);
    setVal(v);
  };
  return [val, set];
}
