"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Geometry helpers ─────────────────────────────────────────────────────────
const b = (w: number, h: number, d: number, m: THREE.Material) =>
  new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const c = (rt: number, rb: number, h: number, seg: number, m: THREE.Material) =>
  new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
const s = (r: number, ws: number, hs: number, m: THREE.Material) =>
  new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), m);
const mat = (
  color: number,
  rough = 0.45,
  metal = 0.0,
  emissive = 0x000000,
  ei = 0.0
) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: metal,
    emissive,
    emissiveIntensity: ei,
  });


// ─── Icon: book + chart + magnifier ──────────────────────────────────────────
function makeChartIcon(): THREE.Group {
  const g = new THREE.Group();
  const blue   = mat(0x1e3a8a, 0.4, 0.3);
  const white  = mat(0xf0f9ff, 0.3);
  const green  = mat(0x22c55e, 0.3, 0.0, 0x22c55e, 0.25);
  const lgreen = mat(0x86efac, 0.3, 0.0, 0x86efac, 0.15);
  const navy   = mat(0x172b4d, 0.4, 0.3);

  // Book body
  const book = b(1.2, 0.9, 0.14, blue);
  book.castShadow = true;
  g.add(book);
  // Book spine
  const spine = b(0.06, 0.9, 0.14, navy);
  spine.position.x = -0.57;
  g.add(spine);
  // Pages
  const pages = b(1.0, 0.74, 0.09, white);
  pages.position.z = 0.08;
  g.add(pages);
  // Page lines
  for (let i = 0; i < 4; i++) {
    const line = b(0.5, 0.03, 0.05, mat(0xd1d5db, 0.7));
    line.position.set(-0.18, 0.22 - i * 0.13, 0.12);
    g.add(line);
  }
  // Chart bars
  const hs = [0.22, 0.40, 0.30, 0.54];
  const ms = [lgreen, green, green, green];
  for (let i = 0; i < 4; i++) {
    const bar = b(0.12, hs[i], 0.1, ms[i]);
    bar.position.set(-0.24 + i * 0.17, -0.08 + hs[i]/2, 0.12);
    g.add(bar);
  }
  // Trend arrow
  const shaft = b(0.56, 0.045, 0.08, mat(0x16a34a, 0.3, 0, 0x22c55e, 0.4));
  shaft.rotation.z = -0.44;
  shaft.position.set(-0.04, 0.28, 0.12);
  g.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.18, 5), mat(0x22c55e, 0.2, 0, 0x22c55e, 0.5));
  tip.rotation.z = Math.PI / 2 - 0.44;
  tip.position.set(0.27, 0.38, 0.12);
  g.add(tip);
  // Magnifier
  const lens = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 10, 22), mat(0x172b4d, 0.3, 0.5));
  lens.position.set(0.42, -0.22, 0.18);
  g.add(lens);
  const glass = s(0.23, 12, 10, mat(0x93c5fd, 0.1, 0, 0x3b82f6, 0.4));
  glass.position.copy(lens.position);
  g.add(glass);
  const handle = b(0.09, 0.38, 0.09, navy);
  handle.position.set(0.61, -0.43, 0.18);
  handle.rotation.z = -0.6;
  g.add(handle);
  return g;
}

// ─── Icon: rocket ─────────────────────────────────────────────────────────────
function makeRocketIcon(): THREE.Group {
  const g = new THREE.Group();
  const white  = mat(0xffffff, 0.18, 0.25);
  const navy   = mat(0x1e3a8a, 0.28, 0.45);
  const green  = mat(0x22c55e, 0.28, 0.1, 0x22c55e, 0.2);
  const blue   = mat(0x60a5fa, 0.08, 0.0, 0x3b82f6, 0.55);
  const stripe = mat(0x93c5fd, 0.15, 0.2, 0x60a5fa, 0.3);
  const flame  = mat(0xfbbf24, 0.1, 0, 0xfbbf24, 0.9);
  const fcore  = mat(0xfef3c7, 0.05, 0, 0xffffff, 1.0);

  // Body segments (two-tone white/blue stripe pattern)
  const body = c(0.24, 0.24, 0.82, 14, white);
  body.castShadow = true; g.add(body);
  const band = c(0.245, 0.245, 0.12, 14, stripe);
  band.position.y = 0.22; g.add(band);
  const band2 = c(0.245, 0.245, 0.07, 14, navy);
  band2.position.y = -0.12; g.add(band2);

  // Nose
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.52, 14), navy);
  nose.position.y = 0.67; g.add(nose);
  // Nose tip (green)
  const ntip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 8), green);
  ntip.position.y = 0.97; g.add(ntip);

  // Porthole
  const pw = s(0.13, 12, 10, blue);
  pw.position.set(0, 0.16, 0.22); g.add(pw);
  const pr = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 8, 16), navy);
  pr.position.copy(pw.position); pr.rotation.y = Math.PI / 2; g.add(pr);

  // Fins (green, one per side)
  for (let side = 0; side < 2; side++) {
    const fin = b(0.38, 0.32, 0.07, green);
    fin.position.set(side === 0 ? -0.3 : 0.3, -0.34, 0);
    fin.rotation.z = side === 0 ? 0.52 : -0.52;
    fin.castShadow = true; g.add(fin);
  }

  // Flames (layered)
  const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 10), flame);
  f1.rotation.x = Math.PI; f1.position.y = -0.62; g.add(f1);
  const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 8), fcore);
  f2.rotation.x = Math.PI; f2.position.y = -0.58; g.add(f2);
  const f3 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 6), mat(0xfef9c3, 0.05, 0, 0xffffff, 1));
  f3.rotation.x = Math.PI; f3.position.y = -0.54; g.add(f3);

  g.rotation.z = -0.22;
  g.rotation.x = 0.08;
  return g;
}

// ─── Icon: dashboard monitor ──────────────────────────────────────────────────
function makeDashboardIcon(): THREE.Group {
  const g = new THREE.Group();
  const frame  = mat(0x172b4d, 0.4, 0.5);
  const screen = mat(0x0f1a2e, 0.18, 0, 0x1e40af, 0.45);
  const G      = mat(0x22c55e, 0.25, 0, 0x22c55e, 0.45);
  const Y      = mat(0xfbbf24, 0.18, 0.2, 0xfbbf24, 0.45);
  const C      = mat(0x06b6d4, 0.18, 0, 0x06b6d4, 0.45);

  // Monitor body
  const body = b(1.12, 0.88, 0.14, frame);
  body.castShadow = true; g.add(body);
  // Screen
  const sc = b(0.94, 0.70, 0.09, screen);
  sc.position.z = 0.08; g.add(sc);

  // Chart bars on screen
  const bd = [
    { x: -0.3,  h: 0.20, m: G },
    { x: -0.12, h: 0.30, m: C },
    { x:  0.06, h: 0.14, m: Y },
    { x:  0.24, h: 0.36, m: G },
  ];
  for (const d of bd) {
    const bar = b(0.11, d.h, 0.1, d.m);
    bar.position.set(d.x, -0.13 + d.h/2, 0.12); g.add(bar);
  }

  // Dot line on screen
  const dotPts = [[-0.3, 0.17], [-0.12, 0.24], [0.06, 0.20], [0.24, 0.30]];
  for (const [x, y] of dotPts) {
    const dot = s(0.038, 6, 5, Y);
    dot.position.set(x, y, 0.12); g.add(dot);
  }

  // Title bar
  const title = b(0.6, 0.06, 0.08, mat(0x60a5fa, 0.3, 0, 0x93c5fd, 0.4));
  title.position.set(-0.15, 0.28, 0.12); g.add(title);

  // Traffic lights
  for (const [i, col] of [[0, 0xef4444], [1, 0xfbbf24], [2, 0x22c55e]] as [number, number][]) {
    const dot = s(0.038, 6, 5, mat(col, 0.3, 0, col, 0.5));
    dot.position.set(0.32 - i * 0.07, 0.29, 0.12); g.add(dot);
  }

  // Stand + base
  const stand = b(0.1, 0.32, 0.1, frame);
  stand.position.set(0, -0.6, 0); g.add(stand);
  const base = b(0.48, 0.07, 0.16, frame);
  base.position.set(0, -0.77, 0); g.add(base);

  return g;
}

// ─── Icon: cute bull mascot ───────────────────────────────────────────────────
function makeBullIcon(): THREE.Group {
  const g = new THREE.Group();
  const G   = mat(0x22c55e, 0.5);
  const LG  = mat(0x4ade80, 0.4);
  const NK  = mat(0x172b4d, 0.5, 0.2);
  const EW  = mat(0xffffff, 0.4);
  const EB  = mat(0x1d4ed8, 0.1, 0, 0x3b82f6, 0.55);
  const PUP = mat(0x172b4d, 0.8);
  const CHK = mat(0xfca5a5, 0.6, 0, 0xf87171, 0.15);
  const ARR = mat(0x22c55e, 0.2, 0, 0x22c55e, 0.55);
  const GLD = mat(0xfbbf24, 0.15, 0.5, 0xfbbf24, 0.25);
  const NOS = mat(0xfda4af, 0.6);

  // Body — plump sphere
  const bodyGeo = new THREE.SphereGeometry(0.42, 18, 14);
  bodyGeo.scale(1, 0.92, 0.88);
  const body = new THREE.Mesh(bodyGeo, G);
  body.castShadow = true; g.add(body);

  // Belly (lighter green)
  const belGeo = new THREE.SphereGeometry(0.28, 14, 12);
  belGeo.scale(1, 0.85, 0.62);
  const bel = new THREE.Mesh(belGeo, LG);
  bel.position.set(0.06, -0.04, 0.25); g.add(bel);

  // Head — big and round (cute ratio)
  const hdGeo = new THREE.SphereGeometry(0.32, 18, 14);
  hdGeo.scale(1, 1.06, 0.94);
  const head = new THREE.Mesh(hdGeo, G);
  head.position.set(0.36, 0.22, 0); g.add(head);

  // Ears
  for (const zS of [1, -1]) {
    const earGeo = new THREE.SphereGeometry(0.12, 10, 8);
    earGeo.scale(0.65, 1, 0.5);
    const ear = new THREE.Mesh(earGeo, G);
    ear.position.set(0.3, 0.48, zS * 0.28); g.add(ear);
    const innerEar = new THREE.Mesh(earGeo, LG);
    innerEar.scale.set(0.55, 0.7, 0.4);
    innerEar.position.copy(ear.position);
    g.add(innerEar);
  }

  // Snout — green
  const snGeo = new THREE.SphereGeometry(0.19, 14, 12);
  snGeo.scale(1, 0.72, 0.9);
  const sn = new THREE.Mesh(snGeo, LG);
  sn.position.set(0.62, 0.2, 0); g.add(sn);

  // Nostrils
  for (const zS of [1, -1]) {
    const nos = s(0.042, 6, 5, NOS);
    nos.position.set(0.78, 0.18, zS * 0.08); g.add(nos);
  }

  // Cheek blush
  for (const zS of [1, -1]) {
    const chkGeo = new THREE.SphereGeometry(0.09, 8, 7);
    chkGeo.scale(1, 0.55, 0.4);
    const chk = new THREE.Mesh(chkGeo, CHK);
    chk.position.set(0.59, 0.2, zS * 0.23); g.add(chk);
  }

  // Eyes — big cartoon eyes
  for (const zS of [1, -1]) {
    const eyeG = new THREE.Group();
    eyeG.position.set(0.52, 0.34, zS * 0.22);
    const ew = s(0.115, 12, 10, EW); eyeG.add(ew);
    const iris = s(0.086, 10, 8, EB);
    iris.position.z = zS * 0.03; eyeG.add(iris);
    const pup = s(0.054, 8, 7, PUP);
    pup.position.z = zS * 0.07; eyeG.add(pup);
    const shine = s(0.026, 6, 5, EW);
    shine.position.set(0.04, 0.04, zS * 0.1); eyeG.add(shine);
    g.add(eyeG);
  }

  // Horns (dark blue)
  for (const zS of [1, -1]) {
    const hornGeo = new THREE.CylinderGeometry(0.028, 0.075, 0.34, 8);
    const horn = new THREE.Mesh(hornGeo, NK);
    horn.position.set(0.32, 0.56, zS * 0.18);
    horn.rotation.z = 0.52;
    horn.rotation.x = zS * -0.38;
    g.add(horn);
  }

  // Legs — short, dark hooves
  for (const [lx, lz] of [[0.16, 0.2], [0.16, -0.2], [-0.18, 0.2], [-0.18, -0.2]]) {
    const leg = c(0.08, 0.07, 0.32, 8, G);
    leg.position.set(lx, -0.54, lz); g.add(leg);
    const hoof = s(0.09, 8, 7, NK);
    hoof.scale.set(1, 0.65, 1);
    hoof.position.set(lx, -0.73, lz); g.add(hoof);
  }

  // Tail (torus arc)
  const tailG = new THREE.TorusGeometry(0.2, 0.045, 7, 12, Math.PI * 0.85);
  const tail = new THREE.Mesh(tailG, G);
  tail.position.set(-0.38, 0.06, 0);
  tail.rotation.y = Math.PI / 2; g.add(tail);

  // Up-arrow badge
  const arrG = new THREE.Group();
  arrG.position.set(0.08, 0.68, 0.3);
  arrG.add(b(0.08, 0.3, 0.08, ARR));
  const aHead = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 5), ARR);
  aHead.position.y = 0.24; arrG.add(aHead);
  g.add(arrG);

  // Gold coins at feet
  for (let ci = 0; ci < 3; ci++) {
    const coin = c(0.11, 0.11, 0.045, 14, GLD);
    coin.position.set(-0.1 + ci * 0.15, -0.8, 0.08 + ci * 0.04);
    coin.rotation.z = 0.3 + ci * 0.35;
    g.add(coin);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 6, 14),
      mat(0xd97706, 0.2, 0.45));
    rim.position.copy(coin.position);
    rim.rotation.x = Math.PI / 2; rim.rotation.z = coin.rotation.z; g.add(rim);
  }

  return g;
}

// ─── Icon: money bag ──────────────────────────────────────────────────────────
function makeMoneyBagIcon(): THREE.Group {
  const g = new THREE.Group();
  const bag  = mat(0x1e3a8a, 0.5, 0.25);
  const dark = mat(0x0f172a, 0.6, 0.3);
  const gold = mat(0xfbbf24, 0.12, 0.55, 0xfbbf24, 0.28);
  const dg   = mat(0xd97706, 0.2, 0.45);
  const gs   = mat(0x4ade80, 0.18, 0, 0x22c55e, 0.65);
  const star = mat(0xfbbf24, 0.05, 0.3, 0xfbbf24, 1.0);

  // Main bag body
  const bgGeo = new THREE.SphereGeometry(0.42, 18, 16);
  bgGeo.scale(1.0, 1.22, 0.92);
  const bagMesh = new THREE.Mesh(bgGeo, bag);
  bagMesh.castShadow = true; g.add(bagMesh);

  // Neck
  const neck = c(0.14, 0.20, 0.26, 12, dark);
  neck.position.y = 0.56; g.add(neck);

  // Gold knot ring
  const knot = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.06, 10, 20), gold);
  knot.position.y = 0.63; knot.rotation.x = Math.PI / 2; g.add(knot);

  // $ sign (green, large)
  g.add(b(0.06, 0.48, 0.1, gs)).position.set(0, 0, 0.38);
  for (const [yO, xO] of [[0.12, 0.01], [0.0, 0], [-0.12, -0.01]] as [number, number][]) {
    const hbar = b(0.3, 0.065, 0.1, gs);
    hbar.position.set(xO, yO, 0.38); g.add(hbar);
  }
  // S-curve wings
  for (const [xO, yO] of [[0.12, 0.13], [-0.12, -0.13]] as [number, number][]) {
    const wing = b(0.16, 0.055, 0.09, gs);
    wing.position.set(xO, yO, 0.38); g.add(wing);
  }

  // Spilling coins (5 around base)
  const cPositions = [
    [-0.35, -0.6, 0.25], [0, -0.68, 0.22], [0.35, -0.6, 0.20],
    [-0.5, -0.6, -0.06], [0.5, -0.58, 0.08],
  ];
  for (const [cx, cy, cz] of cPositions) {
    const coin = c(0.15, 0.15, 0.05, 18, gold);
    coin.position.set(cx, cy, cz);
    coin.rotation.z = Math.random() * 0.7 - 0.35;
    g.add(coin);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 7, 18), dg);
    rim.position.copy(coin.position);
    rim.rotation.x = Math.PI / 2; rim.rotation.z = coin.rotation.z; g.add(rim);
  }

  // Sparkle stars (4-pointed)
  const starPositions = [[-0.6, 0.35], [0.6, 0.5], [-0.45, -0.1], [0.7, 0.0]];
  for (const [sx, sy] of starPositions) {
    const starMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), star);
    starMesh.position.set(sx, sy, 0.15);
    starMesh.userData.sparkle = true;
    g.add(starMesh);
  }

  return g;
}

// ─── Icon: gold coin stack ────────────────────────────────────────────────────
function makeCoinStackIcon(): THREE.Group {
  const g = new THREE.Group();
  const gold = mat(0xfbbf24, 0.12, 0.58, 0xfbbf24, 0.22);
  const dg   = mat(0xd97706, 0.2, 0.48);
  const sh   = mat(0xfef08a, 0.04, 0.72, 0xfef9c3, 0.55);
  const star = mat(0xfbbf24, 0.05, 0.3, 0xfbbf24, 1.0);

  for (let i = 0; i < 7; i++) {
    const coin = c(0.30, 0.30, 0.08, 22, gold);
    coin.position.y = i * 0.11;
    coin.castShadow = true; g.add(coin);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.025, 8, 22), dg);
    rim.position.y = i * 0.11; rim.rotation.x = Math.PI / 2; g.add(rim);
    // $ on top coin
    if (i === 6) {
      const dv = b(0.038, 0.26, 0.055, sh);
      dv.position.set(0, i * 0.11 + 0.055, 0); g.add(dv);
      for (const yO of [0.085, -0.005]) {
        const dh = b(0.16, 0.038, 0.055, sh);
        dh.position.set(0, i * 0.11 + 0.055 + yO, 0); g.add(dh);
      }
    }
  }

  // Sparkles above stack
  for (const [sx, sy] of [[-0.55, 0.85], [0, 1.05], [0.6, 0.8]]) {
    const starMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), star);
    starMesh.position.set(sx, sy, 0.05);
    starMesh.userData.sparkle = true; g.add(starMesh);
  }

  return g;
}

// ─── Laptop with screen texture ────────────────────────────────────────────────
function makeLaptop(screenTex: THREE.Texture): THREE.Group {
  const laptop = new THREE.Group();
  const chassis = mat(0x1e293b, 0.32, 0.72);
  const inner   = mat(0x0f172a, 0.5, 0.5);
  const key     = mat(0x1a3050, 0.62, 0.28);
  const track   = mat(0x1e3a5f, 0.24, 0.52);

  // ── Base ──────────────────────────────────────────────────────────────────
  const base = b(4.2, 0.18, 3.0, chassis);
  base.castShadow = true; laptop.add(base);

  const kbSurf = b(3.7, 0.025, 2.2, inner);
  kbSurf.position.set(0, 0.1, 0.1); laptop.add(kbSurf);

  // Key rows
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 14; col++) {
      const k = b(0.21, 0.048, 0.2, key);
      k.position.set(-1.43 + col * 0.22, 0.12, -0.6 + row * 0.25);
      laptop.add(k);
    }
  }
  const sp = b(1.1, 0.048, 0.2, key);
  sp.position.set(0, 0.12, 0.6); laptop.add(sp);
  const tp = b(1.3, 0.025, 0.88, track);
  tp.position.set(0, 0.1, 1.0); laptop.add(tp);

  // ── Lid ───────────────────────────────────────────────────────────────────
  const lidG = new THREE.Group();
  lidG.position.set(0, 0.09, -1.5);
  laptop.add(lidG);

  const lid = b(4.2, 0.16, 2.95, chassis);
  lid.position.set(0, 0, 1.475); lid.castShadow = true; lidG.add(lid);

  const bezel = b(3.9, 0.09, 2.65, inner);
  bezel.position.set(0, 0.13, 1.475); lidG.add(bezel);

  // ── Screen — self-luminous PlaneGeometry with canvas texture ────────────────
  // MeshBasicMaterial = unaffected by scene lighting → always full brightness
  // PlaneGeometry explicitly faces the viewer; BoxGeometry faces were unreliable
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, side: THREE.DoubleSide });

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.56, 2.28), screenMat);
  // PlaneGeometry default normal = +Z. Rotating +90° around X maps it to -Y in lidG space.
  // After lidG.rotation.x = -PI*0.585 (~105° open), that -Y local normal becomes
  // (0, +0.26, +0.97) in world space — pointing toward the camera. ✓
  screen.rotation.x = Math.PI / 2;
  // Sit the screen on the inner surface of the lid
  screen.position.set(0, 0.15, 1.46);
  lidG.add(screen);

  // Thin glare plane — very subtle, no tinting
  const glowGeo = new THREE.PlaneGeometry(3.3, 2.1);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.03,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.set(0, 0.15, 1.48); lidG.add(glow);

  // Screen backlight — warm white, like an LCD panel
  const screenLight = new THREE.PointLight(0xfef9f0, 3.5, 7);
  screenLight.position.set(0, 0.2, 1.5); lidG.add(screenLight);

  // Green dot accent light (subtle)
  const dotLight = new THREE.PointLight(0x22c55e, 1.8, 4);
  dotLight.position.set(0.6, 0.18, 1.52); lidG.add(dotLight);

  // Back logo
  const logoMat = mat(0x22c55e, 0.22, 0.12, 0x22c55e, 0.38);
  const logoDot = s(0.26, 14, 12, logoMat);
  logoDot.scale.set(1, 1, 0.18);
  logoDot.position.set(0, 0.04, -0.04); lidG.add(logoDot);

  lidG.rotation.x = -Math.PI * 0.585;
  return laptop;
}

// ─── Icon entry ────────────────────────────────────────────────────────────────
type IconEntry = {
  group: THREE.Group;
  orbitR: number;       // orbit radius
  orbitY: number;       // vertical center of orbit
  orbitTilt: number;    // orbit plane tilt (radians)
  orbitAngle: number;   // current angle
  orbitSpeed: number;   // radians per second
  bobAmp: number;
  bobSpeed: number;
  bobPhase: number;
  baseScale: number;
  currentScale: number;
  idleRotSpeed: THREE.Vector3;
  pointLight: THREE.PointLight;
};

// ─── Main component ────────────────────────────────────────────────────────────
export default function HeroScene({ width = "100%", height = "100%" }: { width?: string; height?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    const W = container.clientWidth  || 520;
    const H = container.clientHeight || 580;
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ── Scene / Camera ───────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, W / H, 0.1, 200);
    camera.position.set(0, 2.8, 12.5);
    camera.lookAt(0, 0.6, 0);

    // ── Lights ───────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.48));

    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(8, 14, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    const fillL = new THREE.DirectionalLight(0xbfdbfe, 0.6);
    fillL.position.set(-7, 5, 6);
    scene.add(fillL);

    const rimL = new THREE.DirectionalLight(0xfbbf24, 0.28);
    rimL.position.set(5, -3, -5);
    scene.add(rimL);

    const greenKey = new THREE.PointLight(0x22c55e, 4.5, 16);
    greenKey.position.set(-3, 4, 5);
    scene.add(greenKey);

    const goldKey = new THREE.PointLight(0xfbbf24, 3.2, 14);
    goldKey.position.set(4, 1, 4);
    scene.add(goldKey);

    // ── Root group ───────────────────────────────────────────────────────────
    const root = new THREE.Group();
    scene.add(root);

    // ── Screen texture & laptop ──────────────────────────────────────────────
    const screenTex = new THREE.TextureLoader().load("/stoked-logo.png");
    screenTex.colorSpace = THREE.SRGBColorSpace;
    const laptopGroup = makeLaptop(screenTex);
    laptopGroup.position.set(0, -1.8, 0);
    laptopGroup.rotation.x = -0.05;
    root.add(laptopGroup);

    // ── Icon orbit configurations ────────────────────────────────────────────
    // Two orbit rings: upper (r=5, y≈1.5-3.5) and lower (r=4, y≈-0.5 to 1)
    // Each icon orbits in a tilted elliptical plane
    const orbitConfigs: Omit<IconEntry, "group" | "currentScale" | "pointLight">[] = [
      // Chart — upper ring, starts top-left
      {
        orbitR: 4.8, orbitY: 2.2, orbitTilt: 0.3, orbitAngle: 2.4,
        orbitSpeed: 0.28, bobAmp: 0.24, bobSpeed: 1.1, bobPhase: 0.0,
        baseScale: 0.98, idleRotSpeed: new THREE.Vector3(0, 0.2, 0.04),
      },
      // Rocket — upper ring, top-center
      {
        orbitR: 4.0, orbitY: 3.0, orbitTilt: 0.18, orbitAngle: 1.1,
        orbitSpeed: 0.22, bobAmp: 0.32, bobSpeed: 0.85, bobPhase: 1.1,
        baseScale: 1.12, idleRotSpeed: new THREE.Vector3(0.04, 0.16, 0.02),
      },
      // Dashboard — upper ring, right
      {
        orbitR: 4.6, orbitY: 1.8, orbitTilt: 0.24, orbitAngle: 0.1,
        orbitSpeed: 0.24, bobAmp: 0.20, bobSpeed: 1.2, bobPhase: 2.4,
        baseScale: 0.92, idleRotSpeed: new THREE.Vector3(0, 0.22, 0),
      },
      // Bull — lower ring, left
      {
        orbitR: 4.2, orbitY: 0.4, orbitTilt: 0.4, orbitAngle: 3.6,
        orbitSpeed: 0.32, bobAmp: 0.28, bobSpeed: 0.95, bobPhase: 0.7,
        baseScale: 0.84, idleRotSpeed: new THREE.Vector3(0, 0.28, 0),
      },
      // Money bag — lower ring, right
      {
        orbitR: 4.0, orbitY: 0.8, orbitTilt: 0.35, orbitAngle: 5.8,
        orbitSpeed: 0.26, bobAmp: 0.26, bobSpeed: 1.05, bobPhase: 2.0,
        baseScale: 0.88, idleRotSpeed: new THREE.Vector3(0, 0.24, 0.03),
      },
      // Coins — lower ring, lower-right
      {
        orbitR: 4.5, orbitY: -0.4, orbitTilt: 0.28, orbitAngle: 5.1,
        orbitSpeed: 0.30, bobAmp: 0.18, bobSpeed: 1.35, bobPhase: 3.1,
        baseScale: 0.76, idleRotSpeed: new THREE.Vector3(0, 0.36, 0),
      },
    ];

    const builders = [
      makeChartIcon, makeRocketIcon, makeDashboardIcon,
      makeBullIcon, makeMoneyBagIcon, makeCoinStackIcon,
    ];
    const glowColors  = [0x22c55e, 0xfbbf24, 0x3b82f6, 0x22c55e, 0xfbbf24, 0xfbbf24];
    const glowIntens  = [2.8, 3.2, 2.5, 2.6, 3.0, 2.8];

    const icons: IconEntry[] = orbitConfigs.map((cfg, i) => {
      const group = builders[i]();
      group.scale.setScalar(cfg.baseScale);
      root.add(group);

      const pl = new THREE.PointLight(glowColors[i], glowIntens[i], 4.5);
      pl.position.set(0, 0, 0.5);
      group.add(pl);

      return { ...cfg, group, currentScale: cfg.baseScale, pointLight: pl };
    });

    // ── Mouse state ──────────────────────────────────────────────────────────
    let rawX = 0, rawY = 0, smoothX = 0, smoothY = 0;
    const mouseNDC = new THREE.Vector2(0, 0);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      rawX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      rawY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
      mouseNDC.set(rawX, -rawY);
    };
    window.addEventListener("mousemove", onMouseMove);

    // Mobile touch
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const rect = container.getBoundingClientRect();
      rawX = ((t.clientX - rect.left) / rect.width  - 0.5) * 2;
      rawY = ((t.clientY - rect.top)  / rect.height - 0.5) * 2;
    };
    container.addEventListener("touchmove", onTouchMove, { passive: true });

    // ── Resize ───────────────────────────────────────────────────────────────
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

    // ── Animation loop ────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      clock.getDelta();

      // Mouse smooth (fast lerp for responsiveness)
      smoothX += (rawX - smoothX) * 0.075;
      smoothY += (rawY - smoothY) * 0.075;

      // Scene tilt — large, obvious effect
      root.rotation.y  =  smoothX * 0.55;
      root.rotation.x  = -smoothY * 0.32;

      // Update icons
      for (let i = 0; i < icons.length; i++) {
        const ic = icons[i];
        ic.orbitAngle += ic.orbitSpeed * 0.016;

        // Elliptical orbit in tilted plane
        const ca = ic.orbitAngle;
        const bob = Math.sin(t * ic.bobSpeed + ic.bobPhase) * ic.bobAmp;
        const rx = Math.cos(ca) * ic.orbitR;
        const rz = Math.sin(ca) * ic.orbitR * 0.55; // flatten Z → looks more like a circle from camera
        // Apply orbit tilt around X axis
        const ry = ic.orbitY + Math.sin(ca) * ic.orbitR * ic.orbitTilt + bob;
        ic.group.position.set(rx, ry, rz);

        // Idle rotation
        ic.group.rotation.y += ic.idleRotSpeed.y * 0.016;
        ic.group.rotation.x += ic.idleRotSpeed.x * 0.016;
        ic.group.rotation.z += ic.idleRotSpeed.z * 0.016;

        // Follow cursor: lean icon toward cursor position
        ic.group.rotation.x += (smoothY * 0.18 - ic.group.rotation.x) * 0.03;

        // Sparkle pulse (money bag and coins)
        ic.group.children.forEach(child => {
          if ((child as THREE.Mesh).userData?.sparkle) {
            const pulse = 0.55 + 0.55 * Math.abs(Math.sin(t * 3.2 + i * 0.8));
            child.scale.setScalar(pulse);
            (child as THREE.Mesh).rotation.y = t * 2.5;
            (child as THREE.Mesh).rotation.x = t * 1.8;
          }
        });

        // Hover detection via screen-space proximity
        const proj = ic.group.position.clone();
        proj.project(camera);
        const dx = proj.x - mouseNDC.x;
        const dy = proj.y - mouseNDC.y;
        const hovDist = Math.sqrt(dx * dx + dy * dy);
        const targetScale = hovDist < 0.26 ? ic.baseScale * 1.44 : ic.baseScale;
        ic.currentScale += (targetScale - ic.currentScale) * 0.12;
        ic.group.scale.setScalar(ic.currentScale);

        // Per-icon light pulse
        ic.pointLight.intensity = glowIntens[i] + Math.sin(t * 2.2 + i * 0.9) * 1.2;
      }

      // Laptop slow bob
      laptopGroup.position.y = -1.8 + Math.sin(t * 0.48) * 0.06;

      // Global light pulses
      greenKey.intensity = 4.2 + Math.sin(t * 1.2) * 1.4;
      goldKey.intensity  = 3.0 + Math.sin(t * 0.95 + 1.8) * 1.0;

      renderer.render(scene, camera);
    };

    // Wait a frame so container has real dimensions
    requestAnimationFrame(() => { onResize(); animate(); });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("touchmove", onTouchMove);
      ro.disconnect();
      screenTex.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width, height, minHeight: 540, position: "relative", cursor: "grab" }}
    />
  );
}
