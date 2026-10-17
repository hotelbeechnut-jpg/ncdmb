import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { event } from "./config/event";
import { logPlaceholderWarnings } from "./utils/placeholders";
import { readIntroSeen, writeIntroSeen } from "./utils/intro";
import { AmbientMusicProvider, clearMusicState } from "./components/AmbientMusic";
import Layout from "./components/Layout";

// Lazy chunks with one automatic recovery: a rejected chunk import (stale
// hashed asset after a redeploy, flaky network) used to unmount the whole
// app to a blank screen until a hard refresh. Now the first failure reloads
// once (fresh index.html + fresh hashes); a repeat failure falls through to
// the route error boundary, which shows Reload instead of blank.
function lazyWithRetry(importer) {
  return lazy(() =>
    importer().catch((err) => {
      try {
        if (!sessionStorage.getItem("recap-chunk-reload")) {
          sessionStorage.setItem("recap-chunk-reload", "1");
          window.location.reload();
        } else {
          sessionStorage.removeItem("recap-chunk-reload");
        }
      } catch {
        try {
          window.location.reload();
        } catch {
          // ignore — the boundary below still catches the rejection
        }
      }
      throw err;
    })
  );
}

const Home = lazyWithRetry(() => import("./pages/Home"));
const Intro = lazyWithRetry(() => import("./pages/Intro"));
const DayPage = lazyWithRetry(() => import("./pages/DayPage"));
const Organizers = lazyWithRetry(() => import("./pages/Organizers"));
const Lecturer = lazyWithRetry(() => import("./pages/Lecturer"));
const Testimonials = lazyWithRetry(() => import("./pages/Testimonials"));
const GalleryPage = lazyWithRetry(() => import("./pages/GalleryPage"));
const BreakTime = lazyWithRetry(() => import("./pages/BreakTime"));
const Activities = lazyWithRetry(() => import("./pages/Activities"));
const BuildYours = lazyWithRetry(() => import("./pages/BuildYours"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
// Dev-only route: the conditional keeps it out of the production route map
// (and out of every menu). The chunk may still be emitted but is unreferenced.
const FocusCheck = import.meta.env.DEV ? lazyWithRetry(() => import("./pages/FocusCheck")) : null;

// "/" renders Home, except the first "/" landing per session, which sends
// the visitor to /intro instead (replace, so Back never loops on the intro).
// Deep links (/day/3, /gallery, …) never touch this — only the index route.
// The memory guard covers storage-unavailable browsers (seen-flag can't
// persist there): at most one auto-redirect per page load, never a loop.
let introRedirectedOnce = false;
function HomeRoute() {
  const [firstVisit] = useState(() => {
    try {
      if (window.location.pathname !== "/") return false;
      if (readIntroSeen()) return false;
    } catch {
      // storage unavailable — fall through to the memory guard
    }
    if (introRedirectedOnce) return false;
    return window.location.pathname === "/";
  });
  useEffect(() => {
    if (firstVisit) {
      introRedirectedOnce = true;
      writeIntroSeen();
    }
  }, [firstVisit]);
  if (firstVisit) return <Navigate to="/intro" replace />;
  return <Home />;
}

// `?intro=1` on ANY url forces a visit to /intro and clears stored mute
// state. Runs on every location change; never fires on /intro itself.
function QueryGate() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    let forced = false;
    try {
      forced = new URLSearchParams(location.search).get("intro") === "1";
    } catch {
      forced = false;
    }
    if (!forced || location.pathname === "/intro") return;
    clearMusicState();
    navigate("/intro", { replace: true });
  }, [location.pathname, location.search, navigate]);
  return null;
}

export default function App() {
  useEffect(() => {
    logPlaceholderWarnings(event);
  }, []);

  return (
    <BrowserRouter>
      {/* Music lives above every route and outside all transitions, so it
          never unmounts or restarts on navigation. */}
      <AmbientMusicProvider>
        <QueryGate />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/intro" element={<Intro />} />
            <Route element={<Layout />}>
              <Route index element={<HomeRoute />} />
              <Route path="day/:n" element={<DayPage />} />
              <Route path="organizers" element={<Organizers />} />
              <Route path="lecturer" element={<Lecturer />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="break-time" element={<BreakTime />} />
              <Route path="activities" element={<Activities />} />
              <Route path="build-yours" element={<BuildYours />} />
              {FocusCheck ? <Route path="focus-check" element={<FocusCheck />} /> : null}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </AmbientMusicProvider>
    </BrowserRouter>
  );
}
