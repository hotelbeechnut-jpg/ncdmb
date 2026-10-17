import { useState } from "react";
import { usePageMeta } from "../hooks/usePageMeta";
import { Reveal } from "../components/Reveal";
import PageHeader from "../components/PageHeader";
import { approvedTestimonials } from "../data/testimonials";
import { event } from "../config/event";
import { whatsappLink } from "../utils/placeholders";

export default function Testimonials() {
  usePageMeta("Voices from the room", "What participants said about the 5-day seminar.");
  const withDay = approvedTestimonials.some((t) => t.day != null);
  const [filter, setFilter] = useState("All");
  const items =
    filter === "All" ? approvedTestimonials : approvedTestimonials.filter((t) => t.day === Number(filter.replace("Day ", "")));

  const wa = whatsappLink(
    event.builder.whatsapp,
    "Hello, I'd like to share my seminar experience for the recap page."
  );

  return (
    <>
      <PageHeader
        kicker="Testimonials"
        title="Voices from the room"
        intro="Real words from the business owners in the room — shared with permission."
      />
      <div className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {approvedTestimonials.length === 0 ? (
            <Reveal>
              <div className="mx-auto max-w-2xl rounded-cardlg border border-ink/10 bg-paper p-8 text-center shadow-soft sm:p-12">
                <p className="font-display text-2xl font-bold text-ink">Participant stories are coming soon.</p>
                <p className="mx-auto mt-3 max-w-md text-[15px] text-ink/65">
                  Interviews are still being gathered. Were you there? Share your experience on
                  WhatsApp and it could appear here.
                </p>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-[52px] items-center rounded-full bg-gold px-8 text-base font-bold text-ink"
                >
                  Share my story on WhatsApp
                </a>
              </div>
            </Reveal>
          ) : (
            <>
              {withDay && (
                <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by day">
                  {["All", "Day 1", "Day 2", "Day 3", "Day 4", "Day 5"].map((f) => (
                    <button
                      key={f}
                      role="tab"
                      aria-selected={filter === f}
                      onClick={() => setFilter(f)}
                      className={`inline-flex min-h-[44px] items-center rounded-full px-5 text-sm font-semibold ${
                        filter === f ? "bg-purple-700 text-white" : "border border-ink/15 bg-paper text-ink"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((t) => (
                  <Reveal key={t.id}>
                    <figure className="h-full rounded-cardlg border border-ink/10 bg-paper p-6 shadow-soft">
                      {t.quote && (
                        <blockquote className="font-display text-lg font-medium leading-relaxed text-ink">
                          “{t.quote}”
                        </blockquote>
                      )}
                      <figcaption className="mt-4 text-sm">
                        <span className="font-bold text-ink">{t.name}</span>
                        {[t.business, t.location].filter(Boolean).length > 0 && (
                          <span className="text-ink/60">
                            {" "}· {[t.business, t.location].filter(Boolean).join(", ")}
                          </span>
                        )}
                        {t.day != null && (
                          <span className="ml-2 rounded-full bg-lavender-100 px-2 py-0.5 text-xs font-semibold text-purple-700">
                            Day {t.day}
                          </span>
                        )}
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
