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
  { sym: "SPY",  pct: "+0.18%", up: true  },
  { sym: "GOOGL",pct: "+1.02%", up: true  },
  { sym: "JPM",  pct: "−0.91%", up: false },
  { sym: "AMD",  pct: "+2.18%", up: true  },
  { sym: "NFLX", pct: "−1.04%", up: false },
  { sym: "BRK.B",pct: "+0.45%", up: true  },
];
const TAPE_DOUBLE = [...TAPE, ...TAPE];

const PREVIEW = [
  { ticker: "NVDA", label: "Earnings day. Stock gapped up 8% pre-market." },
  { ticker: "TSLA", label: "CEO announcement. Volume spikes 4×." },
  { ticker: "SPY",  label: "Fed rate decision pending." },
];

export default function EntryHook({ onStart }: EntryHookProps) {
  const [ctaReady, setCtaReady] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCtaReady(true), 800);
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
      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "88px 24px 24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 400, width: "100%", textAlign: "center" }}
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 28,
            }}
          >
            <PulsingDot />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                fontFamily: mono,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
              }}
            >
              3 real market calls
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              color: "#111111",
              fontSize: "clamp(36px, 8vw, 54px)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.06,
              margin: "0 0 16px",
            }}
          >
            Can you read<br />the market?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.4 }}
            style={{
              color: "#9ca3af",
              fontSize: 16,
              margin: "0 0 32px",
              lineHeight: 1.5,
            }}
          >
            See a real situation. Make the call. Find out what happened.
          </motion.p>

          {/* Preview rows */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 36, textAlign: "left" }}
          >
            {PREVIEW.map((p, i) => (
              <div
                key={p.ticker}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 10,
                  padding: "11px 14px",
                  filter: i > 0 ? "blur(2.5px)" : "none",
                  opacity: i === 0 ? 1 : 0.55,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#111111",
                    fontFamily: mono,
                    minWidth: 44,
                  }}
                >
                  {p.ticker}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.label}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#d1d5db",
                    fontFamily: mono,
                  }}
                >
                  ?
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            animate={{ opacity: ctaReady ? 1 : 0, y: ctaReady ? 0 : 5 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.button
              onClick={ctaReady ? onStart : undefined}
              whileTap={ctaReady ? { scale: 0.96 } : {}}
              onHoverStart={() => setHovering(true)}
              onHoverEnd={() => setHovering(false)}
              animate={{
                boxShadow: hovering
                  ? "0 0 0 5px rgba(16,185,129,0.16), 0 8px 24px rgba(16,185,129,0.20)"
                  : "0 0 0 0px rgba(16,185,129,0), 0 2px 8px rgba(0,0,0,0.08)",
              }}
              transition={{ duration: 0.22 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#10b981",
                color: "#ffffff",
                border: "none",
                borderRadius: 9999,
                padding: "16px 40px",
                fontSize: 16,
                fontWeight: 700,
                cursor: ctaReady ? "pointer" : "default",
                fontFamily: font,
                letterSpacing: "-0.01em",
                marginBottom: 12,
              }}
            >
              Make the call →
            </motion.button>

            <p style={{ color: "#c4c9d4", fontSize: 12, margin: 0 }}>
              ~60 seconds · no background needed
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Ticker tape */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{ padding: "16px 0 28px", position: "relative", overflow: "hidden" }}
      >
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
        <div
          className="ticker-track"
          style={{ display: "flex", gap: 0, width: "max-content" }}
        >
          {TAPE_DOUBLE.map((item, i) => (
            <div
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "0 18px",
                borderRight: "1px solid rgba(0,0,0,0.05)",
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

      <style>{`
        .ticker-track {
          animation: ticker-scroll 28s linear infinite;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
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
        animate={{ scale: [1, 2.4, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
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
