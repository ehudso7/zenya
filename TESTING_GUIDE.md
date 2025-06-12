# 🧪 Zenya AI Testing Guide

## 🚀 Quick Start Testing

### 1. Check Production Deployment
First, verify your Vercel deployment is live:
- Visit: https://zenya-ai.vercel.app (or your custom domain)
- Check the deployment logs at: https://vercel.com/dashboard

### 2. Local Testing Setup

```bash
# Start the development server
npm run dev

# In another terminal, run the WebSocket server (if testing real-time features)
npm run dev:ws

# The app will be available at:
# http://localhost:3000
```

## 🔐 Authentication Testing

### Test 1: Sign Up Flow
1. Go to `/auth/register` or click "Sign Up"
2. Enter a test email (use a real email or a service like temp-mail.org)
3. Check email for confirmation link
4. Click the confirmation link
5. You should be redirected to profile setup

**What to verify:**
- ✅ Email arrives within 1-2 minutes
- ✅ Confirmation link works
- ✅ Profile is created in Supabase
- ✅ User is automatically signed in after confirmation

### Test 2: Sign In Flow
1. Go to `/auth/signin`
2. Try both methods:
   - **Magic Link**: Enter email → Check email → Click link
   - **Password**: Go to `/auth/signin-password` → Enter credentials

**What to verify:**
- ✅ Magic link arrives and works
- ✅ Password sign-in works
- ✅ Session persists on page refresh
- ✅ Redirected to `/learn` after sign in

### Test 3: Sign Out
1. Click the user menu or logout button
2. Verify you're redirected to `/landing`
3. Try accessing `/learn` - should redirect to sign in

### Test 4: Session Persistence
1. Sign in successfully
2. Close the browser completely
3. Reopen and go to the app
4. You should still be signed in

## 🤖 Core Features Testing

### Test 5: AI Chat
1. Go to `/learn` (must be signed in)
2. Select a curriculum or lesson
3. Test the AI chat:
   ```
   Example prompts to try:
   - "Explain this concept simply"
   - "I'm confused about X"
   - "Give me an example"
   - "I have ADHD, can you break this down?"
   ```

**What to verify:**
- ✅ AI responds within 2-5 seconds
- ✅ Responses are helpful and contextual
- ✅ XP is earned for interactions
- ✅ Chat history is preserved

### Test 6: Lesson Navigation
1. Browse available curriculums at `/learn`
2. Click on a curriculum
3. Navigate through lessons

**What to verify:**
- ✅ Lessons load correctly
- ✅ Progress is tracked
- ✅ "Continue where you left off" works
- ✅ Lesson completion awards XP

### Test 7: Profile & Progress
1. Go to `/profile`
2. Check your stats:
   - Current XP
   - Level
   - Learning streak
   - Achievements

**What to verify:**
- ✅ Stats update in real-time
- ✅ Mood selector works
- ✅ Profile data saves correctly

## 🔧 Advanced Testing

### Test 8: PWA Features
1. On mobile, visit the site
2. You should see "Add to Home Screen" prompt
3. Install the app
4. Test offline mode:
   - Turn on airplane mode
   - Try to access the app
   - Should see offline page

### Test 9: Collaborative Features (if enabled)
1. Open two browser windows/tabs
2. Sign in with different accounts
3. Join the same lesson
4. Test real-time features:
   - Cursor sharing
   - Live typing indicators
   - Shared progress

### Test 10: Performance
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Run audit for:
   - Performance (should be >90)
   - Accessibility (should be 100)
   - Best Practices (should be >90)
   - SEO (should be 100)

## 🐛 Common Issues & Solutions

### Issue: "Application error: a client-side exception has occurred"
**Solution**: Check browser console for specific error. Usually a missing environment variable.

### Issue: Authentication not working
**Solutions**:
1. Verify Supabase credentials in Vercel environment variables
2. Check Supabase dashboard for any RLS policy issues
3. Ensure email templates are configured in Supabase

### Issue: AI Chat not responding
**Solutions**:
1. Check OpenAI API key is set in environment variables
2. Verify you have API credits
3. Check browser console for 429 (rate limit) errors

### Issue: Slow performance
**Solutions**:
1. Check Vercel function logs for timeouts
2. Verify database indexes are created
3. Check for large bundle sizes in build output

## 📋 Testing Checklist

Copy this checklist for each testing session:

```markdown
### Authentication
- [ ] Sign up with email works
- [ ] Email confirmation received
- [ ] Sign in with password works
- [ ] Sign in with magic link works
- [ ] Sign out works
- [ ] Session persists after browser restart
- [ ] Protected routes redirect when not authenticated

### Core Features
- [ ] AI chat responds appropriately
- [ ] Lessons load and display correctly
- [ ] Progress tracking works
- [ ] XP system updates correctly
- [ ] Profile page shows correct data
- [ ] Mood selection works

### UI/UX
- [ ] Responsive on mobile devices
- [ ] Dark mode works (if implemented)
- [ ] Loading states appear correctly
- [ ] Error messages are user-friendly
- [ ] Animations are smooth

### Performance
- [ ] Pages load quickly (<3s)
- [ ] No console errors
- [ ] Images load properly
- [ ] PWA features work
```

## 🔍 Debugging Tools

### Check Logs
1. **Vercel Logs**: https://vercel.com/[your-team]/zenya/functions
2. **Supabase Logs**: Dashboard → Logs → API Logs
3. **Browser Console**: F12 → Console tab

### Useful Commands
```bash
# Check build locally
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test

# Check bundle size
npm run build && npm run analyze
```

## 📱 Mobile Testing

1. **Real Device Testing**:
   - Use your phone's browser
   - Test touch interactions
   - Test portrait/landscape modes

2. **Browser DevTools**:
   - Chrome: F12 → Toggle device toolbar
   - Test different device sizes
   - Test touch events

3. **PWA Testing**:
   - Install as app
   - Test offline functionality
   - Test push notifications (if implemented)

## 🎯 What Success Looks Like

✅ **Authentication**: Users can sign up, sign in, and maintain sessions
✅ **AI Features**: Chat works reliably with <5 second response times
✅ **Progress Tracking**: XP, streaks, and progress save correctly
✅ **Performance**: Lighthouse scores >90 for performance
✅ **Mobile**: Fully responsive and installable as PWA
✅ **Reliability**: No critical errors in 30 minutes of testing

## 🆘 Getting Help

If you encounter issues:
1. Check the browser console (F12)
2. Check Vercel deployment logs
3. Check Supabase logs
4. Review recent commits for changes
5. Check environment variables are set correctly

Remember to test both locally and on production to ensure everything works in both environments!