const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/auth')
const { query, insertRow, updateRow } = require('../helpers/datastore')

// GET /api/blockers
router.get('/', verifyToken, async (req, res) => {
  try {
    const { mentee_id, status } = req.query
    let sql

    if (req.user.role === 'mentee') {
      sql = `SELECT * FROM Blockers WHERE mentee_id = '${req.user.id}'`
      if (status) sql += ` AND status = '${status}'`
    } else if (req.user.role === 'mentor') {
      sql = `SELECT b.* FROM Blockers b INNER JOIN Hierarchy h ON b.mentee_id = h.mentee_id WHERE h.mentor_id = '${req.user.id}'`
      if (mentee_id) sql += ` AND b.mentee_id = '${mentee_id}'`
      if (status) sql += ` AND b.status = '${status}'`
    } else if (req.user.role === 'manager') {
      sql = `SELECT b.* FROM Blockers b INNER JOIN Hierarchy h ON b.mentee_id = h.mentee_id WHERE h.manager_id = '${req.user.id}'`
      if (mentee_id) sql += ` AND b.mentee_id = '${mentee_id}'`
      if (status) sql += ` AND b.status = '${status}'`
    } else {
      sql = 'SELECT * FROM Blockers'
      const filters = []
      if (mentee_id) filters.push(`mentee_id = '${mentee_id}'`)
      if (status) filters.push(`status = '${status}'`)
      if (filters.length) sql += ' WHERE ' + filters.join(' AND ')
    }

    sql += ' ORDER BY created_at DESC'
    const rows = await query(req.catalyst, sql)
    const blockers = rows ? rows.map(r => r.Blockers) : []
    res.json({ blockers })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch blockers' })
  }
})

// POST /api/blockers - mentee reports a blocker (also triggered when feature marked blocked)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { feature_id, description, priority } = req.body
    if (!feature_id || !description) return res.status(400).json({ error: 'feature_id and description required' })

    const data = {
      feature_id,
      mentee_id: req.user.id,
      description,
      priority: priority || 'medium',
      status: 'active',
      created_at: new Date().toISOString()
    }

    const result = await insertRow(req.catalyst, 'Blockers', data)
    res.status(201).json({ blocker: result })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create blocker' })
  }
})

// PATCH /api/blockers/:id/resolve - mentee or mentor marks as resolved
router.patch('/:id/resolve', verifyToken, async (req, res) => {
  try {
    const rows = await query(req.catalyst, `SELECT * FROM Blockers WHERE ROWID = '${req.params.id}' LIMIT 1`)
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Blocker not found' })
    const blocker = rows[0].Blockers

    const allowed = ['mentee', 'mentor', 'superadmin']
    if (!allowed.includes(req.user.role)) return res.status(403).json({ error: 'Not allowed' })
    // Mentee can only resolve their own
    if (req.user.role === 'mentee' && blocker.mentee_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' })
    }

    await updateRow(req.catalyst, 'Blockers', {
      ROWID: req.params.id,
      status: 'resolved',
      resolved_at: new Date().toISOString()
    })

    res.json({ message: 'Blocker resolved' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve blocker' })
  }
})

module.exports = router
