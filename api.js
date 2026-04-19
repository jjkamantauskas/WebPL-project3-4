import axios from "axios";
// Import mock setup
//import './mockSetup.js';

const api = axios.create({
  baseURL: "http://localhost:3000",

});

export default api;
