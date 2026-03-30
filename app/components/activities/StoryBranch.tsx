"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

type BuyChoice = "all-in" | "half" | "watch";
type ConceptId = "capital-raising" | "dividends" | "gain-loss";
type Step = "intro" | "ipo" | "growth" | "dividend" | "crisis" | "outcome";

interface DashboardState {
  shares: number;
  cash: number;
  currentPrice: number;
  dividendsEarned: number;
  unlockedConcepts: ConceptId[];
}

interface StoryBranchProps {
  company?: string;
  startPrice?: number;
  startCash?: number;
  onReadyChange?: (ready: boolean) => void;
}

const CONCEPT_LABELS: Record<ConceptId, string> = {
  "capital-raising": "Capital Raising",
  dividends: "Dividends",
  "gain-loss": "Gain / Loss",
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function ConceptTag({ id, unlocked }: { id: ConceptId; unlocked: boolean }) {
  return (
    <motion.div
      animate={unlocked ? { scale: [1, 1.18, 1] } : {}}
      transition={{ duration: 0.38 }}
      className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
        unlocked
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      <span>{unlocked ? "✓" : "○"}</span>
      {CONCEPT_LABELS[id]}
    </motion.div>
  );
}

function Dashboard({
  company,
  state,
  buyPrice,
}: {
  company: string;
  state: DashboardState;
  buyPrice: number | null;
}) {
  const pl =
    buyPrice !== null && state.shares > 0
      ? (state.currentPrice - buyPrice) * state.shares
      : null;

  return (
    <motion.div
      layout
      className="mb-4 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900"
    >
      <div className="border-b border-slate-700 px-4 py-2">
        <span className="text-[11px] font-black tracking-widest text-slate-500">
          {company}
        </span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-slate-700">
        {[
          { label: "Price", value: `$${state.currentPrice.toFixed(2)}` },
          { label: "Shares", value: String(state.shares) },
          { label: "Cash", value: `$${state.cash.toFixed(2)}` },
          {
            label: "Dividends",
            value: `+$${state.dividendsEarned.toFixed(2)}`,
            accent: true,
          },
        ].map(({ label, value, accent }) => (
          <div key={label} className="px-4 py-3">
            <p className="text-[11px] text-slate-500">{label}</p>
            <p
              className={`text-lg font-black tabular-nums ${
                accent ? "text-emerald-400" : "text-slate-100"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
      {pl !== null && (
        <div
          className={`px-4 py-2 ${pl < 0 ? "bg-red-950" : "bg-emerald-950"}`}
        >
          <p
            className={`text-xs font-bold ${pl < 0 ? "text-red-400" : "text-emerald-400"}`}
          >
            Position: {pl >= 0 ? "+" : ""}${pl.toFixed(2)}{" "}
            {pl < 0 ? "↓" : "↑"}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function ConceptCheck({
  question,
  options,
  onAnswer,
}: {
  question: string;
  options: { id: string; text: string; correct: boolean; feedback: string }[];
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    if (!selected || checked) return;
    setChecked(true);
    onAnswer(options.find((o) => o.id === selected)?.correct ?? false);
  };

  return (
    <div>
      <p className="mb-3 text-sm font-bold text-slate-200">{question}</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const showResult = checked && isSelected;
          return (
            <button
              key={opt.id}
              onClick={() => !checked && setSelected(opt.id)}
              className={`w-full rounded-2xl border-2 p-3 text-left text-sm font-semibold transition-all ${
                showResult && opt.correct
                  ? "border-emerald-500 bg-emerald-950 text-emerald-300"
                  : showResult && !opt.correct
                    ? "border-red-500 bg-red-950 text-red-300"
                    : isSelected && !checked
                      ? "border-blue-500 bg-blue-950 text-slate-200"
                      : "border-slate-700 bg-slate-800 text-slate-300"
              }`}
            >
              {opt.text}
              {showResult && (
                <p className="mt-1 text-xs font-normal opacity-75">
                  {opt.feedback}
                </p>
              )}
            </button>
          );
        })}
      </div>
      {!checked && (
        <button
          onClick={handleCheck}
          disabled={!selected}
          className="mt-3 w-full rounded-2xl bg-white py-3 text-sm font-black text-slate-900 disabled:opacity-30 transition-transform active:scale-95"
        >
          Check
        </button>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function StoryBranch({
  company = "STOKED CORP",
  startPrice = 20,
  startCash = 1000,
  onReadyChange,
}: StoryBranchProps) {
  const [step, setStep] = useState<Step>("intro");
  const [buyChoice, setBuyChoice] = useState<BuyChoice | null>(null);
  const [state, setState] = useState<DashboardState>({
    shares: 0,
    cash: startCash,
    currentPrice: startPrice,
    dividendsEarned: 0,
    unlockedConcepts: [],
  });
  const [conceptAnswered, setConceptAnswered] = useState(false);
  const [conceptCorrect, setConceptCorrect] = useState(false);

  const unlock = useCallback((concept: ConceptId) => {
    setState((s) => ({
      ...s,
      unlockedConcepts: s.unlockedConcepts.includes(concept)
        ? s.unlockedConcepts
        : [...s.unlockedConcepts, concept],
    }));
  }, []);

  const handleIPO = useCallback(
    (choice: BuyChoice) => {
      setBuyChoice(choice);
      setState((s) => ({
        ...s,
        shares: choice === "all-in" ? 50 : choice === "half" ? 25 : 0,
        cash:
          choice === "all-in" ? 0 : choice === "half" ? startCash / 2 : startCash,
      }));
      setTimeout(() => {
        setState((s) => ({ ...s, currentPrice: 24 }));
        setStep("growth");
      }, 700);
    },
    [startCash],
  );

  const handleGrowthAnswer = useCallback(
    (correct: boolean) => {
      setConceptAnswered(true);
      setConceptCorrect(correct);
      if (correct) unlock("capital-raising");
      setTimeout(() => {
        setState((s) => ({
          ...s,
          dividendsEarned: +(s.shares * 0.4).toFixed(2),
        }));
        setConceptAnswered(false);
        setStep("dividend");
      }, 1300);
    },
    [unlock],
  );

  const handleDividendAnswer = useCallback(
    (correct: boolean) => {
      setConceptAnswered(true);
      setConceptCorrect(correct);
      if (correct) unlock("dividends");
      setTimeout(() => {
        setState((s) => ({ ...s, currentPrice: 18 }));
        setConceptAnswered(false);
        setStep("crisis");
      }, 1300);
    },
    [unlock],
  );

  const handleCrisisAnswer = useCallback(
    (correct: boolean) => {
      setConceptAnswered(true);
      setConceptCorrect(correct);
      if (correct) unlock("gain-loss");
      setTimeout(() => {
        setConceptAnswered(false);
        onReadyChange?.(true);
        setStep("outcome");
      }, 1300);
    },
    [unlock, onReadyChange],
  );

  const allConcepts: ConceptId[] = ["capital-raising", "dividends", "gain-loss"];

  return (
    <div className="rounded-[20px] bg-slate-950 p-4">
      {/* Concept tags row */}
      <div className="mb-4 flex flex-wrap gap-2">
        {allConcepts.map((c) => (
          <ConceptTag
            key={c}
            id={c}
            unlocked={state.unlockedConcepts.includes(c)}
          />
        ))}
      </div>

      {/* Dashboard (hidden on intro) */}
      {step !== "intro" && (
        <Dashboard
          company={company}
          state={state}
          buyPrice={buyChoice && buyChoice !== "watch" ? startPrice : null}
        />
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        {/* ── INTRO ────────────────────────────────────── */}
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="text-center"
          >
            <p className="mb-1 text-[11px] font-bold tracking-widest text-slate-500">
              SIMULATION
            </p>
            <h2 className="mb-4 text-[32px] font-black leading-none text-slate-100">
              {company}
            </h2>
            <div className="mb-4 space-y-1">
              <p className="text-sm text-slate-400">
                Share price: <span className="font-bold text-slate-200">${startPrice}</span>
              </p>
              <p className="text-sm text-slate-400">
                Your cash: <span className="font-bold text-slate-200">${startCash}</span>
              </p>
              <p className="text-xs font-bold text-blue-400">STATUS: PRE-IPO</p>
            </div>
            <p className="mb-2 text-sm leading-relaxed text-slate-300">
              This company is about to go public. Every decision you make will
              have visible consequences.
            </p>
            <p className="mb-6 text-xs font-bold text-slate-500">
              3 decisions. Real outcomes.
            </p>
            <button
              onClick={() => setStep("ipo")}
              className="w-full rounded-2xl bg-white py-4 text-sm font-black text-slate-900 transition-transform active:scale-95"
            >
              START SIMULATION →
            </button>
          </motion.div>
        )}

        {/* ── IPO ──────────────────────────────────────── */}
        {step === "ipo" && (
          <motion.div
            key="ipo"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="mb-1 text-[11px] font-bold text-amber-400">
              IPO — LIVE
            </p>
            <p className="mb-4 text-base font-bold text-slate-200">
              {company} goes public at ${startPrice}/share. You have ${startCash}.
            </p>
            <p className="mb-3 text-sm font-bold text-slate-400">
              How much do you put in?
            </p>
            <div className="space-y-3">
              {[
                {
                  id: "all-in" as const,
                  label: `All in — 50 shares ($${startCash})`,
                  sub: "Maximum ownership. Maximum exposure.",
                  border: "border-amber-500",
                },
                {
                  id: "half" as const,
                  label: `Half in — 25 shares ($${startCash / 2})`,
                  sub: `Some skin in the game. Keep $${startCash / 2}.`,
                  border: "border-blue-500",
                },
                {
                  id: "watch" as const,
                  label: "Watch — $0 invested",
                  sub: "No position. Zero risk. Zero upside.",
                  border: "border-slate-600",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleIPO(opt.id)}
                  className={`w-full rounded-2xl border-2 bg-slate-800 p-4 text-left transition-transform active:scale-[0.98] ${opt.border}`}
                >
                  <p className="text-sm font-black text-slate-200">{opt.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{opt.sub}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── GROWTH ───────────────────────────────────── */}
        {step === "growth" && (
          <motion.div
            key="growth"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="mb-1 text-[11px] font-bold text-slate-500">
              THREE MONTHS LATER
            </p>
            <div className="mb-3 rounded-xl bg-red-950 px-3 py-2">
              <span className="text-[10px] font-black text-red-400">BREAKING</span>
              <p className="text-sm font-bold text-slate-200">
                {company} announces international expansion.
              </p>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl font-black tabular-nums text-emerald-400">
                $24.00
              </span>
              <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-xs font-bold text-emerald-400">
                +20% ↑
              </span>
            </div>
            {!conceptAnswered ? (
              <ConceptCheck
                question="That announcement — what concept does it connect to most?"
                options={[
                  {
                    id: "a",
                    text: "Dividends",
                    correct: false,
                    feedback:
                      "No cash was paid out. This is about capital use and changing expectations.",
                  },
                  {
                    id: "b",
                    text: "Capital raising + changing expectations",
                    correct: true,
                    feedback:
                      "Right. Growth plan = capital at work. Market sees it. Expectations rise. Price reflects it.",
                  },
                  {
                    id: "c",
                    text: "Guaranteed profit",
                    correct: false,
                    feedback:
                      "Nothing guarantees profit. The price moved on what the future might look like.",
                  },
                ]}
                onAnswer={handleGrowthAnswer}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-xl p-3 text-center text-sm font-bold ${conceptCorrect ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-400"}`}
              >
                {conceptCorrect ? "✓ CAPITAL RAISING unlocked" : "Moving on..."}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── DIVIDEND ─────────────────────────────────── */}
        {step === "dividend" && (
          <motion.div
            key="dividend"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="mb-1 text-[11px] font-bold text-slate-500">
              SIX MONTHS LATER
            </p>
            <p className="mb-3 text-base font-bold text-slate-200">
              {company} announces its first dividend: $0.40/share.
            </p>
            {state.shares > 0 ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-4 rounded-xl bg-emerald-950 p-4 text-center"
              >
                <p className="text-2xl font-black text-emerald-400">
                  +${state.dividendsEarned.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Dividend received for {state.shares} shares
                </p>
              </motion.div>
            ) : (
              <div className="mb-4 rounded-xl bg-slate-800 p-4 text-center">
                <p className="text-sm text-slate-400">
                  $0.00 received. No shares, no dividend.
                </p>
              </div>
            )}
            {!conceptAnswered ? (
              <ConceptCheck
                question="Is this dividend the same as a price gain?"
                options={[
                  {
                    id: "a",
                    text: "Yes, they're the same thing.",
                    correct: false,
                    feedback:
                      "Different mechanisms. Dividend = company sends cash. Price gain = you sell at a higher price.",
                  },
                  {
                    id: "b",
                    text: "No — one is cash from the company, one comes from selling.",
                    correct: true,
                    feedback: "Exactly. Different lanes. Both benefit shareholders.",
                  },
                  {
                    id: "c",
                    text: "Yes, both guarantee my investment doubles.",
                    correct: false,
                    feedback: "Neither one guarantees a doubling.",
                  },
                ]}
                onAnswer={handleDividendAnswer}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-xl p-3 text-center text-sm font-bold ${conceptCorrect ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-400"}`}
              >
                {conceptCorrect ? "✓ DIVIDENDS unlocked" : "Moving on..."}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── CRISIS ───────────────────────────────────── */}
        {step === "crisis" && (
          <motion.div
            key="crisis"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="mb-1 text-[11px] font-bold text-slate-500">
              ONE YEAR LATER
            </p>
            <div className="mb-3 rounded-xl bg-red-950 px-3 py-2">
              <span className="text-[10px] font-black text-red-400">BREAKING</span>
              <p className="text-sm font-bold text-slate-200">
                {company} faces regulatory investigation. Markets spooked.
              </p>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl font-black tabular-nums text-red-400">
                $18.00
              </span>
              <span className="rounded-full bg-red-950 px-2 py-0.5 text-xs font-bold text-red-400">
                −25% ↓
              </span>
            </div>
            {state.shares > 0 && (
              <p className="mb-4 text-sm text-slate-400">
                You bought at ${startPrice}. It's now $18. That's a loss — for
                now.
              </p>
            )}
            {!conceptAnswered ? (
              <ConceptCheck
                question={`You bought at $${startPrice}. It's now $18. What's your status?`}
                options={[
                  {
                    id: "a",
                    text: "Break-even",
                    correct: false,
                    feedback: "$18 is below $20. That gap is a loss.",
                  },
                  {
                    id: "b",
                    text: "A gain",
                    correct: false,
                    feedback: "Price went down from where you bought. That's a loss.",
                  },
                  {
                    id: "c",
                    text: "A loss",
                    correct: true,
                    feedback:
                      "$18 is below your $20 buy price. Ownership means riding this too.",
                  },
                ]}
                onAnswer={handleCrisisAnswer}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <div
                  className={`rounded-xl p-3 text-center text-sm font-bold ${conceptCorrect ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-400"}`}
                >
                  {conceptCorrect ? "✓ GAIN / LOSS unlocked" : "Moving on..."}
                </div>
                <p className="text-center text-xs text-slate-500">
                  This is what owning a stock actually feels like. Not just the
                  wins.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── OUTCOME ──────────────────────────────────── */}
        {step === "outcome" && (
          <motion.div
            key="outcome"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="space-y-4"
          >
            <h3 className="text-center text-lg font-black text-slate-100">
              Your year with {company}
            </h3>

            {/* Statement card */}
            <div className="overflow-hidden rounded-2xl border border-slate-700">
              <div className="border-b border-slate-700 bg-slate-900 px-4 py-2">
                <span className="text-[10px] font-black tracking-widest text-slate-500">
                  {company}
                </span>
              </div>
              {[
                { label: "Bought at", value: `$${startPrice.toFixed(2)}/share` },
                { label: "Current price", value: "$18.00/share" },
                { label: "Your shares", value: String(state.shares) },
                {
                  label: "Dividends earned",
                  value: `$${state.dividendsEarned.toFixed(2)}`,
                  accent: true,
                },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2.5"
                >
                  <span className="text-xs text-slate-500">{label}</span>
                  <span
                    className={`text-sm font-bold tabular-nums ${accent ? "text-emerald-400" : "text-slate-200"}`}
                  >
                    {value}
                  </span>
                </div>
              ))}
              <div className="bg-slate-800 px-4 py-2.5 text-center">
                <span className="text-[11px] font-black tracking-widest text-slate-300">
                  STATUS: STILL A SHAREHOLDER
                </span>
              </div>
            </div>

            {/* Narrative */}
            <p className="text-center text-sm leading-relaxed text-slate-400">
              {buyChoice === "all-in"
                ? "The stock dropped — but your dividends cushioned some of it. Ownership means the full ride."
                : buyChoice === "half"
                  ? "Partial position, partial exposure. Your cash cushion kept you stable."
                  : "No loss. No dividend. No gain. Watching teaches too."}
            </p>

            {/* Concepts unlocked */}
            <div>
              <p className="mb-2 text-center text-[11px] font-bold text-slate-500">
                CONCEPTS MASTERED
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {allConcepts.map((c) => (
                  <ConceptTag
                    key={c}
                    id={c}
                    unlocked={state.unlockedConcepts.includes(c)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
