import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

/**
 * Single icon set for the whole app: 24 grid, stroke 2, round caps.
 * Geometry is the design's own line set (design/lapora.figcraft, "Ikon & coretan").
 * If a custom SVG is supplied, place it at assets/icons/<name>.svg and swap the entry
 * here — every screen reads icons through this one component.
 */

type Ring = { cx: number; cy: number; r: number; filled?: boolean };

type Glyph = {
  paths: string[];
  rings?: Ring[];
};

export const GLYPHS = {
  camera: {
    paths: [
      'M3.4 9.2 C 3.4 8.1 4.3 7.2 5.4 7.2 C 6.4 7.2 7 6.2 7.8 5.4 C 8.6 4.7 9.4 4.3 10.4 4.3 L13.6 4.3 C 14.6 4.3 15.4 4.7 16.2 5.4 C 17 6.2 17.6 7.2 18.6 7.2 C 19.7 7.2 20.6 8.1 20.6 9.2 L20.6 17.4 C 20.6 18.5 19.7 19.4 18.6 19.4 L5.4 19.4 C 4.3 19.4 3.4 18.5 3.4 17.4 Z',
    ],
    rings: [{ cx: 12, cy: 13.2, r: 3.96 }],
  },
  pin: {
    paths: [
      'M12 21.4 C 8.4 16.8 4.8 14.2 4.8 9.7 C 4.8 6.1 8 3.3 12 3.3 C 16 3.3 19.2 6.1 19.2 9.7 C 19.2 14.2 15.6 16.8 12 21.4 Z',
    ],
    rings: [{ cx: 12, cy: 9.7, r: 2.76, filled: true }],
  },
  alert: {
    paths: [
      'M12 3.4 C 12.6 3.4 13 3.8 13.4 4.5 L20.3 17.2 C 20.8 18 20.2 18.9 19.3 18.9 L4.7 18.9 C 3.8 18.9 3.2 18 3.7 17.2 L10.6 4.5 C 11 3.8 11.4 3.4 12 3.4 Z',
      'M12 8.2 L12 13.4',
    ],
    rings: [{ cx: 12, cy: 16.6, r: 1.1, filled: true }],
  },
  check: { paths: ['M4.6 12.3 L9.8 17.5 L19.4 6.6'] },
  close: { paths: ['M5.6 5.6 L18.4 18.4 M18.4 5.6 L5.6 18.4'] },
  arrow: { paths: ['M3.6 12.1 L20 12.4 M13.4 5.8 L20.3 12.3 L13.6 18.4'] },
  chev: { paths: ['M9.4 5.6 L16 12.1 L9.4 18.4'] },
  back: { paths: ['M14.8 4.4 L7 12.1 L14.8 19.6'] },
  search: {
    paths: [
      'M10.6 17.2 C 6.9 17.2 4 14.4 4 10.7 C 4 7 6.9 4.2 10.6 4.2 C 14.2 4.2 17.1 7 17.1 10.7 C 17.1 14.4 14.2 17.2 10.6 17.2 Z M15.8 15.7 L20.4 20.4',
    ],
  },
  clock: {
    paths: [
      'M12 20.6 C 7.2 20.6 3.4 16.8 3.4 12 C 3.4 7.2 7.2 3.4 12 3.4 C 16.8 3.4 20.6 7.2 20.6 12 C 20.6 16.8 16.8 20.6 12 20.6 Z',
      'M12 7.4 L12 12.1 L15.6 14.2',
    ],
  },
  filter: { paths: ['M3.8 7.4 L20.2 7.4 M3.8 12 L15.6 12 M3.8 16.6 L11.4 16.6'] },
  bolt: { paths: ['M13.4 2.8 L6.4 11.9 L10.9 12.1 L9.2 21.4 L17.6 10.4 L12.6 10.4 Z'] },
  user: {
    paths: [
      'M12 12.2 C 9.9 12.2 8.2 10.5 8.2 8.4 C 8.2 6.3 9.9 4.6 12 4.6 C 14.1 4.6 15.8 6.3 15.8 8.4 C 15.8 10.5 14.1 12.2 12 12.2 Z M4.2 20.8 C 4.8 16.6 7.8 14.5 12 14.5 C 16.2 14.5 19.2 16.6 19.8 20.8',
    ],
  },
  home: { paths: ['M3.6 11.8 L12 3.5 L20.4 11.8 L20.4 20.4 L3.6 20.4 Z'] },
  map: {
    paths: [
      'M3.4 8 L9 5.2 L15 8 L20.6 5.2 L20.6 16.6 L15 19.4 L9 16.6 L3.4 19.4 Z M9 5.2 L9 16.6 M15 8 L15 19.4',
    ],
  },
  upload: {
    paths: ['M12 3.6 L12 14.2 M7.2 8.6 L12 3.6 L16.8 8.6 M4 15.6 L4 20.4 L20 20.4 L20 15.6'],
  },
  shield: {
    paths: [
      'M12 3.2 C 14.4 5.4 17.2 6.2 20.2 6.2 L20.2 12.4 C 20.2 17 16.6 20.2 12 21.4 C 7.4 20.2 3.8 17 3.8 12.4 L3.8 6.2 C 6.8 6.2 9.6 5.4 12 3.2 Z',
    ],
  },
  bell: {
    paths: [
      'M12 3.4 C 8.6 3.4 6.4 5.9 6.4 9.5 L6.4 13.8 L4.6 16.4 L19.4 16.4 L17.6 13.8 L17.6 9.5 C 17.6 5.9 15.4 3.4 12 3.4 Z M10.2 19.2 L13.8 19.2',
      'M9.2 16.4 L14.8 16.4',
    ],
  },
  target: {
    paths: [
      'M12 18.8 C 8.2 18.8 5.2 15.8 5.2 12 C 5.2 8.2 8.2 5.2 12 5.2 C 15.8 5.2 18.8 8.2 18.8 12 C 18.8 15.8 15.8 18.8 12 18.8 Z M2 12 L4.6 12 M19.4 12 L22 12 M12 2 L12 4.6 M12 19.4 L12 22',
    ],
    rings: [{ cx: 12, cy: 12, r: 2.64, filled: true }],
  },
  list: {
    paths: ['M8.6 6.4 L19.4 6.4 M8.6 12 L19.4 12 M8.6 17.6 L19.4 17.6'],
    rings: [
      { cx: 1.9, cy: 6.2, r: 1.2, filled: true },
      { cx: 1.9, cy: 11.7, r: 1.2, filled: true },
      { cx: 1.9, cy: 17.2, r: 1.2, filled: true },
    ],
  },
  grid: {
    paths: ['M3.6 3.6 L20.4 3.6 L20.4 20.4 L3.6 20.4 Z M3.6 12 L20.4 12 M12 3.6 L12 20.4'],
  },
  flip: {
    paths: [
      'M8.4 4.6 C 5.2 5.6 3 8.6 3 12 C 3 14.4 4 16.6 5.6 18.2 M15.6 4.6 C 18.8 5.6 21 8.6 21 12 C 21 14.4 20 16.6 18.4 18.2 M12 3 L12 21',
    ],
  },
  lock: {
    paths: ['M6.6 10.4 L17.4 10.4 L17.4 20.4 L6.6 20.4 Z M8.8 10.4 L8.8 7.6 C 8.8 5.8 10.2 4.4 12 4.4 C 13.8 4.4 15.2 5.8 15.2 7.6 L15.2 10.4'],
  },
  info: {
    paths: [
      'M12 20.6 C 7.2 20.6 3.4 16.8 3.4 12 C 3.4 7.2 7.2 3.4 12 3.4 C 16.8 3.4 20.6 7.2 20.6 12 C 20.6 16.8 16.8 20.6 12 20.6 Z M12 11 L12 16.6',
    ],
    rings: [{ cx: 12, cy: 7.9, r: 1.2, filled: true }],
  },
  dots: {
    paths: [],
    rings: [
      { cx: 5, cy: 11.8, r: 1.2, filled: true },
      { cx: 12, cy: 11.8, r: 1.2, filled: true },
      { cx: 19, cy: 11.8, r: 1.2, filled: true },
    ],
  },
  image: { paths: ['M4 4.6 L20 4.6 L20 19.4 L4 19.4 Z M4 15.4 L9 10.6 L13 14.4 L16 11.6 L20 15.2'] },
  refresh: {
    paths: [
      'M20 12 C 20 16.4 16.4 20 12 20 C 7.6 20 4 16.4 4 12 C 4 7.6 7.6 4 12 4 C 15 4 17.6 5.6 19 8 M19 3.8 L19 8.4 L14.6 8.4',
    ],
  },
  signal: { paths: ['M4 18 L4 14 M9 18 L9 10 M14 18 L14 6 M19 18 L19 3'] },
  wifi_off: {
    paths: [
      'M3.4 5.6 L20.6 18.4 M5 11 C 7 9 9 8 11 8 C 12 8 13 8.2 14 8.6 M8.4 14.6 C 9.4 13.6 10.6 13.2 12 13.4 M12 18 L12 18.2',
    ],
  },
} satisfies Record<string, Glyph>;

export type IconName = keyof typeof GLYPHS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 24, color = '#111111', strokeWidth = 2 }: IconProps) {
  const glyph: Glyph = GLYPHS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {glyph.paths.map((d, index) => (
        <Path
          key={index}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
      {glyph.rings?.map((ring, index) => (
        <Circle
          key={`ring-${index}`}
          cx={ring.cx}
          cy={ring.cy}
          r={ring.r}
          fill={ring.filled ? color : 'none'}
          stroke={ring.filled ? undefined : color}
          strokeWidth={strokeWidth}
        />
      ))}
    </Svg>
  );
}

export function useIconColor(): string {
  return useTheme().colors.ink;
}
