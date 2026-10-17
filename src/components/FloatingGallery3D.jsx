import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { useLowEnd } from "../hooks/useDevice";

function Card({ item, style, eager }) {
  const src = item.srcset?.["480"] ?? item.srcset?.["960"];
  if (!src) return null;
  return (
    <motion.div
      className="absolute overflow-hidden rounded-card border border-white/40 bg-white shadow-lift"
      style={style}
      animate={undefined}
    >
      <img
        src={`/${src}`}
        srcSet={Object.entries(item.srcset || {}).map(([w, p]) => `/${p} ${w}w`).join(", ")}
        sizes="(max-width: 768px) 40vw, 220px"
        alt={`Seminar photo`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover"
        style={{ background: `url(${item.blur}) center / cover` }}
      />
    </motion.div>
  );
}

// Hero floating gallery: 7-9 cards at different depths, slow drift + pointer tilt (desktop).
export default function FloatingGallery3D({ images }) {
  const reduce = useReducedMotion();
  const lowEnd = useLowEnd();
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 20 });
  const sry = useSpring(ry, { stiffness: 120, damping: 20 });

  const count = lowEnd ? 5 : Math.min(9, Math.max(0, images.length));
  const picked = images.slice(0, count);

  // Precomputed scattered positions (deterministic, % based).
  // center: cards over the middle of the hero are hidden below 640px so the
  // title/subtitle stay clear at 360/390px (text paints above the cards, but
  // photos behind small text hurt legibility).
  const spots = [
    { left: "4%", top: "12%", w: 150, z: 60, r: -8, d: 7, center: false },
    { left: "18%", top: "52%", w: 180, z: 120, r: 6, d: 8, center: false },
    { left: "38%", top: "8%", w: 130, z: 30, r: 4, d: 6, center: true },
    { left: "55%", top: "48%", w: 200, z: 140, r: -5, d: 9, center: false },
    { left: "72%", top: "10%", w: 160, z: 80, r: 7, d: 7.5, center: false },
    { left: "84%", top: "55%", w: 140, z: 40, r: -6, d: 8.5, center: false },
    { left: "30%", top: "68%", w: 150, z: 90, r: 3, d: 6.5, center: false },
    { left: "62%", top: "72%", w: 170, z: 50, r: -4, d: 9.5, center: false },
    { left: "46%", top: "32%", w: 190, z: 160, r: 2, d: 10, center: true },
  ];

  const onMove = (e) => {
    if (reduce || lowEnd) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 10);
    rx.set(-py * 10);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  if (picked.length === 0) return null;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
      style={{ perspective: "1200px" }}
    >
      <motion.div className="absolute inset-0" style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}>
        {picked.map((img, i) => {
          const s = spots[i % spots.length];
          const inner = (
            <div
              className="h-full w-full"
              style={{
                width: s.w,
                height: Math.round(s.w * 1.25),
                transform: `translateZ(${s.z}px) rotate(${s.r}deg)`,
              }}
            >
              <img
                src={`/${img.srcset?.["480"] ?? img.srcset?.["960"]}`}
                srcSet={Object.entries(img.srcset || {}).map(([w, p]) => `/${p} ${w}w`).join(", ")}
                sizes="200px"
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full rounded-card border border-white/50 object-cover opacity-90 shadow-lift"
                style={{ objectPosition: `${img.fx ?? 50}% ${img.fy ?? 25}%` }}
              />
            </div>
          );
          const hideOnMobile = s.center ? " max-sm:hidden" : "";
          if (reduce) {
            return (
              <div key={img.id} className={"absolute" + hideOnMobile} style={{ left: s.left, top: s.top }}>
                {inner}
              </div>
            );
          }
          return (
            <motion.div
              key={img.id}
              className={"absolute" + hideOnMobile}
              style={{ left: s.left, top: s.top }}
              animate={{ y: [0, -12, 0], x: [0, 6, 0] }}
              transition={{ duration: s.d, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            >
              {inner}
            </motion.div>
          );
        })}
      </motion.div>
      {/* soft bottom fade into page */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}
