import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, TrendingUpIcon, FlameIcon, ClockIcon } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getSummary, getGoalsProgress } from '../services/stats.service'
import { listActivities } from '../services/activities.service'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const [goalsProgress, setGoalsProgress] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const [s, gp, a] = await Promise.all([
          getSummary(),
          getGoalsProgress(),
          listActivities({ limit: 3 }),
        ])
        if (!mounted) return
        setSummary(s)
        setGoalsProgress(gp?.items || [])
        setRecentActivities(a?.items || [])
      } catch (e) {
        if (!mounted) return
        setError(e?.response?.data?.message || e.message || 'Failed to load dashboard')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  const weeklyData = useMemo(() => {
    const daily = summary?.daily || []
    return daily.map((d) => ({
      date: new Date(d._id).toLocaleDateString('en-US', { weekday: 'short' }),
      calories: d.caloriesBurned || 0,
    }))
  }, [summary])

  const todayStats = useMemo(() => {
    const now = new Date()
    const from = new Date(now)
    from.setHours(0, 0, 0, 0)
    const todayKey = from.toISOString().slice(0, 10)
    const today = (summary?.daily || []).find((d) => d._id === todayKey)
    return {
      calories: today?.caloriesBurned || 0,
      duration: today?.durationMinutes || 0,
      distance: today?.distanceKm || 0,
    }
  }, [summary])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Link
          to="/activities"
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center space-x-1"
        >
          <PlusIcon size={16} />
          <span>Log Activity</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex items-center">
          <div className="bg-red-100 p-3 rounded-full">
            <FlameIcon size={24} className="text-red-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Calories Burned Today</p>
            <p className="text-xl font-bold">{todayStats.calories} kcal</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 flex items-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <ClockIcon size={24} className="text-blue-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Active Time Today</p>
            <p className="text-xl font-bold">{todayStats.duration} min</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 flex items-center">
          <div className="bg-green-100 p-3 rounded-full">
            <TrendingUpIcon size={24} className="text-green-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Distance Today</p>
            <p className="text-xl font-bold">
              {Number(todayStats.distance).toFixed(1)} km
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Weekly Activity</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calories" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Goals */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Goal Progress</h2>
            <Link
              to="/goals"
              className="text-indigo-600 text-sm hover:underline"
            >
              View all
            </Link>
          </div>
          {goalsProgress.length > 0 ? (
            <div className="space-y-4">
              {goalsProgress.slice(0, 3).map((item) => (
                <div
                  key={item.goal?._id}
                  className="border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">
                      {item.goal?.title || `${item.goal?.goalType || 'goal'}`}
                    </h3>
                    <span className="text-sm text-gray-500 capitalize">
                      {item.goal?.period}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {item.currentValue} / {item.goal?.targetValue}{' '}
                        {item.goal?.unit || ''}
                      </span>
                      <span>
                        {Math.round(item.percent || 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round(item.percent || 0))}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No active goals yet. Create one!
            </p>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
            <Link
              to="/activities"
              className="text-indigo-600 text-sm hover:underline"
            >
              View all
            </Link>
          </div>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <ActivityIcon
                      type={activity.activityType}
                      size={20}
                      className="text-indigo-600"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium capitalize">{activity.activityType}</h3>
                    <p className="text-sm text-gray-500">
                      {(activity.durationMinutes ?? 0)} min • {(activity.caloriesBurned ?? 0)} kcal
                      {activity.distanceKm ? ` • ${activity.distanceKm} km` : ''}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {new Date(activity.startedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No activities logged yet. Start logging!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

// Helper function to get an icon based on activity type
const ActivityIcon = ({ type, size, className }) => {
  switch (type) {
    case 'running':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M13 4v6l5.4-3.1c.8-.5 1.6.2 1.6 1.1v7.4c0 .5-.2 1-.6 1.4l-5.1 4.3a1.7 1.7 0 0 1-2.3-.1L7 16" />
          <path d="M7 9v7" />
          <path d="M8 4h7l.3.3a3 3 0 0 1 .9 2.1L16 8" />
        </svg>
      )
    case 'cycling':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="6" cy="15" r="3" />
          <circle cx="18" cy="15" r="3" />
          <path d="M6 15 8 7l3 4.5L15 7l2 8" />
        </svg>
      )
    case 'swimming':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M4 11 2 9c3.2-3.2 8.5-3.2 11.7 0" />
          <path d="m18 11 2-2c-1.4-1.4-3-2.2-4.6-2.4" />
          <path d="M14 8V5c0-1.7-1.3-3-3-3S8 3.3 8 5v3" />
          <path d="M22 13c-3.2 3.2-8.5 3.2-11.7 0" />
          <path d="M16.8 17c-1 .8-2 1.3-3 1.6" />
          <path d="M5 13c-.5.5-1.5 1-2.5 1.5" />
          <path d="M7.1 17c-2.3 2.3-5.6 2.4-6.8.3C-.8 15.2.3 12 2.7 9.6" />
          <path d="M22 13c-.5.5-1.5 1-2.5 1.5" />
          <path d="M20 17c1 .8.4 3.7-3 3.7-2.4 0-4.4-1.5-5-1.5-.3 0-.5.1-.7.3" />
        </svg>
      )
    case 'walking':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M13 4v6l5.4-3.1c.8-.5 1.6.2 1.6 1.1v7.4c0 .5-.2 1-.6 1.4l-5.1 4.3a1.7 1.7 0 0 1-2.3-.1L7 16" />
          <path d="M7 9v7" />
          <path d="M8 4h7l.3.3a3 3 0 0 1 .9 2.1L16 8" />
        </svg>
      )
    case 'gym':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="m6.5 6.5 11 11" />
          <path d="m21 21-1-1" />
          <path d="m3 3 1 1" />
          <path d="m18 22 4-4" />
          <path d="m2 6 4-4" />
          <path d="m3 10 7-7" />
          <path d="m14 21 7-7" />
        </svg>
      )
    case 'yoga':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12 2a5 5 0 0 0-5 5c0 2.8 2.5 5 5 8 2.5-3 5-5.2 5-8a5 5 0 0 0-5-5z" />
          <path d="M12 15v7" />
        </svg>
      )
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" x2="4" y1="22" y2="15" />
        </svg>
      )
  }
}
