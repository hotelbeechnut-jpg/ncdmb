import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { dayItems } from "../utils/media";

const SECTIONS = ["day1", "day2", "day3", "day4", "day5", "break-time"];

function basenamesOf(item) {
  return Object.values(item.srcset || {}).map((r) => String(r).split("/").pop());
}

function Dot({ fx, fy, overridden }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ${
        overridden ? "bg-gold" : "bg-red-500"
      }`}
      style={{ left: `${fx}%`, top: `${fy}%` }}
    />
  );
}

// One image in the two fixed shapes that crop on the site: hero card (4/5
// box) and Day card thumb (short wide strip). Clicking on the face moves the
// focal point; the copy button exports every change as focus-overrides.json.
function CheckCard({ item, point, onPick }) {
  const fx = point?.x ?? item.fx ?? 50;
  const fy = point?.y ?? item.fy ?? 25;
  const overridden = !!point;
  const pick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - r.left) / r.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - r.top) / r.height) * 100)));
    onPick(item, x, y);
  };
  const src480 = item.srcset?.["480"] ?? Object.values(item.srcset || {})[0];
  if (!src480) return null;
  return (
    <div className="overflow-hidden rounded-card border border-ink/10 bg-white">
      <div className="px-2 pt-2 font-mono text-[11px] text-ink/60">
        {item.id} {overridden && <span className="font-bold text-purple-700">· overridden {fx}/{fy}</span>}
      </div>
      <div className="grid grid-cols-2 gap-2 p-2">
        <button onClick={pick} className="relative block aspect-[4/5] w-full overflow-hidden rounded bg-lavender-100" aria-label={`Set focal point for ${item.id} (hero shape)`}>
          <img src={`/${src480}`} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <Dot fx={fx} fy={fy} overridden={overridden} />
        </button>
        <button onClick={pick} className="relative block h-24 w-full overflow-hidden rounded bg-lavender-100" aria-label={`Set focal point for ${item.id} (day-card shape)`}>
          <img src={`/${src480}`} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          <Dot fx={fx} fy={fy} overridden={overridden} />
        </button>
      </div>
    </div>
  );
}

// Dev-only focal-point checker. No menu links here on purpose.
export default function FocusCheck() {
  const [changes, setChanges] = useState({}); // id -> { x, y, files: [...] }
  const [onlyOverridden, setOnlyOverridden] = useState(false);
  const [copied, setCopied] = useState(false);

  const groups = useMemo(
    () =>
      SECTIONS.map((key) => ({
        key,
        items: dayItems(key).filter((it) => it.kind === "image"),
      })),
    []
  );
  const total = groups.reduce((s, g) => s + g.items.length, 0);
  const changedCount = Object.keys(changes).length;

  const onPick = (item, x, y) => {
    setChanges((c) => ({ ...c, [item.id]: { x, y, files: basenamesOf(item) } }));
    setCopied(false);
  };

  const snippet = useMemo(() => {
    const obj = {};
    for (const { x, y, files } of Object.values(changes)) {
      for (const f of files) obj[f] = { x, y };
    }
    return obj;
  }, [changes]);

  const copy = async () => {
    const text = JSON.stringify(snippet, null, 2);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // clipboard unavailable — user can select manually
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
  };

  return (
    <>
      <PageHeader
        kicker="Dev tool"
        title="Focus check"
        intro="Every day + break-time image in the two cropping shapes. Red dot = computed focal point, gold = your override. Click a face to move it, then copy the snippet into src/data/focus-overrides.json and re-run the media pipeline."
      />
      <div className="bg-paper py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-ink/70">
              {total} images · {changedCount} overridden
            </span>
            <button
              onClick={() => setOnlyOverridden((v) => !v)}
              aria-pressed={onlyOverridden}
              className={`inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-bold ${
                onlyOverridden ? "bg-purple-700 text-white" : "border border-ink/15 bg-white text-ink"
              }`}
            >
              {onlyOverridden ? "Showing overridden only" : "Show overridden only"}
            </button>
            <button
              onClick={copy}
              disabled={changedCount === 0}
              className="inline-flex min-h-[44px] items-center rounded-full bg-gold px-5 text-sm font-bold text-ink disabled:opacity-40"
            >
              {copied ? "Copied ✓" : `Copy JSON (${changedCount})`}
            </button>
            <Link to="/" className="inline-flex min-h-[44px] items-center text-sm font-semibold text-purple-700">
              ← Home
            </Link>
          </div>
          {changedCount > 0 && (
            <pre className="mt-4 max-h-56 overflow-auto rounded-card bg-ink p-4 font-mono text-xs text-white/90">
              {JSON.stringify(snippet, null, 2)}
            </pre>
          )}
          {groups.map((g) => {
            const items = onlyOverridden ? g.items.filter((it) => changes[it.id]) : g.items;
            if (items.length === 0) return null;
            return (
              <section key={g.key} className="mt-8" aria-label={g.key}>
                <h2 className="font-display text-xl font-bold text-ink">
                  {g.key} · {items.length}
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((it) => (
                    <CheckCard key={it.id} item={it} point={changes[it.id]} onPick={onPick} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
