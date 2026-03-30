"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface SplitSide {
  label: string;
  description: string;
  example: string;
}

interface DividendVsGainSplitProps {
  left: SplitSide;
  right: SplitSide;
  onReadyChange?: (ready: boolean) => void;
}

function CoinRain({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-base"
          style={{ left: `${15 + i * 14}%` }}
          initial={{ y: -20, opacity: 0 }}
          animate={
            active
              ? { y: ["0%", "120%"], opacity: [0, 1, 1, 0] }
              : { opacity: 0 }
          }
          transition={
            active
              ? { duration: 1.6, delay: i * 0.22, repeat: Infinity, ease: "easeIn" }
              : {}
          }
        >
          🪙
        </motion.div>
      ))}
    </div>
  );
}

function PriceLineAnim({ active }: { active: boolean }) {
  const points = [40, 42, 38, 45, 48, 44, 52, 56, 53, 61, 58, 65];
  const w = 120;
  const h = 48;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const toY = (v: number) => h - ((v - min) / range) * (h - 8) - 4;

  const d = points.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${toY(v)}`).join(" ");

  return (
    <div className="flex items-center justify-center">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <motion.path
          d={d}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeOut", repeat: active ? Infinity : 0, repeatDelay: 1.4 }}
        />
        {active && (
          <motion.circle
            cx={points.length > 0 ? (points.length - 1) * step : 0}
            cy={toY(points[points.length - 1])}
            r={4}
            fill="#22c55e"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.3 }}
          />
        )}
      </svg>
    </div>
  );
}

export function DividendVsGainSplit({ left, right, onReadyChange }: DividendVsGainSplitProps) {
  const [expanded, setExpanded] = useState<"left" | "right" | null>(null);
  const [seen, setSeen] = useState<Set<"left" | "right">>(new Set());
  const [animActive, setAnimActive] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const allSeen = seen.has("left") && seen.has("right");

  useEffect(() => {
    onReadyChange?.(allSeen);
  }, [allSeen, onReadyChange]);

  function handleTap(side: "left" | "right") {
    setSeen((prev) => new Set([...prev, side]));
    setExpanded((prev) => (prev === side ? null : side));
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAnimActive(true), 100);
  }

  return (
    <div className="rounded-[20px] bg-white p-4 ring-1 ring-slate-200">
      {/* Header */}
      <p className="mb-3 text-center text-[11px] font-bold tracking-widest uppercase text-slate-400">
        Same stock. Two different return types.
      </p>

      {/* Split */}
      <div className="grid grid-cols-2 gap-3">
        {/* LEFT — DIVIDEND */}
        <motion.button
          type="button"
          onClick={() => handleTap("left")}
          whileTap={{ scale: 0.97 }}
          className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all ${
            seen.has("left")
              ? "border-amber-300 bg-amber-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <CoinRain active={animActive} />
          <div className="relative">
            <p className="text-[10px] font-black tracking-widest uppercase text-amber-600 mb-2">
              {left.label}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">{left.description}</p>

            <AnimatePresence>
              {expanded === "left" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2 rounded-lg bg-amber-100 px-2 py-1.5 text-[11px] text-amber-700">
                    {left.example}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {seen.has("left") && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-2 flex items-center gap-1 text-[10px] font-bold text-amber-600"
              >
                ✓ Got it
              </motion.span>
            )}
          </div>
        </motion.button>

        {/* RIGHT — PRICE GAIN */}
        <motion.button
          type="button"
          onClick={() => handleTap("right")}
          whileTap={{ scale: 0.97 }}
          className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all ${
            seen.has("right")
              ? "border-emerald-300 bg-emerald-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mb-2">
            <PriceLineAnim active={animActive} />
          </div>
          <p className="text-[10px] font-black tracking-widest uppercase text-emerald-600 mb-2">
            {right.label}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">{right.description}</p>

          <AnimatePresence>
            {expanded === "right" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="mt-2 rounded-lg bg-emerald-100 px-2 py-1.5 text-[11px] text-emerald-700">
                  {right.example}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {seen.has("right") && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600"
            >
              ✓ Got it
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Footer */}
      <AnimatePresence>
        {allSeen ? (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center text-[11px] font-bold text-emerald-700"
          >
            Two lanes. You'll never mix them up again.
          </motion.p>
        ) : (
          <motion.p exit={{ opacity: 0 }} className="mt-3 text-center text-[11px] text-slate-400">
            Tap each side to explore
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
