# Quick Start Guide

## Installation & Setup

### Prerequisites
- **Node.js**: 18.17+ (check with `node --version`)
- **npm**: 9+ (check with `npm --version`)
- **Git**: Any recent version

### Step 1: Clone & Install

```bash
# Clone the repository (if not already done)
git clone https://github.com/AdamsGeeky/geeks-workspace.git
cd geeks-workspace

# Install dependencies
npm install

# Install may take 2-3 minutes
```

### Step 2: Start Dev Server

```bash
npm run dev

# You should see:
# ▲ Next.js 16.2.9 (Turbopack)
# - Local:         http://localhost:3000
# ✓ Ready in 623ms
```

### Step 3: Open in Browser

Navigate to `http://localhost:3000` → You'll be redirected to `/login`

---

## Testing the App

### Login Page
- Go to `http://localhost:3000/login`
- Enter any email and password (no validation needed for mock demo)
- Click "Sign In"
- You should see the **Dashboard**

### Dashboard
Shows:
- Quick stats (Assignments Due, Challenges, Posts, Leaderboard)
- Recent announcements
- Activity timeline

### Navigation
- **Desktop**: Use the sidebar on the left
- **Mobile**: Click the hamburger menu (☰) in the top-left

### Explore Pages
1. **Announcements** - Recent & pinned announcements
2. **Assignments** - List of assignments with detail view
3. **Community** - Social feed with posts & comments
4. **Challenges** - Coding challenges with leaderboard
5. **Materials** - Learning resources (PDFs, videos, code)
6. **Notifications** - All notifications grouped by type
7. **Profile** - User profile, badges, activity
8. **Cohorts** - Your cohort and other cohorts
9. **Admin Panel** - (Admin-only) System stats and submission reviews

---

## Project Structure

**Key files to know:**

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js pages and routes |
| `src/components/` | React components |
| `src/lib/api.ts` | API client configuration |
| `src/store/authStore.ts` | Authentication state |
| `src/types/` | TypeScript type definitions |
| `src/proxy.ts` | Route protection middleware |
| `tailwind.config.ts` | Tailwind CSS config |
| `.env.local` | Environment variables (not in git) |

---

## Common Tasks

### Add a New Page

1. Create folder: `src/app/(app)/newpage/`
2. Create file: `src/app/(app)/newpage/page.tsx`
3. Write component:

```typescript
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">New Page</h1>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>Content here</CardContent>
      </Card>
    </div>
  )
}
```

4. Add to sidebar: Edit `src/components/shared/Sidebar.tsx`

### Use React Query

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export default function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await api.get('/announcements')
      return response.data
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{data?.map(item => <div key={item.id}>{item.title}</div>)}</div>
}
```

### Use Zustand Store

```typescript
import { useAuthStore } from '@/store/authStore'

export default function MyComponent() {
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)

  return (
    <div>
      <p>Hello, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Add a Form with Validation

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message too short'),
})

type FormData = z.infer<typeof schema>

export default function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Input
          id="message"
          {...register('message')}
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="text-red-600 text-sm">{errors.message.message}</p>}
      </div>

      <Button type="submit">Send</Button>
    </form>
  )
}
```

---

## Development Tips

### Hot Reload
All file changes automatically reload in the browser — no manual refresh needed.

### Debug in Browser
1. Open DevTools: `F12`
2. Go to **Console** tab to see logs
3. Use `console.log('[v0] ...')` in components

### Check Component Props
1. Open DevTools: `F12`
2. Go to **Components** tab (React DevTools)
3. Click on any component in the tree
4. See props, state, and hooks on the right

### Responsive Design
Test different screen sizes:
1. Open DevTools: `F12`
2. Click device toggle (top-left corner)
3. Choose device or custom size

### TypeScript Errors
Editor will show red squiggles. To see all:
```bash
npx tsc --noEmit
```

---

## Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start

# Open http://localhost:3000
```

**Note**: Production builds are much faster and smaller than dev mode.

---

## Environment Setup (Optional)

Create `.env.local` to override defaults:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Info
NEXT_PUBLIC_APP_NAME=GeekInk Workspace

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

**Important**: Only variables starting with `NEXT_PUBLIC_` are available in the browser.

---

## Troubleshooting

### "Build manifest not found" Error
```bash
rm -rf .next/dev
npm run dev
```

### Pages show only skeleton loaders
This is normal — mock data is being used. To use real API:
1. Set `NEXT_PUBLIC_API_URL` in `.env.local`
2. Ensure backend is running on that URL
3. Restart dev server

### Module not found errors
```bash
rm -rf .next node_modules
npm install
npm run dev
```

For more issues, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **React Query**: https://tanstack.com/query/latest
- **Zustand**: https://github.com/pmndrs/zustand

---

## Next Steps

After getting familiar with the codebase:

1. ✅ Explore all pages and components
2. ✅ Run the dev server locally
3. ✅ Read [CHANGELOG.md](./CHANGELOG.md) for architecture overview
4. ✅ Check [docs/SPEC.md](./docs/SPEC.md) for product requirements
5. ✅ Connect to real backend API
6. ✅ Start building new features

Happy coding! 🚀
