import { api } from './api';

export const getSummary = async ({ from, to } = {}) => {
  const response = await api.get('stats/summary', { params: { from, to } });
  return response.data;
};

export const getGoalsProgress = async () => {
  const response = await api.get('stats/goals-progress');
  return response.data;
};
