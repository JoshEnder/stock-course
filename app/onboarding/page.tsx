import type { Metadata } from "next";
import OnboardingContainer from "../components/onboard/OnboardingContainer";

export const metadata: Metadata = {
  title: "Onboarding | Stock Academy",
  description: "Complete onboarding and begin the stock learning course.",
};

export default function OnboardingPage() {
  return <OnboardingContainer />;
}
