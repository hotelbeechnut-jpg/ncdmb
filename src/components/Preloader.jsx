import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { readSafe, writeSafe } from "../hooks/useSafeStorage";

export default function Preloader({ onDone }) {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Skip on repeat visits in same session
    let skip = false;
    try {
      skip = !!readSafe("recap-seen", true);
    } catch { /* ignore */ }
    if (skip) {
      setVisible(false);
      onDone?.();
      return;
    }
    if (reduce) {
      const t = setTimeout(() => {
        setVisible(false);
        try { writeSafe("recap-seen", "1", true); } catch {}
        onDone?.();
      }, 300);
      return () => clearTimeout(t);
    }
    const start = performance.now();
    const maxMs = 1800;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / maxMs);
      // ease toward 100 tied to time (hero assets also load, but cap at 1.8s)
      const eased = Math.round((1 - Math.pow(1 - t, 2)) * 100);
      setProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          setVisible(false);
          try { writeSafe("recap-seen", "1", true); } catch {}
          onDone?.();
        }, 150);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone, reduce]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-purple-900"
          exit={{ y: "-100%", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
          aria-hidden="true"
        >
          <div className="font-display text-2xl font-bold tracking-tight text-white">
            Seminar<span className="text-gold"> Recap</span>
          </div>
          <div className="mt-2 text-xs uppercase tracking-[0.3em] text-lavender-300">
            Talent Loop Webdev
          </div>
          <div className="font-display mt-6 text-5xl font-bold tabular-nums text-white">
            {progress}
            <span className="text-xl text-lavender-300">%</span>
          </div>
          <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gold transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
