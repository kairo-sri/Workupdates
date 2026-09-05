import { useState } from 'react'
import { MOCK_FEATURES, CATEGORIES } from '../../mock/features'
import { MOCK_USERS } from '../../mock/users'
import { Plus, Trash2, AlertCircle, Circle, CheckCircle2 } from 'lucide-react'

const STATUS_ICON = {
  active: <Circle size={13} className="text-blue-500" />,
  blocked: <AlertCircle size={13} className="text-red-500" />,
  completed: <CheckCircle2 size={13} className="text-green-500" />,
}
const PROGRESS_COLOR = { active: 'bg-blue-500', blocked: 'bg-red-500', completed: 'bg-green-500' }

export default function AdminFeatures() {
  const mentees = MOCK_USERS.filter(u => u.role === 'mentee')
  const [features, setFeatures] = useState(MOCK_FEATURES)
  const [filterMentee, setFilterMentee] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', category: 'Feature', menteeId: '' })

  const filtered = filterMentee === 'all' ? features : features.filter(f => f.menteeId === filterMentee)
  const getMenteeName = id => MOCK_USERS.find(u => u.id === id)?.name || 'Unknown'

  const handleAdd = () => {
    if (!form.name.trim() || !form.menteeId) return
    setFeatures(prev => [...prev, {
      id: `f${Date.now()}`, name: form.name, description: form.description,
      category: form.category, status: 'active', progress: 0,
      menteeId: form.menteeId, createdBy: 'u6',
    }])
    setForm({ name: '', description: '', category: 'Feature', menteeId: '' })
    setShowModal(false)
  }

  const handleDelete = (id) => setFeatures(prev => prev.filter(f => f.id !== id))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Features</h1>
          <p className="text-sm text-gray-500">{filtered.length} features</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> New Feature</button>
      </div>

      <div className="flex gap-3 mb-5">
        <select value={filterMentee} onChange={e => setFilterMentee(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="all">All Mentees</option>
          {mentees.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(f => (
          <div key={f.id} className={`card p-4 ${f.status === 'blocked' ? 'border-red-200 bg-red-50/20' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  {STATUS_ICON[f.status]}
                  <span className="font-semibold text-gray-900 text-sm">{f.name}</span>
                  {f.status === 'blocked' && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">BLOCKED</span>}
                </div>
                <p className="text-xs text-gray-500 mb-2">{f.description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${PROGRESS_COLOR[f.status]}`} style={{ width: `${f.progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{f.progress}%</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">{getMenteeName(f.menteeId)}</span>
                <button onClick={() => handleDelete(f.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-bold text-gray-900 mb-4">New Feature</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Assign to Mentee *</label>
                <select value={form.menteeId} onChange={e => setForm(p => ({ ...p, menteeId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="">Select mentee...</option>
                  {mentees.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Feature Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Feature name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Short description" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
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
