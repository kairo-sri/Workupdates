const express = require('express')
const router = express.Router()
const { verifyToken, requireRole } = require('../middleware/auth')
const { query, insertRow, updateRow, deleteRow } = require('../helpers/datastore')

// GET /api/features - filtered by role
router.get('/', verifyToken, async (req, res) => {
  try {
    const { mentee_id } = req.query
    let sql

    if (req.user.role === 'mentee') {
      sql = `SELECT * FROM Features WHERE mentee_id = '${req.user.id}' ORDER BY created_at DESC`
    } else if (req.user.role === 'mentor') {
      // Features of all mentees under this mentor
      sql = `SELECT f.* FROM Features f INNER JOIN Hierarchy h ON f.mentee_id = h.mentee_id WHERE h.mentor_id = '${req.user.id}'`
      if (mentee_id) sql += ` AND f.mentee_id = '${mentee_id}'`
    } else if (req.user.role === 'manager') {
      sql = `SELECT f.* FROM Features f INNER JOIN Hierarchy h ON f.mentee_id = h.mentee_id WHERE h.manager_id = '${req.user.id}'`
      if (mentee_id) sql += ` AND f.mentee_id = '${mentee_id}'`
    } else {
      // superadmin sees all
      sql = mentee_id
        ? `SELECT * FROM Features WHERE mentee_id = '${mentee_id}' ORDER BY created_at DESC`
        : 'SELECT * FROM Features ORDER BY created_at DESC'
    }

    const rows = await query(req.catalyst, sql)
    const features = rows ? rows.map(r => r.Features) : []
    res.json({ features })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch features' })
  }
})

// GET /api/features/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const rows = await query(req.catalyst, `SELECT * FROM Features WHERE ROWID = '${req.params.id}' LIMIT 1`)
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Feature not found' })
    res.json({ feature: rows[0].Features })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feature' })
  }
})

// POST /api/features - any authenticated user can create for a mentee
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, category, description, mentee_id } = req.body
    if (!name || !mentee_id) return res.status(400).json({ error: 'name and mentee_id required' })

    const data = {
      name,
      category: category || 'General',
      description: description || '',
      mentee_id,
      created_by: req.user.id,
      status: 'in_progress',
      progress: 0,
      is_blocked: false,
      created_at: new Date().toISOString()
    }

    const result = await insertRow(req.catalyst, 'Features', data)
    res.status(201).json({ feature: result })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create feature' })
  }
})

// PUT /api/features/:id - mentee updates their own; others read-only
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const rows = await query(req.catalyst, `SELECT * FROM Features WHERE ROWID = '${req.params.id}' LIMIT 1`)
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Feature not found' })
    const feature = rows[0].Features

    // Only mentee who owns it or superadmin can update
    if (req.user.role !== 'superadmin' && feature.mentee_id !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' })
    }

    const { name, category, description, status, progress, is_blocked } = req.body
    const data = { ROWID: req.params.id }
    if (name !== undefined) data.name = name
    if (category !== undefined) data.category = category
    if (description !== undefined) data.description = description
    if (status !== undefined) data.status = status
    if (progress !== undefined) data.progress = progress
    if (is_blocked !== undefined) data.is_blocked = is_blocked

    const result = await updateRow(req.catalyst, 'Features', data)
    res.json({ feature: result })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update feature' })
  }
})

// DELETE /api/features/:id - superadmin only
router.delete('/:id', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    await deleteRow(req.catalyst, 'Features', req.params.id)
    res.json({ message: 'Feature deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete feature' })
  }
})

module.exports = router
