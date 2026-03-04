import { api } from './axios';

export async function loginRequest(username: string, password: string) {
  const response = await api.post<{ token: string }>('/auth/login', {
    username,
    password,
  });

  return response.data;
}
