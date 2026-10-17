# FIX REQUEST v3

Read `@MASTER_PROMPT.md` and `@CHANGE_REQUEST_v2.md` for context. Everything in them still applies except where this document overrides it. This request fixes four problems found on the live build. Do the phases at the bottom in order and stop after each one to summarize.

---

## A. Image framing: faces and heads are being cut off

**Cause:** photos are being cropped to fixed card shapes with a centered `object-fit: cover`. Event photos usually have people near the top of the frame, so the centered crop removes heads.

Fix it on three levels.

1. **Never crop in the pipeline.** Resize with `fit: "inside"` only, so the stored WebP files keep the original proportions. Respect EXIF rotation.
2. **Store a focal point per image.** In `scripts/build-media.mjs`, compute a focal point for each image with `sharp`'s attention strategy (`position: sharp.strategy.attention`, read `attentionX` and `attentionY` from the result info) and save it in the manifest as `fx` and `fy` (percentages). Add `src/data/focus-overrides.json` (empty object by default) where a file id can be mapped to `{ "x": 50, "y": 20 }` to override it by hand. Overrides always win.
3. **Frame sensibly in the UI.**
   - Every event photo that uses `object-fit: cover` must set `object-position: var(--fx, 50%) var(--fy, 25%)`. The fallback is **top-biased** (25%, not 50%) so heads survive when no focal point exists. Set `--fx` and `--fy` inline from the manifest.
   - **Large feature cards** (`Carousel3D`, day hero, gallery coverflow, lightbox): do not crop at all. Show the image with `object-fit: contain` over a **blurred, darkened copy of the same photo** filling the card. Cards keep a consistent shape without cutting anyone off.
   - **Small thumbnails** (ribbon rows, intro mini-galleries, day cards): `cover` with the focal point.
   - Portrait photos in landscape slots and landscape photos in portrait slots must use the contain-plus-blur treatment, never cover.
4. Add a dev tool: `npm run media:report` prints, per day, the number of source files, the number in the manifest, and a list of any skipped files with the reason (see section D).

---

## B. Intro redesign: five floating day cards with motion galleries

**Replace** the current intro with `IntroFiveDays`. It must show up before Home, once per session, and `?intro=1` forces it.

### Concept
Five large floating **day cards** (Day 1 to Day 5) in a **zigzag** arrangement. Each card is its own **mini motion gallery**: the photos inside it keep changing. The goal is to make the audience look at each card before deciding to enter, so the cards stay on screen after loading reaches 100%.

### Layout
- **Desktop and tablet (768px and up):** five cards in a horizontal zigzag. Cards 1, 3 and 5 sit higher; cards 2 and 4 sit lower, with slight overlap, different depths (scale 0.9 to 1.08, translateZ), and small tilts (±3 to 6°).
- **Mobile (under 768px):** a vertical zigzag. Cards alternate between the left-leaning and right-leaning positions down a tall field, about 56 to 64% of the screen width each, slightly overlapping. The field **slowly auto-pans** upward so every card passes through the middle of the screen, loops gently, and **pauses while the user touches or drags**. The user may drag the field up and down.
- Each card is the same size family, with a different float phase (sine drift of about ±10px, 6 to 9s, staggered) and a soft glow behind it. Use a deep purple gradient backdrop with subtle light blooms.

### Card contents
- Day numeral ("01" to "05"), the day title and the headline, in a gold-and-white caption strip at the bottom.
- The card body is a **rotating image gallery** using that day's images from the manifest (480px WebP):
  - Pull 5 to 8 images per day (featured first, then others), different from the other days.
  - Change images every **2.2 to 3 seconds**, **staggered per card** so they never all change at once.
  - Transition: a quick 3D flip or a crossfade with a slight Ken Burns zoom, alternating between the two styles card to card. Animate `transform` and `opacity` only.
  - Framing follows section A (cover with focal point on these small cards).
  - If a day has fewer than 5 images, loop what exists. A day with 1 image shows it with a slow zoom.
- A day with **no media** (Day 5, and Day 4 until it has media) shows a designed **"Coming Soon"** card with a shimmer sweep and the day title, still floating with the others. All five cards must always be present.

### Sequence
1. Start immediately with a branded background and a **loading counter (0 to 100%)** near the bottom center, labeled "Loading the experience". The counter tracks **real preloading** of the first two images of every card.
2. Each card **floats in** as soon as its first image has loaded, staggered, so something appears within about a second.
3. When the counter reaches **100%**, it morphs into a prominent gold **"Welcome"** button with a gentle pulse. **The cards keep floating and rotating images** behind and around it. Nothing freezes and nothing fades out.
4. A small **"Skip"** text link is visible from the first second.
5. Tapping **Welcome**: starts the ambient music (section C), the cards fly toward the camera with a purple wipe, and the route changes to Home. Tapping **Skip** goes to Home **without starting music**.
6. Do not auto-advance. The visitor decides when to enter.

### Fallbacks
- `prefers-reduced-motion` or a low-end device: keep the zigzag layout and the Welcome button, drop the 3D flips, drifting and auto-pan, use simple crossfades every 3.5 seconds and render fewer images per card (max 4).
- If no day has any media at all, show the five cards in "Coming Soon" state and the Welcome button as normal.
- Make sure the intro never traps focus: Welcome and Skip are keyboard accessible.
- Keep the intro light. Use only the 480px WebP files and never load videos in it.

---

## C. Soft ambient background music

**Important browser rule:** browsers (including Chrome and WhatsApp's in-app browser on Android) **block audio that starts without a user tap**. So music **cannot** start by itself when the counter reaches 100%. It must start when the visitor taps **Welcome**, which satisfies the browser and is a clean way to begin. Build it that way. Do not try workarounds.

Requirements:
- Create a small audio system in the shared layout (not inside a page) so the music **continues across routes** without restarting.
- `AmbientMusicProvider`: owns a single `Audio` element for `/audio/ambient.mp3`, `loop = true`, `preload = "none"` until the first start. It exposes `start()`, `toggleMute()` and a state (`idle`, `playing`, `muted`).
- On `start()`, play at **very low volume** and **fade in** to about **0.2** over about 2 seconds.
- A small round **mute/unmute toggle** appears at the **bottom-left** once the music has started (keep the WhatsApp button at bottom-right). It must not overlap content, the lightbox controls or video controls. Provide an accessible label.
- **Pause automatically** when the tab or app goes to the background (`visibilitychange`) and resume when it returns, unless the user muted it.
- **Duck** the music (fade to near zero) while any video with sound is playing, then restore it afterwards.
- Remember the user's mute choice for the session with try/catch around storage.
- If `play()` is rejected, fail silently and show the toggle in the muted state.
- **Do not add or generate an audio file.** Reference `/audio/ambient.mp3` only. If the file is missing, hide the toggle and never throw an error. The README must say: put a royalty-free ambient loop at `public/audio/ambient.mp3`, keep it under about 1.5 MB (for example 90 to 120 seconds, 96 kbps, seamless loop), and **check that its license allows commercial use and any credit it requires**.
- Never hotlink music from another site.

---

## D. Day pages are only showing a few of the day's images

Day 1 has 27 images in its folder but the motion gallery at the top shows only 7. The top carousel was specified to use the `featured-` files, so 7 may simply be the featured set. But the page must also show the rest. Fix both the cause and the presentation.

1. **Check the pipeline first.** Run `npm run media:report` (build it per section A.4). For every day, compare source files with manifest entries and list each skipped file with the reason. Common causes: uppercase or unusual extensions (`.JPG`, `.jpeg`, `.JPEG`, `.HEIC`), files that failed conversion, or the scan being limited to a `featured-` prefix. Fix the scan so it is **case-insensitive** and accepts `.jpg .jpeg .png .webp .heic` (convert HEIC when `sharp` supports it, otherwise log a clear warning naming the file) and `.mp4 .mov .webm .m4v` for video. Report the final counts per day.
2. **Day hero carousel:** use featured items first, then top up with non-featured items until it has **at least 12 items** (or all items if fewer). Keep mounting at most 5 cards at a time for performance, but the full pool must be reachable by swiping or the arrows.
3. **"The day in pictures" section must show everything.** A header with the real counts ("27 photos · N videos"), then a `RibbonDrift` of all items, then a masonry grid that loads **24 items at a time** with a "Load more" button. Tapping any item opens the lightbox, and the lightbox can step through **every item of that day**.
4. Add a dev assertion: if the number of items rendered in the "day in pictures" module differs from the manifest count for that day, log `console.error` with the day and both numbers.
5. Apply the same rule to `/gallery`: the "All" view must contain every item from every day, windowed for performance.

---

## Phases (stop and summarize after each)

1. **A and D** (framing, pipeline report, full day media). Run `npm run media:report` and print the per-day counts. Show before and after for the Day 1 page.
2. **B** (the five-card floating intro, without music yet).
3. **C** (ambient music, wired to Welcome and the toggle).
4. **QA** against the checklist.

## Acceptance checklist

- [ ] No photo has a head cut off on a 360px phone in the intro, home, day hero, ribbon or gallery. Overrides in `focus-overrides.json` work.
- [ ] The intro shows five zigzag day cards; each rotates through different images of its own day; staggered; Day 5 (and Day 4 if empty) shows Coming Soon.
- [ ] The counter tracks real loading, becomes a gold Welcome button at 100%, and the cards keep floating and rotating while it waits.
- [ ] Welcome starts soft music with a fade-in; Skip does not; music continues across routes; the mute toggle works; music pauses in the background and ducks under video sound.
- [ ] Missing audio file does not break anything.
- [ ] `npm run media:report` counts match the folders; Day 1 shows all 27 images and its videos on the page, with a lightbox that steps through all of them.
- [ ] `/gallery` "All" contains every item.
- [ ] Reduced-motion and low-end fallbacks work; no horizontal scroll at 360px.
- [ ] No invented content; all earlier hard rules still hold.

At the end, list assumptions, anything still unfilled, and any files skipped or over the size limits.
