import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { event } from "../config/event";
import { isPlaceholder, organizerCredit } from "../utils/placeholders";
import { ValueOrTbc, Reveal } from "./Reveal";
import FloatingGallery3D from "./FloatingGallery3D";
import manifest from "../data/media-manifest.json";
import { prefetchProps } from "../utils/prefetch";

function SponsorLine() {
  return (
    <p className="text-sm text-ink/60">
      {organizerCredit(event)}
      {event.sponsor?.enabled && ` · ${event.sponsor.label} ${event.sponsor.name}`}
    </p>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const allFeatured = ["day1", "day2", "day3", "day4", "day5"].flatMap((d) => {
    const m = manifest[d];
    if (!m) return [];
    const imgs = (m.images || []).filter((i) => i.featured);
    return imgs.length ? imgs : (m.images || []).slice(0, 3);
  });


  return (
    <section id="top" className="relative overflow-hidden bg-paper pt-28 pb-16 sm:pt-32 sm:pb-24">
      <FloatingGallery3D images={allFeatured} />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-purple-700 shadow-soft">
            {event.daysCount}-Day Recap · {event.attendeesLabel}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          {isPlaceholder(event.title) ? (
            <h1 className="mt-6 px-2">
              <span
                className="font-display block font-bold tracking-tight text-ink"
                style={{ fontSize: "clamp(1.9rem, 8vw, 3.75rem)", lineHeight: 1.05 }}
              >
                Digital Marketing
              </span>
              <span
                className="font-display block font-bold tracking-tight text-purple-700"
                style={{ fontSize: "clamp(1.9rem, 8vw, 3.75rem)", lineHeight: 1.05 }}
              >
                Skill Acquisition Seminar
              </span>
              <span className="mt-4 flex justify-center">
                <ValueOrTbc value={event.title} tbcLabel="Event title to be confirmed" />
              </span>
            </h1>
          ) : (
            <h1
              className="font-display mt-6 px-2 font-bold leading-[1.05] tracking-tight text-ink"
              style={{ fontSize: "clamp(1.9rem, 8vw, 3.75rem)" }}
            >
              {event.title}
            </h1>
          )}
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink/70 sm:text-lg">{event.subtitle}</p>
        </Reveal>
        <Reveal delay={0.22}>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-ink/70">
            <ValueOrTbc value={event.dates} />
            <span aria-hidden="true">·</span>
            <ValueOrTbc value={event.location} />
          </div>
          <p className="mt-3 text-sm text-ink/70">
            Taught by <ValueOrTbc value={event.lecturer.name} className="font-semibold text-ink" /> ·{" "}
            {event.lecturer.brand}
          </p>
          <div className="mt-2 flex justify-center">
            <SponsorLine />
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/day/1"
              {...prefetchProps("/day/1")}
              className="inline-flex min-h-[48px] items-center rounded-full bg-purple-700 px-8 text-base font-semibold text-white shadow-lift transition-transform hover:scale-[1.03] active:scale-95"
            >
              Explore the 5 days ↓
            </Link>
            <Link
              to="/build-yours"
              className="inline-flex min-h-[48px] items-center rounded-full border border-ink/15 bg-white px-8 text-base font-semibold text-ink shadow-soft transition-transform hover:scale-[1.03]"
            >
              Build your own website
            </Link>
          </div>
        </Reveal>
      </div>
      {reduce ? (
        <div className="relative mx-auto mt-10 flex justify-center" aria-hidden="true">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-purple-700/30 p-1">
            <div className="h-2 w-2 rounded-full bg-purple-700" />
          </div>
        </div>
      ) : (
      <motion.div
        className="relative mx-auto mt-10 flex justify-center"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-purple-700/30 p-1">
          <div className="h-2 w-2 rounded-full bg-purple-700" />
        </div>
      </motion.div>
      )}
    </section>
  );
}
