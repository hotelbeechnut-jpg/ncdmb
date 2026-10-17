import { useEffect, useMemo, useRef, useState } from "react";
import { usePageMeta } from "../hooks/usePageMeta";
import { Reveal } from "../components/Reveal";
import PageHeader from "../components/PageHeader";
import MediaGrid from "../components/MediaGrid";
import {
  activityCreators,
  activityPhotos,
  activityVideos,
  formatDuration,
  manifestCounts,
} from "../utils/media";

const INTRO =
  "The training was built around doing. These are the videos participants made during the class activities.";

const CREATOR_BATCH = 12;

function DurationBadge({ sec }) {
  if (!Number.isFinite(sec) || sec <= 0) return null;
  return (
    <span className="absolute bottom-2 right-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
      {formatDuration(sec)}
    </span>
  );
}

export default function Activities() {
  usePageMeta("Student Class Videos", "Videos participants made during the class activities.");

  const creators = useMemo(() => activityCreators(), []);
  const photos = useMemo(() => activityPhotos(), []);
  const [selected, setSelected] = useState(null); // creator key (null = "More class videos")
  const [current, setCurrent] = useState(0); // index within the selected creator's videos
  const [playing, setPlaying] = useState(false); // poster-first: tap to play
  const [visibleCreators, setVisibleCreators] = useState(CREATOR_BATCH);
  const theaterRef = useRef(null);
  const videoRef = useRef(null);

  const activeGroup = useMemo(
    () => creators.find((c) => c.key === selected) ?? creators[0] ?? null,
    [creators, selected]
  );
  const activeVideos = activeGroup?.videos ?? [];
  const currentVideo = activeVideos[current] ?? null;

  const totalVideos = useMemo(() => activityVideos().length, []);

  // Dev assertion: rendered videos must equal the manifest count.
  useEffect(() => {
    const mc = manifestCounts("activities");
    if (totalVideos !== mc.videos) {
      console.error(
        `[recap] Activities count mismatch: rendered ${totalVideos}, manifest ${mc.videos} (${mc.images} images + ${mc.videos} videos)`
      );
    }
  }, [totalVideos]);

  // One at a time: switching videos pauses the theater first.
  useEffect(() => {
    setPlaying(false);
    try {
      videoRef.current?.pause();
    } catch {
      // no video element yet — nothing to pause
    }
  }, [selected, current]);

  const openCreator = (key) => {
    setSelected(key);
    setCurrent(0);
    theaterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const step = (dir) => {
    if (activeVideos.length === 0) return;
    setCurrent((c) => (c + dir + activeVideos.length) % activeVideos.length);
  };

  return (
    <>
      <PageHeader kicker="Moments" title="Student Class Videos" intro="Made by the class, in class" />
      <div className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="max-w-3xl text-base leading-relaxed text-ink/75 sm:text-lg">{INTRO}</p>
            <p className="mt-3 text-sm font-semibold text-ink/60" aria-live="polite">
              {totalVideos === 0
                ? "Class videos are coming soon."
                : `${totalVideos} video${totalVideos === 1 ? "" : "s"} · ${creators.length} creator${creators.length === 1 ? "" : "s"}`}
            </p>
          </Reveal>

          {totalVideos === 0 ? (
            <Reveal delay={0.08}>
              <div className="mt-8 rounded-cardlg border border-dashed border-purple-500/40 bg-lavender-100/60 p-8 text-center sm:p-12">
                <div className="font-display text-lg font-bold text-purple-900">
                  Class videos are coming soon.
                </div>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
                  Videos participants make during the class activities will appear here automatically once added.
                </p>
              </div>
            </Reveal>
          ) : (
            <>
              {/* Video theater: poster-first, tap to play, one at a time, sound allowed */}
              <Reveal delay={0.05}>
                <div ref={theaterRef} className="mt-8 scroll-mt-24 overflow-hidden rounded-cardlg border border-ink/10 bg-ink text-white shadow-lift">
                  <div className="relative aspect-video w-full bg-black">
                    {currentVideo && (
                      playing ? (
                        <video
                          ref={videoRef}
                          key={currentVideo.id}
                          src={`/${currentVideo.src}`}
                          poster={currentVideo.poster ? `/${currentVideo.poster}` : undefined}
                          controls
                          playsInline
                          autoPlay
                          preload="metadata"
                          className="h-full w-full"
                          aria-label={currentVideo.alt}
                        />
                      ) : (
                        <button
                          onClick={() => setPlaying(true)}
                          className="group relative block h-full w-full"
                          aria-label={`Play ${activeGroup?.name} video ${current + 1} of ${activeVideos.length}`}
                        >
                          {currentVideo.poster ? (
                            <img
                              src={`/${currentVideo.poster}`}
                              alt=""
                              aria-hidden="true"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-purple-900" aria-hidden="true" />
                          )}
                          <span className="absolute inset-0 flex items-center justify-center bg-ink/30 transition group-hover:bg-ink/20" aria-hidden="true">
                            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold text-2xl text-ink shadow-lift">
                              ▶
                            </span>
                          </span>
                          <DurationBadge sec={currentVideo.duration} />
                        </button>
                      )
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="truncate font-display text-base font-bold">
                        {activeGroup?.name}
                        {activeGroup?.business ? ` · ${activeGroup.business}` : ""}
                      </div>
                      <div className="text-sm tabular-nums text-white/60" aria-live="polite">
                        {activeVideos.length > 0 ? `Video ${current + 1} of ${activeVideos.length}` : ""}
                      </div>
                    </div>
                    {activeVideos.length > 1 && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => step(-1)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg"
                          aria-label="Previous video"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => step(1)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg"
                          aria-label="Next video"
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </div>
                  {activeVideos.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto px-4 pb-4" role="listbox" aria-label={`${activeGroup?.name} videos`}>
                      {activeVideos.map((v, i) => (
                        <button
                          key={v.id}
                          role="option"
                          aria-selected={i === current}
                          onClick={() => setCurrent(i)}
                          className={`relative w-36 shrink-0 overflow-hidden rounded-card border-2 transition ${
                            i === current ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                          aria-label={`Video ${i + 1}${v.duration ? `, ${formatDuration(v.duration)}` : ""}`}
                        >
                          {v.poster ? (
                            <img src={`/${v.poster}`} alt="" aria-hidden="true" className="aspect-video w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="aspect-video w-full bg-purple-900" aria-hidden="true" />
                          )}
                          <DurationBadge sec={v.duration} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Creator cards */}
              <div className="mt-10">
                <h2 className="font-display text-xl font-bold text-ink">The creators</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {creators.slice(0, visibleCreators).map((c) => (
                    <Reveal key={c.key ?? "more"} y={16}>
                      <button
                        onClick={() => openCreator(c.key)}
                        aria-pressed={c.key === (activeGroup?.key ?? null)}
                        className={`block w-full overflow-hidden rounded-card border bg-white text-left shadow-soft transition hover:-translate-y-0.5 ${
                          c.key === (activeGroup?.key ?? null) ? "border-gold ring-2 ring-gold/40" : "border-ink/10"
                        }`}
                        aria-label={`Watch ${c.name}, ${c.videos.length} videos`}
                      >
                        <span className="relative block aspect-video w-full bg-purple-900">
                          {c.videos[0]?.poster ? (
                            <img
                              src={`/${c.videos[0].poster}`}
                              alt=""
                              aria-hidden="true"
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                          <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink/70 text-lg text-white">
                              ▶
                            </span>
                          </span>
                          <DurationBadge sec={c.videos[0]?.duration} />
                        </span>
                        <span className="block p-3">
                          <span className="block truncate font-display text-sm font-bold text-ink">{c.name}</span>
                          {c.business ? (
                            <span className="block truncate text-xs text-ink/60">{c.business}</span>
                          ) : null}
                          <span className="mt-0.5 block text-xs font-semibold text-purple-700">
                            {c.videos.length} video{c.videos.length === 1 ? "" : "s"}
                          </span>
                        </span>
                      </button>
                    </Reveal>
                  ))}
                </div>
                {visibleCreators < creators.length && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setVisibleCreators((v) => v + CREATOR_BATCH)}
                      className="inline-flex min-h-[48px] items-center rounded-full border border-purple-700/30 bg-white px-8 text-sm font-bold text-purple-700"
                    >
                      Load more ({creators.length - visibleCreators} remaining)
                    </button>
                  </div>
                )}
              </div>

              {/* Photo gallery appears only once photos exist */}
              {photos.length > 0 && (
                <div className="mt-12">
                  <h2 className="font-display text-xl font-bold text-ink">Class photos</h2>
                  <div className="mt-4">
                    <MediaGrid dayKey="activities" items={photos} pageSize={24} showCounts={false} />
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
}
