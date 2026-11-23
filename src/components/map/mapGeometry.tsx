import { Circle, G, Path, Rect } from 'react-native-svg';

import { palette } from '@/constants/design';
import { type GeoPoint } from '@/types/report';

/**
 * Hand-drawn map projection: equirectangular around a centre, then a linear
 * scale to the viewport. No map SDK needed, and the geometry stays tick-stable.
 */

const METERS_PER_DEG_LAT = 110_540;

export function metersPerDegLng(latitude: number): number {
  return 111_320 * Math.cos((latitude * Math.PI) / 180) || 1;
}

export type CanvasPoint = { x: number; y: number };

export function projectPoint(
  point: GeoPoint,
  center: GeoPoint,
  radiusKm: number,
  width: number,
  height: number,
): CanvasPoint {
  const span = radiusKm * 1000;
  const dx = (point.longitude - center.longitude) * metersPerDegLng(center.latitude);
  const dy = (point.latitude - center.latitude) * METERS_PER_DEG_LAT;
  return {
    x: width / 2 + (dx / span) * (width / 2),
    y: height / 2 - (dy / span) * (height / 2),
  };
}

/** Distance from the viewport centre in metres, for labels. */
export function radiusBand(point: GeoPoint, center: GeoPoint): number {
  const dx = (point.longitude - center.longitude) * metersPerDegLng(center.latitude);
  const dy = (point.latitude - center.latitude) * METERS_PER_DEG_LAT;
  return Math.hypot(dx, dy);
}

export function gridLines(width: number, height: number, step: number): string {
  const out: string[] = [];
  for (let x = step; x < width; x += step) out.push(`M${x} 0 V${height}`);
  for (let y = step; y < height; y += step) out.push(`M0 ${y} H${width}`);
  return out.join(' ');
}

export type RoadSpec = { points: CanvasPoint[]; width: number };

export function roadPath(roads: RoadSpec[]): string[] {
  return roads.map((road) =>
    road.points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' '),
  );
}

/** Pin glyph: 22.8×25.2 body with a 7.2 hole, same proportions as the design pins. */
export const PIN_BODY =
  'M12 26.4 C 6.6 19.4 2.4 15.1 2.4 9.8 C 2.4 5.1 6.8 2 12 2 C 17.2 2 21.6 5.1 21.6 9.8 C 21.6 15.1 17.4 19.4 12 26.4 Z';

export function MapPin({
  x,
  y,
  color = palette.light.accent,
  scale = 1,
  selected = false,
  onPress,
  stroke = palette.light.paper,
}: {
  x: number;
  y: number;
  color?: string;
  scale?: number;
  selected?: boolean;
  onPress?: () => void;
  stroke?: string;
}) {
  return (
    <G onPress={onPress}>
      {selected ? <Circle cx={x} cy={y - 13 * scale} r={17 * scale} fill={color} fillOpacity={0.16} /> : null}
      <G transform={`translate(${x - 12 * scale} ${y - 26.4 * scale}) scale(${scale})`}>
        <Path d={PIN_BODY} fill={color} stroke={stroke} strokeWidth={selected ? 0 : 1.6} />
        <Circle cx={12} cy={9.4} r={3.6} fill={stroke} />
      </G>
    </G>
  );
}

export function RadiusRing({
  cx,
  cy,
  r,
  color,
  dashed = false,
  fillOpacity = 0,
}: {
  cx: number;
  cy: number;
  r: number;
  color: string;
  dashed?: boolean;
  fillOpacity?: number;
}) {
  return (
    <Circle
      cx={cx}
      cy={cy}
      r={r}
      fill={color}
      fillOpacity={fillOpacity}
      stroke={color}
      strokeOpacity={dashed ? 0.75 : 1}
      strokeWidth={1.6}
      strokeDasharray={dashed ? '6 6' : undefined}
    />
  );
}

export function UserDot({
  x,
  y,
  color,
  label,
  background = palette.light.paper,
}: {
  x: number;
  y: number;
  color: string;
  label?: boolean;
  background?: string;
}) {
  return (
    <G>
      <Circle cx={x} cy={y} r={13} fill="none" stroke={color} strokeWidth={1.6} strokeDasharray="4 4" />
      <Circle cx={x} cy={y} r={6.5} fill={color} />
      {label ? (
        <Rect x={x + 12} y={y - 26} width={78} height={18} rx={9} fill={background} opacity={0.82} />
      ) : null}
    </G>
  );
}

/** Hazard zone blob copied from the design (148×148 view box, translate to place). */
export const HAZARD_SHAPE =
  'M 20 66 C 8 40 30 14 66 10 C 104 6 128 26 148 22 C 176 17 190 36 182 62 C 174 88 188 108 166 124 C 142 142 108 136 82 140 C 50 145 22 118 26 96 C 29 82 26 78 20 66 Z';
