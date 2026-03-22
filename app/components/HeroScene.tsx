"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ─── Orbit icon config ─────────────────────────────────────────────────────────
// Each icon orbits the scene center in a flattened ellipse.
// Depth illusion comes from Three.js perspective projection:
// icons behind the laptop are physically farther from camera → appear smaller.
//
// Tunable values:
//   src          PNG asset path (in /public)
//   spriteSize   world-unit size of the sprite billboard
//   orbitR       orbit radius (world units from scene centre)
//   orbitY       vertical centre height of this icon's orbit
//   orbitTilt    how much the orbit plane tilts (higher → more vertical bob)
//   orbitAngle   starting angle in radians
//   orbitSpeed   radians/sec (positive = clockwise viewed from above)
//   bobAmp/Speed additional sinusoidal vertical float
//   bobPhase     phase offset so icons don't bob in sync
//   baseScale    group scale multiplier
//   wobbleAmp    billboard Z-tilt oscillation amplitude (radians)
//   wobbleSpeed  billboard Z-tilt oscillation frequency
//   glowColor    PointLight hex colour
//   glowIntens   PointLight base intensity
interface IconCfg {
  src: string;
  spriteSize: number;
  orbitR: number;
  orbitY: number;
  orbitTilt: number;
  orbitAngle: number;
  orbitSpeed: number;
  bobAmp: number;
  bobSpeed: number;
  bobPhase: number;
  baseScale: number;
  wobbleAmp: number;
  wobbleSpeed: number;
  glowColor: number;
  glowIntens: number;
}

// ─── Orbit ring radii: 3.8 / 4.3 / 4.8 / 5.1 / 5.5  (0.3–0.5 wu apart) ──────
// Assigning each icon its own ring means they can never fully overlap —
// minimum separation between adjacent rings is always > 0.
// Mixed CW (+) / CCW (−) speeds prevent the group from locking into sync.
// Phase angles are spread across [0, 2π] to distribute starting positions.
const ICON_CONFIGS: IconCfg[] = [
  // Book/analysis — innermost ring, counter-clockwise, upper area
  {
    src: "/hero-icons/icon_book_analysis.png",
    spriteSize: 2.0,
    orbitR: 3.8, orbitY: 2.2, orbitTilt: 0.28, orbitAngle: 2.0,
    orbitSpeed: -0.18,                 // CCW — opposite to most others
    bobAmp: 0.22, bobSpeed: 1.10, bobPhase: 0.0,
    baseScale: 0.95, wobbleAmp: 0.14, wobbleSpeed: 0.9,
    glowColor: 0x3b82f6, glowIntens: 2.6,
  },
  // Rocket — outermost ring, clockwise, starts upper-right
  {
    src: "/hero-icons/icon_rocket.png",
    spriteSize: 2.5,
    orbitR: 5.5, orbitY: 2.8, orbitTilt: 0.15, orbitAngle: 5.5,
    orbitSpeed: 0.21,
    bobAmp: 0.30, bobSpeed: 0.85, bobPhase: 1.7,
    baseScale: 1.10, wobbleAmp: 0.18, wobbleSpeed: 0.75,
    glowColor: 0xfbbf24, glowIntens: 3.0,
  },
  // Happy bull — mid ring, clockwise, starts lower-right
  {
    src: "/hero-icons/icon_happybull.png",
    spriteSize: 2.7,
    orbitR: 4.8, orbitY: 0.3, orbitTilt: 0.38, orbitAngle: 3.9,
    orbitSpeed: 0.27,
    bobAmp: 0.28, bobSpeed: 0.95, bobPhase: 3.2,
    baseScale: 1.05, wobbleAmp: 0.12, wobbleSpeed: 1.1,
    glowColor: 0x22c55e, glowIntens: 2.8,
  },
  // Money bag — inner-mid ring, counter-clockwise, starts right side
  {
    src: "/hero-icons/icon_money_bag.png",
    spriteSize: 2.2,
    orbitR: 4.3, orbitY: 1.1, orbitTilt: 0.32, orbitAngle: 0.8,
    orbitSpeed: -0.23,                 // CCW
    bobAmp: 0.24, bobSpeed: 1.05, bobPhase: 4.8,
    baseScale: 0.90, wobbleAmp: 0.10, wobbleSpeed: 1.3,
    glowColor: 0xfbbf24, glowIntens: 2.8,
  },
  // Charging bull — second-outer ring, slow clockwise, starts upper-left
  {
    src: "/hero-icons/icon_charging_bull.png",
    spriteSize: 1.7,
    orbitR: 5.1, orbitY: 1.7, orbitTilt: 0.20, orbitAngle: 2.8,
    orbitSpeed: 0.15,
    bobAmp: 0.18, bobSpeed: 1.20, bobPhase: 2.1,
    baseScale: 0.80, wobbleAmp: 0.08, wobbleSpeed: 0.7,
    glowColor: 0x22c55e, glowIntens: 2.2,
  },
];

// ─── Main component ────────────────────────────────────────────────────────────
export default function HeroScene({
  width     = "100%",
  height    = "100%",
  minHeight = 0,
}: {
  width?: string;
  height?: string;
  minHeight?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled  = true;
    renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    const W = container.clientWidth  || 640;
    const H = container.clientHeight || 680;
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Scene / Camera ────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    // Camera pulled back and shifted up to frame the laptop comfortably.
    // FOV 44 gives a natural perspective without distortion.
    const camera = new THREE.PerspectiveCamera(44, W / H, 0.1, 200);
    // Camera sits at x=0; lookAt aimed at x=-1.5 so the scene content (at
    // root x=0) projects ~100px right of canvas centre — clear of the left
    // text column.  FOV 44 at z=14: half-width ≈ 5.66 wu, so 1.5 wu ≈ 27%
    // of half-width → ~80-110px on a 600-800px wide column.
    camera.position.set(0, 3.2, 14);
    camera.lookAt(-1.5, 0.8, 0);

    // ── Lights ────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(8, 14, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    const fillL = new THREE.DirectionalLight(0xbfdbfe, 0.65);
    fillL.position.set(-7, 5, 6);
    scene.add(fillL);

    const rimL = new THREE.DirectionalLight(0xfbbf24, 0.30);
    rimL.position.set(5, -3, -5);
    scene.add(rimL);

    const greenKey = new THREE.PointLight(0x22c55e, 4.5, 18);
    greenKey.position.set(-3, 4, 5);
    scene.add(greenKey);

    const goldKey = new THREE.PointLight(0xfbbf24, 3.2, 16);
    goldKey.position.set(4, 1, 4);
    scene.add(goldKey);

    // ── Root group — mouse tilt applied here ──────────────────────────────
    const root = new THREE.Group();
    // Scale the whole composition down 8% to reduce visual dominance and
    // give more breathing room around the text.
    root.scale.setScalar(0.92);
    scene.add(root);

    // ── Laptop group — holds the GLB ──────────────────────────────────────
    const laptopGroup = new THREE.Group();
    root.add(laptopGroup);

    // ── Screen texture: white canvas + logo ───────────────────────────────
    // We draw a white rectangle into an offscreen canvas, then stamp the logo
    // centered with padding. This guarantees the logo is always legible
    // regardless of how dark the GLB's underlying screen mesh is.
    // flipY=false matches GLTFLoader's UV convention (top-left origin).
    const texLoader = new THREE.TextureLoader();
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width  = 1024;
    screenCanvas.height = 640;
    const ctx2d = screenCanvas.getContext("2d")!;
    ctx2d.fillStyle = "#ffffff";
    ctx2d.fillRect(0, 0, 1024, 640);

    const screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.flipY      = false;
    screenTex.colorSpace = THREE.SRGBColorSpace;

    // Load logo PNG into the canvas preserving its natural aspect ratio.
    // Target: logo fills ~52% of canvas width, centered, with clean padding.
    // We never stretch — we use contain-style scaling so proportions are exact.
    const logoImg = new Image();
    logoImg.onload = () => {
      const cW = 1024, cH = 640;

      // Target draw width = 62% of canvas; derive height from natural ratio
      const naturalAspect = logoImg.naturalWidth / logoImg.naturalHeight;

      // Contain-fit: fill 90% of canvas height or 92% of width, whichever is smaller
      const byWidth  = cW * 0.92;
      const byHeight = cH * 0.90;
      const drawW = Math.min(byWidth, byHeight * naturalAspect);
      const drawH = drawW / naturalAspect;

      const drawX = (cW - drawW) / 2;
      const drawY = (cH - drawH) / 2;

      ctx2d.fillStyle = "#ffffff";
      ctx2d.fillRect(0, 0, cW, cH);
      ctx2d.drawImage(logoImg, drawX, drawY, drawW, drawH);
      screenTex.needsUpdate = true;
    };
    logoImg.src = "/hero-icons/stoked-logo.png";

    const glbLoader = new GLTFLoader();
    glbLoader.load(
      "/models/macbook.glb",
      (gltf) => {
        const model = gltf.scene;

        // ── Normalize scale ──────────────────────────────────────────────
        // GLB raw bounds: X ≈ 31.2 units wide. Target: 4.6 world units wide.
        // Adjust TARGET_WIDTH to make the laptop larger or smaller.
        const TARGET_WIDTH = 4.6;
        const rawBox = new THREE.Box3().setFromObject(model);
        const rawSize = rawBox.getSize(new THREE.Vector3());
        const scaleFactor = TARGET_WIDTH / rawSize.x;
        model.scale.setScalar(scaleFactor);

        // ── Centre the model ─────────────────────────────────────────────
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        // Place centroid at origin, then shift group for final positioning
        model.position.sub(center);

        // ── Enable shadows on all meshes ─────────────────────────────────
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow    = true;
            child.receiveShadow = true;

            // ── Apply logo to screen mesh ────────────────────────────────
            // The screen face uses the only material in the GLB that has
            // both an emissiveMap AND full-white emissive (1,1,1). Replacing
            // it with MeshBasicMaterial gives a clean, always-bright logo.
            const mats = Array.isArray(child.material)
              ? child.material
              : [child.material];

            mats.forEach((mat, idx) => {
              const m = mat as THREE.MeshStandardMaterial;
              if (
                m.emissiveMap !== null &&
                m.emissiveMap !== undefined &&
                m.emissive &&
                m.emissive.r > 0.8 &&
                m.emissive.g > 0.8 &&
                m.emissive.b > 0.8
              ) {
                const screenMat = new THREE.MeshBasicMaterial({
                  map:  screenTex,
                  side: THREE.FrontSide,
                });
                if (Array.isArray(child.material)) {
                  child.material[idx] = screenMat;
                } else {
                  child.material = screenMat;
                }
              }
            });
          }
        });

        laptopGroup.add(model);
      },
      undefined,
      (err) => console.error("GLB load error:", err)
    );

    // ── Final laptop group position ───────────────────────────────────────
    // Adjust Y to lift/lower the laptop; Z to push it back/forward.
    laptopGroup.position.set(0, -0.8, 0);

    // ── Sprite icons ──────────────────────────────────────────────────────
    // THREE.Sprite always faces the camera (billboard). SpriteMaterial is
    // unlit so PNG artwork renders at full pixel fidelity.
    type LiveIcon = {
      group:        THREE.Group;
      sprite:       THREE.Sprite;
      pointLight:   THREE.PointLight;
      cfg:          IconCfg;
      currentScale: number;
    };

    const liveIcons: LiveIcon[] = ICON_CONFIGS.map((cfg) => {
      const tex = texLoader.load(cfg.src);
      tex.colorSpace = THREE.SRGBColorSpace;

      const spriteMat = new THREE.SpriteMaterial({
        map:         tex,
        transparent: true,
        depthWrite:  false,
        alphaTest:   0.01,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(cfg.spriteSize, cfg.spriteSize, 1);

      const group = new THREE.Group();
      group.scale.setScalar(cfg.baseScale);
      group.add(sprite);

      const pl = new THREE.PointLight(cfg.glowColor, cfg.glowIntens, 5.5);
      pl.position.set(0, 0, 0.5);
      group.add(pl);

      root.add(group);
      return { group, sprite, pointLight: pl, cfg, currentScale: cfg.baseScale };
    });

    // ── Mouse / touch ─────────────────────────────────────────────────────
    let rawX = 0, rawY = 0, smoothX = 0, smoothY = 0;
    const mouseNDC = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      rawX = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      rawY = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      mouseNDC.set(rawX, -rawY);
    };
    window.addEventListener("mousemove", onMouseMove);

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const r = container.getBoundingClientRect();
      rawX = ((t.clientX - r.left) / r.width  - 0.5) * 2;
      rawY = ((t.clientY - r.top)  / r.height - 0.5) * 2;
    };
    container.addEventListener("touchmove", onTouchMove, { passive: true });

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      const W2 = container.clientWidth;
      const H2 = container.clientHeight;
      if (!W2 || !H2) return;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // ── Soft collision avoidance ──────────────────────────────────────────
    // Each icon carries a small repulsion velocity that is decayed each frame.
    // When two icons come within REPEL_DIST of each other, a quadratic force
    // pushes their velocities apart. Because orbit positions are reset from the
    // ellipse formula every frame, the velocity is only an additive offset —
    // drift cannot accumulate; the icons always want to return to their paths.
    //
    // Tuning:
    //   REPEL_DIST     — world-unit radius that triggers repulsion (wider = more space)
    //   REPEL_STRENGTH — peak force at zero distance (larger = stronger push)
    //   REPEL_DAMPING  — velocity decay per frame (0.7 = snappy, 0.9 = floaty)
    const REPEL_DIST     = 2.4;
    const REPEL_STRENGTH = 0.007;
    const REPEL_DAMPING  = 0.80;
    const repelVel = liveIcons.map(() => new THREE.Vector3());

    // ── Animation loop ────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      clock.getDelta();

      // Smooth mouse
      smoothX += (rawX - smoothX) * 0.075;
      smoothY += (rawY - smoothY) * 0.075;

      // Whole-scene tilt from mouse
      root.rotation.y =  smoothX * 0.50;
      root.rotation.x = -smoothY * 0.28;

      // Laptop gentle float
      laptopGroup.position.y = -0.8 + Math.sin(t * 0.48) * 0.07;

      // ── Pass 1: set orbit positions + sprite wobble ────────────────────
      for (const ic of liveIcons) {
        const cfg = ic.cfg;
        const angle = cfg.orbitAngle + t * cfg.orbitSpeed;

        // Elliptical orbit: Z flattened to 55% gives a convincing tilted-ring look
        const rx  = Math.cos(angle) * cfg.orbitR;
        const rz  = Math.sin(angle) * cfg.orbitR * 0.55;
        const bob = Math.sin(t * cfg.bobSpeed + cfg.bobPhase) * cfg.bobAmp;
        const ry  = cfg.orbitY + Math.sin(angle) * cfg.orbitR * cfg.orbitTilt + bob;
        ic.group.position.set(rx, ry, rz);

        // Billboard Z-tilt wobble (only rotation visible on a Sprite)
        ic.sprite.material.rotation =
          Math.sin(t * cfg.wobbleSpeed + cfg.bobPhase) * cfg.wobbleAmp;
      }

      // ── Soft repulsion pass ────────────────────────────────────────────
      // Decay existing velocities first, then accumulate new pairwise forces.
      for (let ri = 0; ri < repelVel.length; ri++) {
        repelVel[ri].multiplyScalar(REPEL_DAMPING);
      }
      for (let i = 0; i < liveIcons.length; i++) {
        for (let j = i + 1; j < liveIcons.length; j++) {
          const pa   = liveIcons[i].group.position;
          const pb   = liveIcons[j].group.position;
          const diff = new THREE.Vector3().subVectors(pa, pb);
          const dist = diff.length();
          if (dist < REPEL_DIST && dist > 0.001) {
            const ratio = 1 - dist / REPEL_DIST;
            const force = REPEL_STRENGTH * ratio * ratio; // quadratic falloff
            diff.normalize().multiplyScalar(force);
            repelVel[i].add(diff);
            repelVel[j].sub(diff);
          }
        }
      }
      // Apply velocity offsets on top of the orbit-computed positions
      liveIcons.forEach((ic, ri) => { ic.group.position.add(repelVel[ri]); });

      // ── Pass 2: hover scale + glow (positions now finalised) ──────────
      for (const ic of liveIcons) {
        const cfg  = ic.cfg;

        // Hover: grow icon when cursor is close in screen-space
        const proj = ic.group.position.clone().project(camera);
        const dx   = proj.x - mouseNDC.x;
        const dy   = proj.y - mouseNDC.y;
        const targetScale =
          Math.sqrt(dx * dx + dy * dy) < 0.28
            ? cfg.baseScale * 1.44
            : cfg.baseScale;
        ic.currentScale += (targetScale - ic.currentScale) * 0.12;
        ic.group.scale.setScalar(ic.currentScale);

        // Glow pulse
        ic.pointLight.intensity =
          cfg.glowIntens + Math.sin(t * 2.2 + cfg.bobPhase) * 1.0;
      }

      // Global light pulses
      greenKey.intensity = 4.2 + Math.sin(t * 1.2) * 1.4;
      goldKey.intensity  = 3.0 + Math.sin(t * 0.95 + 1.8) * 1.0;

      renderer.render(scene, camera);
    };

    requestAnimationFrame(() => { onResize(); animate(); });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("touchmove", onTouchMove);
      ro.disconnect();
      screenTex.dispose();
      liveIcons.forEach((ic) => {
        ic.sprite.material.map?.dispose();
        ic.sprite.material.dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width,
        height,
        minHeight,
        position: "relative",
        cursor: "grab",
      }}
    />
  );
}
