import * as Crypto from 'expo-crypto';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import { titleForCategory, validateCaptureSession } from '@/features/camera/services/evidenceGate';
import { listHazardZones } from '@/features/hazards/services/hazardService';
import { STORAGE_KEYS, UPLOAD_MAX_ATTEMPTS } from '@/lib/constants';
import { getSupabase, isRemoteConfigured, MEDIA_BUCKET } from '@/services/supabase/client';
import { readJson, writeJson } from '@/storage/jsonStore';
import { deleteStoredPhoto, photoExists } from '@/storage/photoStorage';
import {
  type CaptureSession,
  type GeoPoint,
  type HazardLevel,
  type Report,
  type ReportCategoryId,
  type ReportDraft,
  type ReportFilter,
  type UserProfile,
} from '@/types/report';
import { haversineMeters } from '@/utils/geo';

import { appendStatusHistory, getReport, listReports, persistReport } from './reportRepository';

export type SubmitErrorCode = 'gate' | 'offline' | 'upload' | 'photo_missing';

export type SubmitError = { code: SubmitErrorCode; message: string; attempts: number; detail?: string };

export type SubmitProgress = {
  percent: number;
  step: 'photo' | 'location' | 'upload';
  message: string;
};

export type SubmitInput = {
  profile: UserProfile;
  session: CaptureSession;
  categoryId: ReportCategoryId;
  description: string;
  hazardLevel: HazardLevel;
  isPublic: boolean;
  notifyOnStatus: boolean;
  address: string | null;
};

export type SubmitResult = { ok: true; report: Report } | { ok: false; error: SubmitError };

function newReportCode(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const serial = String(Math.floor(1000 + Math.random() * 9000));
  return `LP-${year}${month}-${serial}`;
}

async function uploadPhoto(path: string, reportId: string): Promise<{ storagePath: string; bytes: number }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Backend belum dikonfigurasi.');
  const bytes =
    Platform.OS === 'web'
      ? new Uint8Array(await (await fetch(path)).arrayBuffer())
      : await new File(path).bytes();
  const storagePath = `${reportId}/evidence.jpg`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, bytes, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return { storagePath, bytes: bytes.byteLength };
}

/**
 * Upload then persist. `submitted` is only returned once the row is confirmed by
 * a read-back; any other outcome surfaces as an explicit failure (screens 19/19b).
 */
export async function submitReport(
  input: SubmitInput,
  onProgress?: (progress: SubmitProgress) => void,
): Promise<SubmitResult> {
  const gate = validateCaptureSession(input.session);
  if (gate) return { ok: false, error: { code: 'gate', message: gate.message, attempts: 0 } };

  if (Platform.OS !== 'web' && !photoExists(input.session.photoUri)) {
    return {
      ok: false,
      error: {
        code: 'photo_missing',
        message: 'File foto tidak ditemukan. Ambil ulang foto lewat kamera aplikasi.',
        attempts: 0,
      },
    };
  }

  const now = new Date();
  const report: Report = {
    id: Crypto.randomUUID(),
    code: newReportCode(now),
    authorId: input.profile.id,
    authorName: input.profile.name,
    categoryId: input.categoryId,
    title: titleForCategory(input.categoryId, input.address),
    description: input.description.trim(),
    hazardLevel: input.hazardLevel,
    status: 'submitted',
    point: input.session.metadata.point,
    accuracyM: input.session.metadata.accuracyM,
    locationMeasuredAt: input.session.metadata.locationMeasuredAt,
    capturedAt: input.session.metadata.capturedAt,
    locationConfirmed: true,
    address: input.address,
    photoPath: input.session.photoUri,
    isPublic: input.isPublic,
    notifyOnStatus: input.notifyOnStatus,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  onProgress?.({ percent: 12, step: 'photo', message: 'Menyiapkan foto & metadata' });
  onProgress?.({ percent: 28, step: 'location', message: 'Lokasi terkonfirmasi' });

  let attempts = 0;
  let detail = '';

  while (attempts < UPLOAD_MAX_ATTEMPTS) {
    attempts += 1;
    try {
      onProgress?.({
        percent: Math.min(92, 28 + attempts * 22),
        step: 'upload',
        message: isRemoteConfigured ? 'Mengunggah ke server' : 'Menyimpan di perangkat',
      });

      if (isRemoteConfigured) {
        const supabase = getSupabase();
        if (!supabase) throw new Error('Backend belum dikonfigurasi.');
        const uploaded = await uploadPhoto(report.photoPath, report.id);
        const { error: reportError } = await supabase.from('reports').insert({
          id: report.id,
          user_id: report.authorId,
          category_id: report.categoryId,
          description: report.description,
          latitude: report.point.latitude,
          longitude: report.point.longitude,
          location_accuracy: Math.round(report.accuracyM ?? 0),
          captured_at: report.capturedAt,
          location_measured_at: report.locationMeasuredAt,
          location_confirmed: true,
          location_confirmed_at: now.toISOString(),
          status: 'submitted',
          created_at: report.createdAt,
        });
        if (reportError) throw new Error(reportError.message);
        const { error: mediaError } = await supabase.from('report_media').insert({
          id: Crypto.randomUUID(),
          report_id: report.id,
          storage_path: uploaded.storagePath,
          mime_type: 'image/jpeg',
          file_size: uploaded.bytes,
          captured_at: report.capturedAt,
        });
        if (mediaError) throw new Error(mediaError.message);
        report.photoPath = uploaded.storagePath;
      }

      await persistReport(report);
      await appendStatusHistory(report.id, 'submitted', 'Tersimpan setelah verifikasi tulis-baca lokal.');
      onProgress?.({ percent: 100, step: 'upload', message: 'Laporan tersimpan' });
      return { ok: true, report };
    } catch (error) {
      detail = error instanceof Error ? error.message : 'Kesalahan tidak dikenal';
      if (attempts < UPLOAD_MAX_ATTEMPTS) {
        const { promise, resolve } = Promise.withResolvers<void>();
        setTimeout(resolve, 700 * attempts);
        await promise;
      }
    }
  }

  const offline = /network|fetch|timeout/i.test(detail);
  return {
    ok: false,
    error: {
      code: offline ? 'offline' : 'upload',
      message: offline
        ? 'Tidak ada koneksi. Laporan disimpan sebagai draf di perangkat.'
        : 'Server menolak unggahan. Foto dan metadata masih tersimpan di perangkat.',
      attempts,
      detail,
    },
  };
}

export async function saveDraft(draft: ReportDraft): Promise<void> {
  await writeJson(STORAGE_KEYS.draft, draft);
}

export async function readDraft(): Promise<ReportDraft | null> {
  return readJson<ReportDraft | null>(STORAGE_KEYS.draft, null);
}

export async function clearDraft(): Promise<void> {
  const draft = await readDraft();
  if (draft) await deleteStoredPhoto(draft.session.photoUri);
  await writeJson(STORAGE_KEYS.draft, null);
}

/** Drops the draft record but keeps its photo — the photo now belongs to a sent report. */
export async function dismissDraft(): Promise<void> {
  await writeJson(STORAGE_KEYS.draft, null);
}

/**
 * One query path for map + history. Called from an RxJS pipeline
 * (debounceTime → distinctUntilChanged → switchMap), never directly from input.
 */
export async function searchReports(
  filter: ReportFilter,
  anchor: GeoPoint | null,
  viewerId: string | null = null,
): Promise<Report[]> {
  const rows = await listReports();
  const query = filter.query.trim().toLowerCase();
  const zones = filter.area === 'hazard' ? await listHazardZones() : [];
  const now = Date.now();

  const matched = rows.filter((report) => {
    if (report.status === 'draft') return false;
    // NFR-05: a report the author kept private never reaches another account.
    if (!report.isPublic && report.authorId !== viewerId) return false;
    if (query) {
      const haystack = `${report.title} ${report.address ?? ''} ${report.code} ${report.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filter.categories.length > 0 && !filter.categories.includes(report.categoryId)) return false;
    if (filter.statuses.length > 0 && !filter.statuses.includes(report.status)) return false;
    if (filter.windowDays != null) {
      const ageDays = (now - new Date(report.capturedAt).getTime()) / 86_400_000;
      if (ageDays > filter.windowDays) return false;
    }
    if (filter.area === 'nearby' && anchor) {
      if (haversineMeters(anchor, report.point) > filter.radiusKm * 1000) return false;
    }
    if (filter.area === 'hazard') {
      if (!zones.some((zone) => haversineMeters(report.point, zone.center) <= zone.radiusM)) return false;
    }
    return true;
  });

  return matched.sort((a, b) => {
    const aApprox = anchor ? haversineMeters(anchor, a.point) : 0;
    const bApprox = anchor ? haversineMeters(anchor, b.point) : 0;
    return aApprox - bApprox || new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime();
  });
}

export async function loadReportDetail(id: string, viewerId: string | null = null): Promise<Report | null> {
  const report = await getReport(id);
  // Same rule as the list query: a private report is not readable by others,
  // so a hand-typed id cannot bypass the map filter.
  if (!report || (!report.isPublic && report.authorId !== viewerId)) return null;
  return report;
}
export async function distanceToReport(report: Report, anchor: GeoPoint | null): Promise<number | null> {
  return anchor ? haversineMeters(anchor, report.point) : null;
}
