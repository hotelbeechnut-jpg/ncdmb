# UPDATE ADDENDUM 2: music volume, Break Time page, Activities page

Read `@UPDATE_PROMPT_FINAL.md` and `@MASTER_PROMPT.md` for background; their rules still apply (no invented facts, face-safe framing, mobile first, reduced motion, performance). This addendum adds three phases. Do them **in order**, print a short summary with real numbers after each, and **stop**.

---

## PHASE 6: Ambient music is too quiet

The music plays but cannot be heard. Make it clearly audible without being loud.

1. **Raise the default volume** from about 0.2 to **0.55**, with the same 2-second fade-in. Keep the mute button, and add a small **volume control** next to it (a slider that appears when the button is tapped or held, or a simple Low / Medium / High cycle, whichever is easier on mobile). Remember the chosen level for the session with try/catch around storage.
2. **Check the audio file itself.** The track may be mastered quietly. Use `ffmpeg` to measure its loudness (`-af loudnorm=print_format=summary`). If the integrated loudness is quieter than about -18 LUFS, write a **normalized copy** (target about -16 LUFS, true peak -1.5 dB, 96 kbps stereo) next to the original, point the player at the copy, and **do not delete the original**. Report the before and after loudness.
3. **Check the ducking logic.** Music must only be reduced while a video with sound is actually playing and unmuted. Muted autoplay videos (the day clips, the hero background) must **not** duck it. Find out whether ducking is currently stuck on or is triggered by muted videos, and fix it. State what you found.
4. Confirm there is no other code lowering the volume (for example a second volume cap, a fade that never completes, or `audio.volume` being reset on route changes).
5. Keep the earlier rules: starts only after the visitor taps Welcome, pauses when the app goes to the background, continues across routes, and fails silently if the file is missing.

Stop after this phase and tell me the final volume values and the loudness numbers.

---

## PHASE 7: Break Time page (and remove eating photos from the day pages)

Some of the day photos show breakfast and lunch. Those must move off the day pages onto their own page.

### Folder
Create `media-source/break-time/` with a `.gitkeep` and a short README. I will **move the eating photos there myself** (cut and paste out of the day folders). Subfolders are optional (`day1/`, `day2/` and so on) and mean "which day it was taken". Do not try to detect eating photos automatically; only use what is in that folder.

### Pipeline
- Process `media-source/break-time/` exactly like a day folder: recursive scan, case-insensitive extensions, photos and videos, WebP sizes, blur placeholders, focal points, video posters. Output a `break-time` section in the manifest.
- **Add a prune step.** Currently generated files for photos that I move out of a day folder may linger in `public/media/dayN/` and the manifest. Before generating, delete any generated output (and manifest entry) whose source file no longer exists, for **all** folders. Never delete anything from `media-source/`.
- Extend `npm run media:report` with a `break-time` row and print how many items disappeared from each day since the last run.
- The per-day counts will drop after I move the files. That is expected.

### Page `/break-time`
- Title: **"Break Time"**, subtitle "Breakfast and lunch". Intro copy, unsigned: "Learning runs better on good food and good company. Between sessions, participants stepped away for breakfast and lunch, shared a table and talked about what they had just learned." Do not claim who provided the food or anything about the menu.
- Hero: a 3D carousel (`Carousel3D`) of the best photos (featured first), faces never cropped (contain over blurred copy for large cards, top-anchored focal points for small crops).
- Then a `RibbonDrift` of everything, a masonry grid with "Load more" (24 at a time), and a lightbox that steps through every item.
- If subfolders by day exist, show day filter chips (All, Day 1 and so on).
- Real counts in a header ("N photos · N videos"). Empty state: "Break-time photos are coming soon."
- A dev assertion: if the number rendered differs from the manifest count, `console.error` with both numbers.

### Remove from the day pages
After the pipeline prunes, the day pages, the intro cards and the home page must show only what remains in each day's folder. Add a small tile on each day page's "day in pictures" section linking to `/break-time` ("Break time moments") so the food photos are still easy to find.

### Regression safety: the day counts have dropped
I have already moved the eating photos out of the day folders into `media-source/break-time/`. Every day now has fewer items than before. The site must not rely on any count or file that no longer exists. Do all of this and report what you found:

1. Run `npm run media` with the prune step and confirm that generated files and manifest entries for the moved photos are gone from `public/media/dayN/` and from every manifest, and that the same photos now appear under `break-time`.
2. **Search the whole `src/` folder for hard-coded numbers and file names** tied to media (for example 27, 7, 12, specific file names, array indexes into a day's list, specific `featured-` file names). Replace any with values read from the manifest. List each one you changed.
3. **Re-test every layout threshold** against the new counts. The rules are 0 items, 1 to 4, 5 to 12, 13 or more, and the minimum of 12 for the day hero gallery. A day may now fall into a different layout; confirm each day's page, its intro card and its Home card still render correctly with its new count. Print the new count and the layout each day now uses.
4. **Check `focus-overrides.json` and any other file keyed by image id.** Entries for photos that moved are harmless, but they must not cause errors. Make sure image ids are **namespaced by folder** (for example `day1/photo-12`) so a photo with the same file name in `break-time` and in a day can never collide.
5. Check that the `featured-` flag still works for photos that moved (their prefix moved with them), and that no day is left with zero featured photos in a way that breaks the hero gallery. The top-up rule (featured first, then others) must handle it.
6. Run the production build and confirm there are **no broken image or video URLs** in the output (scan the built pages and the manifests for paths that don't exist in `dist/`), no console errors on `/`, each `/day/N`, `/gallery`, `/break-time` and the intro, and that the dev assertions for rendered counts pass on every page.
7. Apply the same prune-and-verify logic to the people and activities folders in Phase 8, so moving files later never breaks a page.

Stop after this phase and show me the report table with the new per-day counts, the layout each day now uses, and the list of hard-coded values you removed.

---

## PHASE 8: Activities page

### Concept
A page showing the **class activities** participants did across the days (hook battle, Platform Court, audience narrowing, Canva and CapCut practice, and so on), with photos and videos from each one. Media will be uploaded later, so the page must work empty and fill itself in.

### Folders (create them now, each with a `.gitkeep`)
Create one folder per activity under `media-source/activities/`, named `dayN-activity-slug`, using the `activities` arrays in `src/data/days.js`. For example:
`day1-your-business-your-story`, `day1-audience-narrowing-challenge`, `day1-channel-match-game`, `day1-course-case-study`, `day1-60-second-presentation`, `day2-scroll-or-stop`, `day2-hook-battle`, `day2-pidgin-hook-challenge`, `day3-platform-court`, `day3-metric-detective`, `day3-one-week-plan`, `day4-photo-challenge`, `day4-make-a-canva-post`, `day4-edit-a-short-video`, `day4-spot-the-ai-lie`, `day4-fix-this-bad-post`, plus `other/` for photos that don't fit an activity. Slug every activity title from `days.js` the same way. Print the folder list when you are done so I can see where to drop files.

### Data
Create `src/data/activities.js`, generated from `days.js` with `{ slug, day, title, description }` for each activity. Any folder in `media-source/activities/` that has no matching entry is still shown, using a prettified folder name, under "More moments". Do not invent descriptions beyond what is in `days.js`.

### Pipeline
Process `media-source/activities/**` like the day folders (same scan, WebP sizes, focal points, posters, prune step) and output an `activities` section in the manifest keyed by folder slug. Add it to `npm run media:report`.

### Page `/activities`
- Hero: title "Class Activities", intro copy, unsigned: "The training was built around doing. Here are the exercises participants worked through, from writing hooks to designing graphics and editing short videos." Show a `FloatingGallery3D` of featured photos from all activities.
- Day filter chips (All, Day 1 to Day 5).
- One **activity block** per activity that has media (and, below them, compact "photos coming soon" cards for those without): activity title, day tag, its description from `days.js`, a motion gallery module chosen by item count (the rules in `@CHANGE_REQUEST_v2.md` section 4), and a lightbox stepping through that activity's items.
- Link each block to its day page, and add a "See the activities" link to each day page (jumping to that day's blocks via `/activities?day=N`).
- Empty state when no activity has media: "Activity photos are coming soon."
- Real counts in the header. Dev assertion as on the other pages.

---

## Navigation
Adding pages makes the menu too long. Regroup it:
- **Journey** (Days 1 to 5)
- **Moments** (Activities, Break Time, Gallery)
- **People** (Organizers, Lecturer, Testimonials)
- **Build Yours** (gold button)

On mobile use a sheet with these groups as sections. Keep Home as the logo link. Update the footer links and the sitemap-like list in the README.

## Checklist
- [ ] Music is clearly audible at default volume; the volume control works; muted autoplay videos no longer duck it.
- [ ] Moving a photo out of a day folder removes it from `public/media`, the manifest and every page after `npm run media`.
- [ ] `/break-time` shows only what is in `media-source/break-time/`, with real counts and a stepping lightbox.
- [ ] `/activities` works with zero media (empty state) and with media; per-activity folders exist and are listed.
- [ ] Menu is grouped and usable at 360px.
- [ ] No horizontal scroll at 360px; no head is cut off anywhere; no invented content.

At the end, report assumptions and anything left unfilled.
