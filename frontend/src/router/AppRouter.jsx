import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Login from '../pages/Login'
import Layout from '../components/Layout'

// Mentee pages
import MenteeDashboard from '../pages/mentee/Dashboard'
import MenteeFeatures from '../pages/mentee/Features'
import LogWork from '../pages/mentee/LogWork'
import WorkHistory from '../pages/mentee/WorkHistory'
import MyBlockers from '../pages/mentee/MyBlockers'
import MenteeComments from '../pages/mentee/Comments'

// Mentor pages
import MentorDashboard from '../pages/mentor/Dashboard'
import SheetView from '../pages/mentor/SheetView'
import MentorFeatures from '../pages/mentor/Features'
import MentorEscalations from '../pages/mentor/Escalations'

// Manager pages
import ManagerDashboard from '../pages/manager/Dashboard'
import TeamHierarchy from '../pages/manager/TeamHierarchy'
import ManagerHistory from '../pages/manager/History'
import ManagerFeatures from '../pages/manager/Features'
import ManagerEscalations from '../pages/manager/Escalations'
import Export from '../pages/manager/Export'

// Super Admin pages
import UserManagement from '../pages/superadmin/UserManagement'
import HierarchyManagement from '../pages/superadmin/HierarchyManagement'
import SheetsIntegration from '../pages/superadmin/SheetsIntegration'
import AdminFeatures from '../pages/superadmin/Features'
import SystemSettings from '../pages/superadmin/SystemSettings'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RoleHome() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  const homes = {
    mentee: '/mentee/dashboard',
    mentor: '/mentor/dashboard',
    manager: '/manager/dashboard',
    superadmin: '/admin/users',
  }
  return <Navigate to={homes[user.role]} replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RoleHome />} />

        {/* Mentee routes */}
        <Route path="/mentee" element={<ProtectedRoute allowedRoles={['mentee']}><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<MenteeDashboard />} />
          <Route path="features" element={<MenteeFeatures />} />
          <Route path="log-work" element={<LogWork />} />
          <Route path="history" element={<WorkHistory />} />
          <Route path="blockers" element={<MyBlockers />} />
          <Route path="comments" element={<MenteeComments />} />
        </Route>

        {/* Mentor routes */}
        <Route path="/mentor" element={<ProtectedRoute allowedRoles={['mentor']}><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<MentorDashboard />} />
          <Route path="sheet-view" element={<SheetView />} />
          <Route path="features" element={<MentorFeatures />} />
          <Route path="escalations" element={<MentorEscalations />} />
        </Route>

        {/* Manager routes */}
        <Route path="/manager" element={<ProtectedRoute allowedRoles={['manager']}><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="hierarchy" element={<TeamHierarchy />} />
          <Route path="history" element={<ManagerHistory />} />
          <Route path="features" element={<ManagerFeatures />} />
          <Route path="escalations" element={<ManagerEscalations />} />
          <Route path="export" element={<Export />} />
        </Route>

        {/* Super Admin routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['superadmin']}><Layout /></ProtectedRoute>}>
          <Route path="users" element={<UserManagement />} />
          <Route path="hierarchy" element={<HierarchyManagement />} />
          <Route path="sheets" element={<SheetsIntegration />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
