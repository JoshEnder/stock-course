"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import {
  clearCertificateId,
  clearNickname,
  getNickname,
  setNickname,
  subscribeToCourseStorage,
} from "../lib/course-storage";
import { resetCourseProgress } from "../lib/course-progress";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";
import { saveNicknameForCurrentUser } from "../lib/remote-progress";

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

export function ProfileScreen() {
  const router = useRouter();
  const { loading: authLoading, signInWithGoogle, signOut, user } = useAuth();
  const storedNickname = useSyncExternalStore(
    subscribeToCourseStorage,
    getNickname,
    () => "Learner",
  );
  const [nicknameDraft, setNicknameDraft] = useState(storedNickname);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signedInEmail = user?.email ?? null;
  const signedInName =
    typeof user?.user_metadata?.nickname === "string"
      ? user.user_metadata.nickname
      : typeof user?.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user?.user_metadata?.name === "string"
          ? user.user_metadata.name
          : null;
  const isNicknameChanged = nicknameDraft.trim() !== storedNickname;
  const nicknameReady = nicknameDraft.trim().length > 0;

  useEffect(() => {
    setNicknameDraft(storedNickname);
  }, [storedNickname]);

  async function handleGoogleSignIn() {
    if (googleLoading) {
      return;
    }

    try {
      setGoogleLoading(true);
      setErrorMessage(null);
      setMessage(null);
      await signInWithGoogle("/profile");
    } catch (error) {
      setGoogleLoading(false);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in with Google.",
      );
    }
  }

  async function handleSaveNickname() {
    if (!nicknameReady || saveLoading) {
      return;
    }

    try {
      setSaveLoading(true);
      setErrorMessage(null);
      setMessage(null);
      const nextNickname = nicknameDraft.trim();

      setNickname(nextNickname);
      setMessage("Nickname updated.");

      if (!signedInEmail) {
        return;
      }

      await saveNicknameForCurrentUser(nextNickname);

      const supabase = getSupabaseBrowserClient();
      void supabase.auth
        .updateUser({
          data: {
            nickname: nextNickname,
          },
        })
        .catch((error) => {
          console.warn("Auth metadata nickname update failed.", error);
        });
    } catch (error) {
      console.warn("Nickname save failed after local update.", error);
      setErrorMessage(
        "Nickname updated on this device, but cloud save did not finish. Try again in a moment if the leaderboard name stays stale.",
      );
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleLogout() {
    if (logoutLoading) {
      return;
    }

    try {
      setLogoutLoading(true);
      setErrorMessage(null);
      setMessage(null);
      await signOut();
      router.replace("/onboarding");
      router.refresh();
      window.location.href = "/onboarding";
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to log out right now.",
      );
    } finally {
      setLogoutLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteLoading) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this account permanently? This will remove your Google sign-in account for this app and clear this device's saved progress.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);
      setErrorMessage(null);
      setMessage(null);
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("You need to be signed in before deleting your account.");
      }

      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to delete your account.");
      }

      await supabase.auth.signOut();
      clearNickname();
      clearCertificateId();
      resetCourseProgress();
      setNicknameDraft("Learner");
      router.push("/onboarding");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to delete your account.",
      );
    } finally {
      setDeleteLoading(false);
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
          <Link
            href="/course"
            className="rounded-2xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-[#172b4d] shadow-[0_3px_0_#e5e7eb]"
          >
            Back to course
          </Link>
        </div>

        <div className="mx-auto mt-10 w-full max-w-3xl">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#22c55e]">
              Profile
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#172b4d]">
              Account and identity
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-500">
              Manage your Google sign-in, edit the nickname that appears across the course,
              and control this account from one place.
            </p>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border-2 border-[#dcfce7] bg-white p-6 shadow-[0_6px_0_#dcfce7]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#22c55e]">
                    Google account
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-[#172b4d]">
                    {signedInEmail ? "Connected" : "Not connected"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {signedInEmail
                      ? `Signed in as ${signedInEmail}`
                      : "Connect the same Google account you used on the older version."}
                  </p>
                </div>
                {signedInEmail ? (
                  <span className="rounded-full bg-[#f0fdf4] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#15803d]">
                    Active session
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {signedInEmail ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="rounded-2xl bg-[#22c55e] px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#16a34a] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {logoutLoading ? "Logging out..." : "Log out"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || authLoading}
                    className="rounded-2xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-wide text-[#172b4d] shadow-[0_4px_0_#e5e7eb] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {googleLoading ? "Connecting..." : "Continue with Google"}
                  </button>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border-2 border-gray-200 bg-white p-6 shadow-[0_6px_0_#e5e7eb]">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                Display name
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#172b4d]">
                Change your nickname
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                This name appears naturally across the app and on your certificate.
                {signedInName ? ` Google currently knows you as ${signedInName}.` : ""}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={nicknameDraft}
                  onChange={(event) => setNicknameDraft(event.target.value)}
                  maxLength={20}
                  className="min-w-0 flex-1 rounded-2xl border-2 border-gray-200 px-4 py-4 text-base font-semibold text-[#172b4d] outline-none"
                  placeholder="Your nickname"
                />
                <button
                  type="button"
                  onClick={handleSaveNickname}
                  disabled={!nicknameReady || !isNicknameChanged || saveLoading}
                  className="rounded-2xl bg-[#172b4d] px-5 py-4 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#0f172a] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saveLoading ? "Saving..." : "Save nickname"}
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border-2 border-[#fecaca] bg-white p-6 shadow-[0_6px_0_#fee2e2]">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#dc2626]">
                Danger zone
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#172b4d]">
                Delete this account
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Permanently delete the connected account and clear this device&apos;s saved
                nickname, certificate ID, and course progress.
              </p>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={!signedInEmail || deleteLoading}
                className="mt-5 rounded-2xl bg-[#ef4444] px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#dc2626] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleteLoading ? "Deleting..." : "Delete account"}
              </button>
            </section>

            {message ? (
              <p className="rounded-2xl border-2 border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#15803d]">
                {message}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="rounded-2xl border-2 border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#b91c1c]">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
