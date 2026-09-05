import { useState } from 'react'
import { Bell, Calendar, MessageSquare } from 'lucide-react'

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    cliqWebhookUrl: '',
    botToken: '',
    weekEndDay: 'friday',
    notifyOnEscalation: true,
    notifyOnComment: true,
    botEnabled: true,
    botPromptTime: '09:00',
  })
  const [saved, setSaved] = useState(false)

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-500">Configure app-wide settings and integrations</p>
      </div>

      <div className="space-y-5">
        {/* Zoho Cliq */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-800">Zoho Cliq Integration</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Incoming Webhook URL</label>
              <input type="text" value={settings.cliqWebhookUrl} onChange={e => update('cliqWebhookUrl', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono"
                placeholder="https://cliq.zoho.com/api/v2/channelsbyname/..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bot OAuth Token</label>
              <input type="password" value={settings.botToken} onChange={e => update('botToken', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="••••••••••••••••" />
            </div>
          </div>
        </div>

        {/* Cliq Bot */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-purple-500" />
            <h2 className="text-sm font-semibold text-gray-800">Cliq Bot Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Enable Friday Bot Prompts</p>
                <p className="text-xs text-gray-400">Bot will message all mentees every Friday to log their update</p>
              </div>
              <button
                onClick={() => update('botEnabled', !settings.botEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative ${settings.botEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.botEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {settings.botEnabled && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prompt Time (Friday)</label>
                <input type="time" value={settings.botPromptTime} onChange={e => update('botPromptTime', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-800">Notification Preferences</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: 'notifyOnEscalation', label: 'Notify on Escalation', desc: 'Send Cliq notification when a blocker is escalated' },
              { key: 'notifyOnComment', label: 'Notify on Comment', desc: 'Send Cliq notification when a manager comments on a log' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <button
                  onClick={() => update(key, !settings[key])}
                  className={`w-11 h-6 rounded-full transition-colors relative ${settings[key] ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Week config */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-sky-500" />
            <h2 className="text-sm font-semibold text-gray-800">Week Configuration</h2>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Week End Day</label>
            <select value={settings.weekEndDay} onChange={e => update('weekEndDay', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="thursday">Thursday</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">This determines the column header date for each week's logs</p>
          </div>
        </div>

        <button onClick={handleSave} className={`btn-primary px-6 py-2.5 ${saved ? 'bg-green-500' : ''}`}>
          {saved ? '✓ Settings Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
