"use client";

import { motion } from "framer-motion";
import { CONTENT_W } from "./OnboardShell";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

interface ScreenInterstitialProps {
  visual: "trade" | "path";
  headline: string;
  body: string;
}

// ── Trade: candlesticks with a green breakout bar ─────────────────────────────
function TradeVisual() {
  const bars = [
    { open: 52, close: 48, high: 56, low: 44 },
    { open: 48, close: 55, high: 58, low: 46 },
    { open: 55, close: 51, high: 59, low: 49 },
    { open: 51, close: 72, high: 76, low: 50 }, // breakout
    { open: 72, close: 78, high: 82, low: 71 },
  ];
  const H = 128;
  const maxVal = 92;
  const bw = 36;
  const gap = 18;
  const totalW = bars.length * (bw + gap) - gap;

  return (
    <svg width={totalW} height={H + 12} style={{ overflow: "visible", display: "block" }}>
      {bars.map((bar, i) => {
        const x = i * (bw + gap);
        const isMoment = i === 3;
        const isUp = bar.close >= bar.open;
        const color = isMoment ? "#10b981" : isUp ? "#10b981" : "#f87171";
        const yH = H - (bar.high / maxVal) * H + 6;
        const yL = H - (bar.low / maxVal) * H + 6;
        const yO = H - (bar.open / maxVal) * H + 6;
        const yC = H - (bar.close / maxVal) * H + 6;
        const bodyTop = Math.min(yO, yC);
        const bodyH = Math.max(Math.abs(yC - yO), 3);

        return (
          <motion.g
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.09, duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <line
              x1={x + bw / 2} y1={yH}
              x2={x + bw / 2} y2={yL}
              stroke={color} strokeWidth={2} opacity={0.55}
              strokeLinecap="round"
            />
            <rect
              x={x} y={bodyTop}
              width={bw} height={bodyH}
              fill={color} rx={4}
              opacity={isMoment ? 1 : 0.82}
            />
            {isMoment && (
              <motion.rect
                x={x - 3} y={bodyTop - 3}
                width={bw + 6} height={bodyH + 6}
                fill="none" stroke="#10b981" strokeWidth={1.5} rx={6}
                animate={{ opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 0.6 }}
              />
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

// ── Path: nodes on a drawn line ───────────────────────────────────────────────
function PathVisual() {
  const nodes = [
    { label: "Price", done: true },
    { label: "Earnings", done: true },
    { label: "Fed", active: true },
    { label: "Charts", locked: true },
  ];

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
      {nodes.map((node, i) => (
        <div key={node.label} style={{ display: "flex", alignItems: "center" }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.38, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
          >
            <div
              style={{
                width: node.active ? 48 : 38,
                height: node.active ? 48 : 38,
                borderRadius: "50%",
                backgroundColor: node.done ? "#10b981" : node.active ? "#111111" : "#ececeb",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: node.done || node.active ? "#fff" : "#c4c9d4",
                fontSize: node.active ? 17 : 14,
                fontWeight: 700,
                position: "relative",
              }}
            >
              {node.done ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : node.active ? "→" : "·"}
              {node.active && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.35, 0, 0.35] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  style={{ position: "absolute", inset: -5, borderRadius: "50%", border: "2px solid #111111" }}
                />
              )}
            </div>
            <span style={{
              fontSize: 12,
              fontFamily: font,
              fontWeight: node.active ? 700 : 500,
              color: node.done ? "#065f46" : node.active ? "#111111" : "#c4c9d4",
              letterSpacing: "-0.01em",
            }}>
              {node.label}
            </span>
          </motion.div>
          {i < nodes.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.22 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 42,
                height: 2,
                backgroundColor: node.done ? "#10b981" : "#ececeb",
                flexShrink: 0,
                transformOrigin: "left center",
                marginBottom: 28,
                borderRadius: 2,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ScreenInterstitial({ visual, headline, body }: ScreenInterstitialProps) {
  const Visual = visual === "trade" ? TradeVisual : PathVisual;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "100%",
        paddingTop: 80,
        paddingBottom: 160,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: CONTENT_W,
          paddingLeft: 24,
          paddingRight: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(40px, 6vh, 56px)",
          textAlign: "center",
        }}
      >
        {/* Visual centerpiece — larger, more deliberate */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140 }}
        >
          <Visual />
        </motion.div>

        {/* Copy block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: font,
              fontSize: "clamp(30px, 3.6vw, 40px)",
              fontWeight: 600,
              color: "#0a0a0a",
              letterSpacing: "-0.028em",
              lineHeight: 1.1,
              margin: 0,
              maxWidth: 440,
            }}
          >
            {headline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: font,
              fontSize: 16,
              fontWeight: 400,
              color: "#6b7280",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 400,
              letterSpacing: "-0.005em",
            }}
          >
            {body}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
