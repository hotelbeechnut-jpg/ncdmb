import { Link } from "react-router-dom";
import { Reveal } from "./Reveal";
import { lecturer } from "../config/people-content";
import { marthaPortrait } from "../utils/media";
import { prefetchProps } from "../utils/prefetch";

function InitialsAvatar() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-purple-700"
      aria-hidden="true"
    >
      <span className="font-display text-7xl font-bold text-gold">ME</span>
    </div>
  );
}

// Bold "Meet your facilitator" band: Martha only. Sits directly under the
// hero, before the journey cards and any gallery image.
export default function FacilitatorBand() {
  const portrait = marthaPortrait();
  const bio = Array.isArray(lecturer.bio) ? lecturer.bio.filter(Boolean) : [];

  return (
    <section className="bg-white py-14 sm:py-20" aria-labelledby="facilitator-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="overflow-hidden rounded-cardlg border border-purple-500/25 bg-lavender-100/60 shadow-soft">
            <div className="grid gap-0 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="relative min-h-[300px] bg-purple-900 sm:min-h-[380px] md:min-h-full">
                {portrait.found ? (
                  <img
                    src={portrait.src}
                    srcSet={portrait.srcSet}
                    sizes="(max-width: 767px) 100vw, 480px"
                    alt={`Portrait of ${lecturer.name}`}
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: "50% 20%" }}
                  />
                ) : (
                  <div className="absolute inset-0">
                    <InitialsAvatar />
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-10">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">
                  Meet your facilitator
                </p>
                <h2
                  id="facilitator-h"
                  className="font-display mt-2 font-bold tracking-tight text-ink"
                  style={{ fontSize: "clamp(1.9rem, 6vw, 3rem)", lineHeight: 1.05 }}
                >
                  {lecturer.name}
                </h2>
                <p className="mt-2 text-base font-semibold text-ink">{lecturer.role}</p>
                <p className="mt-1 text-sm font-medium text-purple-700">{lecturer.seminarRole}</p>
                <blockquote className="mt-4 border-l-4 border-gold pl-4 font-display text-lg font-medium italic leading-relaxed text-ink/85">
                  “{lecturer.tagline}”
                </blockquote>
                {bio.map((para, i) => (
                  <p key={i} className="mt-3 text-[15px] leading-relaxed text-ink/75">
                    {para}
                  </p>
                ))}
                <p className="mt-5 text-sm font-semibold text-ink/70">
                  This recap is dedicated to Martha Edword-Ohre, founder of MEO AI Academy.
                </p>
                <Link
                  to="/lecturer"
                  {...prefetchProps("/lecturer")}
                  className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-purple-700 px-8 text-base font-bold text-white shadow-soft transition-transform hover:scale-[1.02]"
                >
                  Meet Martha →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
