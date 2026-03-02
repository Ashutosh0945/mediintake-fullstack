// src/api.js

import axios from "axios";

const api = axios.create({
  baseURL: "https://mediintake-fullstack.onrender.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;