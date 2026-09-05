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

// Catalyst is initialized from the incoming request headers.
// Requests proxied through Catalyst Slate automatically carry auth headers
// so catalyst.initialize(req) can authenticate to Data Store and other services.
app.use((req, res, next) => {
  try {
    req.catalyst = catalyst.initialize(req, { type: 'advancedio' })
  } catch (e) {
    req.catalyst = null
  }
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
  const fs = require('fs'), path = require('path')
  const credPath = path.join(process.cwd(), 'catalyst/application_auth.json')
  let credKeys = []
  let credSample = {}
  try {
    const raw = JSON.parse(fs.readFileSync(credPath, 'utf8'))
    credKeys = Object.keys(raw)
    // Show short values, redact long ones
    credKeys.forEach(k => {
      const v = String(raw[k])
      credSample[k] = v.length > 30 ? v.slice(0, 15) + '…' : v
    })
  } catch (e) {
    credSample = { error: e.message }
  }
  res.json({
    status: 'ok',
    catalystInit: !!req.catalyst,
    credPath,
    credKeys,
    credSample,
    cwd: process.cwd()
  })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.url })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

// AdvancedIO handler
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
