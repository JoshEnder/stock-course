"use client";

import { motion } from "framer-motion";
import { useState, useCallback } from "react";

interface PressureSliderProps {
  startBuyers?: number;
  startSellers?: number;
  startPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  onReadyChange?: (ready: boolean) => void;
}

export function PressureSlider({
  startBuyers = 10847,
  startSellers = 2103,
  startPrice = 142,
  minPrice = 133,
  maxPrice = 151,
  onReadyChange,
}: PressureSliderProps) {
  const [balance, setBalance] = useState(0.5); // 0 = all sellers, 1 = all buyers
  const [hasHitBothExtremes, setHasHitBothExtremes] = useState({
    high: false,
    low: false,
  });

  const buyers = Math.round(startBuyers * balance);
  const sellers = Math.round(startSellers * (1 - balance) * 2.5 + 300);
  const price = +(minPrice + (maxPrice - minPrice) * balance).toFixed(2);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value) / 100;
      setBalance(val);
      setHasHitBothExtremes((prev) => {
        const updated = { ...prev };
        if (val > 0.88) updated.high = true;
        if (val < 0.12) updated.low = true;
        if (updated.high && updated.low) {
          onReadyChange?.(true);
        }
        return updated;
      });
    },
    [onReadyChange],
  );

  const buyerHeight = `${30 + balance * 70}%`;
  const sellerHeight = `${30 + (1 - balance) * 70}%`;
  const isBuyerDominant = balance > 0.55;
  const isSellerDominant = balance < 0.45;

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      {/* Price display */}
      <div className="mb-5 text-center">
        <motion.div
          key={Math.floor(price * 2)}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-[42px] font-black tabular-nums ${
            isBuyerDominant
              ? "text-emerald-600"
              : isSellerDominant
                ? "text-red-500"
                : "text-slate-700"
          }`}
        >
          ${price.toFixed(2)}
        </motion.div>
        <p className="text-xs font-semibold text-slate-400">
          {isBuyerDominant
            ? "↑ Upward pressure"
            : isSellerDominant
              ? "↓ Downward pressure"
              : "→ Balanced"}
        </p>
      </div>

      {/* Bar visualization */}
      <div className="mb-6 flex items-end justify-center gap-6">
        {/* Buyers bar */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="relative flex w-20 items-end justify-center overflow-hidden rounded-xl bg-slate-100"
            style={{ height: 100 }}
          >
            <motion.div
              className="w-full rounded-xl bg-emerald-400"
              animate={{ height: buyerHeight }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
            />
          </div>
          <p className="text-xs font-bold text-emerald-600">
            BUYERS
          </p>
          <p className="text-[11px] tabular-nums text-slate-500">
            {buyers.toLocaleString()}
          </p>
        </div>

        {/* VS divider */}
        <div className="mb-8 text-sm font-black text-slate-300">VS</div>

        {/* Sellers bar */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="relative flex w-20 items-end justify-center overflow-hidden rounded-xl bg-slate-100"
            style={{ height: 100 }}
          >
            <motion.div
              className="w-full rounded-xl bg-red-400"
              animate={{ height: sellerHeight }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
            />
          </div>
          <p className="text-xs font-bold text-red-500">
            SELLERS
          </p>
          <p className="text-[11px] tabular-nums text-slate-500">
            {sellers.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Slider */}
      <div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(balance * 100)}
          onChange={handleChange}
          className="w-full"
          style={{
            cursor: "pointer",
            accentColor: isBuyerDominant
              ? "#22c55e"
              : isSellerDominant
                ? "#ef4444"
                : "#94a3b8",
          }}
        />
        <div className="mt-1.5 flex justify-between text-[10px] font-bold text-slate-400">
          <span>← More sellers</span>
          <span>More buyers →</span>
        </div>
      </div>

      {/* Hint */}
      {!(hasHitBothExtremes.high && hasHitBothExtremes.low) && (
        <p className="mt-3 text-center text-[11px] text-slate-400">
          Drag both directions to see the full picture →
        </p>
      )}
    </div>
  );
}
