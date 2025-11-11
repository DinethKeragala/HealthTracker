import axios from 'axios';

// Reuse the same base URL strategy as auth.service
const API_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getActivities = async () => {
  const res = await api.get('/activities');
  return res.data;
};

export const createActivity = async (data) => {
  const res = await api.post('/activities', data);
  return res.data;
};

export const updateActivity = async (id, data) => {
  const res = await api.put(`/activities/${id}`, data);
  return res.data;
};

export const deleteActivity = async (id) => {
  const res = await api.delete(`/activities/${id}`);
  return res.data;
};
