import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';

import { AppChip } from '@/components/common/AppChip';
import { AppText } from '@/components/common/AppText';
import { Skeleton } from '@/components/common/Feedback';
import { Icon } from '@/components/common/Icon';
import { IconButton } from '@/components/common/IconButton';
import { Screen } from '@/components/common/Screen';
import { FilterSheet } from '@/components/map/FilterSheet';
import { MapCanvas } from '@/components/map/MapCanvas';
import { ReportListCard } from '@/components/report/ReportListCard';
import { layout, radius, space, type as typeScale } from '@/constants/design';
import { useHazardGeofence } from '@/features/hazards/hooks/useHazardGeofence';
import { useLocationTracking } from '@/features/location/hooks/useLocationTracking';
import { useReportFilters } from '@/features/reports/hooks/useReportFilters';
import { useTheme } from '@/hooks/use-theme';
import { useMapStore } from '@/stores/mapStore';
import { type GeoPoint } from '@/types/report';
import { formatDistance, haversineMeters } from '@/utils/geo';

/** Design screens 12 + 13. */
export default function MapScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { point, request } = useLocationTracking();
  const { zones, message } = useHazardGeofence(point);
  const filter = useMapStore((state) => state.filter);
  const center = useMapStore((state) => state.center);
  const setCenter = useMapStore((state) => state.setCenter);
  const setFilter = useMapStore((state) => state.setFilter);
  const resetFilter = useMapStore((state) => state.resetFilter);
  const selectedId = useMapStore((state) => state.selectedId);
  const select = useMapStore((state) => state.select);
  const sheetOpen = useMapStore((state) => state.sheetOpen);
  const setSheetOpen = useMapStore((state) => state.setSheetOpen);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);

  const { reports, loading } = useReportFilters({ ...filter, query: search }, point);

  useEffect(() => {
    if (point) setCenter(point);
  }, [point, setCenter]);

  const mapWidth = width - layout.margin * 2;
  const mapHeight = Math.max(260, Math.min(420, height * 0.44));
  const anchor: GeoPoint | null = center ?? point;
  const sorted = anchor
    ? [...reports].sort((a, b) => haversineMeters(anchor, a.point) - haversineMeters(anchor, b.point))
    : reports;

  return (
    <>
      <Screen scroll={false} contentStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <AppText variant="h1">Peta Laporan</AppText>
            <IconButton icon="target" label="Gunakan lokasi saya" onPress={request} />
          </View>
          <View
            style={[
              styles.search,
              {
                backgroundColor: focused ? colors.paper : colors.paper2,
                borderColor: focused ? colors.ink : colors.paper3,
              },
            ]}
          >
            <Icon name="search" size={16} color={colors.ink3} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Cari laporan atau jalan"
              placeholderTextColor={colors.ink3}
              style={[typeScale.bodySmall, styles.input, { color: colors.ink }]}
              returnKeyType="search"
            />
            {search.length > 0 ? (
              <IconButton icon="close" label="Hapus pencarian" size={26} variant="plain" onPress={() => setSearch('')} />
            ) : null}
          </View>
        </View>

        <View style={styles.mapWrap}>
          <MapCanvas
            width={mapWidth}
            height={mapHeight}
            center={center}
            radiusKm={filter.radiusKm}
            user={point}
            reports={reports}
            zones={zones}
            selectedId={selectedId}
            onSelectReport={(report) => select(report.id)}
          />
          <View style={styles.mapChips}>
            <AppChip label={loading ? 'Memuat…' : `${reports.length} laporan`} size="small" tone="solid" />
            <AppChip
              label={`Radius ${formatDistance(filter.radiusKm * 1000)}`}
              size="small"
              icon="filter"
              onPress={() => setSheetOpen(true)}
            />
          </View>
        </View>

        <View style={styles.listHead}>
          <AppText variant="label" color="ink3">
            LAPORAN DI SEKITAR
          </AppText>
          <AppText variant="meta" color="ink3">
            URUT TERDEKAT
          </AppText>
        </View>

        <View style={styles.list}>
          {loading ? (
            <>
              <Skeleton width="100%" height={78} radius={radius.tile} />
              <Skeleton width="100%" height={78} radius={radius.tile} />
            </>
          ) : sorted.length === 0 ? (
            <AppText variant="bodySmall" color="ink3">
              Belum ada laporan yang cocok dengan filter ini.
            </AppText>
          ) : (
            sorted.slice(0, 2).map((report) => (
              <ReportListCard
                key={report.id}
                report={report}
                distanceM={anchor ? haversineMeters(anchor, report.point) : null}
                onPress={() => router.push({ pathname: '/report/[id]', params: { id: report.id } })}
              />
            ))
          )}
        </View>

        <View style={styles.footerRow}>
          <Icon name="shield" size={13} color={colors.ink3} />
          <AppText variant="meta" color="ink3" style={styles.footerText}>
            {message}
          </AppText>
        </View>
      </Screen>

      <FilterSheet
        visible={sheetOpen}
        filter={filter}
        matchCount={reports.length}
        onChange={setFilter}
        onReset={resetFilter}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.sm, paddingBottom: space.sm },
  header: { gap: space.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1.4,
    borderRadius: radius.input,
    paddingHorizontal: space.md,
    height: 46,
  },
  input: { flex: 1, paddingVertical: 0 },
  mapWrap: { gap: space.sm, marginTop: space.xs },
  mapChips: { flexDirection: 'row', gap: space.sm },
  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm },
  list: { gap: space.sm, flex: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { flex: 1 },
});
