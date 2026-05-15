import api from './api';

// Login
export const login = async (login_name, password) => {
  const res = await api.post('/admin/login', {
    login_name,
    password,
  });
  return res.data;
};

// Logout
export const logout = async () => {
  const res = await api.post('/admin/logout');
  return res.data;
};
// registration
export const register = async (userData) => {
  const res = await api.post('/user', userData);
  return res.data;
};

// Check current session
export const getMe = async () => {
  const res = await api.get('/admin/me');
  return res.data;
};
