"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { lessons } from "./lessons";
import { Card } from "./Card";
import { colors } from "./tokens";

interface CardStackProps {
  activeCard: number;
  selectedAnswers: Record<number, number | null>;
  onSelectAnswer: (cardIndex: number, answerIndex: number) => void;
  onFocusCard: (index: number) => void;
}

type StackRole = "front" | "secondary" | "tertiary" | "fourth";

interface StackPosition {
  x: number;
  y: number;
  scale: number;
  rotateY: number;
  rotateX: number;
  opacity: number;
  zIndex: number;
  width: number;
  height: number;
}

const stackCards = [
  { lessonIndex: 0, role: "front" as const },
  { lessonIndex: 3, role: "secondary" as const },
  { lessonIndex: 5, role: "tertiary" as const },
  { lessonIndex: 1, role: "fourth" as const },
];

/*
  COMPOSITION: 760 × 720 container, perspective depth-stack

  Bottom anchor: 80  →  card bottoms at y = 640 from container top.

  Front card  (h=490): natural top = 640−490 = 150  →  at rest y=0   → visual top = 150
  Card 2      (h=460): natural top = 640−460 = 180  →  at rest y=−82 → visual top =  98  (52px peek)
  Card 3      (h=440): natural top = 640−440 = 200  →  at rest y=−150 → visual top = 50  (48px peek)
  Card 4      (h=420): natural top = 640−420 = 220  →  at rest y=−210 → visual top = 10  (40px peek)

  The three peek strips (y=10–50, y=50–98, y=98–150) sit above the front card. Each is the
  hover target for its card. Because each strip is the topmost element in its y-band, pointer
  events route correctly without any explicit hit-testing.

  On hover: the focused card slides RIGHT to x=460, revealing its full surface next to
  the front card. Front card dims slightly and shifts a few pixels left to "open" the composition.
  All other back cards recede further. Container mouseLeave resets everything.
*/
function getStackPositions(
  systemHovered: boolean,
  focusedRole: StackRole | null,
): Record<StackRole, StackPosition> {
  const anyFocused = focusedRole !== null;

  return {
    front: {
      x: anyFocused ? 26 : 40,
      y: 0,
      scale: 1,
      rotateY: -1.5,
      rotateX: 0.8,
      opacity: anyFocused ? 0.80 : 1,
      zIndex: 14,
      width: 400,
      height: 490,
    },
    secondary: {
      x: focusedRole === "secondary" ? 460 : 40,
      y: focusedRole === "secondary" ? -25 : -82,
      scale: focusedRole === "secondary" ? 0.97 : 0.88,
      rotateY: focusedRole === "secondary" ? -2 : -12,
      rotateX: focusedRole === "secondary" ? 0.5 : 3,
      opacity: focusedRole === "secondary"
        ? 0.93
        : anyFocused ? 0.03
        : systemHovered ? 0.14 : 0.09,
      zIndex: 12,
      width: 300,
      height: 460,
    },
    tertiary: {
      x: focusedRole === "tertiary" ? 460 : 40,
      y: focusedRole === "tertiary" ? -38 : -150,
      scale: focusedRole === "tertiary" ? 0.93 : 0.84,
      rotateY: focusedRole === "tertiary" ? -3 : -16,
      rotateX: focusedRole === "tertiary" ? 0.8 : 4.5,
      opacity: focusedRole === "tertiary"
        ? 0.90
        : anyFocused ? 0.02
        : systemHovered ? 0.10 : 0.06,
      zIndex: 10,
      width: 280,
      height: 440,
    },
    fourth: {
      x: focusedRole === "fourth" ? 460 : 40,
      y: focusedRole === "fourth" ? -48 : -210,
      scale: focusedRole === "fourth" ? 0.90 : 0.80,
      rotateY: focusedRole === "fourth" ? -4 : -20,
      rotateX: focusedRole === "fourth" ? 1.2 : 6,
      opacity: focusedRole === "fourth"
        ? 0.86
        : anyFocused ? 0.02
        : systemHovered ? 0.07 : 0.04,
      zIndex: 8,
      width: 260,
      height: 420,
    },
  };
}

export function CardStack({
  activeCard,
  selectedAnswers,
  onSelectAnswer,
  onFocusCard,
}: CardStackProps) {
  const [systemHovered, setSystemHovered] = useState(false);
  const [focusedRole, setFocusedRole] = useState<StackRole | null>(null);

  const focusedCard = stackCards.some((c) => c.lessonIndex === activeCard)
    ? activeCard
    : 0;

  const anyFocused = focusedRole !== null;
  const positions = getStackPositions(systemHovered, focusedRole);

  return (
    <div
      style={{ position: "relative", width: 760, height: 720, overflow: "visible" }}
      className="hero-card-stack"
      onMouseEnter={() => setSystemHovered(true)}
      onMouseLeave={() => {
        setSystemHovered(false);
        setFocusedRole(null);
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: 1800,
          perspectiveOrigin: "26% 40%",
        }}
      >
        {/* Ground shadow */}
        <div
          style={{
            position: "absolute",
            left: anyFocused ? 30 : 50,
            right: anyFocused ? 60 : 80,
            bottom: 50,
            height: anyFocused ? 60 : 48,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(28,42,54,0.20) 0%, rgba(28,42,54,0.08) 38%, rgba(28,42,54,0) 72%)",
            filter: "blur(16px)",
            zIndex: 4,
            pointerEvents: "none",
            transition: "all 0.60s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/*
          SIGNAL PATH — single foreground layer (z:16), two compositional passes per segment:
          a thick blurred glow pass (emanates through the glass) and a crisp line pass.

          The path ASCENDS from the front card's answer zone upward through the vertical
          stack of lessons — a signal of understanding moving through layers of knowledge.

          Coordinates (viewBox 0 0 760 720):
            Origin   (120, 525) — front card, lower area near answer selection
            S1 end   (82,  282) — inside front card body, mid-height
            S2 end   (62,  112) — just above front card top, card 2 peek zone
            S3 end   (56,   24) — near card 4 peek top, terminus
            Terminal (56,   14)

          The path drifts subtly leftward as it rises — the signal curves along the
          interior spine of the card as it traces upward through the lesson layers.
        */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 16,
            pointerEvents: "none",
          }}
        >
          <svg
            viewBox="0 0 760 720"
            fill="none"
            aria-hidden
            style={{ width: "100%", height: "100%" }}
          >
            <defs>
              <filter id="path-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="6.5" />
              </filter>
              <filter id="node-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
              <filter id="end-glow" x="-80%" y="-80%" width="360%" height="360%">
                <feGaussianBlur stdDeviation="9" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="trace-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
              <radialGradient id="endHalo" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#14B874" stopOpacity="0.54" />
                <stop offset="44%"  stopColor="#14B874" stopOpacity="0.20" />
                <stop offset="100%" stopColor="#14B874" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Substrate — full route, always faintly visible */}
            <path
              d="M120 525 C110 450 96 362 82 282 C72 218 66 164 62 112 C60 80 58 50 56 24"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1.4"
              strokeLinecap="round"
              filter="url(#trace-blur)"
              style={{
                opacity: systemHovered ? 0.80 : 0.42,
                transition: "opacity 0.5s ease",
              }}
            />

            {/* ── SEGMENT 1: lower front card — decision origin ascending ──────── */}
            <motion.path
              d="M120 525 C110 450 96 362 82 282"
              stroke={colors.green}
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: systemHovered ? 1 : 0,
                opacity: systemHovered ? 0.18 : 0,
              }}
              filter="url(#path-glow)"
              transition={{
                pathLength: { duration: 0.46, delay: systemHovered ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: systemHovered ? 0.12 : 0.24 },
              }}
            />
            <motion.path
              d="M120 525 C110 450 96 362 82 282"
              stroke={colors.green}
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: systemHovered ? 1 : 0,
                opacity: systemHovered ? 0.72 : 0,
              }}
              transition={{
                pathLength: { duration: 0.46, delay: systemHovered ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: systemHovered ? 0.12 : 0.24 },
              }}
            />

            {/* ── SEGMENT 2: mid zone — crossing into the lesson layers ─────────── */}
            <motion.path
              d="M82 282 C72 218 66 164 62 112"
              stroke={colors.green}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: systemHovered ? 1 : 0,
                opacity: systemHovered ? 0.14 : 0,
              }}
              filter="url(#path-glow)"
              transition={{
                pathLength: { duration: 0.38, delay: systemHovered ? 0.22 : 0.18, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: systemHovered ? 0.12 : 0.20, delay: systemHovered ? 0.22 : 0 },
              }}
            />
            <motion.path
              d="M82 282 C72 218 66 164 62 112"
              stroke={colors.green}
              strokeWidth="2.0"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: systemHovered ? 1 : 0,
                opacity: systemHovered ? 0.60 : 0,
              }}
              transition={{
                pathLength: { duration: 0.38, delay: systemHovered ? 0.22 : 0.18, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: systemHovered ? 0.12 : 0.20, delay: systemHovered ? 0.22 : 0 },
              }}
            />

            {/* ── SEGMENT 3: upper peek strips — signal arrives at the summit ─────── */}
            <motion.path
              d="M62 112 C60 80 58 50 56 24"
              stroke={colors.green}
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: systemHovered ? 1 : 0,
                opacity: systemHovered ? 0.10 : 0,
              }}
              filter="url(#path-glow)"
              transition={{
                pathLength: { duration: 0.28, delay: systemHovered ? 0.44 : 0, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: systemHovered ? 0.10 : 0.16, delay: systemHovered ? 0.44 : 0 },
              }}
            />
            <motion.path
              d="M62 112 C60 80 58 50 56 24"
              stroke={colors.green}
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: systemHovered ? 1 : 0,
                opacity: systemHovered ? 0.46 : 0,
              }}
              transition={{
                pathLength: { duration: 0.28, delay: systemHovered ? 0.44 : 0, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: systemHovered ? 0.10 : 0.16, delay: systemHovered ? 0.44 : 0 },
              }}
            />

            {/* ── ORIGIN NODE ──────────────────────────────────────────────────── */}

            {/* Expansion ring */}
            <motion.circle
              cx="120" cy="525" r="3"
              fill="none"
              stroke={colors.green}
              strokeWidth="1.5"
              animate={{
                r: systemHovered ? [3, 22, 24] : [3],
                opacity: systemHovered ? [0.7, 0.45, 0] : [0],
                strokeWidth: systemHovered ? [1.5, 0.8, 0.4] : [1.5],
              }}
              transition={{ duration: 0.82, ease: [0.2, 0.8, 0.4, 1], times: [0, 0.55, 1] }}
            />
            {/* Dark backing */}
            <motion.circle
              cx="120" cy="525" r="7"
              fill="rgba(17,39,57,0.82)"
              animate={{ opacity: systemHovered ? 1 : 0.34 }}
              transition={{ duration: 0.18 }}
            />
            {/* Green core */}
            <motion.circle
              cx="120" cy="525" r="4.5"
              fill={colors.green}
              animate={{
                r: systemHovered ? [3, 6.5, 4.5] : 3,
                opacity: systemHovered ? 1 : 0.20,
              }}
              transition={{
                r: { duration: 0.44, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.18 },
              }}
            />

            {/* ── TERMINAL NODE: 4-layer endpoint above the stack ─────────────── */}

            {/* Layer 1 — radial halo */}
            <motion.circle
              cx="56" cy="14" r="0"
              fill="url(#endHalo)"
              animate={{
                r: systemHovered ? [0, 30, 26] : 0,
                opacity: systemHovered ? 1 : 0,
              }}
              transition={{
                r: { duration: 0.46, delay: systemHovered ? 0.62 : 0, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.30, delay: systemHovered ? 0.62 : 0 },
              }}
            />
            {/* Layer 2 — feMerge glow (crisp dot + bloom simultaneously) */}
            <motion.circle
              cx="56" cy="14" r="0"
              fill={colors.green}
              filter="url(#end-glow)"
              animate={{
                r: systemHovered ? [0, 12, 10] : 0,
                opacity: systemHovered ? 0.90 : 0,
              }}
              transition={{
                r: { duration: 0.34, delay: systemHovered ? 0.66 : 0, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.22, delay: systemHovered ? 0.66 : 0 },
              }}
            />
            {/* Layer 3 — white inner ring */}
            <motion.circle
              cx="56" cy="14" r="0"
              fill="#eefff5"
              animate={{
                r: systemHovered ? [0, 5.5, 5] : 0,
                opacity: systemHovered ? 1 : 0,
              }}
              transition={{
                r: { duration: 0.26, delay: systemHovered ? 0.70 : 0, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.16, delay: systemHovered ? 0.70 : 0 },
              }}
            />
            {/* Layer 4 — green core */}
            <motion.circle
              cx="56" cy="14" r="0"
              fill={colors.green}
              animate={{
                r: systemHovered ? [0, 3, 2.8] : 0,
                opacity: systemHovered ? 1 : 0,
              }}
              transition={{
                r: { duration: 0.20, delay: systemHovered ? 0.72 : 0, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.12, delay: systemHovered ? 0.72 : 0 },
              }}
            />
          </svg>
        </div>

        {/* Cards */}
        {stackCards
          .map(({ lessonIndex, role }) => ({
            lessonIndex,
            role,
            lesson: lessons[lessonIndex],
            pos: positions[role],
          }))
          .sort((a, b) => a.pos.zIndex - b.pos.zIndex)
          .map(({ lessonIndex, role, lesson, pos }) => (
            <motion.div
              key={lesson.id}
              className={`hero-card-layer hero-card-layer-${role}`}
              animate={{
                x: pos.x,
                y: pos.y,
                scale: pos.scale,
                rotateY: pos.rotateY,
                rotateX: pos.rotateX,
                opacity: pos.opacity,
              }}
              transition={
                role === "front"
                  ? {
                      x: { type: "spring", stiffness: 460, damping: 34 },
                      y: { type: "spring", stiffness: 460, damping: 34 },
                      scale: { type: "spring", stiffness: 420, damping: 30 },
                      rotateY: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
                      rotateX: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.28, ease: "easeOut" },
                    }
                  : focusedRole === role
                  ? {
                      // Reveal: elegant forward emergence
                      duration: 0.54,
                      ease: [0.14, 1, 0.3, 1],
                      opacity: { duration: 0.36, ease: "easeOut" },
                    }
                  : {
                      // Retract: clean recession
                      duration: 0.42,
                      ease: [0.22, 1, 0.4, 1],
                      opacity: { duration: 0.28, ease: "easeOut" },
                    }
              }
              style={{
                position: "absolute",
                left: 0,
                bottom: 80,
                width: pos.width,
                height: pos.height,
                zIndex: pos.zIndex,
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
                cursor: role !== "front" ? "pointer" : "default",
              }}
              onHoverStart={() => {
                if (role !== "front") {
                  setFocusedRole(role);
                  onFocusCard(lessonIndex);
                }
              }}
            >
              <Card
                lesson={lesson}
                selectedAnswer={selectedAnswers[lessonIndex] ?? null}
                onSelect={(answerIndex) => onSelectAnswer(lessonIndex, answerIndex)}
                onFocus={() => onFocusCard(lessonIndex)}
                layer={role}
                isActive={focusedCard === lessonIndex}
                // Front card uses container hover; back cards use their own reveal state
                systemHovered={role === "front" ? systemHovered : focusedRole === role}
              />
            </motion.div>
          ))}
      </div>

      <style jsx global>{`
        @media (max-width: 640px) {
          .hero-card-stack {
            width: 380px !important;
            height: 520px !important;
            transform: scale(0.78) translateX(-6px);
            transform-origin: top center;
          }
          .hero-card-layer-tertiary,
          .hero-card-layer-fourth {
            display: none !important;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .hero-card-stack {
            transform: scale(0.86) translateX(-40px);
            transform-origin: center center;
          }
        }
      `}</style>
    </div>
  );
}
