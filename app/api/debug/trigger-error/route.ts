import { NextResponse } from 'next/server'

export async function GET() {
  // Intentionally throw an error for testing
  console.error('[TEST] Triggering intentional 500 error')
  
  return NextResponse.json(
    { 
      error: 'Test error - This is an intentional 500 error for debugging',
      timestamp: new Date().toISOString()
    },
    { status: 500 }
  )
}