"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import {
  checkUsernameAvailability,
  normalizeUsername,
  saveUsernameForCurrentUser,
  validateUsername,
} from "../lib/user-profiles";

const EMERALD = "#10b981";
const BG = "#0a0f1a";
const SURFACE = "#1a2942";
const CREAM = "#e8e2d4";
const TEXT = "#cbd5e1";
const MUTED = "#94a3b8";
const DIM = "#5f687a";
const serif = "var(--font-eb-garamond,'EB Garamond',Georgia,serif)";
const sans = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

function StokedLogo() {
  return (
    <Link href="/" className="inline-flex items-end gap-0.5">
      <span className="text-xl font-medium tracking-tight" style={{ fontFamily: serif, color: CREAM }}>
        stoked
      </span>
      <span className="mb-[0.22em] h-2 w-2 flex-shrink-0 rounded-full" style={{ background: EMERALD }} />
    </Link>
  );
}

function normalizeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/course";
  }

  return next;
}

export function UsernameSetupScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, needsUsername, profile, refreshProfile, user } = useAuth();
  const [usernameDraft, setUsernameDraft] = useState("");
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const next = useMemo(
    () => normalizeNextPath(searchParams?.get("next") ?? null),
    [searchParams],
  );
  const normalizedDraft = normalizeUsername(usernameDraft);
  const validation = validateUsername(usernameDraft);

  useEffect(() => {
    if (profile?.username) {
      setUsernameDraft(profile.username);
    }
  }, [profile?.username]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/onboard");
      return;
    }

    if (!needsUsername && profile?.username) {
      router.replace(next);
    }
  }, [loading, needsUsername, next, profile?.username, router, user]);

  useEffect(() => {
    if (!validation.valid) {
      setAvailabilityMessage(null);
      setChecking(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setChecking(true);
      void checkUsernameAvailability(normalizedDraft, user?.id)
        .then((result) => {
          setAvailabilityMessage(result.available ? "Username available." : result.error);
        })
        .catch((error) => {
          console.warn("Username availability check failed.", error);
          setAvailabilityMessage("Unable to check availability right now.");
        })
        .finally(() => {
          setChecking(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [normalizedDraft, user?.id, validation.valid]);

  async function handleSubmit() {
    if (!validation.valid || saving) {
      if (!validation.valid) {
        setErrorMessage(validation.error);
      }
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      await saveUsernameForCurrentUser(normalizedDraft);
      await refreshProfile();
      setSuccessMessage("Username saved.");
      router.replace(next);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save that username right now.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen" style={{ fontFamily: sans, background: BG }}>
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <StokedLogo />
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD }}>
            One last step
          </span>
        </div>

        <div className="mx-auto mt-14 w-full max-w-2xl">
          <div style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: SURFACE, padding: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD }}>
              One last step
            </p>
            <h1 style={{ fontSize: "clamp(28px,4vw,38px)", fontFamily: serif, fontWeight: 600, color: CREAM, marginTop: 8, letterSpacing: "-0.01em" }}>
              Choose your username
            </h1>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.6, marginTop: 8, maxWidth: 520 }}>
              This is how your progress, streak, and future friends will recognize you in Stoked.
            </p>

            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 16 }}>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: DIM, marginBottom: 8 }}>
                  Username
                </span>
                <input
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  inputMode="text"
                  maxLength={20}
                  onChange={(event) => {
                    setUsernameDraft(event.target.value);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  placeholder="yourname"
                  spellCheck={false}
                  type="text"
                  value={usernameDraft}
                  style={{
                    width: "100%", padding: "14px 16px",
                    borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)", color: CREAM,
                    fontFamily: sans, fontSize: 17, fontWeight: 500,
                    outline: "none",
                  }}
                />
              </label>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 12, color: DIM, fontWeight: 500 }}>3-20 characters</span>
                <span style={{ fontSize: 12, color: DIM, fontWeight: 500 }}>Letters, numbers, underscores</span>
              </div>

              <div style={{ minHeight: 20, fontSize: 13, fontWeight: 500 }}>
                {errorMessage ? (
                  <p style={{ color: "#f87171" }}>{errorMessage}</p>
                ) : !validation.valid ? (
                  <p style={{ color: DIM }}>{validation.error}</p>
                ) : checking ? (
                  <p style={{ color: DIM }}>Checking availability...</p>
                ) : availabilityMessage ? (
                  <p style={{ color: availabilityMessage === "Username available." ? EMERALD : "#f87171" }}>
                    {availabilityMessage}
                  </p>
                ) : successMessage ? (
                  <p style={{ color: EMERALD }}>{successMessage}</p>
                ) : (
                  <p style={{ color: DIM }}>3–20 characters. Letters, numbers, and underscores only.</p>
                )}
              </div>
            </div>

            {/* Preview */}
            <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: DIM, marginBottom: 8 }}>
                Preview
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 13, color: MUTED }}>This is how you will appear in Stoked.</p>
                  <p style={{ fontSize: 22, fontFamily: serif, fontWeight: 600, color: CREAM, marginTop: 4 }}>
                    @{normalizedDraft || "yourname"}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD }}>
                    Saved progress
                  </p>
                  <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Ready once your username is set</p>
                </div>
              </div>
            </div>

            <button
              disabled={!validation.valid || checking || availabilityMessage === "That username is already taken." || saving}
              onClick={() => void handleSubmit()}
              type="button"
              style={{
                width: "100%", marginTop: 28, padding: "16px",
                fontFamily: sans, fontWeight: 500, fontSize: 15,
                letterSpacing: "0.01em", color: "#111", border: "none",
                borderRadius: 10, cursor: "pointer",
                background: CREAM,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28)",
                opacity: (!validation.valid || checking || availabilityMessage === "That username is already taken." || saving) ? 0.5 : 1,
                transition: "opacity 200ms",
              }}
            >
              {saving ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
