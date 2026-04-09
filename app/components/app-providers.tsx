"use client";

import { Suspense, type ReactNode } from "react";
import { AuthProvider } from "../lib/auth-context";
import { UsernameGate } from "./username-gate";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={<>{children}</>}>
        <UsernameGate>{children}</UsernameGate>
      </Suspense>
    </AuthProvider>
  );
}
