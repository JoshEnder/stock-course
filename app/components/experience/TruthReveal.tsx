"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

interface TruthRevealProps {
  onContinue: () => void;
}

const truths = [
  "You watch — but markets reward decisions.",
  "You memorize terms — but never commit to why.",
  "You never make real calls — so nothing sticks.",
];

export default function TruthReveal({ onContinue }: TruthRevealProps) {
  const [visibleTruths, setVisibleTruths] = useState(0);
  const [showClosing, setShowClosing] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setVisibleTruths(1), 200));
    timers.push(setTimeout(() => setVisibleTruths(2), 400));
    timers.push(setTimeout(() => setVisibleTruths(3), 600));
    timers.push(setTimeout(() => setShowClosing(true), 1100));
    timers.push(setTimeout(() => setShowButton(true), 1500));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#0a0e27",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        fontFamily: font,
      }}
    >
      <div style={{ maxWidth: 520, width: "100%" }}>
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            color: "#ffffff",
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: 0,
            marginBottom: 40,
            lineHeight: 1.15,
          }}
        >
          Why it never clicks.
        </motion.h2>

        {/* Truths */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {truths.map((truth, i) => (
            <AnimatePresence key={i}>
              {visibleTruths > i && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 3,
                      minHeight: 28,
                      borderRadius: 2,
                      backgroundColor: "#10b981",
                      flexShrink: 0,
                      marginTop: 3,
                    }}
                  />
                  <p
                    style={{
                      color: "#ffffff",
                      fontSize: 18,
                      fontWeight: 400,
                      margin: 0,
                      lineHeight: 1.55,
                    }}
                  >
                    {truth}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* Closing line */}
        <AnimatePresence>
          {showClosing && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                color: "#f59e0b",
                fontSize: "clamp(16px, 3vw, 20px)",
                fontWeight: 700,
                margin: 0,
                marginBottom: 40,
                lineHeight: 1.45,
              }}
            >
              That&apos;s why six months later, you&apos;re still guessing.
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
                Show me the difference →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
