import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";
import { Reveal } from "../components/Reveal";
import PageHeader from "../components/PageHeader";
import { DocSpotlight } from "../components/Documentary";
import { event } from "../config/event";
import { lecturer } from "../config/people-content";
import { days } from "../data/days";
import { marthaPortrait, otherLecturerPhotos } from "../utils/media";

function MarthaAvatar() {
  return (
    <div
      className="flex aspect-[4/5] w-full items-center justify-center bg-purple-700"
      aria-hidden="true"
    >
      <span className="font-display text-7xl font-bold text-gold">ME</span>
    </div>
  );
}

export default function Lecturer() {
  usePageMeta(
    event.lecturer.pageTitle,
    `${lecturer.seminarRole} · MEO AI Academy — ${lecturer.tagline}`
  );
  const L = event.lecturer;
  const portrait = marthaPortrait();
  const photos = otherLecturerPhotos();
  const bio = Array.isArray(lecturer.bio) ? lecturer.bio.filter(Boolean) : [];

  return (
    <>
      <PageHeader kicker={lecturer.seminarRole} title={L.pageTitle} intro={`MEO AI Academy — “${lecturer.tagline}”`} dark />
      <div className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Hero: Martha's portrait ONLY. Other lecturer photos keep their
              existing spotlight below, unchanged. */}
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
            <Reveal>
              <div className="overflow-hidden rounded-cardlg border border-purple-500/25 shadow-lift">
                {portrait.found ? (
                  <img
                    src={portrait.src}
                    srcSet={portrait.srcSet}
                    sizes="(max-width: 1023px) 100vw, 480px"
                    alt={`Portrait of ${lecturer.name}`}
                    loading="eager"
                    decoding="async"
                    className="aspect-[4/5] w-full object-cover"
                    style={{ objectPosition: "50% 20%" }}
                  />
                ) : (
                  <MarthaAvatar />
                )}
              </div>
            </Reveal>
            <div>
              <Reveal>
                <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
                  {lecturer.name}
                </h2>
                <p className="mt-2 text-base font-semibold text-ink">{lecturer.role}</p>
                <p className="mt-1 text-sm font-medium text-purple-700">{lecturer.seminarRole}</p>
                <blockquote className="mt-4 border-l-4 border-gold pl-4 font-display text-lg font-medium italic text-ink/85">
                  “{lecturer.tagline}”
                </blockquote>
              </Reveal>
              {bio.map((para, i) => (
                <Reveal key={i}>
                  <p className="mt-4 text-base leading-relaxed text-ink/75">{para}</p>
                </Reveal>
              ))}
              <Reveal>
                <div className="mt-6 rounded-card border border-ink/10 bg-paper p-5">
                  <h3 className="font-display text-lg font-bold text-ink">About MEO AI Academy</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink/75">
                    MEO AI Academy was founded by {lecturer.name}, who led this
                    seminar as its Lead Facilitator. The academy&apos;s guiding
                    line is “{lecturer.tagline}”
                    {lecturer.academy ? ` ${lecturer.academy}` : ""}
                  </p>
                </div>
              </Reveal>
              {Array.isArray(L.credentials) && L.credentials.length > 0 && (
                <Reveal>
                  <h3 className="font-display mt-6 text-lg font-bold text-ink">Credentials</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-ink/75">
                    {L.credentials.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </Reveal>
              )}
              {L.link && (
                <Reveal>
                  <a
                    href={L.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-purple-700 px-8 text-sm font-bold text-white"
                  >
                    Visit {L.brand} →
                  </a>
                </Reveal>
              )}
            </div>
          </div>

          {photos.length > 0 && (
            <div className="mt-12">
              <Reveal>
                <h2 className="font-display text-2xl font-bold text-ink">In the room</h2>
              </Reveal>
              <div className="mt-4">
                <DocSpotlight images={photos} label="Lecturer" />
              </div>
            </div>
          )}

          <Reveal>
            <h2 className="font-display mt-14 text-2xl font-bold text-ink">What was taught</h2>
            <p className="mt-1 text-sm text-ink/60">Five days, from foundations to finished content.</p>
          </Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {days.map((d, i) => (
              <Reveal key={d.n} delay={i * 0.05}>
                <Link
                  to={`/day/${d.n}`}
                  className="block h-full rounded-card border border-ink/10 bg-paper p-4 shadow-soft transition-transform hover:-translate-y-1"
                >
                  <div className="font-display text-3xl font-bold text-purple-700/25">
                    {String(d.n).padStart(2, "0")}
                  </div>
                  <div className="font-display mt-1 text-sm font-bold text-ink">{d.title}</div>
                  {d.status !== "coming-soon" && (
                    <div className="mt-1 text-xs font-medium text-purple-700">“{d.headline}”</div>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
