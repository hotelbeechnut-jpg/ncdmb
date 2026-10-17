import { useEffect, useState } from "react";
import Lightbox from "./Lightbox";
import { Reveal } from "./Reveal";
import { imgSrc, imgSrcSet, focusStyle, countsLabel, manifestCounts } from "../utils/media";

// Masonry archive: loads `pageSize` at a time, lightbox steps through EVERY item.
export default function MediaGrid({ dayKey, items, pageSize = 24, showCounts = true }) {
  const [visible, setVisible] = useState(pageSize);
  const [lightbox, setLightbox] = useState(null);
  const shown = (items || []).slice(0, visible);

  // Dev assertion: rendered section must match the manifest for the day.
  // ("all" is the whole manifest by construction, so there is nothing to check.)
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (dayKey === "all") return;
    const mc = manifestCounts(dayKey);
    const total = mc.images + mc.videos;
    if ((items || []).length !== total) {
      console.error(
        `[recap] MediaGrid count mismatch for ${dayKey}: rendered ${(items || []).length}, manifest ${total} (${mc.images} images + ${mc.videos} videos)`
      );
    }
  }, [dayKey, items]);

  useEffect(() => {
    setVisible(pageSize);
  }, [dayKey, pageSize]);

  if (!items || items.length === 0) return null;

  return (
    <div>
      {showCounts && (
        <p className="text-sm font-semibold text-ink/60" aria-live="polite">
          {countsLabel(dayKey)} · showing {shown.length} of {items.length}
        </p>
      )}
      <div className="mt-4 columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
        {shown.map((it, i) => (
          <Reveal key={it.id} y={16}>
            <button
              onClick={() => setLightbox(i)}
              className="block w-full break-inside-avoid overflow-hidden rounded-card border border-ink/10 bg-white shadow-soft"
              aria-label={`Open ${it.alt}`}
            >
              <Tile item={it} />
            </button>
          </Reveal>
        ))}
      </div>
      {visible < items.length && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setVisible((v) => v + pageSize)}
            className="inline-flex min-h-[48px] items-center rounded-full border border-purple-700/30 bg-white px-8 text-sm font-bold text-purple-700"
          >
            Load more ({items.length - visible} remaining)
          </button>
        </div>
      )}
      {lightbox !== null && (
        <Lightbox
          items={items}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNav={(i) => setLightbox(i)}
        />
      )}
    </div>
  );
}

function Tile({ item }) {
  if (item.kind === "video") {
    return (
      <span className="relative block w-full bg-ink" style={{ aspectRatio: "3/4" }}>
        {item.poster ? (
          <img
            src={`/${item.poster}`}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            style={focusStyle(item)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl text-white">▶</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-lg text-purple-900">▶</span>
        </span>
        {item.duration > 0 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
            {item.duration}s
          </span>
        )}
      </span>
    );
  }
  return (
    <span className="block w-full bg-lavender-100" style={{ aspectRatio: item.w && item.h ? `${item.w} / ${item.h}` : "4/5" }}>
      <img
        src={imgSrc(item)}
        srcSet={imgSrcSet(item)}
        sizes="(max-width: 640px) 50vw, 33vw"
        alt={item.alt}
        loading="lazy"
        decoding="async"
        width={item.w}
        height={item.h}
        className="h-full w-full object-cover"
        style={{ ...focusStyle(item), background: item.blur ? `url(${item.blur}) center / cover` : undefined }}
      />
    </span>
  );
}
