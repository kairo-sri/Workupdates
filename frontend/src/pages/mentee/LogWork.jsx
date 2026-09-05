import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { getRecentWeeks, weekLabel } from '../../services/weeks'
import { CheckCircle2 } from 'lucide-react'

const WEEKS = getRecentWeeks(8)

export default function LogWork() {
  const { user } = useAuth()
  const [features, setFeatures] = useState([])
  const [form, setForm] = useState({
    featureId: '', weekDate: WEEKS[WEEKS.length - 1],
    update: '', next_steps: '', blockers: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getFeatures()
      .then(d => setFeatures((d.features || []).filter(f => f.feature_status !== 'completed')))
      .catch(console.error)
  }, [])

  const handleSubmit = async () => {
    if (!form.featureId || !form.update.trim()) return
    setSaving(true)
    try {
      await api.upsertLog({
        feature_id: form.featureId,
        week: form.weekDate,
        update: form.update,
        next_steps: form.next_steps,
      })
      // If there's a blocker text, also create a blocker entry
      if (form.blockers.trim()) {
        await api.createBlocker({
          feature_id: form.featureId,
          description: form.blockers,
          priority: 'medium',
        })
      }
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setForm({ featureId: '', weekDate: WEEKS[WEEKS.length - 1], update: '', next_steps: '', blockers: '' })
      }, 2000)
    } catch (err) {
      alert(err.message || 'Failed to submit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Log Work</h1>
        <p className="text-sm text-gray-500 mt-0.5">Submit your weekly update for a feature</p>
      </div>

      {submitted ? (
        <div className="card p-8 text-center">
          <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
          <p className="font-semibold text-gray-800">Update submitted!</p>
          <p className="text-sm text-gray-400 mt-1">Your log has been saved.</p>
        </div>
      ) : (
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Feature *</label>
            <select value={form.featureId}
              onChange={e => setForm(p => ({ ...p, featureId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Select a feature...</option>
              {features.map(f => (
                <option key={f.ROWID} value={f.ROWID}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Week</label>
            <select value={form.weekDate}
              onChange={e => setForm(p => ({ ...p, weekDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {[...WEEKS].reverse().map(w => (
                <option key={w} value={w}>
                  {w === WEEKS[WEEKS.length - 1] ? `This week (${weekLabel(w)})` : weekLabel(w)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">This week's update *</label>
            <textarea value={form.update}
              onChange={e => setForm(p => ({ ...p, update: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              placeholder="What did you work on this week?" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">What's next</label>
            <textarea value={form.next_steps}
              onChange={e => setForm(p => ({ ...p, next_steps: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              placeholder="What will you work on next week?" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Any blockers?
              <span className="text-gray-400 font-normal ml-1">— if filled, a blocker entry will be created</span>
            </label>
            <textarea value={form.blockers}
              onChange={e => setForm(p => ({ ...p, blockers: e.target.value }))}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              placeholder="Any blockers or dependencies?" />
          </div>

          <button onClick={handleSubmit}
            disabled={!form.featureId || !form.update.trim() || saving}
            className="btn-primary w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Submitting…' : 'Submit Update'}
          </button>
        </div>
      )}
    </div>
  )
}
