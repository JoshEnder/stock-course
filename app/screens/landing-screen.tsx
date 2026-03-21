"use client";

import Link from "next/link";
import HeroScene from "@/app/components/HeroScene";
import { useAuth } from "../lib/auth-context";

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

// ─── Stoked logo ──────────────────────────────────────────────────────────────
function StokedLogo({ large = false }: { large?: boolean }) {
  return (
    <Link href="/" style={{ display: "inline-flex", alignItems: "flex-end", gap: 3, textDecoration: "none" }}>
      <span style={{
        fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)",
        fontWeight: 900,
        fontSize: large ? 40 : 24,
        color: "#172b4d",
        letterSpacing: "-0.5px",
        lineHeight: 1,
      }}>stoked</span>
      <span style={{
        width: large ? 14 : 9,
        height: large ? 14 : 9,
        borderRadius: "50%",
        backgroundColor: "#22c55e",
        flexShrink: 0,
        marginBottom: large ? 6 : 4,
      }} />
    </Link>
  );
}

// ─── Duolingo-style 3-D button ────────────────────────────────────────────────
function DuoBtn({
  href,
  children,
  variant = "primary",
  big = false,
  style: extraStyle = {},
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "white-on-green";
  big?: boolean;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)",
    fontWeight: 800,
    fontSize: big ? 16 : 14,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    textDecoration: "none",
    padding: big ? "16px 40px" : "12px 28px",
    borderRadius: 16,
    cursor: "pointer",
    border: "none",
    transition: "filter 80ms, transform 80ms",
    userSelect: "none",
    whiteSpace: "nowrap",
    ...extraStyle,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "#22c55e",
      color: "#fff",
      boxShadow: "0 5px 0 #16a34a",
    },
    outline: {
      backgroundColor: "#fff",
      color: "#172b4d",
      boxShadow: "0 5px 0 #d1d5db",
      border: "2px solid #e5e7eb",
    },
    "white-on-green": {
      backgroundColor: "#fff",
      color: "#22c55e",
      boxShadow: "0 5px 0 rgba(0,0,0,0.15)",
    },
  };

  const combinedStyle = { ...base, ...variants[variant] };

  if (href) {
    return (
      <Link href={href} style={combinedStyle}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.05)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ""; }}
        onMouseDown={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(3px)"; el.style.boxShadow = (variants[variant].boxShadow as string)?.replace("5px", "2px") ?? ""; }}
        onMouseUp={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = variants[variant].boxShadow as string; }}
      >
        {children}
      </Link>
    );
  }
  return (
    <button style={combinedStyle}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.05)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ""; }}
    >
      {children}
    </button>
  );
}

// ─── Streak illustration ──────────────────────────────────────────────────────
function StreakCard() {
  const days = ["M","T","W","T","F","S","S"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ fontSize: 80, lineHeight: 1 }}>🔥</div>
      <div style={{ display: "flex", gap: 10 }}>
        {days.map((d,i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: i < 5 ? "#ff9600" : "#f3f4f6",
              color: i < 5 ? "#fff" : "#d1d5db",
              fontWeight: 800, fontSize: 14,
              boxShadow: i < 5 ? "0 4px 0 #e08500" : "0 4px 0 #e5e7eb",
            }}>
              {i < 5 ? "✓" : "·"}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>{d}</span>
          </div>
        ))}
      </div>
      <div style={{
        background: "#fff7ed",
        border: "2px solid #ff9600",
        borderRadius: 20,
        boxShadow: "0 5px 0 #e08500",
        padding: "14px 32px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#ff9600" }}>5 day streak!</div>
        <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Keep learning every day</div>
      </div>
    </div>
  );
}

// ─── Lesson card illustration ─────────────────────────────────────────────────
function LessonCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, width: "100%" }}>
      <div style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: 20, padding: 20, boxShadow: "0 5px 0 #e5e7eb" }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#22c55e", marginBottom: 8 }}>Module 1 · Lesson 3</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#172b4d", marginBottom: 8 }}>What is a stock?</div>
        <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 12 }}>
          A stock represents partial ownership in a company. When you buy a share, you become a shareholder.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {["ownership","shares","equity"].map(t => (
            <span key={t} style={{ background: "#f0fdf4", color: "#16a34a", fontWeight: 700, fontSize: 12, borderRadius: 20, padding: "4px 10px" }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: 20, padding: 16, boxShadow: "0 5px 0 #e5e7eb" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
          <span style={{ color: "#172b4d" }}>Progress</span>
          <span style={{ color: "#22c55e" }}>3 / 4 steps</span>
        </div>
        <div style={{ height: 14, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: "75%", height: "100%", background: "#22c55e", borderRadius: 99 }} />
        </div>
      </div>
      <div style={{ background: "#f0fdf4", border: "2px solid #22c55e", borderRadius: 20, padding: 16, boxShadow: "0 5px 0 #16a34a" }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#22c55e" }}>Your answer</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#172b4d", marginTop: 4 }}>Partial ownership in a company</div>
      </div>
    </div>
  );
}

// ─── Progress illustration ────────────────────────────────────────────────────
function ProgressCard() {
  const mods = [
    { name: "Foundations",      pct: 100, color: "#22c55e", shadow: "#16a34a" },
    { name: "Chart Basics",     pct: 60,  color: "#3b82f6", shadow: "#2563eb" },
    { name: "Trend & Momentum", pct: 0,   color: "#a855f7", shadow: "#9333ea" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, width: "100%" }}>
      {mods.map(m => (
        <div key={m.name} style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: 20, padding: 20, boxShadow: `0 5px 0 #e5e7eb` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontWeight: 800, color: "#172b4d", fontSize: 15 }}>{m.name}</span>
            <span style={{ fontWeight: 800, fontSize: 14, color: m.color }}>
              {m.pct === 100 ? "Complete!" : m.pct === 0 ? "Locked" : `${m.pct}%`}
            </span>
          </div>
          <div style={{ height: 14, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${m.pct}%`, height: "100%", background: m.color, borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  children,
  bg = "#fff",
  border = false,
}: {
  children: React.ReactNode;
  bg?: string;
  border?: boolean;
}) {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      background: bg,
      borderTop: border ? "2px solid #f3f4f6" : undefined,
      borderBottom: border ? "2px solid #f3f4f6" : undefined,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", width: "100%" }}>
        {children}
      </div>
    </section>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────
function FeatureRow({
  tag,
  tagColor,
  heading,
  body,
  illustration,
  flip = false,
}: {
  tag: string;
  tagColor: string;
  heading: React.ReactNode;
  body: string;
  illustration: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: flip ? "row-reverse" : "row",
      alignItems: "center",
      gap: 64,
      flexWrap: "wrap",
      justifyContent: "center",
    }}>
      <div style={{ flex: "1 1 300px", minWidth: 0, textAlign: "left" }}>
        <div style={{ fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", color: tagColor, marginBottom: 12 }}>{tag}</div>
        <h2 style={{ fontFamily: "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)", fontWeight: 900, fontSize: "clamp(28px,4vw,40px)", color: "#172b4d", lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.5px" }}>
          {heading}
        </h2>
        <p style={{ fontSize: 18, color: "#6b7280", lineHeight: 1.7, maxWidth: 420 }}>{body}</p>
      </div>
      <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center" }}>
        {illustration}
      </div>
    </div>
  );
}

// ─── Landing screen ───────────────────────────────────────────────────────────
export function LandingScreen() {
  const { loading: authLoading, signInWithGoogle, user } = useAuth();
  const font = "var(--font-dm-sans,'DM Sans',system-ui,sans-serif)";
  const photoUrl =
    typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null;

  async function handleGoogleLogin() {
    try {
      if (user) {
        window.location.href = "/profile";
        return;
      }

      await signInWithGoogle("/course");
    } catch (error) {
      console.error("Failed to start Google sign-in", error);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: font }}>

      {/* ── NAV ──────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#fff",
        borderBottom: "2px solid #f3f4f6",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <StokedLogo />
          <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <GoogleAccountButton
              disabled={authLoading && !user}
              onClick={handleGoogleLogin}
              photoUrl={photoUrl}
              signedInHref="/profile"
              signedIn={Boolean(user)}
            />
          </nav>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", background: "#f0fdf4", borderBottom: "2px solid #dcfce7" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 24px 80px", width: "100%", display: "flex", alignItems: "center", gap: 64, flexWrap: "wrap", justifyContent: "center" }}>
          {/* Left text */}
          <div style={{ flex: "1 1 340px", minWidth: 0 }}>
            <h1 style={{
              fontFamily: font,
              fontWeight: 900,
              fontSize: "clamp(40px,6vw,64px)",
              color: "#172b4d",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              margin: 0,
            }}>
              Learn stocks.<br />
              <span style={{ color: "#22c55e" }}>For free.</span>
            </h1>
            <p style={{ fontSize: 20, color: "#4b5563", marginTop: 20, marginBottom: 36, lineHeight: 1.6, maxWidth: 440 }}>
              Fun, bite-sized lessons that make the stock market finally click. No jargon. No confusion.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {user ? (
                <DuoBtn href="/course" variant="primary" big>Proceed to Course</DuoBtn>
              ) : (
                <>
                  <DuoBtn href="/onboarding" variant="primary" big>Continue as Guest</DuoBtn>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: font,
                      fontWeight: 800,
                      fontSize: 16,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      padding: "16px 40px",
                      borderRadius: 16,
                      cursor: authLoading ? "not-allowed" : "pointer",
                      border: "2px solid #e5e7eb",
                      transition: "filter 80ms, transform 80ms",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      backgroundColor: "#fff",
                      color: "#172b4d",
                      boxShadow: "0 5px 0 #d1d5db",
                      opacity: authLoading ? 0.7 : 1,
                    }}
                  >
                    Log in with Google
                  </button>
                </>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 36 }}>
              {[
                { val: "10", sub: "Modules" },
                { val: "100+", sub: "Lessons" },
                { val: "Free", sub: "Always" },
                { val: "5 min", sub: "Per day" },
              ].map(s => (
                <div key={s.sub}>
                  <span style={{ fontWeight: 900, fontSize: 20, color: "#172b4d" }}>{s.val}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#6b7280", marginLeft: 6 }}>{s.sub}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Right 3D scene */}
          <div style={{ flex: "1 1 420px", minHeight: 560, alignSelf: "stretch", display: "flex" }}>
            <HeroScene width="100%" height="100%" />
          </div>
        </div>
      </section>

      {/* ── FEATURE: Streak ──────────────────────────────────── */}
      <Section>
        <FeatureRow
          tag="🔥 Build a habit"
          tagColor="#ff9600"
          heading={<>Make learning<br />a daily streak</>}
          body="Just 5 minutes a day builds real knowledge. Track your streak, stay motivated, and watch your understanding compound — just like a good investment."
          illustration={<StreakCard />}
        />
      </Section>

      {/* ── FEATURE: Lessons ─────────────────────────────────── */}
      <Section bg="#f9fafb" border>
        <FeatureRow
          flip
          tag="📚 Learn → Practice → Check"
          tagColor="#22c55e"
          heading={<>Bite-sized lessons<br />that actually stick</>}
          body="Every concept is taught in 3 steps: learn the idea, practice applying it, then check your understanding. No passive reading — active learning from day one."
          illustration={<LessonCard />}
        />
      </Section>

      {/* ── FEATURE: Progress ────────────────────────────────── */}
      <Section>
        <FeatureRow
          tag="📈 Track everything"
          tagColor="#3b82f6"
          heading={<>See exactly how<br />far you&apos;ve come</>}
          body="10 modules. 100 lessons. Track your progress from stock basics to reading earnings reports. Unlock each module as your confidence grows."
          illustration={<ProgressCard />}
        />
      </Section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", background: "#22c55e", borderTop: "2px solid #16a34a" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", textAlign: "center", width: "100%" }}>
          <h2 style={{
            fontFamily: font, fontWeight: 900,
            fontSize: "clamp(28px,5vw,48px)",
            color: "#fff", letterSpacing: "-0.5px",
            lineHeight: 1.15, marginBottom: 16,
          }}>
            Start learning today.<br />It&apos;s free, forever.
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginBottom: 40, lineHeight: 1.6 }}>
            Continue as a guest right away, or sign in with Google to keep your progress across visits.
          </p>
          <DuoBtn href="/onboarding" variant="white-on-green" big>
            Continue as Guest
          </DuoBtn>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ background: "#f9fafb", borderTop: "2px solid #f3f4f6" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "40px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
        }}>
          <StokedLogo />
          <span style={{ fontSize: 13, color: "#9ca3af" }}>© 2025 Stoked. Stock learning that actually clicks.</span>
          <div style={{ display: "flex", gap: 24 }}>
            {[["Learn", "/course"], ["Guest", "/onboarding"]].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#22c55e"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
              >{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
