import { useState } from "react";
import { event } from "../config/event";
import { isOfferRenderable, whatsappLink } from "../utils/placeholders";
import { Reveal } from "./Reveal";

const SERVICES = [
  { title: "Business website", body: "A fast, professional site that presents your business clearly and makes it easy to contact you." },
  { title: "Google Business Profile setup", body: "Get found on Google Search and Maps with a complete, trustworthy business listing." },
  { title: "WhatsApp-connected pages", body: "Enquiry and order pages wired straight to your WhatsApp — chats become sales." },
  { title: "Email list capture setup", body: "Start owning the customer relationship with a simple list you control, not rent." },
];

export default function Pitch() {
  const offerOk = isOfferRenderable(event.offer);
  const waBase = whatsappLink(event.builder.whatsapp, event.builder.whatsappMessage);
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [need, setNeed] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const msg = `Hello, I'm ${name || "[my name]"} from ${business || "[my business]"}. I need: ${need || "a website for my business"}. I saw the seminar recap site.`;
    window.open(whatsappLink(event.builder.whatsapp, msg), "_blank", "noopener");
  };

  const portfolioOn = (event.portfolio || []).filter((p) => p.enabled && p.url);

  return (
    <section id="build" className="bg-paper py-14 sm:py-20" aria-labelledby="build-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">
            By {event.builder.name}
          </p>
          <h2 id="build-h" className="font-display mt-2 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            You’ve just seen what an owned asset can feel like. Let’s build yours.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-ink/70 sm:text-lg">
            The seminar taught that a website and an email list are assets you own, while social
            accounts are rented. This recap site is itself an example — fast, beautiful, and working
            for you around the clock. We can build one for your business too.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="h-full rounded-cardlg border border-ink/10 bg-white p-6 shadow-soft">
                <h3 className="font-display text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-8 grid gap-4 rounded-cardlg border border-ink/10 bg-white p-6 shadow-soft sm:grid-cols-3 sm:p-8">
            <div>
              <div className="font-display text-lg font-bold text-purple-700">Be found</div>
              <p className="mt-1 text-sm text-ink/65">Show up clearly when customers search for what you do.</p>
            </div>
            <div>
              <div className="font-display text-lg font-bold text-purple-700">Be trusted</div>
              <p className="mt-1 text-sm text-ink/65">A professional site answers questions before customers even ask.</p>
            </div>
            <div>
              <div className="font-display text-lg font-bold text-purple-700">Own the relationship</div>
              <p className="mt-1 text-sm text-ink/65">Turn followers into contacts you can reach anytime.</p>
            </div>
          </div>
        </Reveal>

        {portfolioOn.length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-xl font-bold text-ink">Selected work</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {portfolioOn.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-cardlg border border-ink/10 bg-white shadow-soft"
                >
                  {p.image && <img src={p.image} alt={p.name} loading="lazy" className="aspect-video w-full object-cover" />}
                  <div className="p-5">
                    <div className="font-display font-bold text-ink">{p.name}</div>
                    {p.blurb && <p className="mt-1 text-sm text-ink/60">{p.blurb}</p>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {offerOk && (
          <Reveal>
            <div className="dark-glow grain relative mt-8 overflow-hidden rounded-cardlg p-6 text-white sm:p-8" role="note" aria-label="Attendee offer">
              <span className="inline-flex items-center rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">
                {event.offer.deadline}
              </span>
              <h3 className="font-display mt-3 text-2xl font-bold">{event.offer.headline}</h3>
              <p className="mt-2 max-w-2xl text-white/80">{event.offer.details}</p>
            </div>
          </Reveal>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-cardlg border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
              <h3 className="font-display text-xl font-bold text-ink">Talk to us directly</h3>
              <p className="mt-2 text-sm text-ink/65">
                No forms stored anywhere — your message opens straight in WhatsApp.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <a
                  href={waBase}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-8 text-base font-bold text-ink shadow-soft transition-transform hover:scale-[1.02]"
                >
                  Chat on WhatsApp
                </a>
                <a
                  href={`mailto:${event.builder.email}`}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-ink/15 bg-paper px-8 text-base font-semibold text-ink"
                >
                  {event.builder.email}
                </a>
                <a
                  href={event.builder.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-sm font-medium text-purple-700 underline-offset-4 hover:underline"
                >
                  {event.builder.site.replace("https://", "")}
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <form
              onSubmit={submit}
              className="rounded-cardlg border border-ink/10 bg-white p-6 shadow-soft sm:p-8"
              aria-label="Quick enquiry form"
            >
              <h3 className="font-display text-xl font-bold text-ink">Quick enquiry</h3>
              <label className="mt-4 block text-sm font-medium text-ink">
                Your name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Adaeze"
                  autoComplete="name"
                  className="mt-1 block min-h-[48px] w-full rounded-card border border-ink/15 bg-paper px-4 text-ink placeholder:text-ink/35"
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-ink">
                Business name
                <input
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="e.g. Ada's Kitchen"
                  autoComplete="organization"
                  className="mt-1 block min-h-[48px] w-full rounded-card border border-ink/15 bg-paper px-4 text-ink placeholder:text-ink/35"
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-ink">
                What do you need?
                <textarea
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                  placeholder="e.g. A website with WhatsApp ordering"
                  rows={3}
                  className="mt-1 block w-full rounded-card border border-ink/15 bg-paper px-4 py-3 text-ink placeholder:text-ink/35"
                />
              </label>
              <button
                type="submit"
                className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-purple-700 px-8 text-base font-bold text-white shadow-soft transition-transform hover:scale-[1.01]"
              >
                Send via WhatsApp →
              </button>
              <p className="mt-2 text-center text-xs text-ink/50">Opens WhatsApp with your details prefilled.</p>
            </form>
          </Reveal>
        </div>

        <p className="mt-8 text-center text-sm text-ink/50">
          Designed and built by {event.builder.name}.
        </p>
      </div>
    </section>
  );
}
