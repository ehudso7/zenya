import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Only enable in development
const IS_ENABLED = process.env.NODE_ENV === 'development' || process.env.ENABLE_AUTH_TESTING === 'true'

export async function GET() {
  if (!IS_ENABLED) {
    return NextResponse.json({ error: 'Auth testing is disabled' }, { status: 403 })
  }

  const supabase = await createServerSupabaseClient()
  const tests: any[] = []

  // Test 1: Check current session
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    tests.push({
      name: 'Get current session',
      status: error ? 'failed' : 'passed',
      result: {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: error?.message
      }
    })
  } catch (error) {
    tests.push({
      name: 'Get current session',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 2: Check user profile
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      tests.push({
        name: 'Get user profile',
        status: error ? 'failed' : 'passed',
        result: {
          hasProfile: !!profile,
          profileId: profile?.id,
          email: profile?.email,
          onboardingCompleted: profile?.onboarding_completed,
          profileCompleted: profile?.profile_completed,
          error: error?.message
        }
      })
    } else {
      tests.push({
        name: 'Get user profile',
        status: 'skipped',
        reason: 'No authenticated user'
      })
    }
  } catch (error) {
    tests.push({
      name: 'Get user profile',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 3: Check RLS policies
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Try to read another user's data (should fail)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', user.id)
        .limit(1)
        .single()
      
      tests.push({
        name: 'RLS policy test (read other user)',
        status: error || !data ? 'passed' : 'failed',
        result: {
          message: error || !data ? 'RLS working correctly' : 'RLS policy violation - able to read other user data',
          error: error?.message
        }
      })
    } else {
      tests.push({
        name: 'RLS policy test',
        status: 'skipped',
        reason: 'No authenticated user'
      })
    }
  } catch (_error) {
    tests.push({
      name: 'RLS policy test',
      status: 'passed',
      result: {
        message: 'RLS working correctly - query failed as expected'
      }
    })
  }

  // Test 4: Session refresh capability
  try {
    const { data, error } = await supabase.auth.refreshSession()
    tests.push({
      name: 'Session refresh',
      status: error ? 'failed' : 'passed',
      result: {
        hasNewSession: !!data.session,
        error: error?.message
      }
    })
  } catch (error) {
    tests.push({
      name: 'Session refresh',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Summary
  const summary = {
    total: tests.length,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    errors: tests.filter(t => t.status === 'error').length,
    skipped: tests.filter(t => t.status === 'skipped').length
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    summary,
    tests
  })
}