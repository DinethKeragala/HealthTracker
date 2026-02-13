import { api } from './api';

export const listGoals = async () => {
  const response = await api.get('goals');
  return response.data;
};

export const createGoal = async (payload) => {
  const response = await api.post('goals', payload);
  return response.data;
};

export const updateGoal = async (id, payload) => {
  const response = await api.patch(`goals/${id}`, payload);
  return response.data;
};

export const deleteGoal = async (id) => {
  const response = await api.delete(`goals/${id}`);
  return response.data;
};
