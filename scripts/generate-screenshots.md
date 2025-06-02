# App Store Screenshot Generation Guide

## Required Screenshots

### iOS App Store
- **iPhone 15 Pro Max**: 1290 × 2796 pixels (6.7")
- **iPhone 8 Plus**: 1242 × 2208 pixels (5.5")
- **iPad Pro 12.9"**: 2048 × 2732 pixels

### Google Play Store
- **Phone**: 1080 × 1920 pixels minimum
- **Tablet**: 1200 × 1920 pixels (7")
- **Feature Graphic**: 1024 × 500 pixels

## Screenshot Checklist

### 1. Home/Landing Screen
- Show the main value proposition
- Include the "Get Started" CTA
- Display key features

### 2. Mood Selection Screen
- Show the mood check-in interface
- Highlight personalization aspect
- Include various mood options

### 3. AI Learning Session
- Active conversation with AI tutor
- Show "Simplify This" button
- Display progress indicators

### 4. Progress Dashboard
- XP points and streaks
- Achievement badges
- Learning statistics

### 5. Curriculum Overview
- Available courses
- Progress on each course
- Difficulty levels

## Screenshot Best Practices

### Design Guidelines
1. **Clean Background**: Use gradient or blurred backgrounds
2. **Device Frames**: Add device frames for context
3. **Annotations**: Add callout text to highlight features
4. **Consistent Style**: Maintain brand colors and fonts
5. **Localization**: Create sets for different languages

### Content Guidelines
1. **Real Data**: Use realistic user data (not lorem ipsum)
2. **Success States**: Show accomplishments and streaks
3. **Diversity**: Include diverse avatars and names
4. **Features**: Highlight unique features in each shot

## Tools for Screenshot Creation

### Option 1: Browser Developer Tools
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select device preset or custom size
4. Take screenshots using DevTools

### Option 2: Screenshot Tools
- **Screely**: https://www.screely.com/
- **MockuPhone**: https://mockuphone.com/
- **Rotato**: https://rotato.app/
- **Screenshot.rocks**: https://screenshot.rocks/

### Option 3: Design Tools
- **Figma**: Create custom mockups
- **Sketch**: Design and export
- **Canva**: Quick templates

## Manual Screenshot Process

### Step 1: Prepare Content
```bash
# 1. Sign in to the app
# 2. Create a demo account with good progress
# 3. Complete some lessons
# 4. Earn achievements
```

### Step 2: Capture Screenshots
1. **Landing Page**
   - URL: https://zenyaai.com/
   - Capture hero section with CTA

2. **Sign Up Flow**
   - URL: https://zenyaai.com/auth/signin-password
   - Show clean auth interface

3. **Learn Page**
   - URL: https://zenyaai.com/learn
   - Show curriculum selection

4. **Profile/Progress**
   - URL: https://zenyaai.com/profile
   - Display achievements and stats

### Step 3: Post-Processing
1. Add device frames
2. Add promotional text
3. Ensure consistent dimensions
4. Optimize file size (< 8MB)

## Promotional Text Templates

### Screenshot 1: Hero
"AI Learning That Gets You
Built for ADHD Minds"

### Screenshot 2: Mood
"Check In With Your Mood
Lessons Adapt to You"

### Screenshot 3: Learning
"5-Minute Micro Lessons
Learn at Your Own Pace"

### Screenshot 4: Progress
"Track Your Success
Celebrate Every Win"

### Screenshot 5: Features
"Simplify Mode • Gentle Pace
Learning Your Way"

## File Naming Convention

```
ios-iphone15promax-1-hero.png
ios-iphone15promax-2-mood.png
ios-iphone15promax-3-learning.png
ios-iphone15promax-4-progress.png
ios-iphone15promax-5-features.png

android-phone-1-hero.png
android-phone-2-mood.png
android-phone-3-learning.png
android-phone-4-progress.png
android-phone-5-features.png
```

## Submission Guidelines

### Apple App Store
- At least 2 screenshots per device type
- Maximum 10 screenshots
- Order matters (most important first)

### Google Play Store
- Minimum 2 screenshots
- Maximum 8 screenshots
- Feature graphic required

## Next Steps

1. Take raw screenshots using browser tools
2. Add device frames using MockuPhone
3. Add promotional text using Figma/Canva
4. Export in required dimensions
5. Compress images if needed
6. Upload to `/public/screenshots/`