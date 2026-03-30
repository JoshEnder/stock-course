"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

interface OwnershipGridProps {
  company?: string;
  totalShares?: number;
  yourShares?: number;
  onReadyChange?: (ready: boolean) => void;
}

const COLS = 40;
const ROWS = 25;
const TOTAL = COLS * ROWS; // 1000 dots

export function OwnershipGrid({
  company = "Nike",
  totalShares = 1_500_000_000,
  yourShares = 1,
  onReadyChange,
}: OwnershipGridProps) {
  const [expanded, setExpanded] = useState(false);
  const [stamped, setStamped] = useState(false);
  const [zoomed, setZoomed] = useState(false); // false = close-up, true = full grid

  const handleDotTap = useCallback(() => {
    setExpanded(true);
    setTimeout(() => setStamped(true), 480);
    setTimeout(() => onReadyChange?.(true), 1300);
  }, [onReadyChange]);

  const handleZoomToggle = useCallback(() => {
    setZoomed((z) => !z);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-white p-5 select-none ring-1 ring-slate-200">
      {/* Scroll hint */}
      <p className="mb-3 text-center text-[11px] font-semibold tracking-wide text-slate-500">
        {zoomed
          ? "Tap the glowing dot to claim your share"
          : "Scroll ↕ to see the full scale"}
      </p>

      {/* Dot grid with zoom */}
      <motion.div
        animate={{ scale: zoomed ? 1 : 1.85 }}
        transition={{ type: "spring", stiffness: 130, damping: 22 }}
        style={{ transformOrigin: "top left" }}
        onWheel={handleZoomToggle}
        onTouchEnd={handleZoomToggle}
        className="cursor-pointer"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: 3,
            maxWidth: 318,
            margin: "0 auto",
          }}
        >
          {Array.from({ length: TOTAL }).map((_, i) => {
            if (i === 0) {
              return (
                <motion.button
                  key={0}
                  onClick={handleDotTap}
                  animate={{
                    scale: [1, 1.6, 1],
                    boxShadow: [
                      "0 0 0px 0px rgba(251,191,36,0)",
                      "0 0 12px 5px rgba(251,191,36,0.75)",
                      "0 0 0px 0px rgba(251,191,36,0)",
                    ],
                  }}
                  transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-full border-0 p-0"
                  style={{ width: 8, height: 8, background: "#fbbf24", cursor: "pointer" }}
                  aria-label="Your share — tap to claim ownership"
                />
              );
            }
            return (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: i % 11 === 0 ? "#cbd5e1" : "#e2e8f0",
                }}
              />
            );
          })}
        </div>
      </motion.div>

      {/* YOU label pinned near dot position */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pointer-events-none absolute font-black text-amber-400"
        style={{ top: 54, left: 26, fontSize: 9, letterSpacing: "0.12em" }}
      >
        YOU ↑
      </motion.span>

      {/* Stats below grid */}
      <div className="mt-5 space-y-1 text-center">
        <p className="text-xs text-slate-500">
          {company} has {totalShares.toLocaleString()} shares. You own {yourShares}.
        </p>
        <p className="text-[11px] text-slate-400">Tiny? Yes. Real? Also yes.</p>
      </div>

      {/* Expanded card — animates over the entire component */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.84, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 230, damping: 22 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[20px] bg-white p-8"
          >
            {/* Pulsing gold dot */}
            <motion.div
              animate={{
                scale: [1, 1.22, 1],
                boxShadow: [
                  "0 0 0px rgba(251,191,36,0)",
                  "0 0 28px rgba(251,191,36,0.55)",
                  "0 0 0px rgba(251,191,36,0)",
                ],
              }}
              transition={{ duration: 1.7, repeat: Infinity }}
              className="rounded-full bg-amber-400"
              style={{ width: 38, height: 38 }}
            />

            <h3 className="text-center text-[22px] font-black leading-tight text-slate-900">
              Your shares: {yourShares}
            </h3>
            <p className="text-center text-[15px] leading-relaxed text-slate-500">
              What you own: a fraction of every store, every shoe, every deal.
            </p>
            <p className="text-center text-[15px] font-bold text-slate-900">
              That's what a stock is.
            </p>

            {/* SHAREHOLDER stamp */}
            <AnimatePresence>
              {stamped && (
                <motion.div
                  initial={{ opacity: 0, scale: 1.9, rotate: -22 }}
                  animate={{ opacity: 1, scale: 1, rotate: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 16 }}
                  className="mt-1 rounded-lg border-[3px] border-emerald-500 px-5 py-2"
                  style={{ transform: "rotate(-8deg)" }}
                >
                  <span className="text-[20px] font-black tracking-[0.18em] text-emerald-600">
                    SHAREHOLDER
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
