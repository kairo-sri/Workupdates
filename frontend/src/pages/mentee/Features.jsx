import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { MOCK_FEATURES, CATEGORIES } from '../../mock/features'
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

const STATUS_ICON = {
  active: <Circle size={14} className="text-blue-500" />,
  blocked: <AlertCircle size={14} className="text-red-500" />,
  completed: <CheckCircle2 size={14} className="text-green-500" />,
}

const STATUS_COLOR = {
  active: 'text-blue-600 bg-blue-50',
  blocked: 'text-red-600 bg-red-50',
  completed: 'text-green-600 bg-green-50',
}

const PROGRESS_COLOR = {
  active: 'bg-blue-500',
  blocked: 'bg-red-500',
  completed: 'bg-green-500',
}

export default function MenteeFeatures() {
  const { user } = useAuth()
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [features, setFeatures] = useState(MOCK_FEATURES.filter(f => f.menteeId === user?.id))
  const [form, setForm] = useState({ name: '', description: '', category: 'Feature' })

  const filtered = filter === 'All' ? features : features.filter(f => {
    if (filter === 'Active') return f.status === 'active'
    if (filter === 'Blocked') return f.status === 'blocked'
    if (filter === 'Completed') return f.status === 'completed'
    return true
  })

  const handleAdd = () => {
    if (!form.name.trim()) return
    const newFeature = {
      id: `f${Date.now()}`, name: form.name, description: form.description,
      category: form.category, status: 'active', progress: 0,
      menteeId: user.id, createdBy: user.id,
    }
    setFeatures(prev => [...prev, newFeature])
    setForm({ name: '', description: '', category: 'Feature' })
    setShowModal(false)
  }

  const handleStatusChange = (id, status) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, status } : f))
  }

  const handleProgressChange = (id, progress) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, progress: parseInt(progress) } : f))
  }

  const blockedCount = features.filter(f => f.status === 'blocked').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Features</h1>
          <p className="text-sm text-gray-500 mt-0.5">{features.length} features · {blockedCount} blocked</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Feature
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['All', 'Active', 'Blocked', 'Completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feature list */}
      <div className="space-y-3">
        {filtered.map(feature => (
          <div key={feature.id} className={`card p-4 ${feature.status === 'blocked' ? 'border-red-200 bg-red-50/30' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {STATUS_ICON[feature.status]}
                  <span className="font-semibold text-gray-900 text-sm">{feature.name}</span>
                  {feature.status === 'blocked' && (
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">BLOCKED</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{feature.description}</p>
                {feature.blockerReason && (
                  <p className="text-xs text-amber-700 flex items-center gap-1 mb-2">
                    ⚠️ {feature.blockerReason}
                  </p>
                )}
                {/* Progress */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${PROGRESS_COLOR[feature.status]}`}
                      style={{ width: `${feature.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{feature.progress}%</span>
                </div>
                {/* Progress slider */}
                <input
                  type="range" min="0" max="100"
                  value={feature.progress}
                  onChange={e => handleProgressChange(feature.id, e.target.value)}
                  className="w-full mt-1 accent-indigo-600"
                />
              </div>

              {/* Status dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={feature.status}
                  onChange={e => handleStatusChange(feature.id, e.target.value)}
                  className={`text-xs font-medium border rounded-lg px-2 py-1.5 ${STATUS_COLOR[feature.status]}`}
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                </select>
                <button className="text-gray-300 hover:text-red-400 transition-colors" title="Delete (Super Admin only)">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No features found.</div>
        )}
      </div>

      {/* Add Feature Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-bold text-gray-900 mb-4">New Feature</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Feature Name *</label>
                <input
                  type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="e.g. Dark Mode Support"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input
                  type="text" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAdd} className="btn-primary flex-1">Add Feature</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
