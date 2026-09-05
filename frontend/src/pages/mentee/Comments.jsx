import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { MOCK_COMMENTS } from '../../mock/comments'
import { MOCK_LOGS } from '../../mock/logs'
import { MOCK_FEATURES } from '../../mock/features'
import { Send } from 'lucide-react'

const AVATAR_COLOR = {
  manager: 'bg-sky-500',
  mentor: 'bg-emerald-500',
  mentee: 'bg-amber-500',
}

export default function MenteeComments() {
  const { user } = useAuth()
  const [comments, setComments] = useState(MOCK_COMMENTS)
  const [replyText, setReplyText] = useState({})

  const myLogs = MOCK_LOGS.filter(l => l.menteeId === user?.id)
  const myLogIds = myLogs.map(l => l.id)
  const myComments = comments.filter(c => myLogIds.includes(c.logId))

  const topLevel = myComments.filter(c => !c.parentId)
  const replies = myComments.filter(c => c.parentId)

  const getFeatureName = (logId) => {
    const log = myLogs.find(l => l.id === logId)
    const feature = MOCK_FEATURES.find(f => f.id === log?.featureId)
    return feature?.name || 'Unknown Feature'
  }

  const handleReply = (parentId, logId) => {
    const text = replyText[parentId]
    if (!text?.trim()) return
    const newComment = {
      id: `c${Date.now()}`, logId,
      commentedBy: user.id, commenterName: user.name,
      commenterRole: user.role, commenterAvatar: user.avatar,
      text, createdAt: new Date().toISOString(), parentId,
    }
    setComments(prev => [...prev, newComment])
    setReplyText(prev => ({ ...prev, [parentId]: '' }))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Comments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Comments from your Mentor and Manager on your logs</p>
      </div>

      <div className="space-y-4">
        {topLevel.map(comment => {
          const commentReplies = replies.filter(r => r.parentId === comment.id)
          return (
            <div key={comment.id} className="card p-4">
              {/* Feature label */}
              <p className="text-xs text-indigo-600 font-medium mb-3">📦 {getFeatureName(comment.logId)}</p>

              {/* Top-level comment */}
              <div className="flex gap-3">
                <div className={`w-8 h-8 rounded-full ${AVATAR_COLOR[comment.commenterRole]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {comment.commenterAvatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">{comment.commenterName}</span>
                    <span className="text-xs text-gray-400 capitalize">{comment.commenterRole}</span>
                    <span className="text-xs text-gray-300 ml-auto">
                      {new Date(comment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              </div>

              {/* Replies */}
              {commentReplies.length > 0 && (
                <div className="mt-3 ml-11 space-y-2">
                  {commentReplies.map(reply => (
                    <div key={reply.id} className="flex gap-3">
                      <div className={`w-7 h-7 rounded-full ${AVATAR_COLOR[reply.commenterRole]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {reply.commenterAvatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-gray-800">{reply.commenterName}</span>
                          <span className="text-xs text-gray-400 capitalize">{reply.commenterRole}</span>
                        </div>
                        <p className="text-xs text-gray-700">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              <div className="mt-3 ml-11 flex gap-2">
                <input
                  type="text"
                  value={replyText[comment.id] || ''}
                  onChange={e => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleReply(comment.id, comment.logId)}
                  placeholder="Reply..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <button
                  onClick={() => handleReply(comment.id, comment.logId)}
                  className="btn-primary px-3 py-1.5"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          )
        })}

        {topLevel.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No comments yet.</div>
        )}
      </div>
    </div>
  )
}
