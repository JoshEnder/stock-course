"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../lib/auth-context";

const gatedPrefixes = [
  "/analysis",
  "/certificate",
  "/completion",
  "/course",
  "/final-practice",
  "/leaderboard",
  "/lesson",
  "/profile",
];

function shouldRequireUsernameOnPath(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  return gatedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function UsernameGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { loading, needsUsername, user } = useAuth();

  useEffect(() => {
    if (loading || !user || !needsUsername || !shouldRequireUsernameOnPath(pathname)) {
      return;
    }

    const search = searchParams?.toString();
    const next = search ? `${pathname}?${search}` : pathname ?? "/course";
    router.replace(`/username?next=${encodeURIComponent(next)}`);
  }, [loading, needsUsername, pathname, router, searchParams, user]);

  return <>{children}</>;
}
