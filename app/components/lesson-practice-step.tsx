"use client";

import { useMemo, useRef, useState } from "react";
import { practiceContent, type PracticeContent } from "../lib/course-data";
import { triggerCorrect, triggerIncorrect, triggerXP } from "../lib/animations";
import { LessonActivity } from "./lesson-activity";

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

export function LessonPracticeStep(props: LessonPracticeStepProps) {
  let content: PracticeContent;

  if ("stepId" in props && typeof props.stepId === "string") {
    content = practiceContent[props.stepId] ?? practiceContent["1-2"];
  } else {
    content = props.content;
  }

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

  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
  const letters = ["A","B","C","D","E","F"];
  const canCheck = (selectedOption && activitySatisfied) || (content.useActivityAsPractice && !content.options.length && activityReady);
  const showContinue = showFeedback && isCorrect;

  return (
    <div style={{ fontFamily: font }}>
      {/* Eyebrow */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7280" }}>Practice</span>
      </div>

      {/* Title */}
      <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "#172b4d", letterSpacing: "-0.5px", marginBottom: 8, lineHeight: 1.2 }}>
        {content.mechanicTitle}
      </h2>
      <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>{content.mechanicSummary}</p>

      {content.activityKind ? (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", marginBottom: 12 }}>
            {content.prompt}
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
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#172b4d", marginBottom: 16, lineHeight: 1.3 }}>{content.question}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {content.options.map((option, idx) => {
              const active = selectedOption === option.id;
              const showCorrect = showFeedback && option.correct;
              const showIncorrect = showFeedback && active && !option.correct;
              let bg = "#fff", border = "#e5e7eb", color = "#172b4d", shadow = "0 4px 0 #e5e7eb";
              if (showCorrect)  { bg = "#f0fdf4"; border = "#22c55e"; color = "#15803d"; shadow = "none"; }
              if (showIncorrect){ bg = "#fff1f2"; border = "#f43f5e"; color = "#be123c"; shadow = "none"; }
              if (active && !showFeedback) { bg = "#eff6ff"; border = "#3b82f6"; color = "#1d4ed8"; shadow = "0 4px 0 #93c5fd"; }

              return (
                <button
                  key={option.id}
                  ref={(el) => { if (el) cardRefs.current.set(option.id, el); }}
                  type="button"
                  onClick={() => { setSelectedOption(option.id); if (showFeedback) setShowFeedback(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    width: "100%", textAlign: "left",
                    padding: "14px 16px",
                    background: bg, border: `2px solid ${border}`, borderRadius: 16,
                    boxShadow: shadow, color,
                    fontFamily: font, fontSize: 16, fontWeight: 600,
                    cursor: "pointer", transition: "all 150ms",
                  }}
                >
                  <span style={{
                    flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                    border: `2px solid ${border}`, background: showCorrect ? "#22c55e" : showIncorrect ? "#f43f5e" : active ? "#3b82f6" : "#f3f4f6",
                    color: (active || showCorrect || showIncorrect) ? "#fff" : "#6b7280",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 13,
                  }}>
                    {showCorrect ? "✓" : showIncorrect ? "✗" : letters[idx]}
                  </span>
                  {option.text}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Feedback banner */}
      {showFeedback && (
        <div style={{
          borderRadius: 16, padding: "14px 16px", marginBottom: 20,
          background: isCorrect ? "#f0fdf4" : "#fff1f2",
          border: `2px solid ${isCorrect ? "#22c55e" : "#f43f5e"}`,
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: isCorrect ? "#15803d" : "#be123c", marginBottom: 4 }}>
            {isCorrect ? "Correct! 🎉" : "Not quite"}
          </div>
          <div style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
            {selected?.feedback ?? content.explanation}
          </div>
        </div>
      )}

      {/* Bottom button */}
      <div style={{ marginTop: 16 }}>
        {content.useActivityAsPractice && !content.options.length ? (
          <button
            disabled={Boolean(content.activityKind) && !activityReady}
            onClick={handleContinue}
            type="button"
            style={{
              width: "100%", padding: "16px", fontFamily: font, fontWeight: 800, fontSize: 16,
              textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff", border: "none", borderRadius: 16, cursor: activityReady ? "pointer" : "not-allowed",
              background: activityReady ? "#22c55e" : "#d1d5db",
              boxShadow: activityReady ? "0 5px 0 #16a34a" : "0 5px 0 #b0b7c3",
            }}
          >
            {content.actionLabel ?? "Continue →"}
          </button>
        ) : showContinue ? (
          <button
            ref={continueBtnRef}
            onClick={handleContinue}
            type="button"
            style={{
              width: "100%", padding: "16px", fontFamily: font, fontWeight: 800, fontSize: 16,
              textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff", border: "none", borderRadius: 16, cursor: "pointer",
              background: "#22c55e", boxShadow: "0 5px 0 #16a34a",
              animation: "ha-slam-in 320ms cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            {content.actionLabel ?? "Continue →"}
          </button>
        ) : hasQuestion ? (
          <button
            disabled={!canCheck}
            onClick={handleCheck}
            type="button"
            style={{
              width: "100%", padding: "16px", fontFamily: font, fontWeight: 800, fontSize: 16,
              textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff", border: "none", borderRadius: 16,
              cursor: canCheck ? "pointer" : "not-allowed",
              background: canCheck ? "#22c55e" : "#d1d5db",
              boxShadow: canCheck ? "0 5px 0 #16a34a" : "0 5px 0 #b0b7c3",
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
              width: "100%", padding: "16px", fontFamily: font, fontWeight: 800, fontSize: 16,
              textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff", border: "none", borderRadius: 16, cursor: "pointer",
              background: "#22c55e", boxShadow: "0 5px 0 #16a34a",
            }}
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}
