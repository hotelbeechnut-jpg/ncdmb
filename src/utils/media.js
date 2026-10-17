import manifest from "../data/media-manifest.json";
import peopleManifest from "../data/people-manifest.json";
import { people as peopleOverrides } from "../data/people.js";
import { creators as creatorOverrides } from "../data/creators.js";

// Resolve a pipeline person record against src/data/people.js.
// Real names override file-name captions; everything else stays provisional.
export function resolvePerson(record) {
  const o = (peopleOverrides || []).find((p) => p.slug === record.slug);
  if (o && o.name) {
    return { ...record, name: o.name, title: o.title || "", org: o.org || "", provisional: false };
  }
  return { ...record, name: record.caption, title: "", org: "", provisional: true };
}

export function peopleOf(group) {
  return (peopleManifest[group] || []).map(resolvePerson);
}

export function peopleSrcSet(rec) {
  return Object.entries(rec.srcset || {}).map(([w, p]) => `/${p} ${w}w`).join(", ");
}

// Martha's portrait (file martha.* in people/lecturer): the ONLY image used
// for the Home facilitator band and the Lecturer hero. Prefers the dedicated
// 480/900 portrait pair; falls back to the record srcset, then to the first
// lecturer photo, then null (callers render an "ME" initials avatar).
export function marthaPortrait() {
  const group = peopleOf("lecturer");
  const rec =
    group.find((p) => /martha/i.test(p.file || "")) ??
    group.find((p) => /martha/i.test(p.slug || "")) ??
    null;
  const portrait = rec?.portrait ?? null;
  if (portrait && (portrait["900"] || portrait["480"])) {
    const src = portrait["900"] ?? portrait["480"];
    return {
      found: true,
      martha: true,
      src: `/${src}`,
      srcSet: Object.entries(portrait).map(([w, p]) => `/${p} ${w}w`).join(", "),
      fx: rec.fx ?? 50,
      fy: rec.fy ?? 20,
    };
  }
  if (rec) {
    return {
      found: true,
      martha: true,
      src: pickSrc(rec.srcset, 800),
      srcSet: peopleSrcSet(rec),
      fx: rec.fx ?? 50,
      fy: rec.fy ?? 20,
    };
  }
  const first = group[0];
  if (first) {
    return {
      found: true,
      martha: false,
      src: pickSrc(first.srcset, 800),
      srcSet: peopleSrcSet(first),
      fx: first.fx ?? 50,
      fy: first.fy ?? 20,
    };
  }
  return { found: false, martha: false, src: "", srcSet: "", fx: 50, fy: 20 };
}

// Lecturer photos EXCLUDING Martha (the rest of the folder keeps working
// exactly as before, e.g. the Lecturer page spotlight).
export function otherLecturerPhotos() {
  return peopleOf("lecturer").filter(
    (p) => !/martha/i.test(p.file || "") && !/martha/i.test(p.slug || "")
  );
}

// media-source/build/ outputs (creator portrait + intro video), processed by
// the same pipeline into manifest.build. Missing pieces yield nulls so
// callers can omit those blocks gracefully.
// The animated short (build-vid-XX-animation) is surfaced separately by
// buildAnimation(); the creator intro is the first video that is not it.
function isAnimationId(id) {
  return /-animation(-|$)/.test(id || "");
}

function buildVideoRecord(vid) {
  return vid
    ? {
        src: vid.src ? `/${vid.src}` : "",
        poster: vid.poster ? `/${vid.poster}` : "",
        duration: vid.duration,
      }
    : null;
}

export function buildMedia() {
  const m = getDayManifest("build");
  const img = (m.images || [])[0] ?? null;
  const vids = m.videos || [];
  const vid = vids.find((v) => !isAnimationId(v.id)) ?? vids[0] ?? null;
  return {
    image: img
      ? {
          src: pickSrc(img.srcset, 900),
          srcSet: imgSrcSet(img),
          w: img.w,
          h: img.h,
          fx: img.fx ?? 50,
          fy: img.fy ?? 20,
          blur: img.blur,
          alt: "Portrait of Nathaniel Kenny Olie",
        }
      : null,
    video: buildVideoRecord(vid),
  };
}

// The short animated movie shown on the Build Yours page.
export function buildAnimation() {
  const vids = getDayManifest("build").videos || [];
  return buildVideoRecord(vids.find((v) => isAnimationId(v.id)) ?? null);
}

export function getDayManifest(dayKey) {
  return manifest[dayKey] ?? { images: [], videos: [] };
}

function dayNumOf(dayKey) {
  return Number(String(dayKey).replace("day", "")) || 0;
}

function altPrefix(dayKey) {
  if (dayKey === "break-time") return "Break-time";
  const n = dayNumOf(dayKey);
  return n > 0 ? `Seminar photo, Day ${n}` : "Seminar photo";
}

function videoAltPrefix(dayKey) {
  if (dayKey === "break-time") return "Break-time video";
  const n = dayNumOf(dayKey);
  return n > 0 ? `Seminar video, Day ${n}` : "Seminar video";
}

// Every item of a day as one unified list (manifest order: featured first).
export function dayItems(dayKey) {
  const m = getDayManifest(dayKey);
  const imgPrefix = altPrefix(dayKey);
  const vidPrefix = videoAltPrefix(dayKey);
  const imgs = (m.images || []).map((im, i) => ({
    kind: "image",
    id: im.id,
    featured: !!im.featured,
    srcset: im.srcset,
    blur: im.blur,
    w: im.w,
    h: im.h,
    fx: im.fx ?? 50,
    fy: im.fy ?? 25,
    day: im.day ?? null, // break-time day tag (e.g. "day1") when filed under dayN/
    alt: `${imgPrefix} — ${i + 1}`,
  }));
  const vids = (m.videos || []).map((v, i) => ({
    kind: "video",
    id: v.id,
    featured: !!v.featured,
    src: v.src,
    poster: v.poster,
    duration: v.duration,
    fx: 50,
    fy: 25,
    day: v.day ?? null,
    alt: `${vidPrefix} — ${i + 1}`,
  }));
  return [...imgs, ...vids];
}

// Break-time items, with optional day filter ("all" or "dayN").
export function breakItems(filter = "all") {
  const all = dayItems("break-time");
  if (!filter || filter === "all") return all;
  return all.filter((it) => it.day === filter);
}

// Day tags actually present in the break-time manifest (sorted day1..day5).
// Empty when files sit flat in media-source/break-time/.
export function breakTimeDays() {
  const tags = new Set();
  for (const it of dayItems("break-time")) {
    if (it.day && /^day\d+$/.test(it.day)) tags.add(it.day);
  }
  return [...tags].sort((a, b) => dayNumOf(a) - dayNumOf(b));
}

// Hero pool: featured first, topped up with the rest until at least `min`
// (or all items when the day has fewer). Manifest is already featured-first.
export function heroPool(dayKey, min = 12) {
  const items = dayItems(dayKey);
  if (items.length <= min) return items;
  const feat = items.filter((i) => i.featured);
  const rest = items.filter((i) => !i.featured);
  return [...feat, ...rest].slice(0, Math.max(min, feat.length));
}

export function allItems() {
  return ["day1", "day2", "day3", "day4", "day5"].flatMap((d) =>
    dayItems(d).map((it) => ({ ...it, dayKey: d, day: `Day ${dayNumOf(d)}` }))
  );
}

export function countsLabel(dayKey) {
  const m = getDayManifest(dayKey);
  const ni = m.images?.length ?? 0;
  const nv = m.videos?.length ?? 0;
  const parts = [];
  parts.push(`${ni} photo${ni === 1 ? "" : "s"}`);
  if (nv > 0) parts.push(`${nv} video${nv === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

export function manifestCounts(dayKey) {
  const m = getDayManifest(dayKey);
  return { images: m.images?.length ?? 0, videos: m.videos?.length ?? 0 };
}

export function imgSrc(im, size = "480") {
  return pickSrc(im?.srcset, Number(size) || 480);
}

// Pick the smallest srcset width at or above target (else the largest).
// Works for day sets (480/960/1600) and people sets (400/800/1200).
export function pickSrc(srcset, target = 480) {
  const entries = Object.entries(srcset || {})
    .map(([w, p]) => [Number(w), p])
    .filter(([w, p]) => Number.isFinite(w) && p)
    .sort((a, b) => a[0] - b[0]);
  if (entries.length === 0) return "";
  const atOrAbove = entries.find(([w]) => w >= target);
  return `/${(atOrAbove ?? entries[entries.length - 1])[1]}`;
}

export function imgSrcSet(im) {
  return Object.entries(im.srcset || {}).map(([w, p]) => `/${p} ${w}w`).join(", ");
}

// --- Student class videos (/activities) --------------------------------------
// Grouped by CREATOR from the file name (creator-NN), never by guessed
// activity or guessed content. Names that don't fit the pattern land in the
// "More class videos" group (key null).

// Prettified caption exactly as it appears in the file name: "kennysaint" ->
// "Kennysaint". No invented surnames, businesses or roles.
export function prettifyCreator(key) {
  if (!key) return "More class videos";
  return String(key)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function resolveCreator(key) {
  const o = (creatorOverrides || []).find((c) => c.slug === key);
  if (o && o.name) {
    return { slug: key, name: o.name, business: o.business || "", provisional: false };
  }
  return { slug: key, name: prettifyCreator(key), business: "", provisional: !key ? false : true };
}

export function activityVideos() {
  const m = getDayManifest("activities");
  return (m.videos || []).map((v) => ({
    kind: "video",
    id: v.id,
    featured: !!v.featured,
    src: v.src,
    poster: v.poster,
    duration: v.duration,
    creator: v.creator ?? null,
    creatorOrder: v.creatorOrder ?? null,
    alt: "Student class video",
  }));
}

// Creator groups in stable order: first-video order, "More class videos" last.
// Videos inside a group follow their NN number.
export function activityCreators() {
  const groups = new Map();
  for (const v of activityVideos()) {
    const key = v.creator ?? null;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(v);
  }
  const out = [...groups.entries()].map(([key, videos]) => {
    videos.sort((a, b) => (a.creatorOrder ?? 9999) - (b.creatorOrder ?? 9999));
    return { key, ...resolveCreator(key), videos };
  });
  out.sort((a, b) => {
    if (a.key === null) return 1;
    if (b.key === null) return -1;
    return a.name.localeCompare(b.name);
  });
  return out;
}

export function activityPhotos() {
  const m = getDayManifest("activities");
  return (m.images || []).map((im, i) => ({
    kind: "image",
    id: im.id,
    featured: !!im.featured,
    srcset: im.srcset,
    blur: im.blur,
    w: im.w,
    h: im.h,
    fx: im.fx ?? 50,
    fy: im.fy ?? 25,
    alt: `Student class photo — ${i + 1}`,
  }));
}

export function formatDuration(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "";
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

// CSS object-position from the manifest focal point.
export function focusStyle(it) {
  return { objectPosition: `${it.fx ?? 50}% ${it.fy ?? 25}%` };
}
