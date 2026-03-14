import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { findFrames } from './server/find-frames'

export default defineConfig(({ mode }) => {
  // Load .env into process.env so the find-frames middleware can read GEMINI_API_KEY
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
  plugins: [
    react(),
    {
      name: 'find-frames-api',
      configureServer(server) {
        server.middlewares.use('/api/find-frames', (req, res, next) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            (async () => {
              const apiKey = process.env.GEMINI_API_KEY
              if (!apiKey) {
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY is not set' }))
                return
              }
              const payload = JSON.parse(body || '{}') as {
                frameWidth?: number
                frameHeight?: number
                matOpeningWidth?: number
                matOpeningHeight?: number
                defaultImageWidth?: number
                defaultImageHeight?: number
              }
              const { frameWidth, frameHeight } = payload
              if (
                typeof frameWidth !== 'number' ||
                typeof frameHeight !== 'number' ||
                frameWidth < 1 ||
                frameHeight < 1
              ) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(
                  JSON.stringify({
                    error: 'Invalid frameWidth or frameHeight (positive numbers required)',
                  })
                )
                return
              }
              const params = {
                frameWidth,
                frameHeight,
                ...(typeof payload.matOpeningWidth === 'number' && payload.matOpeningWidth > 0 && { matOpeningWidth: payload.matOpeningWidth }),
                ...(typeof payload.matOpeningHeight === 'number' && payload.matOpeningHeight > 0 && { matOpeningHeight: payload.matOpeningHeight }),
                ...(typeof payload.defaultImageWidth === 'number' && payload.defaultImageWidth > 0 && { defaultImageWidth: payload.defaultImageWidth }),
                ...(typeof payload.defaultImageHeight === 'number' && payload.defaultImageHeight > 0 && { defaultImageHeight: payload.defaultImageHeight }),
              }
              const data = await findFrames(params, apiKey)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
            })().catch((err) => {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: err instanceof Error ? err.message : 'Search failed',
                })
              )
            })
          })
        })
      },
    },
  ],
  }
})
