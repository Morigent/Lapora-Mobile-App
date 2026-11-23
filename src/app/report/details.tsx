import { useIsFocused, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Icon } from '@/components/common/Icon';
import { IconButton } from '@/components/common/IconButton';
import { Screen } from '@/components/common/Screen';
import { TextField } from '@/components/common/TextField';
import { Toggle } from '@/components/common/Toggle';
import { CategoryPicker, SeverityPicker } from '@/components/report/ReportPickers';
import { border, radius, space } from '@/constants/design';
import { discardSession } from '@/features/camera/services/discardSession';
import { titleForCategory } from '@/features/camera/services/evidenceGate';
import { reverseGeocode } from '@/features/location/services/locationService';
import { useTheme } from '@/hooks/use-theme';
import { DESCRIPTION_MAX, DESCRIPTION_MIN } from '@/lib/constants';
import { isRemoteConfigured } from '@/services/supabase/client';
import { deleteStoredPhoto } from '@/storage/photoStorage';
import { useAuthStore } from '@/stores/authStore';
import { useCameraStore } from '@/stores/cameraStore';
import { type HazardLevel, type ReportCategoryId } from '@/types/report';
import { formatCoordinates, formatShortStamp } from '@/utils/date';
import { formatAccuracy } from '@/utils/geo';
import { validateDescription } from '@/utils/validators';

/** Design screen 09 — form around already-locked evidence. */
export default function DetailsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const focused = useIsFocused();
  const session = useCameraStore((state) => state.session);
  const reset = useCameraStore((state) => state.reset);
  const profile = useAuthStore((state) => state.profile);
  const [categoryId, setCategoryId] = useState<ReportCategoryId | null>(null);
  const [description, setDescription] = useState('');
  const [hazardLevel, setHazardLevel] = useState<HazardLevel>('medium');
  const [isPublic, setIsPublic] = useState(profile?.isPublic ?? true);
  const [notifyOnStatus, setNotifyOnStatus] = useState(profile?.notifyOnStatus ?? false);
  const [address, setAddress] = useState<string | null>(null);
  const [addressResolved, setAddressResolved] = useState(false);
  const [errors, setErrors] = useState<{ category?: string | null; description?: string | null }>({});

  useEffect(() => {
    if (!session) return;
    (async () => {
      const found = await reverseGeocode(session.metadata.point);
      setAddress(found);
      setAddressResolved(true);
    })();
  }, [session]);

  useEffect(() => {
    if (!session && focused) router.replace('/report/camera');
  }, [session, focused, router]);

  if (!session) return null;

  const submit = () => {
    const categoryError = categoryId ? null : 'Pilih satu kategori kerusakan.';
    const descriptionError = validateDescription(description);
    setErrors({ category: categoryError, description: descriptionError });
    if (categoryError || descriptionError || !categoryId) return;
    router.push('/report/uploading');
  };

  const cancel = async () => {
    await discardSession({ session, reset, deletePhoto: deleteStoredPhoto });
    router.replace('/(tabs)/home');
  };

  return (
    <>
      <Screen bottomInset contentStyle={styles.content}>
        <View style={styles.head}>
          <IconButton icon="close" label="Batalkan laporan" onPress={cancel} />
          <View style={styles.headText}>
            <AppText variant="h2">Detail laporan</AppText>
            <AppText variant="meta" color="ink3">
              LANGKAH 2 DARI 2
            </AppText>
          </View>
          <View style={styles.headSpacer} />
        </View>

        <AppCard padding={12} background={colors.paper2} shadow={false}>
          <View style={styles.evidenceRow}>
            <View style={[styles.lockIcon, { borderColor: colors.ink }]}>
              <Icon name="lock" size={15} color={colors.ink} />
            </View>
            <View style={styles.evidenceText}>
              <AppText variant="meta" color="ink3">
                BUKTI · TERKUNCI
              </AppText>
              <AppText variant="bodySmall" weight="600" numberOfLines={1}>
                {formatCoordinates(session.metadata.point.latitude, session.metadata.point.longitude)}
              </AppText>
              <AppText variant="meta" color="ink3">
                {formatShortStamp(session.metadata.locationMeasuredAt)} · {formatAccuracy(session.metadata.accuracyM)}
              </AppText>
            </View>
            <AppText variant="meta" color="ink3" numberOfLines={1} style={styles.evidenceAddress}>
              {address ?? (addressResolved ? 'Alamat tidak tersedia' : 'Alamat dicari…')}
            </AppText>
          </View>
        </AppCard>

        <CategoryPicker value={categoryId} onChange={setCategoryId} error={errors.category} />

        <View style={styles.field}>
          <TextField
            label="DESKRIPSI"
            value={description}
            onChangeText={(value) => {
              setDescription(value);
              setErrors((current) => ({ ...current, description: null }));
            }}
            placeholder="Lubang cukup lebar, sekitar 40 cm. Ada genangan air di sekitarnya sehingga lubang sulit terlihat malam hari."
            multiline
            maxLength={DESCRIPTION_MAX}
            hint={`Wajib ${DESCRIPTION_MIN}–${DESCRIPTION_MAX} karakter. Jelaskan ukuran, posisi, dan dampaknya.`}
            error={errors.description ?? undefined}
          />
        </View>

        <SeverityPicker value={hazardLevel} onChange={setHazardLevel} />

        <AppCard padding={0} shadow={false}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <AppText variant="bodySmall" weight="600">
                Tampilkan di peta publik
              </AppText>
              <AppText variant="bodySmall" color="ink3">
                {isPublic
                  ? 'Terlihat di peta publik. Nama lengkap tidak ditampilkan.'
                  : 'Hanya terlihat olehmu. Nama lengkap tidak ditampilkan.'}
              </AppText>
            </View>
            <Toggle value={isPublic} onChange={setIsPublic} label="Tampilkan di peta publik" />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.paper3 }]} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <AppText variant="bodySmall" weight="600">
                Notifikasi perubahan status
              </AppText>
              <AppText variant="bodySmall" color="ink3">
                {isRemoteConfigured
                  ? 'Dikirim saat laporan diverifikasi.'
                  : 'Backend belum tersambung — perubahan status hanya terlihat di aplikasi ini.'}
              </AppText>
            </View>
            <Toggle value={notifyOnStatus} onChange={setNotifyOnStatus} label="Notifikasi perubahan status" />
          </View>
        </AppCard>

        <View style={[styles.note, { borderColor: colors.paper3 }]}>
          <Icon name="info" size={14} color={colors.ink3} />
          <AppText variant="bodySmall" color="ink3" style={styles.noteText}>
            Status awal otomatis: Terkirim. Bukan peringatan resmi.
          </AppText>
        </View>

        <AppButton
          label="Kirim Laporan"
          iconRight="arrow"
          onPress={() => {
            if (!categoryId) {
              submit();
              return;
            }
            const title = titleForCategory(categoryId, address);
            router.push({
              pathname: '/report/uploading',
              params: {
                categoryId,
                description: description.trim(),
                hazardLevel,
                isPublic: String(isPublic),
                notifyOnStatus: String(notifyOnStatus),
                address: address ?? '',
                title,
              },
            });
          }}
        />
        <AppText variant="meta" color="ink3" align="center">
          Lokasi & waktu sudah dikonfirmasi.
        </AppText>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.lg, paddingTop: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headText: { alignItems: 'center', gap: 2, flex: 1 },
  headSpacer: { width: 44 },
  evidenceRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  lockIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.tile - 6,
    borderWidth: border.heavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceText: { flex: 1, gap: 1 },
  evidenceAddress: { maxWidth: '32%' },
  field: { gap: space.sm },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  toggleText: { flex: 1, gap: 2 },
  divider: { height: 1, marginHorizontal: space.lg },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.2,
    borderRadius: radius.input,
    padding: space.md,
  },
  noteText: { flex: 1 },
});
