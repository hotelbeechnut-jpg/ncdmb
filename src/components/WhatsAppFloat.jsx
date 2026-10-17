import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { event } from "../config/event";
import { whatsappLink } from "../utils/placeholders";

export default function WhatsAppFloat() {
  const [show, setShow] = useState(false);
  const location = useLocation();
  // Hidden on /build-yours (the page has its own large contact area).
  const hiddenRoute = location.pathname.startsWith("/build-yours");
  useEffect(() => {
    const onScroll = () => {
      const heroH = window.innerHeight * 0.9;
      setShow(window.scrollY > heroH);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const wa = whatsappLink(event.builder.whatsapp, event.builder.whatsappMessage);
  return (
    <AnimatePresence>
      {show && !hiddenRoute && (
        <motion.a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          aria-label="Chat with Talent Loop Webdev Services on WhatsApp"
          className="fixed bottom-5 right-5 z-[70] inline-flex min-h-[56px] min-w-[56px] items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-white shadow-lift"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <span aria-hidden="true" className="text-2xl leading-none">✆</span>
          <span className="hidden text-sm font-bold sm:inline">WhatsApp us</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
