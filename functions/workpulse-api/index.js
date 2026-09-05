const express = require('express')
const cors = require('cors')
const catalyst = require('zcatalyst-sdk-node')

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const featureRoutes = require('./routes/features')
const logRoutes = require('./routes/logs')
const blockerRoutes = require('./routes/blockers')
const escalationRoutes = require('./routes/escalations')
const commentRoutes = require('./routes/comments')
const hierarchyRoutes = require('./routes/hierarchy')

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Patch Catalyst's req object — it lacks Node.js stream/EventEmitter methods
app.use((req, res, next) => {
  if (!req.listeners)        req.listeners        = () => []
  if (!req.on)               req.on               = () => req
  if (!req.once)             req.once             = () => req
  if (!req.emit)             req.emit             = () => false
  if (!req.removeListener)   req.removeListener   = () => req
  if (!req.pipe)             req.pipe             = () => req
  if (!req.unpipe)           req.unpipe           = () => req
  if (!req.resume)           req.resume           = () => req
  next()
})

// Attach Catalyst app to every request
app.use((req, res, next) => {
  try {
    req.catalyst = catalyst.initialize(req)
  } catch (e) {
    req.catalyst = null
  }
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/features', featureRoutes)
app.use('/api/logs', logRoutes)
app.use('/api/blockers', blockerRoutes)
app.use('/api/escalations', escalationRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/hierarchy', hierarchyRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Catch-all 404 — prevents Express finalhandler from running
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.url })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

module.exports = app
