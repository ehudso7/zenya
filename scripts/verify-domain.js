#!/usr/bin/env node

/**
 * Build-time domain verification script
 * Ensures the application is only built for zenyaai.com
 */

const AUTHORIZED_REPO = 'https://github.com/ehudso7/zenya'
const AUTHORIZED_DOMAIN = 'zenyaai.com'

function verifyBuildEnvironment() {
  console.log('🔒 Verifying build authorization for Zenya...')

  // Check if this is a Vercel preview deployment
  if (process.env.VERCEL && process.env.VERCEL_ENV !== 'production') {
    console.log('✅ Vercel preview deployment detected - skipping strict domain verification')
    return
  }

  // Check if this is a development build
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    console.log('✅ Development build detected - skipping domain verification')
    return
  }

  // Verify repository origin
  try {
    const { execSync } = require('child_process')
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim()
    
    if (!remoteUrl.includes('github.com/ehudso7/zenya')) {
      console.error('❌ Unauthorized repository detected!')
      console.error(`   Expected: ${AUTHORIZED_REPO}`)
      console.error(`   Found: ${remoteUrl}`)
      process.exit(1)
    }
    console.log('✅ Repository verification passed')
  } catch (_error) {
    console.warn('⚠️  Could not verify repository (may be in CI environment)')
  }

  // Verify domain configuration
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
  const vercelUrl = process.env.VERCEL_URL
  
  // Log environment info for debugging
  console.log('📍 Build environment:')
  console.log(`   VERCEL: ${process.env.VERCEL}`)
  console.log(`   VERCEL_ENV: ${process.env.VERCEL_ENV}`)
  console.log(`   NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'not set'}`)
  console.log(`   VERCEL_URL: ${vercelUrl || 'not set'}`)
  
  // Allow Vercel deployments
  if (process.env.VERCEL) {
    console.log('✅ Vercel deployment detected - allowing build')
    return
  }
  
  // For non-Vercel production builds, enforce domain
  if (appUrl && !appUrl.includes(AUTHORIZED_DOMAIN)) {
    console.error('❌ Unauthorized domain configuration detected!')
    console.error(`   NEXT_PUBLIC_APP_URL must be https://${AUTHORIZED_DOMAIN}`)
    console.error(`   Found: ${appUrl}`)
    process.exit(1)
  }

  // Verify environment variables don't point to other services
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    console.error('❌ Invalid Supabase configuration detected!')
    process.exit(1)
  }

  console.log('✅ Domain verification passed')
  console.log('🚀 Building Zenya for zenyaai.com...')
}

// Run verification
verifyBuildEnvironment()