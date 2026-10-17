import { motion, useReducedMotion } from "motion/react";
import { isPlaceholder } from "../utils/placeholders";

export function Reveal({ children, delay = 0, y = 28, className = "", once = true }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className = "", gap = 0.08 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

// Renders value, or an elegant "to be confirmed" pill when it's a [PLACEHOLDER].
export function ValueOrTbc({ value, className = "", tbcLabel = "To be confirmed" }) {
  if (!isPlaceholder(value)) return <span className={className}>{value}</span>;
  return (
    <span
      className={`inline-flex items-center rounded-full border border-dashed border-purple-500/50 bg-lavender-100 px-3 py-1 text-sm font-medium text-purple-700 ${className}`}
      title={`Placeholder: ${value}`}
    >
      {tbcLabel}
    </span>
  );
}
