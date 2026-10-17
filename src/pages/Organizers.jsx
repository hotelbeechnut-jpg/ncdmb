import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { usePageMeta } from "../hooks/usePageMeta";
import { Reveal } from "../components/Reveal";
import PageHeader from "../components/PageHeader";
import { event } from "../config/event";
import { organizerCredit } from "../utils/placeholders";
import { peopleOf, pickSrc } from "../utils/media";

// Pointer tilt for portrait cards (transform only; static under reduced motion).
function Tilt({ children, className = "" }) {
  const reduce = useReducedMotion();
  const [t, setT] = useState({ x: 0, y: 0 });
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div
      className={className}
      style={{ perspective: "800px" }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setT({ x: -py * 10, y: px * 12 });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
    >
      <motion.div
        className="h-full"
        animate={{ rotateX: t.x, rotateY: t.y }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        whileTap={{ scale: 0.98 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function PersonCard({ person, index }) {
  return (
    <Tilt>
      <article className="h-full overflow-hidden rounded-cardlg border border-ink/10 bg-white shadow-soft">
        <div className="w-full overflow-hidden bg-lavender-100" style={{ aspectRatio: "3/4" }}>
          <img
            src={pickSrc(person.srcset, 800)}
            srcSet={Object.entries(person.srcset || {}).map(([w, p]) => `/${p} ${w}w`).join(", ")}
            sizes="(max-width: 640px) 50vw, 33vw"
            alt={person.provisional ? `Organizer portrait ${index + 1}` : `Portrait of ${person.name}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            style={{ objectPosition: `${person.fx ?? 50}% ${person.fy ?? 20}%` }}
          />
        </div>
        <div className="p-5">
          <h3 className="font-display font-bold text-ink">{person.name}</h3>
          {[person.title, person.org].filter(Boolean).length > 0 && (
            <p className="mt-1 text-sm text-ink/60">
              {[person.title, person.org].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </article>
    </Tilt>
  );
}

export default function Organizers() {
  usePageMeta("Meet the Organizers", organizerCredit(event));
  const { lead, collaborator } = event.organizers;
  const team = peopleOf("organizers");

  return (
    <>
      <PageHeader
        kicker="Meet the Organizers"
        title="With Gratitude"
        intro={organizerCredit(event)}
      />
      <div className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { org: lead },
              { org: collaborator },
            ].map(({ org }) => (
              <Reveal key={org.name}>
                <div className="h-full rounded-cardlg border border-ink/10 bg-paper p-6 shadow-soft sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">
                    {org.roleLabel}
                  </p>
                  <h2 className="font-display mt-2 text-2xl font-bold text-ink">{org.name}</h2>
                  {org.bio ? (
                    <p className="mt-3 text-[15px] leading-relaxed text-ink/70">{org.bio}</p>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <h2 className="font-display mt-12 text-2xl font-bold text-ink">The team</h2>
          </Reveal>
          {team.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {team.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 0.05}>
                  <PersonCard person={p} index={i} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="overflow-hidden rounded-cardlg border border-dashed border-purple-500/40 bg-lavender-100/50">
                    <div className="flex aspect-[3/4] w-full flex-col items-center justify-center p-6 text-center">
                      <span aria-hidden="true" className="text-5xl text-purple-700/25">◉</span>
                      <span className="mt-2 text-sm font-semibold text-purple-700">Photo coming soon</span>
                    </div>
                    <div className="bg-white p-5">
                      <div className="font-display font-bold text-ink/50">To be announced</div>
                      <p className="mt-1 text-sm text-ink/45">
                        Organizer profiles will appear here once supplied.
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal>
            <div className="dark-glow grain relative mt-12 rounded-cardlg p-6 text-center text-white sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Thank you</p>
              <p className="font-display mx-auto mt-3 max-w-2xl text-lg font-medium leading-relaxed sm:text-xl">
                {event.gratitude.message}
              </p>
              <Link
                to="/lecturer"
                className="mt-6 inline-flex min-h-[48px] items-center rounded-full border border-white/30 bg-white/10 px-8 text-sm font-semibold text-white"
              >
                Next: {event.lecturer.pageTitle} →
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
