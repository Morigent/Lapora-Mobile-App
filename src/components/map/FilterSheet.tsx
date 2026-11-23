import { useEffect, useState } from 'react';
import { Animated, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppChip } from '@/components/common/AppChip';
import { AppText } from '@/components/common/AppText';
import { IconButton } from '@/components/common/IconButton';
import { REPORT_CATEGORIES } from '@/constants/reportMeta';
import { border, radius, space } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { MAP_RADIUS_OPTIONS_KM, SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { type ReportFilter, type ReportStatus } from '@/types/report';
import { formatDistance } from '@/utils/geo';

type Props = {
  visible: boolean;
  filter: ReportFilter;
  matchCount: number;
  onChange: (patch: Partial<ReportFilter>) => void;
  onReset: () => void;
  onClose: () => void;
};

const STATUS_GROUPS: { label: string; value: ReportStatus[] }[] = [
  { label: 'Terkirim', value: ['submitted'] },
  { label: 'Diverifikasi', value: ['under_review', 'in_progress'] },
  { label: 'Selesai', value: ['resolved'] },
];

const WINDOWS: { label: string; value: 1 | 7 | 30 | null }[] = [
  { label: '24 jam', value: 1 },
  { label: '7 hari', value: 7 },
  { label: '30 hari', value: 30 },
  { label: 'Semua', value: null },
];

const AREAS: { label: string; value: ReportFilter['area'] }[] = [
  { label: 'Sekitar saya', value: 'nearby' },
  { label: 'Area rawan', value: 'hazard' },
  { label: 'Kota lain', value: 'city' },
];

/** Design screen 13. */
export function FilterSheet({ visible, filter, matchCount, onChange, onReset, onClose }: Props) {
  const { colors } = useTheme();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(progress, {
      toValue: visible ? 1 : 0,
      useNativeDriver: Platform.OS !== 'web',
      damping: 22,
      stiffness: 220,
      mass: 0.9,
    }).start();
  }, [visible, progress]);

  const toggleStatus = (group: ReportStatus[]) => {
    const active = group.every((status) => filter.statuses.includes(status));
    const next = active
      ? filter.statuses.filter((status) => !group.includes(status))
      : [...new Set([...filter.statuses, ...group])];
    onChange({ statuses: next });
  };

  const toggleCategory = (id: ReportFilter['categories'][number]) => {
    const active = filter.categories.includes(id);
    onChange({
      categories: active ? filter.categories.filter((item) => item !== id) : [...filter.categories, id],
    });
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { backgroundColor: colors.ink, opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.32] }) }]}>
          <View style={StyleSheet.absoluteFill} onStartShouldSetResponder={() => true} onResponderRelease={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.paper,
              borderColor: colors.ink,
              transform: [
                {
                  translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [520, 0] }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.paper3 }]} />
          <View style={styles.header}>
            <AppText variant="h2">Filter laporan</AppText>
            <View style={styles.headerRight}>
              <AppChip label="Reset" size="small" tone="soft" onPress={onReset} />
              <IconButton icon="close" label="Tutup filter" onPress={onClose} />
            </View>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Section label="KATEGORI">
              {REPORT_CATEGORIES.map((category) => (
                <AppChip
                  key={category.id}
                  label={category.label}
                  size="small"
                  selected={filter.categories.includes(category.id)}
                  onPress={() => toggleCategory(category.id)}
                />
              ))}
            </Section>

            <Section label="STATUS">
              {STATUS_GROUPS.map((group) => (
                <AppChip
                  key={group.label}
                  label={group.label}
                  size="small"
                  selected={group.value.every((status) => filter.statuses.includes(status))}
                  onPress={() => toggleStatus(group.value)}
                />
              ))}
            </Section>

            <Section label="WAKTU">
              {WINDOWS.map((item) => (
                <AppChip
                  key={item.label}
                  label={item.label}
                  size="small"
                  selected={filter.windowDays === item.value}
                  onPress={() => onChange({ windowDays: item.value })}
                />
              ))}
            </Section>

            <Section label="AREA">
              {AREAS.map((item) => (
                <AppChip
                  key={item.value}
                  label={item.value === 'nearby' ? `Sekitar saya · ${formatDistance(filter.radiusKm * 1000)}` : item.label}
                  size="small"
                  selected={filter.area === item.value}
                  onPress={() => onChange({ area: item.value })}
                />
              ))}
            </Section>

            <Section label="RADIUS">
              {MAP_RADIUS_OPTIONS_KM.map((km) => (
                <AppChip
                  key={km}
                  label={formatDistance(km * 1000)}
                  size="small"
                  selected={filter.radiusKm === km}
                  onPress={() => onChange({ radiusKm: km })}
                />
              ))}
            </Section>
          </ScrollView>

          <View style={[styles.footer, { borderColor: colors.paper3 }]}>
            <AppText variant="bodySmall" color="ink2">
              {matchCount} laporan cocok
            </AppText>
            <AppText variant="meta" color="ink3">
              debounce {SEARCH_DEBOUNCE_MS} ms · distinctUntilChanged
            </AppText>
            <AppButton label="Terapkan filter" onPress={onClose} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="label" color="ink3">
        {label}
      </AppText>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    borderTopWidth: border.heavy,
    borderLeftWidth: border.heavy,
    borderRightWidth: border.heavy,
    borderTopLeftRadius: radius.card + 6,
    borderTopRightRadius: radius.card + 6,
    paddingTop: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    maxHeight: '86%',
  },
  grabber: { width: 44, height: 4, borderRadius: 2, alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.md,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  scroll: { flexGrow: 0 },
  scrollContent: { gap: space.lg, paddingBottom: space.md },
  section: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  footer: { borderTopWidth: 1.2, paddingTop: space.md, gap: space.xs },
});
