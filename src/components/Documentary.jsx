import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Reveal } from "./Reveal";
import { imgSrc, imgSrcSet } from "../utils/media";

// Split a day's images into a hero ribbon + one photo set per lesson scene.
// Deterministic: first `ribbonCount` images drift in the ribbon, the rest deal
// out round-robin so every scene gets photos when there are enough.
export function distributeImages(images, sceneCount, ribbonCount = 8) {
  const list = images || [];
  const ribbon = list.slice(0, ribbonCount);
  const rest = list.slice(ribbonCount);
  const scenes = Array.from({ length: sceneCount }, () => []);
  rest.forEach((img, i) => {
    scenes[i % sceneCount].push(img);
  });
  return { ribbon, scenes };
}

// Spotlight motion gallery: one image on stage, the rest outlined behind it.
// Auto-advances gently, pauses on hover or touch, fully manual when reduced motion is on.
// Pass `label` for non-day pools (e.g. lecturer portraits) to keep alt text honest.
export function DocSpotlight({ images, dayNum, label }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = images?.length ?? 0;

  const go = (dir) => setIndex((i) => (i + dir + n) % n);

  useEffect(() => {
    if (reduce || paused || n <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), 4200);
    return () => clearInterval(t);
  }, [reduce, paused, n]);

  if (n === 0) return null;
  const prev = images[(index - 1 + n) % n];
  const next = images[(index + 1) % n];
  const current = images[index];
  const ratio = current.w && current.h ? `${current.w} / ${current.h}` : undefined;
  const altFor = (i) => (label ? `${label} — photo ${i + 1}` : `Seminar photo, Day ${dayNum} — moment ${i + 1}`);

  const stageImg = (
    <img
      src={imgSrc(current, "960")}
      srcSet={imgSrcSet(current)}
      sizes="(max-width: 768px) 80vw, 640px"
      alt={altFor(index)}
      width={current.w}
      height={current.h}
      className="h-full w-full object-contain"
    />
  );

  const ghost = (im, side) => (
    <motion.img
      key={im.id}
      src={imgSrc(im)}
      alt=""
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.45 }}
      transition={{ duration: 0.5 }}
      className={`pointer-events-none absolute top-1/2 w-24 -translate-y-1/2 rounded-card border-2 border-white object-cover shadow-soft sm:w-40 ${
        side === "left" ? "left-0 -rotate-6" : "right-0 rotate-6"
      }`}
      style={{ aspectRatio: "3/4", objectPosition: `${im.fx ?? 50}% ${im.fy ?? 25}%` }}
    />
  );

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={label ?? `Day ${dayNum} highlights`}
    >
      <div className="relative mx-auto max-w-3xl" style={{ perspective: "1000px" }}>
        {ghost(prev, "left")}
        {ghost(next, "right")}
        <div
          className="relative z-10 mx-auto w-[76%] overflow-hidden rounded-cardlg border-4 border-white shadow-lift"
          style={{
            aspectRatio: ratio,
            maxHeight: "62vh",
            backgroundImage: current.blur ? `url(${current.blur})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {reduce ? (
            stageImg
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={current.id}
                className="h-full w-full"
                initial={{ opacity: 0, x: 60, scale: 1.03 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60, scale: 0.99 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {stageImg}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={() => go(-1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-lg shadow-soft"
          aria-label="Previous photo"
        >
          ←
        </button>
        <span className="text-sm font-semibold tabular-nums text-ink/60" aria-live="polite">
          {index + 1} / {n}
        </span>
        <button
          onClick={() => go(1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-lg shadow-soft"
          aria-label="Next photo"
        >
          →
        </button>
      </div>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:justify-center sm:overflow-visible sm:px-6">
        {images.map((im, i) => (
          <button
            key={im.id}
            onClick={() => setIndex(i)}
            aria-label={label ? `Show ${label} photo ${i + 1}` : `Show moment ${i + 1}`}
            aria-current={i === index}
            className={`h-14 w-14 shrink-0 overflow-hidden rounded-card border-2 transition ${
              i === index ? "border-gold ring-2 ring-gold/50" : "border-purple-700/20 opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={imgSrc(im)}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ objectPosition: `${im.fx ?? 50}% ${im.fy ?? 25}%` }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// One documentary figure with caption. The full photo is always shown —
// never center-cropped — inside a soft matte frame sized by the photo's
// real dimensions from the manifest (so no heads get cut and no layout shifts).
// Neutral captions only — never invent context.
export function DocFigure({ image, dayNum, moment, large = false }) {
  const reduce = useReducedMotion();
  const ratio = image.w && image.h ? `${image.w} / ${image.h}` : undefined;
  const img = (
    <img
      src={imgSrc(image, "960")}
      srcSet={imgSrcSet(image)}
      sizes={large ? "(max-width: 768px) 100vw, 640px" : "(max-width: 768px) 50vw, 300px"}
      alt={`Seminar photo, Day ${dayNum} — moment ${moment}`}
      loading="lazy"
      decoding="async"
      width={image.w}
      height={image.h}
      className="h-full w-full object-contain"
    />
  );
  return (
    <figure className="overflow-hidden rounded-cardlg border border-ink/10 bg-white shadow-soft">
      <div
        className="w-full"
        style={{
          aspectRatio: ratio,
          maxHeight: large ? "72vh" : "52vh",
          backgroundImage: image.blur ? `url(${image.blur})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {reduce ? (
          img
        ) : (
          <motion.div
            className="h-full w-full"
            initial={{ opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {img}
          </motion.div>
        )}
      </div>
      <figcaption className="px-4 py-2 text-xs font-medium tracking-wide text-ink/50">
        Day {dayNum} · Moment {moment}
      </figcaption>
    </figure>
  );
}

// One lesson scene: text full width on mobile, alternating side-by-side on desktop.
export function DocChapter({ index, title, body, points, images, moments = [], dayNum, flip }) {
  const sceneNo = String(index + 1).padStart(2, "0");
  const momentOf = (k) => moments[k] ?? `${index + 1}.${k + 1}`;
  return (
    <section className="mt-12 first:mt-8" aria-label={`Scene ${index + 1}: ${title}`}>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">
          Scene {sceneNo}
        </p>
        <h3 className="font-display mt-1 text-xl font-bold text-ink sm:text-2xl">{title}</h3>
      </Reveal>
      <div className="mt-4 grid items-start gap-5 md:grid-cols-2 md:gap-8">
        <Reveal className={flip ? "md:order-2" : ""}>
          <p className="text-base leading-relaxed text-ink/75">{body}</p>
          {points?.length > 0 && (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-ink/75">
              {points.map((p, j) => (
                <li key={j}>{p}</li>
              ))}
            </ul>
          )}
        </Reveal>
        {images?.length > 0 && (
          <div className={flip ? "md:order-1" : ""}>
            <DocFigure image={images[0]} dayNum={dayNum} moment={momentOf(0)} large />
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {images.slice(1, 3).map((im, k) => (
                  <DocFigure key={im.id} image={im} dayNum={dayNum} moment={momentOf(k + 1)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
