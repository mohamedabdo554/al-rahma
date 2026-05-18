import { useState, useRef } from "react";

export default function VoiceRecorder({ onAudioChange }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [supported, setSupported] = useState(true);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const timer = useRef(null);
  const startTime = useRef(0);

  function getMimeType() {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return "";
  }

  function startRecording() {
    const mimeType = getMimeType();
    if (!mimeType && !MediaRecorder) { setSupported(false); return; }
    chunks.current = [];
    setDuration(0);
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const options = mimeType ? { mimeType } : {};
        const recorder = new MediaRecorder(stream, options);
        mediaRecorder.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunks.current, { type: mimeType || "audio/webm" });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          onAudioChange?.(blob);
          stream.getTracks().forEach((t) => t.stop());
        };
        recorder.start();
        startTime.current = Date.now();
        setRecording(true);
        timer.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
          if (elapsed >= 30) { stopRecording(); return; }
          setDuration(elapsed);
        }, 200);
      })
      .catch(() => setSupported(false));
  }

  function stopRecording() {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    setRecording(false);
    clearInterval(timer.current);
  }

  function clearRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
    onAudioChange?.(null);
  }

  if (!supported) {
    return (
      <div className="rounded-xl border p-2.5 text-[10px]" style={{ borderColor: "var(--border-light)", color: "var(--text-dim)" }}>
        🎤 الميكروفون غير متاح
      </div>
    );
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="rounded-xl border p-2.5" style={{ borderColor: "var(--border-light)", backgroundColor: "var(--bg-input)" }}>
      <div className="flex items-center gap-2">
        {!audioUrl ? (
          <button onClick={recording ? stopRecording : startRecording}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all"
            style={{ backgroundColor: recording ? "var(--danger)" : "rgba(var(--accent-rgb), 0.12)", boxShadow: recording ? "0 0 20px rgba(var(--danger-rgb), 0.3)" : "none" }}>
            <span className="text-sm">{recording ? "⬛" : "🎤"}</span>
          </button>
        ) : (
          <button onClick={clearRecording}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(var(--danger-rgb), 0.1)" }}>
            <span className="text-xs" style={{ color: "var(--danger)" }}>✕</span>
          </button>
        )}

        <div className="flex-1 min-w-0">
          {recording ? (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 shrink-0 rounded-full animate-pulse" style={{ backgroundColor: "var(--danger)" }} />
              <span className="text-[10px] font-mono" style={{ color: "var(--danger)" }}>{fmt(duration)}</span>
              <div className="flex gap-0.5 items-end h-4">
                {[2, 4, 3, 5, 2, 6, 3, 4, 5, 2].map((h, i) => (
                  <span key={i} className="w-0.5 rounded-t-sm" style={{ height: `${h * 20}%`, backgroundColor: "rgba(var(--danger-rgb), 0.6)", animation: `wiggle ${0.3 + i * 0.05}s ease-in-out infinite alternate` }} />
                ))}
              </div>
            </div>
          ) : audioUrl ? (
            <audio src={audioUrl} controls className="h-7 w-full max-w-[180px]" />
          ) : (
            <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>🎤 اضغط للتسجيل (30 ث)</span>
          )}
        </div>
      </div>
    </div>
  );
}
