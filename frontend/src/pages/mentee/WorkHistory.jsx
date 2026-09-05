import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { MOCK_FEATURES } from '../../mock/features'
import { MOCK_LOGS, WEEKS } from '../../mock/logs'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEK_RANGES = {
  '2W': 2, '4W': 4, '5W': 5, '8W': 8
}

function getWeekRange(weeks, endIdx, count) {
  const start = Math.max(0, endIdx - count + 1)
  return weeks.slice(start, endIdx + 1)
}

function weekLabel(dateStr) {
  const d = new Date(dateStr)
  const start = new Date(d)
  start.setDate(d.getDate() - 4)
  const fmt = (dt) => dt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${fmt(start)} – ${fmt(d)}`
}

export default function WorkHistory() {
  const { user } = useAuth()
  const [rangeKey, setRangeKey] = useState('4W')
  const [endIdx, setEndIdx] = useState(WEEKS.length - 1)

  const allWeeks = WEEKS
  const rangeCount = WEEK_RANGES[rangeKey]
  const visibleWeeks = getWeekRange(allWeeks, endIdx, rangeCount)

  const features = MOCK_FEATURES.filter(f => f.menteeId === user?.id)
  const logs = MOCK_LOGS.filter(l => l.menteeId === user?.id)

  const getLog = (featureId, weekDate) =>
    logs.find(l => l.featureId === featureId && l.weekDate === weekDate)

  const totalLogs = (weekDate) => logs.filter(l => l.weekDate === weekDate).length

  const currentWeek = WEEKS[WEEKS.length - 1]

  const canNext = endIdx < allWeeks.length - 1
  const canPrev = endIdx - rangeCount + 1 > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Work History</h1>
          <p className="text-sm text-gray-500">{logs.length} total entries</p>
        </div>
        <button className="btn-primary text-sm">+ Log Today</button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Prev/Next */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEndIdx(i => Math.max(rangeCount - 1, i - 1))}
            disabled={!canPrev}
            className="btn-secondary px-2 py-1.5 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <div className="border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-xs text-gray-600 min-w-[180px] text-center">
            <div className="text-gray-400 text-[10px] font-medium">{rangeKey} RANGE</div>
            {weekLabel(visibleWeeks[0]?.split('–')[0] || visibleWeeks[0])} → {weekLabel(visibleWeeks[visibleWeeks.length - 1])}
          </div>
          <button
            onClick={() => setEndIdx(i => Math.min(allWeeks.length - 1, i + 1))}
            disabled={!canNext}
            className="btn-secondary px-2 py-1.5 disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Range picker */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-gray-500 mr-1">Show:</span>
          {Object.keys(WEEK_RANGES).map(k => (
            <button
              key={k}
              onClick={() => setRangeKey(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                rangeKey === k ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Sheet grid */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-40 bg-gray-50">Task / Work item</th>
              {visibleWeeks.map((w, i) => (
                <th
                  key={w}
                  className={`px-4 py-3 text-xs font-semibold text-center min-w-[200px] ${
                    w === currentWeek ? 'text-green-700 bg-green-50 border-l-2 border-r-2 border-green-200' : 'text-gray-500'
                  }`}
                >
                  {String.fromCharCode(65 + i + (endIdx - rangeCount + 1 > 0 ? endIdx - rangeCount + 1 : 0))}
                  <div className="font-normal mt-0.5">{weekLabel(w)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <tr key={feature.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 align-top">
                  <div className="flex items-start gap-1.5">
                    <span className="text-xs text-gray-400 mt-0.5">{idx + 1}</span>
                    <div>
                      <span className="font-medium text-gray-800 text-xs">{feature.name}</span>
                      {feature.status === 'blocked' && (
                        <div className="mt-1">
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">BLOCKED</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                {visibleWeeks.map(w => {
                  const log = getLog(feature.id, w)
                  return (
                    <td
                      key={w}
                      className={`px-3 py-3 align-top text-xs ${
                        w === currentWeek ? 'bg-green-50/40 border-l border-r border-green-100' : ''
                      }`}
                    >
                      {log ? (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-green-600">✅</span>
                            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Accomplished</span>
                          </div>
                          <ul className="space-y-0.5">
                            {log.update.split('. ').filter(Boolean).map((line, i) => (
                              <li key={i} className="flex gap-1 text-gray-600">
                                <span className="text-gray-400 shrink-0">•</span>
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Total Logs</td>
              {visibleWeeks.map(w => (
                <td key={w} className="px-4 py-2 text-center text-xs font-bold text-indigo-500">
                  {totalLogs(w)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
