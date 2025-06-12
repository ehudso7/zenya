# 🚨 QUICK FIX: Email Not Sending

## Most Common Issue: Rate Limiting

**Supabase Free Tier = 4 emails per hour**

### Immediate Solutions:

## Option 1: Enable Email Confirmations OFF (Fastest)
1. Go to Supabase Dashboard
2. Authentication → Providers → Email
3. **Turn OFF** "Confirm email"
4. Save

Now users can sign up without email confirmation!

## Option 2: Use Password Auth Instead
```
http://localhost:3000/auth/signin-password
```
- Create account with email + password
- No email confirmation needed if you disabled it above

## Option 3: Wait 1 Hour
- If you've sent 4 emails, wait 60 minutes
- Rate limit will reset

## Option 4: Use Different Email
- Try a different email address
- Each email gets its own rate limit

## Check Email Logs
1. Supabase Dashboard → Logs → Auth Logs
2. Look for email send errors
3. Common errors:
   - "Rate limit exceeded" = Wait 1 hour
   - "Invalid email" = Check email format
   - "SMTP error" = Email service issue

## Production Solution: Custom SMTP

### Free Email Services:
1. **Resend** (easiest)
   - 100 emails/day free
   - Sign up: resend.com
   - Get API key
   - Add to Supabase SMTP settings

2. **SendGrid**
   - 100 emails/day free forever
   - Sign up: sendgrid.com
   - Create API key
   - Configure in Supabase:
     - Host: smtp.sendgrid.net
     - Port: 587
     - Username: apikey
     - Password: [your-api-key]

## Test Right Now:
1. Disable email confirmation (Option 1)
2. Sign up at: http://localhost:3000/auth/register
3. Should work immediately!

## Still Not Working?
Check browser console (F12) for errors and share them!