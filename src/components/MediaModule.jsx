import { useMemo, useState } from "react";
import Carousel3D, { Thumb } from "./Carousel3D";
import Lightbox from "./Lightbox";

// Picks layout by count: 0 -> coming soon, 1-6 spotlight+filmstrip, 7+ carousel+view-all grid.
export default function MediaModule({ dayKey, dayNum, images = [], videos = [] }) {
  const [lightbox, setLightbox] = useState(null); // { items, index }
  const [showAll, setShowAll] = useState(false);

  const items = useMemo(() => {
    const imgs = (images || []).map((im, i) => ({
      kind: "image", id: im.id, srcset: im.srcset, blur: im.blur, w: im.w, h: im.h,
      alt: `Seminar photo, Day ${dayNum} — ${i + 1}`,
    }));
    const vids = (videos || []).map((v, i) => ({
      kind: "video", id: v.id, src: v.src, poster: v.poster, duration: v.duration,
      alt: `Seminar video, Day ${dayNum} — ${i + 1}`,
    }));
    // featured first already sorted in manifest
    return [...imgs, ...vids];
  }, [images, videos, dayNum]);

  if (items.length === 0) {
    return (
      <div className="rounded-cardlg border border-dashed border-purple-500/40 bg-lavender-100/60 p-8 text-center">
        <div className="font-display text-lg font-bold text-purple-900">Photos and videos coming soon</div>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
          We’re still gathering media for this day. The lessons below are ready — check back soon for photos.
        </p>
      </div>
    );
  }

  if (items.length <= 6) {
    const [main, ...rest] = items;
    return (
      <div>
        <button
          onClick={() => setLightbox({ items, index: 0 })}
          className="block w-full overflow-hidden rounded-cardlg border border-ink/10 bg-white shadow-soft"
          aria-label={`Open Day ${dayNum} spotlight photo`}
        >
          <Spotlight item={main} dayNum={dayNum} />
        </button>
        {rest.length > 0 && (
          <div className="no-scrollbar -mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-1">
            {rest.map((it, i) => (
              <button
                key={it.id}
                onClick={() => setLightbox({ items, index: i + 1 })}
                className="w-28 shrink-0 overflow-hidden rounded-card border border-ink/10 bg-white shadow-soft"
                aria-label={`Open Day ${dayNum} photo ${i + 2}`}
              >
                <Thumb item={it} />
              </button>
            ))}
          </div>
        )}
        {lightbox && (
          <Lightbox items={lightbox.items} index={lightbox.index} onClose={() => setLightbox(null)} onNav={(i) => setLightbox({ items, index: i })} />
        )}
      </div>
    );
  }

  // 7+: carousel from featured (or first 10) + view-all grid
  const carouselItems = items.slice(0, 10);
  return (
    <div>
      <Carousel3D items={carouselItems} dayLabel={`Day ${dayNum}`} onOpen={(i) => setLightbox({ items: carouselItems, index: i })} />
      <div className="mt-4 text-center">
        <button
          onClick={() => setShowAll((v) => !v)}
          className="inline-flex min-h-[44px] items-center rounded-full border border-purple-700/30 bg-white px-6 text-sm font-semibold text-purple-700"
          aria-expanded={showAll}
        >
          {showAll ? "Hide all photos" : `View all ${items.length} photos & videos`}
        </button>
      </div>
      {showAll && (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => setLightbox({ items, index: i })}
              className="overflow-hidden rounded-card border border-ink/10 bg-white"
              aria-label={`Open Day ${dayNum} media ${i + 1}`}
            >
              <Thumb item={it} />
            </button>
          ))}
        </div>
      )}
      {lightbox && (
        <Lightbox items={lightbox.items} index={lightbox.index} onClose={() => setLightbox(null)} onNav={(i) => setLightbox({ items: lightbox.items, index: i })} />
      )}
    </div>
  );
}

function Spotlight({ item, dayNum }) {
  if (item.kind === "video") {
    return <Thumb item={item} eager />;
  }
  const src = item.srcset?.["960"] ?? item.srcset?.["480"];
  return (
    <span className="block w-full bg-lavender-100">
      <img
        src={`/${src}`}
        srcSet={Object.entries(item.srcset || {}).map(([w, p]) => `/${p} ${w}w`).join(", ")}
        sizes="(max-width: 768px) 100vw, 800px"
        alt={`Seminar photo, Day ${dayNum}`}
        loading="lazy"
        decoding="async"
        width={item.w}
        height={item.h}
        className="max-h-[480px] w-full object-cover object-top"
        style={{ background: item.blur ? `url(${item.blur}) center / cover` : undefined }}
      />
    </span>
  );
}
