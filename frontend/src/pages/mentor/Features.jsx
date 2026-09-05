import { useState } from 'react'
import { MOCK_FEATURES } from '../../mock/features'
import { MOCK_USERS } from '../../mock/users'
import { AlertCircle, Circle, CheckCircle2 } from 'lucide-react'

const STATUS_ICON = {
  active: <Circle size={13} className="text-blue-500" />,
  blocked: <AlertCircle size={13} className="text-red-500" />,
  completed: <CheckCircle2 size={13} className="text-green-500" />,
}

const PROGRESS_COLOR = { active: 'bg-blue-500', blocked: 'bg-red-500', completed: 'bg-green-500' }

export default function MentorFeatures() {
  const mentees = MOCK_USERS.filter(u => u.role === 'mentee')
  const [filterMentee, setFilterMentee] = useState('all')
  const [filterStatus, setFilterStatus] = useState('All')

  const features = MOCK_FEATURES.filter(f => {
    const menteeMatch = filterMentee === 'all' || f.menteeId === filterMentee
    const statusMatch = filterStatus === 'All' || f.status === filterStatus.toLowerCase()
    return menteeMatch && statusMatch
  })

  const getMenteeName = (id) => MOCK_USERS.find(u => u.id === id)?.name || 'Unknown'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Features</h1>
          <p className="text-sm text-gray-500">{features.length} features across your mentees</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select
          value={filterMentee}
          onChange={e => setFilterMentee(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="all">All Mentees</option>
          {mentees.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <div className="flex gap-1.5">
          {['All', 'Active', 'Blocked', 'Completed'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Feature list */}
      <div className="space-y-3">
        {features.map(f => (
          <div key={f.id} className={`card p-4 ${f.status === 'blocked' ? 'border-red-200 bg-red-50/20' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  {STATUS_ICON[f.status]}
                  <span className="font-semibold text-gray-900 text-sm">{f.name}</span>
                  {f.status === 'blocked' && <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">BLOCKED</span>}
                </div>
                <p className="text-xs text-gray-500 mb-1">{f.description}</p>
                {f.blockerReason && <p className="text-xs text-amber-700 mb-2">⚠️ {f.blockerReason}</p>}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${PROGRESS_COLOR[f.status]}`} style={{ width: `${f.progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{f.progress}%</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-gray-500 mb-1">Mentee</p>
                <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">{getMenteeName(f.menteeId)}</span>
              </div>
            </div>
          </div>
        ))}
        {features.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No features found.</div>}
      </div>
    </div>
  )
}
