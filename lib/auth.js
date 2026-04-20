import api from './api';

// Login
export const login = async (login_name, password) => {
  const res = await api.post('/auth/login', {
    login_name,
    password
  });
  return res.data;
};

// Logout
export const logout = async () => {
  const res = await api.post('/auth/logout');
  return res.data;
};

// Check current session
export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};