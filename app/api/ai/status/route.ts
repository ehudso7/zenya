import { NextRequest, NextResponse } from 'next/server'
import { getProviderStats } from '@/lib/ai/provider-manager'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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
    const stats = getProviderStats()
    
    return NextResponse.json({
      providers: stats,
      strategy: {
        description: 'Smart load balancing active',
        freeUsageTarget: '70% when available',
        premiumUsageTarget: '30% for complex queries',
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get provider status' },
      { status: 500 }
    )
  }
}