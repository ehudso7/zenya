#!/usr/bin/env tsx

/**
 * Test Runner for Zenya AI Collaborative Features
 * This script runs comprehensive tests on the real-time collaboration system
 */

import { CollaborativeFeatureTester } from './test-collaborative-features'
import { spawn } from 'child_process'
import { createHash } from 'crypto'

// Configuration
const TEST_PORT = 3001
const TEST_BASE_URL = `http://localhost:${TEST_PORT}`

// Generate a test auth token
function generateTestToken(userId: string = 'test-user-1') {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
  const payload = Buffer.from(JSON.stringify({ 
    sub: userId,
    email: `${userId}@test.com`,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  })).toString('base64')
  const signature = createHash('sha256').update(`${header}.${payload}.test-secret`).digest('base64')
  return `${header}.${payload}.${signature}`
}

async function startTestServer(): Promise<() => void> {
  console.log('🚀 Starting test server...\n')
  
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', ['server.js'], {
      env: {
        ...process.env,
        PORT: TEST_PORT.toString(),
        NODE_ENV: 'test'
      },
      stdio: 'pipe'
    })

    let serverReady = false

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString()
      console.log(`[Server] ${output}`)
      
      if (output.includes('Ready on') && !serverReady) {
        serverReady = true
        console.log('✅ Test server is ready\n')
        
        // Return cleanup function
        resolve(() => {
          console.log('\n🛑 Stopping test server...')
          serverProcess.kill('SIGTERM')
        })
      }
    })

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server Error] ${data.toString()}`)
    })

    serverProcess.on('error', (error) => {
      reject(new Error(`Failed to start server: ${error.message}`))
    })

    serverProcess.on('exit', (code) => {
      if (!serverReady) {
        reject(new Error(`Server exited with code ${code} before becoming ready`))
      }
    })

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!serverReady) {
        serverProcess.kill('SIGTERM')
        reject(new Error('Server startup timeout'))
      }
    }, 30000)
  })
}

async function runTests() {
  let stopServer: (() => void) | null = null
  
  try {
    // Start test server
    stopServer = await startTestServer()
    
    // Wait a bit for server to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('🧪 Running collaborative feature tests...\n')
    console.log('=' + '='.repeat(79) + '\n')
    
    // Create test token
    const authToken = generateTestToken()
    
    // Run tests
    const tester = new CollaborativeFeatureTester(TEST_BASE_URL, authToken)
    await tester.runAllTests()
    
    console.log('\n✨ All tests completed!\n')
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error)
    process.exit(1)
  } finally {
    // Clean up
    if (stopServer) {
      stopServer()
    }
  }
}

// Display test information
console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           Zenya AI Collaborative Features Test Suite          ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  This test suite comprehensively verifies:                   ║
║                                                               ║
║  📡 WebSocket Infrastructure                                  ║
║     - Connection handling and authentication                  ║
║     - Heartbeat mechanism and reconnection logic             ║
║                                                               ║
║  🤝 Collaborative Features                                    ║
║     - Real-time cursor sharing                               ║
║     - Synchronized lesson progress                           ║
║     - Collaborative notes and whiteboard                     ║
║     - Voice/video state management                           ║
║                                                               ║
║  📋 Session Management                                        ║
║     - Session creation and participant limits                ║
║     - State persistence and cleanup                          ║
║                                                               ║
║  ⚡ Real-time Synchronization                                 ║
║     - Message latency and ordering                           ║
║     - State consistency across participants                  ║
║                                                               ║
║  🛡️  Error Handling                                           ║
║     - Disconnection scenarios                                ║
║     - State recovery and network issues                      ║
║                                                               ║
║  🚀 Performance at Scale                                      ║
║     - Multiple concurrent sessions                           ║
║     - Memory usage and throughput metrics                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`)

// Run the tests
runTests().catch(console.error)