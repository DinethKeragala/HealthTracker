import { createContext, useContext, useMemo, useState } from 'react';

// Minimal app-level context to support Dashboard.jsx usage
const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [goals, setGoals] = useState([]);

  // CRUD helpers for activities
  const addActivity = (activity) => {
    const withId = { id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), ...activity };
    setActivities((prev) => [withId, ...prev]);
  };

  const updateActivity = (updated) => {
    setActivities((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
  };

  const deleteActivity = (id) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const value = useMemo(
    () => ({
      activities,
      setActivities,
      addActivity,
      updateActivity,
      deleteActivity,
      goals,
      setGoals,
    }),
    [activities, goals]
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
      addActivity: () => {},
      updateActivity: () => {},
      deleteActivity: () => {},
    };
  }
  return ctx;
};
