import { Link } from "react-router-dom";
import { event } from "../config/event";
import { organizerCredit } from "../utils/placeholders";

const PAGE_LINKS = [
  { to: "/intro", label: "Intro", group: "Journey" },
  { to: "/", label: "Home", group: "Journey" },
  { to: "/day/1", label: "Day 1", group: "Journey" },
  { to: "/day/2", label: "Day 2", group: "Journey" },
  { to: "/day/3", label: "Day 3", group: "Journey" },
  { to: "/day/4", label: "Day 4", group: "Journey" },
  { to: "/day/5", label: "Day 5", group: "Journey" },
  { to: "/activities", label: "Activities", group: "Moments" },
  { to: "/break-time", label: "Break Time", group: "Moments" },
  { to: "/gallery", label: "Gallery", group: "Moments" },
  { to: "/organizers", label: "Organizers", group: "People" },
  { to: "/lecturer", label: "Lecturer", group: "People" },
  { to: "/testimonials", label: "Testimonials", group: "People" },
  { to: "/build-yours", label: "Build Yours", group: "People" },
];

const FOOTER_GROUPS = ["Journey", "Moments", "People"];

export default function Footer() {
  const year = new Date().getFullYear();
  const commissioned = event.credit?.mode === "commissioned";
  // pb-20 on small screens: the fixed music pill must not cover the footer links.
  return (
    <footer className="dark-glow grain relative bg-purple-900 py-12 pb-20 text-white sm:pb-12" aria-label="Footer">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <Link to="/" className="font-display text-lg font-bold">
              Seminar<span className="text-gold"> Recap</span>
            </Link>
            <p className="mt-2 text-sm text-white/70">{organizerCredit(event)}</p>
            <p className="mt-1 text-sm text-white/70">
              Taught by {event.lecturer.name} · {event.lecturer.brand}
            </p>
            <p className="mt-3 text-sm text-white/70">
              {event.builder.name} ·{" "}
              <a href={event.builder.site} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                {event.builder.site.replace("https://", "")}
              </a>{" "}
              ·{" "}
              <a href={`mailto:${event.builder.email}`} className="underline underline-offset-4">
                {event.builder.email}
              </a>
            </p>
          </div>
          <nav aria-label="Footer" className="flex gap-8 sm:gap-10">
            {FOOTER_GROUPS.map((g) => (
              <div key={g}>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-gold/80">{g}</div>
                <ul className="mt-1">
                  {PAGE_LINKS.filter((l) => l.group === g).map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="inline-flex min-h-[44px] items-center text-sm text-white/75 hover:text-gold"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-8 border-t border-white/15 pt-6 text-xs leading-relaxed text-white/60">
          <p>© {year} {event.builder.name}. All rights reserved.</p>
          <p className="mt-1">
            Seminar content and teaching materials belong to {event.lecturer.brand} and their respective
            owners.{" "}
            {commissioned
              ? `Built by ${event.builder.name} at the request of ${event.credit.commissionedBy}.`
              : "This is an independent recap."}
          </p>
          {!commissioned && (
            <p className="mt-1">
              Independent recap by {event.builder.name}. Not affiliated with or endorsed by{" "}
              {event.organizers.lead.short}, {event.organizers.collaborator.name},{" "}
              {event.lecturer.brand} or any sponsor.
            </p>
          )}
          <Link
            to="/intro"
            className="mt-3 inline-flex min-h-[44px] items-center text-xs font-semibold text-white/60 underline underline-offset-4 hover:text-gold"
          >
            ↺ Replay intro
          </Link>
        </div>
      </div>
    </footer>
  );
}
