"use client";

import { motion } from "framer-motion";
import { fonts, shadows } from "./tokens";
import { MiniLesson } from "./MiniLesson";
import type { Lesson } from "./lessons";

interface CardProps {
  lesson: Lesson;
  selectedAnswer: number | null;
  onSelect: (answerIndex: number) => void;
  onFocus: () => void;
  depth: number;
}

export function Card({
  lesson,
  selectedAnswer,
  onSelect,
  onFocus,
  depth,
}: CardProps) {
  const isLocked = lesson.locked;
  const isFront = depth === 0;

  // Back cards get progressively more tinted/frosted
  const bgOpacity = isFront ? 0.55 : 0.55 + depth * 0.12;
  const borderOpacity = isFront ? 0.35 : 0.25 - depth * 0.05;
  const blurAmount = isFront ? 18 : 14 + depth * 4;

  return (
    <motion.div
      onClick={!isLocked && !isFront ? onFocus : undefined}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 16,
        cursor: !isLocked && !isFront ? "pointer" : isFront ? "default" : "default",
        overflow: "hidden",
      }}
      whileHover={
        !isLocked && !isFront
          ? {
              scale: 1.03,
              y: -4,
              transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
            }
          : {}
      }
      role="article"
      aria-label={`Lesson: ${lesson.title}`}
      tabIndex={isLocked ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isLocked) onFocus();
        }
      }}
    >
      {/* Frosted glass background layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 16,
          background: `rgba(245, 246, 247, ${Math.min(bgOpacity, 0.85)})`,
          backdropFilter: `blur(${blurAmount}px) saturate(1.4)`,
          WebkitBackdropFilter: `blur(${blurAmount}px) saturate(1.4)`,
          border: `1px solid rgba(255, 255, 255, ${Math.max(borderOpacity, 0.1)})`,
          boxShadow: isFront
            ? `${shadows.card}, inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.03)`
            : `0 12px 30px rgba(28,42,54,${0.06 + depth * 0.02}), inset 0 1px 0 rgba(255,255,255,0.35)`,
        }}
      />

      {/* Subtle inner edge highlight (top + left) for glass realism */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 16,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 40%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
        {isFront && !isLocked ? (
          <MiniLesson
            lesson={lesson}
            selectedAnswer={selectedAnswer}
            onSelect={onSelect}
          />
        ) : (
          /* Back card / locked card — show title centered */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 16,
              padding: 24,
            }}
          >
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: isFront ? 20 : 17,
                fontWeight: 600,
                color: `rgba(18, 38, 52, ${isFront ? 0.3 : 0.22})`,
                letterSpacing: "-0.01em",
                textAlign: "center",
              }}
            >
              {lesson.title}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
