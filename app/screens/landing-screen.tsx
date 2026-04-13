"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WaitlistSection } from "@/app/components/waitlist-section";
import { getQuizData, type QuizData } from "./onboarding-screen";

// ─── Shared font ──────────────────────────────────────────────────────────────
const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

// ─── All CSS ──────────────────────────────────────────────────────────────────
const LANDING_CSS = `
  /* ── Buttons ── */
  .l-btn { transition: filter 150ms ease-out; }
  @media(hover:hover) { .l-btn:hover { filter: brightness(1.06); } }
  @media(hover:hover) { .l-btn-green:hover { box-shadow: 0 0 10px rgba(34,197,94,0.45), 0 5px 0 #16a34a !important; } }

  /* ── Cards ── */
  .hov-card {
    transition: transform 300ms cubic-bezier(0.4,0,0.2,1), box-shadow 300ms cubic-bezier(0.4,0,0.2,1);
    cursor: pointer;
  }
  @media(hover:hover) { .hov-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.13) !important; } }

  /* ── Fire pulse ── */
  @keyframes fire-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.14)} }
  .fire-pulse { animation: fire-pulse 2s ease-in-out infinite; display: inline-block; }

  /* ── Progress bar fill ── */
  @keyframes bar-fill { from{width:0} }
  .bar-fill { animation: bar-fill 1.2s cubic-bezier(0.25,1,0.5,1) both; }

  /* ── Streak circle hover / bounce ── */
  .str-circle { transition: transform 150ms; }
  @media(hover:hover) { .str-circle:hover { transform: scale(1.18); } }
  @keyframes circle-bounce { 0%{transform:scale(1)} 45%{transform:scale(1.28)} 100%{transform:scale(1)} }
  .circle-bounce { animation: circle-bounce 320ms ease-out; }

  /* ── Badge pop-in ── */
  @keyframes badge-pop { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.3)} 100%{transform:scale(1);opacity:1} }
  .badge-pop { animation: badge-pop 450ms cubic-bezier(0.34,1.56,0.64,1) both; }

  /* ── Toast ── */
  @keyframes toast-in  { from{transform:translateY(20px);opacity:0} to{transform:none;opacity:1} }
  @keyframes toast-out { from{opacity:1;transform:none} to{opacity:0;transform:translateY(8px)} }
  .toast-in  { animation: toast-in  300ms ease-out both; }
  .toast-out { animation: toast-out 300ms ease-out forwards; }

  /* ── Modal ── */
  @keyframes modal-in { from{transform:scale(0.88);opacity:0} to{transform:scale(1);opacity:1} }
  .modal-in { animation: modal-in 280ms cubic-bezier(0.34,1.1,0.64,1) both; }

  /* ── Tab panel ── */
  @keyframes tab-fade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
  .tab-panel { animation: tab-fade 180ms ease-out both; }

  /* ── Stat cards ── */
  .st-card { transition: transform 150ms, box-shadow 150ms, background 200ms; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
  @media(hover:hover){ .st-card:hover { transform: translateY(-3px) !important; box-shadow: 0 8px 0 #d1fae5, 0 0 0 1px #bbf7d0 !important; background: #f0fdf4 !important; } }
  .st-card:active { transform: scale(0.97) !important; }
  .st-card.st-on { background: #f0fdf4 !important; box-shadow: 0 6px 0 #d1fae5 !important; }
  .st-num { display: block; }
  .st-card.st-on .st-num { animation: st-num-pop 400ms cubic-bezier(0.34,1.56,0.64,1) both; }
  @keyframes st-num-pop { 0%{transform:scale(1)} 55%{transform:scale(1.22)} 100%{transform:scale(1.06)} }
  .st-tip { max-height: 0; overflow: hidden; opacity: 0; transition: max-height 280ms ease, opacity 240ms ease; font-size: 11px; font-weight: 700; color: #22c55e; letter-spacing: 0.04em; }
  .st-card.st-on .st-tip { max-height: 2em; opacity: 1; }

  /* Stairs */
  .st-s1 { animation: st-step 2.4s 0.0s infinite; }
  .st-s2 { animation: st-step 2.4s 0.6s infinite; }
  .st-s3 { animation: st-step 2.4s 1.2s infinite; }
  .st-s4 { animation: st-step 2.4s 1.8s infinite; }
  @keyframes st-step { 0%,20%,100%{fill:#dcfce7} 35%,65%{fill:#22c55e} }
  /* Book */
  .st-page { transform-box: fill-box; transform-origin: 0% 50%; animation: st-page-flip 3s ease-in-out infinite; }
  @keyframes st-page-flip { 0%,32%,100%{transform:scaleX(1)} 46%,54%{transform:scaleX(0.05)} }
  /* Lock */
  .st-shackle { animation: st-lock-open 3.2s ease-in-out infinite; }
  @keyframes st-lock-open { 0%,48%,100%{transform:translateY(0)} 62%,88%{transform:translateY(-9px)} }
  /* Hourglass */
  .st-sand  { animation: st-sand-fall 2.5s 0.0s ease-in infinite; }
  .st-sand2 { animation: st-sand-fall 2.5s 0.8s ease-in infinite; }
  .st-sand3 { animation: st-sand-fall 2.5s 1.6s ease-in infinite; }
  @keyframes st-sand-fall {
    0%,6%  { opacity:0; transform:translateY(0); }
    12%    { opacity:1; transform:translateY(0); }
    78%    { opacity:0.8; transform:translateY(11px); }
    88%,100% { opacity:0; transform:translateY(11px); }
  }

  /* ── Mobile-only utilities ── */
  .mob-only { display: none !important; }
  @media (max-width: 767px) { .mob-only { display: block !important; } }
  @media (max-width: 339px) { .st-stats-grid { grid-template-columns: 1fr !important; } }
  .mob-feat-card {
    background: #fff; border: 2px solid #e5e7eb; border-radius: 16px;
    padding: 16px 18px; display: flex; align-items: center; gap: 14px;
    box-shadow: 0 4px 0 #e5e7eb;
  }

  /* ── Full-screen desktop sections ── */
  .full-section { min-height: 100vh; }
  @media (max-width: 767px) { .full-section { min-height: 0 !important; } }

  @media(prefers-reduced-motion:reduce){
    .st-s1,.st-s2,.st-s3,.st-s4,.st-page,.st-shackle,.st-sand,.st-sand2,.st-sand3,
    .fire-pulse,.bar-fill,.badge-pop,.str-circle,.circle-bounce { animation:none !important; transition:none !important; }
  }
`;

// ─── Toast types ──────────────────────────────────────────────────────────────
type Toast = { id: number; msg: string; removing?: boolean };

function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", pointerEvents: "none" }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={t.removing ? "toast-out" : "toast-in"}
          style={{
            background: "#172b4d", color: "#fff",
            borderRadius: 14, padding: "12px 18px",
            fontSize: 14, fontWeight: 700, fontFamily: font,
            boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
            maxWidth: 300, lineHeight: 1.4,
          }}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(12,18,15,0.58)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="modal-in"
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fcfdfc",
          borderRadius: 28,
          border: "1px solid #dde7e0",
          boxShadow: "0 28px 80px rgba(0,0,0,0.22)",
          width: "100%", maxWidth: 460,
          maxHeight: "90vh", overflowY: "auto",
          padding: 24, position: "relative", fontFamily: font,
        }}
      >
        <button
          onClick={onClose} type="button" aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14,
            width: 36, height: 36, borderRadius: "50%",
            border: "1px solid #dbe6df",
            background: "rgba(255,255,255,0.96)",
            cursor: "pointer", fontSize: 18, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#4f6258", transition: "background 150ms, border-color 150ms",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "#f3f7f4";
            (e.currentTarget as HTMLElement).style.borderColor = "#cfdcd4";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.96)";
            (e.currentTarget as HTMLElement).style.borderColor = "#dbe6df";
          }}
        >×</button>
        {children}
      </div>
    </div>
  );
}

function PreviewOnlyButton({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <button
      aria-disabled="true"
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: font,
        fontWeight: 800,
        fontSize: 15,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        borderRadius: 16,
        border: "2px solid #dbe4dd",
        background: "#edf3ee",
        color: "#6c7f73",
        boxShadow: "0 5px 0 #d7e1d9",
        cursor: "default",
        padding: "16px 28px",
        width: "100%",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Stoked logo ──────────────────────────────────────────────────────────────
function StokedLogo({ large = false }: { large?: boolean }) {
  return (
    <Link href="/" style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, textDecoration: "none" }}>
      <span style={{ fontFamily: font, fontWeight: 900, fontSize: large ? 40 : 24, color: "#172b4d", letterSpacing: "-0.5px", lineHeight: 1 }}>stoked</span>
      <span style={{ width: large ? 14 : 9, height: large ? 14 : 9, borderRadius: "50%", backgroundColor: "#22c55e", flexShrink: 0, marginBottom: large ? 6 : 4 }} />
    </Link>
  );
}

// ─── Streak modal content ─────────────────────────────────────────────────────
const STREAK_LESSONS = [
  { day: "Monday",    lesson: "What is a stock?",           desc: "A stock represents partial ownership in a company. When you buy a share, you become a shareholder." },
  { day: "Tuesday",   lesson: "Reading a stock chart",      desc: "Learn how to read candlestick charts, identify trends, and spot key support and resistance levels." },
  { day: "Wednesday", lesson: "Understanding P/E ratios",   desc: "The price-to-earnings ratio helps you evaluate whether a stock is cheap or expensive relative to its earnings." },
  { day: "Thursday",  lesson: "Diversification basics",     desc: "Don't put all your eggs in one basket. Learn how spreading investments reduces risk." },
  { day: "Friday",    lesson: "Market indices explained",   desc: "The S&P 500, Dow Jones, and Nasdaq — what they track and why they matter to every investor." },
  { day: "Saturday",  lesson: "Bonus: Options intro",       desc: "A quick peek at options: calls, puts, and why traders use them to hedge or speculate." },
  { day: "Sunday",    lesson: "Review & practice",          desc: "Consolidate the week's learning with a rapid-fire quiz across all five topics." },
];

// ─── Streak illustration ──────────────────────────────────────────────────────
function StreakCard({ quiz }: { quiz?: QuizData | null }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const [bouncing, setBouncing] = useState<number | null>(null);
  const [modalDay, setModalDay] = useState<number | null>(null);

  function handleDayClick(i: number) {
    setBouncing(i);
    setTimeout(() => setBouncing(null), 380);
    setModalDay(i);
  }

  const lessonInfo = modalDay !== null ? STREAK_LESSONS[modalDay] : null;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div className="fire-pulse" style={{ fontSize: 80, lineHeight: 1 }}>🔥</div>
        <div style={{ display: "flex", gap: 10 }}>
          {days.map((d, i) => (
            <div
              key={i}
              className={`str-circle${bouncing === i ? " circle-bounce" : ""}`}
              onClick={() => handleDayClick(i)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === "Enter") handleDayClick(i); }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: i < 5 ? "#ff9600" : "#f3f4f6",
                color: i < 5 ? "#fff" : "#d1d5db",
                fontWeight: 800, fontSize: 14,
                boxShadow: i < 5 ? "0 4px 0 #e08500" : "0 4px 0 #e5e7eb",
                transition: "transform 150ms",
              }}>
                {i < 5 ? "✓" : "·"}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>{d}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff7ed", border: "2px solid #ff9600", borderRadius: 20, boxShadow: "0 5px 0 #e08500", padding: "14px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#ff9600" }}>5 day streak!</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
            {quiz
              ? `Hey ${quiz.nickname}! 2 more days to your 7-day badge.`
              : "Keep learning every day"}
          </div>
        </div>
        {quiz && (
          <div style={{ background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: 14, padding: "10px 16px", textAlign: "center", fontSize: 13, color: "#15803d", fontWeight: 700 }}>
            🎯 Your goal: {quiz.goal === "invest" ? "Start investing" : quiz.goal === "improve" ? "Improve trading skills" : quiz.goal === "education" ? "Learn for education" : "Explore investing"}
          </div>
        )}
      </div>

      {modalDay !== null && lessonInfo && (
        <Modal onClose={() => setModalDay(null)}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#ff9600" }}>
              {lessonInfo.day}&apos;s lesson
            </span>
          </div>
          <h3 style={{ fontWeight: 900, fontSize: 22, color: "#172b4d", marginBottom: 12, lineHeight: 1.25 }}>{lessonInfo.lesson}</h3>
          <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.65, marginBottom: 24 }}>{lessonInfo.desc}</p>
          <PreviewOnlyButton>
            Preview Only
          </PreviewOnlyButton>
        </Modal>
      )}
    </>
  );
}

// ─── Lesson card modal content ────────────────────────────────────────────────
const LESSON_TABS = [
  {
    id: "learn", label: "Learn",
    content: (
      <div>
        <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.65, marginBottom: 16 }}>
          A stock represents partial ownership in a company. When a company needs money to grow, it sells pieces of itself called shares. When you buy a share, you become a shareholder — a part-owner of that business.
        </p>
        <div style={{ background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: 14, padding: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#15803d", marginBottom: 4 }}>What this means</div>
          <div style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>If Apple has 1 billion shares and you own 1, you own one-billionth of Apple.</div>
        </div>
      </div>
    ),
  },
  {
    id: "practice", label: "Practice",
    content: (
      <div>
        <p style={{ fontWeight: 800, fontSize: 17, color: "#172b4d", marginBottom: 16 }}>Which of these best describes a stock?</p>
        {["A loan you give to a company", "Partial ownership in a company", "A guaranteed return on investment", "A type of bank account"].map((opt, i) => (
          <div key={i} style={{ border: "2px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer", transition: "all 150ms", display: "flex", gap: 10, alignItems: "center" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#3b82f6"; (e.currentTarget as HTMLElement).style.background = "#eff6ff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.background = ""; }}
          >
            <span style={{ width: 28, height: 28, borderRadius: 7, background: "#f3f4f6", border: "2px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
              {["A","B","C","D"][i]}
            </span>
            {opt}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "check", label: "Check",
    content: (
      <div>
        <p style={{ fontWeight: 800, fontSize: 17, color: "#172b4d", marginBottom: 16 }}>True or false: owning a stock means you&apos;ve lent money to a company.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {["True", "False"].map((opt, i) => (
            <div key={opt} style={{ border: i === 1 ? "2px solid #22c55e" : "2px solid #e5e7eb", borderRadius: 12, padding: "14px 18px", cursor: "pointer", background: i === 1 ? "#f0fdf4" : "#fff", display: "flex", gap: 10, alignItems: "center", fontWeight: 700 }}>
              <span style={{ width: 28, height: 28, borderRadius: 7, background: i === 1 ? "#22c55e" : "#f3f4f6", border: "2px solid " + (i === 1 ? "#22c55e" : "#e5e7eb"), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: i === 1 ? "#fff" : "#6b7280", flexShrink: 0 }}>
                {i === 1 ? "✓" : "A"}
              </span>
              {opt}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#15803d", marginBottom: 4 }}>Correct!</div>
          <div style={{ fontSize: 14, color: "#4b5563" }}>Stocks represent ownership, not debt. Bonds are the instrument for lending money to companies.</div>
        </div>
      </div>
    ),
  },
];

// ─── Lesson card illustration ─────────────────────────────────────────────────
function LessonCard() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("learn");

  function switchTab(id: string) {
    setTab(id);
  }

  return (
    <>
      <div
        className="hov-card"
        onClick={() => setOpen(true)}
        style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, width: "100%" }}
      >
        <div style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: 20, padding: 20, boxShadow: "0 5px 0 #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#22c55e", marginBottom: 8 }}>Module 1 · Lesson 3</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#172b4d", marginBottom: 8 }}>What is a stock?</div>
          <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 12 }}>A stock represents partial ownership in a company. When you buy a share, you become a shareholder.</p>
          <div style={{ display: "flex", gap: 8 }}>
            {["ownership", "shares", "equity"].map(t => (
              <span key={t} style={{ background: "#f0fdf4", color: "#16a34a", fontWeight: 700, fontSize: 12, borderRadius: 20, padding: "4px 10px" }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: 20, padding: 16, boxShadow: "0 5px 0 #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            <span style={{ color: "#172b4d" }}>Progress</span>
            <span style={{ color: "#22c55e" }}>3 / 4 steps</span>
          </div>
          <div style={{ height: 14, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
            <div className="bar-fill" style={{ width: "75%", height: "100%", background: "#22c55e", borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 20, padding: 16, boxShadow: "0 5px 0 #16a34a" }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#22c55e" }}>Tap to preview lesson →</div>
        </div>
      </div>

      {open && (
        <Modal onClose={() => { setOpen(false); setTab("learn"); }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#22c55e" }}>Module 1 · Lesson 3</span>
          </div>
          <h3 style={{ fontWeight: 900, fontSize: 22, color: "#172b4d", marginBottom: 18, lineHeight: 1.25 }}>What is a stock?</h3>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 20, background: "#f3f4f6", borderRadius: 12, padding: 4 }}>
            {LESSON_TABS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 9, border: "none",
                  background: tab === t.id ? "#fff" : "transparent",
                  color: tab === t.id ? "#172b4d" : "#6b7280",
                  fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: font,
                  boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 150ms",
                }}
              >{t.label}</button>
            ))}
          </div>

          <div key={tab} className="tab-panel">
            {LESSON_TABS.find(t => t.id === tab)?.content}
          </div>

          <div style={{ marginTop: 20 }}>
            {tab === "check" ? (
              <PreviewOnlyButton>
                Preview Only
              </PreviewOnlyButton>
            ) : (
              <button
                type="button"
                onClick={() => switchTab(tab === "learn" ? "practice" : "check")}
                style={{
                  width: "100%", padding: 16, borderRadius: 14, border: "none",
                  background: "#22c55e", color: "#fff", fontWeight: 800, fontSize: 15,
                  fontFamily: font, cursor: "pointer", boxShadow: "0 4px 0 #16a34a",
                }}
              >
                Continue →
              </button>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── Progress modal content ───────────────────────────────────────────────────
const MODULES_DATA = [
  {
    name: "Foundations", pct: 100, color: "#22c55e", shadow: "#16a34a", locked: false,
    lessons: ["What is a stock?", "Types of stocks", "Stock exchanges", "Market cap basics", "Reading stock prices"],
  },
  {
    name: "Chart Basics", pct: 60, color: "#3b82f6", shadow: "#2563eb", locked: false,
    lessons: ["Candlestick charts", "Support & resistance", "Moving averages", "Volume analysis", "Chart patterns"],
  },
  {
    name: "Trend & Momentum", pct: 0, color: "#a855f7", shadow: "#9333ea", locked: true,
    lessons: ["Trend lines", "Momentum indicators", "RSI explained", "MACD basics", "Bollinger Bands"],
  },
];

// ─── Progress illustration ────────────────────────────────────────────────────
function ProgressCard() {
  const [modalMod, setModalMod] = useState<typeof MODULES_DATA[0] | null>(null);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, width: "100%" }}>
        {MODULES_DATA.map(m => (
          <div
            key={m.name}
            className="hov-card"
            onClick={() => setModalMod(m)}
            style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: 20, padding: 20, boxShadow: "0 5px 0 #e5e7eb" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 800, color: "#172b4d", fontSize: 15 }}>{m.name}</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: m.color }}>
                {m.pct === 100 ? "Complete! ✓" : m.pct === 0 ? "🔒 Locked" : `${m.pct}%`}
              </span>
            </div>
            <div style={{ height: 14, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
              <div className="bar-fill" style={{ width: `${m.pct}%`, height: "100%", background: m.color, borderRadius: 99 }} />
            </div>
          </div>
        ))}
      </div>

      {modalMod && (
        <Modal onClose={() => setModalMod(null)}>
          {modalMod.locked ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
                <h3 style={{ fontWeight: 900, fontSize: 22, color: "#172b4d", marginBottom: 8 }}>{modalMod.name}</h3>
                <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.6 }}>
                  Complete <strong>Chart Basics</strong> first to unlock this module.
                </p>
              </div>
              <PreviewOnlyButton>
                Preview Only
              </PreviewOnlyButton>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: modalMod.color }}>
                  {modalMod.pct === 100 ? "Completed" : `${modalMod.pct}% complete`}
                </span>
              </div>
              <h3 style={{ fontWeight: 900, fontSize: 22, color: "#172b4d", marginBottom: 6, lineHeight: 1.25 }}>{modalMod.name}</h3>
              <div style={{ height: 10, background: "#f3f4f6", borderRadius: 99, overflow: "hidden", marginBottom: 20 }}>
                <div className="bar-fill" style={{ width: `${modalMod.pct}%`, height: "100%", background: modalMod.color, borderRadius: 99 }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
                {modalMod.lessons.map((l, i) => {
                  const done = modalMod.pct === 100 || i < Math.round(modalMod.lessons.length * modalMod.pct / 100);
                  return (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: done ? "#f0fdf4" : "#fafafa", borderRadius: 12, border: "2px solid " + (done ? "#bbf7d0" : "#e5e7eb") }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: done ? "#22c55e" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: done ? "#fff" : "#9ca3af", fontWeight: 800, flexShrink: 0 }}>
                        {done ? "✓" : i + 1}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: done ? "#15803d" : "#6b7280" }}>{l}</span>
                    </div>
                  );
                })}
              </div>
              {modalMod.pct === 100 ? (
                <div style={{ textAlign: "center", padding: "14px 0", marginBottom: 16, color: "#22c55e", fontWeight: 800, fontSize: 16 }}>
                  🎓 Module complete! +50 XP earned
                </div>
              ) : (
                <PreviewOnlyButton>
                  Preview Only
                </PreviewOnlyButton>
              )}
            </>
          )}
        </Modal>
      )}
    </>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ children, bg = "#fff", border = false, className = "" }: {
  children: React.ReactNode; bg?: string; border?: boolean; className?: string;
}) {
  return (
    <section className={className} style={{
      display: "flex", alignItems: "center", background: bg,
      borderTop: border ? "2px solid #f3f4f6" : undefined,
      borderBottom: border ? "2px solid #f3f4f6" : undefined,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(40px,8vw,80px) clamp(16px,3vw,24px)", width: "100%" }}>
        {children}
      </div>
    </section>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────
function FeatureRow({ tag, tagColor, heading, body, illustration, flip = false }: {
  tag: string; tagColor: string; heading: React.ReactNode; body: string;
  illustration: React.ReactNode; flip?: boolean;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: flip ? "row-reverse" : "row",
      alignItems: "center", gap: "clamp(24px,6vw,64px)", flexWrap: "wrap", justifyContent: "center",
    }}>
      <div style={{ flex: "1 1 300px", minWidth: 0, textAlign: "left" }}>
        <div style={{ fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", color: tagColor, marginBottom: 12 }}>{tag}</div>
        <h2 style={{ fontFamily: font, fontWeight: 900, fontSize: "clamp(28px,4vw,40px)", color: "#172b4d", lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.5px" }}>
          {heading}
        </h2>
        <p style={{ fontSize: 18, color: "#6b7280", lineHeight: 1.7, maxWidth: 420 }}>{body}</p>
      </div>
      <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center" }}>
        {illustration}
      </div>
    </div>
  );
}

// ─── Landing screen ───────────────────────────────────────────────────────────
export function LandingScreen() {
  const [isMobile, setIsMobile] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Gamification + quiz state ────────────────────────────────────────────
  const [toasts] = useState<Toast[]>([]);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  useEffect(() => {
    setQuizData(getQuizData());
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: font }}>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <ToastStack toasts={toasts} />

      {/* ── NAV ──────────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "2px solid #f3f4f6" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <StokedLogo />
          <button
            onClick={() => setIsWaitlistModalOpen(true)}
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 42,
              padding: "0 18px",
              borderRadius: 999,
              border: "none",
              background: "#1f3227",
              color: "#fff",
              fontFamily: font,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 10px 24px rgba(23,43,32,0.08)",
            }}
          >
            Join Waitlist
          </button>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(180deg, #f8fbf9 0%, #f3f8f5 100%)",
        borderBottom: "2px solid #e1ece5",
        minHeight: "calc(100dvh - 64px)",
        display: "flex",
        alignItems: "center",
      }}>
        <div style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: isMobile ? "8px 16px 28px" : "12px 24px 28px",
          width: "100%",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isMobile ? "stretch" : "center",
            textAlign: isMobile ? "left" : "center",
          }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #d8e7dd",
              background: "rgba(255,255,255,0.8)",
              color: "#1f5134",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              boxShadow: "0 8px 24px rgba(23,43,32,0.04)",
              alignSelf: isMobile ? "flex-start" : "center",
            }}>
              Built for complete beginners
            </div>
            <h1 style={{
              fontFamily: font, fontWeight: 900,
              fontSize: isMobile ? "clamp(1.95rem,6.4vw,2.25rem)" : "clamp(2.55rem,4.4vw,3.35rem)",
              color: "#172b4d", lineHeight: 1.1,
              letterSpacing: isMobile ? "-0.5px" : "-1.2px",
              margin: isMobile ? "12px 0 0" : "14px 0 0",
              maxWidth: 620,
            }}>
              <span style={{ display: "block", color: "#172b4d" }}>
                Stock learning
              </span>
              <span
                style={{
                  display: "block",
                  color: "#1c9a52",
                  marginTop: isMobile ? 0 : 2,
                }}
              >
                Made simple
                <span
                  style={{
                    color: "#1c9a52",
                    position: "relative",
                    top: isMobile ? 3 : 4,
                    fontSize: "0.88em",
                  }}
                >
                  •
                </span>
              </span>
            </h1>
            <p style={{
              fontSize: isMobile ? 15 : 18,
              color: "#4b5563",
              marginTop: isMobile ? 8 : 12,
              marginBottom: isMobile ? 14 : 16,
              lineHeight: isMobile ? 1.55 : 1.6,
              maxWidth: 520,
            }}>
              Short interactive lessons that make stock market basics finally
              click.
            </p>

            <WaitlistSection showBannerSubtitle variant="banner" />

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: isMobile ? "flex-start" : "center",
              alignItems: "center",
              gap: 0,
              marginTop: isMobile ? 12 : 14,
              width: "100%",
              maxWidth: 620,
              paddingTop: isMobile ? 2 : 4,
              color: "#486055",
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.6,
            }}>
              <span>Built for beginners</span>
              <span style={{ margin: "0 10px", color: "#7f9387" }}>•</span>
              <span>Practice as you learn</span>
              <span style={{ margin: "0 10px", color: "#7f9387" }}>•</span>
              <span>Educational only</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE FEATURE CARDS (hidden on desktop) ─────────── */}
      <section className="mob-only" style={{ background: "#f9fafb", borderTop: "2px solid #f3f4f6" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontFamily: font, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7280", marginBottom: 4 }}>Why Stoked?</p>
          {[
            { icon: "🔥", label: "Daily Streaks", desc: "Just 5 minutes a day builds real habits. Keep your streak going." },
            { icon: "🏆", label: "Compete with Friends", desc: "Challenge friends, climb leaderboards, and learn together." },
            { icon: "📊", label: "Real Market Data", desc: "Practice with actual stock charts and live market concepts." },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="mob-feat-card">
              <span style={{ fontSize: 30, flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontFamily: font, fontWeight: 800, fontSize: 15, color: "#172b4d" }}>{label}</div>
                <div style={{ fontFamily: font, fontSize: 13, color: "#6b7280", lineHeight: 1.5, marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
          <p style={{ fontFamily: font, fontSize: 13, color: "#9ca3af", textAlign: "center", marginTop: 6 }}>85% of users come back daily</p>
        </div>
      </section>

      {/* ── FEATURE: Streak ──────────────────────────────────── */}
      <Section className="full-section">
        <FeatureRow
          tag="🔥 Build a habit"
          tagColor="#ff9600"
          heading={<>Make learning<br />a daily streak</>}
          body="Just 5 minutes a day builds real knowledge. Track your streak, stay motivated, and watch your understanding compound — just like a good investment."
          illustration={<StreakCard quiz={quizData} />}
        />
      </Section>

      {/* ── FEATURE: Lessons ─────────────────────────────────── */}
      <Section className="full-section" bg="#f9fafb" border>
        <FeatureRow
          flip
          tag="📚 Learn → Practice → Check"
          tagColor="#22c55e"
          heading={<>Bite-sized lessons<br />that actually stick</>}
          body="Every concept is taught in 3 steps: learn the idea, practice applying it, then check your understanding. No passive reading — active learning from day one."
          illustration={<LessonCard />}
        />
      </Section>

      {/* ── FEATURE: Progress ────────────────────────────────── */}
      <Section className="full-section">
        <FeatureRow
          tag="📈 Track everything"
          tagColor="#3b82f6"
          heading={<>See exactly how<br />far you&apos;ve come</>}
          body="10 modules. 100 lessons. Track your progress from stock basics to reading earnings reports. Unlock each module as your confidence grows."
          illustration={<ProgressCard />}
        />
      </Section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ background: "#f9fafb", borderTop: "2px solid #f3f4f6" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "40px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
        }}>
          <StokedLogo />
          <span style={{ fontSize: 13, color: "#9ca3af" }}>© 2025 Stoked. Stock learning that actually clicks.</span>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["Home", "/"], ["Privacy", "/privacy"]].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#22c55e"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
              >{label}</Link>
            ))}
          </div>
        </div>
      </footer>

      {isWaitlistModalOpen && (
        <Modal onClose={() => setIsWaitlistModalOpen(false)}>
          <div style={{ maxWidth: 420 }}>
            <div style={{ marginBottom: 10 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1px solid #dbe6df",
                  borderRadius: 999,
                  padding: "7px 12px",
                  background: "#f7fbf8",
                  color: "#3d5749",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Early Access
              </span>
            </div>
            <h3
              style={{
                margin: 0,
                fontWeight: 900,
                fontSize: 30,
                lineHeight: 1.1,
                letterSpacing: "-0.04em",
                color: "#172b4d",
              }}
            >
              Join the waitlist
            </h3>
            <p
              style={{
                margin: "10px 0 20px",
                fontSize: 15,
                lineHeight: 1.65,
                color: "#5f7067",
                maxWidth: 340,
              }}
            >
              Get early access to Stoked when we launch.
            </p>

            <WaitlistSection showBannerSubtitle variant="modal" />
          </div>
        </Modal>
      )}
    </div>
  );
}
