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
  ClockIcon,
  HeartIcon,
  LockIcon,
  SparklesIcon,
  XIcon,
} from "../components/icons";
import { JourneyLink } from "../components/journey-link";
import { JourneySurface } from "../components/journey-surface";
import { LessonCheckStep } from "../components/lesson-check-step";
import { LessonLearnStep } from "../components/lesson-learn-step";
import { LessonPracticeStep } from "../components/lesson-practice-step";
import { LessonRewardStep } from "../components/lesson-reward-step";
import { ProgressBar } from "../components/progress-bar";
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
  getEffectiveHearts,
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
    <div className="rounded-3xl border-2 border-gray-100 bg-white px-8 py-12 text-center shadow-[0_4px_0_#e5e5e5]">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#22c55e]">
        Boss checkpoint
      </p>
      <h2 className="mt-4 text-2xl font-black text-[#1a2b4a]">
        Loading {label.toLowerCase()}...
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
        Pulling in the checkpoint without blocking the rest of the lesson route.
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
  const hearts = getEffectiveHearts(storedProgress, Boolean(user));

  function handleIncorrect(reviewPrompt: string) {
    addReviewPrompt(reviewPrompt);
    spendHeart(Boolean(user));
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
        <div className="rounded-3xl border-2 border-gray-100 bg-white px-8 py-12 text-center shadow-[0_4px_0_#e5e5e5]">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <LockIcon className="h-7 w-7" />
          </span>
          <h2 className="mt-5 text-2xl font-black text-[#1a2b4a]">
            This lesson is still locked.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500">
            Complete every lesson earlier in this module path before entering this screen.
          </p>
          <JourneyLink
            className="mt-8 inline-flex rounded-2xl bg-[#22c55e] px-7 py-4 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#16a34a] transition-all hover:bg-[#1eb356] active:translate-y-[2px] active:shadow-[0_2px_0_#16a34a]"
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
            onComplete={() => {
              setCurrentStep("reward");
            }}
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
            onComplete={() => {
              setCurrentStep("reward");
            }}
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
            onComplete={() => {
              setCurrentStep("reward");
            }}
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
            onComplete={() => {
              setCurrentStep("reward");
            }}
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
            onComplete={() => {
              setCurrentStep("reward");
            }}
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
            onComplete={() => {
              setCurrentStep("reward");
            }}
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
            onComplete={() => {
              setCurrentStep("reward");
            }}
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
            onComplete={() => {
              setCurrentStep("reward");
            }}
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
            onComplete={() => {
              setCurrentStep("reward");
            }}
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
            onComplete={() => {
              setCurrentStep("reward");
            }}
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
          onContinue={() => {
            setCurrentStep("reward");
          }}
          onIncorrect={handleIncorrect}
        />
      );
    }

    return (
      <LessonRewardStep
        accentColor={module.accentColor}
        completedLessons={courseState.completedLessons}
        completionLine={experience.rewardLine}
        courseCompletionPercent={courseState.completionPercent}
        isBossLesson={lesson.isBoss}
        lessonTitle={lesson.title}
        masteryTags={experience.masteryTags ?? []}
        moduleCompleted={Boolean(rewardDerivedModule?.completed)}
        moduleProgressPercent={rewardDerivedModule?.progressPercent ?? 0}
        moduleTitle={module.title}
        moduleProgressLabel={`${courseState.completedLessons}/100 lessons completed`}
        nextUnlockTitle={rewardDerivedModule?.completed ? rewardNextModule?.title ?? null : null}
        onContinue={() => {
          const completedProgress = completeLesson(lesson.id);
          const latestCourseState = deriveCourseState(completedProgress);
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
            getNextLessonRoute(completedProgress),
            latestModule?.completed ? "milestone" : "lesson",
          );
        }}
        rankLabel={rewardCourseState.rank}
      />
    );
  }

  return (
    <JourneySurface surface="lesson">
      <div
        className="min-h-screen bg-white"
        style={{ fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)" }}
      >
        {/* ── Duolingo-style top bar ──────────────────────────── */}
        <header className="sticky top-0 z-40 border-b-2 border-gray-100 bg-white">
          <div className="mx-auto flex h-16 max-w-3xl items-center gap-4 px-4">
            {/* X / close */}
            <JourneyLink
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              href="/course"
              intent="return"
              prefetch={false}
              aria-label="Back to course map"
            >
              <XIcon className="h-5 w-5" />
            </JourneyLink>

            {/* Progress bar */}
            <div className={`lesson-phase-progress flex-1 ${phaseTransitionKey ? "is-shifting" : ""}`}>
              <ProgressBar className="h-4 bg-gray-100" value={stepProgress} />
            </div>

            {/* Hearts */}
            <div className="flex flex-shrink-0 items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <HeartIcon
                  key={n}
                  className={`h-5 w-5 ${n <= hearts ? "text-[#ef4444]" : "text-gray-200"}`}
                  style={{ fill: n <= hearts ? "#ef4444" : "#e5e7eb", stroke: "none" }}
                />
              ))}
            </div>
          </div>

          {/* Lesson meta strip */}
          <div
            className="border-t border-gray-50 px-4 py-2"
            style={{ background: `linear-gradient(90deg, ${module.accentSoft} 0%, #ffffff 80%)` }}
          >
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: module.accentColor }}>
                  Module {module.id} · Lesson {lesson.lessonNumber}
                </p>
                <span className="hidden text-xs font-semibold text-gray-500 sm:block">
                  {lesson.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-gray-600 shadow-sm">
                  <ClockIcon className="h-3 w-3" />
                  {lesson.estimatedTime}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black" style={{ background: module.accentSoft, color: module.accentColor }}>
                  <SparklesIcon className="h-3 w-3" />
                  {lesson.xp} XP
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Lesson content ───────────────────────────────────── */}
        <main className="mx-auto max-w-3xl px-4 py-10">
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
