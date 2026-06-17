# GeekInk Workspace Frontend

A modern, responsive Next.js 16 application for the GeekInk community learning platform. Built with React, TypeScript, Tailwind CSS, and shadcn/ui components.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17+
- npm 9+

### Installation

```bash
# Clone repository
git clone https://github.com/AdamsGeeky/geeks-workspace.git
cd geeks-workspace

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Configuration

By default, the app connects to the production API. To use a different backend:

```bash
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Restart dev server
npm run dev
```

For comprehensive setup instructions, see [ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md) and [QUICKSTART.md](./QUICKSTART.md).

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Step-by-step setup and feature walkthrough
- **[ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md)** - Complete environment variable guide
- **[CHANGELOG.md](./CHANGELOG.md)** - Feature inventory and project structure
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🎨 Features

### Pages
- **Login & Register** - Email/password authentication
- **Dashboard** - Overview with stats, announcements, and activity
- **Announcements** - Pinned and recent notifications
- **Assignments** - Task management with submission tracking
- **Community Feed** - User posts, likes, and comments
- **Notifications** - Grouped notification list
- **Materials** - Learning resources with filters
- **Challenges** - Coding challenges with leaderboards
- **Profile** - User badges, level progress, activity
- **Cohorts** - Group management and assignments
- **Admin Panel** - System statistics and moderation

### Technical Stack
- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **Components:** shadcn/ui (Radix UI primitives)
- **State:** Zustand (auth) + React Query (server state)
- **Forms:** React Hook Form + Zod validation
- **HTTP:** Axios with interceptors
- **Notifications:** Sonner toasts
- **Icons:** Lucide React

### Design System
- **Primary:** Green (#16a34a)
- **Neutrals:** Slate grays + white/black
- **Responsive:** Mobile-first with sidebar + drawer navigation

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm start        # Run production build
npm run lint     # Run ESLint
```

### Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication pages
│   ├── (app)/               # Protected app pages
│   └── layout.tsx           # Root layout with providers
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── features/            # Feature-specific components
│   └── shared/              # Reusable components
├── lib/
│   ├── api.ts              # Axios client with NEXT_PUBLIC_API_URL
│   ├── utils.ts            # Helper functions
│   └── handleApiError.ts   # Error handling
├── store/                   # Zustand stores
├── types/                   # TypeScript types
└── constants/               # Constants + API_BASE_URL
```

### API Integration

All API calls use a centralized Axios client configured with `NEXT_PUBLIC_API_URL`:

```typescript
import { api } from '@/lib/api'

// Automatically uses the configured API URL
const response = await api.get('/assignments')
const posted = await api.post('/community/posts', data)
```

The API URL is configurable via the `NEXT_PUBLIC_API_URL` environment variable (defaults to production endpoint).

## 🌐 Deployment

### To Vercel

```bash
# Push to GitHub
git push origin main

# Deploy (auto-deploys on push)
# Or manually from Vercel dashboard
```

### Environment Variables for Production

Set these in Vercel project settings:

- `NEXT_PUBLIC_API_URL` - Your production API endpoint
- `VERCEL_WEB_ANALYTICS_ID` - (Optional) Analytics ID

See [ENV_CONFIGURATION.md](./ENV_CONFIGURATION.md) for detailed deployment instructions.

## 🐛 Troubleshooting

### Build Cache Issues
```bash
rm -rf .next/dev && npm run dev
```

### Environment Variable Not Working
Restart the dev server after changing `.env.local`. See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more issues.

## 📖 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Zod Validation](https://zod.dev)
- [React Query Documentation](https://tanstack.com/query/latest)

## 📝 License

This project is part of GeekInk Workspace. All rights reserved.

## 🤝 Contributing

Please follow the existing code patterns and ensure all changes are tested before submitting.

For questions or issues, refer to [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) or open an issue in the repository.
