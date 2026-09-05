import { useState } from 'react'
import { MOCK_USERS } from '../../mock/users'
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

export default function UserManagement() {
  const [users, setUsers] = useState(MOCK_USERS.filter(u => u.role !== 'superadmin'))
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'mentee' })

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form } : u))
    } else {
      const initials = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      setUsers(prev => [...prev, { id: `u${Date.now()}`, ...form, avatar: initials, isActive: true }])
    }
    setForm({ name: '', email: '', role: 'mentee' })
    setEditUser(null)
    setShowModal(false)
  }

  const openEdit = (user) => {
    setEditUser(user)
    setForm({ name: user.name, email: user.email, role: user.role })
    setShowModal(true)
  }

  const deactivate = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: false } : u))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">{users.length} users</p>
        </div>
        <button onClick={() => { setEditUser(null); setForm({ name: '', email: '', role: 'mentee' }); setShowModal(true) }} className="btn-primary flex items-center gap-2">
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
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${AVATAR_COLOR[user.role]} flex items-center justify-center text-white text-xs font-bold`}>{user.avatar}</div>
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded capitalize ${ROLE_STYLE[user.role]}`}>{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${user.isActive === false ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {user.isActive === false ? 'Inactive' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(user)} className="text-gray-400 hover:text-indigo-600 transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => deactivate(user.id)} className="text-gray-400 hover:text-red-500 transition-colors"><UserX size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-bold text-gray-900 mb-4">{editUser ? 'Edit User' : 'New User'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="john@zoho.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
                <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="mentee">Mentee</option>
                  <option value="mentor">Mentor</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1">{editUser ? 'Save Changes' : 'Create User'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
