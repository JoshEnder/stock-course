// app/lib/animations.ts
// Pure vanilla animation utilities. No libraries. Import only in "use client" components.
// useCorrectStreak requires React — all other exports are framework-agnostic.

import { useState, useRef, useCallback } from "react";

// ─── Guard ────────────────────────────────────────────────────────────────────
function canAnimate(el: HTMLElement): boolean {
  return typeof el.animate === "function";
}

// ─── triggerCorrect ───────────────────────────────────────────────────────────
// Green pulse ring + bounce + glow — fired on a correct answer card
export function triggerCorrect(element: HTMLElement): void {
  if (!canAnimate(element)) return;
  const rect = element.getBoundingClientRect();

  // Expanding ring from element bounds
  const ring = document.createElement("div");
  ring.style.cssText = [
    "position:fixed",
    `left:${rect.left + rect.width / 2}px`,
    `top:${rect.top + rect.height / 2}px`,
    `width:${rect.width}px`,
    `height:${rect.height}px`,
    "border-radius:1.4rem",
    "border:2.5px solid #22c55e",
    "transform:translate(-50%,-50%)",
    "pointer-events:none",
    "z-index:9999",
  ].join(";");
  document.body.appendChild(ring);
  ring.animate(
    [
      { transform: "translate(-50%,-50%) scale(1)", opacity: 0.75 },
      { transform: "translate(-50%,-50%) scale(1.55)", opacity: 0 },
    ],
    { duration: 480, easing: "ease-out", fill: "forwards" }
  ).onfinish = () => ring.remove();

  // Snap bounce
  element.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.08)", offset: 0.35 },
      { transform: "scale(0.96)", offset: 0.70 },
      { transform: "scale(1)" },
    ],
    { duration: 400, easing: "ease-out" }
  );

  // Green glow flash
  element.animate(
    [
      { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
      { boxShadow: "0 0 0 8px rgba(34,197,94,0.22), 0 0 28px rgba(34,197,94,0.14)", offset: 0.35 },
      { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
    ],
    { duration: 600, easing: "ease-out" }
  );
}

// ─── triggerIncorrect ─────────────────────────────────────────────────────────
// Horizontal shake + red tint — fired on incorrect answer
export function triggerIncorrect(element: HTMLElement): void {
  if (!canAnimate(element)) return;

  element.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-9px)", offset: 0.12 },
      { transform: "translateX(8px)",  offset: 0.28 },
      { transform: "translateX(-7px)", offset: 0.44 },
      { transform: "translateX(5px)",  offset: 0.60 },
      { transform: "translateX(-3px)", offset: 0.76 },
      { transform: "translateX(0)" },
    ],
    { duration: 320, easing: "ease-out" }
  );

  element.animate(
    [
      { backgroundColor: "transparent" },
      { backgroundColor: "rgba(239,68,68,0.07)", offset: 0.25 },
      { backgroundColor: "transparent" },
    ],
    { duration: 400, easing: "ease-out" }
  );
}

// ─── triggerXP ────────────────────────────────────────────────────────────────
// "+N XP" floats upward + arcs right from the origin element
export function triggerXP(amount: number, originElement: HTMLElement): void {
  const rect = originElement.getBoundingClientRect();
  const el = document.createElement("div");
  el.textContent = `+${amount} XP`;
  el.style.cssText = [
    "position:fixed",
    `left:${rect.left + rect.width / 2}px`,
    `top:${rect.top + 6}px`,
    "transform:translateX(-50%)",
    "font-family:var(--font-dm-sans,'DM Sans',system-ui,sans-serif)",
    "font-size:0.95rem",
    "font-weight:700",
    "color:#22c55e",
    "pointer-events:none",
    "z-index:9999",
    "white-space:nowrap",
    "text-shadow:0 2px 8px rgba(34,197,94,0.35)",
  ].join(";");
  document.body.appendChild(el);

  el.animate(
    [
      { transform: "translateX(-50%) translateY(0px)",   opacity: 1 },
      { transform: "translateX(-35%) translateY(-52px)", opacity: 0 },
    ],
    { duration: 800, easing: "cubic-bezier(0.22,1,0.36,1)", fill: "forwards" }
  ).onfinish = () => el.remove();
}

// ─── triggerConfetti ──────────────────────────────────────────────────────────
// Canvas-based particle burst from any (x, y) screen position
export function triggerConfetti(
  originX: number,
  originY: number,
  count = 40
): void {
  // Skip on mobile — canvas confetti is expensive on low-end devices
  if (typeof window !== "undefined" && window.innerWidth <= 640) return;
  const canvas = document.createElement("canvas");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText = [
    "position:fixed",
    "inset:0",
    "width:100%",
    "height:100%",
    "pointer-events:none",
    "z-index:9998",
  ].join(";");
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;
  const COLORS = [
    "#22c55e", "#16a34a", "#86efac",
    "#ffffff", "#0f172a", "#4ade80",
    "#bbf7d0", "#dcfce7",
  ];

  interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    rot: number; rotV: number;
    color: string;
    w: number; h: number;
    isCircle: boolean;
  }

  const particles: Particle[] = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.5 + Math.random() * 9;
    return {
      x: originX, y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3.5,
      rot:  Math.random() * 360,
      rotV: (Math.random() - 0.5) * 14,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: 5 + Math.random() * 7,
      h: 5 + Math.random() * 10,
      isCircle: Math.random() > 0.45,
    };
  });

  const GRAVITY   = 0.32;
  const DURATION  = 1200;
  const startTime = performance.now();

  function draw(now: number): void {
    const t = Math.min((now - startTime) / DURATION, 1);
    if (t >= 1) { canvas.remove(); return; }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.vy += GRAVITY;
      p.x  += p.vx;
      p.y  += p.vy;
      p.rot += p.rotV;

      const alpha = t > 0.65 ? 1 - (t - 0.65) / 0.35 : 1;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.isCircle) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// ─── triggerStreakFlash ───────────────────────────────────────────────────────
// Full-screen green flash on 3+ correct streak
export function triggerStreakFlash(): void {
  const el = document.createElement("div");
  el.style.cssText = [
    "position:fixed",
    "inset:0",
    "background:#22c55e",
    "pointer-events:none",
    "z-index:9997",
  ].join(";");
  document.body.appendChild(el);
  el.animate(
    [{ opacity: 0 }, { opacity: 0.08, offset: 0.25 }, { opacity: 0 }],
    { duration: 300, easing: "ease-out", fill: "forwards" }
  ).onfinish = () => el.remove();
}

// ─── triggerModuleUnlock ──────────────────────────────────────────────────────
// Scale + glow + sparkle stars — fired when a module is unlocked
export function triggerModuleUnlock(moduleElement: HTMLElement): void {
  if (!canAnimate(moduleElement)) return;

  moduleElement.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.12)", offset: 0.4 },
      { transform: "scale(0.97)", offset: 0.72 },
      { transform: "scale(1)" },
    ],
    { duration: 500, easing: "ease-out" }
  );

  moduleElement.animate(
    [
      { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
      { boxShadow: "0 0 0 10px rgba(34,197,94,0.28), 0 0 48px rgba(34,197,94,0.18)", offset: 0.4 },
      { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
    ],
    { duration: 700, easing: "ease-out" }
  );

  const rect = moduleElement.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  const STAR = "M0-7 L1.6-2.2 6.6-2.2 2.6 0.8 4.1 5.8 0 3 -4.1 5.8 -2.6 0.8 -6.6-2.2 -1.6-2.2Z";

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const dist  = 38 + Math.random() * 22;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.cssText = [
      "position:fixed",
      `left:${cx}px`,
      `top:${cy}px`,
      "width:14px",
      "height:14px",
      "pointer-events:none",
      "z-index:9999",
      "transform:translate(-50%,-50%) scale(0)",
      "overflow:visible",
    ].join(";");
    svg.setAttribute("viewBox", "-8 -8 16 16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", STAR);
    path.setAttribute("fill", i % 2 === 0 ? "#22c55e" : "#86efac");
    svg.appendChild(path);
    document.body.appendChild(svg);

    svg.animate(
      [
        { transform: "translate(-50%,-50%) scale(0)", opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(1)`,
          opacity: 1,
          offset: 0.5,
        },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * dist * 1.4}px), calc(-50% + ${Math.sin(angle) * dist * 1.4}px)) scale(0.4)`,
          opacity: 0,
        },
      ],
      { duration: 600, delay: i * 60, easing: "ease-out", fill: "forwards" }
    ).onfinish = () => svg.remove();
  }
}

// ─── triggerProgressFill ──────────────────────────────────────────────────────
// Animate fill from → to, shimmer sweep on finish, gold glow at 100%
export function triggerProgressFill(
  fillElement: HTMLElement,
  from: number,
  to: number
): void {
  if (!canAnimate(fillElement)) return;
  const f  = Math.max(0, Math.min(from, 100));
  const t2 = Math.max(0, Math.min(to,   100));

  const anim = fillElement.animate(
    [{ width: `${f}%` }, { width: `${t2}%` }],
    { duration: 600, easing: "cubic-bezier(0.22,1,0.36,1)", fill: "forwards" }
  );

  anim.onfinish = () => {
    fillElement.style.width = `${t2}%`;

    // Shimmer sweep
    const shimmer = document.createElement("div");
    shimmer.style.cssText = [
      "position:absolute",
      "top:0",
      "bottom:0",
      "width:55%",
      "background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.65) 50%,transparent 100%)",
      "pointer-events:none",
    ].join(";");
    fillElement.style.position = "relative";
    fillElement.style.overflow = "hidden";
    fillElement.appendChild(shimmer);
    shimmer.animate(
      [{ transform: "translateX(-100%)" }, { transform: "translateX(280%)" }],
      { duration: 480, easing: "ease-in-out", fill: "forwards" }
    ).onfinish = () => shimmer.remove();

    // Golden glow at 100%
    if (t2 >= 100) {
      fillElement.animate(
        [
          { boxShadow: "0 0 0 0 rgba(251,191,36,0)" },
          { boxShadow: "0 0 0 4px rgba(251,191,36,0.45), 0 0 20px rgba(251,191,36,0.3)", offset: 0.45 },
          { boxShadow: "0 0 0 0 rgba(251,191,36,0)" },
        ],
        { duration: 700, easing: "ease-out" }
      );
    }
  };
}

// ─── triggerLessonComplete ────────────────────────────────────────────────────
// White flash + confetti from top-center
export function triggerLessonComplete(): void {
  const flash = document.createElement("div");
  flash.style.cssText =
    "position:fixed;inset:0;background:#ffffff;pointer-events:none;z-index:9996;";
  document.body.appendChild(flash);
  flash.animate(
    [{ opacity: 0 }, { opacity: 0.4, offset: 0.2 }, { opacity: 0 }],
    { duration: 200, fill: "forwards" }
  ).onfinish = () => flash.remove();

  setTimeout(() => {
    triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.15);
  }, 80);
}

// ─── triggerBossComplete ──────────────────────────────────────────────────────
// Stronger flash + dense confetti + expanding green ripple
export function triggerBossComplete(): void {
  const flash = document.createElement("div");
  flash.style.cssText =
    "position:fixed;inset:0;background:#ffffff;pointer-events:none;z-index:9996;";
  document.body.appendChild(flash);
  flash.animate(
    [{ opacity: 0 }, { opacity: 0.6, offset: 0.15 }, { opacity: 0 }],
    { duration: 300, fill: "forwards" }
  ).onfinish = () => flash.remove();

  setTimeout(() => {
    triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.15, 60);
  }, 120);

  const ripple = document.createElement("div");
  ripple.style.cssText = [
    "position:fixed",
    `left:${window.innerWidth / 2}px`,
    `top:${window.innerHeight / 2}px`,
    "width:0",
    "height:0",
    "border-radius:50%",
    "border:3px solid rgba(34,197,94,0.6)",
    "transform:translate(-50%,-50%)",
    "pointer-events:none",
    "z-index:9995",
  ].join(";");
  document.body.appendChild(ripple);
  ripple.animate(
    [
      { width: "0px",   height: "0px",   opacity: 0.8, transform: "translate(-50%,-50%)" },
      { width: "120vw", height: "120vw", opacity: 0,   transform: "translate(-50%,-50%)" },
    ],
    { duration: 900, easing: "ease-out", fill: "forwards" }
  ).onfinish = () => ripple.remove();
}

// ─── useCorrectStreak ─────────────────────────────────────────────────────────
// Tracks consecutive correct answers. At 3: streak flash. At 5: mini confetti.
export function useCorrectStreak() {
  const [streak, setStreak] = useState(0);
  const countRef = useRef(0);

  const recordCorrect = useCallback(() => {
    countRef.current += 1;
    setStreak(countRef.current);
    if (countRef.current === 3) {
      triggerStreakFlash();
    }
    if (countRef.current === 5) {
      triggerConfetti(window.innerWidth / 2, window.innerHeight / 2, 25);
    }
  }, []);

  const recordIncorrect = useCallback(() => {
    countRef.current = 0;
    setStreak(0);
  }, []);

  return { streak, recordCorrect, recordIncorrect };
}
