"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LessonCheckStep } from "../components/lesson-check-step";
import { LessonLearnStep } from "../components/lesson-learn-step";
import { LessonPracticeStep } from "../components/lesson-practice-step";
import { MilestoneModal } from "../components/milestone-modal";
import { ProgressBar } from "../components/progress-bar";
import { lessonCatalog, lessonSteps, type LessonId } from "../lib/course-data";
import { addReviewPrompt, markLessonComplete } from "../lib/course-storage";
import { triggerLessonComplete } from "../lib/animations";

type LessonPlayerScreenProps = {
  lessonId: LessonId;
};

export function LessonPlayerScreen({ lessonId }: LessonPlayerScreenProps) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);

  const lesson = useMemo(
    () => lessonCatalog.find((item) => item.id === lessonId),
    [lessonId],
  );
  const steps = lessonSteps[lessonId];

  useEffect(() => {
    if (!lesson || !steps) {
      router.replace("/course");
    }
  }, [lesson, router, steps]);

  if (!lesson || !steps) {
    return null;
  }

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  function handleNext() {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((current) => current + 1);
      return;
    }

    markLessonComplete(lessonId);
    triggerLessonComplete();
    setShowMilestone(true);
  }

  function handleIncorrect(reviewPrompt: string) {
    addReviewPrompt(reviewPrompt);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              className="text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => router.push("/course")}
            >
              ← Back
            </button>
            <div className="text-center">
              <h4 className="font-semibold text-foreground">{lesson.title}</h4>
              <p className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
            </div>
            <div className="w-16" />
          </div>
          <ProgressBar value={progress} />
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-4 pt-4 pb-8 sm:items-center sm:px-6 sm:py-12">
        <div key={currentStepIndex} className="w-full max-w-3xl" style={{ animation: "slideInRight 280ms cubic-bezier(0.22,1,0.36,1) both" }}>
          {currentStep.type === "learn" ? (
            <LessonLearnStep onContinue={handleNext} stepId={currentStep.id} />
          ) : null}
          {currentStep.type === "practice" ? (
            <LessonPracticeStep
              onContinue={handleNext}
              onIncorrect={handleIncorrect}
              stepId={currentStep.id}
            />
          ) : null}
          {currentStep.type === "check" ? (
            <LessonCheckStep
              onContinue={handleNext}
              onIncorrect={handleIncorrect}
              stepId={currentStep.id}
            />
          ) : null}
        </div>
      </div>

      {showMilestone ? (
        <MilestoneModal
          lessonNumber={lessonId}
          lessonTitle={lesson.title}
          onContinue={() => {
            setShowMilestone(false);

            if (lessonId === 10) {
              router.push("/analysis");
              return;
            }

            router.push("/course");
          }}
        />
      ) : null}
    </div>
  );
}
