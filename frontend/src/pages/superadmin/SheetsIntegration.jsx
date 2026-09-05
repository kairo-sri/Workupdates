import { useState } from 'react'
import { MOCK_USERS } from '../../mock/users'
import { Sheet, CheckCircle2, Link } from 'lucide-react'

export default function SheetsIntegration() {
  const mentees = MOCK_USERS.filter(u => u.role === 'mentee')
  const [connected, setConnected] = useState(false)
  const [mappings, setMappings] = useState(
    Object.fromEntries(mentees.map(m => [m.id, '']))
  )
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Zoho Sheets Integration</h1>
        <p className="text-sm text-gray-500">Connect your Zoho account and associate a sheet per mentee</p>
      </div>

      {/* Connect Zoho */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Sheet size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Zoho Sheets</p>
              <p className="text-xs text-gray-400">{connected ? 'Connected — admin@zoho.com' : 'Not connected'}</p>
            </div>
          </div>
          {connected ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              <span className="text-sm text-green-600 font-medium">Connected</span>
              <button onClick={() => setConnected(false)} className="btn-secondary text-xs ml-2">Disconnect</button>
            </div>
          ) : (
            <button onClick={() => setConnected(true)} className="btn-primary flex items-center gap-2">
              <Link size={14} /> Connect Zoho Account
            </button>
          )}
        </div>
      </div>

      {/* Sheet mappings */}
      {connected && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Sheet Mapping</h2>
          <p className="text-xs text-gray-400 mb-4">Enter the Zoho Sheet ID for each mentee. Find it in the sheet URL: /sheet/open/<strong>SHEET_ID</strong></p>

          <div className="space-y-3 mb-5">
            {mentees.map(mentee => (
              <div key={mentee.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{mentee.avatar}</div>
                <span className="text-sm font-medium text-gray-700 w-32 shrink-0">{mentee.name}</span>
                <input
                  type="text"
                  value={mappings[mentee.id]}
                  onChange={e => setMappings(prev => ({ ...prev, [mentee.id]: e.target.value }))}
                  placeholder="Sheet ID..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono"
                />
                {mappings[mentee.id] && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
              </div>
            ))}
          </div>

          <button onClick={handleSave} className={`btn-primary ${saved ? 'bg-green-500' : ''}`}>
            {saved ? '✓ Saved!' : 'Save Mappings'}
          </button>
        </div>
      )}

      {!connected && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Connect your Zoho account first to set up sheet mappings.
        </div>
      )}
    </div>
  )
}
