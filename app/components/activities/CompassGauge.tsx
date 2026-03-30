"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

export interface CompassScenario {
  text: string;
  direction: "up" | "down" | "unclear";
  explanation: string;
}

interface CompassGaugeProps {
  scenarios: CompassScenario[];
  onReadyChange?: (ready: boolean) => void;
}

type UserGuess = "up" | "down" | "unclear";

const NEEDLE_ANGLES = { up: -65, down: 65, unclear: 0 } as const;
const COLORS = {
  up: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  down: { text: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  unclear: { text: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
};

function Needle({ angle }: { angle: number }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full max-w-[180px]">
      {/* Gauge arc */}
      <path
        d="M 20 90 A 50 50 0 0 1 100 90"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Colored segments */}
      <path
        d="M 20 90 A 50 50 0 0 1 40 51"
        fill="none"
        stroke="#22c55e"
        strokeWidth="8"
        strokeLinecap="round"
        opacity={0.5}
      />
      <path
        d="M 100 90 A 50 50 0 0 0 80 51"
        fill="none"
        stroke="#ef4444"
        strokeWidth="8"
        strokeLinecap="round"
        opacity={0.5}
      />

      {/* BUYERS label */}
      <text x="10" y="108" fontSize="7" fontWeight="800" fill="#22c55e" opacity={0.7}>
        BUYERS
      </text>
      {/* SELLERS label */}
      <text x="72" y="108" fontSize="7" fontWeight="800" fill="#ef4444" opacity={0.7}>
        SELLERS
      </text>

      {/* Needle pivot */}
      <g transform="translate(60, 90)">
        <motion.line
          x1="0"
          y1="4"
          x2="0"
          y2="-42"
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          style={{ transformOrigin: "0px 4px" }}
        />
      </g>
      <circle cx="60" cy="90" r="5" fill="#0f172a" />
    </svg>
  );
}

export function CompassGauge({ scenarios, onReadyChange }: CompassGaugeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guess, setGuess] = useState<UserGuess | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [previewAngle, setPreviewAngle] = useState<number | null>(null);

  const scenario = scenarios[currentIndex];
  const isLastScenario = currentIndex === scenarios.length - 1;
  const isCorrect = guess === scenario?.direction;
  const needleAngle =
    previewAngle !== null
      ? previewAngle
      : revealed && scenario
        ? NEEDLE_ANGLES[scenario.direction]
        : 0;

  const handleGuess = useCallback(
    (g: UserGuess) => {
      if (guess !== null) return;
      setGuess(g);
      setPreviewAngle(NEEDLE_ANGLES[g]);
      setTimeout(() => {
        setPreviewAngle(null);
        setRevealed(true);
      }, 600);
    },
    [guess],
  );

  const handleNext = useCallback(() => {
    if (isLastScenario) {
      onReadyChange?.(true);
      return;
    }
    setGuess(null);
    setRevealed(false);
    setPreviewAngle(null);
    setCurrentIndex((i) => i + 1);
  }, [isLastScenario, onReadyChange]);

  if (!scenario) return null;

  const colors = revealed ? COLORS[scenario.direction] : COLORS.unclear;

  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
      {/* Progress dots */}
      <div className="mb-4 flex justify-center gap-2">
        {scenarios.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all ${
              i < currentIndex
                ? "h-2 w-5 bg-emerald-400"
                : i === currentIndex
                  ? "h-2 w-5 bg-slate-900"
                  : "h-2 w-2 bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Needle */}
      <div className="mb-4 flex justify-center">
        <Needle angle={needleAngle} />
      </div>

      {/* Scenario text */}
      <motion.p
        key={currentIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 text-center text-sm font-bold leading-snug text-slate-800"
      >
        "{scenario.text}"
      </motion.p>

      {/* Guess buttons */}
      <AnimatePresence mode="wait">
        {guess === null && (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-2"
          >
            {(
              [
                { g: "up" as const, label: "UP", emoji: "↑" },
                { g: "unclear" as const, label: "UNCLEAR", emoji: "—" },
                { g: "down" as const, label: "DOWN", emoji: "↓" },
              ] as const
            ).map(({ g, label, emoji }) => (
              <button
                key={g}
                onClick={() => handleGuess(g)}
                className="flex flex-col items-center gap-1 rounded-2xl bg-slate-100 py-3.5 font-black text-slate-700 transition-transform active:scale-95"
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-[10px] tracking-wide">{label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal feedback */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div
              className={`rounded-2xl border-2 p-4 ${colors.bg} ${colors.border}`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className={`text-sm font-black ${colors.text}`}>
                  {isCorrect ? "Right." : "Answer:"}
                </span>
                <span className={`text-sm font-bold ${colors.text}`}>
                  {scenario.direction === "up"
                    ? "↑ Up"
                    : scenario.direction === "down"
                      ? "↓ Down"
                      : "→ Unclear"}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {scenario.explanation}
              </p>
            </div>
            <button
              onClick={handleNext}
              className="w-full rounded-2xl py-3.5 text-sm font-black text-white transition-transform active:scale-95"
              style={{ background: "#22c55e", boxShadow: "0 3px 0 #16a34a" }}
            >
              {isLastScenario ? "Got it →" : "Next scenario →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
