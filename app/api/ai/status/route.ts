import { NextResponse } from 'next/server'
import { getProviderStats } from '@/lib/ai/provider-manager'

export async function GET() {
  try {
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