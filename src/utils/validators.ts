import { DESCRIPTION_MAX, DESCRIPTION_MIN } from '@/lib/constants';

export type FieldErrors = Record<string, string | null>;

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Email wajib diisi';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return 'Format email belum benar';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Kata sandi wajib diisi';
  if (value.length < 8) return 'Minimal 8 karakter';
  return null;
}

/** Indonesian mobile numbers: 08xx, +628xx, 628xx. */
export function validatePhone(value: string): string | null {
  const digits = value.replace(/[^\d+]/g, '');
  if (!digits) return 'Nomor telepon wajib diisi';
  if (!/^(\+62|62|0)8\d{7,12}$/.test(digits)) return 'Nomor belum lengkap';
  return null;
}

export function validateName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Nama wajib diisi';
  if (trimmed.length < 3) return 'Nama terlalu pendek';
  return null;
}

export function validateDescription(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Deskripsi wajib diisi';
  if (trimmed.length < DESCRIPTION_MIN) return `Tulis minimal ${DESCRIPTION_MIN} karakter`;
  if (trimmed.length > DESCRIPTION_MAX) return `Maksimal ${DESCRIPTION_MAX} karakter`;
  return null;
}

export function firstError(errors: FieldErrors): string | null {
  for (const message of Object.values(errors)) {
    if (message) return message;
  }
  return null;
}
