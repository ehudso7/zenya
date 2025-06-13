import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  // Log to console to verify the endpoint is being hit
  console.log('[Debug Simple Test] GET request received')
  
  // Return a simple success response
  return NextResponse.json({ 
    message: 'Debug test endpoint working',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  console.log('[Debug Simple Test] POST request received:', body)
  
  // Return the body back
  return NextResponse.json({ 
    received: body,
    timestamp: new Date().toISOString()
  })
}