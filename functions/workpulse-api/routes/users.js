const express = require('express')
const router = express.Router()
const { verifyToken, requireRole } = require('../middleware/auth')
const { query, insertRow, updateRow } = require('../helpers/datastore')

// GET /api/users - superadmin: all users; others: users in their branch
router.get('/', verifyToken, async (req, res) => {
  try {
    let sql
    if (req.user.role === 'superadmin') {
      sql = 'SELECT * FROM Users ORDER BY name ASC'
    } else {
      // Get users in the same branch via Hierarchy
      sql = `SELECT u.* FROM Users u INNER JOIN Hierarchy h ON u.ROWID = h.mentee_id OR u.ROWID = h.mentor_id OR u.ROWID = h.manager_id WHERE h.manager_id = '${req.user.id}' OR h.mentor_id = '${req.user.id}' OR h.mentee_id = '${req.user.id}'`
    }
    const rows = await query(req.catalyst, sql)
    const users = rows ? rows.map(r => r.Users) : []
    res.json({ users })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// GET /api/users/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const rows = await query(req.catalyst, `SELECT * FROM Users WHERE ROWID = '${req.params.id}' LIMIT 1`)
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'User not found' })
    const user = rows[0].Users
    delete user.password
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// POST /api/users - superadmin only
router.post('/', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'All fields required' })

    const existing = await query(req.catalyst, `SELECT ROWID FROM Users WHERE email = '${email}' LIMIT 1`)
    if (existing && existing.length > 0) return res.status(409).json({ error: 'Email already exists' })

    const result = await insertRow(req.catalyst, 'Users', { name, email, password, role, is_active: true })
    res.status(201).json({ user: result })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// PUT /api/users/:id - superadmin only
router.put('/:id', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { name, email, role, is_active } = req.body
    const data = { ROWID: req.params.id }
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (role !== undefined) data.role = role
    if (is_active !== undefined) data.is_active = is_active

    const result = await updateRow(req.catalyst, 'Users', data)
    res.json({ user: result })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// PATCH /api/users/:id/deactivate - superadmin only
router.patch('/:id/deactivate', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    await updateRow(req.catalyst, 'Users', { ROWID: req.params.id, is_active: false })
    res.json({ message: 'User deactivated' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate user' })
  }
})

module.exports = router
