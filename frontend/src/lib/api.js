import axios from "axios";
// Import mock setup
//import './mockSetup.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export default api;
