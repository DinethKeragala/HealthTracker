import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { FlameIcon, ClockIcon, TrendingUpIcon, HashIcon } from 'lucide-react'
import { getSummary } from '../services/stats.service'

export default function Statistics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const s = await getSummary()
        if (!mounted) return
        setSummary(s)
      } catch (e) {
        if (!mounted) return
        setError(e?.response?.data?.message || e.message || 'Failed to load stats')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  const chartData = useMemo(() => {
    const daily = summary?.daily || []
    return daily.map((d) => ({
      date: new Date(d._id).toLocaleDateString('en-US', { weekday: 'short' }),
      calories: d.caloriesBurned || 0,
      duration: d.durationMinutes || 0,
      distance: d.distanceKm || 0,
      steps: d.steps || 0,
    }))
  }, [summary])

  const totals = summary?.totals || {
    activities: 0,
    steps: 0,
    caloriesBurned: 0,
    distanceKm: 0,
    durationMinutes: 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Statistics</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Calories" value={`${totals.caloriesBurned} kcal`} icon={<FlameIcon size={24} />} />
        <StatCard title="Duration" value={`${totals.durationMinutes} min`} icon={<ClockIcon size={24} />} />
        <StatCard title="Distance" value={`${Number(totals.distanceKm).toFixed(1)} km`} icon={<TrendingUpIcon size={24} />} />
        <StatCard title="Steps" value={`${totals.steps}`} icon={<HashIcon size={24} />} />
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Daily Calories (last 7 days)</h2>
        <div className="h-64">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-500">Loading chart...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calories" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center">
      <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">{icon}</div>
      <div className="ml-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  )
}
