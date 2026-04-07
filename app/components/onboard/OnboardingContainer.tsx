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
const BG      = "var(--alpine-bg)";
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

// ─── Message pool ────────────────────────────────────────────────────────────
const MSG_POOL = [
  "Building your curriculum...",
  "Mapping your path...",
  "Processing your answers...",
  "Preparing your course...",
  "Shaping your experience...",
  "Setting things up...",
  "Configuring lessons...",
  "Tailoring your content...",
  "Laying the groundwork...",
  "Personalizing your route...",
  "Analyzing your profile...",
  "Calibrating difficulty...",
  "Structuring your modules...",
  "Fine-tuning your plan...",
  "Almost ready...",
  "One more moment...",
];

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
    T.push(setTimeout(() => { setMsgText(msgs[0]); setMsgKey(k => k + 1); },  500));
    T.push(setTimeout(() => { setMsgText("");      setMsgKey(k => k + 1); }, 2000));
    T.push(setTimeout(() => { setMsgText(msgs[1]); setMsgKey(k => k + 1); }, 2200));
    T.push(setTimeout(() => { setMsgText("");      setMsgKey(k => k + 1); }, 3800));
    T.push(setTimeout(() => { setMsgText(msgs[2]); setMsgKey(k => k + 1); }, 4000));
    T.push(setTimeout(() => { setMsgText("");      setMsgKey(k => k + 1); }, 5600));
    T.push(setTimeout(() => setDotsVisible(false),                            5800));
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
          background: "linear-gradient(180deg, rgba(22,49,74,0.94) 0%, rgba(10,22,38,0.98) 100%)",
          border: `1px solid rgba(95,143,179,0.22)`,
          borderRadius: 24, padding: "56px 44px 52px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 36,
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.05) inset",
        }}
      >
        {/* ── Fixed-height slot holds dots OR button — no layout shift ── */}
        <div style={{ width: "100%", minHeight: 56, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>

          {/* Pulsing dots */}
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
                      background: EMERALD,
                      boxShadow: `0 0 10px ${EMERALD_GLOW}`,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA button — warm cream, matching hero */}
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
                    background: "linear-gradient(180deg, #efe8d9 0%, var(--alpine-cream) 100%)", color: "#08111d",
                    fontFamily: F_SANS, fontSize: 15, fontWeight: 600,
                    letterSpacing: "0.012em",
                    cursor: btnLoading ? "default" : "pointer",
                    outline: "none",
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28), 0 8px 28px rgba(0,0,0,0.22)`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    opacity: btnLoading ? 0.75 : 1,
                    transition: "opacity 0.2s, background-color 0.18s, transform 0.18s",
                  }}
                >
                  {btnLoading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        style={{ display: "inline-block", width: 16, height: 16, borderRadius: "50%",
                          border: "2px solid rgba(8,17,29,0.3)", borderTopColor: "#08111d" }}
                      />
                      Loading...
                    </>
                  ) : (
                    "Continue"
                  )}
                </motion.button>
                <p style={{
                  fontFamily: F_SANS, fontSize: 12, color: MUTED,
                  textAlign: "center", margin: "10px 0 0", fontStyle: "italic",
                }}>
                  Your course is ready.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Message ───────────────────────────────────────────────── */}
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
                  color: BODY, letterSpacing: "0.4px",
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
