import { Link } from "react-router-dom";

// Shared header for inner pages: breadcrumb + title.
export default function PageHeader({ title, kicker, intro, dark = false }) {
  // `relative` anchors the .grain::after overlay so it never escapes this header.
  return (
    <div className={`pt-28 pb-8 sm:pt-32 ${dark ? "dark-glow grain relative text-white" : "bg-paper text-ink"}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb">
          <Link
            to="/"
            className={`inline-flex min-h-[44px] items-center text-sm font-medium ${
              dark ? "text-white/70 hover:text-gold" : "text-ink/60 hover:text-purple-700"
            }`}
          >
            ← Home
          </Link>
        </nav>
        {kicker && (
          <p
            className={`mt-2 text-xs font-semibold uppercase tracking-[0.25em] ${
              dark ? "text-gold" : "text-purple-700"
            }`}
          >
            {kicker}
          </p>
        )}
        <h1
          className={`font-display mt-2 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl ${
            dark ? "text-white" : "text-ink"
          }`}
          style={{ fontSize: "clamp(1.75rem, 7vw, 3rem)" }}
        >
          {title}
        </h1>
        {intro && (
          <p className={`mt-3 max-w-2xl text-base ${dark ? "text-white/75" : "text-ink/65"}`}>
            {intro}
          </p>
        )}
      </div>
    </div>
  );
}
