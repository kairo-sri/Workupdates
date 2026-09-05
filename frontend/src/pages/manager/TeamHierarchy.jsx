import { useState } from 'react'
import { MOCK_USERS } from '../../mock/users'
import { MOCK_FEATURES } from '../../mock/features'
import { ChevronRight, X } from 'lucide-react'

export default function TeamHierarchy() {
  const [selectedUser, setSelectedUser] = useState(null)

  const mentors = MOCK_USERS.filter(u => u.role === 'mentor')
  const mentees = MOCK_USERS.filter(u => u.role === 'mentee')
  const getMentees = (mentorId) => mentees.filter(m => m.mentorId === mentorId)
  const getUserFeatures = (userId) => MOCK_FEATURES.filter(f => f.menteeId === userId)

  const AVATAR_COLOR = { mentor: 'bg-emerald-500', mentee: 'bg-amber-500' }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Team Hierarchy</h1>
        <p className="text-sm text-gray-500">Click a name to view their features</p>
      </div>

      <div className="flex gap-6">
        {/* Tree */}
        <div className="flex-1">
          {mentors.map(mentor => (
            <div key={mentor.id} className="mb-4">
              {/* Mentor node */}
              <div
                onClick={() => setSelectedUser(mentor)}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors mb-2 max-w-xs"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">{mentor.avatar}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{mentor.name}</p>
                  <p className="text-xs text-gray-400">Mentor</p>
                </div>
                <ChevronRight size={14} className="text-gray-400" />
              </div>

              {/* Mentees under this mentor */}
              <div className="ml-8 space-y-2">
                {getMentees(mentor.id).map(mentee => (
                  <div
                    key={mentee.id}
                    onClick={() => setSelectedUser(mentee)}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-50 transition-colors max-w-xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">{mentee.avatar}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{mentee.name}</p>
                      <p className="text-xs text-gray-400">Mentee · {getUserFeatures(mentee.id).length} features</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Feature panel */}
        {selectedUser && (
          <div className="w-80 card p-4 h-fit">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${AVATAR_COLOR[selectedUser.role] || 'bg-gray-400'} flex items-center justify-center text-white text-xs font-bold`}>
                  {selectedUser.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{selectedUser.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{selectedUser.role}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)}><X size={16} className="text-gray-400" /></button>
            </div>

            {selectedUser.role === 'mentee' ? (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Features</p>
                <div className="space-y-2">
                  {getUserFeatures(selectedUser.id).map(f => (
                    <div key={f.id} className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-xs font-semibold text-gray-800">{f.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-1">
                          <div className="h-1 rounded-full bg-indigo-500" style={{ width: `${f.progress}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-400">{f.progress}%</span>
                      </div>
                    </div>
                  ))}
                  {getUserFeatures(selectedUser.id).length === 0 && (
                    <p className="text-xs text-gray-400">No features yet.</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">Select a mentee to view their features.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
