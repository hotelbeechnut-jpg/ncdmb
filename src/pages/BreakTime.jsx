import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";
import { Reveal } from "../components/Reveal";
import PageHeader from "../components/PageHeader";
import Carousel3D from "../components/Carousel3D";
import RibbonDrift from "../components/RibbonDrift";
import MediaGrid from "../components/MediaGrid";
import Lightbox from "../components/Lightbox";
import {
  breakItems,
  breakTimeDays,
  countsLabel,
  dayItems,
  manifestCounts,
} from "../utils/media";

const INTRO =
  "Learning runs better on good food and good company. Between sessions, participants stepped away for breakfast and lunch, shared a table and talked about what they had just learned.";

// Best photos first (featured first, topped up to at least 12) — same
// top-up rule as the day hero galleries. Manifest order is featured-first.
function bestPool(items, min = 12) {
  if (items.length <= min) return items;
  const feat = items.filter((i) => i.featured);
  const rest = items.filter((i) => !i.featured);
  return [...feat, ...rest].slice(0, Math.max(min, feat.length));
}

function chipLabel(tag) {
  if (tag === "all") return "All";
  const n = Number(String(tag).replace("day", ""));
  return Number.isFinite(n) && n > 0 ? `Day ${n}` : tag;
}

export default function BreakTime() {
  usePageMeta("Break Time", "Breakfast and lunch moments from the seminar.");

  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null); // { items, index }

  const dayTags = useMemo(() => breakTimeDays(), []);
  const items = useMemo(() => breakItems(filter), [filter]);
  const pool = useMemo(() => bestPool(items, 12), [items]);

  // Dev assertion: rendered count must match the manifest count.
  useEffect(() => {
    const expected =
      filter === "all"
        ? manifestCounts("break-time")
        : null;
    if (expected) {
      const total = expected.images + expected.videos;
      if (items.length !== total) {
        console.error(
          `[recap] BreakTime count mismatch: rendered ${items.length}, manifest ${total} (${expected.images} images + ${expected.videos} videos)`
        );
      }
    } else {
      const fresh = dayItems("break-time").filter((it) => it.day === filter).length;
      if (items.length !== fresh) {
        console.error(
          `[recap] BreakTime count mismatch for filter "${filter}": rendered ${items.length}, manifest ${fresh}`
        );
      }
    }
  }, [items, filter]);

  const openFull = (poolIndex) => {
    const id = pool[poolIndex]?.id;
    const idx = id ? items.findIndex((it) => it.id === id) : poolIndex;
    setLightbox({ items, index: Math.max(0, idx) });
  };

  const counts =
    filter === "all"
      ? countsLabel("break-time")
      : (() => {
          const ni = items.filter((i) => i.kind === "image").length;
          const nv = items.filter((i) => i.kind === "video").length;
          const parts = [`${ni} photo${ni === 1 ? "" : "s"}`];
          if (nv > 0) parts.push(`${nv} video${nv === 1 ? "" : "s"}`);
          return parts.join(" · ");
        })();

  return (
    <>
      <PageHeader kicker="Moments" title="Break Time" intro="Breakfast and lunch" />
      <div className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="max-w-3xl text-base leading-relaxed text-ink/75 sm:text-lg">{INTRO}</p>
            <p className="mt-3 text-sm font-semibold text-ink/60" aria-live="polite">
              {items.length > 0 ? counts : "Break-time photos are coming soon."}
            </p>
          </Reveal>

          {dayTags.length > 0 && items.length > 0 && (
            <Reveal delay={0.05}>
              <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter break-time by day">
                {["all", ...dayTags].map((t) => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={filter === t}
                    onClick={() => { setFilter(t); setLightbox(null); }}
                    className={`inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-semibold transition ${
                      filter === t
                        ? "bg-purple-700 text-white"
                        : "border border-ink/15 bg-paper text-ink hover:border-purple-700/40"
                    }`}
                  >
                    {chipLabel(t)}
                  </button>
                ))}
              </div>
            </Reveal>
          )}

          {items.length === 0 ? (
            <Reveal delay={0.08}>
              <div className="mt-8 rounded-cardlg border border-dashed border-purple-500/40 bg-lavender-100/60 p-8 text-center sm:p-12">
                <div className="font-display text-lg font-bold text-purple-900">
                  Break-time photos are coming soon.
                </div>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
                  Eating photos moved out of the day folders will appear here automatically once added.
                </p>
              </div>
            </Reveal>
          ) : (
            <>
              {pool.length > 0 && (
                <Reveal delay={0.05}>
                  <div className="mt-8">
                    <Carousel3D items={pool} dayLabel="Break Time" onOpen={openFull} />
                  </div>
                </Reveal>
              )}
              <Reveal delay={0.08}>
                <div className="mt-10">
                  <RibbonDrift
                    items={items}
                    label="Break-time photo ribbon"
                    onOpen={(i) => setLightbox({ items, index: i })}
                  />
                </div>
              </Reveal>
              <div className="mt-6">
                <MediaGrid
                  dayKey={filter === "all" ? "break-time" : "all"}
                  items={items}
                  pageSize={24}
                  showCounts={filter === "all"}
                />
              </div>
              <Link
                to="/gallery"
                className="mt-6 flex min-h-[56px] items-center justify-between gap-3 rounded-card border border-ink/10 bg-paper p-5 transition-transform hover:-translate-y-0.5"
                aria-label="Back to the full gallery"
              >
                <span>
                  <span className="font-display block font-bold text-ink">Full gallery</span>
                  <span className="mt-0.5 block text-sm text-ink/60">Every day, all in one place</span>
                </span>
                <span aria-hidden="true" className="text-lg font-bold text-purple-700">→</span>
              </Link>
            </>
          )}
        </div>
      </div>
      {lightbox && (
        <Lightbox
          items={lightbox.items}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNav={(i) => setLightbox({ items: lightbox.items, index: i })}
        />
      )}
    </>
  );
}
