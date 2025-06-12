# 🚀 Test Zenya AI Right Now!

Your app is running locally at: **http://localhost:3000**

## 🧪 Quick Test Steps

### 1️⃣ First, Check the Basics
- Open http://localhost:3000 in your browser
- You should see the landing page
- Check for any console errors (F12 → Console)

### 2️⃣ Test Sign Up (5 min)
1. Click "Sign Up" or go to http://localhost:3000/auth/register
2. Use a test email (you can use a service like https://temp-mail.org)
3. Check the email for confirmation link
4. Click the link to confirm
5. You should be redirected to complete your profile

### 3️⃣ Test Sign In (2 min)
1. Go to http://localhost:3000/auth/signin
2. Enter your email
3. Check email for magic link
4. Click the link to sign in
5. You should land on the /learn page

### 4️⃣ Test AI Features (5 min)
1. Once signed in, go to http://localhost:3000/learn
2. Click on any curriculum
3. Select a lesson
4. Try the AI chat with prompts like:
   - "Hi, can you help me understand this?"
   - "I have ADHD, can you explain this simply?"
   - "Give me an example"

### 5️⃣ Check Your Progress
1. Go to http://localhost:3000/profile
2. Verify your XP and level are displayed
3. Try changing your mood
4. Check that changes are saved

## 🔍 Production Testing

Your Vercel deployment should be live at:
- https://zenya-ai.vercel.app
- Or check your custom domain

Test the same flows on production to ensure everything works there too!

## ⚡ Quick Checks

```bash
# In a new terminal, check if the build works:
npm run build

# Check for TypeScript errors:
npm run type-check

# Check for linting issues:
npm run lint
```

## 🐛 Common Issues

### If emails aren't arriving:
1. Check Supabase Dashboard → Authentication → Logs
2. Verify email templates are set up in Supabase
3. Check spam folder

### If AI chat doesn't respond:
1. Check browser console for errors
2. Verify OPENAI_API_KEY is set in .env.local
3. Check you have API credits

### If sign in redirects fail:
1. Check NEXT_PUBLIC_APP_URL in .env.local
2. Verify Supabase URL settings

## 📱 Mobile Testing
Open http://localhost:3000 on your phone (use your computer's IP address instead of localhost)

## ✅ Success Criteria
- [ ] Can create account
- [ ] Can sign in/out
- [ ] AI chat responds
- [ ] Progress is tracked
- [ ] No console errors

Happy testing! 🎉