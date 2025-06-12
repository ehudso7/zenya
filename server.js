/**
 * Custom Next.js server with WebSocket support
 * For local development and self-hosted deployments
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { collaborativeWS } = require('./lib/websocket/server')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// Create Next.js app instance
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize WebSocket server
  collaborativeWS.initialize(server)
  
  server.once('error', (err) => {
    console.error(err)
    process.exit(1)
  })

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log('> WebSocket server initialized for collaborative features')
  })
})