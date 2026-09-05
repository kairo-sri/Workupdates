import { useState } from 'react'
import { MOCK_ESCALATIONS } from '../../mock/escalations'
import { CheckCircle2, Bell } from 'lucide-react'

const PRIORITY_STYLE = {
  low: 'bg-blue-50 text-blue-700',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-700',
}

export default function MentorEscalations() {
  const [escalations, setEscalations] = useState(MOCK_ESCALATIONS.filter(e => e.level === 'mentor'))
  const [escalateModal, setEscalateModal] = useState(null)
  const [comment, setComment] = useState('')

  const active = escalations.filter(e => e.status === 'active')
  const resolved = escalations.filter(e => e.status === 'resolved')

  const markAllResolved = () => setEscalations(prev => prev.map(e => ({ ...e, status: 'resolved' })))

  const handleEscalate = () => {
    if (!comment.trim()) return
    setEscalations(prev => prev.map(e => e.id === escalateModal ? { ...e, status: 'resolved', mentorComment: comment } : e))
    setComment('')
    setEscalateModal(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Escalations</h1>
          <p className="text-sm text-gray-500">{active.length} active · {resolved.length} resolved</p>
        </div>
        {active.length > 0 && (
          <button onClick={markAllResolved} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCircle2 size={14} /> Mark All Resolved
          </button>
        )}
      </div>

      {/* Active */}
      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Active ({active.length})</h2>
          <div className="space-y-3">
            {active.map(e => (
              <div key={e.id} className="card border-amber-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">{e.menteeAvatar}</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{e.menteeName}</p>
                      <p className="text-xs text-gray-400">{e.menteeEmail}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded uppercase ${PRIORITY_STYLE[e.priority]}`}>{e.priority}</span>
                    <span className="text-xs text-gray-500">{e.daysBlocked} days blocked</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">📦 Feature: {e.featureName}</p>
                  <p className="text-sm text-gray-700">⚠️ {e.description}</p>
                </div>

                {/* Timeline dots */}
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${i < e.daysBlocked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {i + 1}
                    </div>
                  ))}
                  <span className="ml-2 text-xs text-red-500 font-semibold">{e.daysBlocked} consecutive days</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button className="flex items-center gap-1.5 bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                    <Bell size={13} /> Send Reminder
                  </button>
                  <button
                    onClick={() => setEscalateModal(e.id)}
                    className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    🚨 Escalate to Manager
                  </button>
                  <button
                    onClick={() => setEscalations(prev => prev.map(es => es.id === e.id ? { ...es, status: 'resolved' } : es))}
                    className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                  >
                    <CheckCircle2 size={13} /> Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resolved ({resolved.length})</h2>
          <div className="space-y-2">
            {resolved.map(e => (
              <div key={e.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{e.menteeName} · {e.featureName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.description}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  <CheckCircle2 size={12} /> Resolved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Escalate to Manager modal */}
      {escalateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-bold text-gray-900 mb-2">Escalate to Manager</h2>
            <p className="text-sm text-gray-500 mb-4">Add a comment before escalating. This will be forwarded to the Manager.</p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none mb-4"
              placeholder="Your comment for the Manager..."
            />
            <div className="flex gap-2">
              <button onClick={() => setEscalateModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleEscalate} className="btn-primary flex-1">Escalate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
