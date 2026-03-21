"use client";

import { useMemo, useRef, useState } from "react";
import { checkContent, type CheckContent } from "../lib/course-data";
import {
  triggerCorrect,
  triggerIncorrect,
  triggerXP,
  useCorrectStreak,
} from "../lib/animations";

type LegacyLessonCheckStepProps = {
  stepId: string;
  onContinue: () => void;
  onIncorrect: (reviewPrompt: string) => void;
  content?: never;
};

type ModernLessonCheckStepProps = {
  content: CheckContent;
  onContinue: () => void;
  onIncorrect: (reviewPrompt: string) => void;
  stepId?: never;
};

type LessonCheckStepProps =
  | LegacyLessonCheckStepProps
  | ModernLessonCheckStepProps;

export function LessonCheckStep(props: LessonCheckStepProps) {
  let content: CheckContent;

  if ("stepId" in props && typeof props.stepId === "string") {
    content = checkContent[props.stepId] ?? checkContent["1-3"];
  } else {
    content = props.content;
  }

  const [selectedAnswer, setSelectedAnswer] = useState<boolean | string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const continueBtnRef = useRef<HTMLButtonElement>(null);
  const { recordCorrect, recordIncorrect } = useCorrectStreak();

  const isCorrect = useMemo(() => {
    if (content.type === "truefalse") {
      return selectedAnswer === content.correctAnswer;
    }

    return Boolean(
      content.options?.find((option) => option.id === selectedAnswer)?.correct,
    );
  }, [content, selectedAnswer]);

  function handleSubmit() {
    setShowFeedback(true);

    // Find the selected card element for animation origin
    const selectedKey =
      content.type === "truefalse"
        ? String(selectedAnswer)
        : String(selectedAnswer);
    const cardEl = cardRefs.current.get(selectedKey);

    if (isCorrect) {
      recordCorrect();
      // Fire after React commits the DOM so the card already has its green styling
      requestAnimationFrame(() => {
        if (cardEl) triggerCorrect(cardEl);
        setTimeout(() => { if (cardEl) triggerXP(10, cardEl); }, 200);
        setTimeout(() => { continueBtnRef.current?.classList.add("anim-btn-pulse"); }, 350);
      });
      return;
    }

    requestAnimationFrame(() => { if (cardEl) triggerIncorrect(cardEl); });
    recordIncorrect();

    if (content.type === "truefalse") {
      props.onIncorrect(content.reviewPrompt);
      return;
    }

    const selected = content.options?.find((option) => option.id === selectedAnswer);
    props.onIncorrect(selected?.reviewPrompt || content.reviewPrompt);
  }

  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
  const letters = ["A","B","C","D","E","F"];
  const canSubmit = selectedAnswer !== null;

  function optionStyle(active: boolean, showCorrect: boolean, showIncorrect: boolean): React.CSSProperties {
    let bg = "#fff", border = "#e5e7eb", shadow: string = "0 4px 0 #e5e7eb", color = "#172b4d";
    if (showCorrect)  { bg = "#f0fdf4"; border = "#22c55e"; shadow = "none"; color = "#15803d"; }
    if (showIncorrect){ bg = "#fff1f2"; border = "#f43f5e"; shadow = "none"; color = "#be123c"; }
    if (active && !showFeedback) { bg = "#eff6ff"; border = "#3b82f6"; shadow = "0 4px 0 #93c5fd"; color = "#1d4ed8"; }
    return { display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left", padding: "14px 16px", background: bg, border: `2px solid ${border}`, borderRadius: 16, boxShadow: shadow, color, fontFamily: font, fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "all 150ms" };
  }

  function badgeStyle(active: boolean, showCorrect: boolean, showIncorrect: boolean): React.CSSProperties {
    const border = showCorrect ? "#22c55e" : showIncorrect ? "#f43f5e" : active ? "#3b82f6" : "#e5e7eb";
    return { flexShrink: 0, width: 32, height: 32, borderRadius: 8, border: `2px solid ${border}`, background: (active||showCorrect||showIncorrect) ? (showCorrect?"#22c55e":showIncorrect?"#f43f5e":"#3b82f6") : "#f3f4f6", color: (active||showCorrect||showIncorrect)?"#fff":"#6b7280", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 };
  }

  return (
    <div style={{ fontFamily: font }}>
      {/* Eyebrow */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7280" }}>Check your knowledge</span>
      </div>

      {/* Question */}
      <h2 style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 900, color: "#172b4d", letterSpacing: "-0.5px", marginBottom: 24, lineHeight: 1.25 }}>
        {content.question}
      </h2>

      {/* Options */}
      {content.type === "truefalse" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {[{ value: true, label: "True" }, { value: false, label: "False" }].map((option, idx) => {
            const active = selectedAnswer === option.value;
            const showCorrect = showFeedback && option.value === content.correctAnswer;
            const showIncorrect = showFeedback && active && option.value !== content.correctAnswer;
            return (
              <button key={option.label} ref={(el) => { if (el) cardRefs.current.set(String(option.value), el); }}
                type="button"
                onClick={() => { setSelectedAnswer(option.value); if (showFeedback) setShowFeedback(false); }}
                style={optionStyle(active, showCorrect, showIncorrect)}
              >
                <span style={badgeStyle(active, showCorrect, showIncorrect)}>
                  {showCorrect ? "✓" : showIncorrect ? "✗" : letters[idx]}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {content.options?.map((option, idx) => {
            const active = selectedAnswer === option.id;
            const showCorrect = showFeedback && option.correct;
            const showIncorrect = showFeedback && active && !option.correct;
            return (
              <button key={option.id} ref={(el) => { if (el) cardRefs.current.set(option.id, el); }}
                type="button"
                onClick={() => { setSelectedAnswer(option.id); if (showFeedback) setShowFeedback(false); }}
                style={optionStyle(active, showCorrect, showIncorrect)}
              >
                <span style={badgeStyle(active, showCorrect, showIncorrect)}>
                  {showCorrect ? "✓" : showIncorrect ? "✗" : letters[idx]}
                </span>
                {option.text}
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback banner */}
      {showFeedback && (
        <div style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 20, background: isCorrect ? "#f0fdf4" : "#fff1f2", border: `2px solid ${isCorrect ? "#22c55e" : "#f43f5e"}` }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: isCorrect ? "#15803d" : "#be123c", marginBottom: 4 }}>
            {isCorrect ? "Correct! 🎉" : "Not quite"}
          </div>
          <div style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>{content.explanation}</div>
        </div>
      )}

      {/* Button */}
      <div style={{ marginTop: 16 }}>
        {showFeedback && isCorrect ? (
          <button ref={continueBtnRef} onClick={props.onContinue} type="button"
            style={{ width: "100%", padding: "16px", fontFamily: font, fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff", border: "none", borderRadius: 16, cursor: "pointer", background: "#22c55e", boxShadow: "0 5px 0 #16a34a", animation: "ha-slam-in 320ms cubic-bezier(0.22,1,0.36,1) both" }}
          >
            Continue →
          </button>
        ) : (
          <button disabled={!canSubmit} onClick={handleSubmit} type="button"
            style={{ width: "100%", padding: "16px", fontFamily: font, fontWeight: 800, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.08em", color: "#fff", border: "none", borderRadius: 16, cursor: canSubmit ? "pointer" : "not-allowed", background: canSubmit ? "#22c55e" : "#d1d5db", boxShadow: canSubmit ? "0 5px 0 #16a34a" : "0 5px 0 #b0b7c3", transition: "all 200ms" }}
          >
            Check answer
          </button>
        )}
      </div>
    </div>
  );
}
