import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { HandNote } from '@/components/common/HandNote';
import { Icon } from '@/components/common/Icon';
import { Screen } from '@/components/common/Screen';
import { border, radius, space } from '@/constants/design';
import { CATEGORY_LABEL } from '@/constants/reportMeta';
import { useTheme } from '@/hooks/use-theme';
import { UPLOAD_MAX_ATTEMPTS } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useCameraStore } from '@/stores/cameraStore';
import { useReportStore } from '@/stores/reportStore';
import { formatBytes } from '@/utils/bytes';
import { formatShortStamp, formatTime } from '@/utils/date';

/** Design screens 19 / 19b — failure is explicit, never a fake success. */
export default function FailedScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const error = useReportStore((state) => state.error);
  const input = useReportStore((state) => state.input);
  const draft = useReportStore((state) => state.draft);
  const retry = useReportStore((state) => state.retry);
  const attemptedAt = useReportStore((state) => state.attemptedAt);
  const resumeDraft = useReportStore((state) => state.resumeDraft);
  const saveCurrentAsDraft = useReportStore((state) => state.saveCurrentAsDraft);
  const discardDraft = useReportStore((state) => state.discardDraft);
  const resetReport = useReportStore((state) => state.reset);
  const profile = useAuthStore((state) => state.profile);
  const resetCamera = useCameraStore((state) => state.reset);
  const [saved, setSaved] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [missing, setMissing] = useState(false);

  // Opening this screen from the "Draf menunggu dikirim" card must rehydrate the
  // stored draft; without input there is nothing to retry.
  useEffect(() => {
    if (input || !profile) return;
    resumeDraft(profile).then((found) => {
      if (!found) setMissing(true);
    });
  }, [input, profile, resumeDraft]);

  const offline = error?.code === 'offline';
  const attempts = error?.attempts ?? 0;
  const bytes = input?.session.photoBytes ?? 0;
  const draftOnly = !error && draft != null;
  const hasDraft = saved || draft != null;

  const tryAgain = async () => {
    setRetrying(true);
    const result = await retry();
    setRetrying(false);
    if (result?.ok) {
      resetCamera();
      router.replace('/report/success');
    }
  };

  const discard = async () => {
    await discardDraft();
    resetReport();
    resetCamera();
    router.replace('/(tabs)/home');
  };

  if (missing) {
    return (
      <Screen scroll={false} contentStyle={styles.content}>
        <AppText variant="h2">Draf tidak ditemukan</AppText>
        <AppText variant="body" color="ink2">
          Draf mungkin sudah dikirim atau dihapus. Buat laporan baru dari kamera aplikasi.
        </AppText>
        <AppButton label="Kembali ke beranda" onPress={() => router.replace('/(tabs)/home')} />
      </Screen>
    );
  }

  const categoryLabel = input ? CATEGORY_LABEL[input.categoryId] ?? 'Laporan' : 'Laporan';
  const savedAt = draft?.savedAt ?? null;
  const heading = draftOnly ? 'Draf belum terkirim' : offline ? 'Laporan belum terkirim' : 'Gagal mengirim';
  const subheading = draftOnly ? 'Draf tersimpan' : offline ? 'Tidak ada koneksi' : 'Upload gagal';
  const explanation = draftOnly
    ? 'Foto dan metadata draf ini masih di perangkat. Kirim ulang saat kamu siap.'
    : offline
      ? 'Laporan disimpan sebagai draf di perangkat. Kirim ulang saat internet kembali.'
      : error?.message ?? 'Foto dan metadata masih tersimpan di perangkat.';

  return (
    <Screen bottomInset contentStyle={styles.content}>
      <View style={styles.heading}>
        <View style={[styles.mark, { borderColor: colors.accent }]}>
          <Icon name={draftOnly ? 'upload' : offline ? 'wifi_off' : 'alert'} size={30} color={colors.accent} />
        </View>
        <AppText variant="display">{heading}</AppText>
        <AppText variant="h3" color={draftOnly || offline ? 'ink2' : 'accent'}>
          {subheading}
        </AppText>
        <AppText variant="body" color="ink2">
          {explanation}
        </AppText>
      </View>

      <AppCard padding={16} background={colors.paper2} shadow={false}>
        <View style={styles.row}>
          <AppText variant="bodySmall" color="ink3">
            Laporan
          </AppText>
          <AppText variant="bodySmall" weight="600" numberOfLines={1} style={styles.rowValue}>
            {categoryLabel}
          </AppText>
        </View>
        <View style={styles.row}>
          <AppText variant="bodySmall" color="ink3">
            Ukuran foto
          </AppText>
          <AppText variant="bodySmall" weight="600">
            {formatBytes(bytes)}
          </AppText>
        </View>
        {draftOnly ? null : (
          <>
            <View style={styles.row}>
              <AppText variant="bodySmall" color="ink3">
                Percobaan
              </AppText>
              <AppText variant="bodySmall" weight="600">
                {attempts || 0} dari {UPLOAD_MAX_ATTEMPTS}
              </AppText>
            </View>
            <View style={styles.row}>
              <AppText variant="bodySmall" color="ink3">
                Terakhir dicoba
              </AppText>
              <AppText variant="bodySmall" weight="600">
                {attemptedAt ? formatTime(attemptedAt) : '—'}
              </AppText>
            </View>
          </>
        )}
        {input ? (
          <>
            <View style={[styles.divider, { backgroundColor: colors.paper3 }]} />
            <AppText variant="meta" color="ink3">
              {formatShortStamp(input.session.metadata.capturedAt)} · METADATA UTUH DI PERANGKAT
              {savedAt ? ` · DRAF ${formatShortStamp(savedAt)}` : ''}
            </AppText>
          </>
        ) : null}
      </AppCard>

      {hasDraft ? (
        <View style={[styles.savedNote, { borderColor: colors.ink }]}>
          <Icon name="lock" size={14} color={colors.ink} />
          <AppText variant="bodySmall" color="ink2" style={styles.savedText}>
            Draf tersimpan. Foto dan metadata tetap ada walau aplikasi ditutup.
          </AppText>
        </View>
      ) : (
        <HandNote size={16} color={colors.ink3}>
          status tetap error sampai penyimpanan dikonfirmasi backend
        </HandNote>
      )}

      <View style={styles.actions}>
        <AppButton
          label={draftOnly ? 'Kirim ulang draf' : 'Coba Lagi'}
          icon="refresh"
          loading={retrying}
          onPress={tryAgain}
        />
        {!hasDraft ? (
          <AppButton
            label="Simpan sebagai draf"
            variant="outline"
            icon="upload"
            onPress={async () => {
              await saveCurrentAsDraft();
              setSaved(true);
            }}
          />
        ) : null}
        <AppButton
          label={hasDraft ? 'Batalkan & hapus draf' : 'Batalkan laporan'}
          variant="ghost"
          size="small"
          onPress={discard}
        />
        <AppText variant="meta" color="ink3" align="center">
          Menghapus draf menghilangkan foto dan metadata secara permanen.
        </AppText>
      </View>
    </Screen>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md, paddingVertical: 4 },
  rowValue: { flex: 1, textAlign: 'right' },
  divider: { height: 1, marginVertical: space.sm },
  savedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1.4,
    borderRadius: radius.input,
    padding: space.md,
  },
  savedText: { flex: 1 },
  actions: { gap: space.sm, marginTop: space.sm },
});
