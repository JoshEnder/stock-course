"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { buildQuizData, saveQuizData } from "@/app/lib/onboarding-quiz";
import { queueRoadmapLoginGate } from "@/app/lib/post-onboarding-login-gate";

// ─── Design tokens ────────────────────────────────────────────────────────────
const F_SERIF = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";
const F_SANS  = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const GREEN   = "#22FF00";
const BG      = "#0F172A";

// ─── Questions ────────────────────────────────────────────────────────────────
interface Opt { value: string; label: string }
interface Q   { id: "experienceLevel" | "goal" | "learningStyle"; text: string; options: Opt[] }
type Answers  = Partial<Record<Q["id"], string>>;

const QUESTIONS: Q[] = [
  {
    id: "experienceLevel",
    text: "What's your experience level with stocks?",
    options: [
      { value: "new",      label: "Complete beginner"  },
      { value: "basics",   label: "Some experience"    },
      { value: "explored", label: "Pretty comfortable" },
      { value: "deeper",   label: "Very experienced"   },
    ],
  },
  {
    id: "goal",
    text: "Why are you learning about stocks?",
    options: [
      { value: "wealth",      label: "Build wealth over time"      },
      { value: "understand",  label: "Understand investing better" },
      { value: "opportunity", label: "Find good opportunities"     },
      { value: "exploring",   label: "Just curious"                },
    ],
  },
  {
    id: "learningStyle",
    text: "How do you learn best?",
    options: [
      { value: "structure", label: "Step by step"               },
      { value: "doing",     label: "Learning by doing"          },
      { value: "concepts",  label: "Understanding theory first" },
      { value: "mix",       label: "A mix of everything"        },
    ],
  },
];

// ─── Loading config ───────────────────────────────────────────────────────────

// Traced from upscale.png — smooth diagonal that follows the actual mountain
// ridge line. viewBox 0 0 120 160. Uses Q (quadratic bezier) for organic
// curvature. Path is NOT a zigzag — it's a consistent upward-right traverse
// with subtle natural drift, exactly like the real neon path in the image.
//
// Node anchor points (proportional to image positions):
// 1:(10,148)  2:(22,133)  3:(35,119)  4:(47,105)  5:(56,93)
// 6:(65,80)   7:(73,67)   8:(81,54)   9:(89,41)   10:(96,28)
//
// Control points are offset slightly inward/outward to create organic feel.
const MOUNTAIN_PATH =
  "M 10,148" +
  " Q 14,141 22,133" +    // slight outward bow leaving the ledge
  " Q 27,127 35,119" +    // settles into ridge
  " Q 40,113 47,105" +    // tightens slightly (steeper rock face)
  " Q 51,99  56,93"  +    // mid-path, mostly straight
  " Q 60,87  65,80"  +    // gentle arc over exposed ridge
  " Q 69,74  73,67"  +    // stays tight to the line
  " Q 77,61  81,54"  +    // slightly inward following rock contour
  " Q 85,48  89,41"  +    // steepens near summit
  " Q 92,35  96,28";      // final approach

// Q1 → fraction of the full path that draws (0→1)
// Approximate cumulative arc-length fractions for each node:
// 1=0  2=.11  3=.22  4=.33  5=.44  6=.55  7=.65  8=.75  9=.87  10=1.0
const EXP_TO_FRACTION: Record<string, number> = {
  new: 0.22, basics: 0.44, explored: 0.75, deeper: 1.0,
};

// Q3 → draw duration ms (default 1200 = fast, energetic)
const STYLE_TO_DRAW_MS: Record<string, number> = {
  structure: 1600, doing: 900, concepts: 1300, mix: 1200,
};

// Fixed message timeline (ms from screen mount)
const MSG_SCHEDULE = [
  { at: 300,  text: "Building your path..."           },
  { at: 1200, text: "Crafting lessons for you..."     },
  { at: 2400, text: "Personalizing your experience..." },
  { at: 3600, text: ""                                 }, // silent beat
] as const;

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
@keyframes obMesh {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
/* ── Line glow states ── */
@keyframes glowIdle      { 0%,100% { filter: drop-shadow(0 0 5px rgba(34,255,0,0.55)); } 50% { filter: drop-shadow(0 0 13px rgba(34,255,0,0.9)); } }
@keyframes glowCelebrate { 0%,100% { filter: drop-shadow(0 0 14px rgba(34,255,0,1));   } 50% { filter: drop-shadow(0 0 28px rgba(34,255,0,1));   } }
@keyframes obBarFill     { from { width: 0%; } to { width: 100%; } }
.glow-drawing   { filter: drop-shadow(0 0 12px rgba(34,255,0,0.9)) drop-shadow(0 0 4px #fff); }
.glow-idle      { animation: glowIdle      2s ease-in-out infinite; }
.glow-celebrate { animation: glowCelebrate 0.65s ease-in-out infinite; }
.ob-root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0F172A 0%, #0a1929 35%, #0d1f2d 65%, #0F172A 100%);
  background-size: 300% 300%;
  animation: obMesh 9s ease infinite;
  position: relative;
}
.ob-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");
  opacity: 0.018;
}
`;

function useInjectCSS() {
  useEffect(() => {
    const id = "ob-css-v3";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = (step / total) * 100;
  return (
    <div style={{ width: "100%", flexShrink: 0, position: "relative", zIndex: 10 }}>
      {/* Step label */}
      <div style={{
        display: "flex", justifyContent: "flex-end",
        padding: "18px 24px 10px",
        fontFamily: F_SANS, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.16em", textTransform: "uppercase" as const,
        color: GREEN,
      }}>
        STEP {String(step).padStart(2,"0")} / {String(total).padStart(2,"0")}
      </div>
      {/* Track */}
      <div style={{ width: "100%", height: 1.5, background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%", background: GREEN, position: "relative" }}
        >
          <div style={{
            position: "absolute", right: -3, top: "50%", transform: "translateY(-50%)",
            width: 6, height: 6, borderRadius: "50%", background: GREEN,
            boxShadow: `0 0 8px rgba(34,255,0,0.9), 0 0 16px rgba(34,255,0,0.5)`,
          }} />
        </motion.div>
      </div>
    </div>
  );
}

// ─── Option button ─────────────────────────────────────────────────────────────
function OptionBtn({ opt, index, selected, dimmed, locked, onSelect }: {
  opt: Opt; index: number; selected: boolean;
  dimmed: boolean; locked: boolean;
  onSelect: (v: string) => void;
}) {
  const [hov, setHov] = useState(false);
  const hovering = hov && !locked && !selected;

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{
        opacity: dimmed ? 0.22 : 1,
        y: 0,
        scale: selected ? 1.04 : 1,
      }}
      whileHover={!locked && !selected ? {
        scale: 1.02,
        y: -3,
        transition: { type: "spring", stiffness: 300, damping: 30 },
      } : {}}
      whileTap={!locked ? { scale: 0.96 } : {}}
      transition={{
        opacity: { duration: 0.2 },
        y:       { duration: 0.34, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] },
        scale:   { type: "spring", stiffness: 300, damping: 30 },
      }}
      onClick={() => !locked && onSelect(opt.value)}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      disabled={locked}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", height: 56, padding: "0 20px",
        borderRadius: 12,
        border: selected
          ? `1.5px solid ${GREEN}`
          : hovering
          ? "1.5px solid rgba(34,255,0,0.5)"
          : "1px solid rgba(255,255,255,0.12)",
        background: selected
          ? "rgba(34,255,0,0.10)"
          : hovering
          ? "rgba(34,255,0,0.07)"
          : "rgba(255,255,255,0.05)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxShadow: selected
          ? `0 0 22px rgba(34,255,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)`
          : hovering
          ? "0 0 20px rgba(34,255,0,0.18)"
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
        fontFamily: F_SANS, fontSize: 16, fontWeight: 500,
        color: selected ? "#fff" : "rgba(255,255,255,0.88)",
        cursor: locked ? "default" : "pointer",
        outline: "none",
        pointerEvents: locked ? "none" : "auto",
        transition: "background 0.14s, border-color 0.14s, box-shadow 0.14s",
      }}
    >
      <span>{opt.label}</span>
      <AnimatePresence>
        {selected && (
          <motion.span
            initial={{ scale: 0, rotate: -60, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Question screen ──────────────────────────────────────────────────────────
function QuestionScreen({ q, qIdx, selected, onSelect }: {
  q: Q; qIdx: number; selected: string | null;
  onSelect: (v: string) => void;
}) {
  return (
    <div style={{ width: "100%", maxWidth: 500 }}>
      <motion.h2
        initial={{ opacity: 0, scale: 0.97, filter: "blur(5px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: F_SERIF,
          fontSize: "clamp(26px, 4vw, 44px)",
          fontWeight: 600,
          color: "#ffffff",
          letterSpacing: "-0.025em",
          lineHeight: 1.12,
          margin: "0 0 32px",
        }}
      >
        {q.text}
      </motion.h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => (
          <OptionBtn
            key={opt.value} opt={opt} index={i}
            selected={selected === opt.value}
            dimmed={selected !== null && selected !== opt.value}
            locked={selected !== null}
            onSelect={onSelect}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        style={{
          fontFamily: F_SANS, fontSize: 12,
          fontStyle: "italic", color: "#94A3B8",
          marginTop: 20, textAlign: "center",
        }}
      >
        {qIdx === 0 && "Your path adapts to where you're starting."}
        {qIdx === 1 && "We tailor lessons around what matters to you."}
        {qIdx === 2 && "Your course is built around how you learn."}
      </motion.p>
    </div>
  );
}

// ─── Message pool ─────────────────────────────────────────────────────────────
const MSG_POOL = [
  "Analyzing your profile...",
  "Processing your answers...",
  "Building your foundation...",
  "Mapping your climb...",
  "Creating your path...",
  "Preparing your lessons...",
  "Tailoring your experience...",
  "Setting up your journey...",
  "Customizing your roadmap...",
  "Fine-tuning your course...",
  "Getting you ready...",
  "Learning your preferences...",
  "Mapping your journey...",
  "Unlocking your roadmap...",
  "Finalizing your path...",
  "One more moment...",
];

// ─── Reveal config ───────────────────────────────────────────────────────────
// Node positions in SVG viewBox 0 0 100 100 (preserveAspectRatio="none").
// Calibrated to land on the visible path in upscale.png at typical 16:9.
const REVEAL_NODES = [
  { x:  9, y: 72 }, { x: 18, y: 65 }, { x: 27, y: 58 },
  { x: 36, y: 51 }, { x: 44, y: 45 }, { x: 52, y: 39 },
  { x: 59, y: 33 }, { x: 66, y: 27 }, { x: 73, y: 21 },
  { x: 79, y: 16 },
] as const;

const EXP_TO_REVEAL_NODES: Record<string, number> = {
  new: 4, basics: 6, explored: 8, deeper: 10,
};

function pickMessages(): [string, string, string] {
  const shuffled = [...MSG_POOL].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1], shuffled[2]];
}

// ─── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [msgs] = useState<[string, string, string]>(pickMessages);

  const [msgKey,      setMsgKey]      = useState(0);
  const [msgText,     setMsgText]     = useState("");
  const [dotsVisible, setDotsVisible] = useState(true);
  const [showButton,  setShowButton]  = useState(false);
  const [btnLoading,  setBtnLoading]  = useState(false);

  useEffect(() => {
    const T: ReturnType<typeof setTimeout>[] = [];
    //  0.5s  message 1 appears
    T.push(setTimeout(() => { setMsgText(msgs[0]); setMsgKey(k => k + 1); },  500));
    //  2.0s  message 1 fades (blank = natural pause)
    T.push(setTimeout(() => { setMsgText("");      setMsgKey(k => k + 1); }, 2000));
    //  2.2s  message 2 appears
    T.push(setTimeout(() => { setMsgText(msgs[1]); setMsgKey(k => k + 1); }, 2200));
    //  3.8s  message 2 fades
    T.push(setTimeout(() => { setMsgText("");      setMsgKey(k => k + 1); }, 3800));
    //  4.0s  message 3 appears
    T.push(setTimeout(() => { setMsgText(msgs[2]); setMsgKey(k => k + 1); }, 4000));
    //  5.6s  message 3 fades
    T.push(setTimeout(() => { setMsgText("");      setMsgKey(k => k + 1); }, 5600));
    //  5.8s  dots fade out
    T.push(setTimeout(() => setDotsVisible(false),                            5800));
    //  6.0s  button fades in (200ms after dots gone)
    T.push(setTimeout(() => setShowButton(true),                              6000));
    return () => T.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleClick() {
    setBtnLoading(true);
    onDone();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32 }}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", background: BG,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        style={{
          width: "100%", maxWidth: 480,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 24, padding: "56px 44px 52px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 36,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* ── Fixed-height slot holds dots OR button — no layout shift ── */}
        <div style={{ width: "100%", minHeight: 56, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>

          {/* Pulsing dots — fade out before button arrives */}
          <AnimatePresence>
            {dotsVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex", gap: 14, alignItems: "center" }}
              >
                {[0, 1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.15, 0.85] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.28 }}
                    style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: GREEN,
                      boxShadow: `0 0 10px rgba(34,255,0,0.7)`,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button — arrives after dots are gone */}
          <AnimatePresence>
            {showButton && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: "100%" }}
              >
                <motion.button
                  whileHover={!btnLoading ? { scale: 1.03, y: -2 } : {}}
                  whileTap={!btnLoading ? { scale: 0.97 } : {}}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  onClick={handleClick}
                  disabled={btnLoading}
                  style={{
                    width: "100%", height: 56, borderRadius: 12, border: "none",
                    background: GREEN, color: "#050f00",
                    fontFamily: F_SANS, fontSize: 16, fontWeight: 700,
                    letterSpacing: "0.01em",
                    cursor: btnLoading ? "default" : "pointer",
                    outline: "none",
                    boxShadow: `0 0 24px rgba(34,255,0,0.5), 0 0 56px rgba(34,255,0,0.16), 0 4px 16px rgba(0,0,0,0.3)`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    opacity: btnLoading ? 0.75 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {btnLoading ? (
                    <>
                      {/* Inline spinner */}
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        style={{ display: "inline-block", width: 16, height: 16, borderRadius: "50%",
                          border: "2px solid rgba(5,15,0,0.3)", borderTopColor: "#050f00" }}
                      />
                      Loading...
                    </>
                  ) : (
                    "See Your Climb →"
                  )}
                </motion.button>
                <p style={{
                  fontFamily: F_SANS, fontSize: 12, color: "#94A3B8",
                  textAlign: "center", margin: "10px 0 0", fontStyle: "italic",
                }}>
                  Your personalized path is ready.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Message — fixed-height, no layout shift ───────────────── */}
        <div style={{ height: 24, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <AnimatePresence mode="wait">
            {msgText && (
              <motion.p
                key={msgKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.82 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  fontFamily: F_SANS, fontSize: 15, fontWeight: 400,
                  color: "#ffffff", letterSpacing: "0.4px",
                  margin: 0, textAlign: "center", whiteSpace: "nowrap",
                }}
              >
                {msgText}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Reveal screen — cinematic entrance before /course ───────────────────────
function RevealScreen({ experienceLevel, onDone }: {
  experienceLevel: string;
  onDone: () => void;
}) {
  const nodeCount = EXP_TO_REVEAL_NODES[experienceLevel] ?? 6;
  const [imgSharp,      setImgSharp]      = useState(false);
  const [visibleNodes,  setVisibleNodes]  = useState(0);
  const [drawLine,      setDrawLine]      = useState(false);
  const [showTagline,   setShowTagline]   = useState(false);

  const pathD = REVEAL_NODES.slice(0, nodeCount)
    .map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`)
    .join(" ");

  const ghostD = REVEAL_NODES
    .map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`)
    .join(" ");

  useEffect(() => {
    const T: ReturnType<typeof setTimeout>[] = [];

    T.push(setTimeout(() => setImgSharp(true), 80));

    // Nodes pop in from 600ms, 80ms apart
    for (let i = 0; i < nodeCount; i++) {
      T.push(setTimeout(() => setVisibleNodes(v => v + 1), 600 + i * 80));
    }

    const allNodesAt = 600 + nodeCount * 80;

    // Line draws 100ms after last node
    T.push(setTimeout(() => setDrawLine(true), allNodesAt + 100));

    // Tagline appears when line starts
    T.push(setTimeout(() => setShowTagline(true), allNodesAt + 200));

    // Navigate after line (1000ms) + hold (800ms)
    T.push(setTimeout(onDone, allNodesAt + 100 + 1000 + 800));

    return () => T.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "fixed", inset: 0, zIndex: 70, overflow: "hidden" }}
    >
      {/* Mountain image — blurs clear as it enters */}
      <Image
        src="/ref/upscale.png" alt="" fill priority
        style={{
          objectFit: "contain",
          objectPosition: "center",
          filter: imgSharp
            ? "brightness(0.68) blur(0px)"
            : "brightness(0.42) blur(22px)",
          transition: "filter 1.1s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        sizes="100vw"
      />

      {/* Atmospheric scrim */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(4,8,14,0.55) 0%, rgba(4,8,14,0.18) 50%, rgba(4,8,14,0.36) 100%)",
      }} />

      {/* SVG overlay — ghost path + animated nodes + drawing line */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
      >
        <defs>
          <filter id="rvGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="b1"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="2"   result="b2"/>
            <feMerge>
              <feMergeNode in="b2"/>
              <feMergeNode in="b1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Dim ghost — full path always present */}
        <path d={ghostD} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="0.35"
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* Neon line draws from node 1 to user's level */}
        {drawLine && (
          <motion.path
            d={pathD} fill="none" stroke={GREEN} strokeWidth="0.55"
            strokeLinecap="round" strokeLinejoin="round"
            filter="url(#rvGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
              opacity:    { duration: 0.18 },
            }}
          />
        )}

        {/* Nodes pop in one by one */}
        {REVEAL_NODES.slice(0, visibleNodes).map((node, i) => (
          <motion.circle
            key={i}
            cx={node.x} cy={node.y} r="1.1"
            fill={GREEN}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18, duration: 0.3 }}
            style={{
              filter: `drop-shadow(0 0 1.5px ${GREEN})`,
              transformOrigin: `${node.x}px ${node.y}px`,
            }}
          />
        ))}
      </svg>

      {/* Tagline — appears when line starts drawing */}
      <AnimatePresence>
        {showTagline && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              bottom: "10%", left: 0, right: 0,
              display: "flex", justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <p style={{
              fontFamily: F_SERIF,
              fontSize: "clamp(18px, 2.4vw, 26px)",
              fontWeight: 500,
              color: "rgba(255,255,255,0.88)",
              letterSpacing: "-0.02em",
              margin: 0,
              textShadow: "0 2px 20px rgba(0,0,0,0.7)",
            }}>
              Your climb starts here.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main container ────────────────────────────────────────────────────────────
interface OnboardingContainerProps {
  onFinish?: () => void;
}

export default function OnboardingContainer({ onFinish }: OnboardingContainerProps = {}) {
  const router = useRouter();
  useInjectCSS();

  const [qIdx,         setQIdx]         = useState(0);
  const [answers,      setAnswers]       = useState<Answers>({});
  const [pending,      setPending]       = useState<string | null>(null);
  const [loading,      setLoading]       = useState(false);
  const [revealing,    setRevealing]     = useState(false);
  const [savedAnswers, setSavedAnswers]  = useState<Answers>({});

  const currentQ    = QUESTIONS[qIdx];
  const selectedVal = answers[currentQ.id] ?? pending ?? null;

  const doFinish = useCallback((a: Answers) => {
    saveQuizData(buildQuizData({
      experienceLevel: a.experienceLevel,
      goal: a.goal,
      timeCommitment: undefined,
    }));
    queueRoadmapLoginGate();
    if (onFinish) onFinish();
    else router.push("/course");
  }, [onFinish, router]);

  const handleSelect = useCallback((value: string) => {
    setPending(value);
    const updated: Answers = { ...answers, [currentQ.id]: value };
    setAnswers(updated);
    const isLast = qIdx === QUESTIONS.length - 1;
    setTimeout(() => {
      setPending(null);
      if (isLast) {
        setSavedAnswers(updated);
        setLoading(true);
      } else {
        setQIdx(i => i + 1);
      }
    }, 320);
  }, [answers, currentQ.id, qIdx]);

  return (
    <div className="ob-root">
      <div className="ob-noise" aria-hidden />

      <AnimatePresence>
        {!loading && (
          <motion.div
            key="questions"
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}
          >
            <ProgressBar step={qIdx + 1} total={QUESTIONS.length} />

            <div style={{
              flex: 1, display: "flex", alignItems: "center",
              justifyContent: "center", padding: "32px 24px 64px",
              overflowY: "auto", position: "relative", zIndex: 1,
            }}>
              {/* Atmospheric glow */}
              <div aria-hidden style={{
                position: "fixed", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse at 50% 40%, rgba(34,255,0,0.03) 0%, transparent 65%)",
              }} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={`q-${qIdx}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    width: "100%", display: "flex",
                    justifyContent: "center", position: "relative", zIndex: 1,
                  }}
                >
                  <QuestionScreen
                    q={currentQ} qIdx={qIdx}
                    selected={selectedVal}
                    onSelect={handleSelect}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loading && (
          <LoadingScreen onDone={() => {
            setLoading(false);
            setRevealing(true);
          }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealing && (
          <RevealScreen
            experienceLevel={savedAnswers.experienceLevel ?? "new"}
            onDone={() => doFinish(savedAnswers)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
