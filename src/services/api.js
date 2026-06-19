// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
});

api.interceptors.request.use(
  (config) => {
    const loggedUserJson = localStorage.getItem("volleywood_user");

    if (loggedUserJson) {
      const { token } = JSON.parse(loggedUserJson);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
