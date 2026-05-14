import axios from "axios";
// Import mock setup
//import './mockSetup.js';

const api = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true,
});

export default api;
