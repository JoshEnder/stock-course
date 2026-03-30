import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Onboarding | Stock Academy",
  description: "Complete onboarding and begin the stock learning course.",
};

export default function OnboardingPage() {
  redirect("/onboard");
}
