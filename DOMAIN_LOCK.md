# Zenya Domain Lock Configuration

## ⚠️ IMPORTANT: Domain Restrictions

This application is **LOCKED** to only run on the following domains:
- https://zenyaai.com
- https://www.zenyaai.com

## Security Measures Implemented

### 1. **Middleware Domain Verification**
- All requests are verified to come from authorized domains
- Unauthorized domains receive a 403 Forbidden response
- Located in: `/middleware.ts`

### 2. **API CORS Protection**
- APIs only accept requests from zenyaai.com origins
- Cross-origin requests from other domains are blocked
- Preflight requests are handled appropriately

### 3. **Client-Side Domain Guard**
- React component verifies domain on mount
- Shows error page if running on unauthorized domain
- Located in: `/components/domain-guard.tsx`

### 4. **Build-Time Verification**
- Script runs before build to verify domain configuration
- Checks repository origin and environment variables
- Located in: `/scripts/verify-domain.js`

### 5. **Runtime API Protection**
- All API routes verify domain before processing
- Rate limiting includes domain verification
- Located in: `/lib/api-middleware.ts`

## Authorized Environments

### Production
- Domain: zenyaai.com, www.zenyaai.com
- Repository: github.com/ehudso7/zenya

### Preview/Staging (Vercel)
- Pattern: zenya-*-ehudso7s-projects.vercel.app
- Pattern: *-ehudso7.vercel.app

### Development (Local Only)
- localhost:3000
- 127.0.0.1:3000
- 0.0.0.0:3000

## Bypassing Domain Lock (NOT RECOMMENDED)

The domain lock is integral to the application's security. Attempting to bypass it will result in:
- API requests being rejected
- Build failures in production mode
- Client-side error screens
- CORS policy violations

## Deployment Requirements

1. **Environment Variables**
   - `NEXT_PUBLIC_APP_URL` must be set to `https://zenyaai.com` in production
   - Any other value will cause build failure

2. **Repository**
   - Must be deployed from the official repository: github.com/ehudso7/zenya
   - Forks will fail domain verification

3. **Hosting**
   - Recommended: Vercel (automatic preview URL support)
   - Custom hosting must use zenyaai.com domain

## Modifying Domain Restrictions

To modify the authorized domains (requires repository access):

1. Update `/lib/domain-verification.ts` - AUTHORIZED_DOMAINS array
2. Update `/scripts/verify-domain.js` - AUTHORIZED_DOMAIN constant
3. Update this documentation file
4. Test thoroughly in development and staging

## Security Contact

For security concerns or authorized domain additions:
- Email: support@zenyaai.com
- Repository: https://github.com/ehudso7/zenya/issues

---

**Last Updated:** December 2024
**Version:** 1.0.0