import { useEffect, useMemo, useState } from "react";
import Carousel3D from "./Carousel3D";
import Lightbox from "./Lightbox";
import MediaGrid from "./MediaGrid";
import { Reveal } from "./Reveal";
import { allItems, dayItems, heroPool } from "../utils/media";

const FILTERS = ["All", "Day 1", "Day 2", "Day 3", "Day 4", "Day 5"];

function keyOf(filter) {
  return filter === "All" ? null : `day${filter.replace("Day ", "")}`;
}

export default function Gallery() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  // EVERY item from every day — windowed downstream by MediaGrid.
  const items = useMemo(() => {
    const k = keyOf(filter);
    return k ? dayItems(k) : allItems();
  }, [filter]);

  const pool = useMemo(() => {
    const k = keyOf(filter);
    if (k) return heroPool(k, 12);
    const feat = items.filter((i) => i.featured);
    const rest = items.filter((i) => !i.featured);
    return [...feat, ...rest].slice(0, 12);
  }, [filter, items]);

  // Never render a blank block silently: log the cause.
  useEffect(() => {
    if (items.length === 0) {
      console.error(
        `[recap] Gallery is empty for filter "${filter}": the manifest has no images or videos for ${filter === "All" ? "any day" : filter}. Run \`npm run media\` after adding source files.`
      );
    }
  }, [items.length, filter]);

  if (items.length === 0) {
    return (
      <section id="gallery" className="bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Immersive gallery</h2>
            <p className="mt-2 text-ink/60">Photos are on the way — check back soon.</p>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="dark-glow grain relative bg-purple-900 py-14 text-white sm:py-20" aria-labelledby="gallery-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Moments</p>
          <h2 id="gallery-h" className="font-display mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Immersive gallery
          </h2>
          <p className="mt-2 max-w-2xl text-white/70">
            {items.length} item{items.length === 1 ? "" : "s"} · drag, swipe or use arrow keys. Tap any card to view it full-screen.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by day">
            {FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => { setFilter(f); setLightbox(null); }}
                className={`inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-semibold transition ${
                  filter === f ? "bg-gold text-ink" : "border border-white/25 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>
        <div className="mt-8">
          <Carousel3D items={pool} dayLabel={filter} onOpen={(i) => setLightbox({ items: pool, index: i })} />
        </div>
        <div className="mt-10 rounded-cardlg bg-white p-4 text-ink sm:p-6">
          <MediaGrid dayKey={keyOf(filter) ?? "all"} items={items} pageSize={24} showCounts={false} />
        </div>
        <p className="mt-4 text-center text-xs text-white/50">
          Lightbox steps through all {items.length} {filter === "All" ? "items" : `${filter} items`}
        </p>
        <div className="mt-2 text-center">
          <button
            onClick={() => setLightbox({ items, index: 0 })}
            className="inline-flex min-h-[48px] items-center rounded-full bg-gold px-8 text-sm font-bold text-ink"
          >
            View all {items.length} full-screen →
          </button>
        </div>
      </div>
      {lightbox && (
        <Lightbox items={lightbox.items} index={lightbox.index} onClose={() => setLightbox(null)} onNav={(i) => setLightbox({ items: lightbox.items, index: i })} />
      )}
    </section>
  );
}
