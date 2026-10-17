// Real names override the provisional file-name captions from the pipeline.
// One entry per person, matched by `slug` (see src/data/people-manifest.json).
//
// Format:
//   { slug: "ada-obi", name: "Ada Obi", title: "Director", org: "NCDMB" }
//
// - `slug`, `name` are required. `title` and `org` are optional.
// - An entry here replaces the file-name caption everywhere and clears the
//   provisional flag (and the build warning) for that person.
// - Never guess: only add people whose details were actually supplied.
export const people = [];
