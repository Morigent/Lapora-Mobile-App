/**
 * Deterministic hand-drawn line helper.
 * Ported from the design's generator so card borders wobble exactly like the mock:
 * amplitude 1.6, seeded per element so the line never re-jitters on re-render.
 */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Rounded rectangle with a jittered outline.
 * Coordinates are in the given SVG space; expand the SVG by `pad` so the
 * wobble is never clipped at the edges.
 */
export function wobbleRectPath(
  width: number,
  height: number,
  radius: number,
  seed: string,
  amplitude = 1.6,
): string {
  const rnd = mulberry32(hashSeed(seed));
  const jitter = () => (rnd() - 0.5) * 2 * amplitude;
  const steps = (length: number) => Math.max(2, Math.round(length / 46));

  const corners: [number, number, number][] = [
    [width - radius, radius, -Math.PI / 2],
    [width - radius, height - radius, 0],
    [radius, height - radius, Math.PI / 2],
    [radius, radius, Math.PI],
  ];

  const segments: string[] = [];
  let previous: [number, number] = [radius, 0];
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= 4; i += 1) {
      const angle = start + (i / 4) * (Math.PI / 2);
      const x = cx + Math.cos(angle) * radius + jitter() * 0.6;
      const y = cy + Math.sin(angle) * radius + jitter() * 0.6;
      segments.push(line(previous, [x, y]));
      previous = [x, y];
    }
  }

  const edges: [[number, number], [number, number]][] = [
    [[radius, 0], [width - radius, 0]],
    [[width, radius], [width, height - radius]],
    [[width - radius, height], [radius, height]],
    [[0, height - radius], [0, radius]],
  ];
  for (const [from, to] of edges) {
    let start = from;
    const count = steps(Math.hypot(to[0] - from[0], to[1] - from[1]));
    for (let i = 1; i <= count; i += 1) {
      const t = i / count;
      const point: [number, number] = [
        from[0] + (to[0] - from[0]) * t + jitter() * 0.5,
        from[1] + (to[1] - from[1]) * t + jitter() * 0.5,
      ];
      segments.push(line(start, point));
      start = point;
    }
  }

  return segments.join(' ');
}

function line(from: [number, number], to: [number, number]): string {
  const f = (n: number) => Number(n.toFixed(2));
  return `M${f(from[0])} ${f(from[1])} L${f(to[0])} ${f(to[1])}`;
}

/** Hand underlines: slightly slanted strokes used under headings. */
export function underlinePath(width: number, seed: string, amplitude = 1.2): string {
  const rnd = mulberry32(hashSeed(seed));
  const count = Math.max(3, Math.round(width / 40));
  const out: string[] = [];
  for (let i = 0; i <= count; i += 1) {
    const x = (width / count) * i;
    const y = (rnd() - 0.5) * 2 * amplitude + (i / count) * 0.8;
    out.push(i === 0 ? `M0 ${y.toFixed(2)}` : `L${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return out.join(' ');
}
