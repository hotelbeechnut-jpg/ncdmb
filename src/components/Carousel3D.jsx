import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useLowEnd } from "../hooks/useDevice";

// Coverflow: active centered, neighbours rotated ±35°, pushed back, dimmed.
// Virtualized: renders at most 5 cards. Drag / arrows / buttons.
export default function Carousel3D({ items, onOpen, dayLabel = "" }) {
  const reduce = useReducedMotion();
  const lowEnd = useLowEnd();
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const n = items.length;
  const go = useCallback((dir) => setIndex((i) => (i + dir + n) % n), [n]);
  const goTo = useCallback((i) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);

  if (n === 0) return null;
  // Only real reduced-motion switches the 3D off (simple snap fallback).
  // Low-end only shrinks the window (fewer live cards), never the effect.
  const spread = lowEnd ? 1 : 2;
  if (reduce) {
    // Simple accessible fallback: horizontal snap scroll
    return (
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => onOpen?.(i)}
            className="w-56 shrink-0 snap-center overflow-hidden rounded-card border border-ink/10 bg-white shadow-soft"
            aria-label={`Open ${dayLabel} photo ${i + 1}`}
          >
            <Thumb item={it} eager={i < 2} />
          </button>
        ))}
      </div>
    );
  }

  // Window around index (5 cards normally, 3 on low-end)
  const windowed = [];
  for (let k = -spread; k <= spread; k++) windowed.push({ offset: k, real: ((index + k) % n + n) % n });

  return (
    <div
      ref={trackRef}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${dayLabel} media carousel`}
      className="relative"
      style={{ perspective: "1200px" }}
    >
      <motion.div
        className="relative mx-auto flex h-[300px] max-w-3xl items-center justify-center sm:h-[340px]"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60 || info.velocity.x < -400) go(1);
          else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {windowed.map(({ offset, real }) => {
          const it = items[real];
          const abs = Math.abs(offset);
          const active = offset === 0;
          return (
            <motion.button
              key={`${it.id}-${offset === 0 ? "a" : real}`}
              onClick={() => (active ? onOpen?.(real) : goTo(real))}
              initial={false}
              animate={{
                x: offset * (window.innerWidth < 640 ? 150 : 210),
                z: active ? 0 : -160 - abs * 60,
                rotateY: offset * -35,
                scale: active ? 1 : 0.85 - abs * 0.05,
                opacity: abs > spread ? 0 : active ? 1 : 0.55,
                zIndex: 10 - abs,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="absolute w-56 shrink-0 overflow-hidden rounded-card border border-white/50 bg-white shadow-lift sm:w-64"
              style={{ transformStyle: "preserve-3d", pointerEvents: abs > spread ? "none" : "auto" }}
              aria-label={active ? `Open ${dayLabel} photo ${real + 1}` : `Go to photo ${real + 1}`}
            >
              <Thumb item={it} eager={active} dimmed={!active} />
            </motion.button>
          );
        })}
      </motion.div>
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={() => go(-1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-lg shadow-soft"
          aria-label="Previous photo"
        >
          ←
        </button>
        <div className="text-sm font-medium tabular-nums text-ink/60" aria-live="polite">
          {index + 1} / {n}
        </div>
        <button
          onClick={() => go(1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-lg shadow-soft"
          aria-label="Next photo"
        >
          →
        </button>
      </div>
    </div>
  );
}

export function Thumb({ item, eager = false, dimmed = false }) {
  if (item.kind === "video") {
    return (
      <span className="relative block aspect-[4/5] w-full bg-ink">
        {item.poster ? (
          <img
            src={`/${item.poster}`}
            alt="Seminar video"
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover"
            style={{ objectPosition: "50% 25%", ...(dimmed ? { filter: "brightness(0.75)" } : undefined) }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-4xl text-white">▶</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-lg text-purple-900">
            ▶
          </span>
        </span>
      </span>
    );
  }
  const src = item.srcset?.["480"] ?? item.srcset?.["960"];
  if (!src) return null;
  return (
    <span className="block aspect-[4/5] w-full bg-lavender-100" style={{ aspectRatio: `${item.w ?? 4}/${item.h ?? 5}` }}>
      <img
        src={`/${src}`}
        srcSet={Object.entries(item.srcset || {}).map(([w, p]) => `/${p} ${w}w`).join(", ")}
        sizes="(max-width: 640px) 224px, 256px"
        alt="Seminar photo"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        width={item.w}
        height={item.h}
        className="h-full w-full object-cover"
        style={{
          background: item.blur ? `url(${item.blur}) center / cover` : undefined,
          filter: dimmed ? "brightness(0.8)" : undefined,
          objectPosition: `${item.fx ?? 50}% ${item.fy ?? 25}%`,
        }}
      />
    </span>
  );
}
