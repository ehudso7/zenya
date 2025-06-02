#!/bin/bash

# Script to fix hardcoded demo password in the codebase
# This should be run after the main cleanup script

set -e

echo "🔐 Fixing hardcoded demo password..."
echo ""

# Update the demo route to use environment variable
cat > app/auth/demo/route.ts << 'EOF'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Use environment variables for demo credentials
    const demoEmail = process.env.DEMO_USER_EMAIL || 'demo@zenyaai.com'
    const demoPassword = process.env.DEMO_USER_PASSWORD
    
    if (!demoPassword) {
      console.error('Demo password not configured. Set DEMO_USER_PASSWORD in environment.')
      return NextResponse.redirect(new URL('/auth?error=demo-not-configured', process.env.NEXT_PUBLIC_APP_URL!))
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    })

    if (error) {
      // If demo user doesn't exist, create it
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          data: {
            name: 'Demo User',
          },
        },
      })

      if (signUpError) {
        return NextResponse.redirect(new URL('/auth?error=demo-failed', process.env.NEXT_PUBLIC_APP_URL!))
      }

      // Sign in the newly created demo user
      const { data: newSignIn, error: newSignInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (newSignInError) {
        return NextResponse.redirect(new URL('/auth?error=demo-failed', process.env.NEXT_PUBLIC_APP_URL!))
      }
    }

    // Redirect to home page after successful demo login
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL!))
  } catch (error) {
    // Log error for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('Demo login error:', error)
    }
    return NextResponse.redirect(new URL('/auth?error=demo-failed', process.env.NEXT_PUBLIC_APP_URL!))
  }
}
EOF

echo "✅ Updated app/auth/demo/route.ts to use environment variables"
echo ""

# Check if .env.example needs updating
if ! grep -q "DEMO_USER_PASSWORD" .env.example 2>/dev/null; then
    echo "📝 Updating .env.example..."
    # Add demo credentials to .env.example if not present
    echo "" >> .env.example
    echo "# Demo User (Optional - for demo login)" >> .env.example
    echo "DEMO_USER_EMAIL=demo@zenyaai.com" >> .env.example
    echo "DEMO_USER_PASSWORD=your-secure-demo-password" >> .env.example
fi

echo ""
echo "🎯 Next steps:"
echo "1. Add DEMO_USER_PASSWORD to your .env.local file"
echo "2. Add DEMO_USER_PASSWORD to your Vercel environment variables"
echo "3. Change the demo password from 'demo-password-2025' to something secure"
echo ""
echo "✅ Demo password fix complete!"