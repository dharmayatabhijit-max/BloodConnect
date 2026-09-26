import axios from "axios";

const api = axios.create({
  baseURL: "https://bloodconnect-1-wy0v.onrender.com/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bloodconnect_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
