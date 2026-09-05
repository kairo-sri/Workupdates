export const MOCK_USERS = [
  { id: 'u1', name: 'Sridhar R.', email: 'sridhar@zoho.com', role: 'mentee', avatar: 'SR', managerId: 'u4', mentorId: 'u3' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@zoho.com', role: 'mentee', avatar: 'PS', managerId: 'u4', mentorId: 'u3' },
  { id: 'u3', name: 'Arjun Kumar', email: 'arjun@zoho.com', role: 'mentor', avatar: 'AK', managerId: 'u4' },
  { id: 'u4', name: 'Deepa Nair', email: 'deepa@zoho.com', role: 'manager', avatar: 'DN' },
  { id: 'u5', name: 'Ravi Menon', email: 'ravi@zoho.com', role: 'mentee', avatar: 'RM', managerId: 'u4', mentorId: 'u3' },
  { id: 'u6', name: 'Admin', email: 'admin@zoho.com', role: 'superadmin', avatar: 'SA' },
]

export const LOGIN_OPTIONS = [
  { label: 'Mentee — Sridhar R.', user: MOCK_USERS[0] },
  { label: 'Mentor — Arjun Kumar', user: MOCK_USERS[2] },
  { label: 'Manager — Deepa Nair', user: MOCK_USERS[3] },
  { label: 'Super Admin', user: MOCK_USERS[5] },
]
