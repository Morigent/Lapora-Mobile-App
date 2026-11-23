import { StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import {
  HAZARD_SHAPE,
  MapPin,
  RadiusRing,
  UserDot,
  gridLines,
  projectPoint,
  radiusBand,
  roadPath,
} from '@/components/map/mapGeometry';
import { border, radius } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { type GeoPoint, type HazardZone, type Report } from '@/types/report';
import { formatDistance } from '@/utils/geo';

type Props = {
  width: number;
  height: number;
  center: GeoPoint | null;
  radiusKm: number;
  user: GeoPoint | null;
  reports: Report[];
  zones?: HazardZone[];
  selectedId?: string | null;
  onSelectReport?: (report: Report) => void;
};

/**
 * Hand-drawn map from the design (screens 12/16): grid, two roads, radius ring,
 * accent pins. No map SDK, no network tiles, deterministic layout.
 */
export function MapCanvas({
  width,
  height,
  center,
  radiusKm,
  user,
  reports,
  zones = [],
  selectedId,
  onSelectReport,
}: Props) {
  const { colors } = useTheme();
  const anchor = center ?? user;
  const userPoint = anchor && user ? projectPoint(user, anchor, radiusKm, width, height) : null;

  const roads = roadPath([
    {
      width: 7,
      points: [
        { x: -10, y: height * 0.28 },
        { x: width * 0.42, y: height * 0.44 },
        { x: width * 0.72, y: height * 0.62 },
        { x: width + 10, y: height * 0.7 },
      ],
    },
    {
      width: 5,
      points: [
        { x: width * 0.18, y: -10 },
        { x: width * 0.32, y: height * 0.36 },
        { x: width * 0.28, y: height * 0.66 },
        { x: width * 0.4, y: height + 10 },
      ],
    },
  ]);

  return (
    <View style={[styles.wrap, { width, height, backgroundColor: colors.paper2, borderColor: colors.ink }]}>
      <Svg width={width} height={height}>
        <Path d={gridLines(width, height, 44)} stroke={colors.grid} strokeWidth={1} />
        {roads.map((d, index) => (
          <Path
            key={index}
            d={d}
            stroke={colors.road}
            strokeWidth={index === 0 ? 7 : 5}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        {anchor
          ? zones.map((zone) => {
              const zoneCenter = projectPoint(zone.center, anchor, radiusKm, width, height);
              const r = (zone.radiusM / (radiusKm * 1000)) * (width / 2);
              return (
                <G key={zone.id}>
                  <RadiusRing
                    cx={zoneCenter.x}
                    cy={zoneCenter.y}
                    r={Math.max(18, r)}
                    color={colors.accent}
                    dashed
                    fillOpacity={0.05}
                  />
                  <Path
                    d={HAZARD_SHAPE}
                    transform={`translate(${zoneCenter.x - 74} ${zoneCenter.y - 74}) scale(${Math.max(0.45, r / 150)})`}
                    fill={colors.accent}
                    fillOpacity={0.08}
                    stroke={colors.accent}
                    strokeWidth={1.4}
                  />
                </G>
              );
            })
          : null}

        {anchor ? <RadiusRing cx={width / 2} cy={height / 2} r={(width / 2) * 0.31} color={colors.ink3} dashed /> : null}

        {anchor
          ? reports.map((report) => {
              const p = projectPoint(report.point, anchor, radiusKm, width, height);
              if (p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) return null;
              return (
                <MapPin
                  key={report.id}
                  x={p.x}
                  y={p.y}
                  color={selectedId === report.id ? colors.ink : colors.accent}
                  selected={selectedId === report.id}
                  stroke={colors.paper}
                  onPress={() => onSelectReport?.(report)}
                />
              );
            })
          : null}

        {userPoint ? (
          <UserDot x={userPoint.x} y={userPoint.y} color={colors.ink} background={colors.paper} />
        ) : null}
      </Svg>

      {userPoint ? (
        <View style={[styles.youLabel, { backgroundColor: colors.paper, borderColor: colors.ink }]}>
          <Icon name="target" size={11} color={colors.ink} />
          <AppText variant="meta" color="ink" style={styles.youText}>
            kamu di sini
          </AppText>
        </View>
      ) : null}

      {anchor ? (
        <View style={styles.scale}>
          <View style={[styles.scaleBar, { backgroundColor: colors.ink }]} />
          <AppText variant="meta" color="ink3">
            {formatDistance(radiusKm * 1000)}
          </AppText>
        </View>
      ) : null}

      {user && anchor && radiusBand(user, anchor) > radiusKm * 1000 ? (
        <View style={[styles.offRange, { backgroundColor: colors.paper, borderColor: colors.accent }]}>
          <Icon name="info" size={12} color={colors.accent} />
          <AppText variant="meta" color="accent" style={styles.offRangeText}>
            Posisimu di luar radius
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: border.heavy, borderRadius: radius.tile, overflow: 'hidden', position: 'relative' },
  youLabel: {
    position: 'absolute',
    left: 10,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1.2,
  },
  youText: { fontSize: 9.5, letterSpacing: 0.3 },
  scale: { position: 'absolute', right: 10, bottom: 10, alignItems: 'flex-end', gap: 3 },
  scaleBar: { width: 34, height: 2 },
  offRange: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1.2,
  },
  offRangeText: { fontSize: 9.5 },
});
