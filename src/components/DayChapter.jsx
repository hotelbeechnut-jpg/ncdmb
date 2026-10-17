import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Stagger, StaggerItem, Reveal } from "./Reveal";
import MediaModule from "./MediaModule";
import manifest from "../data/media-manifest.json";

export default function DayChapter({ day, dark = false }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const numY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  const media = manifest[day.mediaKey] ?? { images: [], videos: [] };
  const hasMedia = (media.images?.length ?? 0) + (media.videos?.length ?? 0) > 0;
  const comingSoon = day.status === "coming-soon";
  // Day 4 shows content but media-coming-soon until files exist
  const mediaComingSoon = !comingSoon && !hasMedia;

  const num = String(day.n).padStart(2, "0");

  return (
    <article
      ref={ref}
      id={`day-${day.n}`}
      className={`relative overflow-hidden py-14 sm:py-20 ${dark ? "dark-glow grain text-white" : "bg-white text-ink"}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          <div className="relative">
            <motion.div
              aria-hidden="true"
              style={reduce ? undefined : { y: numY }}
              className={`font-display pointer-events-none select-none text-[6rem] font-bold leading-none sm:text-[9rem] ${
                dark ? "text-white/10" : "text-purple-700/10"
              }`}
            >
              {num}
            </motion.div>
            <Reveal>
              <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${dark ? "text-gold" : "text-purple-700"}`}>
                {day.subtitle}
              </p>
              <h3 className={`font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${dark ? "text-white" : "text-ink"}`}>
                Day {day.n}: {day.title}
              </h3>
              {!comingSoon && (
                <p className={`font-display mt-3 text-lg font-semibold ${dark ? "text-gold" : "text-purple-700"}`}>
                  “{day.headline}”
                </p>
              )}
            </Reveal>
            {comingSoon ? (
              <div className="mt-6 rounded-cardlg border border-white/20 bg-white/10 p-6">
                <div className="shimmer h-40 rounded-card" aria-hidden="true" />
                <p className={`mt-4 text-base leading-relaxed ${dark ? "text-white/85" : "text-ink/75"}`}>
                  {day.teaser}
                </p>
                <p className="mt-2 text-sm text-gold font-semibold">Coming soon — check back after the final session.</p>
              </div>
            ) : (
              <Stagger className="mt-6 space-y-3" gap={0.07}>
                {day.takeaways.map((t, i) => (
                  <StaggerItem key={i}>
                    <div
                      className={`flex gap-3 rounded-card border p-4 text-sm leading-relaxed sm:text-[15px] ${
                        dark
                          ? "border-white/15 bg-white/10 text-white/90"
                          : "border-ink/10 bg-paper text-ink/80 shadow-soft"
                      }`}
                    >
                      <span
                        className={`font-display mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          dark ? "bg-gold text-ink" : "bg-purple-700 text-white"
                        }`}
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <span>{t}</span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
          <div className="lg:pt-24">
            {!comingSoon &&
              (mediaComingSoon ? (
                <div
                  className={`rounded-cardlg border border-dashed p-8 text-center ${
                    dark ? "border-white/30 bg-white/5" : "border-purple-500/40 bg-lavender-100/60"
                  }`}
                >
                  <div className={`font-display text-lg font-bold ${dark ? "text-white" : "text-purple-900"}`}>
                    Photos and videos coming soon
                  </div>
                  <p className={`mx-auto mt-2 max-w-sm text-sm ${dark ? "text-white/70" : "text-ink/60"}`}>
                    The lessons for Day {day.n} are ready above — media will appear here automatically once added.
                  </p>
                </div>
              ) : (
                <MediaModule dayKey={day.mediaKey} dayNum={day.n} images={media.images} videos={media.videos} />
              ))}
            {comingSoon && (
              <div className={`rounded-cardlg border p-6 text-sm ${dark ? "border-white/15 bg-white/5 text-white/70" : "border-ink/10 bg-paper text-ink/60"}`}>
                Day {day.n} media will appear here automatically — just add files and rebuild. No code changes needed.
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
