import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { CheckCircle2, Plus } from 'lucide-react'

const PRIORITY_STYLE = {
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
}

export default function MyBlockers() {
  const [blockers, setBlockers] = useState([])
  const [features, setFeatures] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ featureId: '', description: '', priority: 'medium' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getBlockers(), api.getFeatures()])
      .then(([bd, fd]) => {
        setBlockers(bd.blockers || [])
        setFeatures(fd.features || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const active = blockers.filter(b => b.blocker_status === 'active')
  const resolved = blockers.filter(b => b.blocker_status === 'resolved')

  const markResolved = async (id) => {
    try {
      await api.resolveBlocker(id)
      setBlockers(prev => prev.map(b => b.ROWID === id ? { ...b, blocker_status: 'resolved' } : b))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleAdd = async () => {
    if (!form.featureId || !form.description.trim()) return
    setSaving(true)
    try {
      const data = await api.createBlocker({
        feature_id: form.featureId,
        description: form.description,
        priority: form.priority,
      })
      setBlockers(prev => [...prev, data.blocker])
      setForm({ featureId: '', description: '', priority: 'medium' })
      setShowModal(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const getFeatureName = (id) => features.find(f => String(f.ROWID) === String(id))?.name || 'Unknown Feature'

  if (loading) return <div className="text-center py-16 text-gray-400 text-sm">Loading blockers…</div>

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

      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Active ({active.length})</h2>
          <div className="space-y-3">
            {active.map(blocker => (
              <div key={blocker.ROWID} className="card border-red-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">📦 {getFeatureName(blocker.feature_id)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-semibold border rounded px-2 py-0.5 uppercase ${PRIORITY_STYLE[blocker.blocker_priority] || PRIORITY_STYLE.medium}`}>
                        {blocker.blocker_priority}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Blocker</p>
                  <p className="text-sm text-gray-700">{blocker.blocker_description}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => markResolved(blocker.ROWID)}
                    className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                    <CheckCircle2 size={13} /> Mark as Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resolved ({resolved.length})</h2>
          <div className="space-y-2">
            {resolved.map(blocker => (
              <div key={blocker.ROWID} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{getFeatureName(blocker.feature_id)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{blocker.blocker_description}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  <CheckCircle2 size={12} /> Resolved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {active.length === 0 && resolved.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">No blockers reported yet.</div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-bold text-gray-900 mb-4">Report Blocker</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Feature *</label>
                <select value={form.featureId}
                  onChange={e => setForm(p => ({ ...p, featureId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="">Select feature...</option>
                  {features.map(f => <option key={f.ROWID} value={f.ROWID}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select value={form.priority}
                  onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Describe the blocker *</label>
                <textarea value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  placeholder="What is blocking you?" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Reporting…' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
