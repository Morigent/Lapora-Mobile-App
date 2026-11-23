import {
  DEMO_ACCOUNT,
  loginAccount,
  loginDemo,
  registerAccount,
  restoreSession,
  signOut,
  updatePreferences,
} from '@/features/auth/services/authService';
import { STORAGE_KEYS } from '@/lib/constants';

let mockIdCounter = 0;

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  randomUUID: () => `uuid-${++mockIdCounter}`,
  digestStringAsync: async (_algorithm: string, value: string) => {
    let hash = 7;
    for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    return `digest-${hash.toString(16)}`;
  },
}));

jest.mock('@/storage/jsonStore', () => {
  const rows = new Map<string, string>();
  const store = {
    __rows: rows,
    __failWrites: false,
    readJson: async (key: string, fallback: unknown) => {
      const raw = rows.get(key);
      return raw ? JSON.parse(raw) : fallback;
    },
    writeJson: async (key: string, value: unknown) => {
      if (store.__failWrites) throw new Error('disk penuh');
      rows.set(key, JSON.stringify(value));
    },
    removeKey: async (key: string) => {
      rows.delete(key);
    },
  };
  return store;
});

jest.mock('@/storage/secureStorage', () => {
  const secrets = new Map<string, string>();
  return {
    __secrets: secrets,
    getSecret: async (key: string) => secrets.get(key) ?? null,
    setSecret: async (key: string, value: string) => {
      secrets.set(key, value);
    },
    deleteSecret: async (key: string) => {
      secrets.delete(key);
    },
  };
});

const store = jest.requireMock('@/storage/jsonStore') as { __rows: Map<string, string>; __failWrites: boolean };
const secrets = (jest.requireMock('@/storage/secureStorage') as { __secrets: Map<string, string> }).__secrets;

function accounts(): { profile: { id: string; email: string; name: string }; salt: string; passwordHash: string }[] {
  return JSON.parse(store.__rows.get(STORAGE_KEYS.accounts) ?? '[]');
}

function registration(overrides: Partial<Parameters<typeof registerAccount>[0]> = {}) {
  return {
    name: '  Rani  ',
    email: '  Rani@Example.COM ',
    phone: '081234567890',
    password: 'lapora123',
    isPublic: true,
    notifyOnStatus: true,
    ...overrides,
  };
}

beforeEach(() => {
  store.__rows.clear();
  store.__failWrites = false;
  secrets.clear();
  mockIdCounter = 0;
});

describe('registerAccount', () => {
  it('normalises the profile and never stores the raw password', async () => {
    const result = await registerAccount(registration());

    if (!result.ok) throw new Error(result.error.message);
    expect(result.profile).toMatchObject({ name: 'Rani', email: 'rani@example.com' });

    const [account] = accounts();
    expect(account.profile.email).toBe('rani@example.com');
    expect(account.passwordHash).not.toContain('lapora123');
    expect(account.passwordHash).toMatch(/^digest-[0-9a-f]+$/);
  });

  it('starts a session in secure storage and mirrors the profile', async () => {
    await registerAccount(registration());

    const token = JSON.parse(secrets.get(STORAGE_KEYS.session) ?? 'null');
    expect(token).toMatchObject({ userId: accounts()[0].profile.id });
    expect(await restoreSession()).toMatchObject({ email: 'rani@example.com' });
  });

  it('salts the hash so two accounts sharing a password store different hashes', async () => {
    await registerAccount(registration());
    await registerAccount(registration({ email: 'budi@example.com' }));

    const [first, second] = accounts();
    expect(first.salt).not.toBe(second.salt);
    expect(first.passwordHash).not.toBe(second.passwordHash);
  });

  it('refuses a duplicate email regardless of casing', async () => {
    await registerAccount(registration());
    const again = await registerAccount(registration({ email: 'RANI@example.com' }));

    expect(again).toEqual({
      ok: false,
      error: { code: 'email_taken', message: 'Email ini sudah terdaftar. Masuk dengan akun tersebut.' },
    });
    expect(accounts()).toHaveLength(1);
  });

  it('reports a device write failure instead of pretending the account exists', async () => {
    store.__failWrites = true;
    const result = await registerAccount(registration());

    expect(result).toEqual({
      ok: false,
      error: { code: 'storage', message: 'Akun gagal disimpan di perangkat. Coba lagi.' },
    });
    expect(secrets.has(STORAGE_KEYS.session)).toBe(false);
  });
});

describe('loginAccount', () => {
  it('accepts the same password with different casing and spacing in the email', async () => {
    await registerAccount(registration());
    const result = await loginAccount(' rani@EXAMPLE.com ', 'lapora123');

    if (!result.ok) throw new Error(result.error.message);
    expect(result.profile.email).toBe('rani@example.com');
  });

  it('rejects a wrong password and an unknown email with the same message', async () => {
    await registerAccount(registration());

    const wrong = await loginAccount('rani@example.com', 'salah1234');
    const unknown = await loginAccount('nobody@example.com', 'lapora123');
    expect(wrong).toEqual({ ok: false, error: { code: 'invalid_credentials', message: 'Email atau kata sandi tidak cocok.' } });
    expect(unknown).toEqual(wrong);
  });

  it('rotates the session token on each sign-in', async () => {
    await registerAccount(registration());
    const first = secrets.get(STORAGE_KEYS.session);
    await loginAccount('rani@example.com', 'lapora123');

    expect(secrets.get(STORAGE_KEYS.session)).not.toBe(first);
    expect(await restoreSession()).toMatchObject({ email: 'rani@example.com' });
  });
});

describe('restoreSession and signOut', () => {
  it('returns null without a token', async () => {
    expect(await restoreSession()).toBeNull();
  });

  it('returns null when the token points at an account that no longer exists', async () => {
    secrets.set(STORAGE_KEYS.session, JSON.stringify({ token: 't', userId: 'gone', createdAt: new Date().toISOString() }));
    expect(await restoreSession()).toBeNull();
  });

  it('survives a corrupted token', async () => {
    secrets.set(STORAGE_KEYS.session, '{bukan-json');
    expect(await restoreSession()).toBeNull();
  });

  it('clears the token on sign out', async () => {
    await registerAccount(registration());
    await signOut();

    expect(secrets.has(STORAGE_KEYS.session)).toBe(false);
    expect(await restoreSession()).toBeNull();
  });
});

describe('loginDemo', () => {
  it('registers the demo citizen once, then signs back in', async () => {
    const first = await loginDemo();
    const second = await loginDemo();

    if (!first.ok || !second.ok) throw new Error('demo login should succeed');
    expect(second.profile).toMatchObject({ email: DEMO_ACCOUNT.email, name: DEMO_ACCOUNT.name });
    expect(accounts()).toHaveLength(1);
  });
});

describe('updatePreferences', () => {
  it('persists a visibility change so it survives a restore', async () => {
    const created = await registerAccount(registration({ isPublic: true }));
    if (!created.ok) throw new Error('registration should succeed');

    const result = await updatePreferences(created.profile.id, { isPublic: false });

    expect(result.ok).toBe(true);
    expect((await restoreSession())?.isPublic).toBe(false);
  });

  it('leaves the stored profile untouched when the write fails', async () => {
    const created = await registerAccount(registration({ notifyOnStatus: true }));
    if (!created.ok) throw new Error('registration should succeed');
    store.__failWrites = true;

    const result = await updatePreferences(created.profile.id, { notifyOnStatus: false });

    expect(result).toMatchObject({ ok: false, error: { code: 'storage' } });
    store.__failWrites = false;
    expect((await restoreSession())?.notifyOnStatus).toBe(true);
  });

  it('refuses to write preferences for an account that is not on this device', async () => {
    const result = await updatePreferences('user-hilang', { isPublic: false });

    expect(result).toMatchObject({ ok: false, error: { code: 'storage' } });
  });
});
