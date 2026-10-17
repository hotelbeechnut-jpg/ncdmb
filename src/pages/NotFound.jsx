import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";

export default function NotFound() {
  usePageMeta("Page not found", "This page does not exist.");
  return (
    <div className="bg-paper pt-32 pb-20 text-center">
      <div className="mx-auto max-w-md px-4">
        <div
          aria-hidden="true"
          className="font-display font-bold text-purple-700/15"
          style={{ fontSize: "clamp(5rem, 25vw, 9rem)", lineHeight: 1 }}
        >
          404
        </div>
        <h1 className="font-display mt-2 text-2xl font-bold text-ink">This page wandered off</h1>
        <p className="mt-2 text-[15px] text-ink/60">
          The link may be old, or the page may have moved. The recap is still here.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-purple-700 px-8 text-base font-bold text-white"
        >
          ← Back home
        </Link>
      </div>
    </div>
  );
}
