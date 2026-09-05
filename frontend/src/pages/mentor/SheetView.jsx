import { useState } from 'react'
import { MOCK_USERS } from '../../mock/users'
import { MOCK_FEATURES } from '../../mock/features'
import { MOCK_LOGS, WEEKS } from '../../mock/logs'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEK_RANGES = { '2W': 2, '4W': 4, '5W': 5, '8W': 8 }

function weekLabel(dateStr) {
  const d = new Date(dateStr)
  const start = new Date(d)
  start.setDate(d.getDate() - 4)
  const fmt = dt => dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${fmt(start)} – ${fmt(d)}`
}

export default function SheetView() {
  const mentees = MOCK_USERS.filter(u => u.role === 'mentee')
  const [selectedMenteeId, setSelectedMenteeId] = useState(mentees[0]?.id)
  const [rangeKey, setRangeKey] = useState('4W')
  const [endIdx, setEndIdx] = useState(WEEKS.length - 1)

  const rangeCount = WEEK_RANGES[rangeKey]
  const start = Math.max(0, endIdx - rangeCount + 1)
  const visibleWeeks = WEEKS.slice(start, endIdx + 1)
  const currentWeek = WEEKS[WEEKS.length - 1]

  const selectedMentee = MOCK_USERS.find(u => u.id === selectedMenteeId)
  const features = MOCK_FEATURES.filter(f => f.menteeId === selectedMenteeId)
  const logs = MOCK_LOGS.filter(l => l.menteeId === selectedMenteeId)
  const getLog = (fId, w) => logs.find(l => l.featureId === fId && l.weekDate === w)
  const totalLogs = w => logs.filter(l => l.weekDate === w).length

  const AVATAR_BG = ['bg-amber-500', 'bg-sky-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500']

  const hasUpdatedToday = (menteeId) => logs.some(l => l.menteeId === menteeId && l.weekDate === currentWeek)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Sheet View</h1>
        <p className="text-sm text-gray-500">Review any team member's weekly work log</p>
      </div>

      {/* Team member selector */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Team Member</p>
        <div className="flex gap-3 flex-wrap">
          {mentees.map((mentee, i) => {
            const updated = hasUpdatedToday(mentee.id)
            return (
              <button
                key={mentee.id}
                onClick={() => setSelectedMenteeId(mentee.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-left ${
                  selectedMenteeId === mentee.id
                    ? 'border-indigo-300 bg-indigo-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${AVATAR_BG[i % AVATAR_BG.length]} flex items-center justify-center text-white text-xs font-bold`}>
                  {mentee.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{mentee.name}</p>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${updated ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-[10px] text-gray-400">{updated ? 'Updated today' : 'No update today'}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected mentee info */}
      {selectedMentee && (
        <div className="card p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
              {selectedMentee.avatar}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{selectedMentee.name}</p>
              <p className="text-xs text-gray-400">{selectedMentee.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-xl font-bold text-indigo-600">{logs.length}</p>
              <p className="text-xs text-gray-400">Total logs</p>
            </div>
            <div>
              <p className="text-xl font-bold text-indigo-600">{totalLogs(currentWeek)}</p>
              <p className="text-xs text-gray-400">This range</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1">
          <button onClick={() => setEndIdx(i => Math.max(rangeCount - 1, i - 1))} className="btn-secondary px-2 py-1.5">
            <ChevronLeft size={14} />
          </button>
          <div className="border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-xs text-gray-600 min-w-[200px] text-center">
            <div className="text-gray-400 text-[10px] font-medium">{rangeKey} RANGE</div>
            {weekLabel(visibleWeeks[0])} → {weekLabel(visibleWeeks[visibleWeeks.length - 1])}
          </div>
          <button onClick={() => setEndIdx(i => Math.min(WEEKS.length - 1, i + 1))} className="btn-secondary px-2 py-1.5">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-gray-500 mr-1">Show:</span>
          {Object.keys(WEEK_RANGES).map(k => (
            <button key={k} onClick={() => setRangeKey(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${rangeKey === k ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
            >{k}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-40 bg-gray-50">Task / Work item</th>
              {visibleWeeks.map(w => (
                <th key={w} className={`px-4 py-3 text-xs font-semibold text-center min-w-[200px] ${w === currentWeek ? 'text-green-700 bg-green-50 border-l-2 border-r-2 border-green-200' : 'text-gray-500'}`}>
                  {weekLabel(w)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f, idx) => (
              <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 align-top">
                  <div className="flex items-start gap-1.5">
                    <span className="text-xs text-gray-400 mt-0.5">{idx + 1}</span>
                    <div>
                      <span className="font-medium text-gray-800 text-xs">{f.name}</span>
                      {f.status === 'blocked' && <div className="mt-1"><span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">BLOCKED</span></div>}
                    </div>
                  </div>
                </td>
                {visibleWeeks.map(w => {
                  const log = getLog(f.id, w)
                  return (
                    <td key={w} className={`px-3 py-3 align-top text-xs ${w === currentWeek ? 'bg-green-50/40 border-l border-r border-green-100' : ''}`}>
                      {log ? (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-green-600">✅</span>
                            <span className="text-[10px] font-bold text-green-700 uppercase">Accomplished</span>
                          </div>
                          <ul className="space-y-0.5">
                            {log.update.split('. ').filter(Boolean).map((line, i) => (
                              <li key={i} className="flex gap-1 text-gray-600"><span className="text-gray-400 shrink-0">•</span><span>{line}</span></li>
                            ))}
                          </ul>
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Total Logs</td>
              {visibleWeeks.map(w => <td key={w} className="px-4 py-2 text-center text-xs font-bold text-indigo-500">{totalLogs(w)}</td>)}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
