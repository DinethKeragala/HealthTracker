import { useEffect, useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { getGoalsProgress } from '../services/stats.service'
import { PlusIcon, TrashIcon } from 'lucide-react'

export default function Goals() {
  const {
    goals,
    loadingGoals,
    refreshGoals,
    addGoal,
    deleteGoal,
    error,
  } = useAppContext()

  const [progress, setProgress] = useState([])
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [localError, setLocalError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    goalType: 'steps',
    targetValue: 10000,
    unit: 'steps',
    period: 'daily',
    isActive: true,
  })

  const goalTypeDefaults = useMemo(
    () => ({
      steps: { unit: 'steps', targetValue: 10000 },
      calories: { unit: 'kcal', targetValue: 2000 },
      workouts: { unit: 'workouts', targetValue: 3 },
      distance: { unit: 'km', targetValue: 10 },
      duration: { unit: 'min', targetValue: 150 },
    }),
    [],
  )

  const loadProgress = async () => {
    setLoadingProgress(true)
    setLocalError('')
    try {
      const gp = await getGoalsProgress()
      setProgress(gp?.items || [])
    } catch (e) {
      setLocalError(
        e?.response?.data?.message || e.message || 'Failed to load goals progress',
      )
    } finally {
      setLoadingProgress(false)
    }
  }

  useEffect(() => {
    refreshGoals()
    loadProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'goalType') {
      const defaults = goalTypeDefaults[value]
      setFormData((prev) => ({
        ...prev,
        goalType: value,
        unit: defaults?.unit || prev.unit,
        targetValue: defaults?.targetValue ?? prev.targetValue,
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    try {
      await addGoal({
        ...formData,
        targetValue: Number(formData.targetValue),
      })
      setShowForm(false)
      await loadProgress()
    } catch (e2) {
      setLocalError(e2?.response?.data?.message || e2.message || 'Failed to create goal')
    }
  }

  const progressByGoalId = useMemo(() => {
    const map = new Map()
    for (const item of progress) {
      if (item?.goal?._id) map.set(item.goal._id, item)
    }
    return map
  }, [progress])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Goals</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center space-x-1"
        >
          <PlusIcon size={16} />
          <span>New Goal</span>
        </button>
      </div>

      {(error || localError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {localError || error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Create Goal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (optional)
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Daily steps"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Type
                </label>
                <select
                  name="goalType"
                  value={formData.goalType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="steps">Steps</option>
                  <option value="calories">Calories</option>
                  <option value="workouts">Workouts</option>
                  <option value="distance">Distance</option>
                  <option value="duration">Duration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target
                </label>
                <input
                  name="targetValue"
                  type="number"
                  min="0"
                  value={formData.targetValue}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <input
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Your Goals</h2>
          {loadingProgress && (
            <span className="text-sm text-gray-500">Loading progress...</span>
          )}
        </div>

        {loadingGoals ? (
          <div className="text-gray-500 py-6 text-center">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="text-gray-500 py-6 text-center">No goals yet.</div>
        ) : (
          <div className="space-y-4">
            {goals.map((g) => {
              const p = progressByGoalId.get(g._id)
              const percent = Math.min(100, Math.round(p?.percent || 0))
              return (
                <div key={g._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {g.title || `${g.goalType} goal`}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {g.period} • target {g.targetValue} {g.unit}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await deleteGoal(g._id)
                        await loadProgress()
                      }}
                      className="p-1 text-gray-500 hover:text-red-600"
                      title="Delete"
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {p ? `${p.currentValue} / ${g.targetValue} ${g.unit}` : '—'}
                      </span>
                      <span>{p ? `${percent}%` : ''}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
