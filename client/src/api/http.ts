import axios from 'axios';
import { queryClient } from '@/app/query-client';
import { useAuthStore } from '@/store/auth.store';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
});

http.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

http.interceptors.response.use(undefined, (error: unknown) => {
  const wasAuthenticated = axios.isAxiosError(error) && error.config?.headers.Authorization;
  if (wasAuthenticated && error.response?.status === 401) {
    useAuthStore.getState().logout();
    queryClient.clear();
  }
  return Promise.reject(error);
});
