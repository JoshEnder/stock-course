import {
  courseLessonCount,
  courseModules,
  type CourseLesson,
  type CourseModule,
  type LessonState,
} from "../data/course-data";

export type CourseProgressRecord = {
  completedLessonIds: string[];
  hearts: number;
  lastOpenedLessonId: string | null;
  lastHeartRefillAt: string | null;
  lastStreakActiveOn: string | null;
  seededDemo: boolean;
  streakCount: number;
};

export type DerivedLesson = CourseLesson & {
  state: LessonState;
};

export type DerivedModule = CourseModule & {
  locked: boolean;
  completed: boolean;
  completionCount: number;
  progressPercent: number;
  lessons: DerivedLesson[];
};

export const defaultCourseProgress: CourseProgressRecord = {
  completedLessonIds: [],
  hearts: 5,
  lastOpenedLessonId: null,
  lastHeartRefillAt: null,
  lastStreakActiveOn: null,
  seededDemo: false,
  streakCount: 1,
};

export function createDemoCourseProgress(): CourseProgressRecord {
  const completedLessonIds = courseModules
    .flatMap((module) => module.lessons)
    .slice(0, 12)
    .map((lesson) => lesson.id);

  return {
    completedLessonIds,
    hearts: 5,
    lastOpenedLessonId: courseModules[1]?.lessons[2]?.id ?? null,
    lastHeartRefillAt: null,
    lastStreakActiveOn: new Date().toISOString().slice(0, 10),
    seededDemo: true,
    streakCount: 5,
  };
}

function isLessonCompleted(progress: CourseProgressRecord, lessonId: string) {
  return progress.completedLessonIds.includes(lessonId);
}

function isModuleCompleted(progress: CourseProgressRecord, module: CourseModule) {
  return module.lessons.every((lesson) => isLessonCompleted(progress, lesson.id));
}

function isModuleUnlocked(progress: CourseProgressRecord, moduleIndex: number) {
  if (moduleIndex === 0) {
    return true;
  }

  return isModuleCompleted(progress, courseModules[moduleIndex - 1]);
}

function getCurrentLessonId(progress: CourseProgressRecord) {
  for (let moduleIndex = 0; moduleIndex < courseModules.length; moduleIndex += 1) {
    const courseModule = courseModules[moduleIndex];

    if (!isModuleUnlocked(progress, moduleIndex)) {
      continue;
    }

    const nextLesson = courseModule.lessons.find(
      (lesson) => !isLessonCompleted(progress, lesson.id),
    );

    if (nextLesson) {
      return nextLesson.id;
    }
  }

  return null;
}

export function deriveCourseState(progress: CourseProgressRecord) {
  const currentLessonId = getCurrentLessonId(progress);
  const modules: DerivedModule[] = courseModules.map((module, moduleIndex) => {
    const locked = !isModuleUnlocked(progress, moduleIndex);
    const completionCount = module.lessons.filter((lesson) =>
      isLessonCompleted(progress, lesson.id),
    ).length;
    const completed = completionCount === module.lessons.length;

    const lessons = module.lessons.map((lesson): DerivedLesson => {
      if (isLessonCompleted(progress, lesson.id)) {
        return { ...lesson, state: "completed" };
      }

      if (locked) {
        return { ...lesson, state: "locked" };
      }

      if (lesson.id === currentLessonId) {
        return { ...lesson, state: "current" };
      }

      const reachedCurrent = module.lessons.some((item) => item.id === currentLessonId);

      if (!reachedCurrent) {
        return { ...lesson, state: "unlocked" };
      }

      const beforeCurrent =
        module.lessons.findIndex((item) => item.id === lesson.id) <
        module.lessons.findIndex((item) => item.id === currentLessonId);

      return { ...lesson, state: beforeCurrent ? "unlocked" : "locked" };
    });

    return {
      ...module,
      locked,
      completed,
      completionCount,
      progressPercent: (completionCount / module.lessons.length) * 100,
      lessons,
    };
  });

  const completedLessons = progress.completedLessonIds.length;
  const unlockedModules = modules.filter((module) => !module.locked).length;
  const currentModule = modules.find((module) =>
    module.lessons.some((lesson) => lesson.id === currentLessonId),
  );
  const completionPercent = (completedLessons / courseLessonCount) * 100;
  const streak = Math.max(1, progress.streakCount);
  const rank =
    completedLessons >= 90
      ? "Master Analyst"
      : completedLessons >= 60
        ? "Pattern Reader"
        : completedLessons >= 25
          ? "Market Explorer"
          : "Beginner Investor";

  return {
    modules,
    currentLessonId,
    currentModuleId: currentModule?.id ?? courseModules[0].id,
    completedLessons,
    totalLessons: courseLessonCount,
    completionPercent,
    unlockedModules,
    streak,
    rank,
    lastOpenedLessonId: progress.lastOpenedLessonId,
    allLessonsCompleted: completedLessons === courseLessonCount,
  };
}

export function getNextLessonRoute(progress: CourseProgressRecord) {
  const derived = deriveCourseState(progress);
  const currentLesson = derived.modules
    .flatMap((module) => module.lessons)
    .find((lesson) => lesson.id === derived.currentLessonId);

  return currentLesson?.route ?? "/course";
}

export function getLessonContext(moduleSlug: string, lessonSlug: string) {
  const courseModule = courseModules.find((item) => item.slug === moduleSlug);

  if (!courseModule) {
    return null;
  }

  const lesson = courseModule.lessons.find((item) => item.slug === lessonSlug);

  if (!lesson) {
    return null;
  }

  const moduleIndex = courseModules.findIndex((item) => item.slug === courseModule.slug);

  return {
    module: courseModule,
    lesson,
    moduleIndex,
    lessonIndex: courseModule.lessons.findIndex((item) => item.id === lesson.id),
  };
}

export function getFollowingLesson(lessonId: string) {
  const allLessons = courseModules.flatMap((module) => module.lessons);
  const currentIndex = allLessons.findIndex((lesson) => lesson.id === lessonId);

  if (currentIndex === -1 || currentIndex === allLessons.length - 1) {
    return null;
  }

  return allLessons[currentIndex + 1];
}
