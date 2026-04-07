"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CourseLesson, CourseModule } from "../data/course-data";
import {
  LockIcon,
  XIcon,
} from "../components/icons";
import { JourneyLink } from "../components/journey-link";
import { JourneySurface } from "../components/journey-surface";
import { LessonCheckStep } from "../components/lesson-check-step";
import { LessonLearnStep } from "../components/lesson-learn-step";
import { LessonPracticeStep } from "../components/lesson-practice-step";
import { LessonRewardStep } from "../components/lesson-reward-step";
import {
  type DerivedLesson,
  type DerivedModule,
  deriveCourseState,
  getNextLessonRoute,
} from "../lib/course-engine";
import {
  getLessonExperienceAsync,
  getLessonExperienceFallback,
} from "../lib/lesson-experience";
import {
  completeLesson,
  getProgressWithCompletedLesson,
  getServerCourseProgressSnapshot,
  getStoredCourseProgress,
  openLesson,
  refreshStoredHearts,
  spendHeart,
  subscribeToCourseProgress,
} from "../lib/course-progress";
import { addReviewPrompt } from "../lib/course-storage";
import { useAuth } from "../lib/auth-context";
import { navigateWithJourney } from "../lib/journey-motion";

type LessonShellScreenProps = {
  lesson: CourseLesson;
  module: CourseModule;
};

type PlayerStep = "learn" | "practice" | "check" | "reward";

const stepSequence: PlayerStep[] = ["learn", "practice", "check", "reward"];

function BossStepSkeleton({ label }: { label: string }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid var(--alpine-border-soft)",
        background:
          "linear-gradient(180deg, rgba(22,49,74,0.94) 0%, rgba(10,22,38,0.96) 100%)",
        padding: "48px 32px",
        textAlign: "center",
        boxShadow: "var(--alpine-shadow-lg)",
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--alpine-teal)" }}>
        Checkpoint
      </p>
      <h2 style={{ marginTop: 16, fontSize: 22, fontWeight: 600, color: "var(--alpine-text)", fontFamily: "var(--font-eb-garamond,'EB Garamond',Georgia,serif)" }}>
        Loading {label.toLowerCase()}…
      </h2>
      <p style={{ marginTop: 12, maxWidth: 400, marginLeft: "auto", marginRight: "auto", fontSize: 14, lineHeight: 1.6, color: "var(--alpine-text-tertiary)" }}>
        Preparing the checkpoint.
      </p>
    </div>
  );
}

function loadBossComponent<TProps>(
  loader: () => Promise<ComponentType<TProps>>,
  label: string,
) {
  return dynamic(loader, {
    loading: () => <BossStepSkeleton label={label} />,
    ssr: false,
  });
}

const FoundationsBossPractice = loadBossComponent(
  () =>
    import("../components/foundations-boss-checkpoint").then(
      (mod) => mod.FoundationsBossPractice,
    ),
  "boss practice",
);
const FoundationsBossCheck = loadBossComponent(
  () =>
    import("../components/foundations-boss-checkpoint").then(
      (mod) => mod.FoundationsBossCheck,
    ),
  "boss check",
);
const ChartBasicsBossPractice = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.ChartBasicsBossPractice,
    ),
  "boss practice",
);
const ChartBasicsBossCheck = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.ChartBasicsBossCheck,
    ),
  "boss check",
);
const TrendMomentumBossPractice = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.TrendMomentumBossPractice,
    ),
  "boss practice",
);
const TrendMomentumBossCheck = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.TrendMomentumBossCheck,
    ),
  "boss check",
);
const SupportResistanceBossPractice = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.SupportResistanceBossPractice,
    ),
  "boss practice",
);
const SupportResistanceBossCheck = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.SupportResistanceBossCheck,
    ),
  "boss check",
);
const BreakoutVolumeBossPractice = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.BreakoutVolumeBossPractice,
    ),
  "boss practice",
);
const BreakoutVolumeBossCheck = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.BreakoutVolumeBossCheck,
    ),
  "boss check",
);
const BusinessFundamentalsBossPractice = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.BusinessFundamentalsBossPractice,
    ),
  "boss practice",
);
const BusinessFundamentalsBossCheck = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.BusinessFundamentalsBossCheck,
    ),
  "boss check",
);
const MarketCapRevenueBossPractice = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.MarketCapRevenueBossPractice,
    ),
  "boss practice",
);
const MarketCapRevenueBossCheck = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.MarketCapRevenueBossCheck,
    ),
  "boss check",
);
const EpsPeBossPractice = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.EpsPeBossPractice,
    ),
  "boss practice",
);
const EpsPeBossCheck = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.EpsPeBossCheck,
    ),
  "boss check",
);
const PuttingItTogetherBossPractice = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.PuttingItTogetherBossPractice,
    ),
  "boss practice",
);
const PuttingItTogetherBossCheck = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.PuttingItTogetherBossCheck,
    ),
  "boss check",
);
const FinalMasteryBossPractice = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.FinalMasteryBossPractice,
    ),
  "boss practice",
);
const FinalMasteryBossCheck = loadBossComponent(
  () =>
    import("../components/module-boss-checkpoints").then(
      (mod) => mod.FinalMasteryBossCheck,
    ),
  "boss check",
);

export function LessonShellScreen({
  lesson,
  module,
}: LessonShellScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const storedProgress = useSyncExternalStore(
    subscribeToCourseProgress,
    getStoredCourseProgress,
    getServerCourseProgressSnapshot,
  );
  const [currentStep, setCurrentStep] = useState<PlayerStep>("learn");
  const [foundationsBossStep, setFoundationsBossStep] = useState(0);
  const [chartBossStep, setChartBossStep] = useState(0);
  const [trendBossStep, setTrendBossStep] = useState(0);
  const [supportBossStep, setSupportBossStep] = useState(0);
  const [breakoutBossStep, setBreakoutBossStep] = useState(0);
  const [businessBossStep, setBusinessBossStep] = useState(0);
  const [marketCapBossStep, setMarketCapBossStep] = useState(0);
  const [epsBossStep, setEpsBossStep] = useState(0);
  const [puttingItTogetherBossStep, setPuttingItTogetherBossStep] = useState(0);
  const [finalMasteryBossStep, setFinalMasteryBossStep] = useState(0);
  const [phaseDirection, setPhaseDirection] = useState<"forward" | "back">("forward");
  const [phaseTransitionKey, setPhaseTransitionKey] = useState(0);
  const previousStepIndexRef = useRef(0);

  function handleIncorrect(reviewPrompt: string) {
    addReviewPrompt(reviewPrompt);
    spendHeart(Boolean(user));
  }

  function handleLessonCompleted() {
    completeLesson(lesson.id);
    setCurrentStep("reward");
  }

  const courseState = useMemo(
    () => deriveCourseState(storedProgress),
    [storedProgress],
  );
  const rewardPreviewProgress = useMemo(
    () => (currentStep === "reward" ? getProgressWithCompletedLesson(storedProgress, lesson.id) : storedProgress),
    [currentStep, lesson.id, storedProgress],
  );
  const rewardCourseState = useMemo(
    () => deriveCourseState(rewardPreviewProgress),
    [rewardPreviewProgress],
  );
  const derivedModule = courseState.modules.find(
    (item) => item.id === module.id,
  ) as DerivedModule | undefined;
  const derivedLesson = derivedModule?.lessons.find(
    (item) => item.id === lesson.id,
  ) as DerivedLesson | undefined;
  const [experience, setExperience] = useState(() =>
    getLessonExperienceFallback(module, lesson),
  );
  const rewardDerivedModule = rewardCourseState.modules.find(
    (item) => item.id === module.id,
  ) as DerivedModule | undefined;
  const rewardNextModule = rewardCourseState.modules.find((item) => item.id === module.id + 1);

  useEffect(() => {
    let active = true;
    setExperience(getLessonExperienceFallback(module, lesson));

    getLessonExperienceAsync(module, lesson).then((nextExperience) => {
      if (active) {
        setExperience(nextExperience);
      }
    });

    return () => {
      active = false;
    };
  }, [lesson, module]);
  const currentStepIndex = stepSequence.indexOf(currentStep);
  const stepProgress = ((currentStepIndex + 1) / stepSequence.length) * 100;
  const qaUnlocked = searchParams.get("qa") === "1";
  const isFoundationsBoss = module.id === 1 && lesson.lessonNumber === 10;
  const isChartBasicsBoss = module.id === 2 && lesson.lessonNumber === 10;
  const isTrendBoss = module.id === 3 && lesson.lessonNumber === 10;
  const isSupportBoss = module.id === 4 && lesson.lessonNumber === 10;
  const isBreakoutBoss = module.id === 5 && lesson.lessonNumber === 10;
  const isBusinessBoss = module.id === 6 && lesson.lessonNumber === 10;
  const isMarketCapBoss = module.id === 7 && lesson.lessonNumber === 10;
  const isEpsBoss = module.id === 8 && lesson.lessonNumber === 10;
  const isPuttingItTogetherBoss = module.id === 9 && lesson.lessonNumber === 10;
  const isFinalMasteryBoss = module.id === 10 && lesson.lessonNumber === 10;

  useEffect(() => {
    setCurrentStep("learn");
    setFoundationsBossStep(0);
    setChartBossStep(0);
    setTrendBossStep(0);
    setSupportBossStep(0);
    setBreakoutBossStep(0);
    setBusinessBossStep(0);
    setMarketCapBossStep(0);
    setEpsBossStep(0);
    setPuttingItTogetherBossStep(0);
    setFinalMasteryBossStep(0);
    previousStepIndexRef.current = 0;
  }, [lesson.id]);

  useEffect(() => {
    if (user) {
      refreshStoredHearts(true);
    }
  }, [user, lesson.id]);

  useEffect(() => {
    if (!user) {
      return () => undefined;
    }

    const intervalId = window.setInterval(() => {
      refreshStoredHearts(true);
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    const previousIndex = previousStepIndexRef.current;

    if (previousIndex === currentStepIndex) {
      return;
    }

    setPhaseDirection(currentStepIndex >= previousIndex ? "forward" : "back");
    setPhaseTransitionKey((value) => value + 1);
    previousStepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  useEffect(() => {
    if (
      derivedLesson &&
      derivedLesson.state !== "locked" &&
      storedProgress.lastOpenedLessonId !== lesson.id
    ) {
      openLesson(lesson.id);
    }
  }, [derivedLesson, lesson.id, storedProgress.lastOpenedLessonId]);

  if (!derivedLesson) {
    return null;
  }

  function renderStep() {
    const stepLesson = derivedLesson;

    if (!stepLesson) {
      return null;
    }

    if (stepLesson.state === "locked" && !qaUnlocked) {
      return (
        <div
          style={{
            borderRadius: 16,
            border: "1px solid var(--alpine-border-soft)",
            background:
              "linear-gradient(180deg, rgba(22,49,74,0.94) 0%, rgba(10,22,38,0.96) 100%)",
            padding: "48px 32px",
            textAlign: "center",
            boxShadow: "var(--alpine-shadow-lg)",
          }}
        >
          <span style={{ display: "inline-flex", width: 56, height: 56, alignItems: "center", justifyContent: "center", borderRadius: 99, background: "rgba(95,143,179,0.12)", color: "var(--alpine-text-tertiary)" }}>
            <LockIcon className="h-6 w-6" />
          </span>
          <h2 style={{ marginTop: 20, fontSize: 22, fontWeight: 600, color: "var(--alpine-text)", fontFamily: "var(--font-eb-garamond,'EB Garamond',Georgia,serif)" }}>
            This lesson is still locked
          </h2>
          <p style={{ marginTop: 12, maxWidth: 400, marginLeft: "auto", marginRight: "auto", fontSize: 14, lineHeight: 1.6, color: "var(--alpine-text-tertiary)" }}>
            Complete earlier lessons in this module to continue.
          </p>
          <JourneyLink
            className="mt-8 inline-flex items-center justify-center"
            style={{
              padding: "0 28px", height: 48, borderRadius: 10, fontSize: 14, fontWeight: 500,
              color: "#08111d",
              background: "linear-gradient(180deg, #efe8d9 0%, var(--alpine-cream) 100%)",
              border: "none",
              letterSpacing: "0.01em",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28)",
            }}
            href="/course"
            intent="return"
            prefetch={false}
          >
            Return to course map
          </JourneyLink>
        </div>
      );
    }

    if (currentStep === "learn") {
      return (
        <LessonLearnStep
          content={experience.learn}
          onContinue={() => setCurrentStep("practice")}
        />
      );
    }

    if (currentStep === "practice") {
      if (isFoundationsBoss) {
        return (
          <FoundationsBossPractice
            currentStep={Math.min(foundationsBossStep, 3)}
            onAdvanceToCheck={() => setCurrentStep("check")}
            onIncorrect={handleIncorrect}
            onStepChange={setFoundationsBossStep}
          />
        );
      }

      if (isChartBasicsBoss) {
        return (
          <ChartBasicsBossPractice
            currentStep={Math.min(chartBossStep, 3)}
            onAdvanceToCheck={() => setCurrentStep("check")}
            onIncorrect={handleIncorrect}
            onStepChange={setChartBossStep}
          />
        );
      }

      if (isTrendBoss) {
        return (
          <TrendMomentumBossPractice
            currentStep={Math.min(trendBossStep, 3)}
            onAdvanceToCheck={() => setCurrentStep("check")}
            onIncorrect={handleIncorrect}
            onStepChange={setTrendBossStep}
          />
        );
      }

      if (isSupportBoss) {
        return (
          <SupportResistanceBossPractice
            currentStep={Math.min(supportBossStep, 3)}
            onAdvanceToCheck={() => setCurrentStep("check")}
            onIncorrect={handleIncorrect}
            onStepChange={setSupportBossStep}
          />
        );
      }

      if (isBreakoutBoss) {
        return (
          <BreakoutVolumeBossPractice
            currentStep={Math.min(breakoutBossStep, 3)}
            onAdvanceToCheck={() => setCurrentStep("check")}
            onIncorrect={handleIncorrect}
            onStepChange={setBreakoutBossStep}
          />
        );
      }

      if (isBusinessBoss) {
        return (
          <BusinessFundamentalsBossPractice
            currentStep={Math.min(businessBossStep, 3)}
            onAdvanceToCheck={() => setCurrentStep("check")}
            onIncorrect={handleIncorrect}
            onStepChange={setBusinessBossStep}
          />
        );
      }

      if (isMarketCapBoss) {
        return (
          <MarketCapRevenueBossPractice
            currentStep={Math.min(marketCapBossStep, 3)}
            onAdvanceToCheck={() => setCurrentStep("check")}
            onIncorrect={handleIncorrect}
            onStepChange={setMarketCapBossStep}
          />
        );
      }

      if (isEpsBoss) {
        return (
          <EpsPeBossPractice
            currentStep={Math.min(epsBossStep, 3)}
            onAdvanceToCheck={() => setCurrentStep("check")}
            onIncorrect={handleIncorrect}
            onStepChange={setEpsBossStep}
          />
        );
      }

      if (isPuttingItTogetherBoss) {
        return (
          <PuttingItTogetherBossPractice
            currentStep={Math.min(puttingItTogetherBossStep, 3)}
            onAdvanceToCheck={() => setCurrentStep("check")}
            onIncorrect={handleIncorrect}
            onStepChange={setPuttingItTogetherBossStep}
          />
        );
      }

      if (isFinalMasteryBoss) {
        return (
          <FinalMasteryBossPractice
            currentStep={Math.min(finalMasteryBossStep, 3)}
            onAdvanceToCheck={() => setCurrentStep("check")}
            onIncorrect={handleIncorrect}
            onStepChange={setFinalMasteryBossStep}
          />
        );
      }

      return (
        <LessonPracticeStep
          content={experience.practice}
          onContinue={() => setCurrentStep("check")}
          onIncorrect={handleIncorrect}
        />
      );
    }

    if (currentStep === "check") {
      if (isFoundationsBoss) {
        return (
          <FoundationsBossCheck
            onComplete={handleLessonCompleted}
            onIncorrect={handleIncorrect}
            onSetbackToPractice={(step) => {
              setFoundationsBossStep(step);
              setCurrentStep("practice");
            }}
          />
        );
      }

      if (isChartBasicsBoss) {
        return (
          <ChartBasicsBossCheck
            onComplete={handleLessonCompleted}
            onIncorrect={handleIncorrect}
            onSetbackToPractice={(step) => {
              setChartBossStep(step);
              setCurrentStep("practice");
            }}
          />
        );
      }

      if (isTrendBoss) {
        return (
          <TrendMomentumBossCheck
            onComplete={handleLessonCompleted}
            onIncorrect={handleIncorrect}
            onSetbackToPractice={(step) => {
              setTrendBossStep(step);
              setCurrentStep("practice");
            }}
          />
        );
      }

      if (isSupportBoss) {
        return (
          <SupportResistanceBossCheck
            onComplete={handleLessonCompleted}
            onIncorrect={handleIncorrect}
            onSetbackToPractice={(step) => {
              setSupportBossStep(step);
              setCurrentStep("practice");
            }}
          />
        );
      }

      if (isBreakoutBoss) {
        return (
          <BreakoutVolumeBossCheck
            onComplete={handleLessonCompleted}
            onIncorrect={handleIncorrect}
            onSetbackToPractice={(step) => {
              setBreakoutBossStep(step);
              setCurrentStep("practice");
            }}
          />
        );
      }

      if (isBusinessBoss) {
        return (
          <BusinessFundamentalsBossCheck
            onComplete={handleLessonCompleted}
            onIncorrect={handleIncorrect}
            onSetbackToPractice={(step) => {
              setBusinessBossStep(step);
              setCurrentStep("practice");
            }}
          />
        );
      }

      if (isMarketCapBoss) {
        return (
          <MarketCapRevenueBossCheck
            onComplete={handleLessonCompleted}
            onIncorrect={handleIncorrect}
            onSetbackToPractice={(step) => {
              setMarketCapBossStep(step);
              setCurrentStep("practice");
            }}
          />
        );
      }

      if (isEpsBoss) {
        return (
          <EpsPeBossCheck
            onComplete={handleLessonCompleted}
            onIncorrect={handleIncorrect}
            onSetbackToPractice={(step) => {
              setEpsBossStep(step);
              setCurrentStep("practice");
            }}
          />
        );
      }

      if (isPuttingItTogetherBoss) {
        return (
          <PuttingItTogetherBossCheck
            onComplete={handleLessonCompleted}
            onIncorrect={handleIncorrect}
            onSetbackToPractice={(step) => {
              setPuttingItTogetherBossStep(step);
              setCurrentStep("practice");
            }}
          />
        );
      }

      if (isFinalMasteryBoss) {
        return (
          <FinalMasteryBossCheck
            onComplete={handleLessonCompleted}
            onIncorrect={handleIncorrect}
            onSetbackToPractice={(step) => {
              setFinalMasteryBossStep(step);
              setCurrentStep("practice");
            }}
          />
        );
      }

      return (
        <LessonCheckStep
          content={experience.check}
          onContinue={handleLessonCompleted}
          onIncorrect={handleIncorrect}
        />
      );
    }

    return (
      <LessonRewardStep
        accentColor={module.accentColor}
        completedLessons={rewardCourseState.completedLessons}
        completionLine={experience.rewardLine}
        courseCompletionPercent={rewardCourseState.completionPercent}
        isBossLesson={lesson.isBoss}
        lessonTitle={lesson.title}
        masteryTags={experience.masteryTags ?? []}
        moduleCompleted={Boolean(rewardDerivedModule?.completed)}
        moduleProgressPercent={rewardDerivedModule?.progressPercent ?? 0}
        moduleTitle={module.title}
        moduleProgressLabel={`${rewardCourseState.completedLessons}/100 lessons completed`}
        nextUnlockTitle={rewardDerivedModule?.completed ? rewardNextModule?.title ?? null : null}
        onContinue={() => {
          const latestCourseState = deriveCourseState(rewardPreviewProgress);
          const latestModule = latestCourseState.modules.find((item) => item.id === module.id);
          const latestNextModule = latestCourseState.modules.find((item) => item.id === module.id + 1);

          if (latestCourseState.allLessonsCompleted) {
            navigateWithJourney(router, "/completion", "milestone");
            return;
          }

          if (latestModule?.completed && latestNextModule?.lessons[0]?.route) {
            navigateWithJourney(router, latestNextModule.lessons[0].route, "milestone");
            return;
          }

          navigateWithJourney(
            router,
            getNextLessonRoute(rewardPreviewProgress),
            latestModule?.completed ? "milestone" : "lesson",
          );
        }}
        rankLabel={rewardCourseState.rank}
        xpEarned={lesson.xp}
      />
    );
  }

  const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

  return (
    <JourneySurface surface="lesson">
      <div
        className="min-h-screen"
        style={{
          fontFamily: sans,
          background:
            "linear-gradient(180deg, var(--alpine-bg) 0%, var(--alpine-bg-deep) 48%, var(--alpine-bg) 100%)",
        }}
      >
        {/* ── Top bar ──────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-40"
          style={{
            background: "rgba(10,22,38,0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--alpine-border-soft)",
          }}
        >
          <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
            {/* Close */}
            <JourneyLink
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors"
              style={{ color: "var(--alpine-text-tertiary)" }}
              href="/course"
              intent="return"
              prefetch={false}
              aria-label="Back to course map"
            >
              <XIcon className="h-5 w-5" />
            </JourneyLink>

            {/* Progress bar */}
            <div className={`lesson-phase-progress flex-1 ${phaseTransitionKey ? "is-shifting" : ""}`}>
              <div style={{ height: 4, borderRadius: 99, background: "rgba(159,199,222,0.12)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${stepProgress}%`,
                    borderRadius: 99,
                    background:
                      "linear-gradient(90deg, var(--alpine-emerald) 0%, var(--alpine-teal) 100%)",
                    transition: "width 400ms cubic-bezier(0.22,1,0.36,1)",
                    boxShadow: "0 0 16px rgba(89,240,223,0.2)",
                  }}
                />
              </div>
            </div>

            {/* Step indicator */}
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--alpine-text-tertiary)", fontVariantNumeric: "tabular-nums" }}>
              {currentStepIndex + 1}/{stepSequence.length}
            </span>
          </div>

          {/* Lesson context — inline with close/progress row */}
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pb-2" style={{ paddingLeft: 52 }}>
            <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", color: "var(--alpine-text-dim)", textTransform: "uppercase" }}>
              {module.id}.{lesson.lessonNumber}
            </span>
            <span className="hidden sm:block" style={{ fontSize: 12, fontWeight: 400, color: "var(--alpine-text-tertiary)" }}>
              {lesson.title}
            </span>
          </div>
        </header>

        {/* ── Lesson content ───────────────────────────────────── */}
        <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
          <div
            className="lesson-stage lesson-phase-stage"
            data-direction={phaseDirection}
            data-phase={currentStep}
            key={`${currentStep}-${phaseTransitionKey}`}
          >
            {renderStep()}
          </div>
        </main>
      </div>
    </JourneySurface>
  );
}
