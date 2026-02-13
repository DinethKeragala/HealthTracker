import { api } from './api';

export const listActivities = async ({
  page = 1,
  limit = 50,
  activityType,
  from,
  to,
  sort,
} = {}) => {
  const response = await api.get('activities', {
    params: { page, limit, activityType, from, to, sort },
  });
  return response.data;
};

export const createActivity = async (payload) => {
  const response = await api.post('activities', payload);
  return response.data;
};

export const updateActivity = async (id, payload) => {
  const response = await api.patch(`activities/${id}`, payload);
  return response.data;
};

export const deleteActivity = async (id) => {
  const response = await api.delete(`activities/${id}`);
  return response.data;
};
