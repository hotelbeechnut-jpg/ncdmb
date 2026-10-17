import { useEffect } from "react";

// Sets per-page document.title and meta description.
// (WhatsApp link previews use the static tags in index.html — see README.)
export function usePageMeta(title, description) {
  useEffect(() => {
    if (title) document.title = `${title} — Seminar Recap`;
    const tag = document.querySelector('meta[name="description"]');
    if (tag && description) tag.setAttribute("content", description);
  }, [title, description]);
}
