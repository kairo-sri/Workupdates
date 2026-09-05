import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LOGIN_OPTIONS } from '../mock/users'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('')

  const handleLogin = () => {
    const option = LOGIN_OPTIONS.find(o => o.label === selected)
    if (!option) return
    login(option.user)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-indigo-600 mb-1">Workpulse</h1>
          <p className="text-sm text-gray-500">Team progress tracking</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Login as
            </label>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">Select a user...</option>
              {LOGIN_OPTIONS.map(o => (
                <option key={o.label} value={o.label}>{o.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogin}
            disabled={!selected}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-2.5"
          >
            Sign In
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">Mock login — no password required in dev mode</p>
      </div>
    </div>
  )
}
