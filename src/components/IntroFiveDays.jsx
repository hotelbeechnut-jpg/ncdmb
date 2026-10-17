import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { days } from "../data/days";
import { dayItems, imgSrc } from "../utils/media";
import { useLowEnd } from "../hooks/useDevice";

const PERIODS = [2200, 2500, 2800, 3000, 2400];
const DRIFTS = [6, 7, 8, 9, 6.5];
// Per-card depth: scale, tilt, translateZ. Cards 1/3/5 ride higher on desktop.
const DEPTHS = [
  { scale: 1.02, rotate: -4, z: 40, lift: true },
  { scale: 0.94, rotate: 3, z: -30, lift: false },
  { scale: 1.08, rotate: -3, z: 60, lift: true },
  { scale: 0.9, rotate: 5, z: -40, lift: false },
  { scale: 1.0, rotate: -2, z: 20, lift: true },
];

function poolFor(dayKey, low) {
  const imgs = dayItems(dayKey).filter((it) => it.kind === "image");
  return imgs.slice(0, low ? 4 : 8);
}

function DayIntroCard({ day, pool, depth, index, active, exiting, calm }) {
  const [current, setCurrent] = useState(0);
  const [flips, setFlips] = useState(0);

  // Still image under reduced motion (only the real reduced-motion query
  // may switch autoplay off — low-end only shrinks the pool, via poolFor).
  useEffect(() => {
    if (calm || !active || pool.length <= 1) return;
    const period = PERIODS[index % PERIODS.length];
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % pool.length);
      setFlips((f) => f + 1);
    }, period);
    return () => clearInterval(t);
  }, [calm, active, pool.length, index]);

  const comingSoon = pool.length === 0;
  const img = pool[current % Math.max(1, pool.length)];
  const useFlip = !calm && flips % 2 === 0 && pool.length > 1;

  // Fade-only under reduced motion: no slide, scale, tilt or drift.
  const entrance = !active
    ? { opacity: 0 }
    : exiting
      ? { opacity: 0 }
      : calm
        ? { opacity: 1 }
        : { opacity: 1, y: 0, scale: depth.scale, rotate: depth.rotate };

  return (
    <div style={calm ? undefined : { transform: `translateZ(${depth.z}px)` }}>
      <motion.div
        initial={{ opacity: 0, ...(calm ? {} : { y: 60, scale: 0.9 }) }}
        animate={entrance}
        transition={{ duration: exiting && !calm ? 0.55 : 0.7, delay: exiting ? index * 0.05 : index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          animate={calm || exiting ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: DRIFTS[index % DRIFTS.length], repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
        >
          <div
            className="w-[58vw] max-w-[260px] shrink-0 overflow-hidden rounded-cardlg border border-white/25 bg-purple-900 shadow-lift sm:w-[230px] md:w-[240px]"
            style={{ boxShadow: "0 20px 60px -15px rgba(0,0,0,0.6), 0 0 40px -10px rgba(124,58,237,0.7)" }}
          >
            <div className="flex items-center justify-between px-4 pt-3">
              <span className="font-display text-3xl font-bold text-white/90">
                {String(day.n).padStart(2, "0")}
              </span>
              {day.status === "coming-soon" && (
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gold">
                  Soon
                </span>
              )}
            </div>
            <div className="relative mx-3 mt-1 h-36 overflow-hidden rounded-card bg-purple-900 sm:h-40" style={{ perspective: "600px" }}>
              {comingSoon ? (
                <div className="shimmer h-full w-full" aria-hidden="true" />
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.img
                    key={img.id}
                    src={imgSrc(img)}
                    alt=""
                    aria-hidden="true"
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: `${img.fx ?? 50}% ${img.fy ?? 25}%` }}
                    initial={calm ? { opacity: 0 } : useFlip ? { rotateY: -90, opacity: 0 } : { opacity: 0, scale: 1.1 }}
                    animate={calm ? { opacity: 1 } : useFlip ? { rotateY: 0, opacity: 1 } : { opacity: 1, scale: 1 }}
                    exit={useFlip ? { rotateY: 90, opacity: 0 } : { opacity: 0 }}
                    transition={{ duration: useFlip ? 0.45 : 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </AnimatePresence>
              )}
            </div>
            <div className="px-4 py-3">
              <div className="font-display text-sm font-bold leading-tight text-white">{day.title}</div>
              {day.status !== "coming-soon" ? (
                <div className="mt-0.5 text-xs font-medium text-gold">“{day.headline}”</div>
              ) : (
                <div className="mt-0.5 text-xs text-white/60">The final session — check back soon.</div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function IntroFiveDays({ onEnter }) {
  const reduce = useReducedMotion();
  const lowEnd = useLowEnd();
  // Static fade-only cards under real reduced motion. Low-end only shrinks
  // the photo pools (fewer images) — the motion stays.
  const calm = reduce;
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState({});
  const [leaving, setLeaving] = useState(null); // "welcome" | "skip" | null
  const fieldRef = useRef(null);
  const welcomeRef = useRef(null);
  const done = progress >= 100;

  const pools = useMemo(() => days.map((d) => ({ day: d, pool: poolFor(d.mediaKey, lowEnd) })), [lowEnd]);
  const preloadList = useMemo(
    () => pools.flatMap(({ pool }) => pool.slice(0, 2).map((im) => imgSrc(im))),
    [pools]
  );
  // Map each preloaded src back to its card index for the float-in trigger.
  const cardOf = useMemo(() => {
    const m = new Map();
    pools.forEach(({ pool }, i) => pool.slice(0, 2).forEach((im) => m.set(imgSrc(im), i)));
    return m;
  }, [pools]);

  // Real preloading of the first two images of each card.
  useEffect(() => {
    const total = preloadList.length;
    if (total === 0) {
      setProgress(100);
      return;
    }
    let loaded = 0;
    let cancelled = false;
    const bump = (src) => {
      if (cancelled) return;
      loaded += 1;
      setProgress(Math.round((loaded / total) * 100));
      const ci = cardOf.get(src);
      if (ci !== undefined) setReady((r) => ({ ...r, [ci]: true }));
    };
    const safety = setTimeout(() => {
      if (!cancelled) {
        setProgress(100);
        setReady({ 0: true, 1: true, 2: true, 3: true, 4: true });
      }
    }, 9000);
    for (const src of preloadList) {
      const im = new Image();
      im.onload = () => bump(src);
      im.onerror = () => bump(src);
      im.src = src;
    }
    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, [preloadList, cardOf]);

  // Focus the Welcome button when it appears.
  useEffect(() => {
    if (done) welcomeRef.current?.focus({ preventScroll: true });
  }, [done]);

  // Mobile auto-pan: slow loop down the tall field, pausing while touched.
  // Off under reduced motion; low-end keeps it (cheap scroll loop).
  useEffect(() => {
    const el = fieldRef.current;
    if (!el || calm) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    let raf;
    let pausedUntil = 0;
    const pause = () => { pausedUntil = performance.now() + 2500; };
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("pointerdown", pause);
    const tick = () => {
      if (el.scrollHeight > el.clientHeight + 4 && performance.now() > pausedUntil) {
        el.scrollTop += 0.4;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) el.scrollTop = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("pointerdown", pause);
    };
  }, [calm]);

  const leave = (mode) => {
    if (leaving) return;
    setLeaving(mode);
    // Phase 4 will start ambient music here when mode === "welcome".
    setTimeout(() => onEnter(mode === "welcome"), mode === "welcome" ? 700 : 350);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Seminar recap intro"
      style={{ background: "linear-gradient(160deg, #1B1035 0%, #2E1065 55%, #1B1035 100%)" }}
      initial={{ opacity: 1 }}
      animate={leaving === "welcome" ? { opacity: 1 } : leaving ? { opacity: 0 } : {}}
      transition={{ duration: 0.35 }}
    >
      {/* light blooms */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[15%] h-64 w-64 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute bottom-[10%] right-[8%] h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <button
        onClick={() => leave("skip")}
        className="absolute right-4 top-4 z-10 inline-flex min-h-[44px] items-center rounded-full border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white"
        style={{ marginTop: "env(safe-area-inset-top)" }}
      >
        Skip →
      </button>

      {/* Card field: horizontal zigzag on desktop, panning vertical zigzag on mobile */}
      <div
        ref={fieldRef}
        className="absolute inset-0 overflow-y-auto px-6 pb-40 pt-20 md:overflow-visible md:pb-0 md:pt-0"
        style={{ perspective: "1200px" }}
      >
        <div
          className="mx-auto flex min-h-full w-fit max-w-none -space-y-6 flex-col items-center justify-start py-8 md:flex-row md:items-center md:justify-center md:space-y-0 md:py-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {pools.map(({ day, pool }, i) => (
            <div
              key={day.n}
              className={
                i % 2 === 0
                  ? "self-start md:self-center md:-ml-8 md:-translate-y-10 md:first:ml-0"
                  : "self-end md:self-center md:-ml-8 md:translate-y-10"
              }
            >
              <DayIntroCard
                day={day}
                pool={pool}
                depth={DEPTHS[i % DEPTHS.length]}
                index={i}
                active={!!ready[i]}
                exiting={leaving === "welcome"}
                calm={calm}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Counter → Welcome */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center pb-10" style={{ paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom))" }}>
        {!done ? (
          <>
            <div className="font-display text-5xl font-bold tabular-nums text-white" aria-live="polite">
              {progress}
              <span className="text-xl text-white/60">%</span>
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Loading the experience
            </div>
            <div className="mt-3 h-1 w-48 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
              <div className="h-full rounded-full bg-gold transition-[width] duration-200" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <motion.button
            ref={welcomeRef}
            onClick={() => leave("welcome")}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: [1, 1.05, 1] }}
            transition={{ scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.4 } }}
            className="inline-flex min-h-[56px] items-center rounded-full bg-gold px-12 text-lg font-bold text-ink shadow-lift"
          >
            Welcome
          </motion.button>
        )}
      </div>

      {/* purple wipe on welcome exit */}
      <AnimatePresence>
        {leaving === "welcome" && (
          <motion.div
            className="absolute inset-0 bg-purple-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
