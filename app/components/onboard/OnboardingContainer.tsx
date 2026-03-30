"use client";

import { useState, useCallback } from "react";
import OnboardShell from "./OnboardShell";
import ScreenWelcome from "./ScreenWelcome";
import ScreenHook from "./ScreenHook";
import ScreenQuestion, { type QuestionOption } from "./ScreenQuestion";
import ScreenInterstitial from "./ScreenInterstitial";
import ScreenFinal from "./ScreenFinal";

const CTA_HREF = "/sign-up";

// ─── Step definitions ─────────────────────────────────────────────────────────

interface WelcomeStep   { type: "welcome";       headline: string; sub: string; cta: string }
interface HookStep      { type: "hook" }
interface QuestionStep  { type: "question";      question: string; affirmation: string; options: QuestionOption[] }
interface InterStep     { type: "interstitial";  visual: "trade" | "path"; headline: string; body: string }
interface FinalStep     { type: "final" }

type Step = WelcomeStep | HookStep | QuestionStep | InterStep | FinalStep;

const STEPS: Step[] = [
  {
    type: "welcome",
    headline: "Hey.",
    sub: "Let's figure out where you're at.",
    cta: "Sounds good",
  },
  {
    type: "welcome",
    headline: "Five quick questions.",
    sub: "Your answers shape what opens first. No right or wrong — just where you are.",
    cta: "Let's go",
  },
  { type: "hook" },
  {
    type: "question",
    question: "Where are you at with stocks right now?",
    affirmation: "Good. We'll build from there.",
    options: [
      { value: "new",      label: "Just getting into it",      feedback: "Perfect starting point." },
      { value: "basics",   label: "I understand some basics",  feedback: "Good foundation to build on." },
      { value: "explored", label: "I've explored a bit already", feedback: "Solid. We'll sharpen that." },
      { value: "deeper",   label: "I want to go deeper",       feedback: "That's exactly what this is for." },
    ],
  },
  {
    type: "question",
    question: "What's your main reason for learning?",
    affirmation: "That's a clear reason to move.",
    options: [
      { value: "wealth",     label: "Build long-term wealth",               feedback: "The right mindset." },
      { value: "understand", label: "Understand what I'm investing in",     feedback: "Knowledge first. Smart." },
      { value: "opportunity",label: "Take advantage of opportunities",      feedback: "That's what edge is for." },
      { value: "exploring",  label: "Just exploring for now",               feedback: "Curiosity is how it starts." },
    ],
  },
  {
    type: "interstitial",
    visual: "trade",
    headline: "Every lesson is a real decision.",
    body: "You see a live situation. You make a call. You see what happens and understand why.",
  },
  {
    type: "question",
    question: "What feels unclear right now?",
    affirmation: "We'll make that click.",
    options: [
      { value: "start",     label: "Where to start",                    feedback: "We'll fix that first." },
      { value: "decisions", label: "How to actually make decisions",    feedback: "Every lesson is a real call." },
      { value: "charts",    label: "Understanding charts and trends",   feedback: "We'll make that click." },
      { value: "noise",     label: "Knowing what matters vs noise",     feedback: "Signal vs noise — core skill." },
    ],
  },
  {
    type: "question",
    question: "How do you like to learn?",
    affirmation: "Your path will reflect that.",
    options: [
      { value: "structure", label: "Step-by-step structure",        feedback: "Structured path, locked in." },
      { value: "doing",     label: "Learning by doing",             feedback: "Every lesson puts you in the trade." },
      { value: "concepts",  label: "Understanding concepts first",  feedback: "We build the mental model first." },
      { value: "mix",       label: "A mix of everything",           feedback: "Adaptive. We can do that." },
    ],
  },
  {
    type: "interstitial",
    visual: "path",
    headline: "Not a course. An edge.",
    body: "Your path is built around how you learn, not a fixed syllabus. Each module unlocks the next.",
  },
  {
    type: "question",
    question: "What pace works best for you?",
    affirmation: "We'll keep it at that rhythm.",
    options: [
      { value: "daily",    label: "Quick daily sessions",                feedback: "~10 min a day. Compounding." },
      { value: "weekly",   label: "A few focused sessions per week",     feedback: "Deep focus. Good call." },
      { value: "flexible", label: "Flexible depending on the day",       feedback: "Low-pressure. Works." },
    ],
  },
  { type: "final" },
];

const TOTAL = STEPS.length;

// ─── Container ────────────────────────────────────────────────────────────────

export default function OnboardingContainer() {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  // Hook: becomes "ready to continue" only after the reveal animation completes
  const [hookReady, setHookReady] = useState(false);
  // Question: track whether user has selected on the current question step
  const [questionSelected, setQuestionSelected] = useState<string | null>(null);

  const step = STEPS[idx];
  const progress = ((idx + 1) / TOTAL) * 100;
  const showBack = idx > 0 && step.type !== "final";

  const goNext = useCallback(() => {
    setDirection(1);
    setQuestionSelected(null);
    setIdx((i) => Math.min(i + 1, TOTAL - 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setQuestionSelected(null);
    setIdx((i) => Math.max(i - 1, 0));
  }, []);

  function handleQuestionSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [idx]: value }));
    setQuestionSelected(value);
  }

  // Compute CTA state for the shell
  function getCTA() {
    if (step.type === "welcome") {
      const s = step as WelcomeStep;
      return { label: s.cta, enabled: true, onClick: goNext };
    }
    if (step.type === "hook") {
      return { label: "Continue", enabled: hookReady, onClick: goNext };
    }
    if (step.type === "question") {
      return { label: "Continue", enabled: questionSelected !== null, onClick: goNext };
    }
    if (step.type === "interstitial") {
      return { label: "Continue", enabled: true, onClick: goNext };
    }
    if (step.type === "final") {
      return { label: "Start learning", enabled: true, onClick: () => {}, href: CTA_HREF };
    }
    return { label: "Continue", enabled: true, onClick: goNext };
  }

  const cta = getCTA();

  return (
    <OnboardShell
      progress={progress}
      totalSteps={TOTAL}
      currentStep={idx + 1}
      showBack={showBack}
      onBack={goBack}
      cta={cta}
      stepKey={`step-${idx}`}
      direction={direction}
    >
      {step.type === "welcome" && (
        <ScreenWelcome
          headline={(step as WelcomeStep).headline}
          sub={(step as WelcomeStep).sub}
        />
      )}

      {step.type === "hook" && (
        <ScreenHook
          onRevealDone={() => setHookReady(true)}
        />
      )}

      {step.type === "question" && (
        <ScreenQuestion
          question={(step as QuestionStep).question}
          affirmation={(step as QuestionStep).affirmation}
          options={(step as QuestionStep).options}
          selected={answers[idx] ?? null}
          onSelect={handleQuestionSelect}
        />
      )}

      {step.type === "interstitial" && (
        <ScreenInterstitial
          visual={(step as InterStep).visual}
          headline={(step as InterStep).headline}
          body={(step as InterStep).body}
        />
      )}

      {step.type === "final" && (
        <ScreenFinal ctaHref={CTA_HREF} />
      )}
    </OnboardShell>
  );
}
