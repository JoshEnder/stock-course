"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AwardIcon, DownloadIcon } from "../components/icons";
import {
  getCertificateId,
  getNickname,
  subscribeToHydration,
  subscribeToCourseStorage,
} from "../lib/course-storage";

export function CertificateScreen() {
  const router = useRouter();
  const storedNickname = useSyncExternalStore(
    subscribeToCourseStorage,
    getNickname,
    () => "Learner",
  );
  const storedCertificateId = useSyncExternalStore(
    subscribeToCourseStorage,
    getCertificateId,
    () => "SF-DEMO",
  );
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const nickname = isHydrated ? storedNickname : "Learner";
  const certificateId = isHydrated ? storedCertificateId : "SF-DEMO";

  const completionDate = useMemo(
    () =>
      isHydrated
        ? new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "March 16, 2026",
    [isHydrated],
  );

  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: font }}>
      {/* Top bar */}
      <div className="print:hidden" style={{ borderBottom: "2px solid #e5e7eb", background: "#fff", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={() => router.push("/completion")}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 14, fontWeight: 700, fontFamily: font }}
        >
          &larr; Back
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 12, border: "none",
            background: "#22c55e", boxShadow: "0 4px 0 #16a34a",
            color: "#fff", fontFamily: font, fontWeight: 800, fontSize: 14,
            cursor: "pointer",
          }}
          onMouseDown={(e) => { const el = e.currentTarget; el.style.transform = "translateY(2px)"; el.style.boxShadow = "0 2px 0 #16a34a"; }}
          onMouseUp={(e) => { const el = e.currentTarget; el.style.transform = ""; el.style.boxShadow = "0 4px 0 #16a34a"; }}
        >
          <DownloadIcon style={{ width: 16, height: 16 }} />
          Download / Print
        </button>
      </div>

      {/* Certificate */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{
          background: "#fff",
          borderRadius: 24,
          border: "2px solid #e5e7eb",
          boxShadow: "0 8px 0 #e5e7eb",
          padding: "64px 48px",
          position: "relative",
          textAlign: "center",
        }}>
          {/* Corner accents */}
          <div style={{ position: "absolute", top: 20, left: 20, width: 48, height: 48, borderTop: "4px solid #bbf7d0", borderLeft: "4px solid #bbf7d0", borderRadius: "12px 0 0 0" }} />
          <div style={{ position: "absolute", top: 20, right: 20, width: 48, height: 48, borderTop: "4px solid #bbf7d0", borderRight: "4px solid #bbf7d0", borderRadius: "0 12px 0 0" }} />
          <div style={{ position: "absolute", bottom: 20, left: 20, width: 48, height: 48, borderBottom: "4px solid #bbf7d0", borderLeft: "4px solid #bbf7d0", borderRadius: "0 0 0 12px" }} />
          <div style={{ position: "absolute", bottom: 20, right: 20, width: 48, height: 48, borderBottom: "4px solid #bbf7d0", borderRight: "4px solid #bbf7d0", borderRadius: "0 0 12px 0" }} />

          {/* Seal */}
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, borderRadius: "50%", background: "#22c55e", marginBottom: 24 }}>
            <AwardIcon style={{ width: 40, height: 40, color: "#fff" }} />
          </div>

          <h1 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, color: "#172b4d", letterSpacing: "-0.5px", marginBottom: 8, lineHeight: 1.2 }}>
            Certificate of Completion
          </h1>
          <div style={{ width: 80, height: 4, background: "#22c55e", borderRadius: 99, margin: "0 auto 32px" }} />

          <p style={{ fontSize: 16, color: "#9ca3af", marginBottom: 12 }}>This certifies that</p>
          <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, color: "#22c55e", letterSpacing: "-1px", marginBottom: 24, lineHeight: 1.1 }}>
            {nickname}
          </h2>
          <p style={{ fontSize: 16, color: "#9ca3af", marginBottom: 8 }}>has successfully completed</p>
          <h3 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 900, color: "#172b4d", marginBottom: 24 }}>
            Beginner Stock Foundations
          </h3>

          <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>
            This course covered beginner-friendly concepts including ownership, fundraising, gains, dividends, exchanges, market cap, investing versus trading, risk, diversification, and chart exploration.
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 32, marginBottom: 40 }}>
            <CertDetail label="Completion Date" value={completionDate} />
            <div style={{ width: 1, background: "#e5e7eb", alignSelf: "stretch" }} />
            <CertDetail label="Completion Time" value="74 minutes" />
            <div style={{ width: 1, background: "#e5e7eb", alignSelf: "stretch" }} />
            <CertDetail label="Lessons Finished" value="10 lessons" />
          </div>

          <p style={{ fontSize: 12, color: "#d1d5db", letterSpacing: "0.08em" }}>
            Certificate ID: {certificateId}
          </p>
        </div>

        <p className="print:hidden" style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#9ca3af" }}>
          Tip: Use your browser&apos;s print function to save this certificate as a PDF
        </p>
      </div>
    </div>
  );
}

function CertDetail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 12, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 900, color: "#172b4d" }}>{value}</p>
    </div>
  );
}
