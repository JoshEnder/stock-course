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

const EMERALD = "var(--alpine-emerald)";
const CREAM = "var(--alpine-cream)";
const TEXT = "var(--alpine-text)";
const DIM = "var(--alpine-text-tertiary)";
const ERROR = "var(--alpine-error)";
const serif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";
const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

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
  const optionList = useMemo(
    () => activeCase?.options ?? content.options ?? [],
    [activeCase, content.options],
  );
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

  const letters = ["A", "B", "C", "D", "E", "F"];

  function optionStyle(
    active: boolean,
    showCorrect: boolean,
    showIncorrect: boolean,
  ): CSSProperties {
    let bg = "rgba(22,49,74,0.64)";
    let border = "rgba(95,143,179,0.18)";
    let color = TEXT;
    if (showCorrect) {
      bg = "rgba(39,211,195,0.12)";
      border = EMERALD;
      color = EMERALD;
    }
    if (showIncorrect) {
      bg = "rgba(217,109,127,0.12)";
      border = ERROR;
      color = ERROR;
    }
    if (active && !showFeedback) {
      bg = "rgba(39,211,195,0.08)";
      border = "rgba(127,231,242,0.36)";
      color = CREAM;
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
      border: `1px solid ${border}`,
      borderRadius: 10,
      color,
      fontFamily: sans,
      fontSize: "clamp(14px, 2vw, 15px)" as string,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 150ms",
    };
  }

  function badgeStyle(
    active: boolean,
    showCorrect: boolean,
    showIncorrect: boolean,
  ): CSSProperties {
    let bg = "rgba(159,199,222,0.12)";
    let color = DIM;
    if (showCorrect) { bg = EMERALD; color = "#fff"; }
    if (showIncorrect) { bg = ERROR; color = "#fff"; }
    if (active && !showFeedback && !showCorrect && !showIncorrect) { bg = EMERALD; color = "#fff"; }

    return {
      flexShrink: 0,
      width: 28,
      height: 28,
      borderRadius: 6,
      background: bg,
      color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 600,
      fontSize: 12,
    };
  }

  const feedbackText = selectedOption?.feedback ?? explanation;
  const actionLabel = showFeedback
    ? isCorrect
      ? isRapidFire
        ? isLastRapidFireCase
          ? "Continue"
          : "Next"
        : "Continue"
      : "Try again"
    : "Check answer";

  return (
    <div style={{ fontFamily: sans }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: DIM }}>
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
                  width: index === caseIndex ? 20 : 8,
                  height: 8,
                  borderRadius: 99,
                  background: index < caseIndex ? EMERALD : index === caseIndex ? "rgba(39,211,195,0.5)" : "rgba(159,199,222,0.12)",
                  transition: "all 220ms",
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: DIM, fontVariantNumeric: "tabular-nums" }}>
            {caseIndex + 1}/{rapidFireCases.length}
          </span>
        </div>
      ) : null}

      <h2 style={{
        fontSize: "clamp(20px,3vw,30px)",
        fontFamily: serif,
        fontWeight: 600,
        color: CREAM,
        letterSpacing: "-0.01em",
        marginBottom: 24,
        lineHeight: 1.2,
      }}>
        {prompt}
      </h2>

      {answerType === "truefalse" ? (
        <div key={`${prompt}-tf`} style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
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
                className={!active && !showFeedback ? "lesson-option" : undefined}
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
        <div key={`${prompt}-${caseIndex}`} style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
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
                className={!active && !showFeedback ? "lesson-option" : undefined}
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
        <div style={{
          borderLeft: `3px solid ${isCorrect ? EMERALD : ERROR}`,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 12,
          paddingBottom: 12,
          marginBottom: 16,
          background: isCorrect ? "rgba(39,211,195,0.06)" : "rgba(217,109,127,0.06)",
          borderRadius: "0 8px 8px 0",
          animation: "lessonStepEnter 280ms cubic-bezier(0.22,1,0.36,1) both",
        }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: isCorrect ? EMERALD : ERROR, marginBottom: 6 }}>
            {isCorrect ? "Correct" : "Not quite"}
          </div>
          <div style={{ fontSize: 14, color: TEXT, lineHeight: 1.6 }}>
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
            padding: "14px",
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "0.01em",
            color: (showFeedback || canSubmit) ? "#08111d" : DIM,
            border: "none",
            borderRadius: 10,
            cursor: showFeedback || canSubmit ? "pointer" : "not-allowed",
            background: (showFeedback || canSubmit)
              ? "linear-gradient(180deg, #efe8d9 0%, var(--alpine-cream) 100%)"
              : "rgba(22,49,74,0.68)",
            boxShadow: (showFeedback || canSubmit) ? "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28)" : "none",
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
