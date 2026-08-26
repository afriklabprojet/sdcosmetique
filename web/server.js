'use strict'

// DOIT être défini AVANT tout require Next.js
process.env.NODE_ENV = 'production'

// Charger .env.production EXPLICITEMENT avant Next.js
// (Next.js standalone ne charge pas toujours les env vars runtime correctement)
;(function loadEnvProduction() {
  const path = require('node:path')
  const fs = require('node:fs')
  try {
    const envFile = path.join(__dirname, '.env.production')
    if (!fs.existsSync(envFile)) return
    const lines = fs.readFileSync(envFile, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1)
      if (key) process.env[key] = value
    }
    console.log('[server] .env.production chargé explicitement')
  } catch (e) {
    console.warn('[server] Impossible de charger .env.production:', e.message)
  }
})()

// En mode standalone, Next.js supprime webpack de node_modules.
// La var __NEXT_PRIVATE_STANDALONE_CONFIG signale à Next.js d'utiliser
// la config JSON du build et de ne PAS lever l'erreur webpack manquant.
try {
  const requiredServerFiles = require('./.next/required-server-files.json')
  process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(requiredServerFiles.config)
} catch (e) {
  console.warn('Warning: could not load required-server-files.json:', e.message)
}

const http = require('node:http')
const { parse } = require('node:url')
const next = require('next')
const fs = require('node:fs')

// LiteSpeed passe le socket Unix via LSNODE_SOCKET (pas de PORT TCP)
const socket = process.env.LSNODE_SOCKET
const port = Number.parseInt(process.env.PORT || '3000', 10)
const hostname = process.env.HOSTNAME || '0.0.0.0'
const dir = __dirname

const app = next({ dev: false, dir, hostname, port: socket ? 3000 : port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = http.createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling', req.url, err)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })

  server.once('error', (err) => {
    console.error('Server error:', err)
    process.exit(1)
  })

  if (socket) {
    // Supprimer l'ancien socket si présent
    try { if (fs.existsSync(socket)) fs.unlinkSync(socket) } catch (e) { console.warn('Could not remove old socket:', e.message) }
    server.listen(socket, () => {
      // LiteSpeed a besoin de pouvoir écrire sur le socket
      try { fs.chmodSync(socket, '666') } catch (e) { console.warn('Could not chmod socket:', e.message) }
      console.log(`> Ready on socket ${socket}`)
    })
  } else {
    server.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
  }
}).catch((err) => {
  console.error('Failed to start:', err)
  process.exit(1)
})
