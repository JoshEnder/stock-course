import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { courseModules } from "../../data/course-data";

type LessonPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Lesson | Stock Academy",
  description: "Interactive stock lesson player.",
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;

  const lessonNumber = Number(lessonId);

  if (!Number.isInteger(lessonNumber) || lessonNumber < 1 || lessonNumber > 10) {
    notFound();
  }

  const foundationsModule = courseModules.find((module) => module.slug === "foundations");
  const lesson = foundationsModule?.lessons.find(
    (item) => item.lessonNumber === lessonNumber,
  );

  if (!foundationsModule || !lesson) {
    notFound();
  }

  redirect(lesson.route);
}
