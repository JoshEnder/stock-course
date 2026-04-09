import type { Metadata } from "next";
import { UsernameSetupScreen } from "../screens/username-setup-screen";

export const metadata: Metadata = {
  title: "Choose a username | Stock Academy",
  description: "Set your unique Stoked username to unlock friends and saved identity.",
};

type UsernamePageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function UsernamePage({
  searchParams,
}: UsernamePageProps) {
  const resolvedSearchParams = await searchParams;
  const nextParam = resolvedSearchParams?.next;
  const nextPath = Array.isArray(nextParam) ? nextParam[0] : nextParam;

  return <UsernameSetupScreen nextPath={nextPath ?? null} />;
}
