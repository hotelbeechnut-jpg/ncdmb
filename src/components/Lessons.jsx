import { Reveal, Stagger, StaggerItem } from "./Reveal";

const LESSONS = [
  {
    title: "Own your digital assets",
    body: "Social accounts are rented space — they can change the rules anytime. Your website and email list are assets you control.",
    highlight: true,
  },
  {
    title: "Narrow your customer",
    body: "“Everyone” is not a customer. Define age, budget, needs and occasion — then speak to that person.",
  },
  {
    title: "Follow the journey",
    body: "Awareness → interest → consideration → action → loyalty. Don’t push for the sale before trust is built.",
  },
  {
    title: "Give every post a job",
    body: "Educate, entertain, inspire, connect or convert — and structure it: hook, body, call to action.",
  },
  {
    title: "Pick platforms on purpose",
    body: "Be where your customers respond, not everywhere. One primary plus one support platform you can sustain.",
  },
  {
    title: "Done beats perfect",
    body: "Finish and publish, then improve. Verify AI drafts before posting, and measure one metric that matters.",
  },
];

export default function Lessons() {
  return (
    <section id="lessons" className="bg-white py-14 sm:py-20" aria-labelledby="lessons-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-700">Takeaways</p>
          <h2 id="lessons-h" className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            What we learned
          </h2>
          <p className="mt-2 max-w-2xl text-ink/60">
            Six ideas worth keeping — distilled from all five days, in our own words.
          </p>
        </Reveal>
        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.08}>
          {LESSONS.map((l) => (
            <StaggerItem key={l.title}>
              <div
                className={`h-full rounded-cardlg border p-6 shadow-soft ${
                  l.highlight
                    ? "dark-glow grain relative border-purple-900 text-white"
                    : "border-ink/10 bg-paper text-ink"
                }`}
              >
                {l.highlight && (
                  <span className="inline-flex items-center rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">
                    Key lesson
                  </span>
                )}
                <h3 className={`font-display mt-3 text-xl font-bold ${l.highlight ? "text-white" : "text-ink"}`}>
                  {l.title}
                </h3>
                <p className={`mt-2 text-[15px] leading-relaxed ${l.highlight ? "text-white/85" : "text-ink/70"}`}>
                  {l.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
