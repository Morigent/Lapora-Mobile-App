import { create } from 'zustand';

import {
  clearDraft,
  dismissDraft,
  readDraft,
  saveDraft,
  submitReport,
  type SubmitError,
  type SubmitInput,
  type SubmitProgress,
  type SubmitResult,
} from '@/features/reports/services/reportService';
import { type Report, type ReportDraft, type UserProfile } from '@/types/report';

type Phase = 'idle' | 'uploading' | 'failed' | 'success';

type ReportState = {
  phase: Phase;
  progress: SubmitProgress;
  error: SubmitError | null;
  /** Wall-clock of the last failed attempt, stamped when the attempt failed. */
  attemptedAt: number | null;
  report: Report | null;
  input: SubmitInput | null;
  draft: ReportDraft | null;
  submit: (input: SubmitInput) => Promise<SubmitResult>;
  retry: () => Promise<SubmitResult | null>;
  saveCurrentAsDraft: () => Promise<void>;
  resumeDraft: (profile: UserProfile) => Promise<boolean>;
  loadDraft: () => Promise<void>;
  discardDraft: () => Promise<void>;
  reset: () => void;
};

const IDLE_PROGRESS: SubmitProgress = { percent: 0, step: 'photo', message: 'Menyiapkan' };

export const useReportStore = create<ReportState>((set, get) => ({
  phase: 'idle',
  progress: IDLE_PROGRESS,
  error: null,
  attemptedAt: null,
  report: null,
  input: null,
  draft: null,

  async submit(input) {
    set({ phase: 'uploading', progress: IDLE_PROGRESS, error: null, report: null, input });
    const result = await submitReport(input, (progress) => set({ progress }));
    if (result.ok) {
      if (get().draft) {
        await dismissDraft();
      }
      set({
        phase: 'success',
        progress: { percent: 100, step: 'upload', message: 'Laporan tersimpan' },
        report: result.report,
        draft: null,
      });
    } else {
      set({ phase: 'failed', error: result.error, attemptedAt: Date.now() });
    }
    return result;
  },

  async retry() {
    const input = get().input;
    if (!input) return null;
    return get().submit(input);
  },

  async saveCurrentAsDraft() {
    const input = get().input;
    if (!input) return;
    const draft: ReportDraft = {
      session: input.session,
      categoryId: input.categoryId,
      description: input.description,
      hazardLevel: input.hazardLevel,
      isPublic: input.isPublic,
      notifyOnStatus: input.notifyOnStatus,
      address: input.address,
      savedAt: new Date().toISOString(),
    };
    await saveDraft(draft);
    set({ draft });
  },

  async resumeDraft(profile) {
    const draft = await readDraft();
    set({ draft });
    if (!draft) return false;
    set({
      input: {
        profile,
        session: draft.session,
        categoryId: draft.categoryId,
        description: draft.description,
        hazardLevel: draft.hazardLevel,
        isPublic: draft.isPublic,
        notifyOnStatus: draft.notifyOnStatus,
        address: draft.address ?? null,
      },
    });
    return true;
  },
  async loadDraft() {
    const draft = await readDraft();
    set({ draft });
  },

  async discardDraft() {
    await clearDraft();
    set({ draft: null });
  },

  reset() {
    set({ phase: 'idle', progress: IDLE_PROGRESS, error: null, attemptedAt: null, report: null, input: null });
  },
}));
