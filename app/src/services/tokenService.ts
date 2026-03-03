import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

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
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  async getUserFromToken(): Promise<JwtPayload | null> {
    const token = await this.getToken();
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

  async clearToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
};
