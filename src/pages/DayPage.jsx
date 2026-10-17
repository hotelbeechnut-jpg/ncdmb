import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import PageHeader from "../components/PageHeader";
import { distributeImages, DocSpotlight, DocChapter } from "../components/Documentary";
import RibbonDrift from "../components/RibbonDrift";
import MediaGrid from "../components/MediaGrid";
import Lightbox from "../components/Lightbox";
import NotFound from "./NotFound";
import { getDay, days } from "../data/days";
import { dayItems, heroPool, countsLabel } from "../utils/media";
import { prefetchProps } from "../utils/prefetch";

function ComingSoonDay({ day }) {
  return (
    <>
      <PageHeader
        kicker={`Day ${day.n} · Coming soon`}
        title={`Day ${day.n}: ${day.title}`}
        intro={day.subtitle}
        dark
      />
      <div className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <div className="rounded-cardlg border border-purple-500/25 bg-lavender-100/60 p-6 sm:p-10">
              <div
                aria-hidden="true"
                className="font-display select-none text-center font-bold text-purple-700/15"
                style={{ fontSize: "clamp(5rem, 22vw, 10rem)", lineHeight: 1 }}
              >
                {String(day.n).padStart(2, "0")}
              </div>
              <div className="shimmer mt-4 h-36 rounded-card" aria-hidden="true" />
              <p className="mt-6 text-center text-base leading-relaxed text-ink/75">{day.summary}</p>
              <p className="mt-3 text-center text-sm font-semibold text-purple-700">
                Check back soon — this page becomes a full day page automatically once content and media arrive.
              </p>
            </div>
          </Reveal>
          <DayNav day={day} />
        </div>
      </div>
    </>
  );
}

function DayNav({ day }) {
  const prev = days.find((d) => d.n === day.n - 1);
  const next = days.find((d) => d.n === day.n + 1);
  return (
    <nav aria-label="Day navigation" className="mt-10 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link
          to={`/day/${prev.n}`}
          {...prefetchProps(`/day/${prev.n}`)}
          className="rounded-card border border-ink/10 bg-paper p-5 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-ink/50">← Previous</span>
          <span className="font-display mt-1 block font-bold text-ink">Day {prev.n}: {prev.title}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link
          to={`/day/${next.n}`}
          {...prefetchProps(`/day/${next.n}`)}
          className="rounded-card border border-ink/10 bg-paper p-5 text-right shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-ink/50">Next →</span>
          <span className="font-display mt-1 block font-bold text-ink">Day {next.n}: {next.title}</span>
        </Link>
      ) : <span />}
      <Link
        to="/gallery"
        className="rounded-card border border-ink/10 bg-white p-5 text-center text-sm font-semibold text-purple-700 sm:col-span-2"
      >
        Browse the full gallery →
      </Link>
      <Link
        to="/build-yours"
        className="rounded-card bg-gold p-5 text-center text-sm font-bold text-ink sm:col-span-2"
      >
        Get your own website →
      </Link>
    </nav>
  );
}

export default function DayPage() {
  const { n } = useParams();
  const day = getDay(n);

  usePageMeta(
    day ? `Day ${day.n}: ${day.title}` : "Not found",
    day ? `${day.subtitle}. ${day.headline}` : undefined
  );

  if (!day) return <NotFound />;
  if (day.status === "coming-soon") return <ComingSoonDay day={day} />;

  const items = dayItems(day.mediaKey);
  const hasMedia = items.length > 0;
  const num = String(day.n).padStart(2, "0");
  const [ribbonLight, setRibbonLight] = useState(null);

  // Hero gallery pool: featured first, topped up to at least 12.
  const pool = heroPool(day.mediaKey, 12);
  // Documentary scenes share the full image set (cached by the browser,
  // so overlap with the hero pool costs nothing extra).
  const sceneImages = items.filter((it) => it.kind === "image");
  const { scenes } = distributeImages(sceneImages, day.sections?.length ?? 0, 0);
  let momentRun = 0;
  const sceneMoments = (scenes || []).map((imgs) => {
    const start = momentRun;
    momentRun += imgs.length;
    return imgs.map((_, k) => start + k + 1);
  });

  return (
    <>
      <PageHeader
        kicker={`Day ${day.n} of 5 · ${day.subtitle}`}
        title={`Day ${day.n}: ${day.title}`}
        intro={`“${day.headline}”`}
      />
      {pool.length > 0 && (
        <div className="border-b border-ink/10 bg-paper pb-6">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <DocSpotlight images={pool} dayNum={day.n} />
          </div>
        </div>
      )}
      <div className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <div
              aria-hidden="true"
              className="font-display select-none font-bold text-purple-700/10"
              style={{ fontSize: "clamp(4rem, 18vw, 8rem)", lineHeight: 1 }}
            >
              {num}
            </div>
          </Reveal>

          <Reveal>
            <h2 className="font-display mt-2 text-2xl font-bold text-ink">Overview</h2>
            <p className="mt-3 text-base leading-relaxed text-ink/75">{day.summary}</p>
          </Reveal>

          {day.outcomes?.length > 0 && (
            <Reveal>
              <h3 className="font-display mt-8 text-xl font-bold text-ink">
                By the end of the day participants could…
              </h3>
              <ul className="mt-3 space-y-2">
                {day.outcomes.map((o, i) => (
                  <li key={i} className="flex gap-3 rounded-card border border-ink/10 bg-paper p-4 text-[15px] text-ink/80">
                    <span aria-hidden="true" className="font-display font-bold text-purple-700">✓</span>
                    {o}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {day.sections?.map((s, i) => (
            <DocChapter
              key={i}
              index={i}
              title={s.title}
              body={s.body}
              points={s.points}
              images={scenes[i] || []}
              moments={sceneMoments[i] || []}
              dayNum={day.n}
              flip={i % 2 === 1}
            />
          ))}

          {day.activities?.length > 0 && (
            <Reveal>
              <h3 className="font-display mt-10 text-xl font-bold text-ink">Hands-on activities</h3>
              <Stagger className="mt-3 grid gap-3 sm:grid-cols-2" gap={0.06}>
                {day.activities.map((a, i) => (
                  <StaggerItem key={i}>
                    <div className="h-full rounded-card border border-purple-500/25 bg-lavender-100/60 p-4">
                      <div className="font-display font-bold text-ink">{a.title}</div>
                      <p className="mt-1 text-sm text-ink/65">{a.description}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>
          )}

          {day.takeaway && (
            <Reveal>
              <figure className="dark-glow grain relative mt-10 rounded-cardlg p-6 text-white sm:p-8">
                <blockquote
                  className="font-display font-bold"
                  style={{ fontSize: "clamp(1.15rem, 4.5vw, 1.5rem)", lineHeight: 1.35 }}
                >
                  “{day.takeaway}”
                </blockquote>
                <figcaption className="mt-3 text-sm font-semibold text-gold">
                  Day {day.n} takeaway
                </figcaption>
              </figure>
            </Reveal>
          )}

          <Reveal>
            <h3 className="font-display mt-10 text-xl font-bold text-ink">
              The day in pictures <span className="text-base font-semibold text-ink/50">· {countsLabel(day.mediaKey)}</span>
            </h3>
            <div className="mt-4">
              {!hasMedia ? (
                <div className="rounded-cardlg border border-dashed border-purple-500/40 bg-lavender-100/60 p-8 text-center">
                  <div className="font-display text-lg font-bold text-purple-900">
                    Photos and videos coming soon
                  </div>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
                    The lessons for Day {day.n} are ready above — media will appear here automatically once added.
                  </p>
                </div>
              ) : (
                <>
                  <RibbonDrift items={items} label={`Day ${day.n} photo ribbon`} onOpen={(i) => setRibbonLight(i)} />
                  <div className="mt-6">
                    <MediaGrid dayKey={day.mediaKey} items={items} pageSize={24} />
                  </div>
                  <Link
                    to="/break-time"
                    className="mt-6 flex min-h-[56px] items-center justify-between gap-3 rounded-card border border-purple-500/25 bg-lavender-100/60 p-5 transition-transform hover:-translate-y-0.5"
                    aria-label="See break-time moments: breakfast and lunch photos"
                  >
                    <span>
                      <span className="font-display block font-bold text-ink">Break time moments</span>
                      <span className="mt-0.5 block text-sm text-ink/60">Breakfast and lunch, on their own page</span>
                    </span>
                    <span aria-hidden="true" className="text-lg font-bold text-purple-700">→</span>
                  </Link>
                  {ribbonLight !== null && (
                    <Lightbox
                      items={items}
                      index={ribbonLight}
                      onClose={() => setRibbonLight(null)}
                      onNav={(i) => setRibbonLight(i)}
                    />
                  )}
                </>
              )}
            </div>
          </Reveal>

          <DayNav day={day} />
        </div>
      </div>
    </>
  );
}
