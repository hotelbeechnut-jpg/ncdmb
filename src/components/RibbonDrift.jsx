import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { imgSrc, focusStyle } from "../utils/media";

// A drifting row of every item. Pauses on hover/touch; tap opens the lightbox.
export default function RibbonDrift({ items, label = "Photos", onOpen, reverse = false, speed = 60 }) {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  if (!items || items.length === 0) return null;

  if (reduce) {
    // Calm fallback: static scrollable strip, no drift.
    return (
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6" aria-label={label}>
        {items.map((it, i) => (
          <RibbonCard key={it.id} item={it} onClick={() => onOpen?.(i)} />
        ))}
      </div>
    );
  }

  const loop = [...items, ...items]; // seamless -50% loop
  return (
    <div
      className={`doc-ribbon no-scrollbar -mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 ${paused ? "paused" : ""}`}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      aria-label={label}
    >
      <div className={`doc-ribbon-track py-2 ${reverse ? "reverse" : ""}`} style={{ animationDuration: `${speed}s` }}>
        {loop.map((it, i) => (
          <RibbonCard
            key={`${it.id}-${i}`}
            item={it}
            hidden={i >= items.length}
            onClick={() => onOpen?.(i % items.length)}
          />
        ))}
      </div>
    </div>
  );
}

function RibbonCard({ item, hidden = false, onClick }) {
  const inner =
    item.kind === "video" ? (
      <span className="relative block h-36 w-auto sm:h-44" style={{ aspectRatio: "3/4" }}>
        {item.poster ? (
          <img
            src={`/${item.poster}`}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full rounded-card border border-white/40 object-cover shadow-soft"
            style={focusStyle(item)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-card bg-ink text-2xl text-white">▶</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sm text-purple-900">▶</span>
        </span>
      </span>
    ) : (
      <img
        src={imgSrc(item)}
        alt=""
        loading="lazy"
        decoding="async"
        width={item.w}
        height={item.h}
        className="h-36 w-auto rounded-card border border-white/40 object-cover shadow-soft sm:h-44"
        style={{ ...focusStyle(item), background: item.blur ? `url(${item.blur}) center / cover` : undefined }}
      />
    );
  return (
    <button
      onClick={onClick}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : 0}
      aria-label={hidden ? undefined : item.alt}
      className="shrink-0"
    >
      {inner}
    </button>
  );
}
