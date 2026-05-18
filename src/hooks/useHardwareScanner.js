import { useEffect, useRef, useCallback } from "react";

const SCAN_TIMEOUT = 80; // ms between keystrokes — barcode scanners type faster than humans

export default function useHardwareScanner(onScan) {
  const buf = useRef("");
  const timer = useRef(null);

  const flush = useCallback(() => {
    const code = buf.current.trim();
    if (code && onScan) onScan(code);
    buf.current = "";
  }, [onScan]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        flush();
        return;
      }
      // Ignore if it's a real input field (user typing manually)
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Only accept printable characters
      if (e.key.length === 1) {
        buf.current += e.key;
        clearTimeout(timer.current);
        timer.current = setTimeout(flush, SCAN_TIMEOUT);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      clearTimeout(timer.current);
    };
  }, [flush]);
}
