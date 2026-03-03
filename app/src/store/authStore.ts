import { create } from 'zustand';
import { TokenService, JwtPayload } from '../services/tokenService';

type AuthState = {
  token: string | null;
  userId: string | null;
  username: string | null;
  fullName: string | null;
  companyId: string | null;
  companyName: string | null;
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
  companyName: null,

  setToken: async (token: string) => {
    try {
      await TokenService.saveToken(token);
      const payload: JwtPayload | null = await TokenService.getUserFromToken();
      if (payload) {
        set({
          token,
          userId: payload.sub,
          username: payload.username,
          fullName: payload.fullName,
          companyId: payload.companyId,
          companyName: payload.companyName,
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
        companyName: null,
      });
    }
  },

  logout: async () => {
    await TokenService.clearToken();
    set({
      token: null,
      userId: null,
      username: null,
      fullName: null,
      companyId: null,
      companyName: null,
    });
  },

  bootstrap: async () => {
    try {
      const token = await TokenService.getToken();
      if (!token) return;

      const payload = await TokenService.getUserFromToken();
      if (!payload) {
        await TokenService.clearToken();
        return;
      }

      set({
        token,
        userId: payload.sub,
        username: payload.username,
        fullName: payload.fullName,
        companyId: payload.companyId,
        companyName: payload.companyName,
      });
    } catch {
      set({
        token: null,
        userId: null,
        username: null,
        fullName: null,
        companyId: null,
        companyName: null,
      });
    }
  },
}));
