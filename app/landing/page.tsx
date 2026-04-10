import type { Metadata } from "next";
import { LandingScreen } from "../screens/landing-screen";

export const metadata: Metadata = {
  title: "Stoked | Learn stocks. Made simple.",
  description:
    "Short interactive stock lessons for beginners, designed for your phone.",
};

export default function LandingPage() {
  return <LandingScreen />;
}
