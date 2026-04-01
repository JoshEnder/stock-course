"use client";

import { AnimatePresence, motion } from "framer-motion";
import { colors, fonts, shadows } from "./tokens";
import type { Lesson } from "./lessons";

interface MiniLessonProps {
  lesson: Lesson;
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
}

export function MiniLesson({ lesson, selectedAnswer, onSelect }: MiniLessonProps) {
  return (
    <div
      style={{
        padding: "36px 40px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
      }}
    >
      {/* Title — large serif like reference */}
      <h3
        style={{
          fontFamily: fonts.serif,
          fontSize: 48,
          fontWeight: 600,
          color: "#253744",
          margin: 0,
          letterSpacing: "-0.015em",
          lineHeight: 1.1,
        }}
      >
        {lesson.title}
      </h3>

      {/* Question */}
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: 18,
          fontWeight: 500,
          color: "#45545D",
          margin: 0,
          lineHeight: 1.4,
          marginTop: 4,
        }}
      >
        {lesson.question}
      </p>

      {/* Answer options */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 8,
        }}
      >
        {lesson.answers.map((answer, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrect = i === lesson.correctIndex;
          const showCorrect = isSelected && isCorrect;
          const showWrong = isSelected && !isCorrect;

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
                width: "100%",
                padding: "14px 20px",
                borderRadius: 10,
                border: `1.5px solid ${
                  showCorrect
                    ? colors.green
                    : showWrong
                      ? "#ef4444"
                      : "rgba(18, 38, 52, 0.10)"
                }`,
                background: showCorrect
                  ? colors.buttonPressed
                  : showWrong
                    ? "rgba(239, 68, 68, 0.06)"
                    : "rgba(255,255,255,0.65)",
                cursor: selectedAnswer != null ? "default" : "pointer",
                fontFamily: fonts.sans,
                fontSize: 16,
                fontWeight: showCorrect ? 600 : 500,
                color: showCorrect
                  ? colors.white
                  : showWrong
                    ? "#b91c1c"
                    : "#253744",
                textAlign: "left",
                outline: "none",
                overflow: "hidden",
              }}
              whileHover={
                selectedAnswer == null
                  ? {
                      scale: 1.01,
                      background: "rgba(255,255,255,0.85)",
                    }
                  : {}
              }
              whileTap={selectedAnswer == null ? { scale: 0.99 } : {}}
              transition={{ duration: 0.18, ease: "easeOut" }}
              aria-pressed={isSelected}
              disabled={selectedAnswer != null}
            >
              {/* Green glow on correct */}
              <AnimatePresence>
                {showCorrect && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16, delay: 0.075 }}
                    style={{
                      position: "absolute",
                      inset: -2,
                      borderRadius: 12,
                      boxShadow: shadows.greenGlow,
                      pointerEvents: "none",
                    }}
                  />
                )}
              </AnimatePresence>
              {answer}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback text */}
      <AnimatePresence>
        {selectedAnswer != null && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, delay: 0.075 }}
            style={{
              fontFamily: fonts.sans,
              fontSize: 14,
              fontWeight: 500,
              color:
                selectedAnswer === lesson.correctIndex
                  ? colors.green
                  : "#ef4444",
              margin: 0,
              marginTop: 2,
            }}
          >
            {selectedAnswer === lesson.correctIndex
              ? "Correct!"
              : "Not quite. Try the next one!"}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
