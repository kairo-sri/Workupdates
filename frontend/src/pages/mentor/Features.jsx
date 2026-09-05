import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { AlertCircle, Circle, CheckCircle2 } from 'lucide-react'

const STATUS_ICON = {
  active: <Circle size={13} className="text-blue-500" />,
  blocked: <AlertCircle size={13} className="text-red-500" />,
  completed: <CheckCircle2 size={13} className="text-green-500" />,
}
const PROGRESS_COLOR = { active: 'bg-blue-500', blocked: 'bg-red-500', completed: 'bg-green-500' }

export default function MentorFeatures() {
  const [features, setFeatures] = useState([])
  const [mentees, setMentees] = useState([])
  const [filterMentee, setFilterMentee] = useState('all')
  const [filterStatus, setFilterStatus] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getFeatures(), api.getMyMentees()])
      .then(([fd, md]) => {
        setFeatures(fd.features || [])
        setMentees(md.mentees || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = features.filter(f => {
    const menteeMatch = filterMentee === 'all' || String(f.mentee_id) === String(filterMentee)
    const statusMatch = filterStatus === 'All' || f.feature_status === filterStatus.toLowerCase()
    return menteeMatch && statusMatch
  })

  if (loading) return <div className="text-center py-16 text-gray-400 text-sm">Loading features…</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Mentees' Features</h1>
        <p className="text-sm text-gray-500 mt-0.5">{features.length} features across {mentees.length} mentees</p>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <select value={filterMentee} onChange={e => setFilterMentee(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="all">All Mentees</option>
          {mentees.map(m => <option key={m.ROWID} value={m.ROWID}>{m.name}</option>)}
        </select>
        {['All', 'Active', 'Blocked', 'Completed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === s ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>{s}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(feature => (
          <div key={feature.ROWID} className={`card p-4 ${feature.feature_status === 'blocked' ? 'border-red-200 bg-red-50/30' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {STATUS_ICON[feature.feature_status] || STATUS_ICON.active}
                  <span className="font-semibold text-gray-900 text-sm">{feature.name}</span>
                  {feature.feature_status === 'blocked' && (
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">BLOCKED</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{feature.feature_description}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${PROGRESS_COLOR[feature.feature_status] || 'bg-blue-500'}`}
                      style={{ width: `${feature.progress || 0}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{feature.progress || 0}%</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-gray-400">{feature.category}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No features found.</div>
        )}
      </div>
    </div>
  )
}
