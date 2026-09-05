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

// Attach Catalyst app to every request
app.use((req, res, next) => {
  try {
    req.catalyst = catalyst.initialize(req)
  } catch (e) {
    // Allow requests outside Catalyst (local dev)
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

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

// Catalyst BasicIO handler
module.exports = (context, basicIO) => {
  basicIO.setReadType(catalyst.BasicIO.read_type.json)

  const req = basicIO.getRequest()
  const res = basicIO.getResponse()

  app(req, res)
}
