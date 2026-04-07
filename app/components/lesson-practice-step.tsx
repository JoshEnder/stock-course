"use client";

import { useMemo, useRef, useState } from "react";
import { practiceContent, type PracticeContent } from "../lib/course-data";
import { triggerCorrect, triggerIncorrect, triggerXP } from "../lib/animations";
import { LessonActivity } from "./lesson-activity";

function capitalizeLead(value: string) {
  return value.replace(/^([a-z])/, (letter) => letter.toUpperCase());
}

type LegacyLessonPracticeStepProps = {
  stepId: string;
  onContinue: () => void;
  onIncorrect: (reviewPrompt: string) => void;
  content?: never;
};

type ModernLessonPracticeStepProps = {
  content: PracticeContent;
  onContinue: () => void;
  onIncorrect: (reviewPrompt: string) => void;
  stepId?: never;
};

type LessonPracticeStepProps =
  | LegacyLessonPracticeStepProps
  | ModernLessonPracticeStepProps;

const EMERALD = "#10b981";
const CREAM = "#e8e2d4";
const TEXT = "#cbd5e1";
const MUTED = "#94a3b8";
const DIM = "#5f687a";
const serif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";
const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

export function LessonPracticeStep(props: LessonPracticeStepProps) {
  const content = (
    "content" in props
      ? props.content
      : practiceContent[props.stepId] ?? practiceContent["1-2"]
  ) as PracticeContent;

  const [activityReady, setActivityReady] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const continueBtnRef = useRef<HTMLButtonElement>(null);

  const selected = useMemo(
    () => content.options.find((option) => option.id === selectedOption) ?? null,
    [content.options, selectedOption],
  );
  const hasQuestion = Boolean(content.question && content.options.length);
  const activitySatisfied =
    !content.activityKind || activityReady || !content.useActivityAsPractice;
  const isCorrect = Boolean(selected?.correct);

  function handleCheck() {
    if (!selected) {
      return;
    }

    setShowFeedback(true);
    const cardEl = cardRefs.current.get(selected.id);

    if (selected.correct) {
      requestAnimationFrame(() => {
        if (cardEl) triggerCorrect(cardEl);
        setTimeout(() => { if (cardEl) triggerXP(10, cardEl); }, 200);
        setTimeout(() => { continueBtnRef.current?.classList.add("anim-btn-pulse"); }, 350);
      });
    } else {
      requestAnimationFrame(() => { if (cardEl) triggerIncorrect(cardEl); });
      props.onIncorrect(selected.reviewPrompt);
    }
  }

  function handleContinue() {
    if (content.useActivityAsPractice && !content.options.length) {
      if (!activityReady && content.activityKind) {
        return;
      }
      props.onContinue();
      return;
    }

    if (!hasQuestion) {
      props.onContinue();
      return;
    }

    if (showFeedback && isCorrect) {
      props.onContinue();
    }
  }

  const letters = ["A","B","C","D","E","F"];
  const canCheck = (selectedOption && activitySatisfied) || (content.useActivityAsPractice && !content.options.length && activityReady);
  const showContinue = showFeedback && isCorrect;

  function optionBg(active: boolean, showCorrect: boolean, showIncorrect: boolean) {
    if (showCorrect) return "rgba(16,185,129,0.12)";
    if (showIncorrect) return "rgba(239,68,68,0.12)";
    if (active && !showFeedback) return "rgba(16,185,129,0.08)";
    return "rgba(255,255,255,0.03)";
  }

  function optionBorder(active: boolean, showCorrect: boolean, showIncorrect: boolean) {
    if (showCorrect) return EMERALD;
    if (showIncorrect) return "#ef4444";
    if (active && !showFeedback) return "rgba(16,185,129,0.5)";
    return "rgba(255,255,255,0.06)";
  }

  function optionColor(active: boolean, showCorrect: boolean, showIncorrect: boolean) {
    if (showCorrect) return EMERALD;
    if (showIncorrect) return "#f87171";
    if (active && !showFeedback) return CREAM;
    return TEXT;
  }

  function badgeBg(active: boolean, showCorrect: boolean, showIncorrect: boolean) {
    if (showCorrect) return EMERALD;
    if (showIncorrect) return "#ef4444";
    if (active && !showFeedback) return EMERALD;
    return "rgba(255,255,255,0.07)";
  }

  function badgeColor(active: boolean, showCorrect: boolean, showIncorrect: boolean) {
    if (active || showCorrect || showIncorrect) return "#fff";
    return DIM;
  }

  return (
    <div style={{ fontFamily: sans }}>
      {/* Eyebrow */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: DIM }}>Practice</span>
      </div>

      {/* Title */}
      <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontFamily: serif, fontWeight: 600, color: TEXT, letterSpacing: "-0.01em", marginBottom: 10, lineHeight: 1.15 }}>
        {capitalizeLead(content.mechanicTitle)}
      </h2>
      <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.65, marginBottom: 24 }}>{capitalizeLead(content.mechanicSummary)}</p>

      {content.activityKind ? (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: DIM, marginBottom: 12 }}>
            {capitalizeLead(content.prompt)}
          </p>
          <LessonActivity
            activityData={content.activityData}
            activityKind={content.activityKind}
            onReadyChange={setActivityReady}
          />
        </div>
      ) : null}

      {hasQuestion ? (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 500, color: CREAM, marginBottom: 20, lineHeight: 1.35 }}>{capitalizeLead(content.question)}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {content.options.map((option, idx) => {
              const active = selectedOption === option.id;
              const showCorrect = showFeedback && option.correct;
              const showIncorrect = showFeedback && active && !option.correct;

              return (
                <button
                  key={option.id}
                  ref={(el) => { if (el) cardRefs.current.set(option.id, el); }}
                  type="button"
                  className={!active && !showFeedback ? "lesson-option" : undefined}
                  onClick={() => { setSelectedOption(option.id); if (showFeedback) setShowFeedback(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", textAlign: "left",
                    padding: "12px 14px",
                    background: optionBg(active, showCorrect, showIncorrect),
                    border: `1px solid ${optionBorder(active, showCorrect, showIncorrect)}`,
                    borderRadius: 10,
                    color: optionColor(active, showCorrect, showIncorrect),
                    fontFamily: sans, fontSize: 15, fontWeight: 500,
                    cursor: "pointer", transition: "all 150ms",
                  }}
                >
                  <span style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: 6,
                    background: badgeBg(active, showCorrect, showIncorrect),
                    color: badgeColor(active, showCorrect, showIncorrect),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 600, fontSize: 12,
                  }}>
                    {showCorrect ? "✓" : showIncorrect ? "✗" : letters[idx]}
                  </span>
                  {capitalizeLead(option.text)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Feedback */}
      {showFeedback && (
        <div style={{
          borderLeft: `3px solid ${isCorrect ? EMERALD : "#ef4444"}`,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 12,
          paddingBottom: 12,
          marginBottom: 20,
          background: isCorrect ? "rgba(16,185,129,0.04)" : "rgba(239,68,68,0.04)",
          borderRadius: "0 8px 8px 0",
          animation: "lessonStepEnter 280ms cubic-bezier(0.22,1,0.36,1) both",
        }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: isCorrect ? EMERALD : "#f87171", marginBottom: 6 }}>
            {isCorrect ? "Correct" : "Not quite"}
          </div>
          <div style={{ fontSize: 14, color: TEXT, lineHeight: 1.6 }}>
            {capitalizeLead(selected?.feedback ?? content.explanation)}
          </div>
        </div>
      )}

      {/* Bottom button */}
      <div style={{ marginTop: 20 }}>
        {content.useActivityAsPractice && !content.options.length ? (
          <button
            disabled={Boolean(content.activityKind) && !activityReady}
            onClick={handleContinue}
            type="button"
            style={{
              width: "100%", padding: "14px", fontFamily: sans, fontWeight: 500, fontSize: 14,
              letterSpacing: "0.01em", border: "none", borderRadius: 10, cursor: activityReady ? "pointer" : "not-allowed",
              color: activityReady ? "#111" : DIM,
              background: activityReady ? CREAM : "rgba(255,255,255,0.06)",
              boxShadow: activityReady ? "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28)" : "none",
              transition: "all 200ms",
            }}
          >
            {content.actionLabel ?? "Continue"}
          </button>
        ) : showContinue ? (
          <button
            ref={continueBtnRef}
            onClick={handleContinue}
            type="button"
            style={{
              width: "100%", padding: "14px", fontFamily: sans, fontWeight: 500, fontSize: 14,
              letterSpacing: "0.01em", border: "none", borderRadius: 10, cursor: "pointer",
              color: "#111", background: CREAM,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28)",
              animation: "ha-slam-in 320ms cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            {content.actionLabel ?? "Continue"}
          </button>
        ) : hasQuestion ? (
          <button
            disabled={!canCheck}
            onClick={handleCheck}
            type="button"
            style={{
              width: "100%", padding: "14px", fontFamily: sans, fontWeight: 500, fontSize: 14,
              letterSpacing: "0.01em", border: "none", borderRadius: 10,
              cursor: canCheck ? "pointer" : "not-allowed",
              color: canCheck ? "#111" : DIM,
              background: canCheck ? CREAM : "rgba(255,255,255,0.06)",
              boxShadow: canCheck ? "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28)" : "none",
              transition: "all 200ms",
            }}
          >
            {selectedOption || !content.activityKind ? "Check answer" : content.readinessLabel ?? "Try the interaction first"}
          </button>
        ) : (
          <button
            onClick={handleContinue}
            type="button"
            style={{
              width: "100%", padding: "14px", fontFamily: sans, fontWeight: 500, fontSize: 14,
              letterSpacing: "0.01em", border: "none", borderRadius: 10, cursor: "pointer",
              color: "#111", background: CREAM,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28)",
            }}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
