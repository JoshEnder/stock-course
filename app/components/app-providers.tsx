"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../lib/auth-context";
import { UsernameGate } from "./username-gate";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <UsernameGate>{children}</UsernameGate>
    </AuthProvider>
  );
}
