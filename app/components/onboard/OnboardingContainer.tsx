"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { buildQuizData, saveQuizData } from "@/app/lib/onboarding-quiz";
import { queueRoadmapLoginGate } from "@/app/lib/post-onboarding-login-gate";

// ─── Design tokens ────────────────────────────────────────────────────────────
const F_SERIF = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";
const F_SANS  = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const EMERALD = "var(--alpine-emerald)";
const EMERALD_GLOW = "rgba(39,211,195,0.46)";
const SURFACE = "rgba(16,36,58,0.86)";
const SURFACE_HOVER = "rgba(22,49,74,0.96)";
const CREAM   = "var(--alpine-cream)";
const MUTED   = "var(--alpine-text-secondary)";
const BODY    = "var(--alpine-text)";

// ─── Questions ────────────────────────────────────────────────────────────────
interface Opt { value: string; label: string }
interface Q   { id: "experienceLevel" | "goal" | "learningStyle"; text: string; options: Opt[] }
type Answers  = Partial<Record<Q["id"], string>>;

const QUESTIONS: Q[] = [
  {
    id: "experienceLevel",
    text: "Where are you starting?",
    options: [
      { value: "new",      label: "Completely new to this"            },
      { value: "basics",   label: "I know the basics"                 },
      { value: "explored", label: "Fairly comfortable"                },
      { value: "deeper",   label: "Well experienced"                  },
    ],
  },
  {
    id: "goal",
    text: "What brought you here?",
    options: [
      { value: "wealth",      label: "Build long-term wealth"         },
      { value: "understand",  label: "Understand how markets work"    },
      { value: "opportunity", label: "Spot real opportunities"        },
      { value: "exploring",   label: "Just exploring"                 },
    ],
  },
  {
    id: "learningStyle",
    text: "How do you learn best?",
    options: [
      { value: "structure", label: "Step by step"                     },
      { value: "doing",     label: "Hands-on first"                   },
      { value: "concepts",  label: "Theory before practice"           },
      { value: "mix",       label: "A bit of everything"              },
    ],
  },
];

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
@keyframes obMesh {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.ob-root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(60rem 30rem at 10% 0%, rgba(95,143,179,0.16) 0%, transparent 58%),
    radial-gradient(40rem 22rem at 100% 10%, rgba(39,211,195,0.1) 0%, transparent 54%),
    linear-gradient(135deg, #08111d 0%, #0b1c2e 38%, #10243a 68%, #08111d 100%);
  background-size: 300% 300%;
  animation: obMesh 12s ease infinite;
  position: relative;
}
.ob-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E");
  opacity: 0.026;
}
`;

function useInjectCSS() {
  useEffect(() => {
    const id = "ob-css-v4";
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
      <div style={{
        display: "flex", justifyContent: "flex-end",
        padding: "18px 24px 10px",
        fontFamily: F_SANS, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.16em", textTransform: "uppercase" as const,
        color: EMERALD,
      }}>
        STEP {String(step).padStart(2,"0")} / {String(total).padStart(2,"0")}
      </div>
      <div style={{ width: "100%", height: 1.5, background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%", background: EMERALD, position: "relative" }}
        >
          <div style={{
            position: "absolute", right: -3, top: "50%", transform: "translateY(-50%)",
            width: 6, height: 6, borderRadius: "50%", background: EMERALD,
            boxShadow: `0 0 8px ${EMERALD_GLOW}, 0 0 14px rgba(16,185,129,0.3)`,
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
          ? `1.5px solid ${EMERALD}`
          : hovering
          ? `1.5px solid rgba(127,231,242,0.32)`
          : `1px solid rgba(95,143,179,0.20)`,
        background: selected
          ? "rgba(39,211,195,0.14)"
          : hovering
          ? SURFACE_HOVER
          : SURFACE,
        boxShadow: selected
          ? `0 0 24px rgba(39,211,195,0.18), inset 0 1px 0 rgba(255,255,255,0.05)`
          : hovering
          ? "0 12px 26px rgba(3,10,20,0.22)"
          : `0 12px 28px rgba(3,10,20,0.2), inset 0 1px 0 rgba(255,255,255,0.04)`,
        fontFamily: F_SANS, fontSize: 16, fontWeight: 500,
        color: selected ? "var(--alpine-text)" : BODY,
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
              stroke={EMERALD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          fontSize: "clamp(26px, 4vw, 40px)",
          fontWeight: 600,
          color: CREAM,
          letterSpacing: "-0.02em",
          lineHeight: 1.14,
          margin: "0 0 28px",
        }}
      >
        {q.text}
      </motion.h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
          fontFamily: F_SANS, fontSize: 13,
          fontStyle: "italic", color: MUTED,
          marginTop: 18, textAlign: "center",
        }}
      >
        {qIdx === 0 && "This shapes where your course begins."}
        {qIdx === 1 && "We build around what matters to you."}
        {qIdx === 2 && "Your course adapts to how you think."}
      </motion.p>
    </div>
  );
}

const ROADMAP_BUILD_MS = 4700;
const STAGES = [
  { label: "Analyzing your starting point", threshold: 0.28 },
  { label: "Mapping your climb", threshold: 0.64 },
  { label: "Preparing basecamp", threshold: 0.92 },
] as const;
const ROUTE_POINTS = [
  { x: 24, y: 118 },
  { x: 64, y: 102 },
  { x: 102, y: 88 },
  { x: 140, y: 76 },
  { x: 178, y: 60 },
  { x: 210, y: 38 },
] as const;
const ROUTE_PATH_D = `M 24 118
  C 40 114, 52 108, 64 102
  S 88 92, 102 88
  S 128 80, 140 76
  S 166 66, 178 60
  S 198 46, 210 38`;

function getStageIndex(progress: number) {
  if (progress < STAGES[0].threshold) return 0;
  if (progress < STAGES[1].threshold) return 1;
  if (progress < STAGES[2].threshold) return 2;
  return 2;
}

function BuildRouteVisual({
  progress,
  stageIndex,
}: {
  progress: number;
  stageIndex: number;
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 286,
        padding: "2px 0 0",
        borderRadius: 20,
        position: "relative",
        background:
          "radial-gradient(16rem 8rem at 50% 92%, rgba(39,211,195,0.09) 0%, transparent 72%)",
      }}
    >
      <svg viewBox="0 0 236 150" width="100%" height="150" aria-hidden>
        <defs>
          <linearGradient id="obRouteGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(127,231,242,0.08)" />
            <stop offset="50%" stopColor={EMERALD} />
            <stop offset="100%" stopColor="rgba(255,244,224,0.72)" />
          </linearGradient>
          <linearGradient id="obRouteBase" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(140,158,176,0.12)" />
            <stop offset="100%" stopColor="rgba(140,158,176,0.04)" />
          </linearGradient>
          <filter id="obSoftGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M8 132 C44 122, 78 110, 116 92 C152 74, 190 56, 228 34"
          fill="none"
          stroke="rgba(155,176,194,0.07)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M12 140 C54 126, 92 116, 132 98 C166 84, 198 66, 232 48"
          fill="none"
          stroke="rgba(155,176,194,0.05)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M0 132 C44 122, 84 118, 122 98 C158 80, 196 66, 236 50"
          fill="none"
          stroke="rgba(255,255,255,0.035)"
          strokeWidth="22"
          strokeLinecap="round"
          filter="url(#obSoftGlow)"
        />

        <path
          d={ROUTE_PATH_D}
          fill="none"
          stroke="url(#obRouteBase)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="3 8"
        />

        <motion.path
          d={ROUTE_PATH_D}
          fill="none"
          stroke="url(#obRouteGlow)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#obSoftGlow)"
          initial={{ pathLength: 0, opacity: 0.45 }}
          animate={{ pathLength: Math.max(progress, 0.02), opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.circle
          cx={ROUTE_POINTS[0].x}
          cy={ROUTE_POINTS[0].y}
          r="4"
          fill={EMERALD}
          filter="url(#obSoftGlow)"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
        />

        {ROUTE_POINTS.slice(1).map((point, index) => {
          const threshold = (index + 1) / (ROUTE_POINTS.length - 1);
          const active = progress >= threshold;
          const almostActive = progress >= threshold - 0.14;
          const destination = index === ROUTE_POINTS.length - 2;

          return (
            <g key={`${point.x}-${point.y}`}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={destination && active ? 7 : active ? 5.25 : 3.6}
                fill={destination && active ? "#f6eddd" : active ? "#f4ead8" : "rgba(130,151,170,0.24)"}
                stroke={active ? EMERALD : "rgba(130,151,170,0.16)"}
                strokeWidth={destination && active ? 1.8 : active ? 1.35 : 1}
                filter={active ? "url(#obSoftGlow)" : undefined}
                initial={false}
                animate={{
                  opacity: active ? 1 : almostActive ? 0.68 : 0.28,
                  scale: destination && active ? [1, 1.16, 1] : active ? [1, 1.06, 1] : 1,
                }}
                transition={{
                  opacity: { duration: 0.35 },
                  scale: active
                    ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.2 },
                }}
                style={{ transformOrigin: `${point.x}px ${point.y}px` }}
              />
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={destination && active ? 13 : active ? 9 : 0}
                fill="none"
                stroke={active ? "rgba(39,211,195,0.28)" : "transparent"}
                strokeWidth="1"
                initial={false}
                animate={{ opacity: active ? [0.28, 0, 0.28] : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            </g>
          );
        })}

        {stageIndex >= 1 && (
          <motion.path
            d="M36 112 C46 104, 56 102, 68 100"
            fill="none"
            stroke="rgba(244,234,216,0.28)"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
        )}

        {stageIndex >= 2 && (
          <motion.path
            d="M158 70 C170 62, 182 58, 196 54"
            fill="none"
            stroke="rgba(244,234,216,0.3)"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
        )}

        {stageIndex >= 2 && (
          <motion.circle
            cx={210}
            cy={38}
            r="16"
            fill="none"
            stroke="rgba(244,234,216,0.18)"
            strokeWidth="1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "210px 38px" }}
          />
        )}
      </svg>
    </div>
  );
}

function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const start = window.performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.min(elapsed / ROADMAP_BUILD_MS, 1);
      const eased = 1 - Math.pow(1 - next, 2.2);
      setProgress(eased);

      if (next < 1) {
        frame = window.requestAnimationFrame(tick);
        return;
      }

      setProgress(1);
      setReady(true);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function handleClick() {
    if (!ready || btnLoading) return;
    setBtnLoading(true);
    onDone();
  }

  const stageIndex = getStageIndex(progress);
  const stageLabel = ready ? "Preparing basecamp" : STAGES[stageIndex].label;
  const buttonUnlocked = progress >= 0.9;
  const buttonLifted = progress >= 0.64;
  const buttonSealed = progress < 0.3;

  const loadingCopy = {
    title: "Mapping your climb",
    subtitle: "Preparing your personalized learning path.",
  };

  const readyCopy = {
    title: "Your path is ready",
    subtitle: "Basecamp is set. Start with your first lesson.",
  };

  const copy = ready ? readyCopy : loadingCopy;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.58,
          background:
            "radial-gradient(34rem 16rem at 50% 88%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%), radial-gradient(30rem 14rem at 50% 92%, rgba(39,211,195,0.09) 0%, rgba(39,211,195,0) 64%)",
        }}
      />
      <svg
        aria-hidden
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.16,
        }}
      >
        <path d="M0 650 C180 610, 320 632, 480 596 C620 566, 780 492, 930 470 C1080 446, 1220 382, 1440 330" fill="none" stroke="rgba(216,225,235,0.26)" strokeWidth="1.2" />
        <path d="M0 720 C170 684, 320 692, 500 654 C690 614, 850 562, 1040 526 C1196 494, 1308 450, 1440 400" fill="none" stroke="rgba(216,225,235,0.18)" strokeWidth="1" />
        <path d="M0 788 C210 740, 406 748, 614 700 C808 656, 996 600, 1188 548 C1292 520, 1378 482, 1440 448" fill="none" stroke="rgba(39,211,195,0.16)" strokeWidth="1" />
        <path d="M0 830 C192 796, 382 786, 580 742 C790 694, 1030 622, 1248 560 C1332 536, 1396 510, 1440 486" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.9" />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
        style={{
          width: "100%",
          maxWidth: 496,
          padding: "20px 26px 22px",
          borderRadius: 26,
          border: "1px solid rgba(109,138,161,0.11)",
          background:
            "linear-gradient(180deg, rgba(5,12,22,0.88) 0%, rgba(7,17,29,0.95) 100%)",
          boxShadow:
            "0 24px 72px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.03)",
          position: "relative",
          overflow: "hidden",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(24rem 12rem at 50% 0%, rgba(112,150,183,0.08) 0%, transparent 58%), radial-gradient(18rem 10rem at 50% 84%, rgba(39,211,195,0.05) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 14,
          }}
        >
          <BuildRouteVisual progress={progress} stageIndex={stageIndex} />

          <div style={{ maxWidth: 356 }}>
            <motion.p
              key={`stage-${stageLabel}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: ready ? 0.54 : 0.72, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{
                margin: "0 0 8px",
                fontFamily: F_SANS,
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(200,216,228,0.72)",
              }}
            >
              {stageLabel}
            </motion.p>

            <motion.h2
              key={`title-${copy.title}`}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: F_SERIF,
                fontSize: "clamp(28px, 4vw, 38px)",
                fontWeight: 600,
                color: CREAM,
                letterSpacing: "-0.03em",
                lineHeight: 1.02,
                margin: 0,
              }}
            >
              {copy.title}
            </motion.h2>

            <motion.p
              key={`subtitle-${copy.subtitle}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, ease: "easeOut", delay: 0.04 }}
              style={{
                margin: "6px 0 0",
                fontFamily: F_SANS,
                fontSize: 14,
                lineHeight: 1.5,
                color: "rgba(224,231,239,0.66)",
              }}
            >
              {copy.subtitle}
            </motion.p>
          </div>

          <motion.button
            whileHover={ready && !btnLoading ? { scale: 1.015, y: -1 } : {}}
            whileTap={ready && !btnLoading ? { scale: 0.985 } : {}}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={handleClick}
            disabled={!ready || btnLoading}
            style={{
              width: "100%",
              maxWidth: 360,
              height: 58,
              borderRadius: 15,
              border: ready
                ? "1px solid rgba(255,248,238,0.24)"
                : buttonUnlocked
                ? "1px solid rgba(168,197,219,0.24)"
                : "1px solid rgba(109,138,161,0.12)",
              background: ready
                ? "linear-gradient(180deg, #f0e7d8 0%, #dfd3bc 100%)"
                : buttonUnlocked
                ? "linear-gradient(180deg, rgba(26,39,53,0.98) 0%, rgba(16,28,40,0.98) 100%)"
                : "linear-gradient(180deg, rgba(11,20,31,0.96) 0%, rgba(8,16,25,0.96) 100%)",
              color: ready ? "#09111a" : buttonLifted ? "rgba(231,239,245,0.92)" : "rgba(231,239,245,0.68)",
              fontFamily: F_SANS,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.012em",
              cursor: ready && !btnLoading ? "pointer" : "default",
              outline: "none",
              boxShadow: ready
                ? "inset 0 1px 0 rgba(255,255,255,0.64), 0 18px 36px rgba(0,0,0,0.26)"
                : buttonUnlocked
                ? "inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 30px rgba(0,0,0,0.2), 0 0 0 1px rgba(39,211,195,0.06)"
                : "inset 0 1px 0 rgba(255,255,255,0.015), inset 0 -1px 0 rgba(0,0,0,0.26), 0 8px 18px rgba(0,0,0,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 18px 0 16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <motion.div
              aria-hidden
              initial={false}
              animate={{
                opacity: ready ? 0 : buttonUnlocked ? 0.2 : buttonLifted ? 0.11 : 0.05,
                backgroundPositionX: progress > 0.2 ? "100%" : "0%",
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(120deg, rgba(39,211,195,0) 0%, rgba(39,211,195,0.08) 36%, rgba(127,231,242,0.12) 52%, rgba(39,211,195,0.05) 68%, rgba(39,211,195,0) 100%)",
                backgroundSize: "180% 100%",
                pointerEvents: "none",
              }}
            />

            <motion.span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 26,
                height: 26,
                borderRadius: "999px",
                background: ready
                  ? "rgba(9,17,26,0.08)"
                  : buttonUnlocked
                  ? "rgba(127,231,242,0.14)"
                  : "rgba(127,231,242,0.05)",
                border: ready
                  ? "1px solid rgba(9,17,26,0.12)"
                  : buttonUnlocked
                  ? "1px solid rgba(127,231,242,0.18)"
                  : "1px solid rgba(127,231,242,0.08)",
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
                boxShadow: ready || buttonUnlocked ? `0 0 18px ${EMERALD_GLOW}` : "none",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {btnLoading ? (
                  <motion.span
                    key="btn-load"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "999px",
                      border: "2px solid rgba(9,17,26,0.24)",
                      borderTopColor: "#09111a",
                      display: "inline-block",
                    }}
                  />
                ) : ready ? (
                  <motion.svg
                    key="btn-arrow"
                    initial={{ opacity: 0, x: -3 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 3 }}
                    transition={{ duration: 0.22 }}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M2.5 7H11.5M11.5 7L8.25 3.75M11.5 7L8.25 10.25"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="btn-lock"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.22 }}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M3.5 5V3.75C3.5 2.51 4.51 1.5 5.75 1.5C6.99 1.5 8 2.51 8 3.75V5M3 5H8.5C8.78 5 9 5.22 9 5.5V9C9 9.28 8.78 9.5 8.5 9.5H3C2.72 9.5 2.5 9.28 2.5 9V5.5C2.5 5.22 2.72 5 3 5Z"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.span>

            <span
              style={{
                position: "relative",
                zIndex: 1,
                flex: 1,
                textAlign: "center",
              }}
            >
              {btnLoading
                ? "Opening basecamp..."
                : ready
                ? "Enter basecamp"
                : stageIndex === 0
                ? "Route sealed"
                : stageIndex === 1
                ? "Unlocking access"
                : "Preparing basecamp"}
            </span>

            <span
              style={{
                position: "relative",
                zIndex: 1,
                minWidth: 18,
                textAlign: "right",
                fontSize: 14,
                color: ready
                  ? "rgba(9,17,26,0.62)"
                  : buttonUnlocked
                  ? "rgba(231,239,245,0.74)"
                  : "rgba(200,216,228,0.34)",
              }}
            >
              {btnLoading ? "" : ready ? "→" : ""}
            </span>
            {buttonSealed && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 15,
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0) 24%)",
                  pointerEvents: "none",
                }}
              />
            )}
          </motion.button>
        </div>
      </motion.div>
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
              {/* Atmospheric glow — subtle alpine mist */}
              <div aria-hidden style={{
                position: "fixed", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse at 50% 38%, rgba(127,231,242,0.06) 0%, rgba(39,211,195,0.025) 40%, transparent 68%)",
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
          <LoadingScreen onDone={() => doFinish(savedAnswers)} />
        )}
      </AnimatePresence>
    </div>
  );
}
