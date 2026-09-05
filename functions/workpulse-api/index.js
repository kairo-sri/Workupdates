// DIAGNOSTIC MODE — minimal handler, no Express
// Once this returns a response, we'll restore the full Express app

module.exports = async function catalystHandler(req, res) {
  try {
    const info = {
      status: 'ok',
      ts: new Date().toISOString(),
      url: req.url,
      method: req.method,
      hasWriteHead: typeof res.writeHead === 'function',
      hasEnd: typeof res.end === 'function',
      hasWrite: typeof res.write === 'function',
      hasSetHeader: typeof res.setHeader === 'function'
    }
    const body = JSON.stringify(info, null, 2)

    if (typeof res.writeHead === 'function') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      })
    } else if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json')
    }

    res.end(body)
  } catch (err) {
    try { res.end(JSON.stringify({ error: err.message, stack: err.stack })) } catch (_) { /* silent */ }
  }
}
