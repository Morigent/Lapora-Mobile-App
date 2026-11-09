/**
 * onboardingData.ts
 * ---------------------------------------------------------------------------
 * Data + design tokens + tiny helpers for the Civic Pulse onboarding page.
 * Style system: "hand-drawn mono UI" (ink on paper, ONE accent color).
 *
 * Kenapa wobble-nya di-generate lewat path (bukan SVG filter)?
 * react-native-svg nggak support <feTurbulence>/<feDisplacementMap>, jadi
 * efek "digambar tangan" dibikin dengan seeded jitter pada path border.
 * Hasilnya stabil (nggak "loncat" tiap re-render) dan teks tetap crisp.
 */

import { Platform } from "react-native";

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */

export type Theme = {
  paper: string; // page + card surface
  paper2: string; // inset areas
  paper3: string; // dividers, inactive dots
  ink: string; // text, borders, primary button fill
  ink2: string; // secondary text
  ink3: string; // hints, button hard-shadow
  onInk: string; // text on ink-filled surfaces
  accent: string; // the ONE accent
};

export const lightTheme: Theme = {
  paper: "#FFFFFF",
  paper2: "#F4F4F5",
  paper3: "#E9E9EB",
  ink: "#111111",
  ink2: "#4A4A4E",
  ink3: "#9A9AA0",
  onInk: "#FFFFFF",
  accent: "#E5322D",
};

export const darkTheme: Theme = {
  paper: "#141414",
  paper2: "#1E1E1F",
  paper3: "#2A2A2C",
  ink: "#F2F2F2",
  ink2: "#B4B4B9",
  ink3: "#7C7C82",
  onInk: "#141414",
  accent: "#FF5A52",
};

export const tokens = {
  stroke: 2.5, // ink outline thickness
  radiusCard: 24,
  lift: 4, // hard offset shadow for cards
  liftButton: 3, // hard offset shadow for buttons
  buttonSize: 56,
} as const;

/**
 * Fonts: sengaja pakai system font biar zero-dependency.
 * Kalau mau persis kayak spec (Plus Jakarta Sans / Inter), load pakai
 * @expo-google-fonts/* lalu isi `display` & `body` di sini.
 * `hand` dipakai HANYA buat anotasi kecil (max 2-3 per layar).
 */
export const fonts = {
  display: undefined as string | undefined,
  body: undefined as string | undefined,
  hand: Platform.select({
    ios: "Noteworthy",
    android: "cursive",
    default: "cursive",
  }) as string,
};

/* ------------------------------------------------------------------ */
/* Slides content                                                      */
/* ------------------------------------------------------------------ */

export type DoodleName =
  | "camera"
  | "mapPin"
  | "geofence"
  | "noGallery"
  | "clock"
  | "bubble"
  | "sparkle"
  | "ticks"
  | "check"
  | "squiggle";

export type Satellite = {
  kind: DoodleName;
  /** posisi dalam persen dari hero card (0-100) */
  x: number;
  y: number;
  size: number;
  rotate?: number;
};

export type Slide = {
  id: string;
  eyebrow: string;
  /** pakai \n untuk paksa 2 baris */
  title: string;
  body: string;
  points: string[];
  hero: DoodleName;
  satellites: Satellite[];
  /** anotasi tulisan tangan kecil di hero card */
  note?: { text: string; x: number; y: number; rotate?: number };
  /** catatan kecil di bawah poin (dipakai buat disclaimer jujur) */
  footnote?: string;
};

export const slides: Slide[] = [
  {
    id: "capture",
    eyebrow: "01 · Lapor",
    title: "Foto langsung\ndari kamera",
    body:
      "Nemu jalan berlubang atau fasilitas umum yang rusak? Ambil fotonya langsung lewat kamera di dalam Civic Pulse. Foto dari galeri tidak bisa diunggah, jadi laporan tetap segar dan sesuai kondisi di lapangan.",
    points: [
      "Kamera in-app, tanpa upload dari galeri",
      "Foto lama atau dari tempat lain tidak bisa dipakai",
      "Dokumentasi laporan jadi lebih meyakinkan",
    ],
    hero: "camera",
    satellites: [
      { kind: "noGallery", x: 7, y: 9, size: 46, rotate: -8 },
      { kind: "sparkle", x: 80, y: 11, size: 30, rotate: 10 },
      { kind: "ticks", x: 74, y: 64, size: 34 },
    ],
    note: { text: "tanpa galeri!", x: 6, y: 74, rotate: -6 },
  },
  {
    id: "verify",
    eyebrow: "02 · Verifikasi",
    title: "Lokasi & waktu\nikut tercatat",
    body:
      "Saat foto diambil, aplikasi mencatat koordinat perangkat dan waktu pengambilan. Kamu akan melihat pratinjau foto beserta titik lokasinya di peta, lalu mengonfirmasi apakah lokasinya sudah benar sebelum laporan dikirim.",
    points: [
      "Koordinat & waktu ditampilkan sebagai watermark",
      "Pratinjau lokasi di peta sebelum kirim",
      "Kamu yang mengonfirmasi kesesuaian lokasi",
    ],
    hero: "mapPin",
    satellites: [
      { kind: "clock", x: 7, y: 11, size: 44, rotate: -6 },
      { kind: "check", x: 79, y: 14, size: 32, rotate: 8 },
      { kind: "sparkle", x: 82, y: 68, size: 26 },
    ],
    note: { text: "cek dulu ya", x: 6, y: 74, rotate: -5 },
    footnote:
      "Catatan: akurasi GPS dan kondisi jaringan bisa memengaruhi hasil, dan tidak ada sistem yang 100% bebas manipulasi.",
  },
  {
    id: "community",
    eyebrow: "03 · Pantau",
    title: "Lihat kerusakan\nbareng warga",
    body:
      "Semua laporan tampil di peta interaktif, jadi kamu bisa melihat persebaran kerusakan fasilitas publik di sekitarmu, menyaring laporan sesuai kebutuhan, dan mengenali area rawan bencana lewat geofencing.",
    points: [
      "Peta interaktif persebaran laporan",
      "Penapisan laporan yang responsif",
      "Geofencing untuk area rawan bencana",
    ],
    hero: "geofence",
    satellites: [
      { kind: "bubble", x: 7, y: 11, size: 44, rotate: -8 },
      { kind: "sparkle", x: 80, y: 13, size: 30, rotate: 10 },
      { kind: "squiggle", x: 66, y: 76, size: 44 },
    ],
    note: { text: "bareng warga", x: 6, y: 74, rotate: -6 },
  },
];

/* ------------------------------------------------------------------ */
/* Hand-drawn helpers                                                  */
/* ------------------------------------------------------------------ */

/** Deterministic RNG (mulberry32) supaya wobble nggak berubah tiap render. */
export function rng(seed = 7): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Rounded-rect path dengan "goyangan tangan" tipis.
 * - Sisi lurus dibikin sedikit melengkung (control point di-jitter).
 * - Ujung tiap sisi digeser sub-pixel.
 * Dipakai untuk border card & button; teks nggak pernah kena efek ini.
 */
export function wobbleRectPath(
  w: number,
  h: number,
  radius: number = tokens.radiusCard,
  seed = 1,
  amp = 1.4,
  inset = 3,
): string {
  const rand = rng(seed);
  const j = (m: number) => (rand() - 0.5) * 2 * m;
  const f = (n: number) => n.toFixed(1);
  const P = (x: number, y: number, m = amp * 0.5) =>
    `${f(x + j(m))} ${f(y + j(m))}`;

  const x0 = inset;
  const y0 = inset;
  const x1 = Math.max(x0 + 1, w - inset);
  const y1 = Math.max(y0 + 1, h - inset);
  const r = Math.max(2, Math.min(radius, (x1 - x0) / 2, (y1 - y0) / 2));
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;

  const start = `${f(x0 + r)} ${f(y0)}`;

  return [
    `M${start}`,
    `Q${P(mx, y0, amp)} ${P(x1 - r, y0)}`, // top edge
    `Q${P(x1, y0, amp * 0.4)} ${P(x1, y0 + r)}`, // top-right corner
    `Q${P(x1, my, amp)} ${P(x1, y1 - r)}`, // right edge
    `Q${P(x1, y1, amp * 0.4)} ${P(x1 - r, y1)}`, // bottom-right corner
    `Q${P(mx, y1, amp)} ${P(x0 + r, y1)}`, // bottom edge
    `Q${P(x0, y1, amp * 0.4)} ${P(x0, y1 - r)}`, // bottom-left corner
    `Q${P(x0, my, amp)} ${P(x0, y0 + r)}`, // left edge
    `Q${P(x0, y0, amp * 0.4)} ${start}`, // top-left corner, nutup di titik awal
    "Z",
  ].join(" ");
}

export const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));