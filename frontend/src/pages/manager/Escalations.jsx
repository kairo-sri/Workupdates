import { useState } from 'react'
import { MOCK_ESCALATIONS } from '../../mock/escalations'
import { CheckCircle2, MessageSquare } from 'lucide-react'

const PRIORITY_STYLE = {
  low: 'bg-blue-50 text-blue-700',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-700',
}

export default function ManagerEscalations() {
  const [escalations, setEscalations] = useState(MOCK_ESCALATIONS)
  const [commentModal, setCommentModal] = useState(null)
  const [commentText, setCommentText] = useState('')

  const active = escalations.filter(e => e.status === 'active')
  const resolved = escalations.filter(e => e.status === 'resolved')

  const handleComment = () => {
    if (!commentText.trim()) return
    setEscalations(prev => prev.map(e => e.id === commentModal ? { ...e, mentorComment: commentText } : e))
    setCommentText('')
    setCommentModal(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Escalations</h1>
        <p className="text-sm text-gray-500">{active.length} active · {resolved.length} resolved</p>
      </div>

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
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded uppercase ${PRIORITY_STYLE[e.priority]}`}>{e.priority}</span>
                    <span className="text-xs text-gray-500">{e.daysBlocked} days blocked</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded capitalize">via {e.level}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">📦 Feature: {e.featureName}</p>
                  <p className="text-sm text-gray-700">⚠️ {e.description}</p>
                  {e.mentorComment && (
                    <p className="text-xs text-indigo-600 mt-2 border-t border-gray-200 pt-2">
                      💬 Mentor note: {e.mentorComment}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${i < e.daysBlocked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {i + 1}
                    </div>
                  ))}
                  <span className="ml-2 text-xs text-red-500 font-semibold">{e.daysBlocked}d</span>
                </div>

                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => setCommentModal(e.id)}
                    className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-100"
                  >
                    <MessageSquare size={13} /> Add Comment
                  </button>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-gray-300" /> Only mentee can mark resolved
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {commentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-bold text-gray-900 mb-2">Add Comment</h2>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none mb-4"
              placeholder="Your comment on this escalation..." />
            <div className="flex gap-2">
              <button onClick={() => setCommentModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleComment} className="btn-primary flex-1">Save Comment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
