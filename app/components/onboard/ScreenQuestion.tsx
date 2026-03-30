"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import StokedMark from "./StokedMark";
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
}

export default function ScreenQuestion({
  question,
  affirmation,
  options,
  onSelect,
  selected,
}: ScreenQuestionProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [localSelected, setLocalSelected] = useState<string | null>(null);

  function handleSelect(value: string) {
    if (localSelected !== null) return;
    setLocalSelected(value);
    onSelect(value);
    setTimeout(() => setShowFeedback(true), 120);
  }

  const sel = localSelected ?? selected;
  const selectedOption = options.find((o) => o.value === sel);

  return (
    // Content area: full width, left-aligned, top-padded — question screens don't center vertically
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        paddingTop: 32,
        paddingBottom: 120,
      }}
    >
      {/* Tight content column — same constraint as Brilliant's max-w-[290px] but slightly wider for our text */}
      <div
        style={{
          width: "100%",
          maxWidth: CONTENT_W,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Header row: small mark + question text */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 11,
            marginBottom: 28,
          }}
        >
          <div style={{ paddingTop: 3, flexShrink: 0 }}>
            <StokedMark size={28} />
          </div>

          {/* Question / affirmation crossfade */}
          <div style={{ flex: 1, position: "relative", minHeight: 48 }}>
            <AnimatePresence mode="wait">
              {!sel ? (
                <motion.h2
                  key="question"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontFamily: font,
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#111111",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  {question}
                </motion.h2>
              ) : (
                <motion.h2
                  key="affirmation"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    fontFamily: font,
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#111111",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.3,
                    margin: 0,
                  }}
                >
                  {affirmation}
                </motion.h2>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map((opt, i) => {
            const isSel = sel === opt.value;
            const isDim = sel !== null && !isSel;

            return (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: isDim ? 0.28 : 1,
                  y: 0,
                  scale: isSel ? 1.025 : 1,
                  backgroundColor: isSel ? "#f0fdf4" : "#f5f5f4",
                }}
                transition={{
                  opacity: { duration: 0.18 },
                  scale: { type: "spring", stiffness: 420, damping: 28 },
                  y: { duration: 0.28, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] },
                  backgroundColor: { duration: 0.14 },
                }}
                whileHover={sel === null ? {
                  backgroundColor: "#efefed",
                  scale: 1.01,
                  transition: { duration: 0.12 },
                } : {}}
                whileTap={sel === null ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(opt.value)}
                disabled={sel !== null}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  border: isSel ? "2px solid #10b981" : "2px solid transparent",
                  borderRadius: 9999,
                  padding: "13px 20px",
                  fontFamily: font,
                  fontSize: 15,
                  fontWeight: isSel ? 600 : 400,
                  color: isSel ? "#065f46" : "#374151",
                  textAlign: "left",
                  cursor: sel !== null ? "default" : "pointer",
                  outline: "none",
                  boxShadow: isSel ? "0 0 0 3px rgba(16,185,129,0.12)" : "none",
                  transition: "border-color 0.14s, box-shadow 0.14s, color 0.14s",
                }}
              >
                {opt.label}
              </motion.button>
            );
          })}
        </div>

        {/* Feedback text — appears 120ms after selection */}
        <div style={{ minHeight: 24, marginTop: 14 }}>
          <AnimatePresence>
            {showFeedback && selectedOption && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                style={{
                  fontFamily: font,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#10b981",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {selectedOption.feedback}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
