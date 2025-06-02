# Email Setup Guide for Zenya

## Current Issue
Confirmation emails are not being delivered to users when they sign up.

## Root Causes & Solutions

### 1. **Supabase Free Tier Limitations**
- **Rate Limit**: Only 3 emails per hour on free tier
- **Solution**: Wait 1 hour between tests or upgrade Supabase plan

### 2. **Email Configuration in Supabase**

#### Option A: Disable Email Confirmation (Quick Fix for Development)
1. Go to: https://supabase.com/dashboard/project/jwpkineggslezrvtikpf/auth/settings
2. Navigate to Authentication → Settings
3. Under "Email Auth", toggle OFF "Enable email confirmations"
4. Click "Save"

Users will be able to sign in immediately after signup without email confirmation.

#### Option B: Configure Custom SMTP (Recommended for Production)

##### Using SendGrid (Recommended)
1. Sign up for SendGrid: https://sendgrid.com
2. Create an API key in SendGrid dashboard
3. In Supabase Dashboard → Authentication → Settings → SMTP Settings:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   Sender Email: noreply@zenyaai.com
   Sender Name: Zenya AI
   ```

##### Using Gmail (For Testing)
1. Enable 2FA on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. In Supabase SMTP Settings:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-email@gmail.com
   Password: [Your App Password]
   Sender Email: your-email@gmail.com
   Sender Name: Zenya AI
   ```

##### Using AWS SES
1. Set up SES in AWS Console
2. Verify your domain
3. In Supabase SMTP Settings:
   ```
   Host: email-smtp.[region].amazonaws.com
   Port: 587
   Username: [Your AWS SMTP Username]
   Password: [Your AWS SMTP Password]
   Sender Email: noreply@zenyaai.com
   Sender Name: Zenya AI
   ```

### 3. **Email Template Configuration**
1. Go to: Authentication → Email Templates
2. Ensure "Confirm signup" template is enabled
3. Customize the template if needed:
   ```html
   <h2>Welcome to Zenya AI!</h2>
   <p>Please confirm your email to start learning:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
   ```

### 4. **Debugging Email Issues**

#### Check Supabase Logs
1. Go to: https://supabase.com/dashboard/project/jwpkineggslezrvtikpf/logs/auth
2. Look for:
   - `signup` events
   - `email_sent` status
   - Any error messages

#### Common Issues & Fixes
- **Emails in Spam**: Add SPF/DKIM records for your domain
- **Rate Limit Hit**: Wait 1 hour or use custom SMTP
- **Invalid Email**: Check for typos in email address
- **Expired Links**: Confirmation links expire after 24 hours

### 5. **Testing Email Delivery**

#### Test Checklist:
1. ✅ Check spam/junk folder
2. ✅ Try different email providers (Gmail, Outlook, etc.)
3. ✅ Check Supabase auth logs for errors
4. ✅ Verify SMTP settings if using custom provider
5. ✅ Use the "Resend email" button (now added to the app)

### 6. **Production Setup Checklist**

1. **Set up Custom SMTP Provider**
   - SendGrid, Mailgun, or AWS SES
   - Verify sender domain

2. **Configure DNS Records**
   - Add SPF record: `v=spf1 include:sendgrid.net ~all`
   - Add DKIM records from your provider
   - Add DMARC record for security

3. **Update Email Templates**
   - Add your branding
   - Include clear CTAs
   - Test on multiple email clients

4. **Monitor Email Delivery**
   - Set up webhook for bounces/complaints
   - Monitor delivery rates
   - Track open/click rates

## Immediate Actions

### For Development:
```bash
# Option 1: Disable email confirmation in Supabase Dashboard
# OR
# Option 2: Use the resend button and wait between tests
```

### For Production:
```bash
# 1. Sign up for SendGrid
# 2. Configure SMTP in Supabase
# 3. Add to Vercel environment variables:
SMTP_FROM=noreply@zenyaai.com
```

## Code Updates Made

1. **Added Resend Email Feature**
   - Users can now resend confirmation emails
   - Shows which email the confirmation was sent to
   - Handles rate limiting errors gracefully

2. **Improved Error Messages**
   - Clear instructions to check spam folder
   - Shows email address for verification
   - Rate limit warnings

## Environment Variables to Add

```env
# Email Configuration (optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@zenyaai.com
SMTP_FROM_NAME=Zenya AI
```

## Support Resources

- Supabase Email Docs: https://supabase.com/docs/guides/auth/auth-email
- SendGrid Setup: https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs
- Troubleshooting: https://supabase.com/docs/guides/auth/debugging