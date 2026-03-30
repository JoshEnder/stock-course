"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { UserResult } from "@/app/types/experience";
import { scenarios } from "@/app/data/scenarios";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const mono = "ui-monospace, SFMono-Regular, monospace";

interface IdentityResultProps {
  results: UserResult[];
  onContinue: () => void;
  continueLabel?: string;
}

type Phase = "scanning" | "verdict";

// Score-indexed identity reads — direct, not graded
const identityLabel: Record<number, string> = {
  0: "You're guessing.",
  1: "Not reading it yet.",
  2: "You see parts of it.",
  3: "Strong instinct.",
};

const identityColor: Record<number, string> = {
  0: "#111111",
  1: "#111111",
  2: "#111111",
  3: "#10b981",
};

const pullLine: Record<number, string> = {
  0: "Here's why the moves went that way.",
  1: "Here's what you missed.",
  2: "Here's the full picture.",
  3: "Here's the system behind it.",
};

export default function IdentityResult({
  results,
  onContinue,
  continueLabel = "See what opens next →",
}: IdentityResultProps) {
  const score = results.filter((r) => r.correct).length;
  const [phase, setPhase] = useState<Phase>("scanning");
  const [visibleRows, setVisibleRows] = useState(0);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [showLabel, setShowLabel] = useState(false);
  const [showPull, setShowPull] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build scan rows from results + scenarios
  const scanRows = results.map((result) => {
    const scenario = scenarios.find((s) => s.id === result.scenarioId) ?? scenarios[0];
    return {
      ticker: scenario.ticker,
      direction: scenario.actualResult.direction,
      changePct: scenario.actualResult.changePercent,
      choice: result.choice,
      correct: result.correct,
    };
  });

  // Phase 1: rows appear one by one, then hold for a beat before the verdict
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const rowRevealDelay = 380;
    const rowSpacing = 520;
    const finalHold = 1800;

    scanRows.forEach((_, i) => {
      const revealAt = rowRevealDelay + i * rowSpacing;
      timers.push(
        setTimeout(() => {
          setVisibleRows(i + 1);
          setActiveRow(i);
        }, revealAt),
      );
      timers.push(
        setTimeout(() => {
          setActiveRow((current) => (current === i ? null : current));
        }, revealAt + 360),
      );
    });

    const verdictAt = rowRevealDelay + scanRows.length * rowSpacing + finalHold;
    timers.push(setTimeout(() => setPhase("verdict"), verdictAt));
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 2: score count-up + staggered reveals
  useEffect(() => {
    if (phase !== "verdict") return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let step = 0;
    const steps = score > 0 ? 8 : 1;
    const iv = setInterval(() => {
      step++;
      setDisplayScore(Math.round((step / steps) * score));
      if (step >= steps) {
        clearInterval(iv);
        timers.push(setTimeout(() => setShowLabel(true), 200));
        timers.push(setTimeout(() => setShowPull(true), 440));
        timers.push(setTimeout(() => setShowButton(true), 720));
      }
    }, 45);
    return () => { clearInterval(iv); timers.forEach(clearTimeout); };
  }, [phase, score]);

  useEffect(() => {
    if (!showButton) return;
    autoRef.current = setTimeout(() => onContinue(), 6000);
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, [showButton, onContinue]);

  return (
    <div
      style={{
        backgroundColor: "#f7f6f3",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 32px",
        fontFamily: font,
      }}
    >
      <div style={{ maxWidth: 440, width: "100%" }}>
        <AnimatePresence mode="wait">

          {/* PHASE 1 — TERMINAL SCAN */}
          {phase === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Dark terminal card */}
              <div
                style={{
                  backgroundColor: "#111111",
                  borderRadius: 14,
                  padding: "24px 24px",
                  marginBottom: 0,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#10b981" }}
                  />
                  <span style={{ fontSize: 11, fontFamily: mono, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Reading decisions
                  </span>
                </div>

                {/* Decision rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {scanRows.map((row, i) => (
                    <AnimatePresence key={i}>
                      {visibleRows > i && (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "56px 1fr 1fr 28px",
                            alignItems: "center",
                            gap: 8,
                            backgroundColor:
                              activeRow === i ? "rgba(255,255,255,0.04)" : "transparent",
                            borderRadius: 10,
                            padding: "7px 8px",
                            boxShadow:
                              activeRow === i ? "0 0 0 1px rgba(255,255,255,0.06) inset" : "none",
                          }}
                        >
                          {/* Ticker */}
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", fontFamily: mono }}>
                            {row.ticker}
                          </span>

                          {/* Market result — market truth colors */}
                          <span
                            style={{
                              fontSize: 12,
                              fontFamily: mono,
                              fontWeight: 600,
                              color: row.direction === "UP" ? "#34d399" : "#f87171",
                            }}
                          >
                            {row.direction === "UP" ? "↑" : "↓"} {row.direction === "UP" ? "+" : "−"}{Math.abs(row.changePct).toFixed(1)}%
                          </span>

                          {/* User's call */}
                          <span style={{ fontSize: 11, fontFamily: mono, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>
                            You: {row.choice}
                          </span>

                          {/* Correct/wrong indicator */}
                          <span style={{ fontSize: 15, textAlign: "right" }}>
                            {row.correct ? "✓" : "✗"}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 2 — VERDICT */}
          {phase === "verdict" && (
            <motion.div
              key="verdict"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              {/* Score */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.28 }}
                style={{ display: "flex", alignItems: "baseline", gap: 1, marginBottom: 16 }}
              >
                <span
                  style={{
                    color: score === 3 ? "#10b981" : "#111111",
                    fontSize: 104,
                    fontWeight: 900,
                    fontFamily: mono,
                    letterSpacing: "-0.05em",
                    lineHeight: 1,
                  }}
                >
                  {displayScore}
                </span>
                <span
                  style={{
                    color: "#d1d5db",
                    fontSize: 48,
                    fontWeight: 700,
                    fontFamily: mono,
                    letterSpacing: "-0.02em",
                    paddingBottom: 10,
                  }}
                >
                  /3
                </span>
              </motion.div>

              {/* Result dots */}
              <div style={{ display: "flex", gap: 7, marginBottom: 24 }}>
                {results.map((r, i) => (
                  <motion.div
                    key={r.scenarioId}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.07, type: "spring", stiffness: 700, damping: 22 }}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: r.correct ? "#10b981" : "#ffffff",
                      border: r.correct ? "1px solid #10b981" : "1px solid #d8dee7",
                      boxShadow: r.correct ? "0 0 10px rgba(16,185,129,0.22)" : "none",
                    }}
                  />
                ))}
              </div>

              {/* Identity verdict */}
              <AnimatePresence>
                {showLabel && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28 }}
                    style={{
                      color: identityColor[score],
                      fontSize: 30,
                      fontWeight: 800,
                      letterSpacing: "-0.025em",
                      lineHeight: 1.1,
                      marginBottom: 8,
                    }}
                  >
                    {identityLabel[score]}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pull line — score-specific */}
              <AnimatePresence>
                {showPull && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.22 }}
                    style={{ color: "#9ca3af", fontSize: 15, marginBottom: 36, lineHeight: 1.4 }}
                  >
                    {pullLine[score]}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <AnimatePresence>
                {showButton && (
                  <motion.button
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                    onClick={() => {
                      if (autoRef.current) clearTimeout(autoRef.current);
                      onContinue();
                    }}
                    whileTap={{ scale: 0.97 }}
                  style={{
                      width: "100%",
                      backgroundColor: "#10b981",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      padding: "16px 32px",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: font,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {continueLabel}
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
