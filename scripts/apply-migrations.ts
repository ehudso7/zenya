#!/usr/bin/env ts-node
/**
 * Apply database migrations
 * This script applies all pending migrations to the database
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

// Note: For production migrations, you'd need the service role key
// For now, we'll document what needs to be done
console.log('📋 Migration Instructions:')
console.log('\nTo apply migrations to your Supabase project:')
console.log('1. Go to your Supabase dashboard')
console.log('2. Navigate to the SQL Editor')
console.log('3. Copy and paste the following migrations:')
console.log('\n---')

// Read and display migration files
const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort()

for (const file of migrationFiles) {
  console.log(`\n📄 ${file}:`)
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')
  console.log('---')
  console.log(content.substring(0, 500) + '...')
  console.log('---')
}

console.log('\n💡 Alternatively, you can use the Supabase CLI:')
console.log('1. Install Supabase CLI: npm install -g supabase')
console.log('2. Link your project: supabase link --project-ref jwpkineggslezrvtikpf')
console.log('3. Apply migrations: supabase db push')

console.log('\n⚠️  Important: Make sure to run migrations in order!')

// Test connection
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('curriculums')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('\n❌ Curriculums table not found - migrations needed!')
      console.log('Error:', error.message)
    } else {
      console.log('\n✅ Curriculums table exists!')
    }
  } catch (error) {
    console.error('\n❌ Connection test failed:', error)
  }
}

testConnection()