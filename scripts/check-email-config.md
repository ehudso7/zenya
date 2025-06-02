# Email Configuration Troubleshooting Guide

## Why Emails Aren't Being Sent

There are several reasons why confirmation emails might not be sent:

### 1. **Supabase Email Settings** (Most Common)

By default, Supabase uses a built-in email service with limitations:
- **Rate Limited**: Only 3 emails per hour for free tier
- **Domain Restrictions**: Some email providers block Supabase's default sender

### 2. **Check Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/jwpkineggslezrvtikpf/auth/settings
2. Check the following sections:

#### Email Templates
- Navigate to Authentication → Email Templates
- Ensure "Confirm signup" template is enabled
- Check if the template content is correct

#### SMTP Settings
- Navigate to Authentication → Settings → SMTP Settings
- By default, it uses Supabase's email service

### 3. **Solutions**

#### Option A: Use Custom SMTP (Recommended for Production)

1. Set up a custom SMTP provider (SendGrid, Mailgun, AWS SES, etc.)
2. In Supabase Dashboard → Authentication → Settings → SMTP Settings:
   ```
   Host: smtp.sendgrid.net (or your provider)
   Port: 587
   Username: apikey (for SendGrid) or your username
   Password: Your API key or password
   Sender Email: noreply@zenyaai.com
   Sender Name: Zenya AI
   ```

#### Option B: Disable Email Confirmation (Development Only)

1. Go to Authentication → Settings
2. Under "Email Auth", toggle OFF "Enable email confirmations"
3. Save changes

#### Option C: Use Supabase Email Service (Limited)

If using the default service:
- Wait 1 hour between testing (3 email limit)
- Check spam/junk folders
- Try different email providers (Gmail, Outlook)

### 4. **Test Email Delivery**

You can test if emails are being sent by checking:

1. **Supabase Logs**:
   - Go to: https://supabase.com/dashboard/project/jwpkineggslezrvtikpf/logs/auth
   - Look for email send attempts and errors

2. **Auth Logs**:
   - Check for signup events
   - Look for email_sent status

### 5. **Common Email Issues**

- **Spam Filters**: Check spam/junk folders
- **Email Provider Blocks**: Some providers block automated emails
- **Rate Limiting**: Free tier limited to 3 emails/hour
- **Invalid Email**: Typos in email address
- **Confirmation Link Expiry**: Links expire after 24 hours

## Immediate Actions

### For Development:
1. **Disable email confirmation** temporarily
2. Or wait 1 hour between tests (rate limit)

### For Production:
1. **Set up custom SMTP** with SendGrid or similar
2. Configure proper sender domain (SPF/DKIM records)
3. Use a verified sender email address

## Code to Add Email Resend Feature

Add this to your signin-password page:

```typescript
const resendConfirmationEmail = async (email: string) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })
    
    if (error) throw error
    
    toast.success('Confirmation email resent! Check your inbox.')
  } catch (error: any) {
    toast.error('Failed to resend email. Please try again later.')
  }
}
```

## Environment Variables for Custom SMTP

Add to `.env.local` and Vercel:
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@zenyaai.com
```