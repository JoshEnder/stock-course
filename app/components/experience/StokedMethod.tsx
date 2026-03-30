"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const mono = "ui-monospace, SFMono-Regular, monospace";

interface StokedMethodProps {
  onContinue: () => void;
}

const nodes = [
  { id: "decide", label: "Decide" },
  { id: "feel", label: "Feel consequence" },
  { id: "understand", label: "Understand why" },
  { id: "repeat", label: "Repeat" },
];

export default function StokedMethod({ onContinue }: StokedMethodProps) {
  const [visibleNodes, setVisibleNodes] = useState(0);
  const [showLoop, setShowLoop] = useState(false);
  const [showClosing, setShowClosing] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setVisibleNodes(1), 100));
    timers.push(setTimeout(() => setVisibleNodes(2), 200));
    timers.push(setTimeout(() => setVisibleNodes(3), 300));
    timers.push(setTimeout(() => setVisibleNodes(4), 400));
    timers.push(setTimeout(() => setShowLoop(true), 800));
    timers.push(setTimeout(() => setShowClosing(true), 1100));
    timers.push(setTimeout(() => setShowButton(true), 1600));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#141829",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        fontFamily: font,
      }}
    >
      <div style={{ maxWidth: 580, width: "100%" }}>
        {/* Opening label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            color: "#10b981",
            fontSize: 12,
            fontFamily: mono,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          You just experienced it.
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            color: "#ffffff",
            fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: 0,
            marginBottom: 40,
            lineHeight: 1.2,
          }}
        >
          The Stoked Method
        </motion.h2>

        {/* Desktop: horizontal nodes. Mobile: vertical. */}
        <div
          style={{
            marginBottom: 32,
          }}
        >
          {/* Desktop layout */}
          <div
            className="hidden-mobile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              justifyContent: "center",
            }}
          >
            {nodes.map((node, i) => (
              <div
                key={node.id}
                style={{ display: "flex", alignItems: "center" }}
              >
                <AnimatePresence>
                  {visibleNodes > i && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{
                        backgroundColor: "#1a1f35",
                        border: "1px solid rgba(16,185,129,0.2)",
                        borderRadius: 12,
                        padding: "12px 18px",
                        textAlign: "center",
                        minWidth: 110,
                      }}
                    >
                      <div
                        style={{
                          color: "#10b981",
                          fontSize: 10,
                          fontFamily: mono,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: 4,
                          opacity: 0.7,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div
                        style={{
                          color: "#ffffff",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {node.label}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {i < nodes.length - 1 && visibleNodes > i && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    style={{
                      transformOrigin: "left",
                      color: "#10b981",
                      fontSize: 18,
                      padding: "0 8px",
                      fontWeight: 700,
                    }}
                  >
                    →
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile layout — vertical */}
          <div
            className="show-mobile"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            }}
          >
            {nodes.map((node, i) => (
              <div
                key={node.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: 280,
                }}
              >
                <AnimatePresence>
                  {visibleNodes > i && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        backgroundColor: "#1a1f35",
                        border: "1px solid rgba(16,185,129,0.2)",
                        borderRadius: 12,
                        padding: "14px 20px",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          color: "#10b981",
                          fontSize: 10,
                          fontFamily: mono,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: 4,
                          opacity: 0.7,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div
                        style={{
                          color: "#ffffff",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {node.label}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {i < nodes.length - 1 && visibleNodes > i && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.25, delay: 0.1 }}
                    style={{
                      transformOrigin: "top",
                      color: "#10b981",
                      fontSize: 18,
                      padding: "6px 0",
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    ↓
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Loop arrow */}
        <AnimatePresence>
          {showLoop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 36,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "rgba(16,185,129,0.5)",
                  fontSize: 12,
                  fontFamily: mono,
                  letterSpacing: "0.06em",
                  border: "1px solid rgba(16,185,129,0.15)",
                  borderRadius: 20,
                  padding: "5px 14px",
                }}
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ display: "inline-block" }}
                >
                  ↻
                </motion.span>
                <span>Loops back</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Closing */}
        <AnimatePresence>
          {showClosing && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                color: "#ffffff",
                fontSize: "clamp(16px, 3vw, 20px)",
                fontWeight: 700,
                margin: 0,
                marginBottom: 36,
                lineHeight: 1.45,
                letterSpacing: "-0.01em",
              }}
            >
              That loop is how markets actually teach you.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Button */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <button
                onClick={onContinue}
                style={{
                  width: "100%",
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 32px",
                  fontSize: 17,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: font,
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.filter =
                    "brightness(1.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.filter =
                    "brightness(1)";
                }}
              >
                See what&apos;s next →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inline responsive overrides */}
      <style>{`
        .hidden-mobile { display: flex !important; }
        .show-mobile { display: none !important; }
        @media (max-width: 600px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
