# Production Deployment Instructions

**Last Updated**: January 6, 2025  
**Version**: 1.0.0  
**Time to Deploy**: ~30 minutes

---

## Prerequisites

- Node.js 18+ installed locally
- Git configured with repository access
- Vercel account (free tier works)
- Supabase project created
- Domain name (zenyaai.com) with DNS access

---

## Step 1: Pull Latest Code

```bash
# Clone repository if not already done
git clone https://github.com/ehudso7/zenya.git
cd zenya

# Or pull latest changes
git pull origin main

# Install dependencies
npm install
```

---

## Step 2: Environment Variables Setup

### 2.1 Create `.env.local` for Local Development

```bash
cp .env.example .env.local
```

### 2.2 Required Environment Variables

Add these to `.env.local` locally and Vercel dashboard for production:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Providers (At least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Application
NEXT_PUBLIC_APP_URL=https://zenyaai.com
NEXT_PUBLIC_APP_VERSION=1.0.0

# Demo Account (Required for demo login)
DEMO_EMAIL=demo@zenyaai.com
DEMO_PASSWORD=demo123456

# Sentry (Required - already configured)
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...

# Optional but Recommended
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
RATE_LIMIT_ENABLED=true

# Optional Monitoring
NEXT_PUBLIC_DATADOG_APPLICATION_ID=...
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=...
DD_AGENT_HOST=...

# Optional Feature Flags
NEXT_PUBLIC_UNLEASH_URL=...
NEXT_PUBLIC_UNLEASH_CLIENT_KEY=...
```

---

## Step 3: Database Setup

### 3.1 Run Migrations in Supabase

1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file in order:

```sql
-- Run these in order:
-- 1. /supabase/schema.sql (base schema)
-- 2. /supabase/migrations/002_user_profiles.sql
-- 3. /supabase/migrations/003_learning_system.sql
-- 4. /supabase/migrations/004_audit_logs.sql
```

### 3.2 Seed Demo Data

```sql
-- Run seed files:
-- 1. /supabase/seed.sql (demo user)
-- 2. /supabase/seed_learning.sql (curricula and lessons)
```

### 3.3 Enable Row Level Security

Verify RLS is enabled on all tables:
- `user_profiles`
- `user_progress`
- `user_achievements`
- `audit.audit_logs`

---

## Step 4: Local Testing

### 4.1 Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and verify:
- Landing page loads
- Can sign in with demo account
- AI chat works in lessons
- Profile updates save

### 4.2 Run Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm run test

# E2E tests (optional, requires Playwright)
npx playwright install # First time only
npm run test:e2e
```

---

## Step 5: Deploy to Vercel

### 5.1 Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select GitHub repository: `ehudso7/zenya`
4. Choose "Next.js" as framework

### 5.2 Configure Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 5.3 Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

1. Add all variables from Step 2.2
2. Set appropriate environments:
   - Production only: `NEXT_PUBLIC_APP_URL`
   - All environments: Everything else

### 5.4 Deploy

Click "Deploy" and wait ~3-5 minutes for initial deployment.

---

## Step 6: Domain Configuration

### 6.1 Add Custom Domain in Vercel

1. Go to Project Settings → Domains
2. Add `zenyaai.com` and `www.zenyaai.com`
3. Follow DNS configuration instructions

### 6.2 Update DNS Records

Add these records to your DNS provider:

```
A     @      76.76.21.21
CNAME www    cname.vercel-dns.com
```

### 6.3 SSL Certificate

Vercel automatically provisions SSL certificates. Wait 10-30 minutes for propagation.

---

## Step 7: Post-Deployment Verification

### 7.1 Production Checks

Visit https://zenyaai.com and verify:

- [ ] Landing page loads with HTTPS
- [ ] Demo account login works
- [ ] AI chat responds in lessons
- [ ] Profile can be updated
- [ ] Mobile responsive design works
- [ ] PWA installation prompt appears

### 7.2 Security Verification

```bash
# Check security headers
curl -I https://zenyaai.com

# Should see:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Content-Security-Policy: ...
```

### 7.3 Performance Check

1. Run Lighthouse audit in Chrome DevTools
2. Verify scores:
   - Performance: >90
   - Accessibility: >95
   - Best Practices: >90
   - SEO: >90

---

## Step 8: Optional Services Setup

### 8.1 Redis for Rate Limiting

1. Create account at [upstash.com](https://upstash.com)
2. Create new Redis database
3. Copy REST URL and token to environment variables
4. Redeploy

### 8.2 Monitoring with Datadog

1. Create account at [datadoghq.com](https://datadoghq.com)
2. Create new RUM application
3. Add client token and app ID to environment
4. View metrics in Datadog dashboard

### 8.3 Feature Flags with Unleash

1. Use [Unleash Cloud](https://www.getunleash.io) or self-host
2. Create feature flags matching `/lib/feature-flags/unleash.ts`
3. Add API URL and client key to environment
4. Toggle features from Unleash dashboard

---

## Step 9: Monitoring & Maintenance

### 9.1 Set Up Alerts

In Vercel Dashboard → Settings → Notifications:
- Enable deployment notifications
- Set up error rate alerts
- Configure performance alerts

### 9.2 Regular Maintenance

Weekly:
- Review Sentry errors
- Check Vercel Analytics
- Monitor API usage

Monthly:
- Update dependencies: `npm update`
- Review security alerts
- Audit user feedback

### 9.3 Backup Strategy

Supabase automatically backs up your database daily. For additional safety:
- Export production data monthly
- Store API keys in password manager
- Document any configuration changes

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### API Not Working

1. Verify environment variables in Vercel
2. Check API keys are valid
3. Look at Function logs in Vercel dashboard

### Database Connection Issues

1. Check Supabase service is running
2. Verify service role key is correct
3. Ensure RLS policies allow access

### Domain Not Working

1. Wait 24-48 hours for DNS propagation
2. Verify DNS records are correct
3. Check domain is not proxied through Cloudflare initially

---

## Production Readiness Checklist

Before going live:

- [x] All tests passing
- [x] Environment variables configured
- [x] Database migrations run
- [x] SSL certificate active
- [x] Security headers verified
- [x] Error tracking working (Sentry)
- [x] Demo account functional
- [x] AI providers connected
- [x] Mobile responsive verified
- [x] Accessibility checked
- [x] Performance optimized
- [x] Backups configured

---

## Support

- **Technical Issues**: Check [GitHub Issues](https://github.com/ehudso7/zenya/issues)
- **Security Concerns**: See [SECURITY.md](./SECURITY.md)
- **Contributing**: See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Next Steps

1. **Monitor First Week**
   - Watch error rates
   - Monitor performance
   - Gather user feedback

2. **Optimize Based on Data**
   - Improve slow queries
   - Optimize bundle size
   - Enhance user experience

3. **Scale When Needed**
   - Upgrade Vercel plan
   - Add Redis caching
   - Implement CDN

---

**Deployment Complete! 🎉**

Your AI-powered learning platform is now live at https://zenyaai.com