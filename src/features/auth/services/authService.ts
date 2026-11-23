import * as Crypto from 'expo-crypto';

import { STORAGE_KEYS } from '@/lib/constants';
import { readJson, writeJson } from '@/storage/jsonStore';
import { deleteSecret, getSecret, setSecret } from '@/storage/secureStorage';
import { type UserProfile } from '@/types/report';

export type AuthError = { code: 'email_taken' | 'invalid_credentials' | 'validation' | 'storage'; message: string };

export type AuthResult = { ok: true; profile: UserProfile } | { ok: false; error: AuthError };

type StoredAccount = {
  profile: UserProfile;
  salt: string;
  passwordHash: string;
  createdAt: string;
};

type SessionToken = { token: string; userId: string; createdAt: string };

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

async function readAccounts(): Promise<StoredAccount[]> {
  return readJson<StoredAccount[]>(STORAGE_KEYS.accounts, []);
}

export async function registerAccount(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  isPublic: boolean;
  notifyOnStatus: boolean;
}): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase();
  const accounts = await readAccounts();
  if (accounts.some((a) => a.profile.email === email)) {
    return {
      ok: false,
      error: { code: 'email_taken', message: 'Email ini sudah terdaftar. Masuk dengan akun tersebut.' },
    };
  }
  const salt = Crypto.randomUUID();
  const account: StoredAccount = {
    profile: {
      id: Crypto.randomUUID(),
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      isPublic: input.isPublic,
      notifyOnStatus: input.notifyOnStatus,
    },
    salt,
    passwordHash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  };
  try {
    await writeJson(STORAGE_KEYS.accounts, [...accounts, account]);
  } catch {
    return {
      ok: false,
      error: { code: 'storage', message: 'Akun gagal disimpan di perangkat. Coba lagi.' },
    };
  }
  await startSession(account.profile);
  return { ok: true, profile: account.profile };
}

export async function loginAccount(email: string, password: string): Promise<AuthResult> {
  const accounts = await readAccounts();
  const account = accounts.find((a) => a.profile.email === email.trim().toLowerCase());
  const invalid: AuthError = {
    code: 'invalid_credentials',
    message: 'Email atau kata sandi tidak cocok.',
  };
  if (!account) return { ok: false, error: invalid };
  const hash = await hashPassword(password, account.salt);
  if (hash !== account.passwordHash) return { ok: false, error: invalid };
  await startSession(account.profile);
  return { ok: true, profile: account.profile };
}

async function startSession(profile: UserProfile): Promise<void> {
  const session: SessionToken = {
    token: Crypto.randomUUID(),
    userId: profile.id,
    createdAt: new Date().toISOString(),
  };
  await setSecret(STORAGE_KEYS.session, JSON.stringify(session));
  await writeJson(STORAGE_KEYS.profile, profile);
}

/**
 * Persists the preferences that drive behaviour (discoverability, notifications).
 * `isPublic` decides whether new reports reach the public map, so it must survive
 * a reload rather than living only in the in-memory store.
 */
export async function updatePreferences(
  userId: string,
  patch: Partial<Pick<UserProfile, 'isPublic' | 'notifyOnStatus'>>,
): Promise<AuthResult> {
  const accounts = await readAccounts();
  const index = accounts.findIndex((account) => account.profile.id === userId);
  if (index === -1) {
    return {
      ok: false,
      error: { code: 'storage', message: 'Akun tidak ditemukan di perangkat. Masuk ulang untuk melanjutkan.' },
    };
  }
  const profile: UserProfile = { ...accounts[index].profile, ...patch };
  const next = [...accounts];
  next[index] = { ...accounts[index], profile };
  try {
    await writeJson(STORAGE_KEYS.accounts, next);
    await writeJson(STORAGE_KEYS.profile, profile);
  } catch {
    return {
      ok: false,
      error: { code: 'storage', message: 'Preferensi gagal disimpan di perangkat. Coba lagi.' },
    };
  }
  return { ok: true, profile };
}

export async function restoreSession(): Promise<UserProfile | null> {
  const raw = await getSecret(STORAGE_KEYS.session);
  if (!raw) return null;
  let session: SessionToken;
  try {
    session = JSON.parse(raw) as SessionToken;
  } catch {
    return null;
  }
  const accounts = await readAccounts();
  return accounts.find((a) => a.profile.id === session.userId)?.profile ?? null;
}

export async function signOut(): Promise<void> {
  await deleteSecret(STORAGE_KEYS.session);
}

export const DEMO_ACCOUNT = { email: 'rani@lapora.id', password: 'lapora123', name: 'Rani' } as const;

/**
 * Local-only demo login: registers the sample citizen on first use, then signs
 * in. No server involved; the UI labels this as a local account.
 */
export async function loginDemo(): Promise<AuthResult> {
  const existing = await loginAccount(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
  if (existing.ok) return existing;
  return registerAccount({
    name: DEMO_ACCOUNT.name,
    email: DEMO_ACCOUNT.email,
    phone: '081234567890',
    password: DEMO_ACCOUNT.password,
    isPublic: true,
    notifyOnStatus: true,
  });
}
