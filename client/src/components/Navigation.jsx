import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BarChart2Icon,
  HomeIcon,
  TargetIcon,
  ActivityIcon,
  UserIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navigation = () => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <HomeIcon size={20} />,
    },
    {
      name: 'Activities',
      path: '/activities',
      icon: <ActivityIcon size={20} />,
    },
    {
      name: 'Goals',
      path: '/goals',
      icon: <TargetIcon size={20} />,
    },
    {
      name: 'Statistics',
      path: '/statistics',
      icon: <BarChart2Icon size={20} />,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <UserIcon size={20} />,
    },
  ]

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <ActivityIcon size={24} />
            <span className="font-bold text-xl">FitTrack</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 py-2 px-1 border-b-2 ${
                  location.pathname === item.path
                    ? 'border-white font-medium'
                    : 'border-transparent hover:border-indigo-300'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Profile Preview + Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-indigo-100">
                <span>Hello, </span>
                <span className="font-semibold">
                  {user?.firstName ? user.firstName.split(' ')[0] : user?.username || 'Guest'}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-indigo-400/60">
                <img
                  src={user?.profilePicture || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="px-3 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-400 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white focus:outline-none"
            >
              {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 py-3 px-4 ${
                  location.pathname === item.path
                    ? 'bg-indigo-700 font-medium'
                    : 'hover:bg-indigo-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            <button
              onClick={() => { logout(); navigate('/login'); setMobileMenuOpen(false); }}
              className="w-full text-left flex items-center space-x-3 py-3 px-4 mt-2 bg-indigo-500/80 hover:bg-indigo-500 rounded"
            >
              <XIcon size={20} className="opacity-60" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
