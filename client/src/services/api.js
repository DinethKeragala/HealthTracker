import axios from 'axios';

// Prefer environment variable from Vite, fallback to localhost
// Expected to include the `/api` prefix, e.g. http://localhost:5000/api
const RAW_API_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api';

// Normalize so path-joining behaves consistently (especially with relative base URLs like "/api")
const API_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL : `${RAW_API_URL}/`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
