#!/usr/bin/env node

/**
 * Debug Monitor Verification Script
 * Run this to verify the debug monitor is working correctly
 */

async function verifyDebugMonitor() {
  console.log('🔍 Debug Monitor Verification Starting...\n')
  
  const baseUrl = 'http://localhost:3000'
  
  try {
    // Test 1: Check if debug endpoints are accessible
    console.log('1️⃣ Testing debug endpoints...')
    
    const endpoints = [
      '/debug/monitor',
      '/debug/test', 
      '/debug/diagnose',
      '/api/debug/connect',
      '/api/debug/stream'
    ]
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`)
        console.log(`   ${endpoint}: ${response.status === 200 ? '✅' : '❌'} (${response.status})`)
      } catch (error) {
        console.log(`   ${endpoint}: ❌ (Failed to connect)`)
      }
    }
    
    // Test 2: Test direct POST to debug endpoint
    console.log('\n2️⃣ Testing debug message broadcast...')
    
    const testMessage = {
      type: 'test',
      data: {
        message: 'Debug monitor verification test',
        timestamp: new Date().toISOString()
      }
    }
    
    const postResponse = await fetch(`${baseUrl}/api/debug/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMessage)
    })
    
    const result = await postResponse.json()
    console.log(`   Broadcast test: ${postResponse.status === 200 ? '✅' : '❌'}`)
    console.log(`   Active sessions: ${result.activeSessions || 0}`)
    
    // Test 3: Check CSRF endpoint
    console.log('\n3️⃣ Testing CSRF token generation...')
    
    const csrfResponse = await fetch(`${baseUrl}/api/csrf`)
    console.log(`   CSRF endpoint: ${csrfResponse.status === 200 ? '✅' : '❌'}`)
    
    // Test 4: Check API endpoints
    console.log('\n4️⃣ Testing API endpoints...')
    
    const apiEndpoints = [
      { path: '/api/curriculums', method: 'GET' },
      { path: '/api/ai/status', method: 'GET' }
    ]
    
    for (const { path, method } of apiEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${path}`, { method })
        console.log(`   ${method} ${path}: ${response.status < 500 ? '✅' : '❌'} (${response.status})`)
      } catch (error) {
        console.log(`   ${method} ${path}: ❌ (Failed)`)
      }
    }
    
    console.log('\n✅ Verification Complete!')
    console.log('\n📋 Next Steps:')
    console.log('1. Open http://localhost:3000/debug/monitor in your browser')
    console.log('2. You should see "Connected" status')
    console.log('3. Navigate your app - all logs should appear in real-time')
    console.log('4. Check for any errors in the browser console')
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure your dev server is running (npm run dev)')
    console.log('2. Check that you\'re on http://localhost:3000')
    console.log('3. Clear browser cache and cookies')
    console.log('4. Check the terminal for any server errors')
  }
}

// Run verification
verifyDebugMonitor()