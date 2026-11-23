import { create } from 'zustand';

import {
  loginAccount,
  loginDemo as loginDemoAccount,
  registerAccount,
  restoreSession,
  signOut as clearSession,
  updatePreferences,
} from '@/features/auth/services/authService';
import { type UserProfile } from '@/types/report';

type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  isPublic: boolean;
  notifyOnStatus: boolean;
};

type AuthState = {
  profile: UserProfile | null;
  hydrated: boolean;
  pending: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  loginDemo: () => Promise<boolean>;
  register: (input: RegisterInput) => Promise<boolean>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  hydrated: false,
  pending: false,
  error: null,

  async hydrate() {
    const profile = await restoreSession();
    set({ profile, hydrated: true });
  },

  async login(email, password) {
    set({ pending: true, error: null });
    const result = await loginAccount(email, password);
    if (result.ok) {
      set({ profile: result.profile, pending: false });
      return true;
    }
    set({ pending: false, error: result.error.message });
    return false;
  },

  async loginDemo() {
    set({ pending: true, error: null });
    const result = await loginDemoAccount();
    if (result.ok) {
      set({ profile: result.profile, pending: false });
      return true;
    }
    set({ pending: false, error: result.error.message });
    return false;
  },

  async register(input) {
    set({ pending: true, error: null });
    const result = await registerAccount(input);
    if (result.ok) {
      set({ profile: result.profile, pending: false });
      return true;
    }
    set({ pending: false, error: result.error.message });
    return false;
  },

  async updateProfile(patch) {
    const profile = get().profile;
    if (!profile) return;
    // Optimistic: the switch must respond immediately, then match what was stored.
    set({ profile: { ...profile, ...patch }, error: null });
    const result = await updatePreferences(profile.id, patch);
    if (result.ok) {
      set({ profile: result.profile });
      return;
    }
    set({ profile, error: result.error.message });
  },

  async logout() {
    await clearSession();
    set({ profile: null });
  },

  clearError() {
    set({ error: null });
  },
}));
