# Sentry Setup for Zenya

## Manual Environment Variable Setup

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

### Required Variables:

1. **NEXT_PUBLIC_SENTRY_DSN**
   - Get from: Sentry → Settings → Projects → zenya → Client Keys (DSN)
   - Example: `https://abc123@o123456.ingest.sentry.io/123456`

2. **SENTRY_ORG**
   - Value: `nsai-emagine-qu`

3. **SENTRY_PROJECT**
   - Value: `zenya`

4. **SENTRY_AUTH_TOKEN** (Optional - for source maps)
   - Get from: Sentry → Settings → Account → API → Auth Tokens
   - Create new token with scopes: `project:releases`, `org:read`

## Verification Steps:

1. Deploy your project after adding variables
2. Visit `/sentry-example-page` on your live site
3. Click "Trigger Test Error"
4. Check Sentry dashboard for the error

## Troubleshooting:

- If errors aren't appearing, check browser console for Sentry initialization
- Ensure DSN is correctly formatted
- Verify environment variables are set for all environments (Production, Preview, Development)