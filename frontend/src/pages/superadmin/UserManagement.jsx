import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Plus, Pencil, UserX } from 'lucide-react'

const ROLE_STYLE = {
  mentee: 'bg-amber-50 text-amber-700',
  mentor: 'bg-emerald-50 text-emerald-700',
  manager: 'bg-sky-50 text-sky-700',
  superadmin: 'bg-indigo-50 text-indigo-700',
}
const AVATAR_COLOR = {
  mentee: 'bg-amber-500', mentor: 'bg-emerald-500',
  manager: 'bg-sky-500', superadmin: 'bg-indigo-500',
}

function initials(name) {
  return (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'mentee', password: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getUsers()
      .then(d => setUsers(d.users || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openAdd = () => {
    setEditUser(null)
    setForm({ name: '', email: '', role: 'mentee', password: '' })
    setShowModal(true)
  }

  const openEdit = (user) => {
    setEditUser(user)
    setForm({ name: user.name, email: user.email, role: user.role, password: '' })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return
    setSaving(true)
    try {
      if (editUser) {
        const data = await api.updateUser(editUser.ROWID, { name: form.name, email: form.email, role: form.role })
        setUsers(prev => prev.map(u => u.ROWID === editUser.ROWID ? data.user : u))
      } else {
        if (!form.password.trim()) { alert('Password required for new user'); return }
        const data = await api.createUser({ name: form.name, email: form.email, role: form.role, password: form.password })
        setUsers(prev => [...prev, data.user])
      }
      setShowModal(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return
    try {
      await api.deactivateUser(id)
      setUsers(prev => prev.map(u => u.ROWID === id ? { ...u, is_active: false } : u))
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-400 text-sm">Loading users…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">{users.length} users</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New User
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.ROWID} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${AVATAR_COLOR[user.role] || 'bg-gray-400'} flex items-center justify-center text-white text-xs font-bold`}>
                      {initials(user.name)}
                    </div>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded capitalize ${ROLE_STYLE[user.role] || 'bg-gray-50 text-gray-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    user.is_active !== false ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {user.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(user)} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Edit">
                      <Pencil size={14} />
                    </button>
                    {user.is_active !== false && (
                      <button onClick={() => deactivate(user.ROWID)} className="text-gray-400 hover:text-red-500 transition-colors" title="Deactivate">
                        <UserX size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No users yet. Add the first one.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-bold text-gray-900 mb-4">{editUser ? 'Edit User' : 'New User'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                <input type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="e.g. Priya Sharma" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input type="email" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  placeholder="priya@zoho.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="mentee">Mentee</option>
                  <option value="mentor">Mentor</option>
                  <option value="manager">Manager</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              {!editUser && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
                  <input type="password" value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Initial password" />
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
