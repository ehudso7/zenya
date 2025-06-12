#!/usr/bin/env tsx
/**
 * Database Performance Testing Script for Zenya AI
 * Tests query performance, indexes, and optimization strategies
 */

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

// Admin client for testing
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface PerformanceResult {
  queryName: string
  executionTime: number
  rowCount: number
  status: 'fast' | 'acceptable' | 'slow' | 'critical'
  details?: any
}

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  fast: 50,
  acceptable: 200,
  slow: 500
}

// Utility functions
function getPerformanceStatus(time: number): 'fast' | 'acceptable' | 'slow' | 'critical' {
  if (time <= THRESHOLDS.fast) return 'fast'
  if (time <= THRESHOLDS.acceptable) return 'acceptable'
  if (time <= THRESHOLDS.slow) return 'slow'
  return 'critical'
}

async function measureQuery<T>(
  name: string,
  query: () => Promise<{ data: T; error: any; count?: number | null }>
): Promise<PerformanceResult> {
  const startTime = performance.now()
  const { data, error, count } = await query()
  const executionTime = performance.now() - startTime
  
  if (error) {
    throw new Error(`Query failed: ${error.message}`)
  }
  
  const rowCount = count !== undefined ? count : Array.isArray(data) ? data.length : 1
  
  return {
    queryName: name,
    executionTime,
    rowCount,
    status: getPerformanceStatus(executionTime),
    details: { count }
  }
}

// Test data generation
async function generateTestData() {
  console.log('🔄 Generating test data...\n')
  
  // Create test curricula
  const curricula = []
  for (let i = 0; i < 5; i++) {
    const curriculum = {
      id: randomUUID(),
      title: `Test Curriculum ${i}`,
      slug: `test-curriculum-${i}-${Date.now()}`,
      difficulty_level: ['beginner', 'intermediate', 'advanced'][i % 3] as any,
      estimated_hours: (i + 1) * 10
    }
    curricula.push(curriculum)
  }
  
  await supabase.from('curriculums').insert(curricula)
  
  // Create test lessons
  const lessons = []
  for (const curriculum of curricula) {
    for (let j = 0; j < 20; j++) {
      lessons.push({
        id: randomUUID(),
        curriculum_id: curriculum.id,
        title: `Lesson ${j + 1}: ${['Introduction', 'Basics', 'Advanced', 'Practice', 'Review'][j % 5]}`,
        content: `This is the content for lesson ${j + 1}. It includes important concepts about programming, web development, and software engineering.`,
        order_index: j,
        duration_minutes: 15 + (j % 4) * 10,
        difficulty_level: ['easy', 'medium', 'hard'][j % 3] as any,
        xp_reward: 10 + (j % 3) * 20
      })
    }
  }
  
  await supabase.from('lessons').insert(lessons)
  
  // Create test users
  const users = []
  for (let i = 0; i < 50; i++) {
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: `perf_test_${i}_${Date.now()}@test.com`,
      password: 'TestPassword123!'
    })
    
    if (authUser?.user) {
      users.push({
        id: authUser.user.id,
        email: authUser.user.email,
        current_xp: Math.floor(Math.random() * 5000),
        streak_count: Math.floor(Math.random() * 100)
      })
    }
  }
  
  // Create user progress records
  const progressRecords = []
  for (const user of users) {
    const lessonCount = Math.floor(Math.random() * 30) + 10
    const selectedLessons = lessons.sort(() => 0.5 - Math.random()).slice(0, lessonCount)
    
    for (const lesson of selectedLessons) {
      progressRecords.push({
        user_id: user.id,
        lesson_id: lesson.id,
        curriculum_id: lesson.curriculum_id,
        status: ['not_started', 'in_progress', 'completed'][Math.floor(Math.random() * 3)] as any,
        started_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        completed_at: Math.random() > 0.5 ? new Date() : null,
        time_spent_seconds: Math.floor(Math.random() * 3600),
        xp_earned: Math.floor(Math.random() * lesson.xp_reward)
      })
    }
  }
  
  // Insert in batches to avoid timeout
  const batchSize = 100
  for (let i = 0; i < progressRecords.length; i += batchSize) {
    await supabase.from('user_progress').insert(progressRecords.slice(i, i + batchSize))
  }
  
  // Create user sessions
  const sessions = []
  for (const user of users) {
    const sessionCount = Math.floor(Math.random() * 20) + 5
    for (let i = 0; i < sessionCount; i++) {
      const lesson = lessons[Math.floor(Math.random() * lessons.length)]
      sessions.push({
        user_id: user.id,
        lesson_id: lesson.id,
        started_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        ended_at: new Date(),
        mood_start: ['happy', 'neutral', 'focused', 'tired'][Math.floor(Math.random() * 4)],
        mood_end: ['happy', 'neutral', 'focused', 'tired'][Math.floor(Math.random() * 4)],
        focus_level: Math.floor(Math.random() * 5) + 1
      })
    }
  }
  
  // Insert sessions in batches
  for (let i = 0; i < sessions.length; i += batchSize) {
    await supabase.from('user_sessions').insert(sessions.slice(i, i + batchSize))
  }
  
  console.log('✅ Test data generated successfully\n')
  
  return { curricula, lessons, users }
}

// Performance test scenarios
async function runPerformanceTests(testData: any) {
  const results: PerformanceResult[] = []
  
  console.log('🚀 Running performance tests...\n')
  
  // Test 1: Simple indexed queries
  console.log('📊 Testing indexed queries...')
  
  results.push(await measureQuery(
    'User lookup by email (indexed)',
    () => supabase
      .from('users')
      .select('*')
      .eq('email', testData.users[0].email)
      .single()
  ))
  
  results.push(await measureQuery(
    'User progress by user_id (indexed)',
    () => supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', testData.users[0].id)
      .order('updated_at', { ascending: false })
  ))
  
  results.push(await measureQuery(
    'Lessons by curriculum (indexed)',
    () => supabase
      .from('lessons')
      .select('*')
      .eq('curriculum_id', testData.curricula[0].id)
      .order('order_index')
  ))
  
  // Test 2: Complex joins
  console.log('\n📊 Testing complex joins...')
  
  results.push(await measureQuery(
    'User progress with lesson and curriculum data',
    () => supabase
      .from('user_progress')
      .select(`
        *,
        lesson:lessons (
          title,
          xp_reward,
          difficulty_level,
          curriculum:curriculums (
            title,
            difficulty_level
          )
        )
      `)
      .eq('user_id', testData.users[0].id)
      .limit(20)
  ))
  
  results.push(await measureQuery(
    'User sessions with full context',
    () => supabase
      .from('user_sessions')
      .select(`
        *,
        user:users (
          email,
          current_xp,
          streak_count
        ),
        lesson:lessons (
          title,
          duration_minutes,
          curriculum_id
        )
      `)
      .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('started_at', { ascending: false })
      .limit(50)
  ))
  
  // Test 3: Aggregation queries
  console.log('\n📊 Testing aggregation queries...')
  
  results.push(await measureQuery(
    'Count total lessons per curriculum',
    () => supabase
      .from('lessons')
      .select('curriculum_id', { count: 'exact' })
      .eq('is_active', true)
  ))
  
  results.push(await measureQuery(
    'User progress statistics',
    () => supabase
      .from('user_progress')
      .select('status', { count: 'exact' })
      .eq('user_id', testData.users[0].id)
  ))
  
  // Test 4: Full-text search
  console.log('\n📊 Testing full-text search...')
  
  results.push(await measureQuery(
    'Full-text search on lessons',
    () => supabase
      .from('lessons')
      .select('*')
      .textSearch('search_vector', 'programming development')
      .limit(20)
  ))
  
  // Test 5: Pagination performance
  console.log('\n📊 Testing pagination...')
  
  const pageSize = 20
  for (let page = 0; page < 3; page++) {
    results.push(await measureQuery(
      `Paginated user progress (page ${page + 1})`,
      () => supabase
        .from('user_progress')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)
    ))
  }
  
  // Test 6: Materialized view performance
  console.log('\n📊 Testing materialized views...')
  
  results.push(await measureQuery(
    'User learning stats (materialized view)',
    () => supabase
      .from('user_learning_stats')
      .select('*')
      .order('total_xp_earned', { ascending: false })
      .limit(10)
  ))
  
  results.push(await measureQuery(
    'Lesson analytics (materialized view)',
    () => supabase
      .from('lesson_analytics')
      .select('*')
      .order('completion_rate', { ascending: false })
      .limit(10)
  ))
  
  // Test 7: Concurrent query performance
  console.log('\n📊 Testing concurrent queries...')
  
  const concurrentQueries = 10
  const startTime = performance.now()
  
  const concurrentResults = await Promise.all(
    Array.from({ length: concurrentQueries }, (_, i) =>
      supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', testData.users[i % testData.users.length].id)
        .limit(10)
    )
  )
  
  const concurrentTime = performance.now() - startTime
  results.push({
    queryName: `${concurrentQueries} concurrent queries`,
    executionTime: concurrentTime,
    rowCount: concurrentResults.reduce((sum, r) => sum + (r.data?.length || 0), 0),
    status: getPerformanceStatus(concurrentTime / concurrentQueries)
  })
  
  return results
}

// Analyze and report results
function generateReport(results: PerformanceResult[]) {
  console.log('\n📈 Performance Test Report\n')
  console.log('=' .repeat(80))
  
  // Summary statistics
  const totalQueries = results.length
  const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / totalQueries
  const fastQueries = results.filter(r => r.status === 'fast').length
  const acceptableQueries = results.filter(r => r.status === 'acceptable').length
  const slowQueries = results.filter(r => r.status === 'slow').length
  const criticalQueries = results.filter(r => r.status === 'critical').length
  
  console.log('📊 Summary Statistics:')
  console.log(`Total queries tested: ${totalQueries}`)
  console.log(`Average execution time: ${avgTime.toFixed(2)}ms`)
  console.log(`\n🚀 Fast (<${THRESHOLDS.fast}ms): ${fastQueries} (${(fastQueries/totalQueries*100).toFixed(1)}%)`)
  console.log(`✅ Acceptable (<${THRESHOLDS.acceptable}ms): ${acceptableQueries} (${(acceptableQueries/totalQueries*100).toFixed(1)}%)`)
  console.log(`⚠️  Slow (<${THRESHOLDS.slow}ms): ${slowQueries} (${(slowQueries/totalQueries*100).toFixed(1)}%)`)
  console.log(`🚨 Critical (>${THRESHOLDS.slow}ms): ${criticalQueries} (${(criticalQueries/totalQueries*100).toFixed(1)}%)`)
  
  // Detailed results
  console.log('\n📋 Detailed Results:\n')
  console.log('Query Name'.padEnd(50) + 'Time (ms)'.padEnd(12) + 'Rows'.padEnd(10) + 'Status')
  console.log('-'.repeat(80))
  
  for (const result of results.sort((a, b) => b.executionTime - a.executionTime)) {
    const statusIcon = {
      fast: '🚀',
      acceptable: '✅',
      slow: '⚠️ ',
      critical: '🚨'
    }[result.status]
    
    console.log(
      result.queryName.padEnd(50) +
      result.executionTime.toFixed(2).padEnd(12) +
      result.rowCount.toString().padEnd(10) +
      `${statusIcon} ${result.status}`
    )
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:\n')
  
  if (criticalQueries > 0) {
    console.log('🚨 CRITICAL: You have queries taking over 500ms. These need immediate attention:')
    results
      .filter(r => r.status === 'critical')
      .forEach(r => console.log(`   - ${r.queryName} (${r.executionTime.toFixed(2)}ms)`))
  }
  
  if (slowQueries > 0) {
    console.log('\n⚠️  WARNING: Some queries are slower than optimal:')
    results
      .filter(r => r.status === 'slow')
      .forEach(r => console.log(`   - ${r.queryName} (${r.executionTime.toFixed(2)}ms)`))
  }
  
  console.log('\n📌 General Recommendations:')
  console.log('1. Review slow queries and ensure proper indexes are in place')
  console.log('2. Consider query optimization for complex joins')
  console.log('3. Monitor query patterns in production')
  console.log('4. Set up alerts for queries exceeding thresholds')
  console.log('5. Regularly refresh materialized views')
  console.log('6. Consider implementing query result caching for frequently accessed data')
  
  // Index recommendations based on query patterns
  console.log('\n🔍 Index Optimization Suggestions:')
  
  const indexSuggestions = [
    'CREATE INDEX CONCURRENTLY idx_user_sessions_user_started ON user_sessions(user_id, started_at DESC);',
    'CREATE INDEX CONCURRENTLY idx_user_progress_composite ON user_progress(user_id, status, updated_at DESC);',
    'CREATE INDEX CONCURRENTLY idx_lessons_search_active ON lessons(is_active) WHERE is_active = true;'
  ]
  
  indexSuggestions.forEach(suggestion => console.log(`   ${suggestion}`))
}

// Cleanup test data
async function cleanupTestData(testData: any) {
  console.log('\n🧹 Cleaning up test data...')
  
  try {
    // Delete test data in reverse order of dependencies
    await supabase.from('user_sessions').delete().in('user_id', testData.users.map((u: any) => u.id))
    await supabase.from('user_achievements').delete().in('user_id', testData.users.map((u: any) => u.id))
    await supabase.from('user_progress').delete().in('user_id', testData.users.map((u: any) => u.id))
    await supabase.from('user_preferences').delete().in('user_id', testData.users.map((u: any) => u.id))
    
    // Delete test users
    for (const user of testData.users) {
      await supabase.auth.admin.deleteUser(user.id)
    }
    
    // Delete test lessons and curricula
    await supabase.from('lessons').delete().in('curriculum_id', testData.curricula.map((c: any) => c.id))
    await supabase.from('curriculums').delete().in('id', testData.curricula.map((c: any) => c.id))
    
    console.log('✅ Cleanup completed successfully')
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

// Main execution
async function main() {
  console.log('🎯 Zenya AI - Database Performance Testing\n')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables')
    process.exit(1)
  }
  
  let testData: any
  
  try {
    // Generate test data
    testData = await generateTestData()
    
    // Run performance tests
    const results = await runPerformanceTests(testData)
    
    // Generate report
    generateReport(results)
    
    // Refresh materialized views for accurate testing
    console.log('\n🔄 Refreshing materialized views...')
    await supabase.rpc('refresh_analytics_views')
    console.log('✅ Materialized views refreshed')
    
  } catch (error) {
    console.error('❌ Test execution failed:', error)
  } finally {
    // Always cleanup
    if (testData) {
      await cleanupTestData(testData)
    }
  }
}

// Execute the tests
main().catch(console.error)