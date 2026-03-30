"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";

interface Order {
  id: string;
  price: number;
  size: number;
}

interface LiveOrderBookProps {
  startPrice?: number;
  contextBanner?: string;
  priceTarget?: number;
  buyConsequence?: string;
  waitConsequence?: string;
  onReadyChange?: (ready: boolean) => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function LiveOrderBook({
  startPrice = 142,
  contextBanner = "Record quarterly earnings just announced. Orders flooding in.",
  priceTarget = 146,
  buyConsequence = "Filled at ${price}. You're in.",
  waitConsequence = "Price kept climbing. Both choices teach something.",
  onReadyChange,
}: LiveOrderBookProps) {
  const [price, setPrice] = useState(startPrice);
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [choice, setChoice] = useState<"buy" | "wait" | null>(null);
  const [filledAt, setFilledAt] = useState<number | null>(null);
  const priceRef = useRef(startPrice);

  // Keep ref in sync for use inside intervals
  useEffect(() => {
    priceRef.current = price;
  }, [price]);

  // Climb price toward target
  useEffect(() => {
    if (choice) return;
    const id = setInterval(() => {
      setPrice((p) => {
        const next = +(p + 0.12 + Math.random() * 0.22).toFixed(2);
        return next >= priceTarget ? priceTarget : next;
      });
    }, 270);
    return () => clearInterval(id);
  }, [choice, priceTarget]);

  // Generate BUY orders — fast and overwhelming
  useEffect(() => {
    if (choice) return;
    const id = setInterval(() => {
      setBuyOrders((prev) => [
        {
          id: uid(),
          price: +(priceRef.current + Math.random() * 0.35).toFixed(2),
          size: Math.floor(120 + Math.random() * 780),
        },
        ...prev.slice(0, 7),
      ]);
    }, 175);
    return () => clearInterval(id);
  }, [choice]);

  // Generate SELL orders — sparse and slow
  useEffect(() => {
    if (choice) return;
    const id = setInterval(() => {
      setSellOrders((prev) => [
        {
          id: uid(),
          price: +(priceRef.current + 0.35 + Math.random() * 0.55).toFixed(2),
          size: Math.floor(12 + Math.random() * 55),
        },
        ...prev.slice(0, 3),
      ]);
    }, 920);
    return () => clearInterval(id);
  }, [choice]);

  // Staggered reveals
  useEffect(() => {
    const t1 = setTimeout(() => setShowBanner(true), 1600);
    const t2 = setTimeout(() => setShowChoice(true), 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleChoice = useCallback(
    (c: "buy" | "wait") => {
      setFilledAt(priceRef.current);
      setChoice(c);
      onReadyChange?.(true);
    },
    [onReadyChange],
  );

  const resolvedBuyConsequence = buyConsequence.replace(
    "${price}",
    filledAt?.toFixed(2) ?? "",
  );

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-slate-950">
      {/* Breaking banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="flex flex-col items-center bg-red-600 px-4 py-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="animate-pulse rounded bg-white px-1.5 py-0.5 text-[10px] font-black text-red-600">
                LIVE
              </span>
              <span className="text-[11px] font-black tracking-widest text-white">
                BREAKING NEWS
              </span>
            </div>
            <p className="mt-0.5 text-center text-[11px] font-semibold text-red-100">
              {contextBanner}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5">
        {/* Price ticker */}
        <div className="mb-5 text-center">
          <motion.div
            key={Math.floor(price * 10)}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="text-[44px] font-black tabular-nums text-emerald-400"
          >
            ${price.toFixed(2)}
          </motion.div>
          <div className="text-xs font-bold text-emerald-700">↑ climbing</div>
        </div>

        {/* Order book */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          {/* Buy side */}
          <div>
            <div className="mb-2 text-center text-[11px] font-black tracking-widest text-emerald-400">
              BUY
            </div>
            <div className="space-y-1 overflow-hidden" style={{ maxHeight: 130 }}>
              {buyOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.16 }}
                  className="flex justify-between rounded-lg bg-emerald-950 px-2.5 py-1"
                >
                  <span className="text-[11px] font-bold tabular-nums text-emerald-300">
                    ${order.price.toFixed(2)}
                  </span>
                  <span className="text-[11px] tabular-nums text-emerald-800">
                    {order.size}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sell side */}
          <div>
            <div className="mb-2 text-center text-[11px] font-black tracking-widest text-red-400">
              SELL
            </div>
            <div className="space-y-1 overflow-hidden" style={{ maxHeight: 130 }}>
              {sellOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.22 }}
                  className="flex justify-between rounded-lg bg-red-950 px-2.5 py-1"
                >
                  <span className="text-[11px] font-bold tabular-nums text-red-300">
                    ${order.price.toFixed(2)}
                  </span>
                  <span className="text-[11px] tabular-nums text-red-900">
                    {order.size}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Choice prompt */}
        <AnimatePresence>
          {showChoice && !choice && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="mb-3 text-center text-sm font-bold text-slate-200">
                You see the price rising. What do you do?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleChoice("buy")}
                  className="rounded-2xl bg-emerald-500 py-3.5 text-sm font-black text-white transition-transform active:scale-95"
                >
                  BUY
                </button>
                <button
                  onClick={() => handleChoice("wait")}
                  className="rounded-2xl bg-slate-700 py-3.5 text-sm font-black text-slate-200 transition-transform active:scale-95"
                >
                  WAIT
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Outcome */}
        <AnimatePresence>
          {choice && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-slate-800 p-4 text-center"
            >
              {choice === "buy" ? (
                <>
                  <p className="text-sm font-black text-emerald-400">
                    {resolvedBuyConsequence}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Buyers flooded in. Sellers stayed back. Price moved.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-black text-amber-400">
                    {waitConsequence}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    Waiting is a decision too. Both choices teach market psychology.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
