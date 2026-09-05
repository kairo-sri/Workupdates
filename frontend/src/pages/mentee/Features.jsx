import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react'

const CATEGORIES = ['Feature', 'Bug Fix', 'Research', 'Documentation', 'Refactor', 'Testing']

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
  const [features, setFeatures] = useState([])
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', feature_description: '', category: 'Feature' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getFeatures()
      .then(d => setFeatures(d.features || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = features.filter(f => {
    if (filter === 'Active') return f.feature_status === 'active'
    if (filter === 'Blocked') return f.feature_status === 'blocked'
    if (filter === 'Completed') return f.feature_status === 'completed'
    return true
  })

  const handleAdd = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const data = await api.createFeature({
        name: form.name,
        feature_description: form.feature_description,
        category: form.category,
      })
      setFeatures(prev => [...prev, data.feature])
      setForm({ name: '', feature_description: '', category: 'Feature' })
      setShowModal(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (rowid, status) => {
    setFeatures(prev => prev.map(f => f.ROWID === rowid ? { ...f, feature_status: status } : f))
    try {
      await api.updateFeature(rowid, { feature_status: status })
    } catch (err) {
      console.error(err)
    }
  }

  const handleProgressChange = async (rowid, progress) => {
    setFeatures(prev => prev.map(f => f.ROWID === rowid ? { ...f, progress: parseInt(progress) } : f))
    try {
      await api.updateFeature(rowid, { progress: parseInt(progress) })
    } catch (err) {
      console.error(err)
    }
  }

  const blockedCount = features.filter(f => f.feature_status === 'blocked').length

  if (loading) return <div className="text-center py-16 text-gray-400 text-sm">Loading features…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Features</h1>
          <p className="text-sm text-gray-500 mt-0.5">{features.length} features · {blockedCount} blocked</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Feature
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {['All', 'Active', 'Blocked', 'Completed'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>{tab}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(feature => (
          <div key={feature.ROWID} className={`card p-4 ${feature.feature_status === 'blocked' ? 'border-red-200 bg-red-50/30' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {STATUS_ICON[feature.feature_status] || STATUS_ICON.active}
                  <span className="font-semibold text-gray-900 text-sm">{feature.name}</span>
                  {feature.feature_status === 'blocked' && (
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">BLOCKED</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{feature.feature_description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${PROGRESS_COLOR[feature.feature_status] || 'bg-blue-500'}`}
                      style={{ width: `${feature.progress || 0}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{feature.progress || 0}%</span>
                </div>
                <input type="range" min="0" max="100" value={feature.progress || 0}
                  onChange={e => handleProgressChange(feature.ROWID, e.target.value)}
                  className="w-full mt-1 accent-indigo-600" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select value={feature.feature_status || 'active'}
                  onChange={e => handleStatusChange(feature.ROWID, e.target.value)}
                  className={`text-xs font-medium border rounded-lg px-2 py-1.5 ${STATUS_COLOR[feature.feature_status] || STATUS_COLOR.active}`}>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No features found.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-bold text-gray-900 mb-4">New Feature</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Feature Name *</label>
                <input type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="e.g. Dark Mode Support" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input type="text" value={form.feature_description}
                  onChange={e => setForm(p => ({ ...p, feature_description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="Short description" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Adding…' : 'Add Feature'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
