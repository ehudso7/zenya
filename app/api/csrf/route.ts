import { NextResponse } from 'next/server'
import { setCSRFToken } from '@/lib/security/csrf'

export async function GET() {
  try {
    const _token = await setCSRFToken()
    
    return NextResponse.json({ 
      success: true,
      message: 'CSRF token set'
    })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to set CSRF token' },
      { status: 500 }
    )
  }
}