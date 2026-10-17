import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { event } from "../config/event";
import { Reveal } from "./Reveal";

function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    const start = performance.now();
    const dur = 1200;
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {val}
      {suffix}
    </span>
  );
}

export default function AtAGlance() {
  return (
    <section className="bg-white py-14 sm:py-20" aria-labelledby="glance-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 id="glance-h" className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            The seminar at a glance
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Reveal delay={0.05}>
            <div className="rounded-cardlg border border-ink/10 bg-paper p-6 shadow-soft">
              <div className="font-display text-5xl font-bold text-purple-700">
                <Counter to={5} />
              </div>
              <div className="mt-1 text-sm font-medium text-ink/60">days of practical learning</div>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="rounded-cardlg border border-ink/10 bg-paper p-6 shadow-soft">
              <div className="font-display text-5xl font-bold text-purple-700">
                <Counter to={50} suffix="+" />
              </div>
              <div className="mt-1 text-sm font-medium text-ink/60">{event.attendeesLabel}</div>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="rounded-cardlg border border-ink/10 bg-paper p-6 shadow-soft">
              <div className="font-display text-5xl font-bold text-purple-700">AI</div>
              <div className="mt-1 text-sm font-medium text-ink/60">practical, hands-on, business-ready</div>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-3xl text-base leading-relaxed text-ink/75 sm:text-lg">
            Five days of digital marketing made simple for real businesses — from finding the right
            customers to creating content, choosing platforms, using practical tools, and turning
            attention into sales. This page is our recap: the lessons, the moments, and what stuck.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
