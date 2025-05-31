# Zenya - AI Learning Companion for Neurodiverse Adults

Zenya is an AI-powered learning platform designed specifically for adults with ADHD and other learning differences. It provides personalized, bite-sized lessons that adapt to your mood and energy levels.

## Features

- 🧠 **Adaptive AI Tutor**: Conversational learning that adjusts to your mood and pace
- 🎯 **Micro-Lessons**: 5-minute focused sessions designed for ADHD minds
- 🎮 **Gamification**: XP points, streaks, and celebrations for motivation
- 😊 **Mood-Based Learning**: Content that adapts to how you're feeling
- 🌟 **"Simplify This"**: Instant clarification when you need a different perspective
- 🧘 **Gentle Pace Mode**: Adapted pacing for low-energy days
- 📊 **Progress Tracking**: Visual progress bars and daily journals
- 🔐 **Privacy-First**: Your data stays yours, always

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: OpenAI GPT-4 (or Claude)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/zenya.git
cd zenya
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `OPENAI_API_KEY`: Your OpenAI API key

4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL commands in `supabase/schema.sql`
   - (Optional) Run `supabase/seed.sql` for sample lessons

5. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
zenya/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   ├── auth/        # Auth callbacks
│   ├── learn/       # Learning interface
│   ├── landing/     # Landing page
│   └── page.tsx     # Home page
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── ...          # Feature components
├── lib/             # Utilities and services
│   ├── ai/          # AI integration
│   ├── supabase/    # Database client
│   └── ...          # Other utilities
├── types/           # TypeScript types
└── public/          # Static assets
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Key Development Guidelines

1. **Accessibility First**: All features must be keyboard navigable and screen reader friendly
2. **Mobile-First Design**: Start with mobile layouts and enhance for desktop
3. **Performance**: Keep bundle sizes small and optimize for slow connections
4. **Error Handling**: Always provide clear, friendly error messages
5. **Type Safety**: Use TypeScript strictly, avoid `any` types

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Production Checklist

- [ ] Set up production Supabase instance
- [ ] Configure production API keys
- [ ] Set up custom domain
- [ ] Enable analytics (optional)
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure rate limiting
- [ ] Review security headers

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- 📧 Email: support@zenya.app
- 💬 Discord: [Join our community](https://discord.gg/zenya)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/zenya/issues)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ for the neurodiverse community
- Special thanks to all our beta testers
- Inspired by the need for accessible, ADHD-friendly learning tools

---

**Remember**: Your pace is the right pace. Every small step counts! 🌟