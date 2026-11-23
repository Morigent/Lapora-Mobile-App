import { type HazardLevel, type ReportCategory, type ReportStatus } from '@/types/report';

import { type IconName } from '@/components/common/Icon';

export const REPORT_CATEGORIES: ReportCategory[] = [
  { id: 'pothole', label: 'Jalan berlubang', icon: 'target' },
  { id: 'streetlight', label: 'Lampu jalan', icon: 'bolt' },
  { id: 'sidewalk', label: 'Trotoar', icon: 'grid' },
  { id: 'drainage', label: 'Drainase', icon: 'refresh' },
  { id: 'public_facility', label: 'Fasilitas umum', icon: 'shield' },
];

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  REPORT_CATEGORIES.map((category) => [category.id, category.label]),
);

export const STATUS_META: Record<
  ReportStatus,
  { label: string; short: string; icon: IconName; description: string }
> = {
  draft: {
    label: 'Draf',
    short: 'Draf',
    icon: 'list',
    description: 'Belum dikirim. Tersimpan di perangkat.',
  },
  submitted: {
    label: 'Terkirim',
    short: 'Terkirim',
    icon: 'upload',
    description: 'Diterima sistem. Menunggu verifikasi tim.',
  },
  under_review: {
    label: 'Diverifikasi',
    short: 'Diverifikasi',
    icon: 'shield',
    description: 'Sudah diperiksa tim lapangan.',
  },
  in_progress: {
    label: 'Ditangani',
    short: 'Ditangani',
    icon: 'bolt',
    description: 'Perbaikan sedang berjalan.',
  },
  resolved: {
    label: 'Selesai',
    short: 'Selesai',
    icon: 'check',
    description: 'Perbaikan selesai.',
  },
  rejected: {
    label: 'Ditolak',
    short: 'Ditolak',
    icon: 'close',
    description: 'Laporan tidak dapat diproses. Lihat catatan tim.',
  },
};

export const HAZARD_META: Record<HazardLevel, { label: string; dots: number }> = {
  low: { label: 'Rendah', dots: 1 },
  medium: { label: 'Sedang', dots: 2 },
  high: { label: 'Tinggi', dots: 3 },
};

/** Categories that count as active hazards on the Home hazard strip. */
export const STATUS_FILTERS: ReportStatus[] = [
  'submitted',
  'under_review',
  'in_progress',
  'resolved',
  'rejected',
  'draft',
];
