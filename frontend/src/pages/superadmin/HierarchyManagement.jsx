import { useState } from 'react'
import { MOCK_USERS } from '../../mock/users'
import { ArrowRight } from 'lucide-react'

export default function HierarchyManagement() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [form, setForm] = useState({ menteeId: '', mentorId: '', managerId: '' })
  const [saved, setSaved] = useState(false)

  const mentees = users.filter(u => u.role === 'mentee')
  const mentors = users.filter(u => u.role === 'mentor')
  const managers = users.filter(u => u.role === 'manager')

  const handleSave = () => {
    if (!form.menteeId) return
    setUsers(prev => prev.map(u => u.id === form.menteeId
      ? { ...u, mentorId: form.mentorId, managerId: form.managerId }
      : u
    ))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const getName = id => users.find(u => u.id === id)?.name || '—'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Hierarchy Management</h1>
        <p className="text-sm text-gray-500">Assign and restructure reporting relationships</p>
      </div>

      {/* Current hierarchy */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Current Hierarchy</h2>
        <div className="space-y-3">
          {mentees.map(mentee => (
            <div key={mentee.id} className="flex items-center gap-3 flex-wrap">
              <span className="text-xs bg-sky-50 text-sky-700 px-2 py-1 rounded font-medium">{getName(mentee.managerId) || '—'}</span>
              <ArrowRight size={14} className="text-gray-300" />
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium">{getName(mentee.mentorId) || '—'}</span>
              <ArrowRight size={14} className="text-gray-300" />
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded font-medium">{mentee.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reassign */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Reassign User</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mentee *</label>
            <select value={form.menteeId} onChange={e => setForm(p => ({ ...p, menteeId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Select...</option>
              {mentees.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Assign to Mentor</label>
            <select value={form.mentorId} onChange={e => setForm(p => ({ ...p, mentorId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Select...</option>
              {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Assign to Manager</label>
            <select value={form.managerId} onChange={e => setForm(p => ({ ...p, managerId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Select...</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleSave} className={`btn-primary ${saved ? 'bg-green-500' : ''}`}>
          {saved ? '✓ Saved!' : 'Save Assignment'}
        </button>
      </div>
    </div>
  )
}
