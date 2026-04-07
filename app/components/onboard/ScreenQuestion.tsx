"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { CONTENT_W } from "./OnboardShell";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

export interface QuestionOption {
  value: string;
  label: string;
  feedback: string;
}

interface ScreenQuestionProps {
  question: string;
  affirmation: string;
  options: QuestionOption[];
  onSelect: (value: string) => void;
  selected: string | null;
  onAutoAdvance?: () => void;
}

export default function ScreenQuestion({
  question,
  affirmation,
  options,
  onSelect,
  selected,
  onAutoAdvance,
}: ScreenQuestionProps) {
  const [localSelected, setLocalSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!localSelected) return;
    const feedbackTimer = setTimeout(() => setShowFeedback(true), 140);
    const advanceTimer = setTimeout(() => { onAutoAdvance?.(); }, 1100);
    return () => {
      clearTimeout(feedbackTimer);
      clearTimeout(advanceTimer);
    };
  }, [localSelected, onAutoAdvance]);

  function handleSelect(value: string) {
    if (localSelected !== null) return;
    setLocalSelected(value);
    onSelect(value);
  }

  const sel = localSelected ?? selected;
  const selectedOption = options.find((o) => o.value === sel);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        paddingTop: "clamp(48px, 9vh, 96px)",
        paddingBottom: 140,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: CONTENT_W,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Question / affirmation — crossfade ─────────────────────────── */}
        <div style={{ position: "relative", minHeight: "clamp(72px, 11vh, 112px)", marginBottom: 28 }}>
          <AnimatePresence mode="wait">
            {!sel ? (
              <motion.h2
                key="question"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: font,
                  fontSize: "clamp(26px, 3.2vw, 34px)",
                  fontWeight: 600,
                  color: "#0a0a0a",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.15,
                  margin: 0,
                }}
              >
                {question}
              </motion.h2>
            ) : (
              <motion.div
                key="affirmation"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2
                  style={{
                    fontFamily: font,
                    fontSize: "clamp(26px, 3.2vw, 34px)",
                    fontWeight: 600,
                    color: "#0a0a0a",
                    letterSpacing: "-0.025em",
                    lineHeight: 1.15,
                    margin: 0,
                  }}
                >
                  {affirmation}
                </h2>
                <AnimatePresence>
                  {showFeedback && selectedOption && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 12,
                      }}
                    >
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        backgroundColor: "#10b981",
                        flexShrink: 0,
                      }} />
                      <p style={{
                        fontFamily: font,
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#10b981",
                        margin: 0,
                        letterSpacing: "-0.01em",
                      }}>
                        {selectedOption.feedback}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Options — stacked tactile pills ────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {options.map((opt, i) => {
            const isSel = sel === opt.value;
            const isDim = sel !== null && !isSel;

            return (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: isDim ? 0.32 : 1,
                  y: 0,
                }}
                transition={{
                  opacity: { duration: 0.22 },
                  y: { duration: 0.32, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] },
                }}
                whileHover={sel === null ? {
                  backgroundColor: "#ffffff",
                  borderColor: "#111111",
                  y: -1,
                  transition: { duration: 0.14 },
                } : {}}
                whileTap={sel === null ? { scale: 0.985, y: 0 } : {}}
                onClick={() => handleSelect(opt.value)}
                disabled={sel !== null}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  border: isSel ? "1.5px solid #10b981" : "1.5px solid #ececeb",
                  borderRadius: 14,
                  padding: "18px 22px",
                  fontFamily: font,
                  fontSize: 16,
                  fontWeight: isSel ? 600 : 500,
                  color: isSel ? "#065f46" : "#1f2937",
                  backgroundColor: isSel ? "#f0fdf4" : "#fafaf9",
                  textAlign: "left",
                  cursor: sel !== null ? "default" : "pointer",
                  outline: "none",
                  boxShadow: isSel
                    ? "0 0 0 4px rgba(16,185,129,0.10), 0 2px 8px rgba(16,185,129,0.08)"
                    : "0 1px 0 rgba(255,255,255,0.9) inset",
                  transition: "border-color 0.18s ease, box-shadow 0.18s ease, color 0.18s ease, background-color 0.18s ease",
                  letterSpacing: "-0.01em",
                }}
              >
                <span>{opt.label}</span>

                {/* Selection indicator — only visible on selected */}
                <AnimatePresence>
                  {isSel && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                        color: "#ffffff",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
