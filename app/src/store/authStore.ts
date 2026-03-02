import { create } from 'zustand';
import {
  saveToken,
  getUserFromToken,
  clearToken,
  JwtPayload,
  getToken,
} from '../services/tokenService';

type AuthState = {
  token: string | null;
  userId: string | null;
  username: string | null;
  fullName: string | null;
  companyId: string | null;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
};

export const useAuthStore = create<AuthState>(set => ({
  token: null,
  userId: null,
  username: null,
  fullName: null,
  companyId: null,

  setToken: async (token: string) => {
    try {
      await saveToken(token);
      const payload: JwtPayload | null = await getUserFromToken();
      if (payload) {
        set({
          token,
          userId: payload.sub,
          username: payload.username,
          fullName: payload.fullName,
          companyId: payload.companyId,
        });
      }
    } catch (e) {
      console.error('Erro salvando token', e);
      set({
        token: null,
        userId: null,
        username: null,
        fullName: null,
        companyId: null,
      });
    }
  },

  logout: async () => {
    await clearToken();
    set({
      token: null,
      userId: null,
      username: null,
      fullName: null,
      companyId: null,
    });
  },

  bootstrap: async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const payload = await getUserFromToken();
      if (!payload) {
        await clearToken();
        return;
      }

      set({
        token,
        userId: payload.sub,
        username: payload.username,
        fullName: payload.fullName,
        companyId: payload.companyId,
      });
    } catch {
      set({
        token: null,
        userId: null,
        username: null,
        fullName: null,
        companyId: null,
      });
    }
  },
}));
