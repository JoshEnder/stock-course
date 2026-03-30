"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef } from "react";

interface PriceSliderLabProps {
  minPrice?: number;
  maxPrice?: number;
  initialBuy?: number;
  initialSell?: number;
  onReadyChange?: (ready: boolean) => void;
}

type Outcome = "gain" | "loss" | "breakeven";

function getOutcome(buy: number, sell: number): Outcome {
  if (sell > buy) return "gain";
  if (sell < buy) return "loss";
  return "breakeven";
}

const OUTCOME_CONFIG = {
  gain: {
    label: "GAIN",
    color: "#22c55e",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    prefix: "+",
  },
  loss: {
    label: "LOSS",
    color: "#ef4444",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    prefix: "-",
  },
  breakeven: {
    label: "BREAK-EVEN",
    color: "#94a3b8",
    bg: "bg-slate-50",
    text: "text-slate-500",
    border: "border-slate-200",
    prefix: "",
  },
};

export function PriceSliderLab({
  minPrice = 5,
  maxPrice = 55,
  initialBuy = 20,
  initialSell = 30,
  onReadyChange,
}: PriceSliderLabProps) {
  const [buy, setBuy] = useState(initialBuy);
  const [sell, setSell] = useState(initialSell);
  const [hasInteracted, setHasInteracted] = useState(false);
  const readyFired = useRef(false);

  const outcome = getOutcome(buy, sell);
  const diff = Math.abs(sell - buy);
  const config = OUTCOME_CONFIG[outcome];

  const handleBuyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBuy(Number(e.target.value));
      setHasInteracted(true);
      if (!readyFired.current) {
        readyFired.current = true;
        // Fire ready after they've felt both states
      }
    },
    [],
  );

  const handleSellChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSell(Number(e.target.value));
      setHasInteracted(true);
      if (!readyFired.current) {
        readyFired.current = true;
        onReadyChange?.(true);
      }
    },
    [onReadyChange],
  );

  const range = maxPrice - minPrice;
  const buyPct = ((buy - minPrice) / range) * 100;
  const sellPct = ((sell - minPrice) / range) * 100;

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      {/* P&L badge */}
      <motion.div
        key={`${outcome}-${diff}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`mb-5 rounded-2xl border-2 p-4 text-center ${config.bg} ${config.border}`}
      >
        <p className={`text-3xl font-black tabular-nums ${config.text}`}>
          {config.prefix}${diff.toFixed(0)}
        </p>
        <p
          className={`mt-1 text-sm font-black tracking-widest ${config.text}`}
        >
          {config.label}
        </p>

        {/* Outcome icon */}
        <motion.div
          key={outcome}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xl"
        >
          {outcome === "gain" ? "📈" : outcome === "loss" ? "📉" : "⚖️"}
        </motion.div>
      </motion.div>

      {/* Price track visual */}
      <div className="relative mb-6 h-2 rounded-full bg-slate-100">
        {/* Filled zone between buy and sell */}
        <div
          className={`absolute top-0 h-2 rounded-full transition-all ${
            outcome === "gain"
              ? "bg-emerald-400"
              : outcome === "loss"
                ? "bg-red-400"
                : "bg-slate-300"
          }`}
          style={{
            left: `${Math.min(buyPct, sellPct)}%`,
            width: `${Math.abs(sellPct - buyPct)}%`,
          }}
        />

        {/* BUY marker */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${buyPct}%` }}
        >
          <div className="h-5 w-5 rounded-full border-2 border-white bg-blue-500 shadow-md" />
        </div>

        {/* SELL marker */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${sellPct}%` }}
        >
          <div
            className={`h-5 w-5 rounded-full border-2 border-white shadow-md ${
              outcome === "gain"
                ? "bg-emerald-500"
                : outcome === "loss"
                  ? "bg-red-500"
                  : "bg-slate-400"
            }`}
          />
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        {/* BUY slider */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black tracking-wide text-blue-600">
              BUY
            </span>
            <span className="text-sm font-black tabular-nums text-slate-900">
              ${buy}
            </span>
          </div>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={buy}
            onChange={handleBuyChange}
            className="w-full accent-blue-500"
            style={{ cursor: "pointer" }}
          />
        </div>

        {/* SELL slider */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span
              className={`text-xs font-black tracking-wide ${
                outcome === "gain"
                  ? "text-emerald-600"
                  : outcome === "loss"
                    ? "text-red-600"
                    : "text-slate-500"
              }`}
            >
              SELL
            </span>
            <span className="text-sm font-black tabular-nums text-slate-900">
              ${sell}
            </span>
          </div>
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            value={sell}
            onChange={handleSellChange}
            className="w-full"
            style={{
              cursor: "pointer",
              accentColor:
                outcome === "gain"
                  ? "#22c55e"
                  : outcome === "loss"
                    ? "#ef4444"
                    : "#94a3b8",
            }}
          />
        </div>
      </div>

      {/* Coin animations */}
      <AnimatePresence>
        {hasInteracted && (
          <motion.div
            key={outcome}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center text-xs font-semibold text-slate-400"
          >
            {outcome === "gain"
              ? "Sell price is above buy price → gain"
              : outcome === "loss"
                ? "Sell price is below buy price → loss"
                : "Same price in and out → break-even"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
