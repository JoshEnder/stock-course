"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

interface FinalCTAProps {
  ctaHref: string;
}

// Deterministic dot positions — no random, no hydration mismatch
const DOTS = Array.from({ length: 48 }, (_, i) => {
  const col = i % 8;
  const row = Math.floor(i / 8);
  return {
    x: (col / 7) * 100,
    y: (row / 5) * 100,
    size: [3, 2, 2, 3, 2, 3, 2, 2, 3, 2, 2, 3, 2, 2, 3, 2][i % 16],
    delay: (i * 0.09) % 2.4,
    duration: 2.2 + (i % 5) * 0.4,
  };
});

function AmbientDots() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {DOTS.map((dot, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.04, 0.14, 0.04] }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            backgroundColor: "#10b981",
          }}
        />
      ))}
    </div>
  );
}

function ThresholdLine() {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: 40,
        height: 2,
        backgroundColor: "#10b981",
        borderRadius: 1,
        transformOrigin: "left center",
        marginBottom: 28,
      }}
    />
  );
}

export default function FinalCTA({ ctaHref }: FinalCTAProps) {
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const t = setTimeout(() => ctaRef.current?.focus(), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#111111",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 32px",
        fontFamily: font,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient dot field */}
      <AmbientDots />

      {/* Radial highlight behind content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(16,185,129,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: 400, width: "100%", position: "relative", zIndex: 1 }}
      >
        <ThresholdLine />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          style={{
            color: "#10b981",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: "0 0 14px",
          }}
        >
          Stoked
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            color: "#ffffff",
            fontSize: "clamp(34px, 6vw, 52px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.04,
            margin: "0 0 16px",
          }}
        >
          Now understand<br />why.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: 16,
            margin: "0 0 40px",
            lineHeight: 1.5,
          }}
        >
          Every lesson is a real call. You decide, see what happens, learn why.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.42 }}
        >
          <motion.a
            ref={ctaRef}
            href={ctaHref}
            animate={{ boxShadow: ["0 0 0 0 rgba(16,185,129,0)", "0 0 0 8px rgba(16,185,129,0.12)", "0 0 0 0 rgba(16,185,129,0)"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            whileHover={{ backgroundColor: "#0ea472" }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 54,
              backgroundColor: "#10b981",
              color: "#ffffff",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              fontFamily: font,
              letterSpacing: "-0.01em",
              textDecoration: "none",
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            Start learning →
          </motion.a>

          <p style={{ color: "rgba(255,255,255,0.14)", fontSize: 12, margin: 0, textAlign: "center" }}>
            Free · No credit card
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
