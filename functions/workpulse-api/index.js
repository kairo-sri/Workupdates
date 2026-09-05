const express = require('express')
const cors = require('cors')
const catalyst = require('zcatalyst-sdk-node')
const EventEmitter = require('events')

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

// Initialize Catalyst once using runtime admin credentials (CATALYST_CONFIG env var).
// Browser requests don't carry Catalyst auth headers, so we can't use
// catalyst.initialize(req) — we need the server-side admin app instead.
let _catalystApp = null
function getCatalystApp() {
  if (_catalystApp) return _catalystApp
  try {
    _catalystApp = catalyst.initializeApp()
  } catch (e) {
    if (!e.message || !e.message.includes('duplicate')) {
      console.error('Catalyst initializeApp error:', e.message)
    }
    // Already initialized — grab the default app from the collection
    _catalystApp = catalyst.appCollection?.['[DEFAULT]'] || null
  }
  return _catalystApp
}

app.use((req, res, next) => {
  req.catalyst = getCatalystApp()
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/features', featureRoutes)
app.use('/api/logs', logRoutes)
app.use('/api/blockers', blockerRoutes)
app.use('/api/escalations', escalationRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/hierarchy', hierarchyRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Temporary: check what Catalyst env vars are available
app.get('/api/debug-env', (req, res) => {
  const keys = Object.keys(process.env).filter(k =>
    k.includes('CATALYST') || k.includes('ZOHO') || k.includes('X_ZC')
  )
  const safe = {}
  keys.forEach(k => {
    const v = process.env[k] || ''
    safe[k] = v.length > 40 ? v.slice(0, 20) + '…' : v
  })
  res.json({ catalystApp: !!_catalystApp, env: safe })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.url })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

// AdvancedIO handler — patches missing stream methods on Catalyst's req,
// wraps res.end so the returned Promise resolves when the response is sent.
module.exports = function catalystHandler(req, res) {
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
