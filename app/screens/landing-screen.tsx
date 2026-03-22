"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import HeroScene from "@/app/components/HeroScene";
import { useAuth } from "../lib/auth-context";

// ─── Shared font ──────────────────────────────────────────────────────────────
const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

// ─── Gamification helpers ─────────────────────────────────────────────────────
const XP_KEY     = "stoked_xp";
const BADGES_KEY = "stoked_badges";

function getStoredXP(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(XP_KEY) ?? 0);
}
function setStoredXP(n: number) {
  if (typeof window !== "undefined") localStorage.setItem(XP_KEY, String(n));
}
function getStoredBadges(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(BADGES_KEY) ?? "[]"); } catch { return []; }
}
function setStoredBadges(b: string[]) {
  if (typeof window !== "undefined") localStorage.setItem(BADGES_KEY, JSON.stringify(b));
}

const ALL_BADGES = [
  { id: "foundations", emoji: "🎓", label: "Foundations Complete" },
  { id: "streak7",     emoji: "🔥", label: "7-Day Streak" },
  { id: "quick",       emoji: "🚀", label: "Quick Learner" },
  { id: "chart",       emoji: "📊", label: "Chart Master" },
  { id: "allstar",     emoji: "💎", label: "All-Star" },
];

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
  @media(hover:hover){ .st-card:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 0 #d1fae5 !important; background: #f0fdf4 !important; } }
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
        background: "rgba(0,0,0,0.48)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="modal-in"
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20,
          border: "2px solid #22c55e",
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
          width: "100%", maxWidth: 480,
          maxHeight: "90vh", overflowY: "auto",
          padding: 28, position: "relative", fontFamily: font,
        }}
      >
        <button
          onClick={onClose} type="button" aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14,
            width: 32, height: 32, borderRadius: "50%",
            border: "none", background: "#f3f4f6",
            cursor: "pointer", fontSize: 20, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6b7280", transition: "background 150ms",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#e5e7eb"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; }}
        >×</button>
        {children}
      </div>
    </div>
  );
}

// ─── Google Account Button ────────────────────────────────────────────────────
function GoogleAccountButton({
  disabled = false,
  onClick,
  photoUrl,
  signedInHref,
  signedIn,
}: {
  disabled?: boolean;
  onClick: () => void;
  photoUrl?: string | null;
  signedInHref?: string;
  signedIn: boolean;
}) {
  const sharedStyle: React.CSSProperties = {
    width: 44, height: 44, borderRadius: 999,
    border: "2px solid #e5e7eb", background: "#fff",
    boxShadow: "0 4px 0 #e5e7eb",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    overflow: "hidden", textDecoration: "none",
  };

  const icon = signedIn && photoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photoUrl} alt="Google account" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  ) : signedIn ? (
    <span style={{ fontSize: 20 }}>👤</span>
  ) : (
    <span aria-hidden="true" style={{ display: "inline-flex", width: 22, height: 22, borderRadius: "50%", alignItems: "center", justifyContent: "center", background: "conic-gradient(from 180deg, #34a853 0 25%, #fbbc05 25% 50%, #ea4335 50% 75%, #4285f4 75% 100%)" }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />
    </span>
  );

  if (signedIn && signedInHref) {
    return <Link href={signedInHref} style={sharedStyle} aria-label="Open account">{icon}</Link>;
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={sharedStyle} aria-label={signedIn ? "Open account" : "Log in with Google"}>
      {icon}
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

// ─── DuoBtn ───────────────────────────────────────────────────────────────────
function DuoBtn({
  href, children, variant = "primary", big = false, style: extraStyle = {},
}: {
  href?: string; children: React.ReactNode;
  variant?: "primary" | "outline" | "white-on-green"; big?: boolean; style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: font, fontWeight: 800, fontSize: big ? 16 : 14,
    letterSpacing: "0.05em", textTransform: "uppercase",
    textDecoration: "none", padding: big ? "16px 40px" : "12px 28px",
    borderRadius: 16, cursor: "pointer", border: "none",
    transition: "filter 80ms, transform 80ms",
    userSelect: "none", whiteSpace: "nowrap", ...extraStyle,
  };
  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: "#22c55e", color: "#fff", boxShadow: "0 5px 0 #16a34a" },
    outline:  { backgroundColor: "#fff", color: "#172b4d", boxShadow: "0 5px 0 #d1d5db", border: "2px solid #e5e7eb" },
    "white-on-green": { backgroundColor: "#fff", color: "#22c55e", boxShadow: "0 5px 0 rgba(0,0,0,0.15)" },
  };
  const combined = { ...base, ...variants[variant] };
  const isGreen = variant === "primary";
  const pressStyle = (variants[variant].boxShadow as string)?.replace("5px", "2px") ?? "";

  if (href) {
    return (
      <Link href={href} style={combined}
        className={`l-btn${isGreen ? " l-btn-green" : ""}`}
        onMouseDown={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(3px)"; el.style.boxShadow = pressStyle; }}
        onMouseUp={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = variants[variant].boxShadow as string; }}
      >{children}</Link>
    );
  }
  return (
    <button style={combined} className={`l-btn${isGreen ? " l-btn-green" : ""}`}
      onMouseDown={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(3px)"; el.style.boxShadow = pressStyle; }}
      onMouseUp={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = variants[variant].boxShadow as string; }}
    >{children}</button>
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
function StreakCard({ onToast, onXp }: { onToast: (msg: string) => void; onXp: (n: number) => void }) {
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
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Keep learning every day</div>
        </div>
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
          <DuoBtn href="/onboarding" variant="primary" big style={{ width: "100%" }}>
            Start Lesson → +5 XP
          </DuoBtn>
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
function LessonCard({ onToast, onXp }: { onToast: (msg: string) => void; onXp: (n: number) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("learn");
  const [prevTab, setPrevTab] = useState("learn");

  function switchTab(id: string) {
    setPrevTab(tab);
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
              <DuoBtn href="/onboarding" variant="primary" big style={{ width: "100%" }}>
                Start for real → +5 XP
              </DuoBtn>
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
function ProgressCard({ onToast, onXp }: { onToast: (msg: string) => void; onXp: (n: number) => void }) {
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
              <DuoBtn href="/onboarding" variant="primary" big style={{ width: "100%" }}>
                Start Course Free
              </DuoBtn>
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
                <DuoBtn href="/onboarding" variant="primary" big style={{ width: "100%" }}>
                  Continue Learning →
                </DuoBtn>
              )}
            </>
          )}
        </Modal>
      )}
    </>
  );
}

// ─── Badges row ───────────────────────────────────────────────────────────────
function BadgesRow({ unlockedIds }: { unlockedIds: string[] }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {ALL_BADGES.map(b => {
        const unlocked = unlockedIds.includes(b.id);
        return (
          <div
            key={b.id}
            title={b.label}
            className={unlocked ? "badge-pop" : ""}
            style={{
              width: 40, height: 40, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
              background: unlocked ? "#f0fdf4" : "#f3f4f6",
              border: "2px solid " + (unlocked ? "#22c55e" : "#e5e7eb"),
              boxShadow: unlocked ? "0 2px 8px rgba(34,197,94,0.25)" : "none",
              filter: unlocked ? "none" : "grayscale(1) opacity(0.4)",
              transition: "all 300ms",
              cursor: unlocked ? "default" : "help",
            }}
          >
            {b.emoji}
          </div>
        );
      })}
    </div>
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

// ─── Stat icons ───────────────────────────────────────────────────────────────
function ModulesIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect className="st-s1" x="2"  y="34" width="10" height="8"  rx="2.5" />
      <rect className="st-s2" x="13" y="24" width="10" height="18" rx="2.5" />
      <rect className="st-s3" x="24" y="14" width="10" height="28" rx="2.5" />
      <rect className="st-s4" x="35" y="4"  width="8"  height="38" rx="2.5" />
      <circle cx="39" cy="3" r="2.5" fill="#16a34a" opacity="0.7" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <path d="M22 10 L7 14 L7 37 L22 33 Z" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="10" y1="19" x2="20" y2="18" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="24" x2="20" y2="23" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="29" x2="20" y2="28" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="20" y="9" width="4" height="25" rx="2" fill="#22c55e" />
      <g className="st-page">
        <path d="M22 10 L37 14 L37 37 L22 33 Z" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <g className="st-shackle">
        <path d="M13 25 L13 15 Q22 5 31 15 L31 25" stroke="#16a34a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      </g>
      <rect x="7" y="23" width="30" height="18" rx="5" fill="#22c55e" />
      <circle cx="22" cy="30" r="4" fill="rgba(255,255,255,0.85)" />
      <rect x="20.5" y="30" width="3" height="6" rx="1.5" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}
function HourglassIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="6"  y="4"    width="32" height="4.5" rx="2.25" fill="#22c55e" />
      <rect x="6"  y="35.5" width="32" height="4.5" rx="2.25" fill="#22c55e" />
      <path d="M8 8.5 L36 8.5 L22 22 Z" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M8 35.5 L36 35.5 L22 22 Z" fill="#22c55e" stroke="#22c55e" strokeWidth="1.2" strokeLinejoin="round" />
      <circle className="st-sand"  cx="22" cy="14" r="2"   fill="#22c55e" />
      <circle className="st-sand2" cx="22" cy="14" r="1.5" fill="#16a34a" />
      <circle className="st-sand3" cx="22" cy="14" r="1"   fill="#22c55e" />
    </svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, tip, font: f = font }: {
  icon: React.ReactNode; value: string; label: string; tip: string; font?: string;
}) {
  const [on, setOn] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timerRef = useRef<any>(undefined);

  function activate() { setOn(true); clearTimeout(timerRef.current); }
  function deactivate() { clearTimeout(timerRef.current); setOn(false); }
  function tap() {
    if (on) { deactivate(); return; }
    activate();
    timerRef.current = setTimeout(deactivate, 1800);
  }
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div
      className={`st-card${on ? " st-on" : ""}`}
      onClick={tap}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") tap(); }}
      style={{
        background: "#fff", border: "2px solid #e5e7eb", borderRadius: 16,
        padding: "14px 10px 10px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        boxShadow: "0 4px 0 #e5e7eb", minHeight: 56, fontFamily: f, textAlign: "center",
      }}
    >
      {icon}
      <span className="st-num" style={{ fontWeight: 900, fontSize: 26, color: "#172b4d", lineHeight: 1.1, display: "block" }}>{value}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>{label}</span>
      <span className="st-tip">{tip}</span>
    </div>
  );
}

// ─── Landing screen ───────────────────────────────────────────────────────────
export function LandingScreen() {
  const { loading: authLoading, signInWithGoogle, user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Gamification state ──────────────────────────────────────────────────
  const [xp, setXp] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setXp(getStoredXP());
    setUnlockedBadges(getStoredBadges());
  }, []);

  const addToast = useCallback((msg: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, 3000);
  }, []);

  const addXP = useCallback((amount: number, label?: string) => {
    setXp(prev => {
      const next = prev + amount;
      setStoredXP(next);
      return next;
    });
    addToast(label ?? `+${amount} XP`);
  }, [addToast]);

  const photoUrl =
    typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null;

  async function handleGoogleLogin() {
    try {
      if (user) { window.location.href = "/profile"; return; }
      await signInWithGoogle("/course");
    } catch (error) {
      console.error("Failed to start Google sign-in", error);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: font }}>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <ToastStack toasts={toasts} />

      {/* ── NAV ──────────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "2px solid #f3f4f6" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <StokedLogo />
          <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {xp > 0 && (
              <span style={{ fontSize: 13, fontWeight: 800, color: "#22c55e", background: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: 99, padding: "4px 12px" }}>
                ⚡ {xp} XP
              </span>
            )}
            <GoogleAccountButton
              disabled={authLoading && !user}
              onClick={handleGoogleLogin}
              photoUrl={photoUrl}
              signedInHref="/profile"
              signedIn={Boolean(user)}
            />
          </nav>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: isMobile ? "auto" : "calc(100vh - 64px)",
        display: "flex", alignItems: "center",
        background: "#f0fdf4", borderBottom: "2px solid #dcfce7", overflow: "hidden",
      }}>
        <div style={{
          maxWidth: 1600, margin: "0 auto",
          padding: isMobile ? "16px 16px 24px" : "60px 0 60px 40px",
          width: "100%", display: "flex",
          flexDirection: isMobile ? "column-reverse" : "row",
          alignItems: "center", gap: isMobile ? 16 : 0,
          flexWrap: isMobile ? "nowrap" : "wrap", justifyContent: "center",
        }}>
          {/* Left text */}
          <div style={{
            flex: isMobile ? "none" : "0 1 420px",
            minWidth: isMobile ? 0 : 280,
            width: isMobile ? "100%" : undefined,
            textAlign: isMobile ? "center" : "left",
            marginTop: isMobile ? 16 : 0,
          }}>
            <h1 style={{
              fontFamily: font, fontWeight: 900,
              fontSize: isMobile ? "clamp(24px,7vw,28px)" : "clamp(40px,6vw,64px)",
              color: "#172b4d", lineHeight: 1.1,
              letterSpacing: isMobile ? "-0.5px" : "-1.5px", margin: 0,
            }}>
              Learn stocks.<br />
              <span style={{ color: "#22c55e" }}>For free.</span>
            </h1>
            <p style={{
              fontSize: isMobile ? 14 : 20, color: "#4b5563",
              marginTop: isMobile ? 10 : 20, marginBottom: isMobile ? 14 : 36,
              lineHeight: isMobile ? 1.5 : 1.6, maxWidth: isMobile ? "100%" : 440,
            }}>
              Fun, bite-sized lessons that make the stock market finally click. No jargon. No confusion.
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", flexWrap: "wrap", gap: isMobile ? 8 : 12 }}>
              {user ? (
                <DuoBtn href="/course" variant="primary" big style={isMobile ? { width: "100%", padding: "14px 16px" } : {}}>
                  Proceed to Course
                </DuoBtn>
              ) : (
                <>
                  <DuoBtn href="/onboarding" variant="primary" big style={isMobile ? { width: "100%", padding: "14px 16px" } : {}}>
                    Continue as Guest
                  </DuoBtn>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="l-btn"
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontFamily: font, fontWeight: 800,
                      fontSize: isMobile ? 14 : 16, letterSpacing: "0.05em",
                      textTransform: "uppercase", textDecoration: "none",
                      padding: isMobile ? "14px 16px" : "16px 40px",
                      width: isMobile ? "100%" : undefined,
                      borderRadius: 16, cursor: authLoading ? "not-allowed" : "pointer",
                      border: "2px solid #e5e7eb", transition: "filter 80ms, transform 80ms",
                      userSelect: "none", whiteSpace: "nowrap",
                      backgroundColor: "#fff", color: "#172b4d",
                      boxShadow: "0 5px 0 #d1d5db", opacity: authLoading ? 0.7 : 1,
                    }}
                  >
                    Log in with Google
                  </button>
                </>
              )}
            </div>

            {/* Social proof — mobile only */}
            {isMobile && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 }}>
                <div style={{ display: "flex" }}>
                  {["#22c55e", "#3b82f6", "#f59e0b", "#e11d48"].map((color, i) => (
                    <div key={i} style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: color, border: "2px solid #fff",
                      marginLeft: i === 0 ? 0 : -8, fontSize: 11,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 800,
                    }}>
                      {["A", "B", "C", "D"][i]}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#6b7280" }}>Join 50K+ learners</span>
              </div>
            )}

            {/* Badges */}
            {unlockedBadges.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <BadgesRow unlockedIds={unlockedBadges} />
              </div>
            )}

            {/* Animated stat cards */}
            <div className="st-stats-grid" style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
              marginTop: isMobile ? 14 : 28,
              width: isMobile ? "100%" : 340,
            }}>
              <StatCard icon={<ModulesIcon />} value="10"    label="Modules"  tip="Complete at your pace" font={font} />
              <StatCard icon={<BookIcon />}    value="100+"  label="Lessons"  tip="Bite-sized learning"  font={font} />
              <StatCard icon={<LockIcon />}    value="Free"  label="Always"   tip="Forever free"         font={font} />
              <StatCard icon={<HourglassIcon />} value="5 min" label="Per day" tip="Quick daily habit"   font={font} />
            </div>
          </div>

          {/* Right — 3D hero scene */}
          <div style={{
            flex: isMobile ? "none" : "1 1 660px",
            height: isMobile ? 260 : "min(740px, calc(100vh - 100px))",
            minHeight: isMobile ? 0 : 600,
            width: isMobile ? "100%" : undefined,
            position: "relative", overflow: "visible",
          }}>
            <HeroScene width="100%" height="100%" minHeight={isMobile ? 0 : 600} />
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
          illustration={<StreakCard onToast={addToast} onXp={addXP} />}
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
          illustration={<LessonCard onToast={addToast} onXp={addXP} />}
        />
      </Section>

      {/* ── FEATURE: Progress ────────────────────────────────── */}
      <Section className="full-section">
        <FeatureRow
          tag="📈 Track everything"
          tagColor="#3b82f6"
          heading={<>See exactly how<br />far you&apos;ve come</>}
          body="10 modules. 100 lessons. Track your progress from stock basics to reading earnings reports. Unlock each module as your confidence grows."
          illustration={<ProgressCard onToast={addToast} onXp={addXP} />}
        />
      </Section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="full-section" style={{ display: "flex", alignItems: "center", background: "#22c55e", borderTop: "2px solid #16a34a" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "clamp(48px,10vw,80px) clamp(16px,3vw,24px)", textAlign: "center", width: "100%" }}>
          <h2 style={{ fontFamily: font, fontWeight: 900, fontSize: "clamp(24px,5vw,48px)", color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.15, marginBottom: 12 }}>
            Start learning today.<br />It&apos;s free, forever.
          </h2>
          <p style={{ fontSize: "clamp(14px,2vw,18px)" as string, color: "rgba(255,255,255,0.85)", marginBottom: 28, lineHeight: 1.6 }}>
            Continue as a guest right away, or sign in with Google to keep your progress across visits.
          </p>
          <DuoBtn href="/onboarding" variant="white-on-green" big style={isMobile ? { width: "100%", padding: "14px 16px" } : {}}>
            Continue as Guest
          </DuoBtn>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ background: "#f9fafb", borderTop: "2px solid #f3f4f6" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "40px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
        }}>
          <StokedLogo />
          <span style={{ fontSize: 13, color: "#9ca3af" }}>© 2025 Stoked. Stock learning that actually clicks.</span>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["Learn", "/course"], ["Guest", "/onboarding"], ["Privacy", "/privacy"]].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#22c55e"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
              >{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
