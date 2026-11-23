import { useRouter } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { HandNote } from '@/components/common/HandNote';
import { Icon } from '@/components/common/Icon';
import { IconButton } from '@/components/common/IconButton';
import { Screen } from '@/components/common/Screen';
import { MapCanvas } from '@/components/map/MapCanvas';
import { border, radius, space } from '@/constants/design';
import { useHazardGeofence } from '@/features/hazards/hooks/useHazardGeofence';
import { useLocationTracking } from '@/features/location/hooks/useLocationTracking';
import { useReportFilters } from '@/features/reports/hooks/useReportFilters';
import { useTheme } from '@/hooks/use-theme';
import { useMapStore } from '@/stores/mapStore';

import { formatDistance } from '@/utils/geo';

/** Design screen 16 — advisory only, never an official warning. */
export default function HazardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { point } = useLocationTracking();
  const { zones, message, inside, nearest } = useHazardGeofence(point);
  const radiusKm = useMapStore((state) => state.filter.radiusKm);
  const center = useMapStore((state) => state.center);
  const filter = useMapStore((state) => state.filter);
  const { reports } = useReportFilters({ ...filter, area: 'hazard' }, point);

  return (
    <Screen bottomInset contentStyle={styles.content}>
      <View style={styles.head}>
        <IconButton icon="back" label="Kembali" onPress={() => router.back()} />
        <View style={styles.headText}>
          <AppText variant="h2">Area Rawan Bencana</AppText>
          <AppText variant="meta" color="ink3">
            BUKAN PERINGATAN RESMI
          </AppText>
        </View>
        <View style={styles.headSpacer} />
      </View>

      <View style={styles.mapWrap}>
        <MapCanvas
          width={width - space.lg * 2}
          height={280}
          center={center}
          radiusKm={radiusKm}
          user={point}
          reports={reports}
          zones={zones}
        />
        {point ? (
          <HandNote size={16} color={colors.ink2} style={styles.youNote}>
            kamu
          </HandNote>
        ) : null}
      </View>

      <AppCard padding={16} background={colors.paper2} shadow={false}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusIcon,
              { borderColor: inside ? colors.accent : colors.ink, backgroundColor: colors.paper },
            ]}
          >
            <Icon name={inside ? 'alert' : 'shield'} size={18} color={inside ? colors.accent : colors.ink} />
          </View>
          <View style={styles.statusText}>
            <AppText variant="bodySmall" weight="600">
              {inside ? 'Kamu di dalam zona rawan' : 'Kamu di luar zona'}
            </AppText>
            <AppText variant="meta" color="ink3">
              {message}
            </AppText>
          </View>
          {!inside && nearest ? (
            <AppText variant="h3" color="accent">
              {formatDistance(nearest.distanceToEdgeM)}
            </AppText>
          ) : null}
        </View>
      </AppCard>

      <View style={styles.section}>
        <AppText variant="label" color="ink3">
          ZONA TERDEKAT
        </AppText>
        {zones.map((zone) => (
          <AppCard key={zone.id} padding={12} shadow={false} background={colors.paper2}>
            <View style={styles.zoneRow}>
              <View style={[styles.zoneDot, { borderColor: colors.accent }]} />
              <View style={styles.zoneText}>
                <AppText variant="h3">{zone.name}</AppText>
                <AppText variant="bodySmall" color="ink3">
                  radius {formatDistance(zone.radiusM)} · {zone.kind}
                </AppText>
              </View>
            </View>
          </AppCard>
        ))}
      </View>

      <View style={[styles.note, { borderColor: colors.paper3 }]}>
        <Icon name="info" size={14} color={colors.ink3} />
        <AppText variant="bodySmall" color="ink3" style={styles.noteText}>
          Zona berasal dari data backend/simulasi. Untuk evakuasi, ikuti arahan BPBD setempat. Geofence aktif hanya saat
          aplikasi terbuka. Data zona dapat berubah tanpa pemberitahuan.
        </AppText>
      </View>

      <AppButton label="Lihat peta & laporan" variant="outline" icon="map" onPress={() => router.replace('/(tabs)/map')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.lg, paddingTop: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headText: { flex: 1, alignItems: 'center', gap: 2 },
  headSpacer: { width: 44 },
  mapWrap: { alignItems: 'center' },
  youNote: { position: 'absolute', right: space.xl, top: space.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.tile - 4,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: { flex: 1, gap: 1 },
  section: { gap: space.sm },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  zoneDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2.5 },
  zoneText: { flex: 1, gap: 1 },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    borderWidth: 1.2,
    borderRadius: radius.input,
    padding: space.md,
  },
  noteText: { flex: 1 },
});
