"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AwardIcon, DownloadIcon } from "../components/icons";
import {
  getCertificateId,
  getNickname,
  subscribeToHydration,
  subscribeToCourseStorage,
} from "../lib/course-storage";

type CertificateScreenProps = {
  printMode?: boolean;
};

function StokedLogo() {
  return (
    <Link href="/" className="alpine-brand-link">
      <span className="alpine-brand-link__word">stoked</span>
      <span className="alpine-brand-link__dot" />
    </Link>
  );
}

export function CertificateScreen({
  printMode = false,
}: CertificateScreenProps) {
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

  useEffect(() => {
    if (!printMode) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.print();
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [printMode]);

  const outerStyle: React.CSSProperties = printMode
    ? {
        minHeight: "100vh",
        background: "#ffffff",
        fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)",
      }
    : {
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(46,95,134,0.24), transparent 0 34%), linear-gradient(180deg, #08111d 0%, #0a1626 54%, #08111d 100%)",
        fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)",
      };

  return (
    <main className={printMode ? "certificate-page" : "alpine-page"} style={outerStyle}>
      {printMode ? null : (
        <div className="alpine-page__inner pb-0">
          <div className="alpine-topbar">
            <StokedLogo />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/completion")}
                className="alpine-back-link"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => router.push("/certificate/print")}
                className="alpine-cta-secondary"
              >
                <DownloadIcon className="h-4 w-4" />
                Download / Print
              </button>
            </div>
          </div>

          <div className="alpine-page-head pb-8">
            <p className="alpine-kicker">Certificate</p>
            <h1 className="alpine-heading">Completion certificate</h1>
            <p className="alpine-copy">
              A print-safe document previewed inside the alpine system, with the
              dedicated white sheet preserved for export and printing.
            </p>
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: printMode ? "24px 16px" : "0 24px 48px",
        }}
      >
        <div
          className={printMode ? "certificate-sheet" : "alpine-panel alpine-panel--muted"}
          style={
            printMode
              ? undefined
              : {
                  padding: 14,
                }
          }
        >
          <div
            className="certificate-sheet"
            style={{
              background: "#fcfbf7",
              borderRadius: printMode ? 24 : 20,
              border: "1.5px solid rgba(15, 35, 53, 0.08)",
              boxShadow: printMode
                ? "none"
                : "0 28px 60px rgba(5, 14, 24, 0.34), 0 8px 26px rgba(17, 49, 74, 0.12)",
              padding: printMode ? "48px 32px" : "64px 48px",
              position: "relative",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at top, rgba(95,143,179,0.12), transparent 0 38%)",
                pointerEvents: "none",
              }}
            />

            <CornerAccent position="top-left" />
            <CornerAccent position="top-right" />
            <CornerAccent position="bottom-left" />
            <CornerAccent position="bottom-right" />

            <div
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 84,
                height: 84,
                borderRadius: "50%",
                marginBottom: 26,
                background:
                  "linear-gradient(145deg, rgba(20,58,90,0.96), rgba(39,211,195,0.88))",
                boxShadow: "0 18px 30px rgba(20, 58, 90, 0.18)",
              }}
            >
              <AwardIcon style={{ width: 40, height: 40, color: "#fcfbf7" }} />
            </div>

            <h1
              style={{
                position: "relative",
                fontSize: "clamp(28px,4vw,42px)",
                fontFamily: "var(--font-eb-garamond,'EB Garamond',Georgia,serif)",
                fontWeight: 600,
                color: "#143a5a",
                letterSpacing: "-0.03em",
                marginBottom: 10,
                lineHeight: 1.2,
              }}
            >
              Certificate of Completion
            </h1>
            <div
              style={{
                position: "relative",
                width: 84,
                height: 4,
                background: "linear-gradient(90deg, #143a5a, #27d3c3)",
                borderRadius: 999,
                margin: "0 auto 34px",
              }}
            />

            <p
              style={{
                position: "relative",
                fontSize: 16,
                color: "#5f7488",
                marginBottom: 12,
              }}
            >
              This certifies that
            </p>
            <h2
              style={{
                position: "relative",
                fontSize: "clamp(32px,5vw,56px)",
                fontFamily: "var(--font-eb-garamond,'EB Garamond',Georgia,serif)",
                fontWeight: 600,
                color: "#143a5a",
                letterSpacing: "-0.04em",
                marginBottom: 24,
                lineHeight: 1.08,
              }}
            >
              {nickname}
            </h2>
            <p
              style={{
                position: "relative",
                fontSize: 16,
                color: "#5f7488",
                marginBottom: 8,
              }}
            >
              has successfully completed
            </p>
            <h3
              style={{
                position: "relative",
                fontSize: "clamp(20px,3vw,28px)",
                fontWeight: 700,
                color: "#10243a",
                marginBottom: 24,
              }}
            >
              Beginner Stock Foundations
            </h3>

            <p
              style={{
                position: "relative",
                fontSize: 15,
                color: "#5f7488",
                lineHeight: 1.8,
                maxWidth: 520,
                margin: "0 auto 40px",
              }}
            >
              This course covered beginner-friendly concepts including ownership,
              fundraising, gains, dividends, exchanges, market cap, investing
              versus trading, risk, diversification, and chart exploration.
            </p>

            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 20,
                marginBottom: 40,
              }}
            >
              <CertDetail label="Completion Date" value={completionDate} />
              <CertDetail label="Completion Time" value="74 minutes" />
              <CertDetail label="Lessons Finished" value="10 lessons" />
            </div>

            <p
              style={{
                position: "relative",
                fontSize: 12,
                color: "#7f97ab",
                letterSpacing: "0.08em",
              }}
            >
              Certificate ID: {certificateId}
            </p>
          </div>
        </div>

        {printMode ? null : (
          <p
            style={{
              textAlign: "center",
              marginTop: 16,
              fontSize: 13,
              color: "var(--alpine-text-tertiary)",
            }}
          >
            Tip: Use your browser&apos;s print function to save this certificate as a PDF.
          </p>
        )}
      </div>
    </main>
  );
}

function CertDetail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p
        style={{
          fontSize: 12,
          color: "#7f97ab",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#143a5a" }}>{value}</p>
    </div>
  );
}

function CornerAccent({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const style: React.CSSProperties = {
    position: "absolute",
    width: 54,
    height: 54,
    borderColor: "rgba(39, 211, 195, 0.42)",
    borderStyle: "solid",
    pointerEvents: "none",
  };

  if (position === "top-left") {
    style.top = 20;
    style.left = 20;
    style.borderTopWidth = 4;
    style.borderLeftWidth = 4;
    style.borderRadius = "14px 0 0 0";
  } else if (position === "top-right") {
    style.top = 20;
    style.right = 20;
    style.borderTopWidth = 4;
    style.borderRightWidth = 4;
    style.borderRadius = "0 14px 0 0";
  } else if (position === "bottom-left") {
    style.bottom = 20;
    style.left = 20;
    style.borderBottomWidth = 4;
    style.borderLeftWidth = 4;
    style.borderRadius = "0 0 0 14px";
  } else {
    style.bottom = 20;
    style.right = 20;
    style.borderBottomWidth = 4;
    style.borderRightWidth = 4;
    style.borderRadius = "0 0 14px 0";
  }

  return <div style={style} />;
}
