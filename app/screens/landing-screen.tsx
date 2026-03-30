"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/auth-context";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const mono = "ui-monospace,SFMono-Regular,monospace";

const STOCK_TAPE = [
  { sym: "AAPL", pct: "+1.24%", up: true },
  { sym: "MSFT", pct: "+0.87%", up: true },
  { sym: "TSLA", pct: "−2.31%", up: false },
  { sym: "NVDA", pct: "+3.14%", up: true },
  { sym: "META", pct: "+0.52%", up: true },
  { sym: "AMZN", pct: "−0.34%", up: false },
  { sym: "SPY", pct: "+0.18%", up: true },
  { sym: "GOOGL", pct: "+1.02%", up: true },
  { sym: "JPM", pct: "−0.91%", up: false },
  { sym: "AMD", pct: "+2.18%", up: true },
  { sym: "NFLX", pct: "−1.04%", up: false },
  { sym: "BRK.B", pct: "+0.45%", up: true },
];

const STOCK_TAPE_DOUBLE = [...STOCK_TAPE, ...STOCK_TAPE];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const LANDING_CSS = `
  .l-btn { transition: filter 150ms ease-out; }
  @media(hover:hover){ .l-btn:hover { filter: brightness(1.06); } }
  @media(hover:hover){ .l-btn-green:hover { box-shadow: 0 0 18px rgba(34,197,94,0.55), 0 5px 0 #16a34a !important; } }

  /* ── Prediction buttons ── */
  .pred-buttons { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  @media (max-width: 540px) { .pred-buttons { grid-template-columns: 1fr; gap: 8px; } }
  .pred-btn { width:100%; cursor:pointer; background:none; transition:all 0.12s ease; border-radius:14px; }
  .pred-btn-inner { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; padding:16px 10px; }
  @media (max-width: 540px) { .pred-btn-inner { flex-direction:row; gap:14px; padding:17px 22px; } }
  .pred-btn-icon { font-size:24px; line-height:1; }
  .pred-btn-label { font-size:11px; font-weight:900; letter-spacing:0.08em; color:#64748b; }
  @media (max-width: 540px) { .pred-btn-label { font-size:15px; } }
  @media(hover:hover){ .pred-btn:hover { border-color:#22c55e !important; background:#f0fdf4 !important; transform:scale(1.03); } }
  .pred-btn:active { transform:scale(0.96) !important; }

  /* ── Phase transitions ── */
  @keyframes fade-in-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .fade-in-up { animation:fade-in-up 0.32s cubic-bezier(0.25,1,0.5,1) both; }
  @keyframes fade-in-scale { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
  .fade-in-scale { animation:fade-in-scale 0.35s cubic-bezier(0.25,1,0.5,1) both; }

  /* ── Micro animations ── */
  @keyframes tension-fill { from{width:0%} to{width:100%} }
  .tension-fill { animation:tension-fill 0.48s linear both; }

  @keyframes sel-pop { 0%{transform:scale(1)} 35%{transform:scale(1.07)} 100%{transform:scale(1)} }
  .sel-pop { animation:sel-pop 0.22s cubic-bezier(0.34,1.56,0.64,1) both; }

  @keyframes badge-pop { 0%{transform:scale(0);opacity:0} 65%{transform:scale(1.22)} 100%{transform:scale(1);opacity:1} }
  .badge-pop { animation:badge-pop 0.32s cubic-bezier(0.34,1.56,0.64,1) both; }

  @keyframes score-pop { 0%{transform:scale(0.5);opacity:0} 65%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  .score-pop { animation:score-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }

  @keyframes reveal-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .reveal-in { animation:reveal-in 0.24s ease-out both; }

  @keyframes dot-in { 0%{transform:scale(0)} 65%{transform:scale(1.35)} 100%{transform:scale(1)} }
  .dot-in { animation:dot-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }

  @keyframes cta-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .cta-in { animation:cta-in 0.28s ease-out 0.08s both; }

  /* ── Live pulse dot ── */
  @keyframes live-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.6} }
  .live-dot { animation:live-pulse 1.6s ease-in-out infinite; }

  /* ── "Most people" tension text ── */
  @keyframes tension-pulse { 0%,100%{opacity:0.55} 50%{opacity:1} }
  .tension-label { animation:tension-pulse 2s ease-in-out infinite; }

  /* ── Module unlock animation ── */
  @keyframes unlock-in { 0%{opacity:0;transform:translateX(-8px)} 100%{opacity:1;transform:translateX(0)} }
  .unlock-in { animation:unlock-in 0.3s ease-out both; }

  /* ── Sticky mobile CTA ── */
  @keyframes cta-slide-up { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
  .cta-slide-up { animation:cta-slide-up 0.4s cubic-bezier(0.34,1.1,0.64,1) both; }
  .sticky-cta-bar { display:none; }
  @media (max-width:767px) { .sticky-cta-bar { display:block; } }

  .stock-tape-track { animation: stock-tape-scroll 28s linear infinite; }
  @keyframes stock-tape-scroll {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  @media(prefers-reduced-motion:reduce){
    *{animation-duration:0.01ms!important;transition-duration:0.01ms!important}
    .stock-tape-track{animation:none!important}
  }
`;

// ─── Google Account Button ────────────────────────────────────────────────────
function GoogleAccountButton({ disabled = false, onClick, photoUrl, signedInHref, signedIn }: {
  disabled?: boolean; onClick: () => void; photoUrl?: string | null; signedInHref?: string; signedIn: boolean;
}) {
  const s: React.CSSProperties = {
    width: 44, height: 44, borderRadius: 999, border: "2px solid #e5e7eb",
    background: "#fff", boxShadow: "0 3px 0 #e5e7eb",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.7 : 1,
    overflow: "hidden", textDecoration: "none",
  };
  const icon = signedIn && photoUrl
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={photoUrl} alt="account" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    : signedIn
      ? <span style={{ fontSize: 20 }}>👤</span>
      : <span aria-hidden style={{ display: "inline-flex", width: 22, height: 22, borderRadius: "50%", alignItems: "center", justifyContent: "center", background: "conic-gradient(from 180deg,#34a853 0 25%,#fbbc05 25% 50%,#ea4335 50% 75%,#4285f4 75% 100%)" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />
        </span>;
  if (signedIn && signedInHref) return <Link href={signedInHref} style={s} aria-label="Open account">{icon}</Link>;
  return <button type="button" onClick={onClick} disabled={disabled} style={s} aria-label={signedIn ? "Open account" : "Log in with Google"}>{icon}</button>;
}

function StokedLogo() {
  return (
    <Link href="/" style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, textDecoration: "none" }}>
      <span style={{ fontFamily: font, fontWeight: 900, fontSize: 24, color: "#172b4d", letterSpacing: "-0.5px", lineHeight: 1 }}>stoked</span>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#22c55e", flexShrink: 0, marginBottom: 4 }} />
    </Link>
  );
}

function GreenBtn({ href, children, big = false }: { href: string; children: React.ReactNode; big?: boolean }) {
  return (
    <Link href={href} className="l-btn l-btn-green" style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      background: "#22c55e", color: "#fff", fontFamily: font, fontWeight: 900,
      fontSize: big ? 17 : 15, padding: big ? "20px 52px" : "14px 32px",
      borderRadius: 99, textDecoration: "none", boxShadow: "0 5px 0 #16a34a",
      letterSpacing: "0.02em", whiteSpace: "nowrap",
    }}>
      {children}
    </Link>
  );
}

function BottomStockTape() {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "20px 0 26px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background:
            "linear-gradient(to right, #f8fafc 0%, transparent 8%, transparent 92%, #f8fafc 100%)",
        }}
      />
      <div
        className="stock-tape-track"
        style={{
          display: "flex",
          width: "max-content",
        }}
      >
        {STOCK_TAPE_DOUBLE.map((item, index) => (
          <div
            key={`${item.sym}-${index}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0 20px",
              borderRight: "1px solid rgba(15, 23, 42, 0.07)",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#334155",
                fontFamily: mono,
                letterSpacing: "0.04em",
              }}
            >
              {item.sym}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: item.up ? "#059669" : "#dc2626",
                fontFamily: mono,
              }}
            >
              {item.pct}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Challenge Flow ───────────────────────────────────────────────────────────
type HeroStep = "entry" | "idle" | "chosen" | "revealing" | "complete" | "scanning" | "done";
type HeroChoice = "up" | "down" | "flat";

interface HeroRound {
  ticker: string;
  company: string;
  prompt: string;
  correct: HeroChoice;
  startPrice: number;
  targets: Record<HeroChoice, number>;
  feedback: Record<HeroChoice, [string, string]>;
}

interface HeroDecision {
  ticker: string;
  actual: HeroChoice;
  choice: HeroChoice;
  correct: boolean;
  changePercent: string;
}

const HERO_ROUNDS: HeroRound[] = [
  {
    ticker: "AAPL",
    company: "Apple",
    prompt: "Apple beats earnings by 20%.\u00a0The stock will\u2026",
    correct: "up",
    startPrice: 18250,
    targets: { up: 19380, down: 17640, flat: 18310 },
    feedback: {
      up:   ["Correct \u2014 buyers rushed in.", "Strong earnings raise expectations. More demand, higher price."],
      down: ["Not quite.", "Strong earnings pull prices UP. Better results attract buyers, not sellers."],
      flat: ["Close \u2014 but not quite.", "Strong earnings spike demand. The price moved hard."],
    },
  },
  {
    ticker: "JPM",
    company: "JPMorgan",
    prompt: "A major bank\u2019s CEO resigns without warning.\u00a0The stock will\u2026",
    correct: "down",
    startPrice: 21480,
    targets: { up: 22230, down: 19680, flat: 21395 },
    feedback: {
      up:   ["Not quite.", "Surprise CEO exits spook investors. They sell first, ask questions later."],
      down: ["Sharp instinct.", "Uncertainty \u2192 confidence drops \u2192 sellers rush out. Markets hate surprises."],
      flat: ["Close, but this moved.", "Unexpected departures almost always trigger a selloff."],
    },
  },
  {
    ticker: "NVDA",
    company: "NVIDIA",
    prompt: "Record revenue. Profit triples.\u00a0The stock will\u2026",
    correct: "up",
    startPrice: 87450,
    targets: { up: 95800, down: 82100, flat: 87910 },
    feedback: {
      up:   ["That\u2019s how markets work.", "Record results \u2192 raised expectations \u2192 demand surges \u2192 price rockets."],
      down: ["Not quite.", "Record results are one of the strongest buy signals. Buyers flooded in."],
      flat: ["Close \u2014 this moved hard.", "Results this strong almost always trigger a surge. Buyers drove it up."],
    },
  },
];

function fmtPrice(p: number): string {
  return `$${Math.floor(p / 100)}.${String(p % 100).padStart(2, "0")}`;
}
function calcPercent(c: HeroChoice, r: HeroRound): string {
  const diff = ((r.targets[c] - r.startPrice) / r.startPrice) * 100;
  return diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
}

const BTNS: [HeroChoice, string, string][] = [
  ["up", "↑", "UP"],
  ["flat", "→", "UNCLEAR"],
  ["down", "↓", "DOWN"],
];


const SCORE_MSGS = [
  { h: "Markets humbled you.", s: "Good. That\u2019s how this starts. The course is what changes it." },
  { h: "You\u2019re closer than you think.", s: "One module and you\u2019ll understand every move you missed." },
  { h: "You think like an investor.", s: "Now learn the full system behind every signal." },
  { h: "You called every move.", s: "This is what market intuition looks like. Let\u2019s build the rest." },
];

function ChallengeFlow({ onComplete, ctaHref }: { onComplete: () => void; ctaHref: string }) {
  const [step, setStep] = useState<HeroStep>("entry");
  const [fading, setFading] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [choice, setChoice] = useState<HeroChoice | null>(null);
  const [price, setPrice] = useState(HERO_ROUNDS[0].startPrice);
  const [showPercent, setShowPercent] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [decisions, setDecisions] = useState<HeroDecision[]>([]);
  const [visibleDecisionRows, setVisibleDecisionRows] = useState(0);
  const [flashBtn, setFlashBtn] = useState<HeroChoice | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const round = HERO_ROUNDS[roundIdx];
  const isLast = roundIdx === HERO_ROUNDS.length - 1;

  // Smooth phase transition helper
  function transition(nextStep: HeroStep, delay = 0) {
    setFading(true);
    setTimeout(() => {
      setStep(nextStep);
      setFading(false);
    }, delay || 220);
  }

  // Live price flicker when idle
  useEffect(() => {
    if (step !== "idle") return;
    const base = round.startPrice;
    const id = setInterval(() => {
      setPrice(p => Math.max(base - 65, Math.min(base + 65, p + Math.round((Math.random() - 0.5) * 7))));
    }, 360);
    return () => clearInterval(id);
  }, [step, round.startPrice]);

  useEffect(() => {
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
      scanTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  function handleChoice(c: HeroChoice) {
    if (step !== "idle") return;
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
    setChoice(c);
    setFlashBtn(c);
    setTimeout(() => setFlashBtn(null), 220);
    setStep("chosen");
    setPrice(round.startPrice);

    // Tension delay then price animation
    setTimeout(() => {
      setStep("revealing");
      const target = round.targets[c];
      const start = round.startPrice;
      const STEPS = 18; // 18 × 16ms ≈ 290ms — fast and punchy
      let count = 0;
      if (tickerRef.current) clearInterval(tickerRef.current);
      tickerRef.current = setInterval(() => {
        count++;
        const t = count / STEPS;
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        setPrice(Math.round(start + (target - start) * eased));
        if (count >= STEPS) {
          clearInterval(tickerRef.current!);
          setPrice(target);
          setShowPercent(true);
          setTimeout(() => {
            const correct = c === round.correct;
            if (correct) setScore(s => s + 1);
            setResults(r => [...r, correct]);
            setDecisions((prev) => [
              ...prev,
              {
                ticker: round.ticker,
                actual: round.correct,
                choice: c,
                correct,
                changePercent: calcPercent(round.correct, round),
              },
            ]);
            setCompleted(n => n + 1);
            setStep("complete");
          }, 260);
        }
      }, 16);
    }, 460);
  }

  function handleAdvance() {
    if (isLast) {
      setFading(true);
      setTimeout(() => {
        setVisibleDecisionRows(0);
        setStep("scanning");
        setFading(false);
        scanTimersRef.current.forEach(clearTimeout);
        scanTimersRef.current = [
          setTimeout(() => setVisibleDecisionRows(1), 180),
          setTimeout(() => setVisibleDecisionRows(2), 460),
          setTimeout(() => setVisibleDecisionRows(3), 740),
          setTimeout(() => {
            setFading(true);
            setTimeout(() => {
              setStep("done");
              setFading(false);
              onComplete();
            }, 180);
          }, 1500),
        ];
      }, 220);
      return;
    }
    const nextIdx = roundIdx + 1;
    setFading(true);
    setTimeout(() => {
      setRoundIdx(nextIdx);
      setChoice(null);
      setShowPercent(false);
      setPrice(HERO_ROUNDS[nextIdx].startPrice);
      setStep("idle");
      setFading(false);
    }, 260);
  }

  const isCorrect = choice !== null && choice === round.correct;
  const isRevealing = step === "revealing" || step === "complete";
  const priceColor = isRevealing && choice ? (isCorrect ? "#22c55e" : "#ef4444") : "#1e293b";
  const pctColor = choice ? (isCorrect ? "#22c55e" : "#ef4444") : "#22c55e";

  function handleStartChallenge() {
    transition("idle");
  }

  // ── ENTRY SCREEN ──
  if (step === "entry") {
    return (
      <div className="fade-in-scale" style={{ width: "100%", maxWidth: 480, textAlign: "center", opacity: fading ? 0 : 1, transition: "opacity 0.2s ease" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <div className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: 11, fontWeight: 900, color: "#22c55e", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Market Instinct Challenge
          </span>
        </div>
        <h1 style={{ fontFamily: font, fontSize: "clamp(32px,6vw,52px)", fontWeight: 900, color: "#1e293b", lineHeight: 1.06, marginBottom: 14, letterSpacing: "-0.02em" }}>
          Most people can&apos;t<br />predict a stock move.
        </h1>
        <p style={{ fontSize: "clamp(18px,2.5vw,22px)", fontWeight: 700, color: "#94a3b8", marginBottom: 44, lineHeight: 1.4 }}>
          Can you?
        </p>
        <button onClick={handleStartChallenge} style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "#22c55e", color: "#fff", fontFamily: font, fontWeight: 900,
          fontSize: 18, padding: "19px 44px", borderRadius: 99,
          border: "none", cursor: "pointer", boxShadow: "0 5px 0 #16a34a",
          letterSpacing: "0.01em",
        }}>
          Take the first call →
        </button>
        <p style={{ marginTop: 18, fontSize: 12, color: "#cbd5e1", fontWeight: 600, letterSpacing: "0.04em" }}>
          3 scenarios · 60 seconds · No background needed
        </p>
      </div>
    );
  }

  if (step === "scanning") {
    return (
      <div
        className="fade-in-scale"
        style={{
          width: "100%",
          maxWidth: 440,
          opacity: fading ? 0 : 1,
          transition: "opacity 0.18s ease",
        }}
      >
        <div
          style={{
            background: "#111111",
            borderRadius: 16,
            padding: "22px 22px 20px",
            boxShadow: "0 20px 56px rgba(0,0,0,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 18,
              paddingBottom: 14,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "rgba(255,255,255,0.42)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: mono,
              }}
            >
              Reading decisions
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {decisions.map((row, index) =>
              visibleDecisionRows > index ? (
                <div
                  key={row.ticker}
                  className="reveal-in"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "54px 1fr 1fr 24px",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 4px",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#ffffff", fontFamily: mono }}>
                    {row.ticker}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: row.actual === "up" ? "#34d399" : row.actual === "down" ? "#f87171" : "#cbd5e1",
                      fontFamily: mono,
                    }}
                  >
                    {row.changePercent}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.38)",
                      fontFamily: mono,
                      letterSpacing: "0.04em",
                    }}
                  >
                    You: {row.choice.toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      textAlign: "right",
                      color: row.correct ? "#34d399" : "#60a5fa",
                    }}
                  >
                    {row.correct ? "✓" : "✗"}
                  </span>
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── SCORE / DONE SCREEN ──
  if (step === "done") {
    const { h, s } = SCORE_MSGS[Math.min(score, 3)];
    return (
      <div className="fade-in-scale" style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 520,
        boxShadow: score >= 2
          ? "0 0 0 2px #22c55e, 0 20px 64px rgba(34,197,94,0.22)"
          : "0 0 0 2px #e2e8f0, 0 20px 56px rgba(0,0,0,0.10)",
        padding: "clamp(28px,5vw,44px)",
        opacity: fading ? 0 : 1, transition: "opacity 0.2s ease",
      }}>
        {/* Result dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 24 }}>
          {results.map((correct, i) => (
            <div key={i} className="dot-in" style={{
              animationDelay: `${i * 0.08}s`,
              width: 14, height: 14, borderRadius: "50%",
              background: correct ? "#22c55e" : "#e2e8f0",
              boxShadow: correct ? "0 0 12px rgba(34,197,94,0.55)" : "none",
            }} />
          ))}
        </div>

        {/* Score */}
        <div className="score-pop" style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: mono, fontSize: 72, fontWeight: 900, color: score >= 2 ? "#22c55e" : "#1e293b", lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontFamily: mono, fontSize: 32, fontWeight: 700, color: "#cbd5e1" }}>/3</span>
        </div>

        <p style={{ fontSize: "clamp(17px,3vw,22px)", fontWeight: 900, color: "#1e293b", marginBottom: 8, lineHeight: 1.25, textAlign: "center" }}>
          {h}
        </p>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 30, lineHeight: 1.7, textAlign: "center" }}>
          {s}
        </p>

        <Link href={ctaHref} className="cta-in" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#22c55e", color: "#fff", fontFamily: font, fontWeight: 900,
          fontSize: 17, padding: "20px 24px", borderRadius: 14,
          textDecoration: "none", boxShadow: "0 5px 0 #16a34a",
          letterSpacing: "0.02em",
        }}>
          Unlock lesson 1 &rarr;
        </Link>
        <p style={{ marginTop: 12, fontSize: 12, color: "#cbd5e1", fontWeight: 700, textAlign: "center" }}>
          Free &nbsp;&middot;&nbsp; No credit card &nbsp;&middot;&nbsp; 10 modules
        </p>
        <p style={{ marginTop: 16, fontSize: 12, color: "#cbd5e1", textAlign: "center", fontWeight: 500 }}>
          &darr;&nbsp; Scroll to see the full path
        </p>
      </div>
    );
  }

  // ── SCENARIO CARD ──
  return (
    <div style={{
      background: "#fff", borderRadius: 24, width: "100%", maxWidth: 520,
      boxShadow: step === "complete" && isCorrect
        ? "0 0 0 2px #22c55e, 0 16px 52px rgba(34,197,94,0.22)"
        : "0 2px 4px rgba(0,0,0,0.04), 0 10px 36px rgba(0,0,0,0.10)",
      padding: "clamp(22px,4vw,36px)",
      transition: "box-shadow 0.4s ease",
      opacity: fading ? 0 : 1,
      transitionProperty: "box-shadow, opacity",
      transitionDuration: "0.4s, 0.22s",
    }}>
      {/* Header: progress + ticker */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              height: 6, borderRadius: 99, transition: "all 0.32s ease",
              width: i < completed ? 20 : i === roundIdx ? 16 : 6,
              background: i < completed
                ? (results[i] ? "#22c55e" : "#cbd5e1")
                : i === roundIdx ? "#1e293b" : "#e2e8f0",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {step === "idle" && <div className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />}
          <span style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", background: "#f8fafc", borderRadius: 99, padding: "3px 10px", letterSpacing: "0.06em", fontFamily: mono }}>
            {round.ticker} &middot; {roundIdx + 1}/3
          </span>
        </div>
      </div>

      {/* Prompt */}
      <p style={{ fontSize: "clamp(15px,2.5vw,17px)", fontWeight: 700, color: "#1e293b", lineHeight: 1.5, marginBottom: 22 }}>
        {round.prompt}
      </p>

      {/* Live price */}
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ display: "inline-flex", alignItems: "baseline", gap: 10 }}>
          <span style={{
            fontFamily: mono, fontWeight: 900, fontSize: "clamp(38px,7vw,52px)",
            color: priceColor, transition: "color 0.26s ease", letterSpacing: "-0.02em",
          }}>
            {fmtPrice(price)}
          </span>
          {showPercent && choice && (
            <span className="badge-pop" style={{
              fontSize: 15, fontWeight: 900, color: pctColor,
              background: `${pctColor}18`, borderRadius: 8, padding: "3px 10px",
            }}>
              {calcPercent(choice, round)}
            </span>
          )}
        </div>
      </div>

      {/* Tension text (idle only) */}
      {step === "idle" && (
        <p className="tension-label" style={{
          textAlign: "center", fontSize: 11, fontWeight: 900,
          color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase",
          marginBottom: 12,
        }}>
          Most people get this wrong
        </p>
      )}

      {/* Answer buttons */}
      <div className="pred-buttons">
        {BTNS.map(([g, arrow, label]) => {
          const sel = choice === g;
          const other = choice !== null && !sel;
          const isFlashing = flashBtn === g;

          if (step === "idle") {
            return (
              <button key={g} onClick={() => handleChoice(g)} className="pred-btn"
                style={{ border: "2px solid #e2e8f0", background: "#f8fafc", fontFamily: font, minHeight: 62 }}>
                <div className="pred-btn-inner">
                  <span className="pred-btn-icon">{arrow}</span>
                  <span className="pred-btn-label">{label}</span>
                </div>
              </button>
            );
          }

          const selBg = sel
            ? (step === "complete" ? (isCorrect ? "#f0fdf4" : "#fef2f2") : "#f1f5f9")
            : "#f8fafc";
          const selBorder = sel
            ? (step === "complete" ? (isCorrect ? "#22c55e" : "#fca5a5") : "#94a3b8")
            : "#e2e8f0";

          return (
            <div key={g} className={isFlashing ? "sel-pop" : ""} style={{
              border: `2px solid ${selBorder}`, background: selBg, borderRadius: 14, minHeight: 62,
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: other ? 0.12 : 1, transition: "opacity 0.2s ease, border-color 0.2s ease, background 0.2s ease",
            }}>
              <div className="pred-btn-inner">
                <span className="pred-btn-icon">{arrow}</span>
                <span className="pred-btn-label">{label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tension bar */}
      {step === "chosen" && (
        <div style={{ height: 3, background: "#e2e8f0", borderRadius: 99, overflow: "hidden", marginTop: 18 }}>
          <div className="tension-fill" style={{ height: "100%", background: "#22c55e", borderRadius: 99 }} />
        </div>
      )}

      {/* Result panel — dark cinematic reveal */}
      {step === "complete" && choice && (
        <div className="reveal-in" style={{ marginTop: 18 }}>
          <div style={{
            background: isCorrect ? "#052e16" : "#0f172a",
            borderRadius: 14, padding: "16px 20px", marginBottom: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: isCorrect ? "#4ade80" : "#94a3b8" }}>
                {round.feedback[choice][0]}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 900,
                color: round.correct === "up" ? "#4ade80" : round.correct === "down" ? "#f87171" : "#94a3b8",
                background: round.correct === "up" ? "#14532d" : round.correct === "down" ? "#450a0a" : "#1e293b",
                borderRadius: 6, padding: "2px 10px",
              }}>
                {round.correct === "up" ? "↑ UP" : round.correct === "down" ? "↓ DOWN" : "→ FLAT"}
              </span>
            </div>
            <p style={{ fontSize: 13, color: isCorrect ? "#bbf7d0" : "#94a3b8", lineHeight: 1.65 }}>
              {round.feedback[choice][1]}
            </p>
          </div>
          <button onClick={handleAdvance} className="cta-in" style={{
            width: "100%", padding: "17px 24px", borderRadius: 14, border: "none",
            background: "#22c55e", color: "#fff", fontFamily: font, fontWeight: 900,
            fontSize: 15, cursor: "pointer", boxShadow: "0 4px 0 #16a34a",
            letterSpacing: "0.02em",
          }}>
            {isLast ? "See your score \u2192" : `Next scenario \u2192 (${roundIdx + 2}/3)`}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Why Most People Stay Confused ───────────────────────────────────────────
const CONFUSIONS = [
  {
    num: "01",
    trigger: "They watch. They never predict.",
    truth: "Passive watching feels productive. It doesn\u2019t build instinct. You need to have a stake in the outcome, even a simulated one.",
  },
  {
    num: "02",
    trigger: "They memorize terms, not moves.",
    truth: "Knowing what a P/E ratio is doesn\u2019t help when a stock drops on great news. You need to understand why prices move, not just what words mean.",
  },
  {
    num: "03",
    trigger: "They never feel the consequence.",
    truth: "Reading about supply and demand is different from dragging a slider and watching the price react. The body learns differently than the brain.",
  },
];

function WhyConfused() {
  return (
    <section style={{ background: "#0f172a", padding: "96px 24px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h2 style={{ fontFamily: font, fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 900, color: "#fff", lineHeight: 1.18, marginBottom: 56, letterSpacing: "-0.01em" }}>
          Why most people stay confused<br />after 100 YouTube videos.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
          {CONFUSIONS.map(({ num, trigger, truth }) => (
            <div key={num} style={{ display: "flex", gap: 28 }}>
              <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: "#1e3a5f", flexShrink: 0, paddingTop: 3 }}>
                {num}
              </span>
              <div>
                <p style={{ fontFamily: font, fontSize: "clamp(15px,2vw,18px)", fontWeight: 800, color: "#f1f5f9", marginBottom: 8, lineHeight: 1.3 }}>
                  {trigger}
                </p>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7 }}>
                  {truth}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How Stoked Trains You ────────────────────────────────────────────────────
const METHOD = [
  { num: "01", title: "Predict first", desc: "Before you see the answer. That\u2019s how instinct forms \u2014 not from reading, from committing." },
  { num: "02", title: "See the consequence", desc: "The price moves. Your call was right or wrong. You feel it. That\u2019s what makes it stick." },
  { num: "03", title: "Understand the why", desc: "The logic hits differently when you had a stake in the outcome. Passive reading can\u2019t replicate this." },
  { num: "04", title: "Repeat until it clicks", desc: "After 10 scenarios, you start seeing signals automatically. That\u2019s pattern recognition, not memorization." },
];

function HowDifferent() {
  return (
    <section style={{ background: "#f8fafc", padding: "96px 24px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#22c55e", textTransform: "uppercase", marginBottom: 16 }}>
          The method
        </p>
        <h2 style={{ fontFamily: font, fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 900, color: "#1e293b", lineHeight: 1.18, marginBottom: 56, letterSpacing: "-0.01em" }}>
          This is how Stoked trains<br />your instincts.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {METHOD.map(({ num, title, desc }) => (
            <div key={num} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: "#cbd5e1", flexShrink: 0, paddingTop: 4, minWidth: 24 }}>
                {num}
              </span>
              <div style={{ borderLeft: "2px solid #e2e8f0", paddingLeft: 22 }}>
                <p style={{ fontFamily: font, fontSize: "clamp(15px,2vw,17px)", fontWeight: 900, color: "#1e293b", marginBottom: 6 }}>
                  {title}
                </p>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Course Path ──────────────────────────────────────────────────────────────
const MODULES = [
  { num: "01", title: "What Is a Stock?",     time: "5 min", free: true },
  { num: "02", title: "Why Prices Move",       time: "5 min", free: true },
  { num: "03", title: "Supply & Demand",       time: "6 min", free: false },
  { num: "04", title: "Earnings & Reports",    time: "5 min", free: false },
  { num: "05", title: "Market Psychology",     time: "7 min", free: false },
  { num: "06", title: "Reading Charts",        time: "6 min", free: false },
  { num: "07", title: "Risk & Loss",           time: "5 min", free: false },
  { num: "08", title: "Building Your System",  time: "8 min", free: false },
];

function CoursePath({ ctaHref, unlocked }: { ctaHref: string; unlocked: boolean }) {
  return (
    <section style={{ background: "#fff", padding: "96px 24px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#22c55e", textTransform: "uppercase", marginBottom: 14 }}>
          The full path
        </p>
        <h2 style={{ fontFamily: font, fontSize: "clamp(22px,3.5vw,32px)", fontWeight: 900, color: "#1e293b", lineHeight: 1.18, marginBottom: 8, letterSpacing: "-0.01em" }}>
          10 modules. 5 minutes each.
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 44, lineHeight: 1.6 }}>
          {unlocked
            ? "Your challenge unlocked the first two. Start whenever you\u2019re ready."
            : "Complete the challenge above to unlock the first two modules free."}
        </p>

        {/* Module list */}
        <div style={{ position: "relative" }}>
          {/* Connector lines */}
          <div style={{ position: "absolute", left: 10, top: 28, bottom: 28, width: 2, background: "#f1f5f9", zIndex: 0 }} />
          {unlocked && (
            <div style={{ position: "absolute", left: 10, top: 28, width: 2, height: 96, background: "#22c55e", zIndex: 0 }} />
          )}

          <div style={{ display: "flex", flexDirection: "column" }}>
            {MODULES.map(({ num, title, time, free }, idx) => {
              const isUnlocked = free && unlocked;
              return (
                <div key={num} className={isUnlocked ? "unlock-in" : ""} style={{
                  animationDelay: isUnlocked ? `${idx * 0.06}s` : "0s",
                  display: "flex", alignItems: "center", gap: 0,
                  padding: "14px 0", position: "relative", zIndex: 1,
                }}>
                  {/* Dot */}
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    background: isUnlocked ? "#22c55e" : "#fff",
                    border: `2px solid ${isUnlocked ? "#22c55e" : "#e2e8f0"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: isUnlocked ? "0 0 12px rgba(34,197,94,0.35)" : "none",
                  }}>
                    {isUnlocked && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{
                    flex: 1, display: "flex", alignItems: "center", gap: 10,
                    paddingLeft: 16,
                    opacity: isUnlocked ? 1 : free ? 0.65 : 0.35,
                  }}>
                    <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: isUnlocked ? "#22c55e" : "#94a3b8", flexShrink: 0 }}>
                      {num}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: isUnlocked ? 700 : 500, color: isUnlocked ? "#1e293b" : "#64748b", flex: 1 }}>
                      {title}
                    </span>
                    <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, flexShrink: 0 }}>{time}</span>
                    {isUnlocked ? (
                      <Link href={ctaHref} style={{
                        fontSize: 12, fontWeight: 900, color: "#22c55e",
                        textDecoration: "none", flexShrink: 0, paddingLeft: 4,
                      }}>
                        Start &rarr;
                      </Link>
                    ) : (
                      <span style={{ fontSize: 13, color: "#e2e8f0", flexShrink: 0 }}>🔒</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ ctaHref }: { ctaHref: string }) {
  return (
    <section style={{ background: "#080e1a", padding: "96px 24px", textAlign: "center" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: "#22c55e", textTransform: "uppercase", marginBottom: 22 }}>
          You just made 3 market calls.
        </p>
        <h2 style={{ fontFamily: font, fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, color: "#fff", marginBottom: 18, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          Now learn why<br />they worked.
        </h2>
        <p style={{ fontSize: 15, color: "#334155", marginBottom: 48, lineHeight: 1.7 }}>
          10 modules. 5 minutes each.<br />Interactive from the first second. Free forever.
        </p>
        <GreenBtn href={ctaHref} big>Unlock lesson 1 &rarr;</GreenBtn>
        <p style={{ marginTop: 18, fontSize: 12, color: "#1e293b", fontWeight: 600 }}>
          Joined by 50,000+ beginners &nbsp;&middot;&nbsp; No credit card
        </p>
      </div>
    </section>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function LandingScreen() {
  const { loading: authLoading, signInWithGoogle, user } = useAuth();
  const [challengeComplete, setChallengeComplete] = useState(false);

  const ctaHref = user ? "/course" : "/onboard";

  const photoUrl =
    typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url
    : typeof user?.user_metadata?.picture === "string" ? user.user_metadata.picture
    : null;

  async function handleGoogleLogin() {
    try {
      if (user) { window.location.href = "/profile"; return; }
      await signInWithGoogle("/landing");
    } catch (err) { console.error("Failed to start Google sign-in", err); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: font, paddingBottom: challengeComplete ? 80 : 0 }}>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />

      {/* ── NAV ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(248,250,252,0.9)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <StokedLogo />
          <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              <GoogleAccountButton disabled={authLoading && !user} onClick={handleGoogleLogin} photoUrl={photoUrl} signedInHref="/profile" signedIn />
            ) : (
              <button type="button" onClick={handleGoogleLogin} disabled={authLoading}
                style={{ border: "none", background: "transparent", color: "#64748b", fontFamily: font, fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "8px 4px" }}>
                Log in
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* ── CHALLENGE (full viewport) ── */}
      <section style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "clamp(32px,5vw,64px) 20px 88px", gap: 16,
        background: "#f8fafc",
        position: "relative",
      }}>
        <ChallengeFlow onComplete={() => setChallengeComplete(true)} ctaHref={ctaHref} />
        <p style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700, letterSpacing: "0.04em" }}>
          Free &nbsp;&middot;&nbsp; No credit card &nbsp;&middot;&nbsp; No paywalls
        </p>
        <BottomStockTape />
      </section>

      {/* ── WHY MOST PEOPLE STAY CONFUSED ── */}
      <WhyConfused />

      {/* ── HOW STOKED TRAINS YOU ── */}
      <HowDifferent />

      {/* ── COURSE PATH ── */}
      <CoursePath ctaHref={ctaHref} unlocked={challengeComplete} />

      {/* ── FINAL CTA ── */}
      <FinalCTA ctaHref={ctaHref} />

      {/* ── FOOTER ── */}
      <footer style={{ background: "#040810", borderTop: "1px solid #0f172a", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          <StokedLogo />
          <span style={{ fontSize: 12, color: "#1e293b" }}>&copy; 2025 Stoked</span>
          <Link href="/privacy" style={{ fontSize: 12, color: "#1e293b", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ fontSize: 12, color: "#1e293b", textDecoration: "none" }}>Terms</Link>
        </div>
      </footer>

      {/* ── STICKY MOBILE CTA (after challenge) ── */}
      {challengeComplete && (
        <div className="sticky-cta-bar cta-slide-up" style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          background: "#fff", borderTop: "1px solid #e2e8f0", padding: "12px 16px 20px",
        }}>
          <Link href={ctaHref} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#22c55e", color: "#fff", fontFamily: font, fontWeight: 900,
            fontSize: 15, height: 52, borderRadius: 14, textDecoration: "none",
            boxShadow: "0 4px 0 #16a34a", letterSpacing: "0.02em",
          }}>
            Unlock lesson 1 &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
