// Media pipeline: scans raw folders -> optimized public/media + manifest.
// Supports BOTH layouts:
//   media-source/dayN/images|videos  (preferred, future drops)
//   media-source/dayN (flat)
//   dayN/images|videos, dayN/videos, dayN/  (legacy, current project)
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "media");
const MEDIA_SOURCE_DIR = path.join(ROOT, "media-source");
const MANIFEST_PATH = path.join(ROOT, "src", "data", "media-manifest.json");
const REPORT_PATH = path.join(ROOT, "src", "data", "media-report.json");
const CACHE_PATH = path.join(ROOT, "src", "data", "media-cache.json");
const PEOPLE_MANIFEST_PATH = path.join(ROOT, "src", "data", "people-manifest.json");
const FOCUS_OVERRIDES_PATH = path.join(ROOT, "src", "data", "focus-overrides.json");

const IMAGE_WIDTHS = [480, 960, 1600];
const PEOPLE_WIDTHS = [400, 800, 1200];
const PEOPLE_GROUPS = ["organizers", "lecturer"];
// Single-portrait sizes (Martha, creator): ~480 + ~900 wide, never upscaled,
// each file capped well under limits. EXIF is stripped: sharp drops all
// metadata by default (no .withMetadata() is ever called in this file).
const PORTRAIT_WIDTHS = [480, 900];
const MAX_PORTRAIT_BYTES = 250 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
// Spec extension sets (matched case-insensitively). Anything else is
// reported as skipped with the reason, never silently dropped.
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm", ".m4v"]);

let sharp = null;
try {
  const mod = await import("sharp");
  sharp = mod.default ?? mod;
} catch {
  console.warn("[media] sharp not installed — run `npm install` first. Image processing skipped.");
}

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function listFilesRecursive(dir) {
  const out = [];
  if (!exists(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursive(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

// Candidate raw dirs for a given section, in priority order.
// Days support the legacy top-level `dayN/` layout; break-time lives only
// under media-source/ (flat or with images|videos subdirs, optional dayN/ subfolders).
function candidateDirs(key) {
  const dirs = [
    path.join(ROOT, "media-source", key, "images"),
    path.join(ROOT, "media-source", key, "videos"),
    path.join(ROOT, "media-source", key),
  ];
  if (/^day\d+$/.test(key)) {
    dirs.push(
      path.join(ROOT, key, "images"),
      path.join(ROOT, key, "videos"),
      path.join(ROOT, key),
    );
  }
  return dirs;
}

// Sections processed exactly like day folders. break-time and activities are
// optional: a missing folder yields an empty section, never a crash.
// "build" (media-source/build/: creator portrait + intro video) is handled
// with the same image/video machinery — portraits at 480/900 instead of the
// day sizes — and lands in manifest.build.
const SECTION_KEYS = ["day1", "day2", "day3", "day4", "day5", "break-time", "activities", "build"];

function collectRaw(dayKey) {
  const seen = new Set();
  const files = [];
  for (const dir of candidateDirs(dayKey)) {
    for (const f of listFilesRecursive(dir)) {
      if (seen.has(f)) continue;
      seen.add(f);
      files.push(f);
    }
  }
  // Filter out anything inside public/ or node_modules accidentally matched
  return files.filter((f) => !f.includes(`${path.sep}public${path.sep}`));
}

// Student class videos live in the ROOT of media-source/activities/ and are
// named creator-NN (e.g. kennysaint-01.mp4): everything before the last -NN
// number is the creator key, NN is that creator's video order. Never guess an
// activity or a video's content from the name. Names that don't fit go under
// "More class videos" (creator: null).
function parseCreator(base) {
  const stem = base.replace(/\.[^.]+$/, "");
  const m = stem.match(/^(.*)-(\d+)$/);
  if (!m || !m[1]) return { creator: null, order: null };
  return { creator: m[1].toLowerCase(), order: parseInt(m[2], 10) };
}
// means "taken on day N". Returns e.g. "day1" or null. Flat files have no tag.
function breakDayTag(srcFile) {
  const m = srcFile.replace(/\\/g, "/").match(/break-time\/(day\d+)\//i);
  return m ? m[1].toLowerCase() : null;
}

// Prune step: delete generated files in public/media/<key>/ that no longer
// correspond to a source file. `expectedFiles` holds basenames we just
// generated. Never touches media-source/. Returns the pruned basenames.
function pruneStaleOutputs(key, expectedFiles) {
  const dir = path.join(OUT_DIR, key);
  if (!exists(dir)) return [];
  const keep = new Set(expectedFiles);
  const pruned = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!keep.has(entry.name)) {
      try {
        fs.unlinkSync(path.join(dir, entry.name));
        pruned.push(entry.name);
      } catch (e) {
        console.warn(`[media] prune failed for ${key}/${entry.name}: ${e.message?.slice(0, 120)}`);
      }
    }
  }
  if (pruned.length > 0) {
    console.log(`[media] prune ${key}: removed ${pruned.length} stale file(s)`);
  }
  return pruned;
}

function slugify(filename) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "media";
}

function loadFocusOverrides() {
  let raw;
  try {
    raw = fs.readFileSync(FOCUS_OVERRIDES_PATH, "utf8");
  } catch {
    return {};
  }
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    console.warn("[media] WARNING: focus-overrides.json failed to parse — using automatic focal points for every image. Fix the file (it must be valid JSON, e.g. {}). See README section 2 for the key format.");
    return {};
  }
}

// Incremental cache: keyed by source path + size + modified time, so only
// new or changed files are reprocessed. Unchanged files reuse their stored
// record (with current focus overrides re-applied) as long as their outputs
// still exist on disk. Shape: { version: 1, files: { absPath: { size, mtimeMs, section, kind, auto, record } } }
function loadCache() {
  try {
    const obj = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
    if (obj && typeof obj === "object" && obj.files && typeof obj.files === "object") return obj;
  } catch {
    // First run or corrupt cache — start fresh, never crash the build.
  }
  return { version: 1, files: {} };
}

function saveCache(cache) {
  try {
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.warn(`[media] cache write failed: ${e.message?.slice(0, 120)}`);
  }
}

// Run async tasks with at most `limit` in flight.
async function runPool(tasks, limit = 3) {
  const results = new Array(tasks.length);
  let next = 0;
  const workers = new Array(Math.min(limit, tasks.length)).fill(0).map(async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  });
  await Promise.all(workers);
  return results;
}

const clampPct = (v) => Math.max(0, Math.min(100, Math.round(v)));

// Focal-point estimate using sharp: saturation-weighted centroid of a tiny
// thumbnail (colorful subjects pull the point toward them). Low-confidence
// images fall back to a top-biased default (50, 25) so faces are never cut.
// `conf` tells callers whether the centroid "clearly" found a subject
// (people photos clamp a weak fy to at most 40% from the top).
// focus-overrides.json entries (keyed by OUTPUT filename, record id as
// fallback) always win and are never written by this pipeline.
// No smartcrop: it is not a dependency, and the rule is to avoid adding
// heavy native packages — the centroid + top-biased default stands in.
async function estimateFocus(srcFile) {
  try {
    const { data, info } = await sharp(srcFile, { failOn: "none" })
      .rotate()
      .resize(24, 24, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let sumW = 0, sumX = 0, sumY = 0, maxW = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const i = (y * info.width + x) * info.channels;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        const sat = mx === 0 ? 0 : (mx - mn) / mx;
        const lum = (r + g + b) / (3 * 255);
        const w = sat * sat * (0.35 + 0.65 * (1 - Math.abs(lum - 0.5) * 2));
        sumW += w;
        sumX += (w * (x + 0.5)) / info.width;
        sumY += (w * (y + 0.5)) / info.height;
        if (w > maxW) maxW = w;
      }
    }
    if (sumW < 0.5 || maxW < 0.05) return { fx: 50, fy: 25, conf: false };
    const out = { fx: clampPct((sumX / sumW) * 100), fy: clampPct((sumY / sumW) * 100) };
    out.conf = sumW > 5 && maxW > 0.25;
    return out;
  } catch {
    return { fx: 50, fy: 25, conf: false };
  }
}

// Merged focal point: exact output basenames first (e.g. "day1-img-01-x-480w.webp"),
// then the record id for backwards compatibility. Returns null when no override.
function lookupFocus(basenames, id, overrides) {
  if (overrides && typeof overrides === "object") {
    for (const b of basenames || []) {
      const o = overrides[b];
      if (o && Number.isFinite(+o.x) && Number.isFinite(+o.y)) {
        return { fx: clampPct(+o.x), fy: clampPct(+o.y) };
      }
    }
    const byId = overrides[id];
    if (byId && Number.isFinite(+byId.x) && Number.isFinite(+byId.y)) {
      return { fx: clampPct(+byId.x), fy: clampPct(+byId.y) };
    }
  }
  return null;
}

// Content hash for cache provenance: stored alongside each processed file so
// the reused focal point is tied to file content, not just size + mtime
// (which remain the cheap hit-test). Computed only when (re)processing.
function hashFile(srcFile) {
  try {
    return createHash("md5").update(fs.readFileSync(srcFile)).digest("hex").slice(0, 16);
  } catch {
    return null;
  }
}

// --- People photos ---------------------------------------------------------
// File name -> temporary caption. Camera/phone defaults (IMG_, DSC, PXL,
// "WhatsApp Image", mostly digits) are never shown: generic labels instead.
// Every file-name caption is provisional until src/data/people.js overrides it.
function isCameraDefault(stem) {
  if (/^(img_|dsc|pxl)/i.test(stem)) return true;
  if (/whatsapp image/i.test(stem)) return true;
  const alnum = stem.replace(/[^a-z0-9]/gi, "");
  const digits = stem.replace(/[^0-9]/g, "");
  return alnum.length > 0 && digits.length / alnum.length > 0.6;
}

function personCaption(group, base, genericIndex) {
  const stem = base.replace(/\.[^.]+$/, "");
  if (!isCameraDefault(stem)) {
    const label = stem
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    if (label) return { caption: label, generic: false };
  }
  return { caption: group === "lecturer" ? "Lecturer" : `Organizer ${genericIndex}`, generic: true };
}

async function loadPeopleOverrides() {
  try {
    const mod = await import(pathToFileURL(path.join(ROOT, "src", "data", "people.js")).href);
    return Array.isArray(mod.people) ? mod.people : [];
  } catch {
    return [];
  }
}

// Single-portrait processing (Martha, creator): WebP at 480 + 900 wide,
// never upscaled, each file forced under MAX_PORTRAIT_BYTES by stepping
// quality down. EXIF stripped (sharp default). Returns web-ready record
// parts; relPrefix is like "media/people/lecturer" or "media/build".
async function processPortrait(srcFile, outDir, relPrefix, base) {
  const meta = await sharp(srcFile, { failOn: "none" }).rotate().metadata();
  const origW = meta.width ?? 1200;
  const origH = meta.height ?? 800;
  fs.mkdirSync(outDir, { recursive: true });
  const srcset = {};
  const bytes = {};
  for (const w of PORTRAIT_WIDTHS) {
    if (origW < w && w !== PORTRAIT_WIDTHS[0]) continue; // never upscale except smallest
    const outName = `${base}-${w}w.webp`;
    let buf = null;
    for (const q of [78, 65, 50]) {
      buf = await sharp(srcFile, { failOn: "none" }).rotate()
        .resize({ width: Math.min(w, origW), withoutEnlargement: w !== PORTRAIT_WIDTHS[0] })
        .webp({ quality: q, effort: 4 }).toBuffer();
      if (buf.length <= MAX_PORTRAIT_BYTES) break;
    }
    fs.writeFileSync(path.join(outDir, outName), buf);
    srcset[String(w)] = `${relPrefix}/${outName}`;
    bytes[String(w)] = buf.length;
  }
  if (!srcset["480"]) {
    const outName = `${base}-480w.webp`;
    const buf = await sharp(srcFile, { failOn: "none" }).rotate()
      .resize({ width: 480 }).webp({ quality: 78, effort: 4 }).toBuffer();
    fs.writeFileSync(path.join(outDir, outName), buf);
    srcset["480"] = `${relPrefix}/${outName}`;
    bytes["480"] = buf.length;
  }
  const blurBuf = await sharp(srcFile, { failOn: "none" }).rotate().resize({ width: 24 }).webp({ quality: 30 }).toBuffer();
  return {
    srcset,
    bytes,
    w: origW,
    h: origH,
    blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
    auto: await estimateFocus(srcFile),
  };
}

async function processPeople(report, focusOverrides) {
  const out = { organizers: [], lecturer: [] };
  const stats = { organizers: { source: 0, manifest: 0, skipped: [] }, lecturer: { source: 0, manifest: 0, skipped: [] } };
  if (!sharp) {
    console.warn("[media] sharp unavailable — people photos skipped.");
    return { out, provisional: [] };
  }
  const nameOverrides = await loadPeopleOverrides();
  const overrideSlugs = new Set(nameOverrides.map((p) => p.slug));
  const provisional = [];

  for (const group of PEOPLE_GROUPS) {
    const dir = path.join(ROOT, "media-source", "people", group);
    if (!exists(dir)) continue; // missing folders must not crash the build
    const files = listFilesRecursive(dir)
      .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
    // Non-image files are reported, never silent.
    for (const f of listFilesRecursive(dir)) {
      if (!IMAGE_EXTS.has(path.extname(f).toLowerCase())) {
        stats[group].skipped.push({ file: path.basename(f), reason: `unsupported extension "${path.extname(f).toLowerCase()}"` });
      }
    }
    const dayOut = path.join(OUT_DIR, "people", group);
    let genericN = 0;
    for (const f of files) {
      const base = path.basename(f);
      stats[group].source += 1;
      const stem = base.replace(/\.[^.]+$/, "");
      const slug = `${group}-${slugify(stem)}`;
      const id = `people-${slug}`;
      try {
        fs.mkdirSync(dayOut, { recursive: true });
        // 3:4 portrait crop with attention strategy so faces stay in frame.
        for (const w of PEOPLE_WIDTHS) {
          const h = Math.round((w * 4) / 3);
          await sharp(f, { failOn: "none" })
            .rotate()
            .resize(w, h, { fit: "cover", position: sharp.strategy.attention })
            .webp({ quality: 78, effort: 4 })
            .toFile(path.join(dayOut, `${slug}-${w}w.webp`));
        }
        const blurBuf = await sharp(f, { failOn: "none" }).rotate().resize({ width: 24 }).webp({ quality: 30 }).toBuffer();
        const meta = await sharp(f, { failOn: "none" }).rotate().metadata();
        const auto = await estimateFocus(f); // top-biased fallback inside
        // People default: horizontally centered, vertically ~25%, never lower
        // than 40% from the top unless the centroid clearly found a subject.
        let fx = auto.fx;
        let fy = auto.conf ? auto.fy : Math.min(auto.fy, 40);
        const sizeNames = PEOPLE_WIDTHS.map((w) => `${slug}-${w}w.webp`);
        const ov = lookupFocus(sizeNames, id, focusOverrides);
        if (ov) { fx = ov.fx; fy = ov.fy; }
        const cap = personCaption(group, base, genericN + 1);
        if (cap.generic) genericN += 1;
        const resolved = overrideSlugs.has(slug);
        if (!resolved) provisional.push(`${group}/${base}`);
        const record = {
          id,
          slug,
          file: base, // source basename — frontend finds martha.* / ceo via this
          caption: cap.caption,
          provisional: !resolved,
          srcset: {
            400: `media/people/${group}/${slug}-400w.webp`,
            800: `media/people/${group}/${slug}-800w.webp`,
            1200: `media/people/${group}/${slug}-1200w.webp`,
          },
          w: meta.width ?? 900,
          h: meta.height ?? 1200,
          fx,
          fy,
          blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
        };
        // martha.* (any image extension) in the lecturer folder also gets a
        // dedicated 480/900 portrait pair for the Home band + Lecturer hero.
        if (group === "lecturer" && stem.toLowerCase() === "martha") {
          try {
            const p = await processPortrait(f, dayOut, `media/people/${group}`, `${slug}-portrait`);
            const pNames = Object.values(p.srcset).map((r) => path.basename(r));
            const pOv = lookupFocus(pNames, id, focusOverrides);
            record.portrait = p.srcset;
            record.portraitBytes = p.bytes;
            if (pOv) { record.fx = pOv.fx; record.fy = pOv.fy; }
            console.log(`[media] portrait pair for martha.*: ${pNames.join(", ")}`);
          } catch (e) {
            console.warn(`[media] martha portrait failed: ${e.message?.slice(0, 160)}`);
          }
        }
        out[group].push(record);
        stats[group].manifest += 1;
      } catch (e) {
        const isHeic = path.extname(f).toLowerCase() === ".heic";
        const reason = isHeic
          ? "HEIC not supported by this sharp build — convert to JPEG first"
          : `image processing failed: ${e.message?.slice(0, 160)}`;
        console.warn(`[media] people photo failed ${group}/${base}: ${reason}`);
        stats[group].skipped.push({ file: base, reason });
      }
    }
  }

  fs.mkdirSync(path.dirname(PEOPLE_MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(PEOPLE_MANIFEST_PATH, JSON.stringify(out, null, 2));
  if (report) report.people = stats;
  if (provisional.length > 0) {
    console.warn(`[media] WARNING: ${provisional.length} people still have provisional names. Add real names in src/data/people.js (matched by slug):`);
    for (const p of provisional) console.warn(`[media]   provisional: ${p}`);
  }
  const total = out.organizers.length + out.lecturer.length;
  console.log(`[media] People manifest written: ${total} portrait(s) -> src/data/people-manifest.json`);
  return { out, provisional };
}

async function ffmpegAvailable() {
  try {
    await execFileAsync("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

async function ffprobeDuration(file) {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1", file,
    ]);
    return parseFloat(stdout.trim()) || 0;
  } catch {
    return 0;
  }
}

async function processImage(srcFile, dayKey, index, overrides) {
  const base = path.basename(srcFile);
  const featured = base.startsWith("featured-");
  const id = `${dayKey}-img-${String(index).padStart(2, "0")}-${slugify(base.replace(/\.[^.]+$/, ""))}`;
  const dayOut = path.join(OUT_DIR, dayKey);
  fs.mkdirSync(dayOut, { recursive: true });

  const meta = await sharp(srcFile, { failOn: "none" }).rotate().metadata();
  const origW = meta.width ?? 1200;
  const origH = meta.height ?? 800;

  const srcset = {};
  for (const w of IMAGE_WIDTHS) {
    if (origW < w && w !== IMAGE_WIDTHS[0]) continue; // don't upscale except smallest
    const outName = `${id}-${w}w.webp`;
    const outPath = path.join(dayOut, outName);
    // Re-read each time to avoid pipeline reuse issues
    await sharp(srcFile, { failOn: "none" }).rotate().resize({ width: Math.min(w, origW), withoutEnlargement: true }).webp({ quality: 78, effort: 4 }).toFile(outPath);
    srcset[String(w)] = `media/${dayKey}/${outName}`;
  }
  // Fallback: ensure at least 480 entry
  if (!srcset["480"]) {
    const outName = `${id}-480w.webp`;
    const outPath = path.join(dayOut, outName);
    await sharp(srcFile, { failOn: "none" }).rotate().resize({ width: 480, withoutEnlargement: false }).webp({ quality: 78 }).toFile(outPath);
    srcset["480"] = `media/${dayKey}/${outName}`;
  }

  // ~24px blurred placeholder
  const blurBuf = await sharp(srcFile, { failOn: "none" }).rotate().resize({ width: 24, withoutEnlargement: false }).webp({ quality: 30 }).toBuffer();
  const blur = `data:image/webp;base64,${blurBuf.toString("base64")}`;

  // Display aspect from original
  const auto = await estimateFocus(srcFile);
  const names = Object.values(srcset).map((r) => path.basename(r));
  const focus = lookupFocus(names, id, overrides) ?? { fx: auto.fx, fy: auto.fy };
  return { id, featured, w: origW, h: origH, fx: focus.fx, fy: focus.fy, blur, srcset, _file: base, _auto: auto };
}

// Build-section image (creator portrait): 480/900 portrait pair instead of
// the day sizes, same manifest record shape plus the source basename.
async function processBuildImage(srcFile, dayKey, index, overrides) {
  const base = path.basename(srcFile);
  const featured = base.startsWith("featured-");
  const id = `${dayKey}-img-${String(index).padStart(2, "0")}-${slugify(base.replace(/\.[^.]+$/, ""))}`;
  const dayOut = path.join(OUT_DIR, dayKey);
  const p = await processPortrait(srcFile, dayOut, `media/${dayKey}`, id);
  const names = Object.values(p.srcset).map((r) => path.basename(r));
  const focus = lookupFocus(names, id, overrides) ?? { fx: p.auto.fx, fy: p.auto.fy };
  return { id, featured, file: base, w: p.w, h: p.h, fx: focus.fx, fy: focus.fy, blur: p.blur, srcset: p.srcset, _auto: p.auto };
}

async function processVideo(srcFile, dayKey, index, canFfmpeg) {
  const base = path.basename(srcFile);
  const featured = base.startsWith("featured-");
  const id = `${dayKey}-vid-${String(index).padStart(2, "0")}-${slugify(base.replace(/\.[^.]+$/, ""))}`;
  const dayOut = path.join(OUT_DIR, dayKey);
  fs.mkdirSync(dayOut, { recursive: true });
  const outName = `${id}.mp4`;
  const outPath = path.join(dayOut, outName);
  const posterName = `${id}-poster.webp`;
  const posterPath = path.join(dayOut, posterName);

  if (!canFfmpeg) {
    console.warn(`[media] ffmpeg missing — skipping video ${dayKey}/${base}`);
    return null;
  }

  const duration = await ffprobeDuration(srcFile);

  // Per-file cap: anything bigger is re-encoded down (with a warning), never copied as-is.
  let reencoded = false;
  try {
    const srcBytes = fs.statSync(srcFile).size;
    if (srcBytes > MAX_VIDEO_BYTES) {
      reencoded = true;
      console.warn(`[media] ${dayKey}/${base} source is ${(srcBytes / 1048576).toFixed(1)}MB (>20MB) — re-encoding down…`);
    }
  } catch {
    // stat failed — transcode attempt below will report the real problem
  }

  // Transcode: max 720 on long edge, CRF 28, faststart, AAC 64k.
  // Scale filter: if width>height scale w=720 else h=720, only downscale.
  const vf = `"scale='if(gt(iw,ih),min(720,iw),-2)':'if(gt(iw,ih),-2,min(720,ih))'"`;
  let crf = 28;
  let attempt = 0;
  let ok = false;
  while (attempt < 3 && !ok) {
    const args = [
      "-y", "-i", srcFile,
      "-vf", `scale='if(gt(iw,ih),min(720,iw),-2)':'if(gt(iw,ih),-2,min(720,ih))'`,
      "-c:v", "libx264", "-crf", String(crf), "-preset", "veryfast",
      "-c:a", "aac", "-b:a", "64k",
      "-movflags", "+faststart",
      "-threads", "2",
      outPath,
    ];
    try {
      await execFileAsync("ffmpeg", args, { timeout: 10 * 60 * 1000 });
    } catch (e) {
      console.warn(`[media] ffmpeg failed for ${base}: ${e.message?.slice(0, 300)}`);
      return null;
    }
    const size = fs.statSync(outPath).size;
    if (size <= MAX_VIDEO_BYTES) {
      ok = true;
    } else {
      reencoded = true;
      attempt++;
      crf += 4; // lower quality
      if (attempt === 2) {
        console.warn(`[media] ${base} still >20MB after CRF ${crf - 4}, trying harder compression…`);
      }
    }
  }
  const finalSize = fs.statSync(outPath).size;
  if (finalSize > MAX_VIDEO_BYTES) {
    console.warn(`[media] WARNING: ${dayKey}/${outName} is ${(finalSize / 1048576).toFixed(1)}MB — exceeds 20MB limit. Consider trimming or hosting elsewhere.`);
  }

  // Poster at ~1s (or 10% duration fallback)
  const ss = Math.min(1, Math.max(0.2, duration * 0.1)).toFixed(2);
  try {
    await execFileAsync("ffmpeg", ["-y", "-ss", ss, "-i", outPath, "-frames:v", "1", "-vf", "scale=640:-2", posterPath]);
    // Convert poster to webp if it's not already (ffmpeg may write webp by ext)
  } catch (e) {
    console.warn(`[media] poster failed for ${base}, using placeholder`);
  }

  return {
    id, featured,
    duration: Math.round(duration * 10) / 10,
    poster: exists(posterPath) ? `media/${dayKey}/${posterName}` : "",
    src: `media/${dayKey}/${outName}`,
    _file: base,
    _bytes: finalSize,
    _reencoded: reencoded,
  };
}

async function ensureOgCover(manifest) {
  const ogPath = path.join(ROOT, "public", "og-cover.jpg");
  if (exists(ogPath)) return;
  try {
    // Prefer first Day1 image 960w
    const d1 = manifest.day1?.images?.[0];
    const srcRel = d1?.srcset?.["960"] ?? d1?.srcset?.["480"];
    if (srcRel && sharp) {
      const srcAbs = path.join(OUT_DIR, srcRel.replace(/^media\//, ""));
      if (exists(srcAbs)) {
        await sharp(srcAbs).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 82 }).toFile(ogPath);
        console.log("[media] og-cover.jpg generated from Day 1 image.");
        return;
      }
    }
    // Purple branded fallback with title text via SVG
    const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#5B21B6"/><stop offset="1" stop-color="#2E1065"/>
      </linearGradient></defs>
      <rect width="1200" height="630" fill="url(#g)"/>
      <text x="80" y="300" font-family="Arial,sans-serif" font-size="64" font-weight="bold" fill="#FFFFFF">Digital Marketing</text>
      <text x="80" y="380" font-family="Arial,sans-serif" font-size="64" font-weight="bold" fill="#F5B93B">Seminar Recap</text>
      <text x="80" y="440" font-family="Arial,sans-serif" font-size="30" fill="#CBB8FF">5 days · 50+ small business owners</text>
    </svg>`;
    await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(ogPath);
    console.log("[media] og-cover.jpg generated as branded fallback.");
  } catch (e) {
    console.warn("[media] og-cover generation failed:", e.message);
  }
}

async function main() {
  console.log("[media] Starting media pipeline…");
  // Pipeline safety: without media-source/ there is nothing to scan, and the
  // legacy dayN/ folders alone must never trigger a prune. Exit immediately,
  // leaving public/media and every manifest exactly as committed.
  if (!exists(MEDIA_SOURCE_DIR)) {
    console.error("[media] media-source not found, using committed output. No files pruned, no manifests rewritten.");
    return;
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const canFfmpeg = await ffmpegAvailable();
  if (!canFfmpeg) console.warn("[media] WARNING: ffmpeg not found — videos will be skipped, images still processed.");
  const overrides = loadFocusOverrides();
  const overrideCount = Object.keys(overrides).length;
  if (overrideCount > 0) console.log(`[media] Loaded ${overrideCount} focus override(s).`);

  // Previous report (if any) for the "disappeared since last run" counts.
  let prevReport = null;
  try {
    prevReport = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
  } catch {
    prevReport = null;
  }

  const manifest = {};
  const report = { generatedAt: new Date().toISOString(), days: {}, warnings: [] };
  const cache = loadCache();
  let cacheHits = 0;
  const statOf = (f) => {
    try {
      const st = fs.statSync(f);
      return { size: st.size, mtimeMs: Math.floor(st.mtimeMs) };
    } catch {
      return null;
    }
  };
  const outputsExist = (key, basenames) => basenames.every((b) => exists(path.join(OUT_DIR, key, b)));
  for (const dayKey of SECTION_KEYS) {
    const isBreak = dayKey === "break-time";
    const rawFiles = collectRaw(dayKey);
    // Folder scaffolding is never media: .gitkeep / README files are
    // ignored entirely (not even reported as skipped).
    const files = rawFiles.filter((f) => {
      const b = path.basename(f).toLowerCase();
      return b !== ".gitkeep" && b !== "readme.md" && b !== "readme";
    });
    // Classify by extension, case-insensitive, wherever the file sits.
    const images = [];
    const videos = [];
    const skipped = [];
    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      if (IMAGE_EXTS.has(ext)) images.push(f);
      else if (VIDEO_EXTS.has(ext)) videos.push(f);
      else if (ext) skipped.push({ file: path.basename(f), reason: `unsupported extension "${ext}"` });
      else skipped.push({ file: path.basename(f), reason: "no file extension" });
    }
    images.sort((a, b) => {
      const fa = path.basename(a).startsWith("featured-") ? 0 : 1;
      const fb = path.basename(b).startsWith("featured-") ? 0 : 1;
      return fa - fb || a.localeCompare(b);
    });
    videos.sort((a, b) => {
      const fa = path.basename(a).startsWith("featured-") ? 0 : 1;
      const fb = path.basename(b).startsWith("featured-") ? 0 : 1;
      return fa - fb || a.localeCompare(b);
    });

    console.log(`[media] ${dayKey}: ${images.length} image(s), ${videos.length} video(s)`);

    const outImages = [];
    const reencoded = [];
    if (sharp) {
      // Incremental: unchanged files reuse their cached record (overrides
      // re-applied). At most 3 image jobs run at a time.
      const tasks = images.map((f, idx) => async () => {
        const i = idx + 1;
        const base = path.basename(f);
        const st = statOf(f);
        const hit = st && cache.files[f] && cache.files[f].section === dayKey
          && cache.files[f].kind === "image"
          && cache.files[f].size === st.size && cache.files[f].mtimeMs === st.mtimeMs;
        if (hit) {
          const entry = cache.files[f];
          const outs = Object.values(entry.record.srcset || {}).map((r) => path.basename(r));
          if (outs.length > 0 && outputsExist(dayKey, outs)) {
            const auto = entry.auto || { fx: 50, fy: 25 };
            const focus = lookupFocus(outs, entry.record.id, overrides) ?? { fx: auto.fx, fy: auto.fy };
            const rec = { ...entry.record, fx: focus.fx, fy: focus.fy };
            if (isBreak) {
              const tag = breakDayTag(f);
              if (tag) rec.day = tag; else delete rec.day;
            }
            if (dayKey === "activities" && (rec.creator === undefined || rec.creatorOrder === undefined)) {
              const c = parseCreator(base);
              rec.creator = c.creator;
              rec.creatorOrder = c.order;
            }
            cacheHits += 1;
            return { rec, cacheAuto: entry.auto, cacheRecord: entry.record };
          }
        }
        try {
          // The build section (creator portrait) uses the 480/900 portrait
          // pair; every other section uses the standard day sizes.
          const full = dayKey === "build"
            ? await processBuildImage(f, dayKey, i, overrides)
            : await processImage(f, dayKey, i, overrides);
          const { _file, _auto, ...rest } = full;
          if (isBreak) {
            const tag = breakDayTag(f);
            if (tag) rest.day = tag;
          }
          if (dayKey === "activities") {
            const c = parseCreator(base);
            rest.creator = c.creator;
            rest.creatorOrder = c.order;
          }
          if (st) cache.files[f] = { size: st.size, mtimeMs: st.mtimeMs, section: dayKey, kind: "image", auto: _auto, record: rest, hash: hashFile(f) };
          return { rec: rest, fresh: true };
        } catch (e) {
          const isHeic = path.extname(f).toLowerCase() === ".heic";
          const reason = isHeic
            ? "HEIC not supported by this sharp build — convert to JPEG first"
            : `image processing failed: ${e.message?.slice(0, 160)}`;
          console.warn(`[media] ${isHeic ? "HEIC not supported" : "image failed"} ${dayKey}/${base}: ${e.message?.slice(0, 160)}`);
          return { skipped: { file: base, reason } };
        }
      });
      for (const r of await runPool(tasks, 3)) {
        if (!r) continue;
        if (r.rec) outImages.push(r.rec);
        else if (r.skipped) skipped.push(r.skipped);
      }
    } else if (images.length) {
      console.warn(`[media] sharp unavailable — ${images.length} image(s) in ${dayKey} skipped.`);
      for (const f of images) skipped.push({ file: path.basename(f), reason: "sharp not installed" });
    }

    const outVideos = [];
    let outVideoBytes = 0;
    // Incremental videos: same cache rule as images, at most 3 transcodes at a time.
    const videoTasks = videos.map((f, idx) => async () => {
      const vi = idx + 1;
      const base = path.basename(f);
      if (!canFfmpeg) {
        return { skipped: { file: base, reason: "ffmpeg not installed" } };
      }
      const st = statOf(f);
      const hit = st && cache.files[f] && cache.files[f].section === dayKey
        && cache.files[f].kind === "video"
        && cache.files[f].size === st.size && cache.files[f].mtimeMs === st.mtimeMs;
      if (hit) {
        const entry = cache.files[f];
        const outs = [];
        if (entry.record.src) outs.push(path.basename(entry.record.src));
        if (entry.record.poster) outs.push(path.basename(entry.record.poster));
        if (outs.length > 0 && outputsExist(dayKey, outs)) {
          const rec = { ...entry.record };
          if (isBreak) {
            const tag = breakDayTag(f);
            if (tag) rec.day = tag; else delete rec.day;
          }
          if (dayKey === "activities" && (rec.creator === undefined || rec.creatorOrder === undefined)) {
            const c = parseCreator(base);
            rec.creator = c.creator;
            rec.creatorOrder = c.order;
          }
          cacheHits += 1;
          return { rec, cacheBytes: entry.bytes || 0, cacheReencoded: entry.reencoded, cacheFile: entry.file };
        }
      }
      const full = await processVideo(f, dayKey, vi, canFfmpeg);
      if (full) {
        const { _file, _bytes, _reencoded, ...rest } = full;
        if (isBreak) {
          const tag = breakDayTag(f);
          if (tag) rest.day = tag;
        }
        if (dayKey === "activities") {
          const c = parseCreator(base);
          rest.creator = c.creator;
          rest.creatorOrder = c.order;
        }
        if (st) cache.files[f] = { size: st.size, mtimeMs: st.mtimeMs, section: dayKey, kind: "video", record: rest, bytes: _bytes || 0, reencoded: !!_reencoded, file: base, hash: hashFile(f) };
        return { rec: rest, freshBytes: _bytes || 0, freshReencoded: _reencoded, freshFile: base };
      }
      return { skipped: { file: base, reason: "video transcode failed (see warnings above)" } };
    });
    for (const r of await runPool(videoTasks, 3)) {
      if (!r) continue;
      if (r.rec) {
        outVideos.push(r.rec);
        outVideoBytes += r.freshBytes ?? r.cacheBytes ?? 0;
        const wasRe = r.freshReencoded ?? r.cacheReencoded ?? false;
        if (wasRe) reencoded.push(r.freshFile ?? r.cacheFile ?? path.basename(r.rec.src || "video"));
      }
      else if (r.skipped) skipped.push(r.skipped);
    }

    // Prune: drop generated files whose source no longer exists, then the
    // manifest entry drops with them (the manifest is rebuilt from scratch).
    const expected = new Set();
    for (const im of outImages) {
      for (const rel of Object.values(im.srcset || {})) expected.add(path.basename(rel));
    }
    for (const v of outVideos) {
      if (v.src) expected.add(path.basename(v.src));
      if (v.poster) expected.add(path.basename(v.poster));
    }
    const pruned = pruneStaleOutputs(dayKey, expected);

    manifest[dayKey] = { images: outImages, videos: outVideos };
    const prev = prevReport?.days?.[dayKey];
    const prevTotal = prev ? (prev.manifestImages ?? 0) + (prev.manifestVideos ?? 0) : null;
    const nowTotal = outImages.length + outVideos.length;
    const disappeared = prevTotal === null ? 0 : Math.max(0, prevTotal - nowTotal);
    report.days[dayKey] = {
      sourceImages: images.length,
      sourceVideos: videos.length,
      manifestImages: outImages.length,
      manifestVideos: outVideos.length,
      outputVideoBytes: outVideoBytes,
      reencoded,
      skipped,
      pruned: pruned.length,
      disappeared,
    };
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  await processPeople(report, overrides);

  // Same prune-and-verify logic for people portraits (Phase 7 item 7):
  // remove generated sizes whose source file no longer exists, using the
  // just-regenerated manifest as the source of truth.
  try {
    const freshPeople = JSON.parse(fs.readFileSync(PEOPLE_MANIFEST_PATH, "utf8"));
    for (const group of PEOPLE_GROUPS) {
      const expectedPeople = new Set();
      for (const rec of freshPeople?.[group] ?? []) {
        for (const rel of Object.values(rec.srcset || {})) expectedPeople.add(path.basename(rel));
        // Dedicated portrait pairs (martha.*) live in the same folder.
        for (const rel of Object.values(rec.portrait || {})) expectedPeople.add(path.basename(rel));
      }
      pruneStaleOutputs(path.join("people", group), expectedPeople);
    }
  } catch {
    // No people manifest yet (first run) — nothing to prune.
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  // Drop cache entries whose source file no longer exists, so renames and
  // moves never reuse stale records.
  for (const key of Object.keys(cache.files)) {
    if (!exists(key)) delete cache.files[key];
  }
  saveCache(cache);
  if (cacheHits > 0) console.log(`[media] Incremental: reused ${cacheHits} unchanged file(s) from cache.`);
  const totalImg = Object.values(manifest).reduce((s, d) => s + d.images.length, 0);
  const totalVid = Object.values(manifest).reduce((s, d) => s + d.videos.length, 0);
  const totalSkipped = Object.values(report.days).reduce((s, d) => s + d.skipped.length, 0);
  console.log(`[media] Manifest written: ${totalImg} images, ${totalVid} videos -> src/data/media-manifest.json`);
  console.log(`[media] Report written: ${totalSkipped} skipped file(s) -> src/data/media-report.json`);

  await ensureOgCover(manifest);
  console.log("[media] Done.");
}

await main();
