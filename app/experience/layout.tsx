import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Your Climb · Stoked",
  description: "A few quick questions to build your path.",
};

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The mountain background is handled by the Hero in landing-screen when
  // accessed via the overlay path. This layout is a passthrough for direct
  // /experience URL access (e.g. deep links, logged-in return visits).
  return <>{children}</>;
}
