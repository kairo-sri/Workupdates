import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function HierarchyManagement() {
  const [users, setUsers] = useState([])
  const [hierarchy, setHierarchy] = useState([])
  const [form, setForm] = useState({ menteeId: '', mentorId: '', managerId: '' })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const mentees  = users.filter(u => u.role === 'mentee')
  const mentors  = users.filter(u => u.role === 'mentor')
  const managers = users.filter(u => u.role === 'manager')

  useEffect(() => {
    Promise.all([api.getUsers(), api.getHierarchy()])
      .then(([ud, hd]) => {
        setUsers(ud.users || [])
        setHierarchy(hd.hierarchy || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.menteeId) return
    setSaving(true)
    try {
      await api.setHierarchy({
        mentee_id: form.menteeId,
        mentor_id: form.mentorId || null,
        manager_id: form.managerId || null,
      })
      const data = await api.getHierarchy()
      setHierarchy(data.hierarchy || [])
      setSaved(true)
      setForm({ menteeId: '', mentorId: '', managerId: '' })
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const getName = (id) => users.find(u => String(u.ROWID) === String(id))?.name || '—'

  if (loading) return <div className="text-center py-16 text-gray-400 text-sm">Loading hierarchy…</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Hierarchy Management</h1>
        <p className="text-sm text-gray-500">Assign and restructure reporting relationships</p>
      </div>

      {/* Assignment form */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Assign / Update Relationship</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mentee *</label>
            <select value={form.menteeId} onChange={e => setForm(p => ({ ...p, menteeId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Select mentee…</option>
              {mentees.map(u => <option key={u.ROWID} value={u.ROWID}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Assign Mentor</label>
            <select value={form.mentorId} onChange={e => setForm(p => ({ ...p, mentorId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Select mentor…</option>
              {mentors.map(u => <option key={u.ROWID} value={u.ROWID}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Assign Manager</label>
            <select value={form.managerId} onChange={e => setForm(p => ({ ...p, managerId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Select manager…</option>
              {managers.map(u => <option key={u.ROWID} value={u.ROWID}>{u.name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleSave} disabled={!form.menteeId || saving}
          className="btn-primary disabled:opacity-50">
          {saved ? '✅ Saved!' : saving ? 'Saving…' : 'Save Assignment'}
        </button>
      </div>

      {/* Current hierarchy table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Current Assignments</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Mentee</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400"><ArrowRight size={12} className="inline" /></th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Mentor</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-400"><ArrowRight size={12} className="inline" /></th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Manager</th>
            </tr>
          </thead>
          <tbody>
            {hierarchy.map((h, i) => (
              <tr key={h.ROWID || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-gray-800">{getName(h.mentee_id)}</td>
                <td className="px-4 py-3 text-gray-300"><ArrowRight size={12} /></td>
                <td className="px-4 py-3 text-gray-600">{getName(h.mentor_id)}</td>
                <td className="px-4 py-3 text-gray-300"><ArrowRight size={12} /></td>
                <td className="px-4 py-3 text-gray-600">{getName(h.manager_id)}</td>
              </tr>
            ))}
            {hierarchy.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No assignments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
