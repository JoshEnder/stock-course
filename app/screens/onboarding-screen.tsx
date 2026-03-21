"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function OnboardingScreen() {
  const [nickname, setNicknameDraft] = useState("");
  const router = useRouter();
  const ready = nickname.trim().length > 0;

  function handleContinue() {
    if (!ready) return;
    // Inline import to avoid circular deps
    import("../lib/course-storage").then(({ setNickname }) => {
      setNickname(nickname.trim());
      router.push("/course");
    });
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
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>

          {/* Icon */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 80, height: 80, borderRadius: 24,
              background: "#dcfce7", marginBottom: 24,
              fontSize: 36,
            }}>
              📈
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
            <label style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Your nickname
            </label>
            <input
              autoFocus
              maxLength={20}
              onChange={(e) => setNicknameDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleContinue(); }}
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
              This will appear on your certificate
            </p>

            <button
              disabled={!ready}
              onClick={handleContinue}
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
              Continue
            </button>
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
