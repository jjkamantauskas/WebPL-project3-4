import { useLogin } from '../api/mutations/authMutations';
import { useLogout } from '../api/mutations/authMutations';

const { mutate: loginUser, isLoading, error } = useLogin();

const handleLogin = () => {
  loginUser({ login_name, password });
};