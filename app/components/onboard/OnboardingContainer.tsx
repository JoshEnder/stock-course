"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import OnboardShell from "./OnboardShell";
import ScreenQuestion, { type QuestionOption } from "./ScreenQuestion";
import ScreenInterstitial from "./ScreenInterstitial";
import ScreenFinal from "./ScreenFinal";
import { queueRoadmapLoginGate } from "@/app/lib/post-onboarding-login-gate";
import { buildQuizData, saveQuizData } from "@/app/lib/onboarding-quiz";

// ─── Step definitions ─────────────────────────────────────────────────────────

interface QuestionStep  { id: string; type: "question"; question: string; affirmation: string; options: QuestionOption[] }
interface InterStep     { type: "interstitial";  visual: "trade" | "path"; headline: string; body: string }
interface FinalStep     { type: "final" }

type Step = QuestionStep | InterStep | FinalStep;

const STEPS: Step[] = [
  {
    id: "experienceLevel",
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
    id: "goal",
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
    id: "unclear",
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
    id: "learningStyle",
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
    id: "timeCommitment",
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
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
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

  function handleFinish() {
    const experienceLevel = STEPS.findIndex((entry) => entry.type === "question" && entry.id === "experienceLevel");
    const goal = STEPS.findIndex((entry) => entry.type === "question" && entry.id === "goal");
    const timeCommitment = STEPS.findIndex((entry) => entry.type === "question" && entry.id === "timeCommitment");

    saveQuizData(
      buildQuizData({
        experienceLevel: experienceLevel >= 0 ? answers[experienceLevel] : undefined,
        goal: goal >= 0 ? answers[goal] : undefined,
        timeCommitment: timeCommitment >= 0 ? answers[timeCommitment] : undefined,
      }),
    );
    queueRoadmapLoginGate();
    router.push("/course");
  }

  // Compute CTA state for the shell
  function getCTA() {
    if (step.type === "question") {
      return {
        label: "Continue",
        enabled: questionSelected !== null || answers[idx] != null,
        onClick: goNext,
      };
    }
    if (step.type === "interstitial") {
      return { label: "Continue", enabled: true, onClick: goNext };
    }
    if (step.type === "final") {
      return { label: "See your roadmap", enabled: true, onClick: handleFinish };
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
        <ScreenFinal ctaHref="/course" />
      )}
    </OnboardShell>
  );
}
