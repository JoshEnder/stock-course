"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef } from "react";

export interface PredictRound {
  headline: string;
  direction: "up" | "down" | "flat";
  magnitude: number;
  correctExplanation: string;
  wrongExplanation: string;
}

interface PredictThenRevealProps {
  rounds: PredictRound[];
  onReadyChange?: (ready: boolean) => void;
}

type Prediction = "up" | "down" | "flat";

function MiniChart({
  direction,
  magnitude,
}: {
  direction: "up" | "down" | "flat";
  magnitude: number;
}) {
  const color =
    direction === "up"
      ? "#22c55e"
      : direction === "down"
        ? "#ef4444"
        : "#94a3b8";

  const label =
    direction === "up"
      ? `+${magnitude}%`
      : direction === "down"
        ? `-${magnitude}%`
        : `±${magnitude}%`;

  const path =
    direction === "up"
      ? "M0,72 C30,68 60,55 90,40 C120,26 150,16 200,8"
      : direction === "down"
        ? "M0,8 C30,14 60,28 90,44 C120,58 150,68 200,74"
        : "M0,42 C40,38 80,46 120,40 C160,34 180,44 200,42";

  return (
    <div className="relative">
      <svg viewBox="0 0 200 80" className="w-full" style={{ height: 80 }}>
        {/* Fill */}
        <motion.path
          d={`${path} L200,80 L0,80 Z`}
          fill={color}
          fillOpacity={0.08}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        />
        {/* Line */}
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        />
        {/* End dot */}
        <motion.circle
          cx={200}
          cy={direction === "up" ? 8 : direction === "down" ? 74 : 42}
          r={4}
          fill={color}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.85 }}
        />
      </svg>
      {/* Percentage badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.92, type: "spring", stiffness: 260 }}
        className="absolute right-1 top-1 rounded-lg px-2 py-0.5 text-sm font-black"
        style={{ background: `${color}22`, color }}
      >
        {label}
      </motion.div>
    </div>
  );
}

export function PredictThenReveal({ rounds, onReadyChange }: PredictThenRevealProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const round = rounds[roundIndex];
  const isLastRound = roundIndex === rounds.length - 1;
  const isCorrect = prediction === round?.direction;

  const handlePredict = useCallback(
    (p: Prediction) => {
      if (prediction !== null) return;
      setPrediction(p);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setRevealed(true), 680);
    },
    [prediction],
  );

  const handleNext = useCallback(() => {
    if (isLastRound) {
      onReadyChange?.(true);
      return;
    }
    setCorrectCount((c) => (isCorrect ? c + 1 : c));
    setPrediction(null);
    setRevealed(false);
    setRoundIndex((r) => r + 1);
  }, [isLastRound, isCorrect, onReadyChange]);

  if (!round) return null;

  return (
    <div className="overflow-hidden rounded-[20px] bg-white ring-1 ring-slate-200">
      {/* Breaking news header */}
      <motion.div
        key={`header-${roundIndex}`}
        initial={{ y: -36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="flex items-center gap-2.5 bg-red-600 px-4 py-2.5"
      >
        <span className="animate-pulse rounded bg-white px-1.5 py-0.5 text-[10px] font-black text-red-600">
          LIVE
        </span>
        <span className="text-[11px] font-black tracking-widest text-white">
          BREAKING NEWS
        </span>
        <span className="ml-auto text-[11px] font-semibold text-red-300">
          {roundIndex + 1} / {rounds.length}
        </span>
      </motion.div>

      <div className="p-5">
        {/* Headline */}
        <motion.p
          key={`headline-${roundIndex}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-5 text-base font-bold leading-snug text-slate-100"
        >
          {round.headline}
        </motion.p>

        {/* Prediction buttons */}
        <AnimatePresence mode="wait">
          {prediction === null && (
            <motion.div
              key="predict-buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="grid grid-cols-3 gap-2"
            >
              {(
                [
                  { dir: "up" as const, label: "UP", emoji: "↑" },
                  { dir: "down" as const, label: "DOWN", emoji: "↓" },
                  { dir: "flat" as const, label: "FLAT", emoji: "→" },
                ] as const
              ).map(({ dir, label, emoji }) => (
                <button
                  key={dir}
                  onClick={() => handlePredict(dir)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-100 py-4 font-black text-slate-700 transition-transform active:scale-95"
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-[11px] tracking-wide">{label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Locked prediction badge + tension window */}
        {prediction !== null && !revealed && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 space-y-3"
          >
            <div className="rounded-xl bg-slate-100 py-3 text-center">
              <span className="text-xs text-slate-500">Locked in: </span>
              <span className="font-black text-slate-800">
                {prediction === "up" ? "↑ UP" : prediction === "down" ? "↓ DOWN" : "→ FLAT"}
              </span>
            </div>
            {/* Tension bar */}
            <div className="overflow-hidden rounded-full bg-slate-100" style={{ height: 3 }}>
              <motion.div
                className="h-full rounded-full bg-emerald-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.65, ease: "linear" }}
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-slate-300"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
                  transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Chart + feedback reveal */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="space-y-4"
            >
              {/* Chart */}
              <div className="overflow-hidden rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <MiniChart direction={round.direction} magnitude={round.magnitude} />
              </div>

              {/* Feedback */}
              <div
                className={`rounded-xl p-4 ${
                  isCorrect ? "bg-emerald-50" : "bg-slate-50"
                }`}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className={`text-sm font-black ${
                      isCorrect ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {isCorrect ? "Right." : "Markets said:"}
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {round.direction === "up"
                      ? "↑ Up"
                      : round.direction === "down"
                        ? "↓ Down"
                        : "→ Flat"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-500">
                  {isCorrect ? round.correctExplanation : round.wrongExplanation}
                </p>
              </div>

              {/* Next */}
              <button
                onClick={handleNext}
                className="w-full rounded-2xl py-3.5 text-sm font-black text-white transition-transform active:scale-95"
                style={{ background: "#22c55e", boxShadow: "0 3px 0 #16a34a" }}
              >
                {isLastRound ? "See the pattern →" : "Next →"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
