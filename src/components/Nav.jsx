import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, useScroll, useSpring } from "motion/react";
import { event } from "../config/event";
import { days } from "../data/days";
import { prefetchProps, prefetchRoute } from "../utils/prefetch";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 20 });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[90] h-1 origin-left bg-gold"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

const linkCls = ({ isActive }) =>
  `inline-flex min-h-[44px] items-center rounded-full px-3 text-sm font-medium transition ${
    isActive ? "bg-lavender-100 text-purple-700" : "text-ink/75 hover:text-purple-700"
  }`;

const MOMENTS_LINKS = [
  { to: "/activities", label: "Activities" },
  { to: "/break-time", label: "Break Time" },
  { to: "/gallery", label: "Gallery" },
];

const PEOPLE_LINKS = [
  { to: "/organizers", label: "Organizers" },
  { to: "/lecturer", label: "Lecturer" },
  { to: "/testimonials", label: "Testimonials" },
];

// Desktop dropdown for a link group (Moments, People). Mobile uses sections.
function GroupMenu({ label, links, mobile = false, onNav }) {
  const [open, setOpen] = useState(false);
  if (mobile) return null; // mobile renders sections directly in the sheet
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 text-sm font-medium text-ink/75 hover:text-purple-700"
      >
        {label} <span aria-hidden="true" className="text-xs">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-2">
          <div className="overflow-hidden rounded-card border border-ink/10 bg-white p-2 shadow-lift">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => { setOpen(false); onNav?.(); }}
                {...prefetchProps(l.to)}
                className="flex min-h-[48px] items-center rounded-xl px-3 text-sm text-ink hover:bg-lavender-100"
              >
                <span className="font-medium">{l.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile grouped sheet: Journey / Moments / People sections + Build Yours.
function MobileSheet({ onNav }) {
  const [journeyOpen, setJourneyOpen] = useState(true);
  const sectionTitle = "px-4 pb-1 pt-3 text-xs font-bold uppercase tracking-[0.2em] text-ink/50";
  const rowCls =
    "flex min-h-[48px] items-center rounded-xl px-4 text-base font-medium text-ink hover:bg-lavender-100";
  return (
    <div>
      <div className={sectionTitle}>Start</div>
      <NavLink to="/intro" onClick={onNav} {...prefetchProps("/intro")} className={rowCls}>
        Intro
      </NavLink>
      <div className={sectionTitle}>Journey</div>
      <div className="rounded-xl border border-ink/10">
        <button
          onClick={() => setJourneyOpen((v) => !v)}
          aria-expanded={journeyOpen}
          className="flex min-h-[48px] w-full items-center justify-between rounded-xl px-4 text-base font-semibold text-ink"
        >
          Days 1–5
          <span aria-hidden="true">{journeyOpen ? "▴" : "▾"}</span>
        </button>
        {journeyOpen && (
          <div className="px-2 pb-2">
            {days.map((d) => (
              <Link
                key={d.n}
                to={`/day/${d.n}`}
                onClick={onNav}
                {...prefetchProps(`/day/${d.n}`)}
                className="flex min-h-[48px] items-center gap-3 rounded-xl px-4 text-base text-ink hover:bg-lavender-100"
              >
                <span className="font-display text-sm font-bold text-purple-700">
                  {String(d.n).padStart(2, "0")}
                </span>
                {d.title}
                {d.status === "coming-soon" && (
                  <span className="ml-auto rounded-full bg-lavender-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className={sectionTitle}>Moments</div>
      {MOMENTS_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to} onClick={onNav} {...prefetchProps(l.to)} className={rowCls}>
          {l.label}
        </NavLink>
      ))}
      <div className={sectionTitle}>People</div>
      {PEOPLE_LINKS.map((l) => (
        <NavLink key={l.to} to={l.to} onClick={onNav} {...prefetchProps(l.to)} className={rowCls}>
          {l.label}
        </NavLink>
      ))}
      <div className="px-4 py-3">
        <NavLink
          to="/build-yours"
          onClick={onNav}
          {...prefetchProps("/build-yours")}
          className="flex min-h-[52px] items-center justify-center rounded-full bg-gold text-base font-bold text-ink"
        >
          Build Yours
        </NavLink>
        <NavLink
          to="/intro"
          onClick={onNav}
          className="mt-1 flex min-h-[48px] w-full items-center justify-center rounded-full text-sm font-semibold text-ink/50"
        >
          ↺ Replay intro
        </NavLink>
      </div>
    </div>
  );
}
// Desktop dropdown for the Journey (Days 1-5). Mobile lists the days inside the grouped sheet.
function JourneyMenu({ onNav }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => prefetchRoute("/day/1")}
        onTouchStart={() => prefetchRoute("/day/1")}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 text-sm font-medium text-ink/75 hover:text-purple-700"
      >
        Journey <span aria-hidden="true" className="text-xs">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-2">
          <div className="overflow-hidden rounded-card border border-ink/10 bg-white p-2 shadow-lift">
            {days.map((d) => (
              <Link
                key={d.n}
                to={`/day/${d.n}`}
                onClick={() => { setOpen(false); onNav?.(); }}
                {...prefetchProps(`/day/${d.n}`)}
                className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm text-ink hover:bg-lavender-100"
              >
                <span className="font-display text-sm font-bold text-purple-700">
                  {String(d.n).padStart(2, "0")}
                </span>
                <span className="font-medium">{d.title}</span>
                {d.status === "coming-soon" && (
                  <span className="ml-auto rounded-full bg-lavender-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                    Soon
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile sheet on route change.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    // Always frosted: dark page headers (gallery, lecturer) and the light
    // hero alike — dark logo/links stay readable in every state.
    <header
      className="glass fixed inset-x-0 top-0 z-[80] border-b border-ink/10 shadow-soft"
      style={{ paddingTop: "env(safe-area-inset-top)", background: "rgba(255,255,255,0.85)" }}
    >
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
        aria-label="Primary"
      >
        <Link
          to="/"
          className="font-display text-sm font-bold tracking-tight text-ink sm:text-base"
        >
          Seminar<span className="text-purple-700"> Recap</span>
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" end className={linkCls} {...prefetchProps("/")}>
            Home
          </NavLink>
          <NavLink to="/intro" className={linkCls} {...prefetchProps("/intro")}>
            Intro
          </NavLink>
          <JourneyMenu />
          <GroupMenu label="Moments" links={MOMENTS_LINKS} />
          <GroupMenu label="People" links={PEOPLE_LINKS} />
          <NavLink
            to="/build-yours"
            {...prefetchProps("/build-yours")}
            className="ml-1 inline-flex min-h-[44px] items-center rounded-full bg-gold px-5 text-sm font-bold text-ink shadow-soft transition-transform hover:scale-[1.03] active:scale-95"
          >
            Build Yours
          </NavLink>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => navigate("/build-yours")}
            onTouchStart={() => prefetchRoute("/build-yours")}
            className="inline-flex min-h-[44px] items-center rounded-full bg-gold px-4 text-sm font-bold text-ink"
          >
            Build Yours
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white/80"
          >
            <span aria-hidden="true" className="text-xl leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </nav>
      {open && (
        <div className="glass mx-4 mb-3 max-h-[70vh] overflow-y-auto rounded-card border border-ink/10 p-2 shadow-lift lg:hidden">
          <NavLink
            to="/"
            end
            onClick={() => setOpen(false)}
            {...prefetchProps("/")}
            className="flex min-h-[48px] items-center rounded-xl px-4 text-base font-medium text-ink hover:bg-lavender-100"
          >
            Home
          </NavLink>
          <MobileSheet onNav={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}

