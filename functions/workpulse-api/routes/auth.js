const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { query } = require('../helpers/datastore')

const JWT_SECRET = process.env.JWT_SECRET || 'workpulse_secret_key'

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const rows = await query(req.catalyst, `SELECT * FROM Users WHERE email = '${email}' LIMIT 1`)
    if (!rows || rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' })

    const user = rows[0].Users
    if (user.is_active === false) return res.status(401).json({ error: 'Account deactivated' })
    if (user.password !== password) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user.ROWID, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user.ROWID, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed', detail: err.message, catalyst: !!req.catalyst })
  }
})

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    res.json({ user: decoded })
  } catch {
    res.status(403).json({ error: 'Invalid token' })
  }
})

module.exports = router
