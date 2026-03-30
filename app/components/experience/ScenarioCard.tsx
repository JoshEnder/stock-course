"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Scenario, ScenarioOption, UserResult } from "@/app/types/experience";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const mono = "ui-monospace, SFMono-Regular, monospace";

type CardPhase = "idle" | "locked" | "revealing" | "done";

interface ScenarioCardProps {
  scenario: Scenario;
  scenarioNumber: 1 | 2 | 3;
  onComplete: (result: UserResult) => void;
}

function cubicEaseInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ScenarioCard({ scenario, scenarioNumber, onComplete }: ScenarioCardProps) {
  const [phase, setPhase] = useState<CardPhase>("idle");
  const [selected, setSelected] = useState<ScenarioOption | null>(null);
  const [displayPrice, setDisplayPrice] = useState(scenario.currentPrice);
  const [showInsight, setShowInsight] = useState(false);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCorrect = selected !== null && selected === scenario.correct;
  const finalPrice = scenario.currentPrice + scenario.actualResult.priceChange;
  // Market truth: price color = actual direction, NEVER correctness
  const priceIsUp = scenario.actualResult.direction === "UP";
  const marketColor = priceIsUp ? "#059669" : "#dc2626";

  function handleSelect(option: ScenarioOption) {
    if (phase !== "idle") return;
    setSelected(option);
    setPhase("locked");

    setTimeout(() => {
      setPhase("revealing");
      let step = 0;
      function tick() {
        step++;
        const eased = cubicEaseInOut(Math.min(step / 18, 1));
        setDisplayPrice(scenario.currentPrice + (finalPrice - scenario.currentPrice) * eased);
        if (step < 18) {
          animRef.current = setTimeout(tick, 14);
        } else {
          setDisplayPrice(finalPrice);
          setTimeout(() => {
            setPhase("done");
            setTimeout(() => setShowInsight(true), 220);
          }, 150);
        }
      }
      animRef.current = setTimeout(tick, 14);
    }, 380);
  }

  useEffect(() => {
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, []);

  const options: { value: ScenarioOption; symbol: string; label: string }[] = [
    { value: "UP", symbol: "↑", label: "UP" },
    { value: "FLAT", symbol: "→", label: "FLAT" },
    { value: "DOWN", symbol: "↓", label: "DOWN" },
  ];

  // Correctness colors — independent of market direction
  const correctPanel = { bg: "#f0fdf4", border: "1.5px solid rgba(16,185,129,0.28)", label: "#065f46" };
  const wrongPanel = { bg: "#f8fafc", border: "1.5px solid rgba(0,0,0,0.07)", label: "#374151" };
  const panel = isCorrect ? correctPanel : wrongPanel;

  // Card outline after result reveals correctness
  const cardOutline = phase === "done"
    ? isCorrect ? "2px solid rgba(16,185,129,0.22)" : "2px solid transparent"
    : "2px solid transparent";

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06), 0 8px 40px rgba(0,0,0,0.04)",
        fontFamily: font,
        maxWidth: 520,
        width: "100%",
        overflow: "hidden",
        outline: cardOutline,
        transition: "outline 0.3s",
      }}
    >
      {/* Progress strip at card top */}
      <div style={{ height: 3, backgroundColor: "rgba(0,0,0,0.04)", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${(scenarioNumber / 3) * 100}%`,
            backgroundColor: "#10b981",
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          padding: "14px 22px",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", fontFamily: mono, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {scenarioNumber} of 3
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Live dot */}
          <motion.div
            animate={phase === "idle" ? { opacity: [1, 0.3, 1] } : { opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#10b981" }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", fontFamily: mono, letterSpacing: "0.05em" }}>
            {scenario.ticker}
          </span>
        </div>
      </div>

      <div style={{ padding: "22px" }}>
        <h2 style={{ color: "#111111", fontSize: 19, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.3, letterSpacing: "-0.015em" }}>
          {scenario.title}
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 22px", lineHeight: 1.6 }}>
          {scenario.context}
        </p>

        {/* Price — market direction colors always */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ color: "#c4c9d4", fontSize: 10, fontFamily: mono, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            {phase === "idle" || phase === "locked" ? "Price" : "Moved to"}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <motion.span
              animate={{ color: (phase === "revealing" || phase === "done") ? marketColor : "#111111" }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: 42, fontWeight: 800, fontFamily: mono, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              ${fmt(displayPrice)}
            </motion.span>
            {(phase === "revealing" || phase === "done") && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                style={{ fontSize: 13, fontFamily: mono, fontWeight: 700, color: marketColor }}
              >
                {priceIsUp ? "+" : ""}{scenario.actualResult.priceChange.toFixed(2)} ({priceIsUp ? "+" : ""}{scenario.actualResult.changePercent.toFixed(1)}%)
              </motion.span>
            )}
          </div>
        </div>

        {/* Option buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
          {options.map((opt) => {
            const isSel = selected === opt.value;
            const isDim = selected !== null && !isSel;
            const revealed = phase === "done";

            const selBg = isSel
              ? revealed ? (isCorrect ? "#ecfdf5" : "#fff1f2") : "#ecfdf5"
              : "#f4f4f2";
            const selBorder = isSel
              ? revealed ? (isCorrect ? "2px solid #10b981" : "2px solid #ef4444") : "2px solid #10b981"
              : "2px solid transparent";
            const selColor = isSel
              ? revealed ? (isCorrect ? "#065f46" : "#9f1239") : "#065f46"
              : "#374151";
            const selGlow = isSel && revealed && isCorrect
              ? "0 0 0 3px rgba(16,185,129,0.14)"
              : "none";

            return (
              <motion.button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                disabled={phase !== "idle"}
                animate={{ opacity: isDim ? 0.13 : 1, scale: isSel ? 1.04 : 1 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                whileTap={phase === "idle" ? { scale: 0.92 } : {}}
                style={{
                  backgroundColor: selBg,
                  border: selBorder,
                  borderRadius: 10,
                  padding: "15px 6px",
                  color: selColor,
                  fontFamily: font,
                  fontWeight: 700,
                  cursor: phase === "idle" ? "pointer" : "default",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  outline: "none",
                  boxShadow: selGlow,
                  transition: "background-color 0.12s, border-color 0.12s, box-shadow 0.2s",
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{opt.symbol}</span>
                <span style={{ fontSize: 10, letterSpacing: "0.1em", fontFamily: mono, fontWeight: 700 }}>{opt.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Anticipation: commit bar — replaces dots, feels decisive */}
        <AnimatePresence>
          {phase === "locked" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ marginBottom: 16, height: 24, display: "flex", alignItems: "center", gap: 10 }}
            >
              <span style={{ fontSize: 10, fontFamily: mono, color: "#9ca3af", letterSpacing: "0.08em", whiteSpace: "nowrap", textTransform: "uppercase" }}>
                Loading
              </span>
              <div style={{ flex: 1, height: 2, backgroundColor: "rgba(0,0,0,0.07)", borderRadius: 1, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.38, ease: "linear" }}
                  style={{ height: "100%", backgroundColor: "#10b981", borderRadius: 1 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result panel — correctness-based */}
        <AnimatePresence>
          {(phase === "revealing" || phase === "done") && selected && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                backgroundColor: panel.bg,
                border: panel.border,
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 14,
              }}
            >
              <div style={{ color: panel.label, fontSize: 14, fontWeight: 700, marginBottom: showInsight ? 7 : 0 }}>
                {isCorrect ? scenario.successMessage : scenario.failureMessage}
              </div>
              <AnimatePresence>
                {showInsight && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ color: "#4b5563", fontSize: 13, margin: 0, lineHeight: 1.55 }}
                  >
                    {scenario.insight}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next */}
        <AnimatePresence>
          {showInsight && (
            <motion.button
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: 0.08 }}
              onClick={() => {
                if (!selected) return;
                onComplete({ scenarioId: scenario.id, choice: selected, correct: isCorrect, timestamp: Date.now() });
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%",
                backgroundColor: "#10b981",
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                padding: "15px 24px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: font,
                letterSpacing: "-0.01em",
              }}
            >
              {scenarioNumber === 3 ? "See your score →" : "Next →"}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
