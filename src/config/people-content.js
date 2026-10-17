// Single source of truth for the people on this site — edit here, and the
// Home hero, facilitator band, Lecturer page, footer and metadata follow.
//
// FILL IN LATER:
// - lecturer.bio: extra paragraphs about Martha (rendered only when non-empty).
// - lecturer.academy: a short "About MEO AI Academy" description, ONLY when
//   you can state real facts (what it does, founded when, real numbers).
//   Until then the site builds that block purely from founder + role +
//   tagline below and invents nothing.
// - creator.phone / phoneDisplay / phoneTel / whatsapp hold the real numbers
//   (whatsapp as international digits only, no "+", no spaces). If they ever
//   go back to <<...>> placeholder text the site renders nothing for them
//   (no broken links).
export const lecturer = {
  name: "Martha Edword-Ohre",
  role: "Founder, MEO AI Academy",
  seminarRole: "Lead Facilitator of this seminar",
  tagline: "Learn AI. Apply AI. Achieve Big.",
  bio: [],
  academy: "",
};

export const creator = {
  name: "Nathaniel Kenny Olie",
  role: "CEO, Talent Loop Webdev Services",
  location: "Warri, Nigeria",
  phone: "08066268760",
  phoneDisplay: "0806 626 8760",
  phoneTel: "+2348066268760",
  whatsapp: "2349069137205",
  email: "webdev@talent-loop.org",
  website: "https://webdev.talent-loop.org",
  heading: "Hi, I'm Nathaniel, the person behind this recap.",
  intro: [
    "I built this recap website for the five-day digital marketing seminar, so the lessons, the photos and the moments could live somewhere attendees can come back to any time.",
    "I'm the CEO of Talent Loop Webdev Services. We build fast, professional websites for local businesses. If this recap made you think about what a website of your own could do for your business, I would be glad to talk.",
  ],
  videoCaption: "What Talent Loop Webdev Services is about",
  whatsappMessage:
    "Hello, I saw the seminar recap and I'd like to build a website for my business.",
};

// True only when the owner has replaced the <<...>> placeholder text.
export function hasRealPhone() {
  return (
    typeof creator.phone === "string" &&
    creator.phone.length > 0 &&
    !creator.phone.includes("<<")
  );
}

export function hasRealWhatsapp() {
  return (
    typeof creator.whatsapp === "string" &&
    /^[0-9]{7,15}$/.test(creator.whatsapp)
  );
}
