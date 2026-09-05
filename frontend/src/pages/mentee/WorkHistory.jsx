import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { getRecentWeeks, weekLabel } from '../../services/weeks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const ALL_WEEKS = getRecentWeeks(12)
const WEEK_RANGES = { '2W': 2, '4W': 4, '6W': 6, '8W': 8 }

export default function WorkHistory() {
  const { user } = useAuth()
  const [features, setFeatures] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [rangeKey, setRangeKey] = useState('4W')
  const [endIdx, setEndIdx] = useState(ALL_WEEKS.length - 1)

  useEffect(() => {
    Promise.all([api.getFeatures(), api.getLogs()])
      .then(([fd, ld]) => {
        setFeatures(fd.features || [])
        setLogs(ld.logs || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const rangeCount = WEEK_RANGES[rangeKey]
  const start = Math.max(0, endIdx - rangeCount + 1)
  const visibleWeeks = ALL_WEEKS.slice(start, endIdx + 1)

  const getLog = (featureId, weekDate) =>
    logs.find(l => String(l.feature_id) === String(featureId) && l.week === weekDate)

  const totalLogs = (weekDate) => logs.filter(l => l.week === weekDate).length

  if (loading) return <div className="text-center py-16 text-gray-400 text-sm">Loading history…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Work History</h1>
          <p className="text-sm text-gray-500">{logs.length} total entries</p>
        </div>
        <Link to="/mentee/log-work" className="btn-primary text-sm">+ Log This Week</Link>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1">
          <button onClick={() => setEndIdx(i => Math.max(rangeCount - 1, i - 1))}
            disabled={start === 0}
            className="btn-secondary px-2 py-1.5 disabled:opacity-40"><ChevronLeft size={14} /></button>
          <div className="border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-xs text-gray-600 min-w-[200px] text-center">
            <div className="text-gray-400 text-[10px] font-medium">{rangeKey} RANGE</div>
            {weekLabel(visibleWeeks[0])} → {weekLabel(visibleWeeks[visibleWeeks.length - 1])}
          </div>
          <button onClick={() => setEndIdx(i => Math.min(ALL_WEEKS.length - 1, i + 1))}
            disabled={endIdx === ALL_WEEKS.length - 1}
            className="btn-secondary px-2 py-1.5 disabled:opacity-40"><ChevronRight size={14} /></button>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-gray-500 mr-1">Show:</span>
          {Object.keys(WEEK_RANGES).map(k => (
            <button key={k} onClick={() => setRangeKey(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                rangeKey === k ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}>{k}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-40 bg-gray-50">Feature</th>
              {visibleWeeks.map((w, i) => (
                <th key={w} className={`px-4 py-3 text-xs font-semibold text-center min-w-[180px] ${
                  i === visibleWeeks.length - 1 ? 'text-green-700 bg-green-50 border-l-2 border-r-2 border-green-200' : 'text-gray-500'
                }`}>
                  <div className="font-normal mt-0.5">{weekLabel(w)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <tr key={feature.ROWID} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3 align-top">
                  <div className="flex items-start gap-1.5">
                    <span className="text-xs text-gray-400 mt-0.5">{idx + 1}</span>
                    <span className="font-medium text-gray-800 text-xs">{feature.name}</span>
                  </div>
                </td>
                {visibleWeeks.map((w, i) => {
                  const log = getLog(feature.ROWID, w)
                  return (
                    <td key={w} className={`px-3 py-3 align-top text-xs ${
                      i === visibleWeeks.length - 1 ? 'bg-green-50/40 border-l border-r border-green-100' : ''
                    }`}>
                      {log ? (
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-green-600">✅</span>
                            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide">Logged</span>
                          </div>
                          <p className="text-gray-600 line-clamp-3">{log.update}</p>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
            {features.length === 0 && (
              <tr><td colSpan={visibleWeeks.length + 1} className="text-center py-10 text-gray-400 text-sm">No features yet.</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Total Logs</td>
              {visibleWeeks.map(w => (
                <td key={w} className="px-4 py-2 text-center text-xs font-bold text-indigo-500">{totalLogs(w)}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
