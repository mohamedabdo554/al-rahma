import { AnimatePresence, motion } from "framer-motion";

export default function Toast({ msg }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl border px-5 py-2.5 text-sm font-medium shadow-2xl backdrop-blur-2xl"
          style={{
            borderColor: "rgba(var(--accent-rgb), 0.3)",
            backgroundColor: "rgba(15,23,42,0.95)",
            color: "var(--accent)",
          }}
        >
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
