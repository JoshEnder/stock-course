"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import StokedMark from "./StokedMark";
import { CONTENT_W } from "./OnboardShell";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const mono = "ui-monospace,SFMono-Regular,monospace";

type Choice = "UP" | "DOWN" | "FLAT";
type Phase = "idle" | "locked" | "revealing" | "done";

const SCENARIO = {
  ticker: "NVDA",
  title: "Nvidia beat earnings by 18%.",
  subtitle: "$22.1B revenue vs $18.7B expected. Stock already up 40% this year.",
  currentPrice: 878.35,
  correct: "UP" as Choice,
  result: { priceChange: 52.48, changePercent: 5.97 },
  winMessage: "Exactly right.",
  lossMessage: "This one catches most people.",
  insight: "Markets price relative to expectations — not raw numbers. An 18% beat moves the price regardless of where the stock was.",
};

function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const OPTIONS: { value: Choice; arrow: string; label: string }[] = [
  { value: "UP", arrow: "↑", label: "UP" },
  { value: "FLAT", arrow: "→", label: "FLAT" },
  { value: "DOWN", arrow: "↓", label: "DOWN" },
];

interface ScreenHookProps {
  onRevealDone: () => void;
}

export default function ScreenHook({ onRevealDone }: ScreenHookProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [selected, setSelected] = useState<Choice | null>(null);
  const [displayPrice, setDisplayPrice] = useState(SCENARIO.currentPrice);
  const [showInsight, setShowInsight] = useState(false);
  const [showEpilogue, setShowEpilogue] = useState(false);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finalPrice = SCENARIO.currentPrice + SCENARIO.result.priceChange;
  const isCorrect = selected === SCENARIO.correct;
  const marketColor = "#059669";

  function handleSelect(choice: Choice) {
    if (phase !== "idle") return;
    setSelected(choice);
    setPhase("locked");

    setTimeout(() => {
      setPhase("revealing");
      let step = 0;
      function tick() {
        step++;
        const e = ease(Math.min(step / 20, 1));
        setDisplayPrice(SCENARIO.currentPrice + SCENARIO.result.priceChange * e);
        if (step < 20) {
          animRef.current = setTimeout(tick, 14);
        } else {
          setDisplayPrice(finalPrice);
          setTimeout(() => {
            setPhase("done");
            setTimeout(() => {
              setShowInsight(true);
              setTimeout(() => {
                setShowEpilogue(true);
                onRevealDone();
              }, 500);
            }, 220);
          }, 120);
        }
      }
      animRef.current = setTimeout(tick, 14);
    }, 360);
  }

  useEffect(() => {
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, []);

  const isRevealed = phase === "revealing" || phase === "done";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        paddingTop: 28,
        paddingBottom: 120,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: CONTENT_W,
          paddingLeft: 24,
          paddingRight: 24,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Header: mark + ticker badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <StokedMark size={28} />
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <motion.div
              animate={phase === "idle" ? { opacity: [1, 0.3, 1] } : { opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#10b981", flexShrink: 0 }}
            />
            <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {SCENARIO.ticker} · Quick call
            </span>
          </div>
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: font,
            fontSize: 20,
            fontWeight: 700,
            color: "#111111",
            letterSpacing: "-0.025em",
            lineHeight: 1.2,
            margin: "0 0 6px",
          }}
        >
          {SCENARIO.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.07 }}
          style={{ fontFamily: font, fontSize: 13, color: "#9ca3af", margin: "0 0 22px", lineHeight: 1.5 }}
        >
          {SCENARIO.subtitle}
        </motion.p>

        {/* Price */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.11 }}
          style={{ marginBottom: 20 }}
        >
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d1d5db", marginBottom: 4 }}>
            {isRevealed ? "Moved to" : "Current price"}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <motion.span
              animate={{ color: isRevealed ? marketColor : "#111111" }}
              transition={{ duration: 0.22 }}
              style={{ fontFamily: mono, fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              ${fmt(displayPrice)}
            </motion.span>
            {isRevealed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
                style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: marketColor }}
              >
                +{SCENARIO.result.priceChange.toFixed(2)} (+{SCENARIO.result.changePercent.toFixed(1)}%)
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Question label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, delay: 0.15 }}
          style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 10px", letterSpacing: "-0.01em" }}
        >
          What happens to the stock?
        </motion.p>

        {/* Direction buttons */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.18 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}
        >
          {OPTIONS.map((opt) => {
            const isSel = selected === opt.value;
            const isDim = selected !== null && !isSel;
            const revealed = phase === "done";
            const correct = isSel && isCorrect;
            const wrong = isSel && !isCorrect;

            return (
              <motion.button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                disabled={phase !== "idle"}
                animate={{
                  opacity: isDim ? 0.15 : 1,
                  scale: isSel ? 1.035 : 1,
                  backgroundColor: isSel
                    ? revealed ? (correct ? "#f0fdf4" : "#fff1f2") : "#f0fdf4"
                    : "#f5f5f4",
                }}
                transition={{
                  opacity: { duration: 0.18 },
                  scale: { type: "spring", stiffness: 420, damping: 26 },
                  backgroundColor: { duration: 0.14 },
                }}
                whileHover={phase === "idle" ? { backgroundColor: "#efefed", scale: 1.02 } : {}}
                whileTap={phase === "idle" ? { scale: 0.93 } : {}}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  border: isSel
                    ? `2px solid ${revealed ? (correct ? "#10b981" : "#ef4444") : "#10b981"}`
                    : "2px solid transparent",
                  borderRadius: 12,
                  padding: "12px 6px",
                  color: isSel
                    ? revealed ? (correct ? "#065f46" : "#9f1239") : "#065f46"
                    : "#374151",
                  fontFamily: font,
                  fontWeight: 600,
                  cursor: phase === "idle" ? "pointer" : "default",
                  outline: "none",
                  boxShadow: isSel && !revealed ? "0 0 0 3px rgba(16,185,129,0.12)" : "none",
                  transition: "border-color 0.14s, box-shadow 0.14s, color 0.14s",
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{opt.arrow}</span>
                <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em" }}>{opt.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Loading bar */}
        <AnimatePresence>
          {phase === "locked" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: 10, height: 18, marginBottom: 10 }}
            >
              <span style={{ fontFamily: mono, fontSize: 9, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading</span>
              <div style={{ flex: 1, height: 2, backgroundColor: "rgba(0,0,0,0.07)", borderRadius: 1, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.36, ease: "linear" }}
                  style={{ height: "100%", backgroundColor: "#10b981", borderRadius: 1 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result panel */}
        <AnimatePresence>
          {isRevealed && selected && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                backgroundColor: isCorrect ? "#f0fdf4" : "#fafafa",
                border: isCorrect ? "1px solid rgba(16,185,129,0.22)" : "1px solid rgba(0,0,0,0.07)",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 16,
              }}
            >
              <p style={{ fontFamily: font, fontSize: 14, fontWeight: 600, color: isCorrect ? "#065f46" : "#374151", margin: "0 0 4px" }}>
                {isCorrect ? SCENARIO.winMessage : SCENARIO.lossMessage}
              </p>
              <AnimatePresence>
                {showInsight && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.22 }}
                    style={{ fontFamily: font, fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.6 }}
                  >
                    {SCENARIO.insight}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Epilogue */}
        <AnimatePresence>
          {showEpilogue && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: font,
                fontSize: 15,
                fontWeight: 600,
                color: "#111111",
                letterSpacing: "-0.02em",
                lineHeight: 1.35,
                margin: 0,
              }}
            >
              Most people aren't fully sure why this happens.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
