import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://formgenie-6vo5.onrender.com/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
