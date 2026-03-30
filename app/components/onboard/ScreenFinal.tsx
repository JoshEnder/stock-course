"use client";

import { motion } from "framer-motion";
import StokedMark from "./StokedMark";
import { CONTENT_W } from "./OnboardShell";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
const serif = "var(--font-cormorant,'Cormorant Garamond',Georgia,serif)";

interface ScreenFinalProps {
  ctaHref: string;
}

const NODES = [
  { label: "Price Basics", sub: "Completed", done: true },
  { label: "Earnings Moves", sub: "Up next", active: true },
  { label: "Fed Decisions", sub: "Unlocks after", locked: true },
  { label: "Chart Patterns", sub: "Coming soon", locked: true },
];

export default function ScreenFinal({ ctaHref: _ctaHref }: ScreenFinalProps) {
  // The CTA is in the shell; this screen just shows the content.
  // The actual href is passed via the shell's cta prop.
  return (
    // Centered, like Welcome — vertically balanced
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        paddingTop: 60,
        paddingBottom: 130,
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
          gap: 0,
        }}
      >
        {/* Large mark with checkmark badge */}
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ position: "relative", marginBottom: 28 }}
        >
          <StokedMark size={96} pulse />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.35, delay: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "#111111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2.5px solid #ffffff",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ✓
          </motion.div>
        </motion.div>

        {/* Headline — Cormorant, prominent */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: serif,
            fontSize: 32,
            fontWeight: 600,
            color: "#111111",
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            margin: "0 0 10px",
            textAlign: "center",
          }}
        >
          Your path is ready.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.32 }}
          style={{
            fontFamily: font,
            fontSize: 14,
            color: "#6b7280",
            lineHeight: 1.6,
            margin: "0 0 32px",
            textAlign: "center",
            maxWidth: 260,
          }}
        >
          Built around where you are. Every lesson is a real market decision.
        </motion.p>

        {/* Path card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "100%",
            backgroundColor: "#f9f9f8",
            borderRadius: 16,
            padding: "20px 20px 22px",
          }}
        >
          {/* Connecting track */}
          <div style={{ position: "relative", marginBottom: 0 }}>
            {/* Background rail */}
            <div
              style={{
                position: "absolute",
                top: 16,
                left: "calc(12.5% + 4px)",
                right: "calc(12.5% + 4px)",
                height: 2,
                backgroundColor: "#e9e9e9",
                zIndex: 0,
              }}
            />
            {/* Green fill (first segment) */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: 16,
                left: "calc(12.5% + 4px)",
                width: "calc(25% - 8px)",
                height: 2,
                backgroundColor: "#10b981",
                transformOrigin: "left center",
                zIndex: 0,
              }}
            />

            {/* Nodes grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${NODES.length}, 1fr)`,
                position: "relative",
                zIndex: 1,
              }}
            >
              {NODES.map((node, i) => (
                <motion.div
                  key={node.label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: node.locked ? 0.28 : 1 }}
                  transition={{
                    scale: { delay: 0.48 + i * 0.07, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
                    opacity: { delay: 0.48 + i * 0.07, duration: 0.2 },
                  }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}
                >
                  {/* Node dot */}
                  <div
                    style={{
                      width: node.active ? 32 : 24,
                      height: node.active ? 32 : 24,
                      borderRadius: "50%",
                      backgroundColor: node.done ? "#10b981" : node.active ? "#111111" : "#e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: node.done || node.active ? "#fff" : "#c4c9d4",
                      fontSize: 11,
                      fontWeight: 700,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    {node.done ? "✓" : node.active ? "→" : "·"}
                    {node.active && (
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.35, 0, 0.35] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid #111111" }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 10,
                        fontWeight: node.active ? 700 : 500,
                        color: node.done ? "#065f46" : node.active ? "#111111" : "#c4c9d4",
                        lineHeight: 1.3,
                      }}
                    >
                      {node.label}
                    </div>
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 9,
                        fontWeight: 600,
                        color: node.done ? "#6ee7b7" : node.active ? "#10b981" : "transparent",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        marginTop: 2,
                      }}
                    >
                      {node.sub}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
