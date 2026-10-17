# UPDATE PROMPT (FINAL): one file, do it in order

Background documents (read once for context): `@MASTER_PROMPT.md` and `@CHANGE_REQUEST_v2.md`. **This file is the current to-do list. Where it conflicts with them, this file wins.** Ignore `FIX_REQUEST_v3.md` if present; everything from it that still matters is repeated here.

## How to work
- Do the phases **in order**. After each phase, print a short summary with real numbers and **stop**. Wait for me to say "continue".
- Never invent names, quotes, numbers or facts. Never guess who a person is from a photo.
- All earlier hard rules still apply (copyright line, no logos, noindex, mobile first, performance, reduced motion).

## Already done (do not redo, do not undo)
- Multipage routing, nav and page shells.
- On Day pages: the spotlight gallery (one photo on stage, neighbors behind, thumbnail strip, autoplay with pause on touch), full uncropped photos in a matte frame sized from the real dimensions, and top-anchored crops where a fixed crop remains. Keep this approach.

---

## PHASE 1: Media pipeline and real counts

Fix the scan and make the numbers visible.

1. **Scan rules (apply to every day, and to the people folders in phase 5):** look **recursively** through `media-source/dayN/`. Classify files by extension, **case-insensitive**, wherever they sit: in the day's root, or in `images/` and `videos/` subfolders.
   - Images: `.jpg .jpeg .png .webp .heic` (convert HEIC when `sharp` supports it; otherwise log a clear warning naming each file).
   - Videos: `.mp4 .mov .webm .m4v`.
   - **Day 4's files are in the root of `media-source/day4/`**, not in a subfolder. This must work. Day 4 should then switch from "media coming soon" to a full day page automatically.
2. Keep the earlier output rules (WebP at 480/960/1600, blur placeholder, EXIF rotation respected, no cropping, video under 20 MB with poster, `featured-` prefix flagged).
3. **Focal points:** store per image `fx` and `fy` (percent) using `sharp`'s attention strategy (`attentionX`, `attentionY`). Add `src/data/focus-overrides.json` (empty by default) so a file id can be mapped to `{ "x": 50, "y": 20 }`. Overrides win.
4. **Build `npm run media:report`.** For each day it prints: source images, source videos, images in the manifest, videos in the manifest, and a list of every skipped file with the reason. Run it now and **show me the table.**

Stop after printing the table.

## PHASE 2: Day pages must show every item

Day 1 has about 27 images and the top gallery was showing only 7 (it was using only the `featured-` files). Fix the presentation for every day.

- **Day hero gallery:** use featured items first, then top up with non-featured items until it has at least 12 (or all, if fewer). Mount at most 5 cards at a time but let the whole pool be reachable by swipe, arrows and thumbnails.
- **"The day in pictures" section shows everything:** a header with the real counts ("27 photos · 3 videos"), a `RibbonDrift` of all items, a masonry grid that loads 24 at a time with a "Load more" button, and a lightbox that steps through **every item of that day** (swipe, keyboard, focus trap, videos play).
- Add a dev assertion: if the number rendered in that section differs from the manifest count for the day, `console.error` with the day and both numbers.
- `/gallery` "All" must contain every item from every day, windowed for performance.
- **Framing (light touch):** thumbnails, ribbons and intro cards use `object-fit: cover` with `object-position: var(--fx, 50%) var(--fy, 25%)` set from the manifest. Large cards show the whole photo (contain) over a blurred copy of itself.

Stop after this phase. Tell me the per-day counts shown on each page.

## PHASE 3: The five-day floating intro

Replace the current intro with `IntroFiveDays`. Show it before Home, once per session. `?intro=1` forces it.

**Concept:** five large floating **day cards** (Day 1 to Day 5) in a **zigzag**. Each card is its own **mini motion gallery** whose photos keep changing. The cards stay on screen after loading reaches 100% so the audience can look at each one before choosing to enter.

**Layout**
- 768px and up: a horizontal zigzag. Cards 1, 3, 5 sit higher; cards 2 and 4 sit lower; slight overlap, different depths (scale 0.9 to 1.08, translateZ), small tilts (±3 to 6°).
- Under 768px: a vertical zigzag, cards about 56 to 64% of the screen width, alternating left and right down a tall field, slightly overlapping. The field **slowly auto-pans** so every card passes through the middle of the screen, loops gently, **pauses while the user touches or drags**, and can be dragged up and down.
- Each card floats with its own phase (sine drift about ±10px, 6 to 9 seconds, staggered) and a soft glow. Deep purple gradient background with subtle light blooms.

**Card contents**
- Day numeral ("01" to "05"), title and headline in a gold-and-white caption strip.
- The body is a rotating image gallery using that day's images (480px WebP): 5 to 8 images per day (featured first), changing every 2.2 to 3 seconds, **staggered per card** so they never all change at once. Alternate between a quick 3D flip and a crossfade with a slight zoom. Animate `transform` and `opacity` only. Framing as in Phase 2. A day with fewer than 5 images loops what it has.
- A day with **no media** shows a designed "Coming Soon" card with a shimmer sweep, still floating. All five cards are always present.

**Sequence**
1. A loading counter (0 to 100%) near the bottom center, labeled "Loading the experience", tied to **real preloading** of the first two images of each card.
2. Each card floats in as soon as its first image loads, staggered.
3. At **100%** the counter morphs into a prominent gold **"Welcome"** button with a gentle pulse. **The cards keep floating and rotating behind it.** Nothing freezes or fades out.
4. A small **"Skip"** link is visible from the first second.
5. **Welcome** starts the ambient music (phase 4), flies the cards toward the camera with a purple wipe and goes to Home. **Skip** goes to Home **without music**. No auto-advance.

**Fallbacks:** reduced motion or a low-end device keeps the zigzag layout and the Welcome button but drops flips, drift and auto-pan; use simple crossfades every 3.5 seconds and at most 4 images per card. If no day has any media, show five Coming Soon cards. Welcome and Skip must be keyboard accessible. The intro uses only 480px images, never videos.

Stop after this phase.

## PHASE 4: Ambient music

**Browser rule:** browsers (including WhatsApp's in-app browser on Android) block audio that starts without a user tap, so music cannot start by itself at 100%. It starts when the visitor taps **Welcome**. Build it that way and do not attempt workarounds.

**Find the audio file.** I uploaded it under `public/audio/`, and **its name is not `ambient.mp3`**. Do not assume a name. Look through `public/audio/` recursively, list every audio file you find (mp3, m4a, aac, ogg, wav) with its size, and tell me which one you will use (ask me if there are several). Handle spaces and special characters in the name safely (encode the URL). If the file is bigger than about 2 MB, warn me, and if `ffmpeg` is available write a compressed 96 kbps copy next to it without deleting the original.

**Build `AmbientMusicProvider`** in the shared layout so the music continues across routes:
- One `Audio` element, `loop = true`, `preload = "none"` until the first start. It exposes `start()`, `toggleMute()` and a state (`idle`, `playing`, `muted`).
- On `start()`, fade in to about **0.2** volume over about 2 seconds.
- A small round **mute/unmute button at bottom-left** appears once the music has started (the WhatsApp button stays at bottom-right). It must not cover content, lightbox controls or video controls. Accessible label.
- Pause when the tab or app goes to the background (`visibilitychange`) and resume on return unless the user muted it.
- **Duck** (fade to near zero) while any video with sound plays, then restore.
- Remember the mute choice for the session with try/catch around storage.
- If `play()` is rejected, fail silently and show the toggle muted. If the file is missing, hide the toggle and never throw.
- Never hotlink music. Update the README with how to swap the track and a reminder to keep its license note in the project docs (not in `public/`).

Stop after this phase.

## PHASE 5: People pages (organizers and lecturer), temporary names

The organizers and the lecturer are the whole team behind the training. **Do not create a team or behind-the-scenes section or folder.** Real names are not available yet.

**Folders:** `media-source/people/organizers/` and `media-source/people/lecturer/` (create them with a `.gitkeep` if missing). Photos from me will be named like `organizer-1.jpg` and `lecturer-1.jpg`. Phone default names (like `IMG_2034.jpg`) are also possible.

**Pipeline:** 3:4 portrait WebP at 400, 800 and 1200 px wide, focal point stored per image with a **top-biased fallback so faces are never cut off**, blur placeholders, and a people manifest keyed by file-name slug. Missing folders must not crash the build.

**Temporary captions (until real names arrive):**
- Turn the file name into a readable label (drop the extension, replace dashes and underscores with spaces, title-case).
- If the name looks like a camera or phone default (IMG_, DSC, PXL, WhatsApp Image, mostly digits), do not show it: use "Organizer 1", "Organizer 2" and so on, and "Lecturer" for lecturer photos.
- Never guess a name or role from a photo.
- Mark every person whose name came from a file name with `provisional: true` and print a **build warning** listing them (for example "6 people still have provisional names").
- Real names will go in **one file, `src/data/people.js`**, as a list of `{ slug, name, title, org }`. An entry there overrides the file-name caption. **Create that file now** with an empty list and a comment explaining the format. The pages must read from it.

**Pages**
- `/organizers`: a "With Gratitude" hero, then the two organizations (NCDMB: Organizer; GFOL Global Ltd: In collaboration with, names only, no descriptions, no logos), then portrait cards with tilt using the caption rules, then a closing thank-you block.
- `/lecturer`: title from `lecturer.pageTitle`, the lecturer's photos in a carousel (never cropped: contain over a blurred copy), MEO AI Academy with its tagline, and the five-day teaching strip linking to the day pages.
- Put the thank-you note in config as `gratitude.message`, unsigned, and show a short version as a closing section on Home that links to `/organizers`:

  "This training was possible because of the people who planned it, organized it and delivered it. To the organizers and our lecturer, the team behind these five days: thank you for your time, your effort and the opportunity you created for us."

- Same face-safe framing rules as everywhere.

Stop after this phase.

---

## FINAL QA CHECKLIST
- [ ] `npm run media:report` counts match the folders for every day (Day 4 included); skipped files are listed with reasons.
- [ ] Day 1 shows all its images and videos on the page with the real counts and a lightbox that steps through them all. `/gallery` "All" has everything.
- [ ] No head is cut off at 360px in the intro, home, day hero, ribbon, gallery, organizers or lecturer pages.
- [ ] The intro shows five zigzag day cards with rotating images; Coming Soon cards where a day has no media; the Welcome button appears at 100% while the cards keep moving; Skip works.
- [ ] Welcome starts soft music with a fade-in; Skip does not; music continues across routes; mute works; it pauses in the background and ducks under video sound; a missing file breaks nothing.
- [ ] People pages work with provisional captions; the build warns about them; `src/data/people.js` overrides them.
- [ ] No horizontal scroll at 360px; reduced-motion and low-end fallbacks work.
- [ ] No invented content anywhere.

**At the end of the last phase, report:** assumptions, which audio file was used, anything still unfilled, and any media skipped or over the size limits.
