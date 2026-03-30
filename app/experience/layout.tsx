import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Instinct Challenge · Stoked",
  description:
    "Three real market scenarios. Make the call. Discover your instincts.",
};

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#f7f6f3",
        minHeight: "100svh",
      }}
    >
      {children}
    </div>
  );
}
