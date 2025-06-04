import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

// Stress test configuration - push the system to its limits
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Warm up
    { duration: '5m', target: 500 },   // Ramp to high load
    { duration: '2m', target: 1000 },  // Push to extreme
    { duration: '5m', target: 1000 },  // Stay at extreme
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // Accept higher latency under stress
    http_req_failed: ['rate<0.2'],     // Accept up to 20% failure under stress
  },
}

const BASE_URL = __ENV.BASE_URL || 'https://zenyaai.com'

export default function() {
  // Focus on the most resource-intensive operations
  
  // 1. Heavy AI requests
  const aiRequests = [
    'Explain quantum computing in detail',
    'Write a comprehensive guide to machine learning',
    'Create a full curriculum for advanced web development',
    'Generate 10 practice problems for JavaScript arrays',
  ]
  
  const message = aiRequests[Math.floor(Math.random() * aiRequests.length)]
  
  const aiRes = http.post(`${BASE_URL}/api/ai`, JSON.stringify({
    message,
    context: 'learning',
    mode: 'detailed',
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
  
  const aiSuccess = check(aiRes, {
    'AI endpoint responds': (r) => r.status < 500,
    'AI response under 5s': (r) => r.timings.duration < 5000,
  })
  errorRate.add(!aiSuccess)
  
  // 2. Concurrent curriculum requests
  const batch = http.batch([
    ['GET', `${BASE_URL}/api/curriculums`],
    ['GET', `${BASE_URL}/api/lessons?curriculum=web-dev`],
    ['GET', `${BASE_URL}/api/lessons?curriculum=javascript`],
    ['GET', `${BASE_URL}/api/lessons?curriculum=react`],
  ])
  
  batch.forEach((res, i) => {
    check(res, {
      [`Request ${i} successful`]: (r) => r.status === 200,
    })
  })
  
  // 3. Search operations (typically resource-intensive)
  const searchRes = http.get(`${BASE_URL}/api/search?q=${encodeURIComponent('javascript functions')}`)
  check(searchRes, {
    'Search responds': (r) => r.status < 500,
  })
  
  // Minimal sleep to maintain pressure
  sleep(0.1)
}