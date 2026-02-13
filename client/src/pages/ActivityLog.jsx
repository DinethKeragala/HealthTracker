import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  FlameIcon,
  MapPinIcon,
  TrashIcon,
  PencilIcon,
} from 'lucide-react'

const ActivityLog = () => {
  const {
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    loadingActivities,
    error,
  } = useAppContext()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('all')

  const initialFormState = {
    type: 'running',
    duration: 30,
    calories: 300,
    distance: 5,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  }

  const [formData, setFormData] = useState(initialFormState)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        name === 'duration' || name === 'calories'
          ? parseInt(value || '0', 10)
          : name === 'distance'
          ? parseFloat(value || '0')
          : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editing) {
      updateActivity({ ...formData, id: editing.id })
      setEditing(null)
    } else {
      addActivity(formData)
    }
    setFormData(initialFormState)
    setShowForm(false)
  }

  const handleEdit = (activity) => {
    setEditing(activity)
    setFormData(activity)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setFormData(initialFormState)
  }

  const activityTypes = [
    'running',
    'cycling',
    'swimming',
    'walking',
    'gym',
    'yoga',
    'other',
  ]

  // Filter and sort activities
  const filteredActivities = activities
    .filter((activity) => filter === 'all' || activity.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Group activities by date
  const groupedActivities = {}
  filteredActivities.forEach((activity) => {
    if (!groupedActivities[activity.date]) {
      groupedActivities[activity.date] = []
    }
    groupedActivities[activity.date].push(activity)
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center space-x-1"
        >
          <PlusIcon size={16} />
          <span>Log Activity</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Activity Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? 'Edit Activity' : 'Log New Activity'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {activityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calories Burned
                </label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (km) - if applicable
                </label>
                <input
                  type="number"
                  name="distance"
                  value={formData.distance || ''}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg"
              >
                {editing ? 'Update Activity' : 'Add Activity'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Activity Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Activities
          </button>
          {activityTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                filter === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {loadingActivities ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            Loading activities...
          </div>
        ) : Object.keys(groupedActivities).length > 0 ? (
          Object.entries(groupedActivities)
            .sort(
              ([dateA], [dateB]) =>
                new Date(dateB).getTime() - new Date(dateA).getTime(),
            )
            .map(([date, dayActivities]) => (
              <div
                key={date}
                className="bg-white rounded-xl shadow overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h3 className="font-medium">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                </div>
                <div className="divide-y">
                  {dayActivities.map((activity) => (
                    <div key={activity.id} className="p-4">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-lg capitalize">
                          {activity.type}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(activity)}
                            className="p-1 text-gray-500 hover:text-indigo-600"
                          >
                            <PencilIcon size={18} />
                          </button>
                          <button
                            onClick={() => deleteActivity(activity.id)}
                            className="p-1 text-gray-500 hover:text-red-600"
                          >
                            <TrashIcon size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex items-center text-gray-600">
                          <ClockIcon size={16} className="mr-1" />
                          <span>{activity.duration} minutes</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FlameIcon size={16} className="mr-1" />
                          <span>{activity.calories} calories</span>
                        </div>
                        {activity.distance && (
                          <div className="flex items-center text-gray-600">
                            <MapPinIcon size={16} className="mr-1" />
                            <span>{activity.distance} km</span>
                          </div>
                        )}
                      </div>

                      {activity.notes && (
                        <div className="mt-2 text-gray-600 text-sm">
                          <p>{activity.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
        ) : (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500 mb-4">
              No activities found. Start logging your workouts!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg inline-flex items-center"
            >
              <PlusIcon size={16} className="mr-1" />
              <span>Add First Activity</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityLog
