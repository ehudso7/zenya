# Supabase Email Templates

Copy these templates into your Supabase Dashboard under Authentication > Email Templates.

## 1. Confirm Your Signup

```html
<h2>Welcome to Zenya AI! 🎉</h2>

<p>Thanks for joining Zenya AI! We're excited to help you unlock your learning potential with personalized AI-powered education designed for neurodiverse minds.</p>

<p>Please confirm your email address to get started:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Your Email</a></p>

<p>What's waiting for you:</p>
<ul>
  <li>🤖 AI Learning Coach - Your personal AI tutor</li>
  <li>🎯 Personalized Curriculum - Tailored to your goals</li>
  <li>🧠 Neurodiverse-Friendly Design</li>
  <li>📊 Progress Tracking & Gamification</li>
</ul>

<p>This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
```

## 2. Invite User

```html
<h2>You're Invited to Join Zenya AI! 🎊</h2>

<p>{{ .InviterEmail }} has invited you to experience the future of personalized learning with Zenya AI.</p>

<p>Click below to accept your invitation and create your account:</p>
<p><a href="{{ .InvitationURL }}">Accept Invitation</a></p>

<p>Why join Zenya AI?</p>
<ul>
  <li>🎯 Personalized AI-powered lessons</li>
  <li>🧠 Designed for neurodiverse learners</li>
  <li>🏆 Gamified learning experience</li>
</ul>

<p>This invitation expires in 7 days.</p>
```

## 3. Magic Link

```html
<h2>Your Magic Link ✨</h2>

<p>Hi {{ .Email }},</p>

<p>Click the secure link below to sign in to your Zenya AI account instantly:</p>
<p><a href="{{ .MagicLink }}">Sign In to Zenya AI</a></p>

<p>🔒 Security Notice:</p>
<ul>
  <li>This link expires in 15 minutes</li>
  <li>It can only be used once</li>
  <li>Request from: {{ .RequestIP }}</li>
</ul>

<p>Didn't request this? You can safely ignore this email.</p>
```

## 4. Change Email Address

```html
<h2>Confirm Your Email Change 📧</h2>

<p>You've requested to change your Zenya AI account email address.</p>

<p><strong>Current Email:</strong> {{ .OldEmail }}<br>
<strong>New Email:</strong> {{ .NewEmail }}</p>

<p>To complete this change, click below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email Change</a></p>

<p>⚠️ Important:</p>
<ul>
  <li>This link expires in 1 hour</li>
  <li>After confirming, sign in with your new email</li>
  <li>Your learning progress remains intact</li>
</ul>

<p>Didn't request this? Secure your account immediately.</p>
```

## 5. Reset Password

```html
<h2>Reset Your Password 🔐</h2>

<p>Hi {{ .Email }},</p>

<p>We received a request to reset your Zenya AI password. Click below to create a new password:</p>
<p><a href="{{ .ResetURL }}">Reset Password</a></p>

<p>🔒 Security Info:</p>
<ul>
  <li>Link expires in 1 hour</li>
  <li>Request from IP: {{ .RequestIP }}</li>
  <li>After resetting, you'll be signed in automatically</li>
</ul>

<p>💡 Pro tip: You can also use passwordless sign-in with magic links!</p>

<p>Didn't request this? You can safely ignore this email.</p>
```

## 6. Reauthentication

```html
<h2>Security Verification Required 🛡️</h2>

<p>Hi {{ .Email }},</p>

<p>For your security, we need to verify your identity before completing this sensitive action:</p>

<p><strong>Action:</strong> {{ .ActionDescription }}<br>
<strong>Time:</strong> {{ .RequestTime }}<br>
<strong>Device:</strong> {{ .DeviceInfo }}</p>

<p><a href="{{ .ReauthURL }}">Verify & Continue</a></p>

<p>🚨 This wasn't you? If you didn't attempt this action:</p>
<ol>
  <li>Do NOT click the link</li>
  <li>Reset your password immediately</li>
  <li>Contact security@zenyaai.com</li>
</ol>

<p>This link expires in 10 minutes.</p>
```

## Template Variables

### Common Variables:
- `{{ .Email }}` - User's email address
- `{{ .RequestIP }}` - IP address of the request
- `{{ .RequestTime }}` - Timestamp of the request

### Template-Specific Variables:
- **Confirm Signup**: `{{ .ConfirmationURL }}`
- **Invite User**: `{{ .InvitationURL }}`, `{{ .InviterEmail }}`, `{{ .InviterName }}`, `{{ .PersonalMessage }}`
- **Magic Link**: `{{ .MagicLink }}`
- **Change Email**: `{{ .ConfirmationURL }}`, `{{ .OldEmail }}`, `{{ .NewEmail }}`
- **Reset Password**: `{{ .ResetURL }}`
- **Reauthentication**: `{{ .ReauthURL }}`, `{{ .ActionDescription }}`, `{{ .DeviceInfo }}`, `{{ .Location }}`

## Styling Notes

The full HTML templates in the `email-templates` folder include:
- Responsive design for all devices
- Beautiful gradient headers
- Clear CTAs with hover effects
- Security notices and alerts
- Professional footer with links
- Accessible color contrast
- Modern, clean typography

You can use either the simple templates above for Supabase or implement a custom email service using the full HTML templates for a more branded experience.