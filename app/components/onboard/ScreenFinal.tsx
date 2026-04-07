"use client";

import { motion } from "framer-motion";
import { CONTENT_W } from "./OnboardShell";

const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

interface ScreenFinalProps {
  ctaHref: string;
}

const NODES = [
  { label: "Price Basics",   sub: "Completed",      done: true },
  { label: "Earnings Moves", sub: "Up next",        active: true },
  { label: "Fed Decisions",  sub: "Unlocks after",  locked: true },
  { label: "Chart Patterns", sub: "Coming soon",    locked: true },
];

export default function ScreenFinal({ ctaHref: _ctaHref }: ScreenFinalProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "100%",
        paddingTop: 56,
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
        }}
      >
        {/* Summit mark — subtle, modern ───────────────────────────────── */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ position: "relative", marginBottom: 32 }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              backgroundColor: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 8px 32px rgba(16,185,129,0.28), 0 2px 8px rgba(16,185,129,0.18)",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.22, 0, 0.22] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "1.5px solid #10b981",
              pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* Overline ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{
            fontFamily: font,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#10b981",
            marginBottom: 16,
          }}
        >
          Your path is ready
        </motion.div>

        {/* Headline ──────────────────────────────────────────────────── */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: font,
            fontSize: "clamp(32px, 3.8vw, 44px)",
            fontWeight: 600,
            color: "#0a0a0a",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: "0 0 14px",
            textAlign: "center",
            maxWidth: 380,
          }}
        >
          Built for where you are.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.36, delay: 0.36 }}
          style={{
            fontFamily: font,
            fontSize: 15,
            color: "#6b7280",
            lineHeight: 1.6,
            margin: "0 0 40px",
            textAlign: "center",
            maxWidth: 340,
            letterSpacing: "-0.005em",
          }}
        >
          Four modules, shaped by your answers. Your climb starts now.
        </motion.p>

        {/* Roadmap card — larger, more confident ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "100%",
            backgroundColor: "#fafaf9",
            border: "1px solid #ececeb",
            borderRadius: 18,
            padding: "28px 24px 30px",
          }}
        >
          {/* Card label */}
          <div style={{
            fontFamily: font,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#9ca3af",
            marginBottom: 22,
            textAlign: "left",
          }}>
            Your Roadmap · 4 Modules
          </div>

          {/* Track + nodes */}
          <div style={{ position: "relative" }}>
            {/* Background rail */}
            <div
              style={{
                position: "absolute",
                top: 20,
                left: "calc(12.5% + 5px)",
                right: "calc(12.5% + 5px)",
                height: 2,
                backgroundColor: "#ececeb",
                zIndex: 0,
                borderRadius: 2,
              }}
            />
            {/* Green fill */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.68, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                top: 20,
                left: "calc(12.5% + 5px)",
                width: "calc(25% - 10px)",
                height: 2,
                background: "linear-gradient(90deg, #10b981, #34d399)",
                transformOrigin: "left center",
                zIndex: 0,
                borderRadius: 2,
              }}
            />

            {/* Nodes */}
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
                  animate={{ scale: 1, opacity: node.locked ? 0.36 : 1 }}
                  transition={{
                    scale: { delay: 0.58 + i * 0.08, duration: 0.34, ease: [0.34, 1.56, 0.64, 1] },
                    opacity: { delay: 0.58 + i * 0.08, duration: 0.24 },
                  }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
                >
                  <div
                    style={{
                      width: node.active ? 42 : 34,
                      height: node.active ? 42 : 34,
                      borderRadius: "50%",
                      backgroundColor: node.done ? "#10b981" : node.active ? "#111111" : "#e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: node.done || node.active ? "#fff" : "#c4c9d4",
                      fontSize: 13,
                      fontWeight: 700,
                      position: "relative",
                      flexShrink: 0,
                      marginTop: node.active ? -4 : 0,
                      border: node.active ? "3px solid #ffffff" : "none",
                      boxShadow: node.active ? "0 0 0 1.5px #111111, 0 4px 12px rgba(0,0,0,0.15)" : "none",
                    }}
                  >
                    {node.done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : node.active ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    ) : "·"}
                    {node.active && (
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2.4, repeat: Infinity }}
                        style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "2px solid #111111" }}
                      />
                    )}
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 11,
                        fontWeight: node.active ? 700 : 600,
                        color: node.done ? "#065f46" : node.active ? "#111111" : "#c4c9d4",
                        lineHeight: 1.3,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {node.label}
                    </div>
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 9,
                        fontWeight: 700,
                        color: node.done ? "#10b981" : node.active ? "#10b981" : "#d4d4d3",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginTop: 4,
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

        {/*
          ── ZOOM VIDEO HANDOFF ────────────────────────────────────────────
          When the user taps "Begin Your Ascent", handleFinish() fires in
          OnboardingContainer (saves quiz data, queues login gate, pushes
          to /course). Before that push, this is where the cinematic
          mountain-zoom video reveal should play.

          To wire it in:
          1. Add a `<video>` here (or a full-screen overlay) that autoplays
             the zoom clip when this screen is active.
          2. Delay the router.push("/course") until the clip ends — pass
             a callback down from OnboardingContainer via a new prop, or
             have ScreenFinal manage its own "playing" state.
          3. The CTA ("Begin Your Ascent") triggers the video; the video
             triggers the navigation on end.

          For now this slot is intentionally empty — the flow is structured
          and ready for the handoff.
          ────────────────────────────────────────────────────────────────── */}

      </div>
    </div>
  );
}
