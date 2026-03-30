"use client";

import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";

export interface RapidFireCard {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
  correct: "A" | "B";
  explanation: string;
}

interface RapidFireStreakProps {
  cards: RapidFireCard[];
  streakLabel?: string;
  perfectReward?: string;
  onReadyChange?: (ready: boolean) => void;
}

function Confetti({ active }: { active: boolean }) {
  const pieces = [...Array(24)].map((_, i) => ({
    color: ["#22c55e", "#16a34a", "#4ade80", "#86efac", "#bbf7d0"][i % 5],
    x: (i / 24) * 100,
    delay: (i % 8) * 0.07,
    duration: 1.1 + (i % 4) * 0.15,
    rotation: (i * 47) % 360,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-sm"
          style={{ left: `${p.x}%`, top: -8, background: p.color }}
          initial={{ y: -8, opacity: 0, rotate: 0 }}
          animate={
            active
              ? { y: ["0%", "130%"], opacity: [0, 1, 1, 0], rotate: p.rotation }
              : { opacity: 0 }
          }
          transition={active ? { duration: p.duration, delay: p.delay, ease: "easeIn" } : {}}
        />
      ))}
    </div>
  );
}

function StreakPips({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[...Array(total)].map((_, i) => (
        <motion.div
          key={i}
          className="h-1.5 rounded-full"
          style={{ width: 20 }}
          animate={{
            backgroundColor: i < current ? "#22c55e" : "#e2e8f0",
            scale: i === current - 1 && current > 0 ? [1, 1.4, 1] : 1,
          }}
          transition={{ duration: 0.35, type: "tween", ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function RapidFireStreak({
  cards,
  streakLabel = "STREAK",
  perfectReward = "Perfect. You've got it locked.",
  onReadyChange,
}: RapidFireStreakProps) {
  const [cardIndex, setCardIndex] = useState(0);
  const [chosen, setChosen] = useState<"A" | "B" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controls = useAnimationControls();

  const card = cards[cardIndex];
  const isCorrect = chosen === card?.correct;
  const isPerfect = correctCount + (isCorrect ? 1 : 0) === cards.length;

  useEffect(() => {
    if (done) onReadyChange?.(true);
  }, [done, onReadyChange]);

  const handleChoose = useCallback(
    (choice: "A" | "B") => {
      if (chosen !== null) return;
      setChosen(choice);

      const correct = cards[cardIndex].correct === choice;
      if (!correct) {
        setWrongShake(true);
        controls.start({ x: [0, -10, 10, -8, 8, -4, 0], transition: { duration: 0.45 } });
        setTimeout(() => setWrongShake(false), 500);
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setRevealed(true), 600);
    },
    [chosen, cardIndex, cards, controls],
  );

  const handleNext = useCallback(() => {
    const correct = chosen === cards[cardIndex].correct;
    const newCorrect = correctCount + (correct ? 1 : 0);

    if (cardIndex === cards.length - 1) {
      setCorrectCount(newCorrect);
      setDone(true);
      if (newCorrect === cards.length) setShowConfetti(true);
      return;
    }

    setCorrectCount(newCorrect);
    setChosen(null);
    setRevealed(false);
    setCardIndex((i) => i + 1);
  }, [chosen, cardIndex, cards, correctCount]);

  if (done) {
    const perfect = correctCount === cards.length;
    return (
      <div className="relative overflow-hidden rounded-[20px] bg-white p-6 text-center ring-1 ring-slate-200">
        <Confetti active={showConfetti} />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className="relative"
        >
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
              perfect ? "bg-emerald-100" : "bg-slate-100"
            }`}
          >
            {perfect ? "⚡" : "✓"}
          </div>
          <p className={`mb-1 text-lg font-black ${perfect ? "text-emerald-600" : "text-slate-800"}`}>
            {perfect ? perfectReward : `${correctCount}/${cards.length} correct`}
          </p>
          {perfect && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs font-bold tracking-widest uppercase text-emerald-500"
            >
              {streakLabel} UNLOCKED
            </motion.p>
          )}
          {!perfect && (
            <p className="mt-1 text-xs text-slate-400">You know this. Review the ones you missed.</p>
          )}
        </motion.div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
          {streakLabel}
        </span>
        <div className="flex items-center gap-3">
          <StreakPips total={cards.length} current={correctCount} />
          <span className="text-[11px] font-bold text-slate-400">
            {cardIndex + 1}/{cards.length}
          </span>
        </div>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cardIndex}
          initial={{ opacity: 0, x: 32, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -32, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
        >
          <motion.div
            animate={controls}
            className="overflow-hidden rounded-[20px] bg-white ring-1 ring-slate-200"
          >
            {/* Prompt */}
            <div className="p-5 pb-4">
              <p className="text-base font-bold leading-snug text-slate-900">{card.prompt}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 px-4 pb-4">
              {(["A", "B"] as const).map((opt) => {
                const label = opt === "A" ? card.optionA : card.optionB;
                const isChosen = chosen === opt;
                const isRight = card.correct === opt;

                let className = "bg-slate-50 border-slate-200 text-slate-700";
                if (revealed) {
                  if (isRight) className = "bg-emerald-50 border-emerald-300 text-emerald-800";
                  else if (isChosen) className = "bg-red-50 border-red-300 text-red-700";
                } else if (isChosen) {
                  className = "bg-slate-100 border-slate-400 text-slate-900";
                }

                return (
                  <motion.button
                    key={opt}
                    type="button"
                    onClick={() => handleChoose(opt)}
                    disabled={chosen !== null}
                    whileTap={chosen === null ? { scale: 0.95 } : {}}
                    className={`relative rounded-2xl border-2 px-3 py-4 text-center text-sm font-bold transition-all ${className}`}
                  >
                    {revealed && isRight && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white"
                      >
                        ✓
                      </motion.span>
                    )}
                    {revealed && isChosen && !isRight && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-400 text-[10px] font-black text-white"
                      >
                        ✗
                      </motion.span>
                    )}
                    {label}
                  </motion.button>
                );
              })}
            </div>

            {/* Tension window */}
            <AnimatePresence>
              {chosen !== null && !revealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-slate-100 px-4 py-3"
                >
                  <div className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.55, repeat: Infinity }}
                      className="text-xs font-bold text-slate-400"
                    >
                      {wrongShake ? "Hmm..." : "Locked in..."}
                    </motion.span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-slate-300"
                          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reveal feedback */}
            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  className="border-t border-slate-100 px-4 pb-4 pt-3"
                >
                  <div className={`mb-3 rounded-xl px-3 py-2.5 ${isCorrect ? "bg-emerald-50" : "bg-slate-50"}`}>
                    <p className={`mb-0.5 text-[11px] font-black uppercase tracking-widest ${isCorrect ? "text-emerald-600" : "text-amber-600"}`}>
                      {isCorrect ? "Correct" : "Not quite"}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-500">{card.explanation}</p>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full rounded-2xl py-3 text-sm font-black text-white transition-transform active:scale-95"
                    style={{ background: "#22c55e", boxShadow: "0 3px 0 #16a34a" }}
                  >
                    {cardIndex === cards.length - 1 ? "Finish →" : "Next →"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
