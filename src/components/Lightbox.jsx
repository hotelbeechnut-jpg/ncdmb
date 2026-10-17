import { useEffect, useRef } from "react";

// Full-screen lightbox with swipe, keyboard, focus trap, video support. One video at a time.
export default function Lightbox({ items, index, onClose, onNav }) {
  const ref = useRef(null);
  const touchX = useRef(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") onNav?.((index + 1) % items.length);
      if (e.key === "ArrowLeft") onNav?.((index - 1 + items.length) % items.length);
      // Simple focus trap: keep Tab inside
      if (e.key === "Tab" && ref.current) {
        const focusables = ref.current.querySelectorAll("button, video, [href]");
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, items.length, onClose, onNav]);

  const item = items[index];
  if (!item) return null;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Media viewer, item ${index + 1} of ${items.length}`}
      className="fixed inset-0 z-[95] flex flex-col bg-ink/95 text-white"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx < -50) onNav?.((index + 1) % items.length);
        else if (dx > 50) onNav?.((index - 1 + items.length) % items.length);
        touchX.current = null;
      }}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between p-4">
        <div className="text-sm tabular-nums text-white/70" aria-live="polite">
          {index + 1} / {items.length}
        </div>
        <button
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl"
          aria-label="Close viewer"
          autoFocus
        >
          ✕
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden px-2 pb-2">
        {item.kind === "video" ? (
          <video
            key={item.id}
            src={`/${item.src}`}
            poster={item.poster ? `/${item.poster}` : undefined}
            controls
            playsInline
            preload="metadata"
            className="max-h-full max-w-full rounded-card"
          />
        ) : (
          <img
            key={item.id}
            src={`/${item.srcset?.["960"] ?? item.srcset?.["480"]}`}
            srcSet={Object.entries(item.srcset || {}).map(([w, p]) => `/${p} ${w}w`).join(", ")}
            sizes="100vw"
            alt={item.alt ?? "Seminar photo"}
            className="max-h-full max-w-full rounded-card object-contain"
            draggable={false}
          />
        )}
      </div>
      <div className="flex items-center justify-center gap-4 p-4">
        <button
          onClick={() => onNav?.((index - 1 + items.length) % items.length)}
          className="inline-flex h-12 min-w-[56px] items-center justify-center rounded-full bg-white/10 px-4 text-lg"
          aria-label="Previous"
        >
          ←
        </button>
        <button
          onClick={() => onNav?.((index + 1) % items.length)}
          className="inline-flex h-12 min-w-[56px] items-center justify-center rounded-full bg-white/10 px-4 text-lg"
          aria-label="Next"
        >
          →
        </button>
      </div>
    </div>
  );
}
