import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <button
        type="button"
        data-testid="accordion-toggle"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-controls="accordion-content"
      >
        {isOpen ? "Hide Details" : "Show Details"}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="accordion-content"
            data-testid="motion-panel"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h3>Accordion Content</h3>
            <p>
              This content smoothly fades and slides into view using Framer
              Motion.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
