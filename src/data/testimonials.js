// Testimonials data. Participants will be interviewed — add entries as they arrive.
// ONLY entries with consent: true are rendered, everywhere on the site.
// Everything else is ignored silently. Never fabricate names or quotes.
export const testimonials = [
  // {
  //   id: "t1",
  //   name: "", business: "", location: "",
  //   quote: "",                 // short written quote (optional)
  //   video: "",                 // file name in media-source/testimonials (optional)
  //   audio: "",                 // optional
  //   photo: "",                 // optional
  //   day: null,                 // optional: which day it relates to
  //   consent: false             // MUST be true to be displayed
  // }
];

// Only consented entries, everywhere.
export const approvedTestimonials = testimonials.filter((t) => t.consent === true);
