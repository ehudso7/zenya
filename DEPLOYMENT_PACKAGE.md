# 📦 ZENYA AI - DEPLOYMENT PACKAGE

## Quick Start Deployment Guide

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Vercel CLI (`npm i -g vercel`)
- Supabase account
- Required API keys

### Environment Variables Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
COHERE_API_KEY=
HUGGINGFACE_API_KEY=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
NEXT_PUBLIC_DATADOG_APPLICATION_ID=
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=

# Redis/Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email
RESEND_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_MIXPANEL_TOKEN=
```

### Deployment Steps

#### 1. Clone and Install
```bash
git clone https://github.com/ehudso7/zenya.git
cd zenya
npm install
```

#### 2. Fix Critical Issues
```bash
# Security vulnerabilities
npm audit fix --force
npm update

# Create environment file
cp .env.example .env.local
# Edit .env.local with your values
```

#### 3. Database Setup
```bash
# Run migrations
npm run supabase:migrate

# Enable RLS policies
npm run supabase:policies
```

#### 4. Build and Test
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

#### 5. Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# ... repeat for all env vars
```

#### 6. Post-Deployment
```bash
# Verify deployment
curl https://your-app.vercel.app/api/health

# Run security scan
npm run security:scan

# Monitor logs
vercel logs --follow
```

### External Services Setup

#### Supabase
1. Create new project
2. Run migrations from `supabase/migrations/`
3. Enable Row Level Security
4. Configure Auth providers

#### Upstash Redis
1. Create Redis database
2. Copy REST URL and token
3. Configure rate limit tiers

#### WebSocket Service (for collaboration)
Since Vercel doesn't support WebSockets:
1. Set up Pusher or Ably account
2. Update collaboration component
3. Configure channels and auth

### Monitoring Setup

#### Sentry
1. Create new project
2. Install Sentry CLI
3. Upload source maps on deploy

#### DataDog
1. Create RUM application
2. Configure alerts
3. Set up dashboards

### Production Checklist
- [ ] All environment variables set
- [ ] Database migrations complete
- [ ] RLS policies enabled
- [ ] Monitoring configured
- [ ] Rate limiting active
- [ ] SSL certificates valid
- [ ] DNS configured
- [ ] CDN enabled
- [ ] Backup strategy implemented
- [ ] Rollback plan documented

### Support Resources
- Documentation: `/docs/`
- Architecture: `/docs/architecture.md`
- API Reference: `/docs/api.md`
- Troubleshooting: `/docs/troubleshooting.md`

### Emergency Contacts
- On-call Engineer: [Your contact]
- Database Admin: [DBA contact]
- Security Team: [Security contact]

---

Deploy with confidence! 🚀