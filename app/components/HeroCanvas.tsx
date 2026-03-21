"use client";
import { useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── runway path: bottom (near viewer) → top (vanishing point) ───────────────
const RUNWAY: [number, number][] = [
  [0.500, 0.980],
  [0.500, 0.880],
  [0.540, 0.780],
  [0.460, 0.700],
  [0.520, 0.620],
  [0.480, 0.550],
  [0.500, 0.480],
];

// ─── chapter text elements ────────────────────────────────────────────────────
interface TextLine {
  text: string;
  font: (W: number) => string;
  color: string;
  yOffset: (H: number) => number;
}
interface TextEl { worldZ: number; lines: TextLine[]; }

const TEXT_ELS: TextEl[] = [
  // Chapter 0 — worldZ 60
  {
    worldZ: 60,
    lines: [
      { text: "STOKED",
        font: W => `bold italic ${W * 0.13}px 'Cormorant Garamond', Georgia, serif`,
        color: "#ffffff", yOffset: H => -H * 0.08 },
      { text: "Stock learning that actually clicks.",
        font: W => `400 ${W * 0.018}px 'DM Sans', system-ui, sans-serif`,
        color: "rgba(255,255,255,0.65)", yOffset: H => H * 0.06 },
    ],
  },
  // Chapter 1 — worldZ 160
  {
    worldZ: 160,
    lines: [
      { text: "THE REALITY",
        font: W => `600 ${W * 0.012}px 'DM Sans', system-ui, sans-serif`,
        color: "#22c55e", yOffset: H => -H * 0.14 },
      { text: "Most people never",
        font: W => `400 ${W * 0.055}px 'Cormorant Garamond', Georgia, serif`,
        color: "#ffffff", yOffset: H => -H * 0.04 },
      { text: "understand stocks.",
        font: W => `400 ${W * 0.055}px 'Cormorant Garamond', Georgia, serif`,
        color: "#ffffff", yOffset: H => H * 0.06 },
      { text: "They try. They quit. The concepts never click.",
        font: W => `400 ${W * 0.017}px 'DM Sans', system-ui, sans-serif`,
        color: "rgba(255,255,255,0.55)", yOffset: H => H * 0.16 },
    ],
  },
  // Chapter 2 — worldZ 260
  {
    worldZ: 260,
    lines: [
      { text: "THE FIX",
        font: W => `600 ${W * 0.012}px 'DM Sans', system-ui, sans-serif`,
        color: "#22c55e", yOffset: H => -H * 0.14 },
      { text: "Stoked is built",
        font: W => `400 ${W * 0.055}px 'Cormorant Garamond', Georgia, serif`,
        color: "#ffffff", yOffset: H => -H * 0.04 },
      { text: "differently.",
        font: W => `italic 400 ${W * 0.055}px 'Cormorant Garamond', Georgia, serif`,
        color: "#ffffff", yOffset: H => H * 0.06 },
      { text: "10 modules. 100 lessons. Interactive from day one.",
        font: W => `400 ${W * 0.017}px 'DM Sans', system-ui, sans-serif`,
        color: "rgba(255,255,255,0.55)", yOffset: H => H * 0.16 },
    ],
  },
  // Chapter 3 main — worldZ 360
  {
    worldZ: 360,
    lines: [
      { text: "THE PATH",
        font: W => `600 ${W * 0.012}px 'DM Sans', system-ui, sans-serif`,
        color: "#22c55e", yOffset: H => -H * 0.18 },
      { text: "From zero to",
        font: W => `400 ${W * 0.055}px 'Cormorant Garamond', Georgia, serif`,
        color: "#ffffff", yOffset: H => -H * 0.06 },
      { text: "genuinely confident.",
        font: W => `400 ${W * 0.055}px 'Cormorant Garamond', Georgia, serif`,
        color: "#ffffff", yOffset: H => H * 0.04 },
    ],
  },
  // Chapter 3 staggered bullets
  { worldZ: 360, lines: [{ text: "· Learn",
      font: W => `400 ${W * 0.022}px 'DM Sans', system-ui, sans-serif`,
      color: "#86efac", yOffset: H => H * 0.14 }] },
  { worldZ: 380, lines: [{ text: "· Practice",
      font: W => `400 ${W * 0.022}px 'DM Sans', system-ui, sans-serif`,
      color: "#86efac", yOffset: H => H * 0.22 }] },
  { worldZ: 400, lines: [{ text: "· Level up",
      font: W => `400 ${W * 0.022}px 'DM Sans', system-ui, sans-serif`,
      color: "#86efac", yOffset: H => H * 0.30 }] },
  // Chapter 4 — worldZ 460
  {
    worldZ: 460,
    lines: [
      { text: "Ready?",
        font: W => `400 ${W * 0.11}px 'Cormorant Garamond', Georgia, serif`,
        color: "#ffffff", yOffset: H => -H * 0.08 },
      { text: "Start your journey.",
        font: W => `400 ${W * 0.02}px 'DM Sans', system-ui, sans-serif`,
        color: "rgba(255,255,255,0.6)", yOffset: H => H * 0.06 },
    ],
  },
];

// ─── utils ────────────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

type Props = { onScrollProgress?: (p: number) => void };

export default function HeroCanvas({ onScrollProgress }: Props) {
  const textCanvasRef  = useRef<HTMLCanvasElement>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef          = useRef<HTMLDivElement>(null);
  const ctaRef         = useRef<HTMLButtonElement>(null);
  const badgeRef       = useRef<HTMLDivElement>(null);
  const rafRef         = useRef<number>(0);
  const cbRef          = useRef(onScrollProgress);

  // Keep callback ref current without restarting the effect
  useEffect(() => { cbRef.current = onScrollProgress; }, [onScrollProgress]);

  useEffect(() => {
    const textCanvas = textCanvasRef.current;
    const grainCanvas = grainCanvasRef.current;
    if (!textCanvas || !grainCanvas) return;
    const textContext = textCanvas.getContext('2d');
    const grainContext = grainCanvas.getContext('2d');
    if (!textContext || !grainContext) return;
    const textCanvasElement: HTMLCanvasElement = textCanvas;
    const grainCanvasElement: HTMLCanvasElement = grainCanvas;
    const ctx: CanvasRenderingContext2D = textContext;
    const grainCtx: CanvasRenderingContext2D = grainContext;

    // ── offscreen grain texture (created once) ────────────────────────────
    const og    = document.createElement('canvas');
    og.width = og.height = 512;
    const ogCtx = og.getContext('2d')!;
    const id    = ogCtx.createImageData(512, 512);
    for (let i = 0; i < id.data.length; i += 4) {
      id.data[i] = id.data[i + 1] = id.data[i + 2] = Math.random() > 0.5 ? 255 : 0;
      id.data[i + 3] = Math.random() < 0.04 ? Math.round(Math.random() * 15 + 3) : 0;
    }
    ogCtx.putImageData(id, 0, 0);

    let dpr = 1, fontsReady = false, rsT = 0;

    // ── canvas sizing ─────────────────────────────────────────────────────
    function resize() {
      dpr = window.devicePixelRatio || 1;
      const W = window.innerWidth, H = window.innerHeight;
      textCanvasElement.width  = W * dpr; textCanvasElement.height  = H * dpr;
      grainCanvasElement.width = W * dpr; grainCanvasElement.height = H * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      grainCtx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      grainCtx.scale(dpr, dpr);
    }
    window.addEventListener('resize', () => {
      clearTimeout(rsT);
      rsT = window.setTimeout(resize, 150) as unknown as number;
    });
    resize();

    document.fonts.ready.then(() => { fontsReady = true; });

    // ── draw grain ────────────────────────────────────────────────────────
    function drawGrain() {
      const W = window.innerWidth, H = window.innerHeight;
      grainCtx.clearRect(0, 0, W, H);
      grainCtx.save();
      grainCtx.globalAlpha = 0.03;
      const ox = Math.random() * 200 - 100, oy = Math.random() * 200 - 100;
      for (let x = ox; x < W + 512; x += 512)
        for (let y = oy; y < H + 512; y += 512)
          grainCtx.drawImage(og, x, y);
      grainCtx.restore();
    }

    // ── draw runway ───────────────────────────────────────────────────────
    function drawRunway(cameraZ: number) {
      const W = window.innerWidth, H = window.innerHeight;
      const sp = cameraZ / 500;
      const segCount = RUNWAY.length - 1;
      const progSegs = sp * segCount;
      const fullSegs = Math.floor(progSegs);
      const partial  = progSegs - fullSegs;
      if (progSegs < 0.01) return;

      // Build the drawn points (bottom → current tip)
      const drawn: [number, number][] = [];
      for (let i = 0; i <= Math.min(fullSegs + 1, segCount); i++) {
        drawn.push([RUNWAY[i][0] * W, RUNWAY[i][1] * H]);
      }
      // Trim last point to fractional position
      if (fullSegs < segCount && drawn.length >= 2) {
        const a = drawn[drawn.length - 2], b = drawn[drawn.length - 1];
        drawn[drawn.length - 1] = [lerp(a[0], b[0], partial), lerp(a[1], b[1], partial)];
      }

      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
      ctx.shadowColor = '#22c55e';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      for (let i = 0; i < drawn.length - 1; i++) {
        const t     = i / (segCount - 1);
        const alpha = lerp(0.07, 0.85, t);
        const lw    = lerp(0.5, 4.2, t);
        const p0 = drawn[Math.max(0, i - 1)];
        const p1 = drawn[i];
        const p2 = drawn[i + 1];
        const p3 = drawn[Math.min(drawn.length - 1, i + 2)];
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
        ctx.strokeStyle = `rgba(34,197,94,${alpha.toFixed(3)})`;
        ctx.lineWidth   = lw;
        ctx.shadowBlur  = lerp(2, 16, t);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // Endpoint dot
      const tip   = drawn[drawn.length - 1];
      const pulse = Math.sin(Date.now() * 0.003) * 3 + 14;
      ctx.beginPath();
      ctx.arc(tip[0], tip[1], pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(34,197,94,0.3)';
      ctx.lineWidth   = 1.5;
      ctx.shadowBlur  = 0;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(tip[0], tip[1], 5, 0, Math.PI * 2);
      ctx.fillStyle  = '#22c55e';
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur  = 18;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // ── draw 3D text ──────────────────────────────────────────────────────
    function drawText(cameraZ: number) {
      if (!fontsReady) return;
      const W = window.innerWidth, H = window.innerHeight;
      const PERSP = 300;

      for (const el of TEXT_ELS) {
        const delta = el.worldZ - cameraZ;

        // Opacity ramp: invisible far away, full when right on top, quick fade after
        let opacity = 0;
        if      (delta > 150)  opacity = 0;
        else if (delta > 50)   opacity = ((150 - delta) / 100) * 0.4;
        else if (delta > 0)    opacity = 0.4 + ((50 - delta) / 50) * 0.6;
        else if (delta > -30)  opacity = 1.0 - (-delta / 30);
        else                   opacity = 0;
        if (opacity <= 0.005) continue;

        // Perspective scale: text grows as camera approaches, then overshoots
        const scale = clamp(PERSP / (PERSP + delta), 0.05, 3.0);

        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.scale(scale, scale);
        ctx.globalAlpha  = opacity;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';

        for (const line of el.lines) {
          ctx.font      = line.font(W);
          ctx.fillStyle = line.color;
          // Subtle glow on white text only
          if (line.color === '#ffffff') {
            ctx.shadowColor = 'rgba(34,197,94,0.18)';
            ctx.shadowBlur  = 10;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fillText(line.text, 0, line.yOffset(H));
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    }

    // ── main RAF loop ─────────────────────────────────────────────────────
    function loop() {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const cameraZ   = (window.scrollY / maxScroll) * 500;
      const sp        = cameraZ / 500;

      // Background gradient: center glow shifts from dark green → bright green
      if (bgRef.current) {
        const r = Math.round(lerp(0x0d, 0x22, sp));
        const g = Math.round(lerp(0x33, 0xc5, sp));
        const b = Math.round(lerp(0x21, 0x5e, sp));
        bgRef.current.style.background =
          `radial-gradient(ellipse at 50% 60%, rgba(${r},${g},${b},0.62) 0%, rgba(5,46,22,0.72) 40%, rgba(2,13,7,0.88) 100%)`;
      }

      // CTA button
      if (ctaRef.current) {
        const a = clamp((cameraZ - 430) / 30, 0, 1);
        ctaRef.current.style.opacity       = String(a);
        ctaRef.current.style.pointerEvents = a > 0.05 ? 'auto' : 'none';
      }

      // Spinning badge
      if (badgeRef.current) {
        const a = clamp(1 - (cameraZ - 80) / 40, 0, 1);
        badgeRef.current.style.opacity = String(a);
      }

      const W = window.innerWidth, H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);
      drawGrain();
      drawRunway(cameraZ);
      drawText(cameraZ);

      cbRef.current?.(sp);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <>
      {/* ── radial gradient overlay (dynamic, shifts with scroll) ───────── */}
      <div
        ref={bgRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 60%, rgba(13,51,33,0.62) 0%, rgba(5,46,22,0.72) 40%, rgba(2,13,7,0.88) 100%)',
        }}
      />

      {/* ── grain canvas ────────────────────────────────────────────────── */}
      <canvas
        ref={grainCanvasRef}
        style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none', display: 'block' }}
      />

      {/* ── text + runway canvas ─────────────────────────────────────────── */}
      <canvas
        ref={textCanvasRef}
        style={{ position: 'fixed', inset: 0, zIndex: 15, pointerEvents: 'none', display: 'block' }}
      />

      {/* ── spinning badge (chapter 0 only) ─────────────────────────────── */}
      <div
        ref={badgeRef}
        style={{
          position: 'fixed', top: '12%', right: '8%',
          width: '130px', height: '130px',
          zIndex: 22, pointerEvents: 'none',
          animation: 'hc-spin 12s linear infinite',
        }}
      >
        <svg viewBox="0 0 130 130" width="130" height="130" aria-hidden="true">
          <defs>
            <path id="hc-cp" d="M 65,65 m -47,0 a 47,47 0 1,1 94,0 a 47,47 0 1,1 -94,0" />
          </defs>
          <text
            fontSize="9"
            fill="rgba(255,255,255,0.55)"
            fontFamily="'DM Sans', system-ui, sans-serif"
            letterSpacing="2.2"
          >
            <textPath href="#hc-cp">
              STOCK LEARNING · GET STOKED · STOCK LEARNING · GET STOKED ·
            </textPath>
          </text>
        </svg>
      </div>

      {/* ── navbar ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 25,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 36px',
      }}>
        <div aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px' }}>
          {([0.4, 0.6, 0.5, 0.7, 0.45] as number[]).map((dur, i) => (
            <div key={i} style={{
              width: '3px', borderRadius: '2px',
              background: 'rgba(255,255,255,0.72)', height: '12px',
              animation: `hc-eq-${i} ${dur}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>
        <span style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '1rem', letterSpacing: '0.3em', color: '#ffffff', fontWeight: 600,
        }}>STOKED</span>
        <Link href="/onboarding" style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.9rem',
        }}>Begin →</Link>
      </nav>

      {/* ── CTA button ──────────────────────────────────────────────────── */}
      <button
        ref={ctaRef}
        type="button"
        style={{
          position: 'fixed', bottom: '12%', left: '50%', transform: 'translateX(-50%)',
          opacity: 0, pointerEvents: 'none', zIndex: 22,
          background: '#22c55e', color: '#ffffff',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: 600, fontSize: '1rem',
          padding: '16px 44px', borderRadius: '100px', border: 'none',
          boxShadow: '0 4px 32px rgba(34,197,94,0.45)',
          cursor: 'pointer',
          transition: 'transform 200ms ease-out, box-shadow 200ms ease-out, opacity 300ms ease-out',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.transform = 'translateX(-50%) translateY(-3px)';
          el.style.boxShadow = '0 8px 44px rgba(34,197,94,0.62)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.transform = 'translateX(-50%)';
          el.style.boxShadow = '0 4px 32px rgba(34,197,94,0.45)';
        }}
        onClick={() => { window.location.href = '/onboarding'; }}
      >
        Start Learning Free →
      </button>

      {/* ── scroll spacer (creates the 700vh scrollable distance) ───────── */}
      <div style={{ height: '700vh' }} />

      {/* ── keyframes ───────────────────────────────────────────────────── */}
      <style>{`
        @keyframes hc-spin  { to { transform: rotate(360deg); } }
        @keyframes hc-eq-0  { from { height:  8px } to { height: 20px } }
        @keyframes hc-eq-1  { from { height: 18px } to { height:  7px } }
        @keyframes hc-eq-2  { from { height: 10px } to { height: 19px } }
        @keyframes hc-eq-3  { from { height: 16px } to { height:  5px } }
        @keyframes hc-eq-4  { from { height:  9px } to { height: 18px } }
      `}</style>
    </>
  );
}
