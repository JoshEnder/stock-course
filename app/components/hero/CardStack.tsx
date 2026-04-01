"use client";

import { motion } from "framer-motion";
import { lessons } from "./lessons";
import { Card } from "./Card";
import { colors, fonts } from "./tokens";

interface CardStackProps {
  activeCard: number;
  selectedAnswers: Record<number, number | null>;
  onSelectAnswer: (cardIndex: number, answerIndex: number) => void;
  onFocusCard: (index: number) => void;
}

/*
  Reference layout (from design idea.png):
  - Front card: "Ownership" quiz, large, fully visible, sitting on pedestal
  - Behind-right: "Risk & Reward" card, smaller, faded, tilted, with chart icon
  - Behind-right-top: "Market Pressure" card, smallest, most faded, lock icon
  - All sitting on a brushed-metal pedestal
  - Green glow trail connecting cards

  The stack fans cards backward and to the right with increasing vertical offset.
*/

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

function getStackPositions(activeIndex: number): StackPosition[] {
  // We show up to 4 cards in the visible stack
  // Position 0 = front, 1 = first behind, 2 = second behind, etc.
  const positions: StackPosition[] = [];

  for (let i = 0; i < lessons.length; i++) {
    const depth = i - activeIndex;

    if (depth < 0) {
      // Cards before active: hidden to the left
      positions.push({
        x: -600,
        y: 0,
        scale: 0.85,
        rotateY: 0,
        rotateX: 0,
        opacity: 0,
        zIndex: 0,
        width: 470,
        height: 430,
      });
    } else if (depth === 0) {
      // Front card — dominant, fully visible
      positions.push({
        x: 0,
        y: 0,
        scale: 1,
        rotateY: 0,
        rotateX: 0,
        opacity: 1,
        zIndex: 10,
        width: 470,
        height: 430,
      });
    } else if (depth === 1) {
      // First behind — offset right & up, slightly smaller
      positions.push({
        x: 60,
        y: -55,
        scale: 0.92,
        rotateY: -6,
        rotateX: 2,
        opacity: 0.75,
        zIndex: 9,
        width: 430,
        height: 480,
      });
    } else if (depth === 2) {
      // Second behind — further right & up
      positions.push({
        x: 110,
        y: -105,
        scale: 0.84,
        rotateY: -10,
        rotateX: 3,
        opacity: 0.55,
        zIndex: 8,
        width: 400,
        height: 520,
      });
    } else {
      // Remaining cards — stacked further back, barely visible
      const extraDepth = depth - 2;
      positions.push({
        x: 110 + extraDepth * 30,
        y: -105 - extraDepth * 35,
        scale: 0.84 - extraDepth * 0.06,
        rotateY: -10 - extraDepth * 2,
        rotateX: 3,
        opacity: Math.max(0.15, 0.55 - extraDepth * 0.2),
        zIndex: 7 - extraDepth,
        width: 380,
        height: 520,
      });
    }
  }

  return positions;
}

// Mini candlestick chart SVG for back cards
function CandlestickIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      style={{ opacity: 0.18 }}
    >
      {/* Candlestick bars */}
      <rect x="8" y="20" width="4" height="14" rx="1" fill="#253744" />
      <line x1="10" y1="16" x2="10" y2="20" stroke="#253744" strokeWidth="1.2" />
      <line x1="10" y1="34" x2="10" y2="38" stroke="#253744" strokeWidth="1.2" />

      <rect x="16" y="14" width="4" height="10" rx="1" fill="#14B874" />
      <line x1="18" y1="10" x2="18" y2="14" stroke="#14B874" strokeWidth="1.2" />
      <line x1="18" y1="24" x2="18" y2="30" stroke="#14B874" strokeWidth="1.2" />

      <rect x="24" y="18" width="4" height="16" rx="1" fill="#253744" />
      <line x1="26" y1="14" x2="26" y2="18" stroke="#253744" strokeWidth="1.2" />
      <line x1="26" y1="34" x2="26" y2="38" stroke="#253744" strokeWidth="1.2" />

      <rect x="32" y="12" width="4" height="12" rx="1" fill="#14B874" />
      <line x1="34" y1="8" x2="34" y2="12" stroke="#14B874" strokeWidth="1.2" />
      <line x1="34" y1="24" x2="34" y2="28" stroke="#14B874" strokeWidth="1.2" />

      <rect x="40" y="16" width="4" height="8" rx="1" fill="#14B874" />
      <line x1="42" y1="12" x2="42" y2="16" stroke="#14B874" strokeWidth="1.2" />
      <line x1="42" y1="24" x2="42" y2="28" stroke="#14B874" strokeWidth="1.2" />
    </svg>
  );
}

function LockIconLarge() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(18, 38, 52, 0.2)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.7 }}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function CardStack({
  activeCard,
  selectedAnswers,
  onSelectAnswer,
  onFocusCard,
}: CardStackProps) {
  const positions = getStackPositions(activeCard);

  return (
    <div
      style={{
        position: "relative",
        width: 620,
        height: 600,
      }}
      className="hero-card-stack"
    >
      {/* Perspective container for 3D depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: 1400,
          perspectiveOrigin: "35% 45%",
        }}
      >
        {/* Green glow trail — runs diagonally through the stack */}
        <div
          style={{
            position: "absolute",
            bottom: 90,
            left: 80,
            width: 340,
            height: 3,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(20,184,116,0.15) 15%, rgba(20,184,116,0.4) 40%, rgba(20,184,116,0.5) 55%, rgba(20,184,116,0.3) 75%, transparent 100%)",
            borderRadius: 2,
            filter: "blur(1px)",
            transform: "rotate(-12deg)",
            transformOrigin: "left center",
            zIndex: 11,
            pointerEvents: "none",
          }}
        />

        {/* Subtle green dot accents along the trail */}
        {[
          { left: 120, bottom: 105, size: 4, opacity: 0.5 },
          { left: 200, bottom: 120, size: 3, opacity: 0.35 },
          { left: 280, bottom: 132, size: 5, opacity: 0.45 },
          { left: 360, bottom: 148, size: 3, opacity: 0.3 },
        ].map((dot, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.left,
              bottom: dot.bottom,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              background: colors.green,
              opacity: dot.opacity,
              boxShadow: `0 0 8px rgba(20,184,116,${dot.opacity})`,
              zIndex: 11,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Render cards back-to-front */}
        {[...lessons]
          .map((lesson, i) => ({ lesson, i, pos: positions[i] }))
          .sort((a, b) => a.pos.zIndex - b.pos.zIndex)
          .map(({ lesson, i, pos }) => {
            const depth = i - activeCard;

            return (
              <motion.div
                key={lesson.id}
                animate={{
                  x: pos.x,
                  y: pos.y,
                  scale: pos.scale,
                  rotateY: pos.rotateY,
                  rotateX: pos.rotateX,
                  opacity: pos.opacity,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  position: "absolute",
                  left: 20,
                  bottom: 80,
                  width: pos.width,
                  height: pos.height,
                  zIndex: pos.zIndex,
                  transformStyle: "preserve-3d",
                  willChange: "transform, opacity",
                }}
              >
                <Card
                  lesson={lesson}
                  selectedAnswer={selectedAnswers[i] ?? null}
                  onSelect={(answerIndex) => onSelectAnswer(i, answerIndex)}
                  onFocus={() => onFocusCard(i)}
                  depth={depth}
                />

                {/* Decorative content for back cards */}
                {depth === 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 20,
                      pointerEvents: "none",
                    }}
                  >
                    <CandlestickIcon />
                  </div>
                )}
                {depth >= 2 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 20,
                      pointerEvents: "none",
                    }}
                  >
                    <LockIconLarge />
                  </div>
                )}
              </motion.div>
            );
          })}
      </div>

      {/* Brushed metal pedestal */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: -10,
          width: 560,
          height: 24,
          zIndex: 12,
          pointerEvents: "none",
        }}
      >
        {/* Top surface — bright metallic */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 20,
            right: 20,
            height: 6,
            borderRadius: "3px 3px 0 0",
            background:
              "linear-gradient(90deg, rgba(190,198,206,0.4) 0%, rgba(210,216,222,0.7) 25%, rgba(225,229,233,0.85) 50%, rgba(210,216,222,0.7) 75%, rgba(190,198,206,0.4) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
          }}
        />
        {/* Base — darker metallic with depth */}
        <div
          style={{
            position: "absolute",
            top: 5,
            left: 0,
            right: 0,
            height: 18,
            borderRadius: "0 0 8px 8px",
            background:
              "linear-gradient(180deg, rgba(175,183,191,0.6) 0%, rgba(155,163,171,0.45) 50%, rgba(140,148,156,0.3) 100%)",
            boxShadow:
              "0 6px 24px rgba(28,42,54,0.08), 0 2px 8px rgba(28,42,54,0.05), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}
        />
        {/* Reflection line */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 40,
            right: 40,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.3) 70%, transparent)",
          }}
        />
      </div>

      {/* "HOVER TO EXPLORE" */}
      <p
        style={{
          position: "absolute",
          bottom: -32,
          right: 30,
          fontFamily: fonts.sans,
          fontSize: 10,
          fontWeight: 600,
          color: "rgba(18, 38, 52, 0.22)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          margin: 0,
          userSelect: "none",
        }}
      >
        Hover to explore
      </p>

      {/* Responsive sizing */}
      <style jsx global>{`
        @media (max-width: 640px) {
          .hero-card-stack {
            width: 340px !important;
            height: 420px !important;
            transform: scale(0.72);
            transform-origin: center center;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .hero-card-stack {
            transform: scale(0.85);
            transform-origin: center center;
          }
        }
      `}</style>
    </div>
  );
}
