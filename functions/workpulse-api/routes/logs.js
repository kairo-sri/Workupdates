const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/auth')
const { query, insertRow, updateRow } = require('../helpers/datastore')

// GET /api/logs - filtered by role
router.get('/', verifyToken, async (req, res) => {
  try {
    const { mentee_id, feature_id, week } = req.query
    let sql

    if (req.user.role === 'mentee') {
      sql = `SELECT * FROM Logs WHERE mentee_id = '${req.user.id}'`
      if (feature_id) sql += ` AND feature_id = '${feature_id}'`
      if (week) sql += ` AND week = '${week}'`
    } else if (req.user.role === 'mentor') {
      sql = `SELECT l.* FROM Logs l INNER JOIN Hierarchy h ON l.mentee_id = h.mentee_id WHERE h.mentor_id = '${req.user.id}'`
      if (mentee_id) sql += ` AND l.mentee_id = '${mentee_id}'`
      if (feature_id) sql += ` AND l.feature_id = '${feature_id}'`
      if (week) sql += ` AND l.week = '${week}'`
    } else if (req.user.role === 'manager') {
      sql = `SELECT l.* FROM Logs l INNER JOIN Hierarchy h ON l.mentee_id = h.mentee_id WHERE h.manager_id = '${req.user.id}'`
      if (mentee_id) sql += ` AND l.mentee_id = '${mentee_id}'`
      if (feature_id) sql += ` AND l.feature_id = '${feature_id}'`
      if (week) sql += ` AND l.week = '${week}'`
    } else {
      sql = 'SELECT * FROM Logs'
      const filters = []
      if (mentee_id) filters.push(`mentee_id = '${mentee_id}'`)
      if (feature_id) filters.push(`feature_id = '${feature_id}'`)
      if (week) filters.push(`week = '${week}'`)
      if (filters.length) sql += ' WHERE ' + filters.join(' AND ')
    }

    sql += ' ORDER BY week DESC'
    const rows = await query(req.catalyst, sql)
    const logs = rows ? rows.map(r => r.Logs) : []
    res.json({ logs })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch logs' })
  }
})

// POST /api/logs - mentee submits; upsert by (feature_id, week)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { feature_id, week, this_week_update, whats_next, blockers, submitted_via } = req.body
    if (!feature_id || !week) return res.status(400).json({ error: 'feature_id and week required' })

    // Check if log already exists for this feature+week (overwrite)
    const existing = await query(req.catalyst, `SELECT ROWID FROM Logs WHERE feature_id = '${feature_id}' AND week = '${week}' LIMIT 1`)

    const data = {
      feature_id,
      week,
      mentee_id: req.user.id,
      this_week_update: this_week_update || '',
      whats_next: whats_next || '',
      blockers: blockers || '',
      submitted_via: submitted_via || 'web_app',
      submitted_at: new Date().toISOString()
    }

    let result
    if (existing && existing.length > 0) {
      data.ROWID = existing[0].Logs.ROWID
      result = await updateRow(req.catalyst, 'Logs', data)
    } else {
      result = await insertRow(req.catalyst, 'Logs', data)
    }

    res.status(201).json({ log: result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to submit log' })
  }
})

// PUT /api/logs/:id - mentee can update their own
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const rows = await query(req.catalyst, `SELECT * FROM Logs WHERE ROWID = '${req.params.id}' LIMIT 1`)
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Log not found' })
    const log = rows[0].Logs

    if (req.user.role !== 'superadmin' && log.mentee_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' })
    }

    const { this_week_update, whats_next, blockers } = req.body
    const data = { ROWID: req.params.id }
    if (this_week_update !== undefined) data.this_week_update = this_week_update
    if (whats_next !== undefined) data.whats_next = whats_next
    if (blockers !== undefined) data.blockers = blockers
    data.submitted_at = new Date().toISOString()

    const result = await updateRow(req.catalyst, 'Logs', data)
    res.json({ log: result })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update log' })
  }
})

module.exports = router
