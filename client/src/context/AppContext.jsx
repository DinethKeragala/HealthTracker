import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as activityService from '../services/activity.service';

// Minimal app-level context to support Dashboard.jsx usage
const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const { user } = useAuth();

  // Normalize server activity to client shape
  const normalize = (a) => ({
    id: a._id || a.id,
    type: a.type,
    duration: a.duration,
    calories: a.calories,
    distance: a.distance,
    date: a.date,
    notes: a.notes || '',
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  });

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setActivities([]);
        return;
      }
      setLoadingActivities(true);
      try {
        const list = await activityService.getActivities();
        setActivities(list.map(normalize));
      } catch (err) {
        console.error('Failed to fetch activities', err);
      } finally {
        setLoadingActivities(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addActivity = async (data) => {
    // Submit to backend then update local state with server version
    const created = await activityService.createActivity(data);
    const n = normalize(created);
    setActivities((prev) => [n, ...prev]);
    return n;
  };

  const updateActivity = async (data) => {
    const { id, ...rest } = data;
    const updated = await activityService.updateActivity(id, rest);
    const n = normalize(updated);
    setActivities((prev) => prev.map((a) => (a.id === id ? n : a)));
    return n;
  };

  const deleteActivity = async (id) => {
    await activityService.deleteActivity(id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const value = useMemo(() => ({
    activities,
    setActivities,
    loadingActivities,
    goals,
    setGoals,
    addActivity,
    updateActivity,
    deleteActivity,
  }), [activities, goals]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  // Provide safe defaults if provider is accidentally omitted
  if (!ctx) {
    return { activities: [], goals: [], setActivities: () => {}, setGoals: () => {}, addActivity: async () => {}, updateActivity: async () => {}, deleteActivity: async () => {}, loadingActivities: false };
  }
  return ctx;
};
