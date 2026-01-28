import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import * as activitiesApi from '../services/activities.service';
import * as goalsApi from '../services/goals.service';

// Minimal app-level context to support Dashboard.jsx usage
const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();

  const [activities, setActivities] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [error, setError] = useState('');

  const apiTypeToUiType = (activityType) => {
    if (activityType === 'run') return 'running';
    if (activityType === 'cycle') return 'cycling';
    if (activityType === 'swim') return 'swimming';
    if (activityType === 'walk') return 'walking';
    if (activityType === 'strength') return 'gym';
    if (activityType === 'workout') return 'gym';
    if (activityType === 'yoga') return 'yoga';
    return 'other';
  };

  const uiTypeToApiType = (type) => {
    if (type === 'running') return 'run';
    if (type === 'cycling') return 'cycle';
    if (type === 'swimming') return 'swim';
    if (type === 'walking') return 'walk';
    if (type === 'gym') return 'strength';
    if (type === 'yoga') return 'yoga';
    return 'other';
  };

  const mapApiActivityToUi = (a) => {
    const started = a?.startedAt ? new Date(a.startedAt) : null;
    const date = started && !Number.isNaN(started.getTime())
      ? started.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    return {
      id: a._id,
      type: apiTypeToUiType(a.activityType),
      duration: a.durationMinutes ?? 0,
      calories: a.caloriesBurned ?? 0,
      distance: a.distanceKm ?? 0,
      date,
      notes: a.notes ?? '',
      title: a.title ?? '',
      _raw: a,
    };
  };

  const mapUiActivityToApi = (ui) => {
    return {
      activityType: uiTypeToApiType(ui.type),
      startedAt: ui.date, // YYYY-MM-DD works fine for backend parsing
      durationMinutes: ui.duration,
      caloriesBurned: ui.calories,
      distanceKm: ui.distance ? ui.distance : undefined,
      notes: ui.notes,
      title: ui.title,
    };
  };

  const refreshActivities = async (opts = {}) => {
    if (!user) {
      setActivities([]);
      return;
    }
    setLoadingActivities(true);
    setError('');
    try {
      const data = await activitiesApi.listActivities({ limit: 100, ...opts });
      setActivities((data.items || []).map(mapApiActivityToUi));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load activities');
    } finally {
      setLoadingActivities(false);
    }
  };

  const refreshGoals = async () => {
    if (!user) {
      setGoals([]);
      return;
    }
    setLoadingGoals(true);
    setError('');
    try {
      const data = await goalsApi.listGoals();
      setGoals(data.items || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load goals');
    } finally {
      setLoadingGoals(false);
    }
  };

  const addActivity = async (activity) => {
    setError('');
    const created = await activitiesApi.createActivity(mapUiActivityToApi(activity));
    setActivities((prev) => [mapApiActivityToUi(created), ...prev]);
    return created;
  };

  const updateActivity = async (updated) => {
    setError('');
    const saved = await activitiesApi.updateActivity(updated.id, mapUiActivityToApi(updated));
    const ui = mapApiActivityToUi(saved);
    setActivities((prev) => prev.map((a) => (a.id === updated.id ? ui : a)));
    return saved;
  };

  const deleteActivity = async (id) => {
    setError('');
    await activitiesApi.deleteActivity(id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const addGoal = async (goal) => {
    setError('');
    const created = await goalsApi.createGoal(goal);
    setGoals((prev) => [created, ...prev]);
    return created;
  };

  const updateGoal = async (id, payload) => {
    setError('');
    const saved = await goalsApi.updateGoal(id, payload);
    setGoals((prev) => prev.map((g) => (g._id === id ? saved : g)));
    return saved;
  };

  const deleteGoal = async (id) => {
    setError('');
    await goalsApi.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g._id !== id));
  };

  useEffect(() => {
    // Whenever auth changes, rehydrate app data
    refreshActivities();
    refreshGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?._id, user]);

  const value = useMemo(
    () => ({
      activities,
      setActivities,
      loadingActivities,
      refreshActivities,
      addActivity,
      updateActivity,
      deleteActivity,
      goals,
      setGoals,
      loadingGoals,
      refreshGoals,
      addGoal,
      updateGoal,
      deleteGoal,
      error,
    }),
    [activities, goals, loadingActivities, loadingGoals, error]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  // Provide safe defaults if provider is accidentally omitted
  if (!ctx) {
    return {
      activities: [],
      goals: [],
      setActivities: () => {},
      setGoals: () => {},
      loadingActivities: false,
      refreshActivities: async () => {},
      addActivity: () => {},
      updateActivity: () => {},
      deleteActivity: () => {},
      loadingGoals: false,
      refreshGoals: async () => {},
      addGoal: async () => {},
      updateGoal: async () => {},
      deleteGoal: async () => {},
      error: '',
    };
  }
  return ctx;
};
