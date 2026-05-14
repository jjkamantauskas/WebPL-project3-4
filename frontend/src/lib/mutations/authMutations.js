import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, logout } from '../auth';
import { register } from '../auth';

// LOGIN
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ login_name, password }) =>
      login(login_name, password),

    onSuccess: (data) => {
      // 🔥 keep UI in sync
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
}

// LOGOUT
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
    }
  });
}

//registration
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
}