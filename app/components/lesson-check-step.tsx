"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { checkContent, type CheckContent } from "../lib/course-data";
import {
  triggerConfetti,
  triggerCorrect,
  triggerIncorrect,
  triggerXP,
  useCorrectStreak,
} from "../lib/animations";

function capitalizeLead(value: string) {
  return value.replace(/^([a-z])/, (letter) => letter.toUpperCase());
}

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
  const content = (
    "content" in props
      ? props.content
      : checkContent[props.stepId] ?? checkContent["1-3"]
  ) as CheckContent;

  const rapidFireCases = content.variant === "rapid-fire" ? content.rapidFireCases ?? [] : [];
  const isRapidFire = rapidFireCases.length > 0;
  const [caseIndex, setCaseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const continueBtnRef = useRef<HTMLButtonElement>(null);
  const { recordCorrect, recordIncorrect } = useCorrectStreak();

  useEffect(() => {
    setCaseIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [content]);

  const activeCase = isRapidFire ? rapidFireCases[Math.min(caseIndex, rapidFireCases.length - 1)] : null;
  const prompt = capitalizeLead(activeCase?.prompt ?? content.question);
  const explanation = capitalizeLead(activeCase?.explanation ?? content.explanation);
  const reviewPrompt = activeCase?.reviewPrompt ?? content.reviewPrompt;
  const optionList = activeCase?.options ?? content.options ?? [];
  const answerType = activeCase ? "multiple" : content.type;
  const currentCorrectAnswer = activeCase ? undefined : content.correctAnswer;

  const isCorrect = useMemo(() => {
    if (answerType === "truefalse") {
      return selectedAnswer === currentCorrectAnswer;
    }

    return Boolean(
      optionList.find((option) => option.id === selectedAnswer)?.correct,
    );
  }, [answerType, currentCorrectAnswer, optionList, selectedAnswer]);

  const selectedOption =
    answerType === "multiple"
      ? optionList.find((option) => option.id === selectedAnswer) ?? null
      : null;
  const canSubmit = selectedAnswer !== null;
  const isLastRapidFireCase = !isRapidFire || caseIndex === rapidFireCases.length - 1;

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setShowFeedback(true);
    const selectedKey = String(selectedAnswer);
    const cardEl = cardRefs.current.get(selectedKey);

    if (isCorrect) {
      recordCorrect();
      requestAnimationFrame(() => {
        if (cardEl) triggerCorrect(cardEl);
        window.setTimeout(() => {
          if (cardEl) triggerXP(10, cardEl);
        }, 200);
        window.setTimeout(() => {
          if (cardEl) {
            const rect = cardEl.getBoundingClientRect();
            triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height * 0.3, 26);
          }
        }, 280);
        window.setTimeout(() => {
          continueBtnRef.current?.classList.add("anim-btn-pulse");
        }, 350);
      });
      return;
    }

    requestAnimationFrame(() => {
      if (cardEl) triggerIncorrect(cardEl);
    });
    recordIncorrect();
    props.onIncorrect(selectedOption?.reviewPrompt || reviewPrompt);
  }

  function handleAdvance() {
    if (!isRapidFire) {
      props.onContinue();
      return;
    }

    if (isCorrect && !isLastRapidFireCase) {
      setCaseIndex((current) => current + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      return;
    }

    if (isCorrect && isLastRapidFireCase) {
      props.onContinue();
      return;
    }

    setSelectedAnswer(null);
    setShowFeedback(false);
  }

  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
  const letters = ["A", "B", "C", "D", "E", "F"];

  function optionStyle(
    active: boolean,
    showCorrect: boolean,
    showIncorrect: boolean,
  ): CSSProperties {
    let bg = "#fff";
    let border = "#e5e7eb";
    let shadow = "0 4px 0 #e5e7eb";
    let color = "#172b4d";
    if (showCorrect) {
      bg = "#f0fdf4";
      border = "#22c55e";
      shadow = "none";
      color = "#15803d";
    }
    if (showIncorrect) {
      bg = "#fff1f2";
      border = "#f43f5e";
      shadow = "none";
      color = "#be123c";
    }
    if (active && !showFeedback) {
      bg = "#eff6ff";
      border = "#3b82f6";
      shadow = "0 4px 0 #93c5fd";
      color = "#1d4ed8";
    }

    return {
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      minHeight: 44,
      textAlign: "left",
      padding: "12px 14px",
      background: bg,
      border: `2px solid ${border}`,
      borderRadius: 16,
      boxShadow: shadow,
      color,
      fontFamily: font,
      fontSize: "clamp(14px, 2vw, 16px)" as string,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 150ms",
    };
  }

  function badgeStyle(
    active: boolean,
    showCorrect: boolean,
    showIncorrect: boolean,
  ): CSSProperties {
    const border = showCorrect
      ? "#22c55e"
      : showIncorrect
        ? "#f43f5e"
        : active
          ? "#3b82f6"
          : "#e5e7eb";

    return {
      flexShrink: 0,
      width: 32,
      height: 32,
      borderRadius: 8,
      border: `2px solid ${border}`,
      background: active || showCorrect || showIncorrect
        ? showCorrect
          ? "#22c55e"
          : showIncorrect
            ? "#f43f5e"
            : "#3b82f6"
        : "#f3f4f6",
      color: active || showCorrect || showIncorrect ? "#fff" : "#6b7280",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: 13,
    };
  }

  const feedbackText = selectedOption?.feedback ?? explanation;
  const actionLabel = showFeedback
    ? isCorrect
      ? isRapidFire
        ? isLastRapidFireCase
          ? "Continue →"
          : "Next check →"
        : "Continue →"
      : "Try again"
    : "Check answer";

  return (
    <div style={{ fontFamily: font }}>
      <div style={{ marginBottom: 8 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#6b7280",
          }}
        >
          {isRapidFire ? "Rapid check" : "Check your knowledge"}
        </span>
      </div>

      {isRapidFire ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {rapidFireCases.map((item, index) => (
              <span
                key={item.id}
                style={{
                  width: index === caseIndex ? 20 : 10,
                  height: 10,
                  borderRadius: 99,
                  background: index < caseIndex ? "#22c55e" : index === caseIndex ? "#86efac" : "#e5e7eb",
                  transition: "all 220ms",
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>
            {caseIndex + 1} / {rapidFireCases.length}
          </span>
        </div>
      ) : null}

      <h2
        style={{
          fontSize: "clamp(20px,3vw,30px)",
          fontWeight: 900,
          color: "#172b4d",
          letterSpacing: "-0.5px",
          marginBottom: 24,
          lineHeight: 1.25,
        }}
      >
        {prompt}
      </h2>

      {answerType === "truefalse" ? (
        <div key={`${prompt}-tf`} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {[{ value: true, label: "True" }, { value: false, label: "False" }].map((option, idx) => {
            const active = selectedAnswer === option.value;
            const showCorrect = showFeedback && option.value === currentCorrectAnswer;
            const showIncorrect = showFeedback && active && option.value !== currentCorrectAnswer;
            return (
              <button
                key={option.label}
                ref={(el) => {
                  if (el) cardRefs.current.set(String(option.value), el);
                }}
                onClick={() => {
                  setSelectedAnswer(option.value);
                  if (showFeedback) setShowFeedback(false);
                }}
                style={{ ...optionStyle(active, showCorrect, showIncorrect), animation: !showFeedback ? `staggerFadeUp 220ms ${idx * 60}ms ease-out both` : undefined }}
                type="button"
              >
                <span style={badgeStyle(active, showCorrect, showIncorrect)}>
                  {showCorrect ? "✓" : showIncorrect ? "✗" : letters[idx]}
                </span>
                {capitalizeLead(option.label)}
              </button>
            );
          })}
        </div>
      ) : (
        <div key={`${prompt}-${caseIndex}`} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {optionList.map((option, idx) => {
            const active = selectedAnswer === option.id;
            const showCorrect = showFeedback && option.correct;
            const showIncorrect = showFeedback && active && !option.correct;
            return (
              <button
                key={option.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(option.id, el);
                }}
                onClick={() => {
                  setSelectedAnswer(option.id);
                  if (showFeedback) setShowFeedback(false);
                }}
                style={{ ...optionStyle(active, showCorrect, showIncorrect), animation: !showFeedback ? `staggerFadeUp 220ms ${idx * 60}ms ease-out both` : undefined }}
                type="button"
              >
                <span style={badgeStyle(active, showCorrect, showIncorrect)}>
                  {showCorrect ? "✓" : showIncorrect ? "✗" : letters[idx]}
                </span>
                {capitalizeLead(option.text)}
              </button>
            );
          })}
        </div>
      )}

      {showFeedback ? (
        <div
          style={{
            borderRadius: 16,
            padding: "12px 14px",
            marginBottom: 16,
            background: isCorrect ? "#f0fdf4" : "#fff1f2",
            border: `2px solid ${isCorrect ? "#22c55e" : "#f43f5e"}`,
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: isCorrect ? "#15803d" : "#be123c",
              marginBottom: 4,
            }}
          >
            {isCorrect ? "Correct!" : "Not quite"}
          </div>
          <div style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6 }}>
            {capitalizeLead(feedbackText)}
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 16 }}>
        <button
          ref={showFeedback && isCorrect ? continueBtnRef : undefined}
          disabled={!showFeedback && !canSubmit}
          onClick={showFeedback ? handleAdvance : handleSubmit}
          style={{
            width: "100%",
            padding: "16px",
            fontFamily: font,
            fontWeight: 800,
            fontSize: 16,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#fff",
            border: "none",
            borderRadius: 16,
            cursor: showFeedback || canSubmit ? "pointer" : "not-allowed",
            background: showFeedback || canSubmit ? "#22c55e" : "#d1d5db",
            boxShadow: showFeedback || canSubmit ? "0 5px 0 #16a34a" : "0 5px 0 #b0b7c3",
            transition: "all 200ms",
            animation: showFeedback && isCorrect ? "ha-slam-in 320ms cubic-bezier(0.22,1,0.36,1) both" : undefined,
          }}
          type="button"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
