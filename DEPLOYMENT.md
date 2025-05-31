# Zenya Deployment Guide

This guide walks you through deploying Zenya to production using Vercel and Supabase.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase account (free tier works)
- OpenAI API key with credits

## Step 1: Prepare Your Repository

1. Initialize git and push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit: Zenya MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zenya.git
git push -u origin main
```

## Step 2: Set Up Supabase

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema**:
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/schema.sql`
   - Run the SQL commands

3. **Seed the lessons** (optional but recommended):
   - Copy the contents of `supabase/seed.sql`
   - Run in SQL Editor

4. **Configure Authentication**:
   - Go to Authentication → Settings
   - Enable Email provider
   - Set up your site URL and redirect URLs:
     ```
     Site URL: https://your-app.vercel.app
     Redirect URLs: 
     - https://your-app.vercel.app/auth/callback
     - http://localhost:3000/auth/callback (for development)
     ```

5. **Get your API keys**:
   - Go to Settings → API
   - Copy your Project URL and anon public key

## Step 3: Deploy to Vercel

1. **Import your repository** at [vercel.com/new](https://vercel.com/new)

2. **Configure environment variables** in Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

3. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

## Step 4: Post-Deployment Setup

### Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain (e.g., zenya.app)
3. Follow DNS configuration instructions

### Set Up Analytics (Optional)

1. **Vercel Analytics**:
   - Enable in your Vercel project settings
   - Free for hobby projects

2. **Google Analytics**:
   - Add GA ID to environment variables
   - Update layout.tsx with GA script

### Enable Error Monitoring (Recommended)

1. Sign up for [Sentry](https://sentry.io) (free tier available)
2. Create a new project for Zenya
3. Add Sentry DSN to environment variables
4. Install Sentry package:
   ```bash
   npm install @sentry/nextjs
   ```

### Security Headers

Add to `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

## Production Checklist

Before going live:

- [ ] Test all features in production
- [ ] Verify email authentication works
- [ ] Test AI responses with real API key
- [ ] Check mobile responsiveness
- [ ] Verify privacy policy and terms are accessible
- [ ] Test error states and edge cases
- [ ] Monitor initial API usage and costs
- [ ] Set up API rate limiting if needed
- [ ] Configure CORS if using custom domain
- [ ] Test with screen readers for accessibility

## Monitoring and Maintenance

### Daily Checks
- Monitor Vercel dashboard for errors
- Check Supabase dashboard for usage
- Monitor OpenAI API usage and costs

### Weekly Tasks
- Review user feedback
- Check error logs
- Update dependencies if needed
- Backup Supabase data

### Cost Management

**Free Tier Limits**:
- Vercel: 100GB bandwidth/month
- Supabase: 500MB database, 2GB bandwidth
- OpenAI: Pay-as-you-go (set usage limits)

**Cost Optimization**:
1. Cache AI responses when possible
2. Use GPT-3.5-turbo for non-critical responses
3. Implement request throttling
4. Monitor and optimize database queries

## Troubleshooting

### Common Issues

**Build Failures**:
- Check environment variables are set correctly
- Verify all dependencies are installed
- Check for TypeScript errors

**Authentication Issues**:
- Verify Supabase URLs in environment variables
- Check redirect URLs in Supabase settings
- Ensure cookies are enabled

**AI Response Errors**:
- Check OpenAI API key is valid
- Monitor API rate limits
- Verify error handling is working

**Database Connection Issues**:
- Check Supabase status page
- Verify connection pooling settings
- Check RLS policies are correct

## Rollback Plan

If issues arise:

1. **Immediate**: Revert to previous deployment in Vercel
2. **Database**: Supabase keeps automatic backups
3. **Code**: Use git to revert to previous commit

## Support

- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Supabase Support: [supabase.com/support](https://supabase.com/support)
- OpenAI Support: [help.openai.com](https://help.openai.com)

---

Remember to celebrate your launch! 🎉 You've built something amazing for the neurodiverse community.