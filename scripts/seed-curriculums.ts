#!/usr/bin/env ts-node
/**
 * Seed script to populate curriculums table
 * Usage: npx ts-node scripts/seed-curriculums.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const curriculums = [
  {
    title: 'Mathematics Basics',
    slug: 'math-basics',
    description: 'Master fundamental math concepts from arithmetic to algebra',
    difficulty_level: 'beginner',
    estimated_hours: 20,
    is_active: true
  },
  {
    title: 'Web Development 101',
    slug: 'web-dev-101',
    description: 'Learn HTML, CSS, and JavaScript from scratch',
    difficulty_level: 'beginner',
    estimated_hours: 40,
    is_active: true
  },
  {
    title: 'English Grammar Mastery',
    slug: 'english-grammar',
    description: 'Perfect your English grammar and writing skills',
    difficulty_level: 'intermediate',
    estimated_hours: 30,
    is_active: true
  },
  {
    title: 'Science Explorers',
    slug: 'science-explorers',
    description: 'Discover the wonders of physics, chemistry, and biology',
    difficulty_level: 'beginner',
    estimated_hours: 35,
    is_active: true
  },
  {
    title: 'History Adventures',
    slug: 'history-adventures',
    description: 'Journey through world history from ancient to modern times',
    difficulty_level: 'intermediate',
    estimated_hours: 25,
    is_active: true
  }
]

async function seedCurriculums() {
  console.log('🌱 Seeding curriculums...')
  
  try {
    // Check if curriculums already exist
    const { data: existing, error: checkError } = await supabase
      .from('curriculums')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.error('❌ Error checking existing curriculums:', JSON.stringify(checkError, null, 2))
    }
    
    if (existing && existing.length > 0) {
      console.log('⚠️  Curriculums already exist. Skipping seed.')
      return
    }
    
    // Insert curriculums
    const { data, error } = await supabase
      .from('curriculums')
      .insert(curriculums)
      .select()
    
    if (error) {
      console.error('❌ Error seeding curriculums:', JSON.stringify(error, null, 2))
      process.exit(1)
    }
    
    console.log(`✅ Successfully seeded ${data.length} curriculums`)
    
    // Add sample lessons for each curriculum
    for (const curriculum of data) {
      const lessons = [
        {
          curriculum_id: curriculum.id,
          title: `Introduction to ${curriculum.title}`,
          slug: `intro-${curriculum.slug}`,
          content: `Welcome to ${curriculum.title}! This lesson will introduce you to the fundamentals.`,
          order_index: 1,
          difficulty_level: 'easy',
          duration_minutes: 15,
          is_active: true,
          xp_reward: 10
        },
        {
          curriculum_id: curriculum.id,
          title: `Core Concepts in ${curriculum.title}`,
          slug: `core-${curriculum.slug}`,
          content: `Let's dive deeper into the core concepts of ${curriculum.title}.`,
          order_index: 2,
          difficulty_level: 'medium',
          duration_minutes: 20,
          is_active: true,
          xp_reward: 15
        },
        {
          curriculum_id: curriculum.id,
          title: `Practice Exercises`,
          slug: `practice-${curriculum.slug}`,
          content: `Time to practice what you've learned in ${curriculum.title}!`,
          order_index: 3,
          difficulty_level: 'medium',
          duration_minutes: 25,
          is_active: true,
          xp_reward: 20
        }
      ]
      
      const { error: lessonError } = await supabase
        .from('lessons')
        .insert(lessons)
      
      if (lessonError) {
        console.error(`❌ Error adding lessons for ${curriculum.title}:`, lessonError)
      } else {
        console.log(`✅ Added 3 lessons for ${curriculum.title}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the seed
seedCurriculums()
  .then(() => {
    console.log('\n🎉 Seeding complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })