import { createContext, useContext, useMemo, useState } from 'react';

// Minimal app-level context to support Dashboard.jsx usage
const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [goals, setGoals] = useState([]);

  const value = useMemo(() => ({
    activities,
    setActivities,
    goals,
    setGoals,
  }), [activities, goals]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  // Provide safe defaults if provider is accidentally omitted
  if (!ctx) {
    return { activities: [], goals: [], setActivities: () => {}, setGoals: () => {} };
  }
  return ctx;
};
