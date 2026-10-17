import { lecturer as lecturerContent } from "./people-content.js";

// Lecturer identity comes from people-content.js (single source of truth).
// Title, dates, location and offer below stay as unfilled placeholders.
export const event = {
  title: "[EVENT TITLE]",                 // placeholder until confirmed
  subtitle: "Digital Marketing Skill Acquisition Seminar",
  dates: "[EVENT DATES]",
  location: "[LOCATION]",
  attendeesLabel: "50+ small business owners",
  daysCount: 5,

  lecturer: {
    name: lecturerContent.name,
    pageTitle: "Meet the Erudite Lecturer",
    brand: "MEO AI Academy",
    tagline: lecturerContent.tagline,
    role: "Lead Facilitator",
    bio: lecturerContent.bio, // extra paragraphs, rendered only when non-empty
    credentials: [],    // supplied later
    link: ""            // optional
  },
  organizers: {
    lead: { name: "Nigerian Content Development & Monitoring Board", short: "NCDMB", roleLabel: "Organizer" },
    collaborator: { name: "GFOL Global Ltd", roleLabel: "In collaboration with" },
    // People to feature on the Organizers page. Leave empty until supplied.
    // Photos are picked up automatically from media-source/people/organizers/.
    people: [
      // { name: "[NAME]", title: "[TITLE]", org: "NCDMB", bio: "", photo: "" }
    ]
  },
  sponsor: { enabled: false, name: "NNPC", label: "Sponsored by" }, // hidden until confirmed
  showLogos: false,
  credit: { mode: "commissioned", commissionedBy: "GFOL Global Ltd" },

  builder: {
    name: "Talent Loop Webdev Services",
    site: "https://webdev.talent-loop.org",
    email: "webdev@talent-loop.org",
    whatsapp: "2349069137205",
    whatsappMessage: "Hello, I saw the seminar recap site and I'd like a website for my business."
  },

  offer: {
    enabled: true,
    headline: "[ATTENDEE OFFER HEADLINE]",
    details: "[OFFER DETAILS]",
    deadline: "[DEADLINE]"
  },

  gate: { enabled: false, code: "" },     // optional soft gate; off by default

  gratitude: {
    message: "This training was possible because of the people who planned it, organized it and delivered it. To the organizers and our lecturer, the team behind these five days: thank you for your time, your effort and the opportunity you created for us."
  },

  portfolio: [
    // enabled:false until a url and screenshot path are supplied for each
    { name: "biblequiz-eog", url: "", image: "", blurb: "", enabled: false },
    { name: "edafedmouthpiece", url: "", image: "", blurb: "", enabled: false },
    { name: "pebnews-web", url: "", image: "", blurb: "", enabled: false },
    { name: "kayriott", url: "", image: "", blurb: "", enabled: false },
    { name: "okarobetty", url: "", image: "", blurb: "", enabled: false },
    { name: "Beechnut Hotel", url: "", image: "", blurb: "", enabled: false },
    { name: "Najpen", url: "", image: "", blurb: "", enabled: false },
    { name: "Talent Loop", url: "", image: "", blurb: "", enabled: false }
  ]
};
