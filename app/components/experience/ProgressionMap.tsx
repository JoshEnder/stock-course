"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { progressionNodes } from "@/app/data/progressionData";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const mono = "ui-monospace, SFMono-Regular, monospace";

interface ProgressionMapProps {
  score: number;
  onContinue: () => void;
}

export default function ProgressionMap({ score, onContinue }: ProgressionMapProps) {
  const [visible, setVisible] = useState(0);
  const [lineDrawn, setLineDrawn] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // score informs sub-text on next module
  void score;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Line draws first
    timers.push(setTimeout(() => setLineDrawn(true), 80));
    // Nodes appear with stagger
    progressionNodes.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible(i + 1), i * 70 + 200));
    });
    timers.push(setTimeout(() => setShowButton(true), progressionNodes.length * 70 + 500));
    return () => timers.forEach(clearTimeout);
  }, []);

  const completedIndex = 0; // price_basics
  const nextIndex = 1;      // earnings_moves

  return (
    <div
      style={{
        backgroundColor: "#f7f6f3",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 48px",
        fontFamily: font,
      }}
    >
      <div style={{ maxWidth: 480, width: "100%" }}>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            color: "#10b981",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: "0 0 10px",
            fontFamily: mono,
          }}
        >
          Stoked
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{
            color: "#111111",
            fontSize: "clamp(26px, 5vw, 34px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: "0 0 6px",
            lineHeight: 1.1,
          }}
        >
          Your path opens here.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            color: "#9ca3af",
            fontSize: 14,
            margin: "0 0 40px",
            lineHeight: 1.5,
          }}
        >
          Each module is a real decision. You'll see it play out.
        </motion.p>

        {/* Track container */}
        <div ref={containerRef} style={{ position: "relative" }}>

          {/* Connecting line — drawn in */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              right: 20,
              height: 2,
              backgroundColor: "rgba(0,0,0,0.06)",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: lineDrawn ? "100%" : "0%" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: "100%", backgroundColor: "#10b981", borderRadius: 1 }}
            />
          </div>

          {/* Nodes row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${progressionNodes.length}, 1fr)`,
              gap: 0,
              position: "relative",
            }}
          >
            {progressionNodes.map((node, i) => {
              const isCompleted = i === completedIndex;
              const isNext = i === nextIndex;
              const isLocked = !isCompleted && !isNext;

              return (
                <AnimatePresence key={node.id}>
                  {visible > i && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{
                        opacity: isLocked ? 0.25 : 1,
                        scale: 1,
                      }}
                      transition={{
                        duration: 0.28,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      {/* Node circle */}
                      <div style={{ position: "relative" }}>
                        {/* Pulsing ring on next node */}
                        {isNext && (
                          <motion.div
                            animate={{ scale: [1, 1.6, 1], opacity: [0.35, 0, 0.35] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                              position: "absolute",
                              inset: -6,
                              borderRadius: "50%",
                              border: "2px solid #10b981",
                            }}
                          />
                        )}

                        <div
                          style={{
                            width: isNext ? 40 : 32,
                            height: isNext ? 40 : 32,
                            borderRadius: "50%",
                            backgroundColor: isCompleted
                              ? "#10b981"
                              : isNext
                              ? "#10b981"
                              : "rgba(0,0,0,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: isCompleted || isNext ? "#ffffff" : "#c4c9d4",
                            fontWeight: 700,
                            fontSize: isNext ? 15 : 12,
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          {isCompleted ? "✓" : isNext ? node.level : "·"}
                        </div>
                      </div>

                      {/* Label below node */}
                      <div style={{ textAlign: "center", padding: "0 4px" }}>
                        <div
                          style={{
                            color: isCompleted ? "#065f46" : isNext ? "#111111" : "#9ca3af",
                            fontSize: 11,
                            fontWeight: isNext ? 700 : 500,
                            lineHeight: 1.3,
                            letterSpacing: isNext ? "-0.01em" : "0",
                          }}
                        >
                          {node.title}
                        </div>
                        {isCompleted && (
                          <div style={{ color: "#6ee7b7", fontSize: 9, marginTop: 2, fontFamily: mono, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                            Done
                          </div>
                        )}
                        {isNext && (
                          <div style={{ color: "#10b981", fontSize: 9, marginTop: 2, fontFamily: mono, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                            Next
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
        </div>

        {/* What's next detail */}
        <AnimatePresence>
          {visible >= nextIndex + 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.1 }}
              style={{
                marginTop: 32,
                backgroundColor: "#ffffff",
                border: "1px solid rgba(0,0,0,0.07)",
                borderRadius: 12,
                padding: "16px 18px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ color: "#111111", fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>
                    Earnings Moves
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 2 }}>
                    Why stocks gap 10% on a single number — and how to read it.
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    fontFamily: mono,
                    color: "#10b981",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}
                >
                  Unlocked
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              onClick={onContinue}
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
                marginTop: 20,
              }}
            >
              Start learning →
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
