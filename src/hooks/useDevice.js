import { useEffect, useState } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

// True low-end only: very small memory or very few cores. This flag may
// ONLY reduce effect counts (fewer cards, smaller pools) — it must never
// switch off autoplay or motion. Only the real prefers-reduced-motion query
// (useReducedMotion / usePrefersReducedMotion) may do that.
export function useLowEnd() {
  const [lowEnd, setLowEnd] = useState(false);
  useEffect(() => {
    try {
      const cores = navigator.hardwareConcurrency ?? 8;
      const mem = navigator.deviceMemory ?? 8;
      setLowEnd(cores <= 2 || mem <= 1);
    } catch {
      setLowEnd(false);
    }
  }, []);
  return lowEnd;
}
