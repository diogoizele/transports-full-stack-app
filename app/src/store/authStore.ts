import { create } from 'zustand';
import { TokenService, JwtPayload } from '../services/tokenService';
import { loginRequest } from '../api/auth';

type AuthState = {
  token: string | null;
  userId: string | null;
  username: string | null;
  fullName: string | null;
  companyId: string | null;
  companyName: string | null;
  login: (username: string, password: string) => Promise<void>;
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

  login: async (username: string, password: string) => {
    try {
      const { token } = await loginRequest(username, password);

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
      set({
        token: null,
        userId: null,
        username: null,
        fullName: null,
        companyId: null,
        companyName: null,
      });
      throw e;
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
