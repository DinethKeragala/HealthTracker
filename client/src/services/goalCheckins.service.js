import { api } from './api';

export const listGoalCheckins = async (goalId, { limit = 30 } = {}) => {
  const response = await api.get(`goals/${goalId}/checkins`, { params: { limit } });
  return response.data;
};

// Upserts a check-in for the given goalId + date.
export const upsertGoalCheckin = async (goalId, payload) => {
  const response = await api.post(`goals/${goalId}/checkins`, payload);
  return response.data;
};

export const deleteGoalCheckin = async (goalId, checkinId) => {
  const response = await api.delete(`goals/${goalId}/checkins/${checkinId}`);
  return response.data;
};
