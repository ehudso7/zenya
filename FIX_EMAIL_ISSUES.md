# 🚨 Fix Email Delivery Issues

## Step 1: Check Supabase Email Settings

1. **Go to your Supabase Dashboard**
   - Navigate to: Authentication → Email Templates
   - Make sure "Enable Email" is turned ON

2. **Check Email Provider Settings**
   - Go to: Project Settings → Auth
   - Scroll to "Email Settings"
   - Verify:
     - ✅ Enable email confirmations = ON
     - ✅ Enable email change confirmations = ON
     - ✅ Enable magic link sign in = ON

3. **Check SMTP Settings** (if using custom SMTP)
   - Go to: Project Settings → Auth → SMTP Settings
   - If not configured, Supabase uses their default email service
   - Default has rate limits: 4 emails per hour for free tier

## Step 2: Test Email in Supabase

1. Go to: Authentication → Users
2. Click "Invite" button
3. Enter your email
4. Check if email arrives

If this test email doesn't arrive, the issue is with Supabase configuration.

## Step 3: Common Email Issues & Solutions

### Issue: Rate Limiting (Most Common)
**Solution**: 
- Free tier limited to 4 emails/hour
- Wait an hour and try again
- Or upgrade to Pro for unlimited emails
- Or configure custom SMTP

### Issue: Email in Spam
**Solution**: 
- Check spam/junk folder
- Add noreply@mail.supabase.io to contacts

### Issue: Wrong Email Templates
**Solution**: 
1. Go to: Authentication → Email Templates
2. For each template type, paste this simple version:

**Confirm signup:**
```html
<h2>Confirm your email</h2>
<p>Follow this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email address</a></p>
```

**Magic Link:**
```html
<h2>Your magic link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .MagicLink }}">Log in to Zenya AI</a></p>
<p>This link expires in 1 hour.</p>
```

## Step 4: Configure Custom SMTP (Recommended)

For reliable email delivery, use a service like:
- SendGrid (10k emails/month free)
- Postmark (100 emails/month free)  
- Amazon SES (62k emails/month free)

### SendGrid Setup:
1. Sign up at sendgrid.com
2. Create API key
3. In Supabase: Project Settings → Auth → SMTP Settings
4. Configure:
   - Host: smtp.sendgrid.net
   - Port: 587
   - Username: apikey
   - Password: [your-sendgrid-api-key]
   - Sender email: noreply@yourdomain.com

## Step 5: Test Authentication Flow

```bash
# Check auth settings endpoint
curl -X GET "https://[YOUR-PROJECT-REF].supabase.co/auth/v1/settings" \
  -H "apikey: [YOUR-ANON-KEY]"
```

## Quick Debug Checklist

- [ ] Check Supabase Dashboard → Logs → Auth Logs for errors
- [ ] Verify email templates are saved
- [ ] Check rate limits (4/hour on free tier)
- [ ] Look in spam folder
- [ ] Try different email provider (Gmail, Outlook, etc)
- [ ] Check browser console for API errors

## If Nothing Works

1. **Use Password Auth Instead** (temporary):
   - Enable password auth in Supabase
   - Use /auth/signin-password route
   - Skip email confirmation temporarily

2. **Contact Supabase Support**:
   - They can check email delivery logs
   - support@supabase.com