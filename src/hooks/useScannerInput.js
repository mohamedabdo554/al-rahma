import { useEffect, useRef, useCallback, useState } from "react";

const SCAN_TIMEOUT = 80;

export default function useScannerInput({ onScan } = {}) {
  const [code, setCode] = useState("");
  const buf = useRef("");
  const timer = useRef(null);
  const inputRef = useRef(null);

  const flush = useCallback(() => {
    const val = buf.current.trim();
    if (val) {
      setCode(val);
      if (onScan) onScan(val);
    }
    buf.current = "";
  }, [onScan]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        flush();
        return;
      }
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

  // Auto-refocus the hidden input so scanner always has a target
  useEffect(() => {
    function refocus() {
      if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA" && inputRef.current) {
        inputRef.current.focus();
      }
    }
    window.addEventListener("click", refocus);
    return () => window.removeEventListener("click", refocus);
  }, []);

  return { code, setCode, inputRef };
}
