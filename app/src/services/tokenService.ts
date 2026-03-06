import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { SyncService } from './syncService';

const TOKEN_KEY = '@takehome_token';

export type JwtPayload = {
  sub: string;
  username: string;
  fullName: string;
  companyId: string;
  companyName: string;
  iat?: number;
  exp?: number;
};

export const TokenService = {
  saveToken: async (token: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  getToken: async () => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  getUserFromToken: async () => {
    const token = await TokenService.getToken();
    if (!token) return null;

    try {
      const payload = jwtDecode<JwtPayload>(token);
      const now = Date.now() / 1000;

      if (payload.exp && payload.exp < now) {
        await AsyncStorage.removeItem(TOKEN_KEY);
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  },

  saveTokenAndResetIfNewUser: async (
    token: string,
  ): Promise<JwtPayload | null> => {
    const previousPayload = await TokenService.getUserFromToken();
    const newPayload = jwtDecode<JwtPayload>(token);

    if (!previousPayload || previousPayload.sub !== newPayload.sub) {
      await SyncService.reset();
    }

    await TokenService.saveToken(token);
    return newPayload;
  },

  clearToken: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
};
