"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useCallback } from "react";
import type { ExperienceState, UserResult } from "@/app/types/experience";
import { scenarios } from "@/app/data/scenarios";
import EntryHook from "./EntryHook";
import ScenarioCard from "./ScenarioCard";
import IdentityResult from "./IdentityResult";
const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

const progressMap: Record<ExperienceState, number> = {
  entry_hook: 0,
  scenario_1: 20,
  scenario_2: 42,
  scenario_3: 64,
  identity_result: 78,
};

function logEvent(event: string, data?: Record<string, unknown>) {
  console.log("[stoked]", event, data ?? "");
}

function upsertResult(results: UserResult[], next: UserResult) {
  const existingIndex = results.findIndex((result) => result.scenarioId === next.scenarioId);
  if (existingIndex === -1) {
    return [...results, next];
  }

  const updated = [...results];
  updated[existingIndex] = next;
  return updated;
}

interface ExperienceContainerProps {
  onComplete: () => void;
  initialState?: ExperienceState;
  continueLabel?: string;
  skipEntryHook?: boolean;
}

export default function ExperienceContainer({
  onComplete,
  initialState,
  continueLabel,
  skipEntryHook = false,
}: ExperienceContainerProps) {
  const [state, setState] = useState<ExperienceState>(
    initialState ?? (skipEntryHook ? "scenario_1" : "entry_hook"),
  );
  const [results, setResults] = useState<UserResult[]>([]);

  function transition(next: ExperienceState) {
    logEvent(next);
    setState(next);
  }

  const handleScenario1Complete = useCallback((result: UserResult) => {
    logEvent("scenario_1_complete", { correct: result.correct });
    setResults((prev) => upsertResult(prev, result));
    transition("scenario_2");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScenario2Complete = useCallback((result: UserResult) => {
    logEvent("scenario_2_complete", { correct: result.correct });
    setResults((prev) => upsertResult(prev, result));
    transition("scenario_3");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScenario3Complete = useCallback((result: UserResult) => {
    logEvent("scenario_3_complete", { correct: result.correct });
    setResults((prev) => upsertResult(prev, result));
    transition("identity_result");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = progressMap[state];
  const isScenario = state === "scenario_1" || state === "scenario_2" || state === "scenario_3";
  const isDark = false;

  return (
    <div style={{ backgroundColor: isDark ? "#111111" : "#f7f6f3", minHeight: "100svh", position: "relative" }}>

      {/* Minimal fixed header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 44,
          backgroundColor: isDark ? "rgba(17,17,17,0.95)" : "rgba(247,246,243,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          zIndex: 200,
          fontFamily: font,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: isDark ? "#ffffff" : "#111111",
            letterSpacing: "-0.02em",
          }}
        >
          Stoked
        </span>

        {/* Progress bar — inline in header */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", backgroundColor: "#10b981" }}
          />
        </div>
      </div>

      {/* Content — 44px header offset */}
      <AnimatePresence mode="wait">
        {!skipEntryHook && state === "entry_hook" && (
          <motion.div
            key="entry_hook"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <EntryHook onStart={() => transition("scenario_1")} />
          </motion.div>
        )}

        {isScenario && (
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              minHeight: "100svh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 20px 32px",
            }}
          >
            {state === "scenario_1" && (
              <ScenarioCard scenario={scenarios[0]} scenarioNumber={1} onComplete={handleScenario1Complete} />
            )}
            {state === "scenario_2" && (
              <ScenarioCard scenario={scenarios[1]} scenarioNumber={2} onComplete={handleScenario2Complete} />
            )}
            {state === "scenario_3" && (
              <ScenarioCard scenario={scenarios[2]} scenarioNumber={3} onComplete={handleScenario3Complete} />
            )}
          </motion.div>
        )}

        {state === "identity_result" && (
          <motion.div
            key="identity_result"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <IdentityResult
              results={results}
              onContinue={onComplete}
              continueLabel={continueLabel}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
