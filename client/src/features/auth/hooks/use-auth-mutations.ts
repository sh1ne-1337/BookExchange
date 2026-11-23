import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({ mutationFn: authApi.login, onSuccess: setSession });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: authApi.resetPassword });
}

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({ mutationFn: authApi.register, onSuccess: setSession });
}
