"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import HeroScene from "@/app/components/HeroScene";
import { useAuth } from "../lib/auth-context";

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
    width: 44,
    height: 44,
    borderRadius: 999,
    border: "2px solid #e5e7eb",
    background: "#fff",
    boxShadow: "0 4px 0 #e5e7eb",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    overflow: "hidden",
    textDecoration: "none",
  };

  const icon = signedIn && photoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl}
      alt="Google account"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : signedIn ? (
    <span style={{ fontSize: 20 }}>👤</span>
  ) : (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        width: 22,
        height: 22,
        borderRadius: "50%",
        alignItems: "center",
        justifyContent: "center",
        background:
          "conic-gradient(from 180deg, #34a853 0 25%, #fbbc05 25% 50%, #ea4335 50% 75%, #4285f4 75% 100%)",
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />
    </span>
  );

  if (signedIn && signedInHref) {
    return (
      <Link
        href={signedInHref}
        style={sharedStyle}
        aria-label="Open account"
        title="Open account"
      >
        {icon}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={sharedStyle}
      aria-label={signedIn ? "Open account" : "Log in with Google"}
      title={signedIn ? "Open account" : "Log in with Google"}
    >
      {icon}
    </button>
  );
}

// ─── Stoked logo ──────────────────────────────────────────────────────────────
function StokedLogo({ large = false }: { large?: boolean }) {
  return (
    <Link href="/" style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, textDecoration: "none" }}>
      <span style={{
        fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)",
        fontWeight: 900,
        fontSize: large ? 40 : 24,
        color: "#172b4d",
        letterSpacing: "-0.5px",
        lineHeight: 1,
      }}>stoked</span>
      <span style={{
        width: large ? 14 : 9,
        height: large ? 14 : 9,
        borderRadius: "50%",
        backgroundColor: "#22c55e",
        flexShrink: 0,
        marginBottom: large ? 6 : 4,
      }} />
    </Link>
  );
}

// ─── Duolingo-style 3-D button ────────────────────────────────────────────────
function DuoBtn({
  href,
  children,
  variant = "primary",
  big = false,
  style: extraStyle = {},
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "white-on-green";
  big?: boolean;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)",
    fontWeight: 800,
    fontSize: big ? 16 : 14,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    textDecoration: "none",
    padding: big ? "16px 40px" : "12px 28px",
    borderRadius: 16,
    cursor: "pointer",
    border: "none",
    transition: "filter 80ms, transform 80ms",
    userSelect: "none",
    whiteSpace: "nowrap",
    ...extraStyle,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "#22c55e",
      color: "#fff",
      boxShadow: "0 5px 0 #16a34a",
    },
    outline: {
      backgroundColor: "#fff",
      color: "#172b4d",
      boxShadow: "0 5px 0 #d1d5db",
      border: "2px solid #e5e7eb",
    },
    "white-on-green": {
      backgroundColor: "#fff",
      color: "#22c55e",
      boxShadow: "0 5px 0 rgba(0,0,0,0.15)",
    },
  };

  const combinedStyle = { ...base, ...variants[variant] };

  if (href) {
    return (
      <Link href={href} style={combinedStyle}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.05)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ""; }}
        onMouseDown={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(3px)"; el.style.boxShadow = (variants[variant].boxShadow as string)?.replace("5px", "2px") ?? ""; }}
        onMouseUp={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = variants[variant].boxShadow as string; }}
      >
        {children}
      </Link>
    );
  }
  return (
    <button style={combinedStyle}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.05)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ""; }}
    >
      {children}
    </button>
  );
}

// ─── Streak illustration ──────────────────────────────────────────────────────
function StreakCard() {
  const days = ["M","T","W","T","F","S","S"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ fontSize: 80, lineHeight: 1 }}>🔥</div>
      <div style={{ display: "flex", gap: 10 }}>
        {days.map((d,i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: i < 5 ? "#ff9600" : "#f3f4f6",
              color: i < 5 ? "#fff" : "#d1d5db",
              fontWeight: 800, fontSize: 14,
              boxShadow: i < 5 ? "0 4px 0 #e08500" : "0 4px 0 #e5e7eb",
            }}>
              {i < 5 ? "✓" : "·"}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{
        background: "#fff7ed",
        border: "2px solid #ff9600",
        borderRadius: 20,
        boxShadow: "0 5px 0 #e08500",
        padding: "14px 32px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#ff9600" }}>5 day streak!</div>
        <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Keep learning every day</div>
      </div>
    </div>
  );
}

// ─── Lesson card illustration ─────────────────────────────────────────────────
function LessonCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, width: "100%" }}>
      <div style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: 20, padding: 20, boxShadow: "0 5px 0 #e5e7eb" }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#22c55e", marginBottom: 8 }}>Module 1 · Lesson 3</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#172b4d", marginBottom: 8 }}>What is a stock?</div>
        <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 12 }}>
          A stock represents partial ownership in a company. When you buy a share, you become a shareholder.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {["ownership","shares","equity"].map(t => (
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
          <div style={{ width: "75%", height: "100%", background: "#22c55e", borderRadius: 99 }} />
        </div>
      </div>
      <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 20, padding: 16, boxShadow: "0 5px 0 #16a34a" }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#22c55e" }}>Your answer</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#172b4d", marginTop: 4 }}>Partial ownership in a company</div>
      </div>
    </div>
  );
}

// ─── Progress illustration ────────────────────────────────────────────────────
function ProgressCard() {
  const mods = [
    { name: "Foundations",      pct: 100, color: "#22c55e", shadow: "#16a34a" },
    { name: "Chart Basics",     pct: 60,  color: "#3b82f6", shadow: "#2563eb" },
    { name: "Trend & Momentum", pct: 0,   color: "#a855f7", shadow: "#9333ea" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, width: "100%" }}>
      {mods.map(m => (
        <div key={m.name} style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: 20, padding: 20, boxShadow: `0 5px 0 #e5e7eb` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 800, color: "#172b4d", fontSize: 15 }}>{m.name}</span>
            <span style={{ fontWeight: 800, fontSize: 14, color: m.color }}>
              {m.pct === 100 ? "Complete!" : m.pct === 0 ? "Locked" : `${m.pct}%`}
            </span>
          </div>
          <div style={{ height: 14, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${m.pct}%`, height: "100%", background: m.color, borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  children,
  bg = "#fff",
  border = false,
  className = "",
}: {
  children: React.ReactNode;
  bg?: string;
  border?: boolean;
  className?: string;
}) {
  return (
    <section className={className} style={{
      display: "flex",
      alignItems: "center",
      background: bg,
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
function FeatureRow({
  tag,
  tagColor,
  heading,
  body,
  illustration,
  flip = false,
}: {
  tag: string;
  tagColor: string;
  heading: React.ReactNode;
  body: string;
  illustration: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: flip ? "row-reverse" : "row",
      alignItems: "center",
      gap: "clamp(24px,6vw,64px)",
      flexWrap: "wrap",
      justifyContent: "center",
    }}>
      <div style={{ flex: "1 1 300px", minWidth: 0, textAlign: "left" }}>
        <div style={{ fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", color: tagColor, marginBottom: 12 }}>{tag}</div>
        <h2 style={{ fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)", fontWeight: 900, fontSize: "clamp(28px,4vw,40px)", color: "#172b4d", lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.5px" }}>
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

// ─── Animated stat cards ──────────────────────────────────────────────────────

const STAT_CSS = `
  .st-card { transition: transform 150ms, box-shadow 150ms, background 200ms; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
  @media(hover:hover){ .st-card:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 0 #d1fae5 !important; background: #f0fdf4 !important; } }
  .st-card:active { transform: scale(0.97) !important; }
  .st-card.st-on { background: #f0fdf4 !important; box-shadow: 0 6px 0 #d1fae5 !important; }
  .st-num { display: block; }
  .st-card.st-on .st-num { animation: st-num-pop 400ms cubic-bezier(0.34,1.56,0.64,1) both; }
  @keyframes st-num-pop { 0%{transform:scale(1)} 55%{transform:scale(1.22)} 100%{transform:scale(1.06)} }
  .st-tip { max-height: 0; overflow: hidden; opacity: 0; transition: max-height 280ms ease, opacity 240ms ease; font-size: 11px; font-weight: 700; color: #22c55e; letter-spacing: 0.04em; }
  .st-card.st-on .st-tip { max-height: 2em; opacity: 1; }

  /* Stairs — each step lights up in sequence */
  .st-s1 { animation: st-step 2.4s 0.0s infinite; }
  .st-s2 { animation: st-step 2.4s 0.6s infinite; }
  .st-s3 { animation: st-step 2.4s 1.2s infinite; }
  .st-s4 { animation: st-step 2.4s 1.8s infinite; }
  @keyframes st-step { 0%,20%,100%{fill:#dcfce7} 35%,65%{fill:#22c55e} }

  /* Book — right page flips */
  .st-page { transform-box: fill-box; transform-origin: 0% 50%; animation: st-page-flip 3s ease-in-out infinite; }
  @keyframes st-page-flip { 0%,32%,100%{transform:scaleX(1)} 46%,54%{transform:scaleX(0.05)} }

  /* Lock — shackle lifts to open */
  .st-shackle { animation: st-lock-open 3.2s ease-in-out infinite; }
  @keyframes st-lock-open { 0%,48%,100%{transform:translateY(0)} 62%,88%{transform:translateY(-9px)} }

  /* Hourglass — sand particles fall */
  .st-sand  { animation: st-sand-fall 2.5s 0.0s ease-in infinite; }
  .st-sand2 { animation: st-sand-fall 2.5s 0.8s ease-in infinite; }
  .st-sand3 { animation: st-sand-fall 2.5s 1.6s ease-in infinite; }
  @keyframes st-sand-fall {
    0%,6%  { opacity:0; transform:translateY(0); }
    12%    { opacity:1; transform:translateY(0); }
    78%    { opacity:0.8; transform:translateY(11px); }
    88%,100% { opacity:0; transform:translateY(11px); }
  }

  @media(prefers-reduced-motion:reduce){
    .st-s1,.st-s2,.st-s3,.st-s4,.st-page,.st-shackle,.st-sand,.st-sand2,.st-sand3 { animation:none !important; }
  }

  /* Full-screen sections — desktop only */
  .full-section { min-height: 100vh; }
  @media (max-width: 767px) { .full-section { min-height: 0 !important; } }

  /* Mobile-only utilities */
  .mob-only { display: none !important; }
  @media (max-width: 767px) {
    .mob-only { display: block !important; }
  }
  /* Stats single-col under 340px */
  @media (max-width: 339px) {
    .st-stats-grid { grid-template-columns: 1fr !important; }
  }
  /* Mobile feature card */
  .mob-feat-card {
    background: #fff;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 16px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 4px 0 #e5e7eb;
  }
`;

function ModulesIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect className="st-s1" x="2"  y="34" width="10" height="8"  rx="2.5" />
      <rect className="st-s2" x="13" y="24" width="10" height="18" rx="2.5" />
      <rect className="st-s3" x="24" y="14" width="10" height="28" rx="2.5" />
      <rect className="st-s4" x="35" y="4"  width="8"  height="38" rx="2.5" />
      {/* Small person climbing */}
      <circle cx="39" cy="3" r="2.5" fill="#16a34a" opacity="0.7" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      {/* Left page — static */}
      <path d="M22 10 L7 14 L7 37 L22 33 Z" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="10" y1="19" x2="20" y2="18" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="24" x2="20" y2="23" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="29" x2="20" y2="28" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" />
      {/* Spine */}
      <rect x="20" y="9" width="4" height="25" rx="2" fill="#22c55e" />
      {/* Right page — flips (scaleX from left edge = spine) */}
      <g className="st-page">
        <path d="M22 10 L37 14 L37 37 L22 33 Z" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1.5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      {/* Shackle — drawn first so body overlaps at rest */}
      <g className="st-shackle">
        <path d="M13 25 L13 15 Q22 5 31 15 L31 25"
          stroke="#16a34a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      </g>
      {/* Body — covers shackle legs at rest, revealing open gap when shackle lifts */}
      <rect x="7" y="23" width="30" height="18" rx="5" fill="#22c55e" />
      {/* Keyhole */}
      <circle cx="22" cy="30" r="4" fill="rgba(255,255,255,0.85)" />
      <rect x="20.5" y="30" width="3" height="6" rx="1.5" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

function HourglassIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      {/* Top and bottom bars */}
      <rect x="6" y="4"  width="32" height="4.5" rx="2.25" fill="#22c55e" />
      <rect x="6" y="35.5" width="32" height="4.5" rx="2.25" fill="#22c55e" />
      {/* Upper triangle (remaining sand) */}
      <path d="M8 8.5 L36 8.5 L22 22 Z" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Lower triangle (collected sand) */}
      <path d="M8 35.5 L36 35.5 L22 22 Z" fill="#22c55e" stroke="#22c55e" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Falling sand particles — drop from neck */}
      <circle className="st-sand"  cx="22" cy="14" r="2"   fill="#22c55e" />
      <circle className="st-sand2" cx="22" cy="14" r="1.5" fill="#16a34a" />
      <circle className="st-sand3" cx="22" cy="14" r="1"   fill="#22c55e" />
    </svg>
  );
}

function StatCard({
  icon,
  value,
  label,
  tip,
  font,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tip: string;
  font: string;
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
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") tap(); }}
      style={{
        background: "#fff",
        border: "2px solid #e5e7eb",
        borderRadius: 16,
        padding: "14px 10px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        boxShadow: "0 4px 0 #e5e7eb",
        minHeight: 56,
        fontFamily: font,
        textAlign: "center",
      }}
    >
      {icon}
      <span className="st-num" style={{ fontWeight: 900, fontSize: 26, color: "#172b4d", lineHeight: 1.1, display: "block" }}>
        {value}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>{label}</span>
      <span className="st-tip">{tip}</span>
    </div>
  );
}

// ─── Landing screen ───────────────────────────────────────────────────────────
export function LandingScreen() {
  const { loading: authLoading, signInWithGoogle, user } = useAuth();
  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const photoUrl =
    typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null;

  async function handleGoogleLogin() {
    try {
      if (user) {
        window.location.href = "/profile";
        return;
      }

      await signInWithGoogle("/course");
    } catch (error) {
      console.error("Failed to start Google sign-in", error);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: font }}>
      <style dangerouslySetInnerHTML={{ __html: STAT_CSS }} />

      {/* ── NAV ──────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#fff",
        borderBottom: "2px solid #f3f4f6",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <StokedLogo />
          <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
        display: "flex",
        alignItems: "center",
        background: "#f0fdf4",
        borderBottom: "2px solid #dcfce7",
        overflow: "hidden",
      }}>
        <div style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: isMobile ? "16px 16px 24px" : "60px 0 60px 40px",
          width: "100%",
          display: "flex",
          flexDirection: isMobile ? "column-reverse" : "row",
          alignItems: "center",
          gap: isMobile ? 16 : 0,
          flexWrap: isMobile ? "nowrap" : "wrap",
          justifyContent: "center",
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
              fontFamily: font,
              fontWeight: 900,
              fontSize: isMobile ? "clamp(24px,7vw,28px)" : "clamp(40px,6vw,64px)",
              color: "#172b4d",
              lineHeight: 1.1,
              letterSpacing: isMobile ? "-0.5px" : "-1.5px",
              margin: 0,
            }}>
              Learn stocks.<br />
              <span style={{ color: "#22c55e" }}>For free.</span>
            </h1>
            <p style={{
              fontSize: isMobile ? 14 : 20,
              color: "#4b5563",
              marginTop: isMobile ? 10 : 20,
              marginBottom: isMobile ? 14 : 36,
              lineHeight: isMobile ? 1.5 : 1.6,
              maxWidth: isMobile ? "100%" : 440,
            }}>
              Fun, bite-sized lessons that make the stock market finally click. No jargon. No confusion.
            </p>

            {/* Buttons */}
            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              flexWrap: "wrap",
              gap: isMobile ? 8 : 12,
            }}>
              {user ? (
                <DuoBtn href="/course" variant="primary" big
                  style={isMobile ? { width: "100%", padding: "14px 16px" } : {}}>
                  Proceed to Course
                </DuoBtn>
              ) : (
                <>
                  <DuoBtn href="/onboarding" variant="primary" big
                    style={isMobile ? { width: "100%", padding: "14px 16px" } : {}}>
                    Continue as Guest
                  </DuoBtn>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: font,
                      fontWeight: 800,
                      fontSize: isMobile ? 14 : 16,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      padding: isMobile ? "14px 16px" : "16px 40px",
                      width: isMobile ? "100%" : undefined,
                      borderRadius: 16,
                      cursor: authLoading ? "not-allowed" : "pointer",
                      border: "2px solid #e5e7eb",
                      transition: "filter 80ms, transform 80ms",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      backgroundColor: "#fff",
                      color: "#172b4d",
                      boxShadow: "0 5px 0 #d1d5db",
                      opacity: authLoading ? 0.7 : 1,
                    }}
                  >
                    Log in with Google
                  </button>
                </>
              )}
            </div>

            {/* Social proof — mobile only */}
            {isMobile ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 }}>
                <div style={{ display: "flex" }}>
                  {["#22c55e","#3b82f6","#f59e0b","#e11d48"].map((color, i) => (
                    <div key={i} style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: color,
                      border: "2px solid #fff",
                      marginLeft: i === 0 ? 0 : -8,
                      fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800,
                    }}>
                      {["A","B","C","D"][i]}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#6b7280" }}>Join 50K+ learners</span>
              </div>
            ) : null}

            {/* Animated stat cards */}
            <div className="st-stats-grid" style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: isMobile ? 14 : 28,
              width: isMobile ? "100%" : 340,
            }}>
              <StatCard icon={<ModulesIcon />} value="10"    label="Modules"  tip="Complete at your pace" font={font} />
              <StatCard icon={<BookIcon />}    value="100+"  label="Lessons"  tip="Bite-sized learning"  font={font} />
              <StatCard icon={<LockIcon />}    value="Free"  label="Always"   tip="Forever free"         font={font} />
              <StatCard icon={<HourglassIcon />} value="5 min" label="Per day" tip="Quick daily habit"  font={font} />
            </div>
          </div>

          {/* Right — 3D hero scene */}
          <div style={{
            flex: isMobile ? "none" : "1 1 660px",
            height: isMobile ? 220 : "min(740px, calc(100vh - 100px))",
            minHeight: isMobile ? 0 : 600,
            width: isMobile ? "100%" : undefined,
            position: "relative",
            overflow: "visible",
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
          illustration={<StreakCard />}
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

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="full-section" style={{ display: "flex", alignItems: "center", background: "#22c55e", borderTop: "2px solid #16a34a" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "clamp(48px,10vw,80px) clamp(16px,3vw,24px)", textAlign: "center", width: "100%" }}>
          <h2 style={{
            fontFamily: font, fontWeight: 900,
            fontSize: "clamp(24px,5vw,48px)",
            color: "#fff", letterSpacing: "-0.5px",
            lineHeight: 1.15, marginBottom: 12,
          }}>
            Start learning today.<br />It&apos;s free, forever.
          </h2>
          <p style={{ fontSize: "clamp(14px,2vw,18px)" as string, color: "rgba(255,255,255,0.85)", marginBottom: 28, lineHeight: 1.6 }}>
            Continue as a guest right away, or sign in with Google to keep your progress across visits.
          </p>
          <DuoBtn href="/onboarding" variant="white-on-green" big
            style={isMobile ? { width: "100%", padding: "14px 16px" } : {}}>
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
