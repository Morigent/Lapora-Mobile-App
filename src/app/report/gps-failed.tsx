import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { StatusBadge } from '@/components/common/StatusBadge';
import { border, radius, space } from '@/constants/design';
import { describeLocationFailure } from '@/features/location/services/locationFailureCopy';
import { useTheme } from '@/hooks/use-theme';
import { useCameraStore } from '@/stores/cameraStore';
import { formatDate } from '@/utils/date';

/** Design screen 21 — GPS failure inside the capture flow. */
export default function GpsFailedScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const failure = useCameraStore((state) => state.locationFailure);
  const copy = describeLocationFailure(failure);
  // Frozen at mount: rendering must stay pure, and this card reports when the
  // failure was recorded, not the wall clock of every re-render.
  const [recordedAt] = useState(() => Date.now());
  const needsSettings = copy.action === 'settings';

  return (
    <Screen bottomInset contentStyle={styles.content}>
      <View style={styles.heading}>
        <View style={[styles.mark, { borderColor: colors.accent }]}>
          <Icon name="signal" size={28} color={colors.accent} />
        </View>
        <AppText variant="display">Lokasi tidak tersedia</AppText>
        <AppText variant="h3" color="ink2">
          {copy.heading}
        </AppText>
        <AppText variant="body" color="ink2">
          {copy.body}
        </AppText>
      </View>

      <AppCard padding={16} background={colors.paper2} shadow={false}>
        {copy.rows.map((row) => (
          <Row key={row.label} label={row.label} value={row.value} />
        ))}
        <View style={[styles.divider, { backgroundColor: colors.paper3 }]} />
        <AppText variant="meta" color="ink3">
          DICATAT {formatDate(recordedAt).toUpperCase()}
        </AppText>
      </AppCard>

      <View style={styles.section}>
        <AppText variant="label" color="ink3">
          TIPS
        </AppText>
        {copy.tips.map((tip, index) => (
          <View key={tip} style={styles.tipRow}>
            <View style={[styles.tipIndex, { borderColor: colors.ink }]}>
              <AppText variant="meta" color="ink">
                {index + 1}
              </AppText>
            </View>
            <AppText variant="bodySmall" color="ink2" style={styles.tipText}>
              {tip}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <AppButton
          label={copy.actionLabel}
          icon="refresh"
          onPress={() => {
            if (needsSettings) Linking.openSettings();
            else router.replace('/report/camera');
          }}
        />
        <AppButton label="Batalkan laporan" variant="ghost" size="small" onPress={() => router.replace('/(tabs)/home')} />
        <View style={styles.badgeRow}>
          <StatusBadge status="draft" compact showIcon />
          <AppText variant="meta" color="ink3">
            Tidak ada laporan yang dibuat dari layar ini.
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="bodySmall" color="ink3">
        {label}
      </AppText>
      <AppText variant="bodySmall" weight="600">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.lg, paddingTop: space.xl },
  heading: { gap: space.sm },
  mark: {
    width: 60,
    height: 60,
    borderRadius: radius.card,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  divider: { height: 1, marginVertical: space.sm },
  section: { gap: space.sm },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  tipIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: { flex: 1 },
  actions: { gap: space.sm, marginTop: space.sm },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, justifyContent: 'center' },
});
