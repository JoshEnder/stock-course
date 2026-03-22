"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../lib/auth-context";
import { syncNicknameForCurrentUser } from "../lib/remote-progress";

function GoogleAccountButton({
  disabled = false,
  onClick,
  photoUrl,
  signedInHref,
  signedIn,
}: {
  disabled?: boolean;
  onClick: () => void;
  photoUrl?: string | null;
  signedInHref?: string;
  signedIn: boolean;
}) {
  const sharedStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 999,
    border: "2px solid #e5e7eb",
    background: "#fff",
    boxShadow: "0 4px 0 #e5e7eb",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    overflow: "hidden",
    textDecoration: "none",
  };

  const icon = signedIn && photoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl}
      alt="Google account"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : signedIn ? (
    <span style={{ fontSize: 20 }}>👤</span>
  ) : (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        width: 22,
        height: 22,
        borderRadius: "50%",
        alignItems: "center",
        justifyContent: "center",
        background:
          "conic-gradient(from 180deg, #34a853 0 25%, #fbbc05 25% 50%, #ea4335 50% 75%, #4285f4 75% 100%)",
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff" }} />
    </span>
  );

  if (signedIn && signedInHref) {
    return (
      <Link
        href={signedInHref}
        style={sharedStyle}
        aria-label="Open account"
        title="Open account"
      >
        {icon}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={sharedStyle}
      aria-label={signedIn ? "Open account" : "Log in with Google"}
      title={signedIn ? "Open account" : "Log in with Google"}
    >
      {icon}
    </button>
  );
}

export function OnboardingScreen() {
  const router = useRouter();
  const { loading: authLoading, signInWithGoogle, user } = useAuth();
  const [nickname, setNicknameDraft] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [showContinueChoices, setShowContinueChoices] = useState(false);
  const [autoContinuePending, setAutoContinuePending] = useState(false);
  const ready = nickname.trim().length > 0;
  const signedInEmail = user?.email ?? null;
  const signedInName =
    typeof user?.user_metadata?.nickname === "string"
      ? user.user_metadata.nickname
      : typeof user?.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user?.user_metadata?.name === "string"
          ? user.user_metadata.name
          : null;
  const photoUrl =
    typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null;

  useEffect(() => {
    setNicknameDraft((current) => current || signedInName || "");
  }, [signedInName]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");
    const continueMode = params.get("continue");

    if (authError) {
      setAuthErrorMessage(authError);
    }

    if (continueMode === "google") {
      setAutoContinuePending(true);
      setShowContinueChoices(true);
    }
  }, []);

  const persistNicknameAndContinue = useCallback(() => {
    if (!ready) return;
    import("../lib/course-storage").then(({ setNickname }) => {
      const nextNickname = nickname.trim();
      setNickname(nextNickname);
      void syncNicknameForCurrentUser(nextNickname).catch((error) => {
        console.error("Failed to sync nickname during onboarding", error);
      });
      router.push("/course");
    });
  }, [nickname, ready, router]);

  function handleContinueToCourse() {
    if (!ready) {
      return;
    }

    if (user) {
      persistNicknameAndContinue();
      return;
    }

    setShowContinueChoices((current) => !current);
  }

  function handleContinueAsGuest() {
    persistNicknameAndContinue();
  }

  const handleContinueWithGoogle = useCallback(async () => {
    if (googleLoading) {
      return;
    }

    if (user) {
      persistNicknameAndContinue();
      return;
    }

    try {
      setGoogleLoading(true);
      setAuthErrorMessage(null);
      await signInWithGoogle("/onboarding?continue=google");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in with Google.";
      setAuthErrorMessage(message);
      setGoogleLoading(false);
    }
  }, [googleLoading, persistNicknameAndContinue, signInWithGoogle, user]);

  useEffect(() => {
    if (!autoContinuePending || !user || !ready) {
      return;
    }

    setAutoContinuePending(false);
    void handleContinueWithGoogle();
  }, [autoContinuePending, handleContinueWithGoogle, ready, user]);

  async function handleGoogleSignIn() {
    if (googleLoading) {
      return;
    }

    try {
      if (user) {
        router.push("/profile");
        return;
      }

      setGoogleLoading(true);
      setAuthErrorMessage(null);
      await signInWithGoogle("/profile");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in with Google.";
      setAuthErrorMessage(message);
      setGoogleLoading(false);
    }
  }

  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", fontFamily: font, display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <header style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, textDecoration: "none" }}>
          <span style={{ fontWeight: 900, fontSize: 22, color: "#172b4d", letterSpacing: "-0.5px", lineHeight: 1 }}>stoked</span>
          <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#22c55e", flexShrink: 0, marginBottom: 3 }} />
        </Link>
        <GoogleAccountButton
          disabled={googleLoading || (authLoading && !user)}
          onClick={handleGoogleSignIn}
          photoUrl={photoUrl}
          signedInHref="/profile"
          signedIn={Boolean(user)}
        />
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, marginBottom: 24, background: "#dcfce7", borderRadius: 24, padding: "16px 24px" }}>
              <span style={{
                fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)",
                fontWeight: 900, fontSize: 40, color: "#172b4d", letterSpacing: "-1.5px", lineHeight: 1,
              }}>
                stoked
              </span>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", flexShrink: 0, marginBottom: 5, display: "inline-block" }} />
            </div>
            <h1 style={{ fontWeight: 900, fontSize: "clamp(28px,5vw,40px)", color: "#172b4d", letterSpacing: "-0.5px", marginBottom: 12, lineHeight: 1.15 }}>
              What should we call you?
            </h1>
            <p style={{ fontSize: 18, color: "#6b7280", lineHeight: 1.6 }}>
              Choose a nickname to personalize your learning journey
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: "#fff",
            borderRadius: 24,
            border: "2px solid #e5e7eb",
            boxShadow: "0 8px 0 #e5e7eb",
            padding: 32,
          }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {signedInEmail ? "Connected account" : "Account"}
              </p>
              {signedInEmail ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#f0fdf4",
                    border: "2px solid #bbf7d0",
                    borderRadius: 999,
                    padding: "6px 12px",
                    marginBottom: 10,
                    color: "#15803d",
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#22c55e",
                    }}
                  />
                  Google connected
                </div>
              ) : null}
              <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 8 }}>
                {signedInEmail
                  ? `Signed in as ${signedInEmail}`
                  : "You can continue as a guest, or connect the same Google account from your previous version."}
              </p>
              {authErrorMessage ? (
                <p style={{ fontSize: 13, color: "#dc2626", marginTop: 10 }}>
                  {authErrorMessage}
                </p>
              ) : null}
            </div>

            <div style={{ height: 1, background: "#e5e7eb", margin: "0 0 20px" }} />

            <label style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Your nickname
            </label>
            <input
              autoFocus
              maxLength={20}
              onChange={(e) => setNicknameDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleContinueToCourse(); }}
              placeholder="e.g., Alex"
              type="text"
              value={nickname}
              style={{
                width: "100%",
                padding: "16px 20px",
                fontSize: 18,
                fontFamily: font,
                fontWeight: 600,
                color: "#172b4d",
                background: "#fff",
                border: `2px solid ${ready ? "#22c55e" : "#e5e7eb"}`,
                borderRadius: 16,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 200ms",
              }}
            />
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 8, marginBottom: 24 }}>
              This will appear on your certificate{signedInName ? ` and defaults to ${signedInName}` : ""}
            </p>

            <button
              disabled={!ready}
              onClick={handleContinueToCourse}
              type="button"
              style={{
                width: "100%",
                padding: "16px",
                fontSize: 16,
                fontFamily: font,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#fff",
                background: ready ? "#22c55e" : "#d1d5db",
                boxShadow: ready ? "0 5px 0 #16a34a" : "0 5px 0 #b0b7c3",
                border: "none",
                borderRadius: 16,
                cursor: ready ? "pointer" : "not-allowed",
                transition: "background 200ms, box-shadow 200ms",
              }}
              onMouseDown={(e) => {
                if (!ready) return;
                const el = e.currentTarget;
                el.style.transform = "translateY(3px)";
                el.style.boxShadow = "0 2px 0 #16a34a";
              }}
              onMouseUp={(e) => {
                const el = e.currentTarget;
                el.style.transform = "";
                el.style.boxShadow = ready ? "0 5px 0 #16a34a" : "0 5px 0 #b0b7c3";
              }}
            >
              Continue to course
            </button>

            {showContinueChoices ? (
              <div
                style={{
                  marginTop: 16,
                  display: "grid",
                  gap: 10,
                  background: "#f9fafb",
                  border: "2px solid #e5e7eb",
                  borderRadius: 18,
                  padding: 14,
                }}
              >
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "2px solid #e5e7eb",
                    background: "#ffffff",
                    color: "#172b4d",
                    fontFamily: font,
                    fontSize: 14,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                  }}
                >
                  Continue as guest
                </button>
                <button
                  type="button"
                  onClick={handleContinueWithGoogle}
                  disabled={googleLoading || authLoading}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "none",
                    background: "#22c55e",
                    boxShadow: "0 4px 0 #16a34a",
                    color: "#ffffff",
                    fontFamily: font,
                    fontSize: 14,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: googleLoading || authLoading ? "not-allowed" : "pointer",
                    opacity: googleLoading || authLoading ? 0.7 : 1,
                  }}
                >
                  {user
                    ? "Continue with connected account"
                    : googleLoading
                      ? "Connecting Google..."
                      : "Continue with Google"}
                </button>
              </div>
            ) : null}
          </div>

          {/* Already have account */}
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#9ca3af" }}>
            Already started?{" "}
            <Link href="/course" style={{ color: "#22c55e", fontWeight: 700, textDecoration: "none" }}>
              Go to your course
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
