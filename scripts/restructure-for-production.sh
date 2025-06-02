#!/bin/bash

# Script to restructure repository for production mobile app standards

set -e

echo "🚀 Restructuring Zenya repository for production app standards..."
echo ""

# Create docs directory for internal documentation
echo "📁 Creating organized directory structure..."
mkdir -p docs/internal
mkdir -p docs/public
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p assets/app-store
mkdir -p assets/branding

# Move internal documentation to docs/internal
echo "📋 Moving internal documentation..."
files_to_move=(
    "AUTH_FIX_INSTRUCTIONS.md"
    "EMAIL_SETUP_GUIDE.md"
    "FILES_TO_REMOVE_FROM_GITHUB.md"
    "LOCAL_FILES_GUIDE.md"
    "SECURITY_CLEANUP_SUMMARY.md"
    "scripts/check-email-config.md"
)

for file in "${files_to_move[@]}"; do
    if [ -f "$file" ]; then
        echo "  Moving $file to docs/internal/"
        mv "$file" "docs/internal/" 2>/dev/null || true
    fi
done

# Create professional README
echo "📝 Creating professional README..."
cat > README.md << 'EOF'
<div align="center">
  <img src="assets/branding/zenya-logo.png" alt="Zenya Logo" width="120" height="120">
  
  # Zenya - AI Learning Companion
  
  **Personalized AI tutoring designed for neurodiverse learners**
  
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/ehudso7/zenya/releases)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
  
  [Website](https://zenyaai.com) • [Documentation](docs/public/README.md) • [Report Bug](https://github.com/ehudso7/zenya/issues)
</div>

---

## 🌟 Overview

Zenya is an innovative AI-powered learning platform specifically designed for adults with ADHD and other learning differences. Our adaptive technology creates personalized, bite-sized lessons that match your unique learning style and energy levels.

### 🎯 Key Features

- **🧠 Adaptive AI Tutor** - Conversational learning that adjusts to your pace
- **⏱️ Micro-Lessons** - 5-minute focused sessions designed for ADHD minds  
- **🎮 Gamification** - XP points, streaks, and celebrations for motivation
- **😊 Mood-Based Learning** - Content adapts to how you're feeling
- **✨ Simplify Mode** - Instant clarification when concepts are unclear
- **🌈 Gentle Pace** - Adjusted pacing for low-energy days
- **📊 Progress Tracking** - Visual progress tracking and achievements
- **🔒 Privacy-First** - Your data stays secure and private

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Supabase account (for backend)
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ehudso7/zenya.git
cd zenya
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`

5. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📱 Mobile App

Zenya is available as a Progressive Web App (PWA) and can be installed on your device:

- **iOS**: Open in Safari → Share → Add to Home Screen
- **Android**: Open in Chrome → Menu → Add to Home Screen
- **Desktop**: Click the install icon in your browser's address bar

Native mobile apps coming soon!

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: OpenAI GPT-4 / Anthropic Claude
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

- We take security seriously. Please see our [Security Policy](SECURITY.md) for reporting vulnerabilities.
- All data is encrypted in transit and at rest
- We follow OWASP security best practices
- Regular security audits are performed

## 💬 Support

- 📧 Email: support@zenyaai.com
- 💬 Discord: [Join our community](https://discord.gg/zenya)
- 📖 Documentation: [docs.zenyaai.com](https://docs.zenyaai.com)

## 🙏 Acknowledgments

Built with ❤️ for the neurodiverse community

---

<div align="center">
  <sub>Making learning accessible for everyone, one lesson at a time.</sub>
</div>
EOF

# Create CONTRIBUTING.md
echo "📝 Creating CONTRIBUTING.md..."
cat > CONTRIBUTING.md << 'EOF'
# Contributing to Zenya

First off, thank you for considering contributing to Zenya! It's people like you that make Zenya such a great tool for the neurodiverse community.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples
- Describe the behavior you observed and what you expected
- Include screenshots if relevant
- Note your OS, browser, and version

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a detailed description of the proposed enhancement
- Explain why this enhancement would be useful
- List any alternative solutions you've considered

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows our style guidelines
5. Write a clear commit message

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with required variables
4. Run the development server: `npm run dev`

## Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable names
- Add comments for complex logic
- Write self-documenting code

### React/Next.js

- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Use proper prop types

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Maintain or improve code coverage

## Questions?

Feel free to contact the maintainers if you have any questions!
EOF

# Create CODE_OF_CONDUCT.md
echo "📝 Creating CODE_OF_CONDUCT.md..."
cat > CODE_OF_CONDUCT.md << 'EOF'
# Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community
* Showing empathy towards other community members

Examples of unacceptable behavior:

* The use of sexualized language or imagery, and unwelcome sexual attention
* Trolling, insulting or derogatory comments, and personal attacks
* Public or private harassment
* Publishing others' private information without permission
* Other conduct which could reasonably be considered inappropriate

## Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community leaders responsible for enforcement at support@zenyaai.com.

All complaints will be reviewed and investigated promptly and fairly.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 2.0.

[homepage]: https://www.contributor-covenant.org
EOF

# Create LICENSE
echo "📝 Creating LICENSE..."
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 Zenya AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Create SECURITY.md
echo "📝 Creating SECURITY.md..."
cat > SECURITY.md << 'EOF'
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Zenya seriously. If you have discovered a security vulnerability, please follow these steps:

1. **Do NOT** disclose the vulnerability publicly
2. Email us at security@zenyaai.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- We will acknowledge receipt within 48 hours
- We will provide an initial assessment within 7 days
- We will release patches for critical vulnerabilities ASAP

## Security Best Practices

- All data is encrypted in transit (TLS 1.2+)
- Passwords are hashed using bcrypt
- API keys are stored securely
- Regular security audits are performed
- We follow OWASP guidelines

Thank you for helping keep Zenya and our users safe!
EOF

# Create GitHub issue templates
echo "📝 Creating issue templates..."
cat > .github/ISSUE_TEMPLATE/bug_report.md << 'EOF'
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: 'bug'
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS]
 - Browser: [e.g. chrome, safari]
 - Version: [e.g. 22]

**Additional context**
Add any other context about the problem here.
EOF

cat > .github/ISSUE_TEMPLATE/feature_request.md << 'EOF'
---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: 'enhancement'
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
EOF

# Create pull request template
echo "📝 Creating PR template..."
cat > .github/pull_request_template.md << 'EOF'
## Description

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] I have tested this code locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
EOF

# Create app store assets directory structure
echo "📁 Creating app store asset placeholders..."
cat > assets/app-store/README.md << 'EOF'
# App Store Assets

This directory contains assets for app store listings.

## Required Assets

### App Icons
- `icon-1024.png` - 1024x1024 App Store icon
- `icon-512.png` - 512x512 Google Play icon

### Screenshots
- iOS: 1290x2796 (iPhone 15 Pro Max)
- Android: 1080x1920 minimum

### Feature Graphics
- `feature-graphic.png` - 1024x500 for Google Play

### Promotional Images
- Various sizes for featuring

## Naming Convention
- `ios-screenshot-1.png`
- `android-screenshot-1.png`
- `ipad-screenshot-1.png`
EOF

# Create branding guidelines
cat > assets/branding/BRAND_GUIDELINES.md << 'EOF'
# Zenya Brand Guidelines

## Logo Usage
- Minimum size: 24px height
- Clear space: 1x logo height on all sides
- Don't modify colors or proportions

## Colors
- Primary: #3B82F6 (Blue)
- Secondary: #4F46E5 (Indigo)
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444

## Typography
- Headings: Inter
- Body: Inter
- Code: JetBrains Mono

## Voice & Tone
- Friendly and encouraging
- Clear and simple
- Empathetic and understanding
- Never condescending
EOF

# Update .gitignore to keep internal docs local
echo "" >> .gitignore
echo "# Internal documentation" >> .gitignore
echo "docs/internal/" >> .gitignore
echo "*.local.md" >> .gitignore

echo ""
echo "✅ Repository restructured for production standards!"
echo ""
echo "📋 Next steps:"
echo "1. Add app icons and screenshots to assets/app-store/"
echo "2. Add logo to assets/branding/"
echo "3. Review and customize the generated documentation"
echo "4. Remove any remaining internal files from the root"
echo "5. Set up GitHub Actions for CI/CD"
echo ""
echo "🚀 Your repository now follows industry standards for a production mobile app!"