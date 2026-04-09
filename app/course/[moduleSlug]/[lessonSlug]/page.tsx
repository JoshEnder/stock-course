import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLessonBySlug } from "../../../data/course-data";
import { LessonShellScreen } from "../../../screens/lesson-shell-screen";

type LessonRoutePageProps = {
  params: Promise<{
    lessonSlug: string;
    moduleSlug: string;
  }>;
  searchParams?: Promise<{
    qa?: string | string[];
  }>;
};

export async function generateMetadata({
  params,
}: LessonRoutePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const lessonContext = getLessonBySlug(
    resolvedParams.moduleSlug,
    resolvedParams.lessonSlug,
  );

  if (!lessonContext) {
    return {
      title: "Lesson | Stock Academy",
    };
  }

  return {
    title: `${lessonContext.lesson.title} | ${lessonContext.module.title} | Stock Academy`,
    description: `Lesson route for ${lessonContext.lesson.title}.`,
  };
}

export default async function LessonRoutePage({
  params,
  searchParams,
}: LessonRoutePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const lessonContext = getLessonBySlug(
    resolvedParams.moduleSlug,
    resolvedParams.lessonSlug,
  );

  if (!lessonContext) {
    notFound();
  }

  return (
    <LessonShellScreen
      lesson={lessonContext.lesson}
      module={lessonContext.module}
      qaUnlocked={
        (Array.isArray(resolvedSearchParams?.qa)
          ? resolvedSearchParams?.qa[0]
          : resolvedSearchParams?.qa) === "1"
      }
    />
  );
}
