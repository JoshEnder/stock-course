"use client";

import { AnimatePresence, motion } from "framer-motion";
import { colors, fonts } from "./tokens";
import type { Lesson } from "./lessons";

interface MiniLessonProps {
  lesson: Lesson;
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
}

// Sparkline — market scenario context chart, Nike-style uptrend with signal node
function LessonSparkline() {
  return (
    <svg
      viewBox="0 0 492 44"
      fill="none"
      aria-hidden
      style={{ width: "100%", height: 44, display: "block" }}
    >
      <defs>
        <linearGradient id="sparkAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14B874" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#14B874" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path
        d="M0 36 C52 32 98 20 148 24 C196 28 234 14 278 10 C320 6 362 18 406 14 C438 11 464 7 492 5 L492 44 L0 44 Z"
        fill="url(#sparkAreaGrad)"
      />
      {/* Price line */}
      <path
        d="M0 36 C52 32 98 20 148 24 C196 28 234 14 278 10 C320 6 362 18 406 14 C438 11 464 7 492 5"
        stroke="#14B874"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.68"
      />
      {/* Signal node — decision point on the trend */}
      <circle cx="406" cy="14" r="5.5" fill="rgba(17,39,57,0.08)" />
      <circle cx="406" cy="14" r="3" fill="rgba(17,39,57,0.72)" />
      <circle cx="406" cy="14" r="1.6" fill="#14B874" />
    </svg>
  );
}

export function MiniLesson({ lesson, selectedAnswer, onSelect }: MiniLessonProps) {
  const selectedIsCorrect =
    selectedAnswer != null && selectedAnswer === lesson.correctIndex;

  return (
    <div
      style={{
        padding: "24px 24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        height: "100%",
      }}
    >
      <div style={{ paddingBottom: 16, borderBottom: "1px solid rgba(17,39,57,0.08)" }}>
        <h3
          style={{
            fontFamily: fonts.sans,
            fontSize: 17,
            fontWeight: 700,
            color: colors.headline,
            margin: 0,
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          {lesson.title}
        </h3>
      </div>

      <div style={{ marginTop: 18 }}>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 16,
            fontWeight: 400,
            color: "rgba(17,39,57,0.76)",
            margin: 0,
            lineHeight: 1.5,
            maxWidth: "100%",
          }}
        >
          {lesson.question}
        </p>

        <div style={{ marginTop: 14 }}>
          <LessonSparkline />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginTop: 12,
          }}
        >
          {lesson.answers.map((answer, i) => {
            const isSelected = selectedAnswer === i;
            const isCorrect = i === lesson.correctIndex;
            const isSelectedCorrect = isSelected && isCorrect;

            return (
              <motion.button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedAnswer == null) onSelect(i);
                }}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "transparent",
                  cursor: selectedAnswer != null ? "default" : "pointer",
                  fontFamily: fonts.sans,
                  fontSize: 15,
                  fontWeight: isSelected ? 500 : 400,
                  color: isSelectedCorrect
                    ? colors.green
                    : isSelected
                      ? colors.headline
                      : "rgba(17,39,57,0.72)",
                  textAlign: "left",
                  outline: "none",
                }}
                whileHover={
                  selectedAnswer == null
                    ? { x: 2 }
                    : {}
                }
                whileTap={selectedAnswer == null ? { scale: 0.995 } : {}}
                transition={{ duration: 0.14, ease: "easeOut" }}
                aria-pressed={isSelected}
                disabled={selectedAnswer != null}
              >
                {/* Radio circle */}
                <span
                  style={{
                    flexShrink: 0,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: isSelectedCorrect
                      ? `2px solid ${colors.green}`
                      : isSelected
                        ? `2px solid ${colors.headline}`
                        : "1.5px solid rgba(17,39,57,0.28)",
                    background: isSelectedCorrect
                      ? colors.green
                      : isSelected
                        ? colors.headline
                        : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease-out",
                    boxShadow: isSelectedCorrect
                      ? `0 0 10px rgba(20,184,116,0.4)`
                      : "none",
                  }}
                >
                  {isSelected && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.9)",
                      }}
                    />
                  )}
                </span>
                {answer}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={selectedAnswer == null ? "idle" : selectedIsCorrect ? "correct" : "wrong"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              fontWeight: 500,
              color:
                selectedAnswer == null
                  ? "rgba(17,39,57,0.5)"
                  : selectedIsCorrect
                    ? colors.green
                    : "rgba(17,39,57,0.66)",
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            {selectedAnswer == null
              ? "Choose the answer that feels most true."
              : selectedIsCorrect
                ? "That's it. A stock is a claim on future earnings."
                : "Price follows earnings. Not the other way around."}
          </motion.p>
        </AnimatePresence>

        <span
          style={{
            flexShrink: 0,
            fontFamily: fonts.sans,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(17,39,57,0.28)",
          }}
        >
          Hover to explore
        </span>
      </div>
    </div>
  );
}
