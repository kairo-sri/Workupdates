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

// Attach Catalyst app to every request (AdvancedIO — reads auth from req.headers)
app.use((req, res, next) => {
  try {
    req.catalyst = catalyst.initialize(req, { type: 'advancedio' })
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

// Catalyst AdvancedIO wrapper — patches any missing stream/EventEmitter methods on the
// Catalyst req object without replacing its prototype, then runs Express and returns a
// Promise so Catalyst knows when the response is finished.
const EventEmitter = require('events')

module.exports = function catalystHandler (req, res) {
  return new Promise((resolve, reject) => {
    const em = new EventEmitter()

    if (!req.listeners)          req.listeners          = em.listeners.bind(em)
    if (!req.on)                 req.on                 = em.on.bind(em)
    if (!req.once)               req.once               = em.once.bind(em)
    if (!req.emit)               req.emit               = em.emit.bind(em)
    if (!req.removeListener)     req.removeListener     = em.removeListener.bind(em)
    if (!req.removeAllListeners) req.removeAllListeners = em.removeAllListeners.bind(em)
    if (!req.resume)             req.resume             = function () { return this }
    if (!req.pause)              req.pause              = function () { return this }
    if (!req.pipe)               req.pipe               = function () { return this }
    if (!req.unpipe)             req.unpipe             = function () { return this }
    if (!req.destroy)            req.destroy            = function () { return this }
    if (!req.headers)            req.headers            = {}

    // Intercept res.end so we can resolve the Promise after the response is written
    const _origEnd = res.end
    res.end = function (...args) {
      if (_origEnd) _origEnd.apply(this, args)
      resolve()
    }

    try {
      app(req, res)
    } catch (err) {
      reject(err)
    }
  })
}
