// Route-chunk prefetch: warms a lazy route's JS on menu hover / touch so the
// chunk is already cached when the visitor taps. Dynamic imports are cached
// by the bundler runtime, so repeated calls are free. Never prefetches media.
const warmers = {
  home: () => import("../pages/Home"),
  intro: () => import("../pages/Intro"),
  day: () => import("../pages/DayPage"),
  organizers: () => import("../pages/Organizers"),
  lecturer: () => import("../pages/Lecturer"),
  testimonials: () => import("../pages/Testimonials"),
  gallery: () => import("../pages/GalleryPage"),
  "break-time": () => import("../pages/BreakTime"),
  activities: () => import("../pages/Activities"),
  "build-yours": () => import("../pages/BuildYours"),
};

function keyFor(to) {
  if (!to || to === "/") return "home";
  const m = String(to).match(/^\/day\/\d+/);
  if (m) return "day";
  const key = String(to).replace(/^\//, "").split("/")[0];
  return warmers[key] ? key : null;
}

export function prefetchRoute(to) {
  try {
    const key = keyFor(to);
    if (!key) return;
    const p = warmers[key]();
    // Swallow chunk-load failures: the real navigation will retry and show
    // the Suspense fallback if the network is truly down.
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {
    // prefetch is best-effort only
  }
}

// Props to spread onto a <Link>/<NavLink> for hover + touch warm-up.
export function prefetchProps(to) {
  const run = () => prefetchRoute(to);
  return { onMouseEnter: run, onTouchStart: run, onFocus: run };
}
