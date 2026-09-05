const express = require('express')
const router = express.Router()
const { verifyToken, requireRole } = require('../middleware/auth')
const { query, insertRow, updateRow } = require('../helpers/datastore')

// GET /api/hierarchy - get hierarchy tree
router.get('/', verifyToken, async (req, res) => {
  try {
    let sql

    if (req.user.role === 'manager') {
      sql = `SELECT * FROM Hierarchy WHERE manager_id = '${req.user.id}'`
    } else if (req.user.role === 'mentor') {
      sql = `SELECT * FROM Hierarchy WHERE mentor_id = '${req.user.id}'`
    } else if (req.user.role === 'mentee') {
      sql = `SELECT * FROM Hierarchy WHERE mentee_id = '${req.user.id}' LIMIT 1`
    } else {
      sql = 'SELECT * FROM Hierarchy'
    }

    const rows = await query(req.catalyst, sql)
    const hierarchy = rows ? rows.map(r => r.Hierarchy) : []

    // Fetch user details for each node
    res.json({ hierarchy })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch hierarchy' })
  }
})

// GET /api/hierarchy/my-mentor - mentee gets their mentor
router.get('/my-mentor', verifyToken, requireRole('mentee'), async (req, res) => {
  try {
    const rows = await query(req.catalyst, `SELECT h.mentor_id, u.name, u.email FROM Hierarchy h INNER JOIN Users u ON h.mentor_id = u.ROWID WHERE h.mentee_id = '${req.user.id}' LIMIT 1`)
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'No mentor assigned' })
    res.json({ mentor: rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentor' })
  }
})

// GET /api/hierarchy/my-mentees - mentor gets their mentees
router.get('/my-mentees', verifyToken, requireRole('mentor', 'manager', 'superadmin'), async (req, res) => {
  try {
    let sql
    if (req.user.role === 'mentor') {
      sql = `SELECT h.mentee_id, u.name, u.email FROM Hierarchy h INNER JOIN Users u ON h.mentee_id = u.ROWID WHERE h.mentor_id = '${req.user.id}'`
    } else {
      // Manager gets all mentees under their branch
      sql = `SELECT h.mentee_id, u.name, u.email, h.mentor_id FROM Hierarchy h INNER JOIN Users u ON h.mentee_id = u.ROWID WHERE h.manager_id = '${req.user.id}'`
    }
    const rows = await query(req.catalyst, sql)
    const mentees = rows ? rows.map(r => ({ ...r.Hierarchy, ...r.Users })) : []
    res.json({ mentees })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentees' })
  }
})

// POST /api/hierarchy - superadmin creates assignment
router.post('/', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { manager_id, mentor_id, mentee_id } = req.body
    if (!manager_id || !mentor_id || !mentee_id) {
      return res.status(400).json({ error: 'manager_id, mentor_id, mentee_id all required' })
    }

    // Check if mentee already assigned (one branch rule)
    const existing = await query(req.catalyst, `SELECT ROWID FROM Hierarchy WHERE mentee_id = '${mentee_id}' LIMIT 1`)
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Mentee already assigned. Use PUT to reassign.' })
    }

    const result = await insertRow(req.catalyst, 'Hierarchy', {
      manager_id,
      mentor_id,
      mentee_id,
      created_at: new Date().toISOString()
    })
    res.status(201).json({ hierarchy: result })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create hierarchy' })
  }
})

// PUT /api/hierarchy/:id - superadmin reassigns
router.put('/:id', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { manager_id, mentor_id, mentee_id } = req.body
    const data = { ROWID: req.params.id }
    if (manager_id) data.manager_id = manager_id
    if (mentor_id) data.mentor_id = mentor_id
    if (mentee_id) data.mentee_id = mentee_id

    const result = await updateRow(req.catalyst, 'Hierarchy', data)
    res.json({ hierarchy: result })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update hierarchy' })
  }
})

module.exports = router
