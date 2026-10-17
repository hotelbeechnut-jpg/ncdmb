import { useEffect, useState } from "react";
import DayChapter from "./DayChapter";
import { days } from "../data/days";
import { Reveal } from "./Reveal";

export default function Journey() {
  const [active, setActive] = useState(1);
  useEffect(() => {
    const onScroll = () => {
      let current = 1;
      for (const d of days) {
        const el = document.getElementById(`day-${d.n}`);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) current = d.n;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="journey" className="relative" aria-labelledby="journey-h">
      <div className="bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">The journey</p>
            <h2 id="journey-h" className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              The 5-day journey
            </h2>
            <p className="mt-2 max-w-2xl text-ink/60">
              Each day built on the last — scroll through the chapters.
            </p>
          </Reveal>
        </div>
      </div>
      {/* Day indicator dots (desktop sticky) */}
      <div
        className="sticky top-20 z-[60] hidden justify-center lg:flex"
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      >
        <div className="glass flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 shadow-soft" style={{ pointerEvents: "auto" }}>
          {days.map((d) => (
            <a
              key={d.n}
              href={`#day-${d.n}`}
              aria-label={`Go to Day ${d.n}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                active === d.n ? "bg-purple-700 text-white" : "text-ink/50 hover:bg-lavender-100"
              }`}
            >
              {d.n}
            </a>
          ))}
          <div className="ml-1 h-1 w-16 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${(active / days.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div>
        {days.map((d, i) => (
          <DayChapter key={d.n} day={d} dark={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}
