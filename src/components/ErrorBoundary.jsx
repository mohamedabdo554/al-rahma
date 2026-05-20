import { Component } from "react";

function clearAndReload() {
  try { localStorage.clear(); } catch (e) {}
  location.reload();
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errMsg: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    var msg = error && error.message ? error.message : String(error);
    console.error("ErrorBoundary caught:", msg, errorInfo);
    this.setState({ errMsg: msg });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
          <div className="max-w-md text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-lg font-bold mb-2">حدث خطأ</h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-dim)" }}>حاول تحديث الصفحة أو مسح بيانات التصفح</p>
            <div className="mb-4 rounded-lg border p-2 text-[10px] text-left font-mono leading-relaxed" style={{ borderColor: "var(--border)", color: "var(--text-dim)", wordBreak: "break-all" }}>
              <div className="font-bold mb-1" style={{ color: "var(--danger)" }}>🔴 تفاصيل المشكلة:</div>
              <div>{this.state.errMsg}</div>
            </div>
            <button onClick={clearAndReload}
              className="rounded-xl px-6 py-3 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))" }}>
              🗑️ مسح البيانات وإعادة التحميل
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}