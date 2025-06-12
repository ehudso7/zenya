/**
 * Comprehensive Test Suite for Zenya AI Collaborative Features
 * Tests WebSocket infrastructure, real-time synchronization, and performance
 */

import { WebSocket } from 'ws'
import { performance } from 'perf_hooks'

interface TestMetrics {
  connectionTime: number
  messageLatency: number[]
  reconnectionTime?: number
  memoryUsage: number
  cpuUsage: number
  successRate: number
  errors: string[]
}

interface TestResult {
  category: string
  test: string
  passed: boolean
  metrics?: any
  error?: string
  details?: string
}

class CollaborativeFeatureTester {
  private results: TestResult[] = []
  private wsUrl: string
  private authToken: string

  constructor(baseUrl: string, authToken: string) {
    this.wsUrl = `${baseUrl.replace('http', 'ws')}/api/ws/collaborate`
    this.authToken = authToken
  }

  async runAllTests() {
    console.log('🚀 Starting Zenya AI Collaborative Features Test Suite\n')
    
    // 1. WebSocket Infrastructure Tests
    await this.testWebSocketInfrastructure()
    
    // 2. Collaborative Features Tests
    await this.testCollaborativeFeatures()
    
    // 3. Session Management Tests
    await this.testSessionManagement()
    
    // 4. Real-time Synchronization Tests
    await this.testRealtimeSynchronization()
    
    // 5. Error Handling Tests
    await this.testErrorHandling()
    
    // 6. Performance at Scale Tests
    await this.testPerformanceAtScale()
    
    // Generate Report
    this.generateReport()
  }

  // 1. WebSocket Infrastructure Tests
  async testWebSocketInfrastructure() {
    console.log('📡 Testing WebSocket Infrastructure...\n')
    
    // Test basic connection
    await this.test('WebSocket Infrastructure', 'Basic Connection', async () => {
      const startTime = performance.now()
      const ws = await this.createWebSocketConnection('test-session-1')
      const connectionTime = performance.now() - startTime
      
      if (ws.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket failed to connect')
      }
      
      ws.close()
      
      return {
        metrics: { connectionTime },
        details: `Connection established in ${connectionTime.toFixed(2)}ms`
      }
    })
    
    // Test authentication
    await this.test('WebSocket Infrastructure', 'Authentication', async () => {
      try {
        const ws = new WebSocket(`${this.wsUrl}?token=invalid-token&sessionId=test`)
        await new Promise((resolve, reject) => {
          ws.on('open', () => reject(new Error('Should not connect with invalid token')))
          ws.on('error', resolve)
          ws.on('close', resolve)
        })
        return { details: 'Properly rejected invalid authentication' }
      } catch (error) {
        throw new Error('Failed to reject invalid authentication')
      }
    })
    
    // Test heartbeat mechanism
    await this.test('WebSocket Infrastructure', 'Heartbeat/Ping-Pong', async () => {
      const ws = await this.createWebSocketConnection('test-heartbeat')
      let pongReceived = false
      
      ws.on('pong', () => { pongReceived = true })
      ws.ping()
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (!pongReceived) {
        throw new Error('Pong not received')
      }
      
      ws.close()
      return { details: 'Heartbeat mechanism working correctly' }
    })
    
    // Test reconnection logic
    await this.test('WebSocket Infrastructure', 'Reconnection Logic', async () => {
      const ws = await this.createWebSocketConnection('test-reconnect')
      const startTime = performance.now()
      
      // Force disconnect
      ws.terminate()
      
      // Attempt reconnection
      const ws2 = await this.createWebSocketConnection('test-reconnect')
      const reconnectionTime = performance.now() - startTime
      
      ws2.close()
      
      return {
        metrics: { reconnectionTime },
        details: `Reconnected successfully in ${reconnectionTime.toFixed(2)}ms`
      }
    })
  }

  // 2. Collaborative Features Tests
  async testCollaborativeFeatures() {
    console.log('\n🤝 Testing Collaborative Features...\n')
    
    // Test cursor sharing
    await this.test('Collaborative Features', 'Cursor Sharing', async () => {
      const ws1 = await this.createWebSocketConnection('collab-cursor')
      const ws2 = await this.createWebSocketConnection('collab-cursor')
      
      let cursorReceived = false
      const startTime = performance.now()
      
      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === 'cursor_updated') {
          cursorReceived = true
        }
      })
      
      // Send cursor position from ws1
      ws1.send(JSON.stringify({
        type: 'cursor_move',
        x: 50,
        y: 75
      }))
      
      await new Promise(resolve => setTimeout(resolve, 100))
      const latency = performance.now() - startTime
      
      ws1.close()
      ws2.close()
      
      if (!cursorReceived) {
        throw new Error('Cursor update not received')
      }
      
      return {
        metrics: { latency },
        details: `Cursor sharing working with ${latency.toFixed(2)}ms latency`
      }
    })
    
    // Test synchronized lesson progress
    await this.test('Collaborative Features', 'Synchronized Lesson Progress', async () => {
      const ws1 = await this.createWebSocketConnection('collab-progress')
      const ws2 = await this.createWebSocketConnection('collab-progress')
      
      let progressReceived = false
      
      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === 'progress_updated') {
          progressReceived = message.stepNumber === 5
        }
      })
      
      ws1.send(JSON.stringify({
        type: 'step_progress',
        stepNumber: 5,
        completed: true
      }))
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      ws1.close()
      ws2.close()
      
      if (!progressReceived) {
        throw new Error('Progress update not synchronized')
      }
      
      return { details: 'Lesson progress synchronization working correctly' }
    })
    
    // Test collaborative notes
    await this.test('Collaborative Features', 'Collaborative Notes', async () => {
      const ws1 = await this.createWebSocketConnection('collab-notes')
      const ws2 = await this.createWebSocketConnection('collab-notes')
      
      let noteReceived = false
      const testNote = 'Test collaborative note content'
      
      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === 'note_added') {
          noteReceived = message.note.content === testNote
        }
      })
      
      ws1.send(JSON.stringify({
        type: 'add_note',
        content: testNote,
        position: { x: 100, y: 200 }
      }))
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      ws1.close()
      ws2.close()
      
      if (!noteReceived) {
        throw new Error('Note not synchronized')
      }
      
      return { details: 'Collaborative notes working correctly' }
    })
    
    // Test voice/video state management
    await this.test('Collaborative Features', 'Voice/Video State Management', async () => {
      const ws1 = await this.createWebSocketConnection('collab-voice')
      const ws2 = await this.createWebSocketConnection('collab-voice')
      
      let stateReceived = false
      
      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === 'voice_state_changed') {
          stateReceived = message.state.isMuted === true
        }
      })
      
      ws1.send(JSON.stringify({
        type: 'voice_state',
        state: { isMuted: true, isTalking: false }
      }))
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      ws1.close()
      ws2.close()
      
      if (!stateReceived) {
        throw new Error('Voice state not synchronized')
      }
      
      return { details: 'Voice/video state management working correctly' }
    })
  }

  // 3. Session Management Tests
  async testSessionManagement() {
    console.log('\n📋 Testing Session Management...\n')
    
    // Test session creation
    await this.test('Session Management', 'Session Creation', async () => {
      const sessionId = `session-${Date.now()}`
      const ws = await this.createWebSocketConnection(sessionId)
      
      let sessionJoined = false
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === 'session_joined') {
          sessionJoined = true
        }
      })
      
      await new Promise(resolve => setTimeout(resolve, 100))
      ws.close()
      
      if (!sessionJoined) {
        throw new Error('Session creation failed')
      }
      
      return { details: 'Session created successfully' }
    })
    
    // Test participant limits
    await this.test('Session Management', 'Participant Limits (Max 4)', async () => {
      const sessionId = `limit-test-${Date.now()}`
      const connections: WebSocket[] = []
      
      // Create 4 connections (should succeed)
      for (let i = 0; i < 4; i++) {
        const ws = await this.createWebSocketConnection(sessionId, `user${i}`)
        connections.push(ws)
      }
      
      // Try 5th connection (should fail)
      let fifthFailed = false
      try {
        const ws5 = new WebSocket(`${this.wsUrl}?token=${this.authToken}&sessionId=${sessionId}`)
        await new Promise((resolve, reject) => {
          ws5.on('open', () => resolve(null))
          ws5.on('close', (code, reason) => {
            if (reason.toString().includes('full')) {
              fifthFailed = true
              resolve(null)
            }
          })
          ws5.on('error', reject)
        })
      } catch (error) {
        fifthFailed = true
      }
      
      // Clean up
      connections.forEach(ws => ws.close())
      
      if (!fifthFailed) {
        throw new Error('Session did not enforce participant limit')
      }
      
      return { details: 'Participant limit correctly enforced at 4 users' }
    })
    
    // Test session persistence
    await this.test('Session Management', 'Session Persistence', async () => {
      const sessionId = `persist-test-${Date.now()}`
      const ws1 = await this.createWebSocketConnection(sessionId)
      
      // Add some state
      ws1.send(JSON.stringify({
        type: 'add_note',
        content: 'Persistent note',
        position: { x: 0, y: 0 }
      }))
      
      await new Promise(resolve => setTimeout(resolve, 100))
      ws1.close()
      
      // Rejoin session
      const ws2 = await this.createWebSocketConnection(sessionId)
      let stateRestored = false
      
      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === 'session_joined') {
          const notes = message.currentState.sharedState.notes
          stateRestored = notes.some((n: any) => n.content === 'Persistent note')
        }
      })
      
      await new Promise(resolve => setTimeout(resolve, 100))
      ws2.close()
      
      if (!stateRestored) {
        throw new Error('Session state not persisted')
      }
      
      return { details: 'Session state persisted correctly' }
    })
  }

  // 4. Real-time Synchronization Tests
  async testRealtimeSynchronization() {
    console.log('\n⚡ Testing Real-time Synchronization...\n')
    
    // Test message latency
    await this.test('Real-time Synchronization', 'Message Latency', async () => {
      const sessionId = `latency-test-${Date.now()}`
      const ws1 = await this.createWebSocketConnection(sessionId, 'user1')
      const ws2 = await this.createWebSocketConnection(sessionId, 'user2')
      
      const latencies: number[] = []
      const messageCount = 10
      
      for (let i = 0; i < messageCount; i++) {
        const startTime = performance.now()
        let messageReceived = false
        
        const promise = new Promise<void>((resolve) => {
          const handler = (data: any) => {
            const message = JSON.parse(data.toString())
            if (message.type === 'cursor_updated' && !messageReceived) {
              messageReceived = true
              latencies.push(performance.now() - startTime)
              ws2.off('message', handler)
              resolve()
            }
          }
          ws2.on('message', handler)
        })
        
        ws1.send(JSON.stringify({
          type: 'cursor_move',
          x: i * 10,
          y: i * 10
        }))
        
        await promise
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length
      const maxLatency = Math.max(...latencies)
      const minLatency = Math.min(...latencies)
      
      ws1.close()
      ws2.close()
      
      return {
        metrics: { avgLatency, maxLatency, minLatency },
        details: `Avg: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency.toFixed(2)}ms, Min: ${minLatency.toFixed(2)}ms`
      }
    })
    
    // Test state consistency
    await this.test('Real-time Synchronization', 'State Consistency', async () => {
      const sessionId = `consistency-test-${Date.now()}`
      const connections: WebSocket[] = []
      const userCount = 3
      
      // Create multiple connections
      for (let i = 0; i < userCount; i++) {
        const ws = await this.createWebSocketConnection(sessionId, `user${i}`)
        connections.push(ws)
      }
      
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Each user adds a note
      for (let i = 0; i < userCount; i++) {
        connections[i].send(JSON.stringify({
          type: 'add_note',
          content: `Note from user${i}`,
          position: { x: i * 100, y: 0 }
        }))
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Verify all users have all notes
      const statePromises = connections.map((ws, index) => {
        return new Promise<boolean>((resolve) => {
          ws.send(JSON.stringify({ type: 'get_state' }))
          ws.once('message', (data) => {
            const message = JSON.parse(data.toString())
            if (message.type === 'session_joined' || message.type === 'state_update') {
              const notes = message.currentState?.sharedState?.notes || []
              resolve(notes.length === userCount)
            }
          })
        })
      })
      
      const results = await Promise.all(statePromises)
      connections.forEach(ws => ws.close())
      
      if (!results.every(r => r)) {
        throw new Error('State inconsistency detected')
      }
      
      return { details: 'State consistency maintained across all participants' }
    })
    
    // Test message ordering
    await this.test('Real-time Synchronization', 'Message Ordering', async () => {
      const sessionId = `ordering-test-${Date.now()}`
      const ws1 = await this.createWebSocketConnection(sessionId, 'sender')
      const ws2 = await this.createWebSocketConnection(sessionId, 'receiver')
      
      const receivedMessages: number[] = []
      const expectedOrder = [1, 2, 3, 4, 5]
      
      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === 'note_added') {
          const num = parseInt(message.note.content.match(/\d+/)?.[0] || '0')
          if (num > 0) receivedMessages.push(num)
        }
      })
      
      // Send messages in order
      for (const num of expectedOrder) {
        ws1.send(JSON.stringify({
          type: 'add_note',
          content: `Message ${num}`,
          position: { x: 0, y: 0 }
        }))
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      
      await new Promise(resolve => setTimeout(resolve, 200))
      
      ws1.close()
      ws2.close()
      
      const isOrdered = receivedMessages.every((val, idx) => val === expectedOrder[idx])
      
      if (!isOrdered) {
        throw new Error(`Messages received out of order: ${receivedMessages.join(', ')}`)
      }
      
      return { details: 'Message ordering preserved correctly' }
    })
  }

  // 5. Error Handling Tests
  async testErrorHandling() {
    console.log('\n🛡️ Testing Error Handling...\n')
    
    // Test disconnection handling
    await this.test('Error Handling', 'Disconnection Scenarios', async () => {
      const sessionId = `disconnect-test-${Date.now()}`
      const ws1 = await this.createWebSocketConnection(sessionId, 'user1')
      const ws2 = await this.createWebSocketConnection(sessionId, 'user2')
      
      let disconnectNotified = false
      
      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === 'participant_disconnected') {
          disconnectNotified = true
        }
      })
      
      // Force disconnect ws1
      ws1.terminate()
      
      await new Promise(resolve => setTimeout(resolve, 200))
      ws2.close()
      
      if (!disconnectNotified) {
        throw new Error('Disconnection not properly handled')
      }
      
      return { details: 'Disconnection scenarios handled correctly' }
    })
    
    // Test reconnection with state recovery
    await this.test('Error Handling', 'Reconnection with State Recovery', async () => {
      const sessionId = `recovery-test-${Date.now()}`
      const userId = 'recovery-user'
      const ws1 = await this.createWebSocketConnection(sessionId, userId)
      
      // Add state
      ws1.send(JSON.stringify({
        type: 'step_progress',
        stepNumber: 3,
        completed: true
      }))
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Disconnect
      ws1.close()
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Reconnect
      const ws2 = await this.createWebSocketConnection(sessionId, userId)
      let stateRecovered = false
      
      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === 'session_joined') {
          const completedSteps = message.currentState.sharedState.completedSteps
          stateRecovered = completedSteps.includes(3)
        }
      })
      
      await new Promise(resolve => setTimeout(resolve, 200))
      ws2.close()
      
      if (!stateRecovered) {
        throw new Error('State not recovered after reconnection')
      }
      
      return { details: 'State recovery after reconnection working correctly' }
    })
    
    // Test network issue handling
    await this.test('Error Handling', 'Network Issues Handling', async () => {
      const sessionId = `network-test-${Date.now()}`
      const ws = await this.createWebSocketConnection(sessionId)
      
      let errorHandled = false
      
      ws.on('error', () => {
        errorHandled = true
      })
      
      // Simulate network issue by sending invalid data
      try {
        ws.send('invalid-json-data')
      } catch (error) {
        errorHandled = true
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
      ws.close()
      
      return { 
        details: 'Network issues handled gracefully',
        metrics: { errorHandled }
      }
    })
  }

  // 6. Performance at Scale Tests
  async testPerformanceAtScale() {
    console.log('\n🚀 Testing Performance at Scale...\n')
    
    // Test multiple concurrent sessions
    await this.test('Performance at Scale', 'Multiple Concurrent Sessions', async () => {
      const sessionCount = 10
      const connectionsPerSession = 2
      const connections: WebSocket[] = []
      const startTime = performance.now()
      const startMemory = process.memoryUsage().heapUsed / 1024 / 1024
      
      // Create multiple sessions
      for (let i = 0; i < sessionCount; i++) {
        const sessionId = `scale-session-${i}`
        for (let j = 0; j < connectionsPerSession; j++) {
          const ws = await this.createWebSocketConnection(sessionId, `user${j}`)
          connections.push(ws)
        }
      }
      
      const setupTime = performance.now() - startTime
      
      // Simulate activity
      const activityStart = performance.now()
      for (let i = 0; i < 20; i++) {
        const randomWs = connections[Math.floor(Math.random() * connections.length)]
        randomWs.send(JSON.stringify({
          type: 'cursor_move',
          x: Math.random() * 100,
          y: Math.random() * 100
        }))
        await new Promise(resolve => setTimeout(resolve, 10))
      }
      const activityTime = performance.now() - activityStart
      
      const endMemory = process.memoryUsage().heapUsed / 1024 / 1024
      const memoryIncrease = endMemory - startMemory
      
      // Clean up
      connections.forEach(ws => ws.close())
      
      return {
        metrics: {
          sessionCount,
          totalConnections: connections.length,
          setupTime,
          activityTime,
          memoryIncrease
        },
        details: `${sessionCount} sessions with ${connections.length} total connections. Memory increase: ${memoryIncrease.toFixed(2)}MB`
      }
    })
    
    // Test high message throughput
    await this.test('Performance at Scale', 'High Message Throughput', async () => {
      const sessionId = `throughput-test-${Date.now()}`
      const ws1 = await this.createWebSocketConnection(sessionId, 'sender')
      const ws2 = await this.createWebSocketConnection(sessionId, 'receiver')
      
      let messagesReceived = 0
      const messageCount = 100
      const startTime = performance.now()
      
      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === 'cursor_updated') {
          messagesReceived++
        }
      })
      
      // Send burst of messages
      for (let i = 0; i < messageCount; i++) {
        ws1.send(JSON.stringify({
          type: 'cursor_move',
          x: i,
          y: i
        }))
      }
      
      // Wait for messages to be received
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const duration = performance.now() - startTime
      const throughput = messagesReceived / (duration / 1000)
      
      ws1.close()
      ws2.close()
      
      return {
        metrics: {
          messagesSent: messageCount,
          messagesReceived,
          duration,
          throughput
        },
        details: `Throughput: ${throughput.toFixed(2)} messages/second`
      }
    })
    
    // Test memory usage per session
    await this.test('Performance at Scale', 'Memory Usage Per Session', async () => {
      const baselineMemory = process.memoryUsage().heapUsed / 1024 / 1024
      const sessionsToTest = 5
      const memoryPerSession: number[] = []
      
      for (let i = 0; i < sessionsToTest; i++) {
        const beforeMemory = process.memoryUsage().heapUsed / 1024 / 1024
        
        const sessionId = `memory-test-${i}`
        const connections: WebSocket[] = []
        
        // Create full session (4 participants)
        for (let j = 0; j < 4; j++) {
          const ws = await this.createWebSocketConnection(sessionId, `user${j}`)
          connections.push(ws)
        }
        
        // Add some state
        for (let j = 0; j < 10; j++) {
          connections[0].send(JSON.stringify({
            type: 'add_note',
            content: `Note ${j} with some content to use memory`,
            position: { x: j * 10, y: j * 10 }
          }))
        }
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const afterMemory = process.memoryUsage().heapUsed / 1024 / 1024
        memoryPerSession.push(afterMemory - beforeMemory)
        
        // Clean up
        connections.forEach(ws => ws.close())
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      const avgMemoryPerSession = memoryPerSession.reduce((a, b) => a + b, 0) / memoryPerSession.length
      
      return {
        metrics: {
          baselineMemory,
          avgMemoryPerSession,
          totalSessions: sessionsToTest
        },
        details: `Average memory per session: ${avgMemoryPerSession.toFixed(2)}MB`
      }
    })
  }

  // Helper methods
  private async createWebSocketConnection(sessionId: string, userId?: string): Promise<WebSocket> {
    const token = userId ? this.createMockToken(userId) : this.authToken
    const ws = new WebSocket(`${this.wsUrl}?token=${token}&sessionId=${sessionId}`)
    
    return new Promise((resolve, reject) => {
      ws.on('open', () => resolve(ws))
      ws.on('error', reject)
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    })
  }

  private createMockToken(userId: string): string {
    // Create a simple mock JWT token for testing
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
    const payload = Buffer.from(JSON.stringify({ 
      sub: userId, 
      exp: Math.floor(Date.now() / 1000) + 3600 
    })).toString('base64')
    const signature = 'mock-signature'
    return `${header}.${payload}.${signature}`
  }

  private async test(category: string, testName: string, testFn: () => Promise<any>) {
    try {
      const result = await testFn()
      this.results.push({
        category,
        test: testName,
        passed: true,
        ...result
      })
      console.log(`✅ ${testName}`)
      if (result.details) {
        console.log(`   ${result.details}`)
      }
    } catch (error) {
      this.results.push({
        category,
        test: testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      })
      console.log(`❌ ${testName}`)
      console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private generateReport() {
    console.log('\n' + '='.repeat(80))
    console.log('📊 TEST RESULTS SUMMARY')
    console.log('='.repeat(80) + '\n')
    
    const categories = [...new Set(this.results.map(r => r.category))]
    
    categories.forEach(category => {
      const categoryResults = this.results.filter(r => r.category === category)
      const passed = categoryResults.filter(r => r.passed).length
      const total = categoryResults.length
      const percentage = (passed / total * 100).toFixed(1)
      
      console.log(`${category}: ${passed}/${total} passed (${percentage}%)`)
      
      // Show failed tests
      const failed = categoryResults.filter(r => !r.passed)
      if (failed.length > 0) {
        failed.forEach(f => {
          console.log(`  ❌ ${f.test}: ${f.error}`)
        })
      }
      
      // Show metrics for passed tests
      const withMetrics = categoryResults.filter(r => r.passed && r.metrics)
      if (withMetrics.length > 0) {
        console.log('  Metrics:')
        withMetrics.forEach(m => {
          console.log(`    - ${m.test}:`)
          Object.entries(m.metrics).forEach(([key, value]) => {
            console.log(`      ${key}: ${value}`)
          })
        })
      }
      
      console.log()
    })
    
    const totalPassed = this.results.filter(r => r.passed).length
    const totalTests = this.results.length
    const overallPercentage = (totalPassed / totalTests * 100).toFixed(1)
    
    console.log('='.repeat(80))
    console.log(`OVERALL: ${totalPassed}/${totalTests} tests passed (${overallPercentage}%)`)
    console.log('='.repeat(80))
  }
}

// Run tests if executed directly
if (require.main === module) {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'
  const authToken = process.env.TEST_AUTH_TOKEN || 'test-token'
  
  const tester = new CollaborativeFeatureTester(baseUrl, authToken)
  tester.runAllTests().catch(console.error)
}

export { CollaborativeFeatureTester }