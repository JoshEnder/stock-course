"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { Hero } from "../components/hero";

const sans  = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const serif = "var(--font-cormorant,'Cormorant Garamond',Georgia,serif)";
const mono  = "ui-monospace,SFMono-Regular,monospace";

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function useReveal(threshold = 0.08) {
  const ref  = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

// ─── HERO (legacy, replaced by components/hero) ─────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HeroSection({ isAuthed }: { isAuthed: boolean }) {
  return (
    <section className="l-hero">
      {/* Subtle noise layer */}
      <div className="l-hero-noise" />

      {/* Horizontal rule across full width */}
      <div className="l-hero-rule-h" />

      {/* Left edge: ticker column */}
      <div className="l-hero-ticker-col" aria-hidden>
        {["NVDA +8.3%", "AAPL +1.2%", "TSLA −2.3%", "META +0.5%", "SPY +0.2%", "MSFT +0.9%", "AMZN −0.3%", "GOOGL +1.0%"].map((t, i) => (
          <div key={i} className="l-hero-ticker-item" style={{ animationDelay: `${i * 0.55}s` }}>
            <span style={{
              fontFamily: mono,
              fontSize: 10,
              fontWeight: 700,
              color: t.includes("−") ? "rgba(239,68,68,0.45)" : "rgba(16,185,129,0.55)",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}>
              {t}
            </span>
          </div>
        ))}
      </div>

      {/* Center */}
      <div className="l-hero-center">
        {/* Kicker */}
        <div className="l-hero-kicker hero-kicker-anim">
          <span className="l-live-dot" />
          <span>Decisions, not definitions</span>
        </div>

        {/* Main headline */}
        <h1 className="l-hero-h1 hero-h1-anim">
          Learn stocks<br />
          <em>by doing.</em>
        </h1>

        {/* Sub */}
        <p className="l-hero-sub hero-sub-anim">
          See a real scenario. Make the call.<br />
          Find out what happened — and why.
        </p>

        {/* CTA row */}
        <div className="l-hero-ctas hero-ctas-anim">
          <Link href="/experience" className="l-cta-green">
            {isAuthed ? "Continue learning →" : "Take your first calls →"}
          </Link>
          <a href="#method" className="l-cta-ghost">
            See the method
          </a>
        </div>
        <p className="l-hero-note hero-note-anim">~60 seconds · no finance background needed</p>
      </div>

      {/* Right edge: scenario preview card */}
      <div className="l-hero-card-col" aria-hidden>
        <ScenarioPreviewCard />
      </div>
    </section>
  );
}

function ScenarioPreviewCard() {
  return (
    <div className="l-preview-card">
      {/* Progress bar */}
      <div style={{ height: 2, backgroundColor: "rgba(0,0,0,0.05)", position: "relative", borderRadius: "2px 2px 0 0", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "66%", backgroundColor: "#10b981" }} />
      </div>

      {/* Header */}
      <div style={{ padding: "11px 16px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>2 of 3</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span className="l-live-dot" style={{ width: 5, height: 5 }} />
          <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 800, color: "#0d0d0d", letterSpacing: "0.04em" }}>NVDA</span>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        <p style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: "#111111", lineHeight: 1.45, margin: "0 0 14px", letterSpacing: "-0.005em" }}>
          Nvidia beats earnings by 18%. What does the stock do at open?
        </p>

        {/* Price */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: "#c4c9d4", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Moved to</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: mono, fontSize: 28, fontWeight: 800, color: "#059669", letterSpacing: "-0.03em", lineHeight: 1 }}>$967.11</span>
            <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: "#059669" }}>+8.4%</span>
          </div>
        </div>

        {/* Options */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
          {[
            { l: "↑ UP",   sel: true  },
            { l: "→ FLAT", sel: false },
            { l: "↓ DOWN", sel: false },
          ].map(o => (
            <div key={o.l} style={{
              padding: "9px 4px",
              borderRadius: 8,
              border: o.sel ? "1.5px solid #10b981" : "1.5px solid rgba(0,0,0,0.07)",
              backgroundColor: o.sel ? "#ecfdf5" : "#f7f7f6",
              textAlign: "center",
              fontFamily: mono,
              fontSize: 10,
              fontWeight: 700,
              color: o.sel ? "#065f46" : "#d1d5db",
              opacity: o.sel ? 1 : 0.45,
            }}>{o.l}</div>
          ))}
        </div>

        {/* Result */}
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid rgba(16,185,129,0.18)", borderRadius: 9, padding: "10px 12px" }}>
          <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: "#065f46", marginBottom: 4 }}>Correct. Revenue surprised by 18%.</div>
          <div style={{ fontFamily: sans, fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>Beats create upside when expectations were flat. The gap is what moves price.</div>
        </div>
      </div>
    </div>
  );
}

// ─── METHOD SECTION ───────────────────────────────────────────────────────────
function MethodSection() {
  const { ref, vis } = useReveal();
  const steps = [
    { n: "01", title: "See a real scenario", body: "A stock, a moment, real context. You are there before the move." },
    { n: "02", title: "Make the call",       body: "UP, FLAT, or DOWN. Commit without a safety net." },
    { n: "03", title: "See what happened",   body: "The price moves exactly as it did. No simulation." },
    { n: "04", title: "Understand why",      body: "A clear, precise explanation of the causal logic." },
  ];

  return (
    <section id="method" className="l-section l-section-alt" ref={ref}>
      <div className="l-section-inner">
        {/* Left: heading column */}
        <div className={`l-reveal ${vis ? "l-reveal-in" : ""}`} style={{ flex: "0 0 340px" }}>
          <div className="l-label">The method</div>
          <h2 className="l-h2" style={{ maxWidth: 300 }}>
            Market moves<br />that finally<br />click.
          </h2>
          <p className="l-body" style={{ maxWidth: 280 }}>
            Every Stoked lesson puts you in a real situation before explaining anything. Decision first. Clarity after.
          </p>
        </div>

        {/* Right: step grid */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, backgroundColor: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 16, overflow: "hidden" }}>
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`l-step-cell l-reveal ${vis ? "l-reveal-in" : ""}`}
              style={{ transitionDelay: `${0.06 * i}s`, borderRight: i % 2 === 0 ? "1px solid rgba(0,0,0,0.06)" : "none", borderBottom: i < 2 ? "1px solid rgba(0,0,0,0.06)" : "none" }}
            >
              <span className="l-step-n">{s.n}</span>
              <div className="l-step-title">{s.title}</div>
              <div className="l-step-body">{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CHALLENGE DEMO SECTION ───────────────────────────────────────────────────
function ChallengeDemoSection() {
  const { ref, vis } = useReveal();

  return (
    <section className="l-section" ref={ref} style={{ overflow: "hidden" }}>
      <div className="l-section-inner" style={{ alignItems: "flex-start" }}>
        {/* Left: big product mock */}
        <div className={`l-reveal ${vis ? "l-reveal-in" : ""}`} style={{ flex: "1 1 480px" }}>
          <FullChallengeMock />
        </div>

        {/* Right: text */}
        <div className={`l-reveal ${vis ? "l-reveal-in" : ""}`} style={{ flex: "0 0 380px", transitionDelay: "0.1s", paddingTop: 12 }}>
          <div className="l-label">Concepts that stick</div>
          <h2 className="l-h2">
            Consequence<br />creates<br />understanding.
          </h2>
          <p className="l-body">
            Making a decision changes how you receive information. When you commit and find out you were wrong, the explanation lands differently. That is what builds lasting pattern recognition.
          </p>
          <p className="l-body-muted">
            Stoked uses real earnings events, news reactions, and macro moments — not fabricated examples or theory exercises.
          </p>
          <Link href="/experience" className="l-cta-green" style={{ marginTop: 32, display: "inline-flex" }}>
            Try a challenge →
          </Link>
        </div>
      </div>
    </section>
  );
}

function FullChallengeMock() {
  return (
    <div className="l-mock-shell" style={{ maxWidth: 460 }}>
      {/* Top bar */}
      <div style={{ height: 2.5, backgroundColor: "#f0f0ee", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "33%", backgroundColor: "#10b981" }} />
      </div>

      <div style={{ padding: "13px 20px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#b0b8c1", textTransform: "uppercase" }}>1 of 3</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="l-live-dot" />
          <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 800, color: "#0d0d0d", letterSpacing: "0.04em" }}>TSLA</span>
        </div>
      </div>

      <div style={{ padding: "22px 20px 20px" }}>
        <h3 style={{ fontFamily: sans, fontSize: 17, fontWeight: 700, color: "#0d0d0d", margin: "0 0 10px", lineHeight: 1.35, letterSpacing: "-0.012em" }}>
          Tesla CEO posts a cryptic tweet at midnight. Volume spikes 4×. What happens at open?
        </h3>
        <p style={{ fontFamily: sans, fontSize: 13, color: "#6b7280", margin: "0 0 22px", lineHeight: 1.6 }}>
          No guidance released. Retail forums are reacting fast. Institutions are quiet.
        </p>

        {/* Price display */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c4c9d4", marginBottom: 4 }}>Current price</div>
          <span style={{ fontFamily: mono, fontSize: 40, fontWeight: 800, color: "#0d0d0d", letterSpacing: "-0.035em", lineHeight: 1 }}>$244.50</span>
        </div>

        {/* Button grid — pre-selection state */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 0 }}>
          {[
            { sym: "↑", label: "UP",   accent: "#10b981" },
            { sym: "→", label: "FLAT", accent: "#f59e0b" },
            { sym: "↓", label: "DOWN", accent: "#ef4444" },
          ].map(o => (
            <div key={o.label} className="l-mock-btn">
              <span style={{ fontSize: 22, lineHeight: 1, display: "block", marginBottom: 5 }}>{o.sym}</span>
              <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em" }}>{o.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PERSONALIZATION / PATH ───────────────────────────────────────────────────
function PersonalizationSection() {
  const { ref, vis } = useReveal();

  const groups = [
    {
      title: "Foundation",
      items: [
        { label: "Why stocks move", done: true },
        { label: "Earnings basics", done: true },
        { label: "News reactions",  done: true },
      ],
    },
    {
      title: "Patterns",
      items: [
        { label: "Price gaps",      done: true  },
        { label: "Support levels",  done: false, active: true },
        { label: "Trend shifts",    done: false },
      ],
    },
    {
      title: "Context",
      items: [
        { label: "Market psychology", done: false },
        { label: "Volatility reads",  done: false },
        { label: "Macro reactions",   done: false },
      ],
    },
  ];

  return (
    <section className="l-section l-section-alt" ref={ref}>
      <div className="l-section-inner">
        {/* Text */}
        <div className={`l-reveal ${vis ? "l-reveal-in" : ""}`} style={{ flex: "0 0 360px" }}>
          <div className="l-label">Your path</div>
          <h2 className="l-h2">Built around<br />how you<br />progress.</h2>
          <p className="l-body">
            Stoked identifies where you are and surfaces what comes next — not a fixed course, but a path that adapts as your understanding deepens.
          </p>
          <p className="l-body-muted">Each concept earned unlocks the layer above it.</p>
        </div>

        {/* Path visual */}
        <div className={`l-reveal ${vis ? "l-reveal-in" : ""}`} style={{ flex: 1, transitionDelay: "0.1s" }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {groups.map((g, gi) => (
              <div
                key={g.title}
                style={{
                  flex: "1 1 140px",
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.07)",
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ padding: "11px 14px 10px", borderBottom: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>{g.title}</span>
                  {gi === 0 && <span style={{ fontSize: 9, color: "#10b981", fontFamily: mono }}>✓ done</span>}
                  {gi === 1 && <span style={{ fontSize: 9, color: "#10b981", fontFamily: mono }}>in progress</span>}
                  {gi === 2 && <span style={{ fontSize: 9, color: "#d1d5db", fontFamily: mono }}>locked</span>}
                </div>
                <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 9 }}>
                  {g.items.map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                        backgroundColor: item.done ? "#10b981" : (item as { done: boolean; active?: boolean }).active ? "#ffffff" : "#f0f0ee",
                        border: item.done ? "none" : (item as { done: boolean; active?: boolean }).active ? "2px solid #10b981" : "1.5px solid rgba(0,0,0,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: (item as { done: boolean; active?: boolean }).active ? "0 0 0 3px rgba(16,185,129,0.15)" : "none",
                      }}>
                        {item.done && <span style={{ fontSize: 8, color: "#fff", fontWeight: 700 }}>✓</span>}
                      </div>
                      <span style={{
                        fontFamily: sans,
                        fontSize: 12,
                        fontWeight: (item as { done: boolean; active?: boolean }).active ? 700 : 500,
                        color: item.done ? "#374151" : (item as { done: boolean; active?: boolean }).active ? "#0d0d0d" : "#c4c9d4",
                        letterSpacing: "-0.005em",
                      }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* XP bar */}
          <div style={{ marginTop: 20, backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, color: "#374151" }}>Patterns module</span>
                <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: "#10b981" }}>4 / 9</span>
              </div>
              <div style={{ height: 4, backgroundColor: "#f0f0ee", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: "44%", height: "100%", backgroundColor: "#10b981", borderRadius: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ACTIVE LEARNING ──────────────────────────────────────────────────────────
function ActiveLearningSection() {
  const { ref, vis } = useReveal();

  const contrasts = [
    { passive: "Watch a 40-min YouTube video on earnings",       active: "Make a call on a real earnings event"     },
    { passive: "Read about candlestick patterns in theory",      active: "See a pattern. Decide. See what happened"  },
    { passive: "Follow a stock tip without understanding why",   active: "Learn the why before the what"            },
  ];

  return (
    <section className="l-section" ref={ref}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px" }}>
        <div className={`l-reveal ${vis ? "l-reveal-in" : ""}`} style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="l-label" style={{ justifyContent: "center" }}>Why it works</div>
          <h2 className="l-h2" style={{ textAlign: "center" }}>
            Active beats<br />passive. Always.
          </h2>
          <p className="l-body" style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
            Passive content gives you facts. Stoked gives you consequence. Consequence is what builds real understanding.
          </p>
        </div>

        {/* Contrast table */}
        <div className={`l-reveal ${vis ? "l-reveal-in" : ""}`} style={{ transitionDelay: "0.1s" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 16, overflow: "hidden", backgroundColor: "#ffffff", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            {/* Header */}
            <div style={{ padding: "12px 24px", backgroundColor: "#f9f9f8", borderBottom: "1px solid rgba(0,0,0,0.06)", borderRight: "1px solid rgba(0,0,0,0.06)" }}>
              <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>Passive learning</span>
            </div>
            <div style={{ padding: "12px 24px", backgroundColor: "#f0fdf4", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span className="l-live-dot" />
                <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: "#065f46", letterSpacing: "0.08em", textTransform: "uppercase" }}>Stoked</span>
              </div>
            </div>

            {/* Rows */}
            {contrasts.map((row, i) => (
              <Fragment key={i}>
                <div style={{ padding: "18px 24px", borderRight: "1px solid rgba(0,0,0,0.06)", borderBottom: i < contrasts.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "#d1d5db", flexShrink: 0 }}>×</span>
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#9ca3af", lineHeight: 1.5 }}>{row.passive}</span>
                </div>
                <div style={{ padding: "18px 24px", borderBottom: i < contrasts.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "#10b981", flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: sans, fontSize: 13, color: "#0d0d0d", fontWeight: 600, lineHeight: 1.5 }}>{row.active}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── BELIEF ───────────────────────────────────────────────────────────────────
function BeliefSection() {
  const { ref, vis } = useReveal();

  return (
    <section ref={ref} className="l-belief">
      <div className="l-belief-glow" />
      <div
        className={`l-reveal ${vis ? "l-reveal-in" : ""}`}
        style={{ maxWidth: 820, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}
      >
        <h2 className="l-belief-h2">
          Anyone can<br />learn to read<br />the market.
        </h2>
        <p className="l-belief-sub">
          It is not a talent. It is pattern recognition built through decisions — one call at a time.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/experience" className="l-cta-white">
            Get started free →
          </Link>
          <a href="#method" className="l-cta-ghost-dark">
            See the method
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ isAuthed }: { isAuthed: boolean }) {
  const { ref, vis } = useReveal();

  return (
    <section ref={ref} className="l-final-cta">
      <div className={`l-reveal ${vis ? "l-reveal-in" : ""}`} style={{ textAlign: "center" }}>
        <h2 className="l-final-h2">
          Start learning<br />stocks by doing.
        </h2>
        <p className="l-final-sub">
          Three real market calls. No background needed. See where you stand.
        </p>
        <Link href="/experience" className="l-cta-green" style={{ fontSize: 16, padding: "17px 48px" }}>
          {isAuthed ? "Continue learning →" : "Get started free →"}
        </Link>
        <p style={{ marginTop: 16, fontFamily: sans, fontSize: 12, color: "#c4c9d4" }}>
          No account needed to start.
        </p>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="l-footer">
      <div className="l-footer-inner">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 48, marginBottom: 56 }}>
          {/* Brand */}
          <div style={{ flex: "0 0 200px" }}>
            <div style={{ fontFamily: sans, fontSize: 20, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.04em", marginBottom: 12 }}>Stoked</div>
            <p style={{ fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.32)", lineHeight: 1.7, margin: 0, maxWidth: 180 }}>
              Interactive stock learning for the next generation.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 64, flexWrap: "wrap" }}>
            {[
              { h: "Product", links: [{ l: "How it works", href: "#method" }, { l: "Start learning", href: "/experience" }, { l: "Lessons", href: "/course" }] },
              { h: "Company", links: [{ l: "About", href: "/" }, { l: "Blog", href: "/" }, { l: "Careers", href: "/" }] },
              { h: "Legal",   links: [{ l: "Privacy", href: "/privacy" }, { l: "Terms", href: "/" }] },
            ].map(col => (
              <div key={col.h}>
                <div style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 16 }}>{col.h}</div>
                {col.links.map(lk => (
                  <div key={lk.l} style={{ marginBottom: 10 }}>
                    <Link href={lk.href} style={{ textDecoration: "none", fontFamily: sans, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{lk.l}</Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.18)" }}>© 2026 Stoked.</span>
          <span style={{ fontFamily: mono, fontSize: 11, color: "rgba(255,255,255,0.14)", letterSpacing: "0.04em" }}>DECISIONS → CLARITY</span>
        </div>
      </div>
    </footer>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  /* ── Live dot ── */
  @keyframes ld-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.65);opacity:0.5} }
  .l-live-dot {
    display:inline-block;width:6px;height:6px;border-radius:50%;
    background:#10b981;flex-shrink:0;
    animation:ld-pulse 1.8s ease-in-out infinite;
  }

  /* ── Reveal ── */
  .l-reveal { opacity:0; transform:translateY(18px); transition:opacity 0.6s cubic-bezier(0.25,1,0.5,1), transform 0.6s cubic-bezier(0.25,1,0.5,1); }
  .l-reveal-in { opacity:1; transform:translateY(0); }

  /* ── Hero animations ── */
  @keyframes hd-badge { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .hero-kicker-anim { animation:hd-badge 0.5s cubic-bezier(0.25,1,0.5,1) 0.1s both; }

  @keyframes hd-h1 { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  .hero-h1-anim { animation:hd-h1 0.65s cubic-bezier(0.25,1,0.5,1) 0.18s both; }

  @keyframes hd-fade { from{opacity:0} to{opacity:1} }
  .hero-sub-anim  { animation:hd-fade 0.5s ease-out 0.4s  both; }
  .hero-ctas-anim { animation:hd-fade 0.5s ease-out 0.55s both; }
  .hero-note-anim { animation:hd-fade 0.5s ease-out 0.7s  both; }

  /* ── Navbar ── */
  .l-nav {
    position:sticky;top:0;z-index:100;
    background:rgba(250,249,246,0.94);
    backdrop-filter:blur(12px);
    border-bottom:1px solid rgba(0,0,0,0.055);
    font-family:${sans};
  }
  .l-nav-inner {
    max-width:1160px;margin:0 auto;
    padding:0 48px;height:60px;
    display:flex;align-items:center;justify-content:space-between;
  }

  /* ── Buttons ── */
  .l-btn-ghost {
    text-decoration:none;font-family:${sans};font-size:13px;font-weight:600;
    color:#374151;padding:8px 18px;border-radius:9999px;
    border:1.5px solid rgba(0,0,0,0.11);background:transparent;
    transition:border-color 0.15s,color 0.15s;
  }
  .l-btn-ghost:hover { border-color:rgba(0,0,0,0.22);color:#111111; }

  .l-btn-primary {
    text-decoration:none;font-family:${sans};font-size:13px;font-weight:700;
    color:#fff;background:#10b981;padding:9px 22px;border-radius:9999px;
    letter-spacing:-0.01em;transition:box-shadow 0.18s, filter 0.15s;
  }
  .l-btn-primary:hover { filter:brightness(1.06); box-shadow:0 0 0 4px rgba(16,185,129,0.18); }

  .l-cta-green {
    text-decoration:none;font-family:${sans};font-size:15px;font-weight:700;
    color:#fff;background:#10b981;padding:15px 36px;border-radius:9999px;
    letter-spacing:-0.01em;display:inline-flex;align-items:center;
    box-shadow:0 4px 20px rgba(16,185,129,0.32);
    transition:box-shadow 0.2s, filter 0.15s;
  }
  .l-cta-green:hover { filter:brightness(1.07); box-shadow:0 6px 28px rgba(16,185,129,0.44); }

  .l-cta-ghost {
    text-decoration:none;font-family:${sans};font-size:14px;font-weight:600;
    color:#374151;padding:15px 24px;border-radius:9999px;
    border:1.5px solid rgba(0,0,0,0.11);background:#fff;
    display:inline-flex;align-items:center;
    transition:border-color 0.15s;
  }
  .l-cta-ghost:hover { border-color:rgba(0,0,0,0.22); }

  .l-cta-white {
    text-decoration:none;font-family:${sans};font-size:15px;font-weight:700;
    color:#111111;background:#ffffff;padding:15px 36px;border-radius:9999px;
    display:inline-flex;align-items:center;
    transition:box-shadow 0.18s;
  }
  .l-cta-white:hover { box-shadow:0 0 0 5px rgba(255,255,255,0.15); }

  .l-cta-ghost-dark {
    text-decoration:none;font-family:${sans};font-size:14px;font-weight:600;
    color:rgba(255,255,255,0.55);padding:15px 24px;border-radius:9999px;
    border:1.5px solid rgba(255,255,255,0.14);
    display:inline-flex;align-items:center;
    transition:border-color 0.15s,color 0.15s;
  }
  .l-cta-ghost-dark:hover { border-color:rgba(255,255,255,0.28);color:rgba(255,255,255,0.8); }

  /* ── Hero ── */
  .l-hero {
    min-height:93vh;
    background:#faf9f6;
    display:grid;
    grid-template-columns:64px 1fr 380px;
    align-items:center;
    position:relative;
    overflow:hidden;
    border-bottom:1px solid rgba(0,0,0,0.055);
  }
  @media(max-width:1000px) {
    .l-hero { grid-template-columns:1fr; padding:80px 32px 64px; }
    .l-hero-ticker-col,.l-hero-card-col { display:none; }
    .l-hero-center { padding:0; }
  }

  .l-hero-noise {
    position:absolute;inset:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.018'/%3E%3C/svg%3E");
    background-size:180px;opacity:0.6;pointer-events:none;
  }
  .l-hero-rule-h {
    position:absolute;top:50%;left:0;right:0;height:1px;
    background:linear-gradient(to right, transparent 0%, rgba(0,0,0,0.055) 15%, rgba(0,0,0,0.055) 85%, transparent 100%);
    pointer-events:none;
  }

  /* Left ticker column */
  .l-hero-ticker-col {
    height:100%;display:flex;flex-direction:column;
    justify-content:center;gap:20px;padding:0 0 0 20px;
    border-right:1px solid rgba(0,0,0,0.055);
  }
  @keyframes ticker-fade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .l-hero-ticker-item { animation:ticker-fade 0.4s ease-out both; }

  /* Center column */
  .l-hero-center { padding:0 64px; }

  .l-hero-kicker {
    display:inline-flex;align-items:center;gap:8px;
    font-family:${sans};font-size:12px;font-weight:600;
    color:#374151;letter-spacing:-0.005em;
    margin-bottom:32px;
  }

  .l-hero-h1 {
    font-family:${serif};
    font-size:clamp(70px,9.5vw,132px);
    font-weight:600;
    color:#0d0d0d;
    line-height:0.91;
    letter-spacing:-0.025em;
    margin:0 0 28px;
  }
  .l-hero-h1 em { font-style:italic;color:#10b981; }

  .l-hero-sub {
    font-family:${sans};font-size:17px;color:#6b7280;
    line-height:1.65;margin:0 0 40px;max-width:360px;
  }
  .l-hero-ctas { display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px; }
  .l-hero-note { font-family:${sans};font-size:12px;color:#c4c9d4;margin:0; }

  /* Right card column */
  .l-hero-card-col {
    height:100%;display:flex;align-items:center;justify-content:center;
    padding:0 32px;border-left:1px solid rgba(0,0,0,0.055);
  }

  /* Preview card */
  .l-preview-card {
    background:#fff;border-radius:16px;
    border:1px solid rgba(0,0,0,0.07);
    box-shadow:0 8px 48px rgba(0,0,0,0.08),0 2px 12px rgba(0,0,0,0.04);
    overflow:hidden;width:100%;max-width:320px;
    font-family:${sans};
  }

  /* ── Sections ── */
  .l-section { padding:112px 0; background:#faf9f6; }
  .l-section-alt { background:#f4f4f2; }

  .l-section-inner {
    max-width:1100px;margin:0 auto;padding:0 48px;
    display:flex;gap:80px;align-items:center;flex-wrap:wrap;
  }

  .l-label {
    display:flex;align-items:center;gap:8px;
    font-family:${mono};font-size:10px;font-weight:700;
    color:#10b981;letter-spacing:0.1em;text-transform:uppercase;
    margin-bottom:20px;
  }
  .l-label::before { content:''; display:block; width:24px; height:1.5px; background:#10b981; }

  .l-h2 {
    font-family:${serif};
    font-size:clamp(42px,5.5vw,68px);
    font-weight:600;color:#0d0d0d;
    line-height:0.95;letter-spacing:-0.022em;
    margin:0 0 24px;
  }

  .l-body {
    font-family:${sans};font-size:16px;color:#6b7280;
    line-height:1.7;margin:0 0 14px;
  }
  .l-body-muted {
    font-family:${sans};font-size:14px;color:#9ca3af;
    line-height:1.65;margin:0;
  }

  /* Method grid cells */
  .l-step-cell {
    background:#fff;padding:28px 28px 30px;
    transition:background 0.15s;
  }
  .l-step-cell:hover { background:#fdfcfa; }
  .l-step-n { display:block;font-family:${mono};font-size:10px;font-weight:700;color:#c4c9d4;letter-spacing:0.1em;margin-bottom:14px; }
  .l-step-title { font-family:${sans};font-size:15px;font-weight:700;color:#0d0d0d;letter-spacing:-0.01em;margin-bottom:8px; }
  .l-step-body { font-family:${sans};font-size:13px;color:#6b7280;line-height:1.6; }

  /* Mock shell */
  .l-mock-shell {
    background:#fff;border-radius:18px;
    border:1px solid rgba(0,0,0,0.07);
    box-shadow:0 12px 60px rgba(0,0,0,0.09),0 3px 16px rgba(0,0,0,0.05);
    overflow:hidden;
  }
  .l-mock-btn {
    padding:14px 6px;border-radius:10px;
    border:1.5px solid rgba(0,0,0,0.07);
    background:#f7f7f6;text-align:center;
    font-family:${mono};font-size:11px;font-weight:700;color:#6b7280;
    cursor:default;transition:border-color 0.15s,background 0.15s;
  }
  .l-mock-btn:hover { border-color:#10b981;background:#f0fdf4;color:#065f46; }

  /* ── Belief ── */
  .l-belief {
    padding:144px 48px;background:#0d0d0d;
    position:relative;overflow:hidden;text-align:center;
  }
  .l-belief-glow {
    position:absolute;top:50%;left:50%;
    transform:translate(-50%,-50%);
    width:800px;height:800px;border-radius:50%;
    background:radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 65%);
    pointer-events:none;
  }
  .l-belief-h2 {
    font-family:${serif};
    font-size:clamp(62px,9vw,118px);
    font-weight:600;color:#fff;
    line-height:0.93;letter-spacing:-0.025em;
    margin:0 0 28px;
  }
  .l-belief-sub {
    font-family:${sans};font-size:18px;
    color:rgba(255,255,255,0.42);line-height:1.7;
    margin:0 auto 48px;max-width:380px;
  }

  /* ── Final CTA ── */
  .l-final-cta {
    padding:140px 48px;background:#faf9f6;
    border-top:1px solid rgba(0,0,0,0.055);
  }
  .l-final-h2 {
    font-family:${serif};
    font-size:clamp(52px,7vw,88px);
    font-weight:600;color:#0d0d0d;
    line-height:0.94;letter-spacing:-0.025em;
    margin:0 0 20px;
  }
  .l-final-sub {
    font-family:${sans};font-size:17px;color:#6b7280;
    line-height:1.6;margin:0 auto 40px;max-width:360px;
  }

  /* ── Footer ── */
  .l-footer { background:#0d0d0d;padding:80px 0 40px; }
  .l-footer-inner { max-width:1100px;margin:0 auto;padding:0 48px; }

  /* ── Responsive ── */
  @media(max-width:860px) {
    .l-section-inner { flex-direction:column;gap:48px;padding:0 28px; }
    .l-section { padding:80px 0; }
    .l-nav-inner { padding:0 24px; }
    .l-final-cta,.l-belief { padding:96px 28px; }
  }
  @media(max-width:640px) {
    .l-footer-inner { padding:0 28px; }
  }
`;

// ─── ROOT ─────────────────────────────────────────────────────────────────────
// Dissolve timing — must match T.dissolveDuration in Hero.tsx
const DISSOLVE_MS = 360;
// Route transition happens after the hero text has dissolved.
const ONBOARD_ROUTE_DELAY_MS = DISSOLVE_MS + 80;

export function LandingScreen() {
  const { user } = useAuth();
  const isAuthed = !!user;
  const router = useRouter();
  const onboardingRouteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [overlayActive, setOverlayActive] = useState(false);

  const handleCTAClick = useCallback(() => {
    setOverlayActive(true);
    if (onboardingRouteTimeoutRef.current !== null) {
      clearTimeout(onboardingRouteTimeoutRef.current);
    }
    onboardingRouteTimeoutRef.current = window.setTimeout(() => {
      router.push("/onboarding");
    }, ONBOARD_ROUTE_DELAY_MS);
  }, [router]);

  useEffect(() => {
    return () => {
      if (onboardingRouteTimeoutRef.current !== null) {
        clearTimeout(onboardingRouteTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div style={{ backgroundColor: "#faf9f6" }}>
      <style>{CSS}</style>

      <Hero onCTAClick={handleCTAClick} overlayActive={overlayActive} />

      <MethodSection />
      <ChallengeDemoSection />
      <PersonalizationSection />
      <ActiveLearningSection />
      <BeliefSection />
      <FinalCTA isAuthed={isAuthed} />
      <Footer />
    </div>
  );
}
