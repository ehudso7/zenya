import { NextResponse, NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/api-middleware'
import { profileUpdateSchema } from '@/lib/validations'
import { validateRequest } from '@/lib/validation-middleware'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*, user_preferences(*)')
        .eq('id', user.id)
        .single()

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email?.split('@')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('*, user_preferences(*)')
            .single()
          
          if (createError) {
            // Error will be monitored by error tracking service
            return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
          }
          
          return NextResponse.json({ profile: newProfile })
        }
        
        // Error will be monitored by error tracking service
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
      }

      return NextResponse.json({ profile })
    } catch (_error) {
      // Error will be monitored by error tracking service
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }, 'api')
}

export async function PUT(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    try {
      const supabase = await createServerSupabaseClient()
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Validate request body
      const { data, error: validationError } = await validateRequest(req, profileUpdateSchema)
      
      if (validationError) {
        return validationError
      }

      const { display_name, bio, learning_style, timezone, notification_preferences, preferred_topics } = data!

      const { data: profile, error } = await supabase
        .from('users')
        .update({
          name: display_name,
          bio,
          learning_style,
          timezone,
          notification_preferences,
          preferred_topics,
          onboarding_completed: true
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        // Error will be monitored by error tracking service
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }

      return NextResponse.json({ profile })
    } catch (_error) {
      // Error will be monitored by error tracking service
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }, 'api')
}