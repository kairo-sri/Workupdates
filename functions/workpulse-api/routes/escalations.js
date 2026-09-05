const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/auth')
const { query, insertRow, updateRow } = require('../helpers/datastore')

// GET /api/escalations
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query
    let sql

    if (req.user.role === 'mentee') {
      sql = `SELECT * FROM Escalations WHERE raised_by = '${req.user.id}'`
    } else if (req.user.role === 'mentor') {
      // Escalations raised by mentees under this mentor, or escalated to this mentor
      sql = `SELECT e.* FROM Escalations e INNER JOIN Hierarchy h ON e.raised_by = h.mentee_id WHERE h.mentor_id = '${req.user.id}' OR e.escalated_to = '${req.user.id}'`
    } else if (req.user.role === 'manager') {
      sql = `SELECT e.* FROM Escalations e INNER JOIN Hierarchy h ON e.raised_by = h.mentee_id WHERE h.manager_id = '${req.user.id}' OR e.escalated_to = '${req.user.id}'`
    } else {
      sql = 'SELECT * FROM Escalations'
    }

    if (status) {
      sql += sql.includes('WHERE') ? ` AND e.status = '${status}'` : ` WHERE status = '${status}'`
    }
    sql += ' ORDER BY created_at DESC'

    const rows = await query(req.catalyst, sql)
    const escalations = rows ? rows.map(r => r.Escalations) : []
    res.json({ escalations })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch escalations' })
  }
})

// POST /api/escalations - mentee raises; mentor can re-escalate to manager
router.post('/', verifyToken, async (req, res) => {
  try {
    const { blocker_id, escalated_to_role, comment } = req.body
    if (!blocker_id || !escalated_to_role) return res.status(400).json({ error: 'blocker_id and escalated_to_role required' })

    // Find who to escalate to based on hierarchy and role
    let escalatedToId = null
    if (escalated_to_role === 'mentor') {
      const rows = await query(req.catalyst, `SELECT mentor_id FROM Hierarchy WHERE mentee_id = '${req.user.id}' LIMIT 1`)
      if (rows && rows.length > 0) escalatedToId = rows[0].Hierarchy.mentor_id
    } else if (escalated_to_role === 'manager') {
      const rows = await query(req.catalyst, `SELECT manager_id FROM Hierarchy WHERE mentee_id = '${req.user.id}' OR mentor_id = '${req.user.id}' LIMIT 1`)
      if (rows && rows.length > 0) escalatedToId = rows[0].Hierarchy.manager_id
    }

    const data = {
      blocker_id,
      raised_by: req.user.id,
      escalated_to_role,
      escalated_to: escalatedToId,
      comment: comment || '',
      escalation_status: 'active',
      created_at: new Date().toISOString()
    }

    const result = await insertRow(req.catalyst, 'Escalations', data)
    res.status(201).json({ escalation: result })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create escalation' })
  }
})

// POST /api/escalations/:id/comment - mentor/manager adds comment
router.post('/:id/comment', verifyToken, async (req, res) => {
  try {
    const { comment } = req.body
    if (!comment) return res.status(400).json({ error: 'comment required' })

    const rows = await query(req.catalyst, `SELECT * FROM Escalations WHERE ROWID = '${req.params.id}' LIMIT 1`)
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Escalation not found' })

    // Append comment with timestamp
    const existing = rows[0].Escalations
    const newComment = `[${req.user.name} @ ${new Date().toISOString()}]: ${comment}`
    const allComments = existing.comments ? existing.comments + '\n' + newComment : newComment

    await updateRow(req.catalyst, 'Escalations', { ROWID: req.params.id, comments: allComments })
    res.json({ message: 'Comment added' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

// PATCH /api/escalations/:id/resolve - only mentee can resolve (as per requirements)
router.patch('/:id/resolve', verifyToken, async (req, res) => {
  try {
    const rows = await query(req.catalyst, `SELECT * FROM Escalations WHERE ROWID = '${req.params.id}' LIMIT 1`)
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Escalation not found' })
    const escalation = rows[0].Escalations

    if (req.user.role !== 'superadmin' && escalation.raised_by !== req.user.id) {
      return res.status(403).json({ error: 'Only the mentee who raised this can resolve it' })
    }

    await updateRow(req.catalyst, 'Escalations', {
      ROWID: req.params.id,
      escalation_status: 'resolved',
      resolved_at: new Date().toISOString()
    })
    res.json({ message: 'Escalation resolved' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve escalation' })
  }
})

// POST /api/escalations/:id/remind - mentor sends reminder
router.post('/:id/remind', verifyToken, async (req, res) => {
  try {
    await updateRow(req.catalyst, 'Escalations', {
      ROWID: req.params.id,
      last_reminded_at: new Date().toISOString()
    })
    // TODO: trigger Cliq notification
    res.json({ message: 'Reminder sent' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reminder' })
  }
})

module.exports = router
