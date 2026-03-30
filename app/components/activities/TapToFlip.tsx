"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";

export interface FlipCard {
  id: string;
  front: string;
  category: string;
  categoryColor: "amber" | "emerald" | "blue" | "violet";
  explanation: string;
}

interface TapToFlipProps {
  cards: FlipCard[];
  instruction?: string;
  onReadyChange?: (ready: boolean) => void;
}

const colorMap = {
  amber: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "bg-amber-500",
  },
  emerald: {
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    badge: "bg-emerald-500",
  },
  blue: {
    border: "border-blue-300",
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "bg-blue-500",
  },
  violet: {
    border: "border-violet-300",
    bg: "bg-violet-50",
    text: "text-violet-700",
    badge: "bg-violet-500",
  },
};

function FlipCardItem({ card, onFlipped }: { card: FlipCard; onFlipped: (id: string) => void }) {
  const [tapped, setTapped] = useState(false);
  const [tensing, setTensing] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const colors = colorMap[card.categoryColor];

  const handleTap = useCallback(() => {
    if (tapped) return;
    setTapped(true);
    setTensing(true);
    setTimeout(() => {
      setTensing(false);
      setFlipped(true);
      onFlipped(card.id);
    }, 650);
  }, [tapped, card.id, onFlipped]);

  return (
    <div style={{ perspective: 800 }}>
      <motion.div
        onClick={handleTap}
        whileTap={!tapped ? { scale: 0.97 } : {}}
        className="relative cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front face */}
        <div
          className="rounded-2xl border-2 border-slate-200 bg-white p-4"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-sm font-bold leading-snug text-slate-800">{card.front}</p>

          <AnimatePresence>
            {tensing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex items-center gap-2">
                  <motion.div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className="h-full rounded-full bg-emerald-400"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.6, ease: "linear" }}
                    />
                  </motion.div>
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-[10px] font-bold text-slate-400"
                  >
                    FILING...
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!tapped && (
            <p className="mt-2 text-[10px] font-bold tracking-widest uppercase text-slate-400">
              Tap to reveal
            </p>
          )}
        </div>

        {/* Back face */}
        <div
          className={`absolute inset-0 rounded-2xl border-2 p-4 ${colors.border} ${colors.bg}`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={flipped ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            className={`mb-2 inline-block rounded-lg px-2 py-0.5 text-[11px] font-black tracking-widest uppercase text-white ${colors.badge}`}
          >
            {card.category}
          </motion.span>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{card.explanation}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function TapToFlip({
  cards,
  instruction = "Tap each card to reveal what type of return it is",
  onReadyChange,
}: TapToFlipProps) {
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const allFlipped = flippedIds.size === cards.length;

  useEffect(() => {
    onReadyChange?.(allFlipped);
  }, [allFlipped, onReadyChange]);

  const handleFlipped = useCallback((id: string) => {
    setFlippedIds((prev) => new Set([...prev, id]));
  }, []);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-bold text-slate-400">{instruction}</p>
        <span className="text-[11px] font-bold text-slate-400">
          {flippedIds.size}/{cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 240, damping: 22 }}
          >
            <FlipCardItem card={card} onFlipped={handleFlipped} />
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <AnimatePresence>
        {allFlipped ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center"
          >
            <p className="text-sm font-bold text-emerald-700">
              Two lanes. Now you can tell them apart instantly.
            </p>
          </motion.div>
        ) : (
          <motion.p exit={{ opacity: 0 }} className="text-center text-[11px] text-slate-400">
            {cards.length - flippedIds.size} card{cards.length - flippedIds.size !== 1 ? "s" : ""} remaining
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
