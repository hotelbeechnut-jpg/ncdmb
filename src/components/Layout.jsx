import { useEffect, useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import { Suspense } from "react";
import Lenis from "lenis";
import Nav, { ScrollProgress } from "../components/Nav";
import Footer from "../components/Footer";
import WhatsAppFloat from "../components/WhatsAppFloat";
import RouteErrorBoundary from "../components/RouteErrorBoundary";
import { AmbientMusicToggle } from "../components/AmbientMusic";

// Scroll to top on route change; restore position on back navigation.
// Lenis owns the scroll loop, so programmatic jumps go through the live
// Lenis instance (window.scrollTo alone is fought by Lenis on touch
// devices and leaves the new page opened at the old page's offset —
// which also strands every whileInView Reveal at opacity 0).
// Storage access is wrapped in try/catch — the site works fully without it.
function lenisNow() {
  try {
    return window.__recapLenis ?? null;
  } catch {
    return null;
  }
}

function jumpTo(y) {
  const lenis = lenisNow();
  if (lenis && typeof lenis.scrollTo === "function") {
    try {
      lenis.resize();
    } catch {
      // older Lenis without resize — ignore, scrollTo still works
    }
    try {
      lenis.scrollTo(y, { immediate: true, force: true });
    } catch {
      try {
        lenis.scrollTo(y, { immediate: true });
      } catch {
        // fall through to window fallback below
      }
    }
  }
  window.scrollTo(0, y);
  // Belt and braces when no Lenis instance exists yet.
  try {
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
  } catch {
    // ignore
  }
}

function ScrollManager() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();

  // Runs after the new route's DOM has mounted (layout effect) and again on
  // the next frame (after first paint), so the jump can never fire before
  // the content exists. Hash links (#section) scroll to their target;
  // everything else resets to top (or restores on Back).
  useLayoutEffect(() => {
    let raf = 0;
    let t = 0;
    const apply = () => {
      const lenis = lenisNow();
      try {
        lenis?.resize();
      } catch {
        // ignore
      }
      if (hash) {
        const target =
          document.getElementById(hash.replace(/^#/, "")) ??
          document.querySelector(hash);
        if (target) {
          if (lenis && typeof lenis.scrollTo === "function") {
            try {
              lenis.scrollTo(target, { immediate: true });
            } catch {
              target.scrollIntoView();
            }
          } else {
            target.scrollIntoView();
          }
          return;
        }
      }
      if (navType === "POP") {
        let y = 0;
        try {
          y = Number(sessionStorage.getItem(`recap-scroll:${pathname}`)) || 0;
        } catch {
          y = 0;
        }
        jumpTo(y);
      } else {
        jumpTo(0);
      }
    };
    apply();
    raf = requestAnimationFrame(() => {
      apply();
      // Layout/images settle after paint — measure once more so the
      // scrollbar and Lenis limits match the real page height.
      t = setTimeout(() => {
        try {
          lenisNow()?.resize();
        } catch {
          // ignore
        }
      }, 350);
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [pathname, hash, navType]);

  useEffect(() => {
    const save = () => {
      try {
        sessionStorage.setItem(`recap-scroll:${window.location.pathname}`, String(window.scrollY));
      } catch {
        // storage unavailable — ignore
      }
    };
    window.addEventListener("pagehide", save);
    return () => window.removeEventListener("pagehide", save);
  }, []);

  return null;
}

function PageFallback() {
  // Instant first paint while a lazy route chunk loads: title-shaped
  // skeleton + text lines, no images, no waiting on an exit animation.
  return (
    <div className="bg-white pt-28 sm:pt-32" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-4 w-24 rounded-full bg-lavender-100" />
        <div className="mt-3 h-10 w-3/4 rounded-card bg-lavender-100" />
        <div className="mt-2 h-10 w-1/2 rounded-card bg-lavender-100" />
        <div className="mt-4 h-4 w-2/3 rounded-full bg-paper" />
      </div>
      <div className="mt-8 flex min-h-[30vh] items-center justify-center text-sm text-ink/40">
        Loading…
      </div>
    </div>
  );
}

export default function Layout() {
  const location = useLocation();

  // Dev-only route-mount diagnostic (stripped from production builds):
  // pathname, <main> count, wrapper opacity after 600ms, scrollY.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const t = setTimeout(() => {
      try {
        const mains = document.querySelectorAll("main");
        const wrapper = document.querySelector("main[data-route-wrapper]");
        const opacity = wrapper ? getComputedStyle(wrapper).opacity : "(no wrapper)";
        console.info(
          `[recap] route mount: ${location.pathname} | mains=${mains.length} | wrapper opacity=${opacity} | scrollY=${Math.round(window.scrollY)}`
        );
        if (mains.length > 1) {
          console.warn(`[recap] ${mains.length} <main> elements in DOM after route change — expected exactly 1.`);
        }
        if (wrapper && Number(opacity) < 1) {
          console.warn(`[recap] route wrapper opacity ${opacity} (< 1) 600ms after mount on ${location.pathname}.`);
        }
      } catch {
        // diagnostics must never throw
      }
    }, 600);
    return () => clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    // No smooth-scroll loop under reduced motion (and no animation at all —
    // the CSS class below also disables itself via media query).
    let prefersReduced = false;
    try {
      prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      prefersReduced = false;
    }
    if (prefersReduced) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoResize: true });
    try {
      window.__recapLenis = lenis;
    } catch {
      // ignore — ScrollManager falls back to window.scrollTo
    }
    const onResize = () => {
      try {
        lenis.resize();
      } catch {
        // ignore
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      lenis.destroy();
      try {
        if (window.__recapLenis === lenis) window.__recapLenis = null;
      } catch {
        // ignore
      }
    };
  }, []);

  const page = (
    <Suspense fallback={<PageFallback />}>
      {/* Keyed by route: a failure on one page never poisons the next
          navigation, and every route error is caught + logged here instead
          of white-screening the app. */}
      <RouteErrorBoundary key={location.pathname} route={location.pathname}>
        <Outlet />
      </RouteErrorBoundary>
    </Suspense>
  );

  return (
    <div className="min-h-screen bg-white font-body text-ink">
      <ScrollProgress />
      <ScrollManager />
      <Nav />
      {/* Plain keyed <main>: exactly one ever exists (no AnimatePresence, no
          exit twin), and the CSS fade can never strand the page at opacity 0
          — `both` fill mode ends at 1 even if frames are dropped, and the
          reduced-motion query removes the animation entirely. */}
      <main key={location.pathname} data-route-wrapper className="route-enter">
        {page}
      </main>
      <Footer />
      <WhatsAppFloat />
      <AmbientMusicToggle />
    </div>
  );
}
