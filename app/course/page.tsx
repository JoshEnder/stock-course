import type { Metadata } from "next";
import { CourseMapScreen } from "../screens/course-map-screen";

export const metadata: Metadata = {
  title: "Course Overview | Stock Academy",
  description: "Continue the interactive stock learning journey.",
};

export default function CoursePage() {
  return <CourseMapScreen />;
}
