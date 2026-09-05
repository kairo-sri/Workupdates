import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { CheckCircle2 } from 'lucide-react'

const PRIORITY_STYLE = {
  low: 'bg-blue-50 text-blue-700',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-700',
}

export default function MentorEscalations() {
  const [escalations, setEscalations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getEscalations()
      .then(d => setEscalations(d.escalations || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const active = escalations.filter(e => e.escalation_status === 'active')
  const resolved = escalations.filter(e => e.escalation_status === 'resolved')

  const markResolved = async (id) => {
    try {
      await api.resolveEscalation(id)
      setEscalations(prev => prev.map(e => e.ROWID === id ? { ...e, escalation_status: 'resolved' } : e))
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-400 text-sm">Loading escalations…</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Escalations</h1>
        <p className="text-sm text-gray-500 mt-0.5">{active.length} active · {resolved.length} resolved</p>
      </div>

      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Active ({active.length})</h2>
          <div className="space-y-3">
            {active.map(esc => (
              <div key={esc.ROWID} className="card border-red-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{esc.title || 'Escalation'}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded mt-1 inline-block ${PRIORITY_STYLE[esc.escalation_priority] || PRIORITY_STYLE.medium}`}>
                      {esc.escalation_priority || 'medium'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{esc.escalation_description}</p>
                <button onClick={() => markResolved(esc.ROWID)}
                  className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                  <CheckCircle2 size={13} /> Mark Resolved
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resolved ({resolved.length})</h2>
          <div className="space-y-2">
            {resolved.map(esc => (
              <div key={esc.ROWID} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">{esc.title || 'Escalation'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{esc.escalation_description}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  <CheckCircle2 size={12} /> Resolved
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {active.length === 0 && resolved.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">No escalations yet.</div>
      )}
    </div>
  )
}
