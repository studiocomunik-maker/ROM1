/* Scène filaire de la section Métiers (accueil).
   Un seul canvas WebGL derrière toute la section : une grille (mur + sol) et,
   calé sur le cadre de droite, le dessin technique du métier actif. Passer d'un
   métier à l'autre fait glisser chaque trait vers sa place dans le dessin suivant.
   Chargé à la demande (import dynamique) : three.js n'alourdit pas l'accueil. */

import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

export type SceneApi = {
  goTo(i: number): void;
  setVisible(v: boolean): void;
  destroy(): void;
};

type V3 = [number, number, number];
type Seg = { a: V3; b: V3; c: number };
type Stroke = { m: V3; h: V3; c: number; ang: number };

/* Couleurs : O = trait orange (l'objet), P = trait crème, D = cote / arête cachée, F = construction */
const O = 0, P = 1, D = 2, F = 3;
const COL = ["#ff3d1f", "#e9e7e3", "#77767a", "#3a3a3e"].map((h) => new THREE.Color(h));
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function Shape() {
  const segs: Seg[] = [];
  const s = {
    segs,
    seg(a: V3, b: V3, c: number) { segs.push({ a: [...a], b: [...b], c }); },
    poly(pts: V3[], c: number, closed = true) {
      const n = pts.length;
      for (let i = 0; i < (closed ? n : n - 1); i++) s.seg(pts[i], pts[(i + 1) % n], c);
    },
    dash(a: V3, b: V3, c: number, on = 0.8, off = 0.55) {
      const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      for (let x = 0; x < d; x += on + off) s.seg(lerp3(a, b, x / d), lerp3(a, b, Math.min(1, (x + on) / d)), c);
    },
    ring(cx: number, cy: number, cz: number, r: number, c: number, n = 40, plane: "xy" | "xz" = "xy", dashed = false) {
      const pts: V3[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2, u = Math.cos(t) * r, v = Math.sin(t) * r;
        pts.push(plane === "xy" ? [cx + u, cy + v, cz] : [cx + u, cy, cz + v]);
      }
      if (dashed) for (let i = 0; i < n; i += 2) s.seg(pts[i], pts[(i + 1) % n], c);
      else s.poly(pts, c);
    },
    rect(x0: number, y0: number, x1: number, y1: number, z: number, c: number) {
      s.poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], c);
    },
    box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: number) {
      const v = (a: number, b: number, d: number): V3 => [a ? x1 : x0, b ? y1 : y0, d ? z1 : z0];
      [[0,0,0,1,0,0],[0,1,0,1,1,0],[0,0,1,1,0,1],[0,1,1,1,1,1],[0,0,0,0,1,0],[1,0,0,1,1,0],
       [0,0,1,0,1,1],[1,0,1,1,1,1],[0,0,0,0,0,1],[1,0,0,1,0,1],[0,1,0,0,1,1],[1,1,0,1,1,1]]
        .forEach((e) => s.seg(v(e[0], e[1], e[2]), v(e[3], e[4], e[5]), c));
    },
    extrude(pts2: [number, number][], z0: number, z1: number, cf: number, cb: number, cs: number) {
      s.poly(pts2.map(([x, y]): V3 => [x, y, z1]), cf);
      s.poly(pts2.map(([x, y]): V3 => [x, y, z0]), cb);
      pts2.forEach(([x, y]) => s.seg([x, y, z0], [x, y, z1], cs));
    },
  };
  return s;
}
type ShapeApi = ReturnType<typeof Shape>;

// Étoile-éclat et éclair : les glyphes du site (Glyphs.tsx)
const STAR: [number, number][] = Array.from({ length: 16 }, (_, i) => {
  const a = -Math.PI / 2 + (Math.PI * i) / 8, r = i % 2 ? 5.2 : 12.5;
  return [r * Math.cos(a), r * Math.sin(a)];
});
const BOLT: [number, number][] = [[40, 2], [8, 60], [32, 60], [24, 108], [64, 44], [38, 44]].map(([x, y]) => [(x - 36) * 0.24, -(y - 55) * 0.24]);

const DRAW: Record<string, (s: ShapeApi) => void> = {
  // Identité : l'étoile et sa grille de construction de logo
  identite(s) {
    s.extrude(STAR, -1.5, 1.5, O, D, D);
    s.ring(0, 0, 1.5, 3.65, P, 28);
    s.ring(0, 0, 2.7, 3.65, P, 28);
    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * Math.PI * 2;
      s.seg([3.65 * Math.cos(t), 3.65 * Math.sin(t), 1.5], [3.65 * Math.cos(t), 3.65 * Math.sin(t), 2.7], P);
    }
    s.ring(0, 0, 0, 12.5, F, 72, "xy", true);
    s.ring(0, 0, 0, 5.2, F, 40);
    STAR.filter((_, i) => i % 2 === 0).forEach(([x, y]) => s.seg([0, 0, 0], [x, y, 0], F));
    s.dash([-15, 0, 0], [15, 0, 0], F);
    s.dash([0, -15, 0], [0, 15, 0], F);
    s.rect(-12.5, -12.5, 12.5, 12.5, 0, F);
  },
  // Print : livre ouvert en éventail, traits de coupe, mires de repérage
  print(s) {
    const W = 11, H = 9, zs = -3;
    const pt = (side: number, phi: number, w: number, bulge: number, u: number, y: number): V3 =>
      [side * w * Math.cos(phi) * u, y, zs + w * Math.sin(phi) * u + bulge * Math.sin(Math.PI * u)];
    const page = (side: number, deg: number, c: number, w = W, h = H, bulge = 1.1) => {
      const phi = (deg * Math.PI) / 180;
      for (let j = 0; j < 8; j++) {
        s.seg(pt(side, phi, w, bulge, j / 8, h), pt(side, phi, w, bulge, (j + 1) / 8, h), c);
        s.seg(pt(side, phi, w, bulge, j / 8, -h), pt(side, phi, w, bulge, (j + 1) / 8, -h), c);
      }
      s.seg(pt(side, phi, w, bulge, 1, h), pt(side, phi, w, bulge, 1, -h), c);
    };
    for (const side of [-1, 1]) {
      for (let k = 0; k < 7; k++) page(side, 10 + (k * 22) / 6, k === 0 ? P : D);
      page(side, 36, O, W + 0.6, H + 0.6, 0.6); // couverture
      // lignes de texte sur la page de dessus
      const phi = (10 * Math.PI) / 180;
      const ends = side < 0 ? [0.8, 0.86, 0.7, 0.86, 0.6, 0.86, 0.78, 0.5] : [0.7, 0.86, 0.86, 0.66, 0.86, 0.8, 0.86, 0.44];
      ends.forEach((e, r) => {
        const y = 6.5 - r * 1.6;
        for (let j = 0; j < 3; j++)
          s.seg(pt(side, phi, W, 1.1, 0.14 + ((e - 0.14) * j) / 3, y), pt(side, phi, W, 1.1, 0.14 + ((e - 0.14) * (j + 1)) / 3, y), r === 0 ? O : D);
      });
    }
    s.seg([0, H, zs], [0, -H, zs], P); // dos
    const X = 12.6, Y = 10.4;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      s.seg([sx * (X + 0.7), sy * Y, zs], [sx * (X + 3.2), sy * Y, zs], P);
      s.seg([sx * X, sy * (Y + 0.7), zs], [sx * X, sy * (Y + 3.2), zs], P);
    }
    for (const sy of [-1, 1]) {
      const y = sy * (Y + 2.2);
      s.ring(0, y, zs, 1, P, 24);
      s.seg([-1.8, y, zs], [1.8, y, zs], P);
      s.seg([0, y - 1.8, zs], [0, y + 1.8, zs], P);
    }
  },
  // Photo : boîtier, viseur, bagues de l'objectif, diaphragme
  photo(s) {
    s.box(-11, -7, -4, 11, 6, 3, P);
    s.seg([7, -7, 3], [7, 6, 3], D); // poignée
    s.extrude([[-5, 6], [4, 6], [2.5, 9], [-3.5, 9]], -2.5, 1.5, P, D, D); // viseur
    s.ring(7.5, 6, -0.5, 1.3, P, 16, "xz");
    s.ring(7.5, 6.9, -0.5, 1.3, P, 16, "xz");
    s.rect(-9.5, 3, -6, 4.6, 3, P); // flash
    const cy = -0.5;
    const rings: [number, number, number][] = [[3, 6.2, P], [4.2, 6.2, P], [4.2, 5.6, D], [6.5, 5.6, P], [6.5, 4.9, D], [7.6, 4.9, O]];
    rings.forEach(([z, r, c]) => s.ring(0, cy, z, r, c, 48));
    for (let i = 0; i < 8; i++) {
      const t = (i / 8) * Math.PI * 2, c = Math.cos(t), n = Math.sin(t);
      s.seg([6.2 * c, cy + 6.2 * n, 3], [6.2 * c, cy + 6.2 * n, 4.2], D);
      s.seg([5.6 * c, cy + 5.6 * n, 4.2], [5.6 * c, cy + 5.6 * n, 6.5], D);
      s.seg([4.9 * c, cy + 4.9 * n, 6.5], [4.9 * c, cy + 4.9 * n, 7.6], D);
    }
    for (let i = 0; i < 24; i++) {
      const t = (i / 24) * Math.PI * 2;
      s.seg([5.6 * Math.cos(t), cy + 5.6 * Math.sin(t), 4.7], [5.6 * Math.cos(t), cy + 5.6 * Math.sin(t), 6], F);
    }
    s.ring(0, cy, 7.2, 3.6, O, 36);
    const hex = Array.from({ length: 6 }, (_, i): V3 => {
      const t = (i / 6) * Math.PI * 2;
      return [1.8 * Math.cos(t), cy + 1.8 * Math.sin(t), 7];
    });
    s.poly(hex, O);
    hex.forEach((h, i) => {
      const t = (i / 6) * Math.PI * 2 + 1.05;
      s.seg(h, [3.6 * Math.cos(t), cy + 3.6 * Math.sin(t), 7.2], O);
    });
  },
  // Web : fenêtre en wireframe, grille 12 colonnes, blocs barrés, </> en relief, curseur
  web(s) {
    s.box(-13, -9, -0.75, 13, 9, 0.75, P);
    s.seg([-13, 6.4, 0.75], [13, 6.4, 0.75], P);
    [-11.6, -9.9, -8.2].forEach((x) => s.ring(x, 7.7, 0.75, 0.55, O, 14));
    s.rect(-5, 7.1, 11, 8.3, 0.75, D);
    const z = 0.8;
    for (let i = 0; i <= 12; i++) {
      const x = -11.5 + (i * 23) / 12;
      s.dash([x, -8, z], [x, 5.4, z], F, 0.6, 0.6);
    }
    const blk = (x0: number, y0: number, x1: number, y1: number) => {
      s.rect(x0, y0, x1, y1, z, D);
      s.seg([x0, y0, z], [x1, y1, z], F);
      s.seg([x0, y1, z], [x1, y0, z], F);
    };
    blk(-11.5, 0.8, 11.5, 5.2);
    blk(-11.5, -7.8, -4.3, -1.2);
    blk(-3.6, -7.8, 3.6, -1.2);
    blk(4.3, -7.8, 11.5, -1.2);
    const L: [number, number][] = [[-4.4, 3.2], [-8, 0], [-4.4, -3.2], [-3, -3.2], [-6.6, 0], [-3, 3.2]];
    const R = L.map(([x, y]): [number, number] => [-x, y]);
    const SL: [number, number][] = [[0.7, 3.2], [2, 3.2], [-0.7, -3.2], [-2, -3.2]];
    for (const p of [L, R, SL]) s.extrude(p.map(([x, y]): [number, number] => [x, y - 0.5]), 3.2, 4.6, O, D, D);
    const cur: [number, number][] = [[0, 0], [0, -4.2], [1.1, -3.2], [1.9, -5], [2.6, -4.7], [1.8, -2.9], [3.2, -2.9]];
    s.poly(cur.map(([x, y]): V3 => [x + 7.5, y - 3.4, 5.4]), P);
  },
  // Motion : éclair, pelures d'oignon, trajectoire à clés, timeline
  motion(s) {
    s.extrude(BOLT, -1.5, 1.5, O, D, D);
    ([[1, D], [2, F], [3, F]] as const).forEach(([k, c]) => s.poly(BOLT.map(([x, y]): V3 => [x - 3.4 * k, y + 1.1 * k, -2.6 * k]), c));
    const P0: V3 = [-16, 10, -9], P1: V3 = [-11, 13, -6], P2: V3 = [-5, 4, -2], P3: V3 = [0, 0, 0];
    const bez = (t: number): V3 => [0, 1, 2].map((k) =>
      (1 - t) ** 3 * P0[k] + 3 * (1 - t) ** 2 * t * P1[k] + 3 * (1 - t) * t * t * P2[k] + t ** 3 * P3[k]) as V3;
    for (let i = 0; i < 24; i += 2) s.seg(bez(i / 24), bez((i + 1) / 24), D);
    [0, 1 / 3, 2 / 3, 1].forEach((t) => {
      const [x, y, z] = bez(t);
      s.poly([[x, y + 0.7, z], [x + 0.7, y, z], [x, y - 0.7, z], [x - 0.7, y, z]], O);
    });
    const ty = -15;
    s.seg([-14, ty, 0], [14, ty, 0], P);
    for (let i = -14; i <= 14; i++) s.seg([i, ty, 0], [i, ty + (i % 5 === 0 ? 1 : 0.45), 0], i % 5 === 0 ? D : F);
    s.seg([4, ty - 1, 0], [4, ty + 2.6, 0], O);
    s.poly([[3.4, ty + 2.6, 0], [4.6, ty + 2.6, 0], [4, ty + 1.9, 0]], O);
    [-10, -3, 4, 11].forEach((x) => s.poly([[x, ty - 0.9, 0], [x + 0.55, ty - 1.45, 0], [x, ty - 2, 0], [x - 0.55, ty - 1.45, 0]], O));
  },
};

// Recentre, met à l'échelle (28 unités max), ajoute les équerres, trie par angle
function build(k: string): Stroke[] {
  const s = Shape();
  DRAW[k]?.(s);
  const min: V3 = [1e9, 1e9, 1e9], max: V3 = [-1e9, -1e9, -1e9];
  for (const g of s.segs) for (const p of [g.a, g.b]) for (let j = 0; j < 3; j++) { min[j] = Math.min(min[j], p[j]); max[j] = Math.max(max[j], p[j]); }
  const c = min.map((m, j) => (m + max[j]) / 2);
  const sc = Math.min(1, 28 / Math.max(max[0] - min[0], max[1] - min[1]));
  for (const g of s.segs) for (const p of [g.a, g.b]) for (let j = 0; j < 3; j++) p[j] = (p[j] - c[j]) * sc;
  if (k !== "print") { // le print a déjà ses traits de coupe
    const X = ((max[0] - min[0]) / 2) * sc + 1.8, Y = ((max[1] - min[1]) / 2) * sc + 1.8, L = 1.8;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      s.seg([sx * X, sy * Y, 0], [sx * (X - L), sy * Y, 0], D);
      s.seg([sx * X, sy * Y, 0], [sx * X, sy * (Y - L), 0], D);
    }
  }
  return s.segs
    .map((g) => {
      const m = lerp3(g.a, g.b, 0.5);
      return { m, h: [g.b[0] - m[0], g.b[1] - m[1], g.b[2] - m[2]] as V3, c: g.c, ang: Math.atan2(m[1], m[0]) };
    })
    .sort((p, q) => p.ang - q.ang); // le trait i reste dans le même secteur d'un dessin à l'autre
}

const TILT: Record<string, number> = { print: 0.3 }; // le livre se penche pour montrer l'éventail
const FLOOR_Y = -17, WALL_Z = -70, CELL = 4;

export function createExpertisesScene(opts: {
  section: HTMLElement;
  stage: HTMLElement;
  keys: string[];
  readout: HTMLElement | null;
  reduce: boolean;
  grid?: boolean; // grille mur + sol et ses cases qui s'allument (false : l'objet seul, ex. sur une photo)
  events?: HTMLElement; // où écouter la souris (défaut : section)
  flash?: boolean; // flashs : le dessin à ~300 % par-dessus, une fraction de seconde (hero des pages métiers)
}): SceneApi {
  const { section, stage, keys, readout, reduce } = opts;
  const withGrid = opts.grid ?? true;
  const events = opts.events ?? section;
  const FORMS = keys.map(build);
  const N = Math.max(...FORMS.map((f) => f.length));
  const pick = (f: Stroke[], i: number) => f[Math.floor((i * f.length) / N)];

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const cv = renderer.domElement;
  Object.assign(cv.style, {
    position: "absolute", inset: "0", width: "100%", height: "100%", zIndex: "0", pointerEvents: "none",
    maskComposite: "intersect", webkitMaskComposite: "source-in",
  });
  cv.setAttribute("aria-hidden", "true");
  section.prepend(cv);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0c0c0e, 90, 230);
  const camera = new THREE.PerspectiveCamera(28, 1, 1, 400);
  const group = new THREE.Group();
  scene.add(group);
  const disposables: { dispose(): void }[] = [];

  // Grille de fond : un mur et un sol qui se rejoignent derrière l'objet (ne tourne pas avec lui).
  // Mur sans brouillard (lignes nettes), sol dans le brouillard (il se fond vers le fond).
  function gridLines(fill: (add: (a: V3, b: V3, major: boolean) => void) => void, minorHex: number, majorHex: number, fog: boolean) {
    const minor: number[] = [], major: number[] = [];
    fill((a, b, isMajor) => (isMajor ? major : minor).push(...a, ...b));
    for (const [arr, hex] of [[minor, minorHex], [major, majorHex]] as const) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
      const m = new THREE.LineBasicMaterial({ color: hex, fog });
      disposables.push(g, m);
      scene.add(new THREE.LineSegments(g, m));
    }
  }
  if (withGrid) {
    gridLines((add) => {
      for (let i = -65; i <= 65; i++) add([i * CELL, FLOOR_Y, WALL_Z], [i * CELL, 140, WALL_Z], i % 5 === 0);
      for (let j = 0; j <= 40; j++) add([-260, FLOOR_Y + j * CELL, WALL_Z], [260, FLOOR_Y + j * CELL, WALL_Z], j % 5 === 0);
    }, 0x1b1b1f, 0x27272c, false);
    gridLines((add) => {
      for (let i = -65; i <= 65; i++) add([i * CELL, FLOOR_Y, WALL_Z], [i * CELL, FLOOR_Y, 70], i % 5 === 0);
      for (let j = 0; j <= 35; j++) add([-260, FLOOR_Y, WALL_Z + j * CELL], [260, FLOOR_Y, WALL_Z + j * CELL], j % 5 === 0);
    }, 0x26262b, 0x34343a, true);
  }

  // Traits de l'objet
  const geo = new LineSegmentsGeometry();
  geo.setPositions(new Float32Array(N * 6));
  geo.setColors(new Float32Array(N * 6));
  const mat = new LineMaterial({ vertexColors: true, linewidth: 1.15, worldUnits: false });
  const lines = new LineSegments2(geo, mat);
  lines.frustumCulled = false;
  group.add(lines);
  // Écho orange décalé (glitch) : même géométrie, couleur unie
  const ghostMat = new LineMaterial({ color: 0xff3d1f, linewidth: 1.15, worldUnits: false, transparent: true, opacity: 0.38 });
  const ghost = new LineSegments2(geo, ghostMat);
  ghost.frustumCulled = false;
  ghost.visible = false;
  group.add(ghost);
  disposables.push(geo, mat, ghostMat);
  // Flash (option) : même géométrie et mêmes couleurs, agrandie ~3×, semi-transparente
  const flashMat = new LineMaterial({ vertexColors: true, linewidth: 1.15, worldUnits: false, transparent: true, opacity: 0.3 });
  const flash = new LineSegments2(geo, flashMat);
  flash.frustumCulled = false;
  flash.visible = false;
  group.add(flash);
  disposables.push(flashMat);
  let nextFlash = 2.5, flashUntil = 0, flash2 = 0;
  const startAttr = geo.attributes.instanceStart as THREE.InterleavedBufferAttribute;
  const colorAttr = geo.attributes.instanceColorStart as THREE.InterleavedBufferAttribute;
  const posArr = startAttr.data.array as Float32Array;
  const colArr = colorAttr.data.array as Float32Array;

  // Cases de grille qui s'allument (glitch « pixel mort »)
  const cellGeo = new THREE.PlaneGeometry(CELL, CELL), cellEdges = new THREE.EdgesGeometry(cellGeo);
  const cellMat = new THREE.MeshBasicMaterial({ color: 0xff3d1f, transparent: true, opacity: 0.08, depthWrite: false });
  const cellEdgeMat = new THREE.LineBasicMaterial({ color: 0xff3d1f, transparent: true, opacity: 0.4 });
  disposables.push(cellGeo, cellEdges, cellMat, cellEdgeMat);
  const cells = Array.from({ length: withGrid ? 3 : 0 }, () => {
    const m = new THREE.Mesh(cellGeo, cellMat);
    m.add(new THREE.LineSegments(cellEdges, cellEdgeMat));
    m.visible = false;
    scene.add(m);
    return { m, until: 0, next: 1 + Math.random() * 3 };
  });

  // État par trait : milieu, demi-vecteur, couleur
  const curM = new Float32Array(N * 3), curH = new Float32Array(N * 3), curC = new Float32Array(N * 3);
  const fromM = new Float32Array(N * 3), fromH = new Float32Array(N * 3), fromC = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) curC.set([COL[F].r, COL[F].g, COL[F].b], i * 3);
  const delay = new Float32Array(N), amp = new Float32Array(N), dir: THREE.Vector3[] = [];
  for (let i = 0; i < N; i++) { dir.push(new THREE.Vector3().randomDirection()); amp[i] = 0.4 + Math.random() * 1.4; }
  let active = -1, t0 = -1e9;
  const DUR = reduce ? 0.001 : 1, STAGGER = reduce ? 0 : 0.6;

  // Glitchs : quelques traits qui sautent, écho orange, cases qui s'allument. Jamais de tranches ni de secousse.
  let nextGlitch = 3, glitchUntil = 0, ghostUntil = 0, ghostDX = 0.5, burst2 = 0;
  const glitched = new Map<number, [number, number]>();
  function glitch(t: number) {
    glitched.clear();
    const n = 4 + Math.floor(Math.random() * 7);
    for (let k = 0; k < n; k++)
      glitched.set(Math.floor(Math.random() * N), [(Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 1.8), (Math.random() - 0.5) * 0.5]);
    glitchUntil = t + 0.08 + Math.random() * 0.08;
    if (Math.random() < 0.55) { ghostUntil = t + 0.07 + Math.random() * 0.06; ghostDX = (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.45); }
  }

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3(), tmp2 = new THREE.Vector2();
  const plane = new THREE.Plane(), local = new THREE.Vector3(), zAxis = new THREE.Vector3();
  const wallPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -WALL_Z), floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -FLOOR_Y);
  function placeCell(c: (typeof cells)[number]) {
    ray.setFromCamera(tmp2.set(Math.random() * 1.8 - 0.9, Math.random() * 1.6 - 0.8), camera);
    if (!ray.ray.intersectPlane(wallPlane, hit)) return false;
    c.m.rotation.set(0, 0, 0);
    if (hit.y < FLOOR_Y) {
      // au sol, seulement au fond (près du mur) : près de la caméra une case deviendrait énorme
      if (!ray.ray.intersectPlane(floorPlane, hit) || hit.z > WALL_Z + 28) return false;
      c.m.rotation.x = -Math.PI / 2;
      c.m.position.set((Math.floor(hit.x / CELL) + 0.5) * CELL, FLOOR_Y + 0.02, (Math.floor(hit.z / CELL) + 0.5) * CELL);
    } else {
      c.m.position.set((Math.floor(hit.x / CELL) + 0.5) * CELL, (Math.floor((hit.y - FLOOR_Y) / CELL) + 0.5) * CELL + FLOOR_Y, WALL_Z + 0.02);
    }
    return true;
  }

  // Pointeur sur toute la section : inclinaison près du cadre + traits qui s'allument sous la souris
  let pointer = false, over = false, tilt = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect(), s = stage.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    over = e.clientX > s.left - 60 && e.clientX < s.right + 60 && e.clientY > s.top - 60 && e.clientY < s.bottom + 60;
    pointer = true;
    tilt = over ? { x: ((e.clientX - s.left) / s.width) * 2 - 1, y: -(((e.clientY - s.top) / s.height) * 2 - 1) } : { x: 0, y: 0 };
  };
  const onLeave = () => { pointer = over = false; tilt = { x: 0, y: 0 }; };
  events.addEventListener("pointermove", onMove);
  events.addEventListener("pointerleave", onLeave);

  const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  let rotX = 0.2, rotY = 0, camX = 0, camY = 0, camZ = 84, lastRead = 0;

  function frame(now: number) {
    const t = now / 1000;
    const ty = (reduce ? 0 : Math.sin(t * 0.4) * 0.45) + tilt.x * 0.35;
    const tx = 0.2 + (TILT[keys[active]] || 0) - tilt.y * 0.18;
    rotY += (ty - rotY) * 0.06; rotX += (tx - rotX) * 0.06;
    group.rotation.set(rotX, rotY, 0);
    // la caméra glisse un peu avec la souris : la grille prend de la profondeur
    const tcx = pointer && !reduce ? ndc.x * 3 : 0, tcy = pointer && !reduce ? ndc.y * 2 : 0;
    camX += (tcx - camX) * 0.04; camY += (tcy - camY) * 0.04;
    camera.position.set(camX, camY, camZ);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    group.updateMatrixWorld();

    let px: number | null = null, py = 0;
    if (over) {
      ray.setFromCamera(ndc, camera);
      plane.setFromNormalAndCoplanarPoint(zAxis.set(0, 0, 1).applyQuaternion(group.quaternion), group.position);
      if (ray.ray.intersectPlane(plane, hit)) { local.copy(hit); group.worldToLocal(local); px = local.x; py = local.y; }
    }
    // ligne de scan qui balaie l'objet de haut en bas toutes les 6 s
    const ph = (t % 6) / 1.8, scanY = !reduce && ph < 1 ? 16 - 32 * ph : null;

    // glitchs : rares, courts
    if (!reduce && t - t0 > DUR + STAGGER && t > nextGlitch) {
      glitch(t);
      burst2 = Math.random() < 0.4 ? t + 0.16 : 0;
      nextGlitch = t + 2.8 + Math.random() * 4.5;
    }
    if (burst2 && t > burst2) { glitch(t); burst2 = 0; }
    const glitching = t < glitchUntil;
    ghost.visible = t < ghostUntil;
    ghost.position.x = ghostDX;
    // flashs à 300 % : rares, très courts, parfois doublés
    if (opts.flash && !reduce && t - t0 > DUR + STAGGER) {
      if (t > nextFlash) {
        flashUntil = t + 0.06 + Math.random() * 0.08;
        flash2 = Math.random() < 0.45 ? t + 0.17 : 0;
        nextFlash = t + 3 + Math.random() * 5;
        flash.scale.setScalar(2.6 + Math.random() * 0.6);
        flash.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3, 0);
      }
      if (flash2 && t > flash2) { flashUntil = t + 0.05 + Math.random() * 0.06; flash2 = 0; }
    }
    flash.visible = t < flashUntil;
    if (!reduce) for (const c of cells) {
      if (t > c.next) { c.m.visible = placeCell(c); c.until = t + 0.06 + Math.random() * 0.14; c.next = t + 1.2 + Math.random() * 3.2; }
      if (t > c.until) c.m.visible = false;
    }

    const f = active < 0 ? null : FORMS[active];
    for (let i = 0; i < N; i++) {
      const i3 = i * 3, i6 = i * 6;
      const g = f ? pick(f, i) : null;
      if (g) {
        const tc = COL[g.c];
        const p = Math.min(1, Math.max(0, (t - t0 - delay[i]) / DUR));
        const e = ease(p), s = Math.sin(Math.PI * p), k = 1 - 0.55 * s;
        const d = dir[i], a = amp[i] * s;
        curM[i3] = fromM[i3] + (g.m[0] - fromM[i3]) * e + d.x * a;
        curM[i3 + 1] = fromM[i3 + 1] + (g.m[1] - fromM[i3 + 1]) * e + d.y * a;
        curM[i3 + 2] = fromM[i3 + 2] + (g.m[2] - fromM[i3 + 2]) * e + d.z * a;
        if (p >= 1) { curH[i3] = g.h[0]; curH[i3 + 1] = g.h[1]; curH[i3 + 2] = g.h[2]; }
        else {
          curH[i3] = (fromH[i3] + (g.h[0] - fromH[i3]) * e) * k;
          curH[i3 + 1] = (fromH[i3 + 1] + (g.h[1] - fromH[i3 + 1]) * e) * k;
          curH[i3 + 2] = (fromH[i3 + 2] + (g.h[2] - fromH[i3 + 2]) * e) * k;
        }
        curC[i3] = fromC[i3] + (tc.r - fromC[i3]) * e;
        curC[i3 + 1] = fromC[i3 + 1] + (tc.g - fromC[i3 + 1]) * e;
        curC[i3 + 2] = fromC[i3 + 2] + (tc.b - fromC[i3 + 2]) * e;
      }
      let mx = curM[i3], my = curM[i3 + 1];
      const mz = curM[i3 + 2];
      let glow = 0;
      if (glitching) { const o = glitched.get(i); if (o) { mx += o[0]; my += o[1]; glow = 1; } }
      if (scanY !== null) glow = Math.max(glow, 1 - Math.abs(my - scanY) / 1.4);
      if (px !== null) glow = Math.max(glow, Math.pow(Math.max(0, 1 - Math.hypot(mx - px, my - py) / 5), 1.5));
      // allumé : le crème passe orange, l'orange passe crème
      const hl = g && g.c === O ? COL[P] : COL[O];
      let r = curC[i3], gg = curC[i3 + 1], b = curC[i3 + 2];
      if (glow > 0) { r += (hl.r - r) * glow; gg += (hl.g - gg) * glow; b += (hl.b - b) * glow; }
      posArr[i6] = mx - curH[i3]; posArr[i6 + 1] = my - curH[i3 + 1]; posArr[i6 + 2] = mz - curH[i3 + 2];
      posArr[i6 + 3] = mx + curH[i3]; posArr[i6 + 4] = my + curH[i3 + 1]; posArr[i6 + 5] = mz + curH[i3 + 2];
      colArr[i6] = colArr[i6 + 3] = r; colArr[i6 + 1] = colArr[i6 + 4] = gg; colArr[i6 + 2] = colArr[i6 + 5] = b;
    }
    startAttr.data.needsUpdate = true;
    colorAttr.data.needsUpdate = true;
    renderer.render(scene, camera);

    if (readout && active >= 0 && now - lastRead > 120) {
      lastRead = now;
      readout.textContent = `rot ${(rotY * 57.3).toFixed(1).padStart(5, " ")}°  ${FORMS[active].length} traits`;
    }
  }

  // Cale l'objet sur le cadre : la caméra regarde l'origine, et la vue est décalée
  // (setViewOffset) pour que l'origine tombe au centre du cadre.
  function layout() {
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    const r = section.getBoundingClientRect(), s = stage.getBoundingClientRect();
    if (!s.height) return;
    const cx = s.left - r.left + s.width / 2, cy = s.top - r.top + s.height / 2;
    // Grille estompée en haut, en bas, et vers la gauche jusqu'au cadre (derrière les titres) ;
    // le fondu s'arrête avant le cadre pour ne jamais éteindre l'objet. En mobile, cadre à gauche = pas de fondu.
    if (withGrid) {
      const fadeTo = Math.max(0, s.left - r.left - 24);
      const mask =
        "linear-gradient(to bottom, transparent, #000 90px, #000 calc(100% - 90px), transparent), " +
        `linear-gradient(to right, rgba(0,0,0,0.12), rgba(0,0,0,0.45) ${Math.round(fadeTo * 0.55)}px, #000 ${Math.round(fadeTo)}px)`;
      cv.style.maskImage = mask;
      cv.style.setProperty("-webkit-mask-image", mask);
    }
    renderer.setSize(W, H, false);
    mat.resolution.set(W, H);
    ghostMat.resolution.set(W, H);
    flashMat.resolution.set(W, H);
    const Hv = s.height * 1.28, Wv = W; // même échelle qu'un canvas de 128 % du cadre
    camera.aspect = Wv / Hv;
    camera.setViewOffset(Wv, Hv, Wv / 2 - cx, Hv / 2 - cy, W, H);
    camZ = (s.width / s.height < 1.1 ? 66 : 66 * 0.92) * 1.28;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(layout);
  ro.observe(section);
  ro.observe(stage);
  document.fonts?.ready.then(layout);
  layout();

  let visible = false, raf = 0;
  const loop = (now: number) => { frame(now); raf = visible ? requestAnimationFrame(loop) : 0; };

  return {
    goTo(idx) {
      if (idx === active || !FORMS[idx]) return;
      fromM.set(curM); fromH.set(curH); fromC.set(curC);
      active = idx;
      t0 = performance.now() / 1000;
      for (let i = 0; i < N; i++) delay[i] = (i / N) * STAGGER; // balayage angulaire, comme une aiguille
      if (!reduce) { ghostUntil = t0 + 0.12; ghostDX = 0.5; } // petit écho au changement
    },
    setVisible(v) {
      visible = v;
      if (v && !raf) raf = requestAnimationFrame(loop);
    },
    destroy() {
      visible = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      events.removeEventListener("pointermove", onMove);
      events.removeEventListener("pointerleave", onLeave);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      cv.remove();
    },
  };
}
