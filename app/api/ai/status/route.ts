import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Provider status is now managed server-side only
    // Return a generic status response
    return NextResponse.json({
      status: 'operational',
      message: 'AI providers are configured server-side',
      strategy: {
        description: 'Smart load balancing active',
        freeUsageTarget: '70% when available',
        premiumUsageTarget: '30% for complex queries',
      }
    })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to get provider status' },
      { status: 500 }
    )
  }
}