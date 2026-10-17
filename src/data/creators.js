// Real names override the provisional file-name captions for student class videos.
// One entry per creator, matched by `slug` (lowercase creator key from the file
// name, e.g. "kennysaint" for kennysaint-01.mp4; see the `creator` field in
// src/data/media-manifest.json under `activities`).
//
// Format:
//   { slug: "kennysaint", name: "Kennysaint", business: "" }
//
// - `slug` is required. `name` replaces the prettified file-name caption;
//   `business` is optional and shown only when supplied.
// - An entry here clears the provisional flag (and the build warning) for that creator.
// - Never guess: no invented surnames, businesses or roles. Leave the list empty
//   until details are actually supplied.
export const creators = [];
