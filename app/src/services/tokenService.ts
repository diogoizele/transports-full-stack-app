import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = '@takehome_token';

export type JwtPayload = {
  sub: string;
  username: string;
  fullName: string;
  companyId: string;

  iat?: number;
  exp?: number;
};

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const getUserFromToken = async (): Promise<JwtPayload | null> => {
  const token = await getToken();
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
};

export const clearToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};
