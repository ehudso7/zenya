import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users over 30s
    { duration: '1m', target: 50 },    // Ramp up to 50 users over 1m
    { duration: '3m', target: 100 },   // Stay at 100 users for 3m
    { duration: '1m', target: 200 },   // Spike to 200 users
    { duration: '3m', target: 100 },   // Back to 100 users
    { duration: '1m', target: 0 },     // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.05'],                  // Error rate under 5%
    errors: ['rate<0.1'],                            // Custom error rate under 10%
  },
}

const BASE_URL = __ENV.BASE_URL || 'https://zenyaai.com'

// Test data
const testUsers = [
  { email: 'loadtest1@example.com', password: 'LoadTest123!' },
  { email: 'loadtest2@example.com', password: 'LoadTest123!' },
  { email: 'loadtest3@example.com', password: 'LoadTest123!' },
]

export function setup() {
  // Setup test data if needed
  console.log('Setting up load test...')
  
  // Create test users
  testUsers.forEach(user => {
    const signupRes = http.post(`${BASE_URL}/api/auth/signup`, JSON.stringify({
      email: user.email,
      password: user.password,
      name: 'Load Test User',
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
    
    if (signupRes.status !== 200 && signupRes.status !== 409) {
      console.log(`Failed to create user ${user.email}: ${signupRes.status}`)
    }
  })
  
  return { testUsers }
}

export default function(data) {
  // Select a random test user
  const user = testUsers[Math.floor(Math.random() * testUsers.length)]
  
  // Scenario 1: Landing page visit
  const landingRes = http.get(`${BASE_URL}/`)
  check(landingRes, {
    'Landing page loads': (r) => r.status === 200,
    'Landing page fast': (r) => r.timings.duration < 500,
  })
  errorRate.add(landingRes.status !== 200)
  
  sleep(1)
  
  // Scenario 2: User authentication flow
  const signinRes = http.post(`${BASE_URL}/api/auth/signin`, JSON.stringify({
    email: user.email,
    password: user.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
  
  const authSuccess = check(signinRes, {
    'Sign in successful': (r) => r.status === 200,
    'Auth token received': (r) => r.json('access_token') !== undefined,
  })
  errorRate.add(!authSuccess)
  
  if (authSuccess) {
    const authToken = signinRes.json('access_token')
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    }
    
    // Scenario 3: Access learn page
    const learnRes = http.get(`${BASE_URL}/api/curriculums`, { headers })
    check(learnRes, {
      'Curriculums loaded': (r) => r.status === 200,
      'Has curriculum data': (r) => r.json().length > 0,
    })
    
    sleep(2)
    
    // Scenario 4: AI interaction
    const aiRes = http.post(`${BASE_URL}/api/ai`, JSON.stringify({
      message: 'What is JavaScript?',
      context: 'learning',
    }), { headers })
    
    check(aiRes, {
      'AI response received': (r) => r.status === 200,
      'AI response valid': (r) => r.json('message') !== undefined,
    })
    errorRate.add(aiRes.status !== 200)
    
    sleep(1)
    
    // Scenario 5: Profile access
    const profileRes = http.get(`${BASE_URL}/api/profile`, { headers })
    check(profileRes, {
      'Profile loaded': (r) => r.status === 200,
    })
    
    // Scenario 6: Update progress
    const progressRes = http.post(`${BASE_URL}/api/lessons/progress`, JSON.stringify({
      lessonId: 'intro-to-html',
      progress: 50,
      completed: false,
    }), { headers })
    
    check(progressRes, {
      'Progress updated': (r) => r.status === 200,
    })
  }
  
  sleep(Math.random() * 3 + 1) // Random think time between 1-4 seconds
}

export function teardown(data) {
  // Clean up test data if needed
  console.log('Cleaning up load test data...')
}