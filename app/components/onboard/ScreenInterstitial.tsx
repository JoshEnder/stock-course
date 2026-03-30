"use client";

import { motion } from "framer-motion";
import { CONTENT_W } from "./OnboardShell";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const serif = "var(--font-cormorant,'Cormorant Garamond',Georgia,serif)";

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
  const H = 72;
  const maxVal = 86;
  const bw = 22;
  const gap = 10;
  const totalW = bars.length * (bw + gap) - gap;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ flexShrink: 0 }}
    >
      <svg width={totalW} height={H + 8} style={{ overflow: "visible", display: "block" }}>
        {bars.map((bar, i) => {
          const x = i * (bw + gap);
          const isMoment = i === 3;
          const isUp = bar.close >= bar.open;
          const color = isMoment ? "#10b981" : isUp ? "#10b981" : "#f87171";
          const yH = H - (bar.high / maxVal) * H + 4;
          const yL = H - (bar.low / maxVal) * H + 4;
          const yO = H - (bar.open / maxVal) * H + 4;
          const yC = H - (bar.close / maxVal) * H + 4;
          const bodyTop = Math.min(yO, yC);
          const bodyH = Math.max(Math.abs(yC - yO), 2);

          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <line
                x1={x + bw / 2} y1={yH}
                x2={x + bw / 2} y2={yL}
                stroke={color} strokeWidth={1.5} opacity={0.55}
              />
              <rect
                x={x} y={bodyTop}
                width={bw} height={bodyH}
                fill={color} rx={3}
                opacity={isMoment ? 1 : 0.8}
              />
              {isMoment && (
                <motion.rect
                  x={x - 2} y={bodyTop - 2}
                  width={bw + 4} height={bodyH + 4}
                  fill="none" stroke="#10b981" strokeWidth={1.5} rx={4}
                  animate={{ opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              )}
            </motion.g>
          );
        })}
      </svg>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", alignItems: "flex-start", gap: 0 }}
    >
      {nodes.map((node, i) => (
        <div key={node.label} style={{ display: "flex", alignItems: "center" }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: node.active ? 34 : 26,
                height: node.active ? 34 : 26,
                borderRadius: "50%",
                backgroundColor: node.done ? "#10b981" : node.active ? "#111111" : "#e9e9e9",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: node.done || node.active ? "#fff" : "#c4c9d4",
                fontSize: node.active ? 13 : 11,
                fontWeight: 700,
                position: "relative",
              }}
            >
              {node.done ? "✓" : node.active ? "→" : "·"}
              {node.active && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.35, 0, 0.35] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid #111111" }}
                />
              )}
            </div>
            <span style={{
              fontSize: 10,
              fontFamily: font,
              fontWeight: node.active ? 700 : 400,
              color: node.done ? "#065f46" : node.active ? "#111111" : "#c4c9d4",
            }}>
              {node.label}
            </span>
          </motion.div>
          {i < nodes.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1 + 0.1, duration: 0.3, ease: "easeOut" }}
              style={{
                width: 28,
                height: 2,
                backgroundColor: node.done ? "#10b981" : "#e9e9e9",
                flexShrink: 0,
                transformOrigin: "left center",
                marginBottom: 20,
              }}
            />
          )}
        </div>
      ))}
    </motion.div>
  );
}

export default function ScreenInterstitial({ visual, headline, body }: ScreenInterstitialProps) {
  const Visual = visual === "trade" ? TradeVisual : PathVisual;

  return (
    // Same vertical centering as Welcome — pt-[117px] pattern
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        paddingTop: 80,
        paddingBottom: 120,
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
          gap: 36,
          textAlign: "center",
        }}
      >
        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ minHeight: 80, display: "flex", alignItems: "center" }}
        >
          <Visual />
        </motion.div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: serif,
              fontSize: 28,
              fontWeight: 600,
              color: "#111111",
              letterSpacing: "-0.01em",
              lineHeight: 1.18,
              margin: 0,
            }}
          >
            {headline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28, delay: 0.2 }}
            style={{
              fontFamily: font,
              fontSize: 15,
              color: "#6b7280",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {body}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
