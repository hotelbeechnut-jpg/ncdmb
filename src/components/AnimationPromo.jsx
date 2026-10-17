import { useRef, useState } from "react";
import { Reveal } from "./Reveal";
import { buildAnimation } from "../utils/media";
import { creator, hasRealWhatsapp } from "../config/people-content";
import { whatsappLink } from "../utils/placeholders";

// Inscription shown under the animated short (the owner's wording).
const INSCRIPTION =
  "If you want to learn how to make short animated videos like this, click the link below.";
const WHATSAPP_MESSAGE =
  "Hello! I watched the animated video on your site and I'd like to learn how to make short animated videos like that.";

// Short animated movie: autoplays muted (browsers require that) with a
// tap-for-sound toggle, then the inscription and the WhatsApp link.
export default function AnimationPromo() {
  const video = buildAnimation();
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef(null);
  const showWhatsapp = hasRealWhatsapp();

  if (!video || !video.src) return null;

  const wa = showWhatsapp ? whatsappLink(creator.whatsapp, WHATSAPP_MESSAGE) : "";

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  return (
    <section className="bg-white py-10 sm:py-14" aria-labelledby="animation-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">
            Animated short
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <figure className="mt-4 overflow-hidden rounded-cardlg border border-ink/10 bg-ink shadow-lift">
            <div className="relative aspect-video w-full bg-black">
              <video
                ref={videoRef}
                src={video.src}
                poster={video.poster || undefined}
                autoPlay
                muted
                playsInline
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                className="h-full w-full"
                aria-label={`Short animated video by ${creator.name}`}
              />
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-pressed={!muted}
                  className="rounded-full bg-ink/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-ink/75"
                >
                  {muted ? "Tap for sound" : "Sound on"}
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="rounded-full bg-ink/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-ink/75"
                >
                  {playing ? "Pause" : "Play"}
                </button>
              </div>
            </div>
          </figure>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            id="animation-h"
            className="font-display mt-6 max-w-3xl text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl"
          >
            {INSCRIPTION}
          </h2>
          {showWhatsapp && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-card bg-[#25D366] px-6 text-base font-bold text-white shadow-soft"
            >
              Chat with me on WhatsApp
            </a>
          )}
        </Reveal>
      </div>
    </section>
  );
}
