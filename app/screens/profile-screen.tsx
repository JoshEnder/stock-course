"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { FriendsPanel } from "../components/friends-panel";
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

function SectionBlock({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "danger" }) {
  return (
    <section style={{
      borderRadius: 12,
      border: `1px solid ${variant === "danger" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
      background: SURFACE,
      padding: 24,
    }}>
      {children}
    </section>
  );
}

function PrimaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "10px 22px", borderRadius: 10, border: "none",
        background: CREAM, color: "#111",
        fontFamily: sans, fontWeight: 500, fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.58), 0 2px 8px rgba(0,0,0,0.28)",
        transition: "opacity 200ms",
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, disabled, href }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; href?: string }) {
  const style = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 22px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent", color: TEXT,
    fontFamily: sans, fontWeight: 500, fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
    transition: "opacity 200ms",
  } as const;
  if (href) return <Link href={href} style={style}>{children}</Link>;
  return <button type="button" onClick={onClick} disabled={disabled} style={style}>{children}</button>;
}

export function ProfileScreen() {
  const router = useRouter();
  const {
    loading: authLoading,
    needsUsername,
    profile,
    signInWithGoogle,
    signOut,
    user,
  } = useAuth();
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
    if (googleLoading) return;
    try {
      setGoogleLoading(true);
      setErrorMessage(null);
      setMessage(null);
      await signInWithGoogle("/profile");
    } catch (error) {
      setGoogleLoading(false);
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in with Google.");
    }
  }

  async function handleSaveNickname() {
    if (!nicknameReady || saveLoading) return;
    try {
      setSaveLoading(true);
      setErrorMessage(null);
      setMessage(null);
      const nextNickname = nicknameDraft.trim();
      setNickname(nextNickname);
      setMessage("Nickname updated.");
      if (!signedInEmail) return;
      await saveNicknameForCurrentUser(nextNickname);
      const supabase = getSupabaseBrowserClient();
      void supabase.auth.updateUser({ data: { nickname: nextNickname } }).catch((error) => {
        console.warn("Auth metadata nickname update failed.", error);
      });
    } catch (error) {
      console.warn("Nickname save failed after local update.", error);
      setErrorMessage("Nickname updated on this device, but cloud save did not finish.");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleLogout() {
    if (logoutLoading) return;
    try {
      setLogoutLoading(true);
      setErrorMessage(null);
      setMessage(null);
      await signOut();
      router.replace("/onboard");
      router.refresh();
      window.location.href = "/onboard";
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to log out right now.");
    } finally {
      setLogoutLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteLoading) return;
    const confirmed = window.confirm("Delete this account permanently? This will remove your Google sign-in and clear saved progress.");
    if (!confirmed) return;
    try {
      setDeleteLoading(true);
      setErrorMessage(null);
      setMessage(null);
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("You need to be signed in before deleting your account.");
      const response = await fetch("/api/account/delete", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to delete your account.");
      await supabase.auth.signOut();
      clearNickname();
      clearCertificateId();
      resetCourseProgress();
      setNicknameDraft("Learner");
      router.push("/onboard");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete your account.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <main className="min-h-screen" style={{ fontFamily: sans, background: BG }}>
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <StokedLogo />
          <GhostBtn href="/course">Back to course</GhostBtn>
        </div>

        <div className="mt-10 w-full">
          <div className="mb-8">
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD }}>
              Profile
            </p>
            <h1 style={{ fontSize: "clamp(28px,4vw,38px)", fontFamily: serif, fontWeight: 600, color: CREAM, marginTop: 8, letterSpacing: "-0.01em" }}>
              Account
            </h1>
            <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.6, marginTop: 8, maxWidth: 520 }}>
              Manage your sign-in, display name, and account settings.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Google account */}
            <SectionBlock>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: EMERALD }}>Google account</p>
                  <h2 style={{ fontSize: 20, fontFamily: serif, fontWeight: 600, color: CREAM, marginTop: 6 }}>
                    {signedInEmail ? "Connected" : "Not connected"}
                  </h2>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginTop: 6 }}>
                    {signedInEmail ? `Signed in as ${signedInEmail}` : "Connect a Google account to sync progress."}
                  </p>
                </div>
                {signedInEmail ? (
                  <span style={{ fontSize: 11, fontWeight: 500, color: EMERALD }}>Active</span>
                ) : null}
              </div>
              <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
                {signedInEmail ? (
                  <PrimaryBtn onClick={handleLogout} disabled={logoutLoading}>
                    {logoutLoading ? "Logging out..." : "Log out"}
                  </PrimaryBtn>
                ) : (
                  <PrimaryBtn onClick={handleGoogleSignIn} disabled={googleLoading || authLoading}>
                    {googleLoading ? "Connecting..." : "Continue with Google"}
                  </PrimaryBtn>
                )}
              </div>
            </SectionBlock>

            {/* Username */}
            <SectionBlock>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: DIM }}>Username</p>
              <h2 style={{ fontSize: 20, fontFamily: serif, fontWeight: 600, color: CREAM, marginTop: 6 }}>
                {profile?.username ? `@${profile.username}` : "Set your username"}
              </h2>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginTop: 6 }}>
                Your username is used for friends and leaderboards.
              </p>
              <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                <GhostBtn href="/username?next=/profile">
                  {profile?.username ? "Update username" : "Choose username"}
                </GhostBtn>
                {!profile?.username || needsUsername ? (
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#f59e0b" }}>Required</span>
                ) : null}
              </div>
            </SectionBlock>

            {/* Friends */}
            <FriendsPanel />

            {/* Nickname */}
            <SectionBlock>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: DIM }}>Display name</p>
              <h2 style={{ fontSize: 20, fontFamily: serif, fontWeight: 600, color: CREAM, marginTop: 6 }}>
                Nickname
              </h2>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginTop: 6 }}>
                Shown across the app and on your certificate.
                {signedInName ? ` Google knows you as ${signedInName}.` : ""}
              </p>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }} className="sm:flex-row">
                <input
                  type="text"
                  value={nicknameDraft}
                  onChange={(event) => setNicknameDraft(event.target.value)}
                  maxLength={20}
                  placeholder="Your nickname"
                  style={{
                    flex: 1, minWidth: 0, padding: "12px 16px",
                    borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)", color: CREAM,
                    fontFamily: sans, fontSize: 15, fontWeight: 500,
                    outline: "none",
                  }}
                />
                <PrimaryBtn onClick={handleSaveNickname} disabled={!nicknameReady || !isNicknameChanged || saveLoading}>
                  {saveLoading ? "Saving..." : "Save"}
                </PrimaryBtn>
              </div>
            </SectionBlock>

            {/* Danger zone */}
            <SectionBlock variant="danger">
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ef4444" }}>Danger zone</p>
              <h2 style={{ fontSize: 20, fontFamily: serif, fontWeight: 600, color: CREAM, marginTop: 6 }}>
                Delete account
              </h2>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginTop: 6 }}>
                Permanently delete the connected account and clear all saved progress.
              </p>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={!signedInEmail || deleteLoading}
                style={{
                  marginTop: 16, padding: "10px 22px", borderRadius: 10,
                  border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)",
                  color: "#f87171", fontFamily: sans, fontWeight: 500, fontSize: 14,
                  cursor: !signedInEmail || deleteLoading ? "not-allowed" : "pointer",
                  opacity: !signedInEmail || deleteLoading ? 0.5 : 1,
                }}
              >
                {deleteLoading ? "Deleting..." : "Delete account"}
              </button>
            </SectionBlock>

            {/* Messages */}
            {message ? (
              <div style={{ borderLeft: `3px solid ${EMERALD}`, paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
                <p style={{ fontSize: 14, color: EMERALD }}>{message}</p>
              </div>
            ) : null}
            {errorMessage ? (
              <div style={{ borderLeft: "3px solid #ef4444", paddingLeft: 16, paddingTop: 4, paddingBottom: 4 }}>
                <p style={{ fontSize: 14, color: "#f87171" }}>{errorMessage}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
