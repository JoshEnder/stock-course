"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const mono = "ui-monospace, SFMono-Regular, monospace";

interface EntryHookProps {
  onStart: () => void;
}

const TAPE = [
  { sym: "AAPL", pct: "+1.24%", up: true },
  { sym: "MSFT", pct: "+0.87%", up: true },
  { sym: "TSLA", pct: "−2.31%", up: false },
  { sym: "NVDA", pct: "+3.14%", up: true },
  { sym: "META", pct: "+0.52%", up: true },
  { sym: "AMZN", pct: "−0.34%", up: false },
  { sym: "SPY", pct: "+0.18%", up: true },
  { sym: "GOOGL", pct: "+1.02%", up: true },
  { sym: "JPM", pct: "−0.91%", up: false },
  { sym: "AMD", pct: "+2.18%", up: true },
  { sym: "NFLX", pct: "−1.04%", up: false },
  { sym: "BRK.B", pct: "+0.45%", up: true },
];

// Duplicate for seamless loop
const TAPE_DOUBLE = [...TAPE, ...TAPE];

export default function EntryHook({ onStart }: EntryHookProps) {
  const [ctaReady, setCtaReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCtaReady(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#f7f6f3",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      {/* Main content — fills available space below header */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "80px 24px 0",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 540, width: "100%" }}
        >
          {/* Live indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 24,
            }}
          >
            <PulsingDot />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                fontFamily: mono,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Market Challenge
            </span>
          </motion.div>

          <h1
            style={{
              color: "#111111",
              fontSize: "clamp(40px, 7vw, 62px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
              margin: "0 0 20px",
            }}
          >
            Most people get<br />this wrong.
          </h1>

          <p
            style={{
              color: "#9ca3af",
              fontSize: 17,
              margin: "0 0 44px",
              lineHeight: 1.5,
              maxWidth: 360,
            }}
          >
            Three real calls. No guessing.
          </p>

          <motion.button
            animate={{ opacity: ctaReady ? 1 : 0 }}
            transition={{ duration: 0.35 }}
            onClick={onStart}
            disabled={!ctaReady}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "#10b981",
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "17px 32px",
              fontSize: 16,
              fontWeight: 700,
              cursor: ctaReady ? "pointer" : "default",
              fontFamily: font,
              letterSpacing: "-0.01em",
              marginBottom: 14,
            }}
          >
            Make the call →
          </motion.button>

          <p style={{ color: "#c4c9d4", fontSize: 12, margin: 0 }}>
            ~60 seconds · No background needed
          </p>
        </motion.div>
      </div>

      {/* Ticker tape — pinned to bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        style={{
          padding: "20px 0 28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Fade edges */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            background:
              "linear-gradient(to right, #f7f6f3 0%, transparent 8%, transparent 92%, #f7f6f3 100%)",
          }}
        />
        {/* Scrolling track */}
        <div
          className="ticker-track"
          style={{
            display: "flex",
            gap: 0,
            width: "max-content",
          }}
        >
          {TAPE_DOUBLE.map((item, i) => (
            <div
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "0 20px",
                borderRight: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#374151",
                  fontFamily: mono,
                  letterSpacing: "0.04em",
                }}
              >
                {item.sym}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: item.up ? "#059669" : "#dc2626",
                  fontFamily: mono,
                }}
              >
                {item.pct}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Ticker animation */}
      <style>{`
        .ticker-track {
          animation: ticker-scroll 28s linear infinite;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
        }
      `}</style>
    </div>
  );
}

function PulsingDot() {
  return (
    <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
      <motion.div
        animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundColor: "#10b981",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: "50%",
          backgroundColor: "#10b981",
        }}
      />
    </div>
  );
}
