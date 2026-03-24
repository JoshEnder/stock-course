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

function StokedLogo() {
  return (
    <Link href="/" className="inline-flex items-end gap-0.5">
      <span
        className="text-2xl font-black tracking-tight text-[#1a2b4a]"
        style={{ fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)" }}
      >
        stoked
      </span>
      <span className="mb-[0.2em] h-3 w-3 flex-shrink-0 rounded-full bg-[#22c55e]" />
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
      router.replace("/onboarding");
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
    <main
      className="min-h-screen bg-[#f7faf8]"
      style={{ fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)" }}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <StokedLogo />
          <span className="rounded-2xl border-2 border-[#dcfce7] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#22c55e] shadow-[0_3px_0_#dcfce7]">
            One-time setup
          </span>
        </div>

        <div className="mx-auto mt-14 w-full max-w-2xl">
          <div className="rounded-[32px] border-2 border-[#dcfce7] bg-white p-8 shadow-[0_10px_0_#dcfce7] sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#22c55e]">
              Username
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#172b4d]">
              Pick your Stoked username
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-500">
              Your username powers friends, private leaderboards, and future social features.
              It is unique to you and never exposes your email.
            </p>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-black uppercase tracking-[0.14em] text-[#64748b]">
                  Username
                </span>
                <div className="overflow-hidden rounded-[24px] border-2 border-[#dbe4f0] bg-[#f8fafc] shadow-[0_4px_0_#e5edf7] focus-within:border-[#22c55e] focus-within:shadow-[0_4px_0_#bbf7d0]">
                  <input
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    className="w-full bg-transparent px-5 py-4 text-xl font-black tracking-tight text-[#172b4d] outline-none placeholder:text-[#94a3b8]"
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
                  />
                </div>
              </label>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="rounded-full bg-[#f1f5f9] px-3 py-1 font-semibold text-[#64748b]">
                  3-20 characters
                </span>
                <span className="rounded-full bg-[#f1f5f9] px-3 py-1 font-semibold text-[#64748b]">
                  letters, numbers, underscores, periods
                </span>
              </div>

              <div className="min-h-[28px] text-sm font-semibold">
                {errorMessage ? (
                  <p className="text-[#dc2626]">{errorMessage}</p>
                ) : !validation.valid ? (
                  <p className="text-[#64748b]">{validation.error}</p>
                ) : checking ? (
                  <p className="text-[#64748b]">Checking availability...</p>
                ) : availabilityMessage ? (
                  <p
                    className={
                      availabilityMessage === "Username available."
                        ? "text-[#16a34a]"
                        : "text-[#dc2626]"
                    }
                  >
                    {availabilityMessage}
                  </p>
                ) : successMessage ? (
                  <p className="text-[#16a34a]">{successMessage}</p>
                ) : (
                  <p className="text-[#64748b]">Choose a name friends can search later.</p>
                )}
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border-2 border-[#e2e8f0] bg-[#f8fafc] p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">
                Preview
              </p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[#64748b]">This is how you will appear in Stoked.</p>
                  <p className="mt-1 text-2xl font-black tracking-tight text-[#172b4d]">
                    @{normalizedDraft || "yourname"}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-[#dcfce7] bg-white px-4 py-3 text-right shadow-[0_4px_0_#dcfce7]">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#22c55e]">
                    Saved progress
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#172b4d]">Ready once your username is set</p>
                </div>
              </div>
            </div>

            <button
              className="mt-8 w-full rounded-[26px] bg-[#22c55e] px-6 py-4 text-lg font-black uppercase tracking-[0.12em] text-white shadow-[0_8px_0_#16a34a] transition active:translate-y-[3px] active:shadow-[0_5px_0_#16a34a] disabled:cursor-not-allowed disabled:bg-[#86efac] disabled:shadow-[0_8px_0_#4ade80]"
              disabled={!validation.valid || checking || availabilityMessage === "That username is already taken." || saving}
              onClick={() => void handleSubmit()}
              type="button"
            >
              {saving ? "Saving..." : "Save username"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
