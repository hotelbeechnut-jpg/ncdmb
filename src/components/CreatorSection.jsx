import { useRef, useState } from "react";
import { Reveal } from "./Reveal";
import { creator, hasRealPhone, hasRealWhatsapp } from "../config/people-content";
import { buildMedia } from "../utils/media";
import { whatsappLink } from "../utils/placeholders";

function CreatorAvatar() {
  return (
    <div
      className="flex aspect-[4/5] w-full items-center justify-center bg-purple-700"
      aria-hidden="true"
    >
      <span className="font-display text-7xl font-bold text-gold">NO</span>
    </div>
  );
}

function CreatorVideo({ video }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const play = () => {
    setPlaying(true);
    // Real user tap: allowed to play with sound. Ducking + exact restore
    // are handled by the existing document-level media listeners.
    requestAnimationFrame(() => {
      try {
        videoRef.current?.play()?.catch(() => setPlaying(false));
      } catch {
        setPlaying(false);
      }
    });
  };

  return (
    <figure className="overflow-hidden rounded-cardlg border border-ink/10 bg-ink shadow-soft">
      <div className="relative aspect-video w-full bg-black">
        {playing ? (
          <video
            ref={videoRef}
            src={video.src}
            poster={video.poster || undefined}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full"
            aria-label={creator.videoCaption}
          />
        ) : (
          <button
            onClick={play}
            className="group relative block h-full w-full"
            aria-label={`Play video: ${creator.videoCaption}`}
          >
            {video.poster ? (
              <img
                src={video.poster}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-purple-900" aria-hidden="true" />
            )}
            <span
              className="absolute inset-0 flex items-center justify-center bg-ink/30 transition group-hover:bg-ink/20"
              aria-hidden="true"
            >
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold text-2xl text-ink shadow-lift">
                ▶
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="p-4 text-sm font-medium text-white/80">
        {creator.videoCaption}
      </figcaption>
    </figure>
  );
}

// "Meet the creator" — portrait, first-person write-up, intro video and
// contact card. Phone/WhatsApp render only when real numbers are configured.
export default function CreatorSection() {
  const { image, video } = buildMedia();
  const showPhone = hasRealPhone();
  const showWhatsapp = hasRealWhatsapp();
  const wa = showWhatsapp ? whatsappLink(creator.whatsapp, creator.whatsappMessage) : "";

  return (
    <section className="bg-white py-10 sm:py-14" aria-labelledby="creator-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">
            Meet the creator
          </p>
          <h2
            id="creator-h"
            className="font-display mt-2 font-bold tracking-tight text-ink"
            style={{ fontSize: "clamp(1.6rem, 5vw, 2.5rem)" }}
          >
            {creator.heading}
          </h2>
        </Reveal>
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]">
          <Reveal>
            <div className="overflow-hidden rounded-cardlg border border-purple-500/25 shadow-lift">
              {image ? (
                <img
                  src={image.src}
                  srcSet={image.srcSet}
                  sizes="(max-width: 1023px) 100vw, 420px"
                  alt={image.alt}
                  loading="eager"
                  decoding="async"
                  width={image.w}
                  height={image.h}
                  className="aspect-[4/5] w-full object-cover"
                  style={{ objectPosition: `${image.fx ?? 50}% ${image.fy ?? 20}%` }}
                />
              ) : (
                <CreatorAvatar />
              )}
            </div>
          </Reveal>
          <div>
            {creator.intro.map((para, i) => (
              <Reveal key={i}>
                <p className="text-base leading-relaxed text-ink/75 sm:text-lg">{para}</p>
              </Reveal>
            ))}
            {video && video.src ? (
              <Reveal delay={0.08}>
                <div className="mt-6">
                  <CreatorVideo video={video} />
                </div>
              </Reveal>
            ) : null}
          </div>
        </div>
        <Reveal delay={0.05}>
          <div className="mt-8 rounded-cardlg border border-ink/10 bg-paper p-6 shadow-soft sm:p-8">
            <h3 className="font-display text-xl font-bold text-ink">{creator.name}</h3>
            <p className="mt-1 text-sm font-medium text-ink/65">
              {creator.role} · {creator.location}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {showPhone && (
                <a
                  href={`tel:${creator.phoneTel || creator.phone}`}
                  className="inline-flex min-h-[52px] flex-col items-start justify-center rounded-card bg-purple-700 px-5 py-3 text-white shadow-soft"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Call</span>
                  <span className="text-base font-bold">{creator.phoneDisplay || creator.phone}</span>
                </a>
              )}
              {showWhatsapp && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-card bg-[#25D366] px-5 text-base font-bold text-white shadow-soft"
                >
                  WhatsApp me
                </a>
              )}
              <a
                href={`mailto:${creator.email}`}
                className="inline-flex min-h-[52px] items-center justify-center rounded-card border border-ink/15 bg-white px-5 text-base font-bold text-ink"
              >
                {creator.email}
              </a>
              <a
                href={creator.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] items-center justify-center rounded-card border border-purple-700/30 bg-white px-5 text-base font-bold text-purple-700"
              >
                {creator.website.replace("https://", "")}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
