import axios from 'axios';
import Config from 'react-native-config';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: Config.API_URL,
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const logout = useAuthStore.getState().logout;
      await logout();
    }

    return Promise.reject(error);
  },
);
