// npm run media:report — prints per-day source vs manifest counts plus
// every skipped file with its reason. Reads the data written by build-media.mjs
// (src/data/media-report.json) and cross-checks it against the manifest.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPORT_PATH = path.join(ROOT, "src", "data", "media-report.json");
const MANIFEST_PATH = path.join(ROOT, "src", "data", "media-manifest.json");

function load(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

const report = load(REPORT_PATH);
const manifest = load(MANIFEST_PATH);

if (!report) {
  console.error("[media:report] No report found. Run `npm run media` first (it writes src/data/media-report.json).");
  process.exit(1);
}

const pad = (v, n) => String(v).padStart(n);
console.log("");
console.log("MEDIA REPORT" + (report.generatedAt ? `  (generated ${report.generatedAt})` : ""));
console.log("─".repeat(84));
console.log("Section    Src Img   Src Vid   Manifest Img   Manifest Vid   Skipped   Gone");
console.log("─".repeat(84));

const SECTIONS = ["day1", "day2", "day3", "day4", "day5", "break-time", "activities"];
let tSrcI = 0, tSrcV = 0, tManI = 0, tManV = 0, tSkip = 0, tGone = 0;
let mismatch = false;
for (const dayKey of SECTIONS) {
  const r = report.days?.[dayKey] ?? { sourceImages: 0, sourceVideos: 0, manifestImages: 0, manifestVideos: 0, skipped: [] };
  const m = manifest?.[dayKey];
  const mI = m?.images?.length ?? 0;
  const mV = m?.videos?.length ?? 0;
  const flag = m && (mI !== r.manifestImages || mV !== r.manifestVideos) ? "  <-- MANIFEST DIFFERS (edited after build?)" : "";
  if (flag) mismatch = true;
  const gone = r.disappeared ?? 0;
  tSrcI += r.sourceImages; tSrcV += r.sourceVideos;
  tManI += r.manifestImages; tManV += r.manifestVideos;
  tSkip += r.skipped.length; tGone += gone;
  console.log(
    `${dayKey.padEnd(10)}${pad(r.sourceImages, 7)}   ${pad(r.sourceVideos, 7)}   ${pad(r.manifestImages, 12)}   ${pad(r.manifestVideos, 12)}   ${pad(r.skipped.length, 7)}   ${pad(gone, 4)}${flag}`
  );
  if ((r.pruned ?? 0) > 0) {
    console.log(`             └─ pruned ${r.pruned} stale generated file(s) whose source no longer exists`);
  }
  if (dayKey === "activities") {
    // Creator grouping mirrors the /activities page: distinct `creator` keys
    // on manifest videos, plus one "More class videos" group when any video
    // has no creator (name didn't fit creator-NN).
    const vids = m?.videos ?? [];
    const creators = new Set(vids.map((v) => v.creator).filter(Boolean));
    const ungrouped = vids.filter((v) => !v.creator).length;
    const groups = creators.size + (ungrouped > 0 ? 1 : 0);
    const bytes = r.outputVideoBytes ?? 0;
    const mb = (bytes / 1048576).toFixed(1);
    console.log(`             └─ creators ${groups} (${vids.length} videos, ${mb} MB output)`);
    const re = r.reencoded ?? [];
    if (re.length > 0) {
      console.log(`             └─ re-encoded (over 20 MB cap): ${re.join(", ")}`);
    } else {
      console.log(`             └─ re-encoded: none`);
    }
  }
}
console.log("─".repeat(84));
console.log(`TOTAL     ${pad(tSrcI, 7)}   ${pad(tSrcV, 7)}   ${pad(tManI, 12)}   ${pad(tManV, 12)}   ${pad(tSkip, 7)}   ${pad(tGone, 4)}`);
console.log("");
console.log('"Gone" = items in the previous report manifest that are no longer present (moved out of the folder).');
console.log("");

const allSkipped = [];
for (const dayKey of SECTIONS) {
  for (const s of report.days?.[dayKey]?.skipped ?? []) allSkipped.push({ day: dayKey, ...s });
}
if (allSkipped.length === 0) {
  console.log("Skipped files: none — every source file made it into the manifest.");
} else {
  console.log(`Skipped files (${allSkipped.length}):`);
  for (const s of allSkipped) console.log(`  - [${s.day}] ${s.file} — ${s.reason}`);
}
console.log("");

if (report.people) {
  console.log("PEOPLE");
  console.log("─".repeat(72));
  let pSrc = 0, pMan = 0, pSkip = 0;
  for (const g of ["organizers", "lecturer"]) {
    const r = report.people[g] ?? { source: 0, manifest: 0, skipped: [] };
    pSrc += r.source; pMan += r.manifest; pSkip += r.skipped.length;
    console.log(`${g.padEnd(12)} source ${pad(r.source, 4)}   manifest ${pad(r.manifest, 4)}   skipped ${pad(r.skipped.length, 4)}`);
    for (const s of r.skipped) console.log(`  - [people/${g}] ${s.file} — ${s.reason}`);
  }
  console.log(`TOTAL        source ${pad(pSrc, 4)}   manifest ${pad(pMan, 4)}   skipped ${pad(pSkip, 4)}`);
  console.log("");
}
if (!manifest) {
  console.log("");
  console.log("[media:report] WARNING: src/data/media-manifest.json not found.");
  mismatch = true;
}
if (mismatch) process.exitCode = 2;
