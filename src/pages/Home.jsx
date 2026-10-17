import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePageMeta } from "../hooks/usePageMeta";
import { useLowEnd } from "../hooks/useDevice";
import Hero from "../components/Hero";
import FacilitatorBand from "../components/FacilitatorBand";
import AtAGlance from "../components/AtAGlance";
import Gallery from "../components/Gallery";
import Lessons from "../components/Lessons";
import { Reveal } from "../components/Reveal";
import { days } from "../data/days";
import { approvedTestimonials } from "../data/testimonials";
import { event } from "../config/event";
import { organizerCredit, whatsappLink } from "../utils/placeholders";
import { dayItems, imgSrc, imgSrcSet } from "../utils/media";
import { prefetchProps } from "../utils/prefetch";

// One journey card: the day's photos rotate automatically, staggered per
// card so the grid doesn't flip in sync. Static first photo under reduced
// motion (only that query may switch autoplay off).
function DayCard({ d, index }) {
  const reduce = useReducedMotion();
  const lowEnd = useLowEnd();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const pool = useMemo(
    () => dayItems(d.mediaKey).filter((it) => it.kind === "image").slice(0, lowEnd ? 3 : 6),
    [d.mediaKey, lowEnd]
  );

  useEffect(() => {
    if (reduce || paused || pool.length <= 1) return;
    let iv;
    // Stagger: card N starts its rotation N*700ms later than card 0.
    const start = setTimeout(() => {
      iv = setInterval(() => setCurrent((c) => (c + 1) % pool.length), 3200);
    }, index * 700);
    return () => {
      clearTimeout(start);
      if (iv) clearInterval(iv);
    };
  }, [reduce, paused, pool.length, index]);

  const img = pool[current % Math.max(1, pool.length)];

  return (
    <Link
      to={`/day/${d.n}`}
      {...prefetchProps(`/day/${d.n}`)}
      className="group block h-full rounded-cardlg border border-ink/10 bg-white p-6 shadow-soft transition-transform hover:-translate-y-1"
      aria-label={`Open Day ${d.n}: ${d.title}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="font-display text-5xl font-bold text-purple-700/15 transition group-hover:text-purple-700/30">
        {String(d.n).padStart(2, "0")}
      </div>
      <h3 className="font-display mt-2 text-xl font-bold text-ink">
        Day {d.n}: {d.title}
      </h3>
      {pool.length === 0 ? (
        <div className="shimmer mt-3 h-24 rounded-card" aria-hidden="true" />
      ) : reduce ? (
        <div className="relative mt-3 h-24 overflow-hidden rounded-card bg-lavender-100">
          <img
            src={imgSrc(pool[0])}
            srcSet={imgSrcSet(pool[0])}
            sizes="(max-width: 640px) 90vw, 400px"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: `${pool[0].fx ?? 50}% ${pool[0].fy ?? 25}%` }}
          />
        </div>
      ) : (
        <div className="relative mt-3 h-24 overflow-hidden rounded-card bg-lavender-100">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.img
              key={img.id}
              src={imgSrc(img)}
              srcSet={imgSrcSet(img)}
              sizes="(max-width: 640px) 90vw, 400px"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: `${img.fx ?? 50}% ${img.fy ?? 25}%` }}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </AnimatePresence>
        </div>
      )}
      {d.status === "coming-soon" ? (
        <div className="shimmer mt-3 h-10 rounded-card" aria-hidden="true" />
      ) : (
        <p className="font-display mt-2 text-base font-semibold text-purple-700">“{d.headline}”</p>
      )}
      <span className="mt-4 inline-flex min-h-[44px] items-center text-sm font-bold text-purple-700">
        {d.status === "coming-soon" ? "Coming soon →" : "Open day page →"}
      </span>
    </Link>
  );
}

function DayCards() {
  return (
    <section className="bg-paper py-14 sm:py-20" aria-labelledby="journey-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">The journey</p>
          <h2 id="journey-h" className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Five days, one journey
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((d, i) => (
            <Reveal key={d.n} delay={(i % 3) * 0.06}>
              <DayCard d={d} index={i} />
            </Reveal>
          ))}
          <Reveal delay={0.12}>
            <Link
              to="/gallery"
              {...prefetchProps("/gallery")}
              className="dark-glow grain relative flex h-full min-h-[220px] flex-col justify-between rounded-cardlg p-6 text-white shadow-soft transition-transform hover:-translate-y-1"
            >
              <div className="font-display text-xl font-bold">Moments in pictures</div>
              <p className="mt-2 text-sm text-white/75">Browse the full immersive gallery from all five days.</p>
              <span className="mt-4 inline-flex min-h-[44px] items-center text-sm font-bold text-gold">
                Open gallery →
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PeopleTeasers() {
  return (
    <section className="bg-white py-14 sm:py-20" aria-labelledby="people-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 id="people-h" className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Meet the people
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Reveal>
            <Link
              to="/organizers"
              className="block h-full rounded-cardlg border border-ink/10 bg-paper p-6 shadow-soft transition-transform hover:-translate-y-1 sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">Organizers</p>
              <h3 className="font-display mt-2 text-2xl font-bold text-ink">Meet the Organizers</h3>
              <p className="mt-2 text-sm text-ink/65">{organizerCredit(event)}</p>
              <span className="mt-4 inline-flex min-h-[44px] items-center text-sm font-bold text-purple-700">
                Meet them →
              </span>
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <Link
              to="/lecturer"
              className="block h-full rounded-cardlg border border-purple-500/25 bg-lavender-100 p-6 shadow-soft transition-transform hover:-translate-y-1 sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">Facilitator</p>
              <h3 className="font-display mt-2 text-2xl font-bold text-ink">{event.lecturer.pageTitle}</h3>
              <p className="mt-2 text-sm text-ink/65">
                {event.lecturer.role} · {event.lecturer.brand} — “{event.lecturer.tagline}”
              </p>
              <span className="mt-4 inline-flex min-h-[44px] items-center text-sm font-bold text-purple-700">
                Meet the lecturer →
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function VoicesTeaser() {
  const wa = whatsappLink(
    event.builder.whatsapp,
    "Hello, I'd like to share my seminar experience for the recap page."
  );
  return (
    <section className="bg-paper py-14 sm:py-20" aria-labelledby="voices-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">Voices</p>
          <h2 id="voices-h" className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            From the room
          </h2>
        </Reveal>
        {approvedTestimonials.length === 0 ? (
          <Reveal delay={0.08}>
            <div className="mt-8 rounded-cardlg border border-ink/10 bg-white p-6 text-center shadow-soft sm:p-8">
              <p className="font-display text-lg font-bold text-ink">Participant stories coming soon</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
                Were you there? Share your experience on WhatsApp and it could appear here.
              </p>
              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] items-center rounded-full bg-gold px-6 text-sm font-bold text-ink"
                >
                  Share on WhatsApp
                </a>
                <Link
                  to="/testimonials"
                  className="inline-flex min-h-[48px] items-center rounded-full border border-ink/15 px-6 text-sm font-semibold text-ink"
                >
                  Open testimonials
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {approvedTestimonials.slice(0, 3).map((t) => (
              <figure key={t.id} className="rounded-cardlg border border-ink/10 bg-white p-6 shadow-soft">
                <blockquote className="text-[15px] leading-relaxed text-ink/80">“{t.quote}”</blockquote>
                <figcaption className="mt-3 text-sm font-semibold text-ink">
                  {t.name}
                  {t.business && <span className="font-normal text-ink/60"> · {t.business}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PitchBanner() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="dark-glow grain relative overflow-hidden rounded-cardlg p-6 text-center text-white sm:p-12">
            <h2 className="font-display mx-auto max-w-2xl font-bold" style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}>
              You’ve seen what an owned asset can feel like. Let’s build yours.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/75">
              Fast, professional websites for real businesses — by {event.builder.name}.
            </p>
            <Link
              to="/build-yours"
              className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-gold px-8 text-base font-bold text-ink shadow-soft transition-transform hover:scale-[1.03]"
            >
              See how it works →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function GratitudeClosing() {
  return (
    <section className="bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">Thank you</p>
          <p className="font-display mt-3 text-lg font-medium leading-relaxed text-ink/80 sm:text-xl">
            {event.gratitude.message}
          </p>
          <Link
            to="/organizers"
            className="mt-6 inline-flex min-h-[48px] items-center rounded-full border border-purple-700/30 bg-white px-8 text-sm font-bold text-purple-700"
          >
            Meet the organizers →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta(
    "Home",
    "A 5-day digital marketing seminar recap for 50+ small business owners. Lessons, photos and key takeaways."
  );
  return (
    <>
      <Hero />
      <FacilitatorBand />
      <AtAGlance />
      <DayCards />
      <Gallery />
      <PeopleTeasers />
      <VoicesTeaser />
      <Lessons />
      <PitchBanner />
      <GratitudeClosing />
    </>
  );
}
