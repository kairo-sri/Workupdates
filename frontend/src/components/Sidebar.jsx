import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, ListTodo, ClipboardList, History,
  ShieldAlert, MessageSquare, Users, GitBranch,
  Sheet, Settings, Download, Eye, AlertTriangle
} from 'lucide-react'

const NAV = {
  mentee: [
    { to: '/mentee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/mentee/features', icon: ListTodo, label: 'Features' },
    { to: '/mentee/log-work', icon: ClipboardList, label: 'Log Work' },
    { to: '/mentee/history', icon: History, label: 'Work History' },
    { to: '/mentee/blockers', icon: ShieldAlert, label: 'My Blockers' },
    { to: '/mentee/comments', icon: MessageSquare, label: 'Comments' },
  ],
  mentor: [
    { to: '/mentor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/mentor/sheet-view', icon: Eye, label: 'Sheet View' },
    { to: '/mentor/features', icon: ListTodo, label: 'Features' },
    { to: '/mentor/escalations', icon: AlertTriangle, label: 'Escalations' },
  ],
  manager: [
    { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/manager/hierarchy', icon: GitBranch, label: 'Team Hierarchy' },
    { to: '/manager/history', icon: History, label: 'History' },
    { to: '/manager/features', icon: ListTodo, label: 'Features' },
    { to: '/manager/escalations', icon: AlertTriangle, label: 'Escalations' },
    { to: '/manager/export', icon: Download, label: 'Export' },
  ],
  superadmin: [
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/hierarchy', icon: GitBranch, label: 'Hierarchy' },
    { to: '/admin/sheets', icon: Sheet, label: 'Zoho Sheets' },
    { to: '/admin/features', icon: ListTodo, label: 'Features' },
    { to: '/admin/settings', icon: Settings, label: 'System Settings' },
  ],
}

const ROLE_COLORS = {
  mentee: 'bg-amber-500',
  mentor: 'bg-emerald-500',
  manager: 'bg-sky-500',
  superadmin: 'bg-indigo-500',
}

const ROLE_LABELS = {
  mentee: 'Mentee',
  mentor: 'Mentor',
  manager: 'Manager',
  superadmin: 'Super Admin',
}

export default function Sidebar() {
  const { user } = useAuth()
  const links = NAV[user?.role] || []

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <span className="text-lg font-bold text-indigo-600">Workpulse</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[user?.role]} flex items-center justify-center text-white text-xs font-bold`}>
            {user?.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">{ROLE_LABELS[user?.role]}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
