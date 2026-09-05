import { useState } from 'react'
import { MOCK_USERS } from '../../mock/users'
import { MOCK_LOGS, WEEKS } from '../../mock/logs'
import { MOCK_FEATURES } from '../../mock/features'
import { Download } from 'lucide-react'

export default function Export() {
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterUser, setFilterUser] = useState('all')

  const mentees = MOCK_USERS.filter(u => u.role === 'mentee')
  const mentors = MOCK_USERS.filter(u => u.role === 'mentor')

  const getRows = () => {
    let logs = MOCK_LOGS
    if (filterUser !== 'all') logs = logs.filter(l => l.menteeId === filterUser)
    return logs.map(log => {
      const feature = MOCK_FEATURES.find(f => f.id === log.featureId)
      const mentee = MOCK_USERS.find(u => u.id === log.menteeId)
      return {
        Mentee: mentee?.name || '',
        Feature: feature?.name || '',
        Week: log.weekDate,
        Update: log.update,
        Next: log.next,
        Blockers: log.blockers,
        'Submitted Via': log.submittedVia,
      }
    })
  }

  const handleExport = () => {
    const rows = getRows()
    if (!rows.length) return
    const headers = Object.keys(rows[0])
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workpulse-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const rows = getRows()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Export</h1>
        <p className="text-sm text-gray-500">Download log work history as CSV</p>
      </div>

      <div className="card p-5 mb-5">
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Mentee</label>
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="all">All Mentees</option>
              {mentees.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2">
            <Download size={15} /> Export CSV ({rows.length} rows)
          </button>
        </div>
      </div>

      {/* Preview table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Mentee', 'Feature', 'Week', 'Update', 'Submitted Via'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 10).map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-2 font-medium text-gray-700">{row.Mentee}</td>
                <td className="px-4 py-2 text-gray-600">{row.Feature}</td>
                <td className="px-4 py-2 text-gray-500">{row.Week}</td>
                <td className="px-4 py-2 text-gray-600 max-w-xs truncate">{row.Update}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${row['Submitted Via'] === 'cliq_bot' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {row['Submitted Via'] === 'cliq_bot' ? 'Cliq Bot' : 'Web App'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 10 && <p className="text-xs text-gray-400 text-center py-3">Showing 10 of {rows.length} rows — export CSV for full data</p>}
      </div>
    </div>
  )
}
