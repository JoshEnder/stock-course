"use client";

// Fixed mountain backdrop — sits behind the onboarding at z-index 0.
// The video from the landing hero is reused here so the world feels continuous.
// Brightness is pulled down and a blur overlay is applied so the onboarding
// content is always the clear focus.
export default function MountainBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* The same finalvid.mp4 from the hero — browser cache means no extra load */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          // Scale slightly to prevent blur fringe at edges
          transform: "scale(1.05)",
          filter: "brightness(0.52)",
        }}
      >
        <source src="/finalvid.mp4" type="video/mp4" />
      </video>

      {/* Blur + atmosphere overlay — separates mountain from onboarding */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          background: "rgba(4,8,14,0.28)",
        }}
      />
    </div>
  );
}
