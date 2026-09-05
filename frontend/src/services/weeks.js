// Generate the last N week-ending Fridays as ISO date strings (YYYY-MM-DD)
export function getRecentWeeks(count = 8) {
  const weeks = []
  const today = new Date()
  // Find the most recent Friday
  const day = today.getDay() // 0=Sun, 5=Fri
  const daysToFriday = day <= 5 ? day - 5 : day - 5 + 7
  const lastFriday = new Date(today)
  lastFriday.setDate(today.getDate() + daysToFriday)
  lastFriday.setHours(0, 0, 0, 0)

  for (let i = 0; i < count; i++) {
    const d = new Date(lastFriday)
    d.setDate(lastFriday.getDate() - i * 7)
    weeks.unshift(d.toISOString().split('T')[0])
  }
  return weeks
}

export function weekLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const start = new Date(d)
  start.setDate(d.getDate() - 4)
  const fmt = (dt) => dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  return `${fmt(start)} – ${fmt(d)}`
}
