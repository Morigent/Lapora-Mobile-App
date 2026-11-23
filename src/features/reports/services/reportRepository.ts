import { STORAGE_KEYS } from '@/lib/constants';
import { readJson, writeJson } from '@/storage/jsonStore';
import { type Report, type ReportStatus } from '@/types/report';

/**
 * Offline-first repository. Same shapes the Supabase tables use, so the seam in
 * services/supabase can take over without touching screens.
 * Persistence is explicit: a report is only 'submitted' after write + read-back.
 */

const SEED_ANCHOR = new Date('2026-11-14T09:41:00+07:00').getTime();
const HOUR = 60 * 60 * 1000;

function seedReports(): Report[] {
  const base = { accuracyM: 6, locationConfirmed: true, isPublic: true, notifyOnStatus: true };
  const rows: Pick<Report, 'id' | 'code' | 'categoryId' | 'title' | 'description' | 'hazardLevel' | 'status' | 'point' | 'address' | 'capturedAt' | 'accuracyM'>[] = [
    {
      id: 'rpt-seed-1',
      code: 'LP-2411-0193',
      categoryId: 'pothole',
      title: 'Jalan berlubang di Jl. Kaliurang',
      description:
        'Lubang cukup lebar, sekitar 40 cm. Ada genangan air sehingga lubang sulit terlihat malam hari.',
      hazardLevel: 'medium',
      status: 'under_review',
      point: { latitude: -7.7938, longitude: 110.3701 },
      address: 'Jl. Kaliurang, Sleman',
      capturedAt: new Date(SEED_ANCHOR).toISOString(),
      accuracyM: 6,
    },
    {
      id: 'rpt-seed-2',
      code: 'LP-2411-0181',
      categoryId: 'streetlight',
      title: 'Lampu jalan mati di Jl. Affandi',
      description: 'Dua tiang lampu mati sejak tiga hari. Jalur pejalan kaki gelap setelah pukul 18.00.',
      hazardLevel: 'medium',
      status: 'submitted',
      point: { latitude: -7.7816, longitude: 110.3929 },
      address: 'Jl. Affandi, Sleman',
      capturedAt: new Date(SEED_ANCHOR - 40 * HOUR).toISOString(),
      accuracyM: 8,
    },
    {
      id: 'rpt-seed-3',
      code: 'LP-2411-0154',
      categoryId: 'sidewalk',
      title: 'Trotoar rusak di Jl. Gejayan',
      description: 'Paving trotoar amblas sekitar 1 meter. Pengguna kursi roda harus turun ke jalan.',
      hazardLevel: 'high',
      status: 'resolved',
      point: { latitude: -7.7763, longitude: 110.3861 },
      address: 'Jl. Gejayan, Sleman',
      capturedAt: new Date(SEED_ANCHOR - 150 * HOUR).toISOString(),
      accuracyM: 12,
    },
    {
      id: 'rpt-seed-4',
      code: 'LP-2411-0120',
      categoryId: 'drainage',
      title: 'Drainase tersumbat di Jl. Magelang',
      description: 'Saluran tersumbat sampah plastik. Air menggenang setiap hujan dan masuk ke halaman warga.',
      hazardLevel: 'medium',
      status: 'submitted',
      point: { latitude: -7.7854, longitude: 110.3589 },
      address: 'Jl. Magelang, Yogyakarta',
      capturedAt: new Date(SEED_ANCHOR - 290 * HOUR).toISOString(),
      accuracyM: 9,
    },
    {
      id: 'rpt-seed-5',
      code: 'LP-2411-0098',
      categoryId: 'public_facility',
      title: 'Fasilitas umum rusak di Jl. Malioboro',
      description: 'Bangku taman patah dan baut menonjol. Berbahaya untuk anak-anak yang bermain di sekitarnya.',
      hazardLevel: 'low',
      status: 'in_progress',
      point: { latitude: -7.7926, longitude: 110.3657 },
      address: 'Jl. Malioboro, Yogyakarta',
      capturedAt: new Date(SEED_ANCHOR - 400 * HOUR).toISOString(),
      accuracyM: 5,
    },
  ];

  return rows.map((row) => ({
    ...base,
    ...row,
    authorId: 'seed-warga',
    authorName: 'Rani',
    locationMeasuredAt: row.capturedAt,
    photoPath: '',
    createdAt: row.capturedAt,
    updatedAt: row.capturedAt,
  }));
}

async function readAll(): Promise<Report[]> {
  const stored = await readJson<Report[] | null>(STORAGE_KEYS.reports, null);
  if (stored && stored.length > 0) return stored;
  const seeded = seedReports();
  await writeJson(STORAGE_KEYS.reports, seeded);
  return seeded;
}

export async function listReports(): Promise<Report[]> {
  return readAll();
}

export async function listReportsForAuthor(authorId: string): Promise<Report[]> {
  const all = await readAll();
  return all.filter((report) => report.authorId === authorId || report.authorId.startsWith('seed-'));
}

export async function getReport(id: string): Promise<Report | null> {
  const all = await readAll();
  return all.find((report) => report.id === id) ?? null;
}

/** Write + read-back. Returns the confirmed row or throws; callers must not assume success. */
export async function persistReport(report: Report): Promise<Report> {
  const all = await readAll();
  const next = all.some((row) => row.id === report.id)
    ? all.map((row) => (row.id === report.id ? report : row))
    : [report, ...all];
  await writeJson(STORAGE_KEYS.reports, next);

  const confirmed = await readJson<Report[]>(STORAGE_KEYS.reports, []).then((rows) =>
    rows.find((row) => row.id === report.id),
  );
  if (!confirmed || confirmed.status !== report.status) {
    throw new Error('Penyimpanan laporan tidak terkonfirmasi.');
  }
  return confirmed;
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  note?: string,
): Promise<Report> {
  const existing = await getReport(id);
  if (!existing) throw new Error('Laporan tidak ditemukan di perangkat.');
  const updated: Report = { ...existing, status, updatedAt: new Date().toISOString() };
  await persistReport(updated);
  await appendStatusHistory(id, status, note);
  return updated;
}

export async function appendStatusHistory(id: string, status: ReportStatus, note?: string): Promise<void> {
  const rows = await readJson<{ id: string; status: ReportStatus; at: string; note?: string }[]>(
    STORAGE_KEYS.history,
    [],
  );
  const next = [...rows, { id, status, at: new Date().toISOString(), note }];
  await writeJson(STORAGE_KEYS.history, next.slice(-200));
}

export async function getStatusHistory(id: string) {
  const rows = await readJson<{ id: string; status: ReportStatus; at: string; note?: string }[]>(
    STORAGE_KEYS.history,
    [],
  );
  return rows.filter((row) => row.id === id);
}
