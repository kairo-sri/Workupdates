import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { MOCK_BLOCKERS } from '../../mock/blockers'
import { MOCK_FEATURES } from '../../mock/features'
import { CheckCircle2, AlertTriangle, MessageSquare, Plus } from 'lucide-react'

const PRIORITY_STYLE = {
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
}

export default function MyBlockers() {
  const { user } = useAuth()
  const [blockers, setBlockers] = useState(MOCK_BLOCKERS.filter(b => b.menteeId === user?.id))
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ featureId: '', description: '', priority: 'medium' })

  const features = MOCK_FEATURES.filter(f => f.menteeId === user?.id)

  const active = blockers.filter(b => b.status === 'active')
  const resolved = blockers.filter(b => b.status === 'resolved')

  const markResolved = (id) => {
    setBlockers(prev => prev.map(b => b.id === id ? { ...b, status: 'resolved' } : b))
  }

  const handleAdd = () => {
    if (!form.featureId || !form.description.trim()) return
    const feature = features.find(f => f.id === form.featureId)
    const newBlocker = {
      id: `b${Date.now()}`, featureId: form.featureId, menteeId: user.id,
      description: form.description, priority: form.priority,
      status: 'active', daysBlocked: 0, createdAt: new Date().toISOString().split('T')[0],
      featureName: feature?.name
    }
    setBlockers(prev => [...prev, newBlocker])
    setForm({ featureId: '', description: '', priority: 'medium' })
    setShowModal(false)
  }

  const getFeatureName = (id) => features.find(f => f.id === id)?.name || 'Unknown Feature'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Blockers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{active.length} active · {resolved.length} resolved</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Report Blocker
        </button>
      </div>

      {/* Active blockers */}
      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Active ({active.length})</h2>
          <div className="space-y-3">
            {active.map(blocker => (
              <div key={blocker.id} className="card border-red-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">📦 {getFeatureName(blocker.featureId)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-semibold border rounded px-2 py-0.5 uppercase ${PRIORITY_STYLE[blocker.priority]}`}>
                        {blocker.priority}
                      </span>
                      <span className="text-xs text-gray-500">{blocker.daysBlocked} days blocked</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Blocker</p>
                  <p className="text-sm text-gray-700">{blocker.description}</p>
                </div>

                {/* Timeline dots */}
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Timeline</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 7 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          i < blocker.daysBlocked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                    <span className="ml-2 text-xs text-red-500 font-semibold">{blocker.daysBlocked}d</span>
                  </div>
                  <div className="flex gap-1 mt-1 pl-0.5">
                    {Array.from({ length: 7 }, (_, i) => (
                      <span key={i} className="text-[9px] text-gray-400 w-7 text-center">D{i + 1}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button className="btn-danger text-xs flex items-center gap-1.5 py-1.5">
                    🚨 Escalate to Mentor
                  </button>
                  <button className="btn-danger text-xs flex items-center gap-1.5 py-1.5">
                    🚨 Escalate to Manager
                  </button>
                  <button
                    onClick={() => markResolved(blocker.id)}
                    className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                  >
                    <CheckCircle2 size={13} /> Mark as Resolved
                  </button>
                  <button className="flex items-center gap-1.5 bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                    <MessageSquare size={13} /> Add Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resolved ({resolved.length})</h2>
          <div className="space-y-2">
            {resolved.map(blocker => (
              <div key={blocker.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{getFeatureName(blocker.featureId)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{blocker.description}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  <CheckCircle2 size={12} /> Resolved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Blocker Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-bold text-gray-900 mb-4">Report Blocker</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Feature *</label>
                <select
                  value={form.featureId}
                  onChange={e => setForm(p => ({ ...p, featureId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">Select feature...</option>
                  {features.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Describe the blocker *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  placeholder="What is blocking you?"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAdd} className="btn-primary flex-1">Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
