const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middleware/auth')
const { query, insertRow } = require('../helpers/datastore')

// GET /api/comments?log_id=xxx - comments on a log entry
router.get('/', verifyToken, async (req, res) => {
  try {
    const { log_id } = req.query
    if (!log_id) return res.status(400).json({ error: 'log_id required' })

    const rows = await query(req.catalyst, `SELECT * FROM Comments WHERE log_id = '${log_id}' ORDER BY created_at ASC`)
    const comments = rows ? rows.map(r => r.Comments) : []
    res.json({ comments })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// POST /api/comments - any role can comment
router.post('/', verifyToken, async (req, res) => {
  try {
    const { log_id, text, parent_id } = req.body
    if (!log_id || !text) return res.status(400).json({ error: 'log_id and text required' })

    const data = {
      log_id,
      author_id: req.user.id,
      author_name: req.user.name,
      author_role: req.user.role,
      comment_text: text,
      parent_id: parent_id || null,
      created_at: new Date().toISOString()
    }

    const result = await insertRow(req.catalyst, 'Comments', data)
    res.status(201).json({ comment: result })
  } catch (err) {
    res.status(500).json({ error: 'Failed to post comment' })
  }
})

module.exports = router
