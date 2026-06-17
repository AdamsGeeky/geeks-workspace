# Environment Configuration Guide

## Overview

The GeekInk Workspace frontend uses environment variables to configure the API endpoint and other services. All configuration files use `NEXT_PUBLIC_API_URL` which is shared across development, testing, and production.

## Environment Variables

### Required Variables

#### `NEXT_PUBLIC_API_URL`
- **Type:** String (URL)
- **Default:** `https://geekink-cloud-sp39l.ondigitalocean.app/api/v1`
- **Description:** The base URL for all API requests. This is a `NEXT_PUBLIC_` variable, meaning it's accessible in the browser and included in the production build.
- **Usage:** Set this to point to your backend API server.
- **Examples:**
  - Production: `https://geekink-cloud-sp39l.ondigitalocean.app/api/v1`
  - Local Development: `http://localhost:8000/api/v1`
  - Docker: `http://backend:8000/api/v1`

### Optional Variables (Vercel-specific)

#### `AI_GATEWAY_API_KEY`
- **Type:** String
- **Description:** API key for Vercel AI Gateway (if using AI features)
- **Status:** Optional for current phase

#### `VERCEL_WEB_ANALYTICS_ID`
- **Type:** String
- **Description:** Vercel Web Analytics ID for performance monitoring
- **Status:** Optional

#### `VERCEL_OIDC_TOKEN`
- **Type:** JWT Token
- **Description:** Vercel OIDC token for secure deployment
- **Status:** Auto-configured by Vercel in production

## Setup Instructions

### 1. Local Development Setup

#### Option A: Using Default Configuration
If you're using the default DigitalOcean backend, the app works out of the box:

```bash
npm install
npm run dev
```

The default `NEXT_PUBLIC_API_URL` is already set in the code.

#### Option B: Using Local Backend
If you're running the backend locally:

```bash
# Create .env.local (next to package.json)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Start the dev server
npm run dev
```

#### Option C: Using Docker Compose
If using Docker Compose with a `backend` service:

```bash
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://backend:8000/api/v1" > .env.local

# Start with Docker Compose
docker-compose up
```

### 2. Production Deployment

#### Via Vercel Dashboard
1. Go to your project settings in Vercel
2. Navigate to **Settings > Environment Variables**
3. Add `NEXT_PUBLIC_API_URL` with your production API endpoint
4. Deploy

#### Via Vercel CLI
```bash
vercel env add NEXT_PUBLIC_API_URL https://api.yourdomain.com/api/v1
vercel deploy --prod
```

#### Via Environment File
Create `.env.production.local`:
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

### 3. Staging/Preview Environment
```bash
vercel env add NEXT_PUBLIC_API_URL https://staging-api.yourdomain.com/api/v1 --environment preview
```

## How It's Used

### In API Client (`src/lib/api.ts`)
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://geekink-cloud-sp39l.ondigitalocean.app/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### In Constants (`src/constants/index.ts`)
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://geekink-cloud-sp39l.ondigitalocean.app/api/v1'
```

### In Components
All components use the centralized `api` client which automatically uses `NEXT_PUBLIC_API_URL`:

```typescript
import { api } from '@/lib/api'

// Automatically uses NEXT_PUBLIC_API_URL as base
const response = await api.post('/auth/login', credentials)
```

## Verification

### Check Current Configuration
```bash
# In the browser console (NEXT_PUBLIC variables are accessible):
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Debug API Calls
1. Open DevTools > Network tab
2. Look at the full URL of API requests
3. They should start with your `NEXT_PUBLIC_API_URL` value

### Test with cURL
```bash
# Replace URL with your configured NEXT_PUBLIC_API_URL
curl https://geekink-cloud-sp39l.ondigitalocean.app/api/v1
```

## Environment File Precedence

Next.js loads environment variables in this order (later overrides earlier):

1. `.env` (committed to git, default values)
2. `.env.local` (not committed, local overrides)
3. `.env.production`, `.env.development` (environment-specific defaults)
4. `.env.production.local`, `.env.development.local` (environment-specific overrides)
5. System environment variables

For this project:
- `.env.example` - Template with all available variables
- `.env.local` - Your local configuration (gitignored)
- `.env.development.local` - Development overrides (gitignored)

## Common Issues

### API Calls Return 404
**Check:** Is `NEXT_PUBLIC_API_URL` pointing to a running backend?
```bash
curl $NEXT_PUBLIC_API_URL
```

### API Calls Return CORS Error
**Check:** Backend CORS configuration allows requests from your frontend origin
```bash
# For development: http://localhost:3000
# Verify in backend config
```

### Environment Variable Not Taking Effect
**Solution:** Restart the dev server after changing `.env.local`:
```bash
npm run dev
```

**Note:** `NEXT_PUBLIC_` variables are baked into the build at compile time. For production, redeploy after changing them.

### Mixed Content Error (HTTPS frontend + HTTP API)
**Solution:** Use HTTPS for both or use a proxy:
- Development: Use `http://localhost:...` for both
- Production: Use `https://...` for both

## File Structure Reference

```
geeks-workspace/
├── .env.example                 # Template (committed to git)
├── .env.local                   # Local overrides (gitignored)
├── .env.development.local       # Dev server config (gitignored)
├── .env.production.local        # Production build config (gitignored)
├── src/
│   ├── lib/
│   │   └── api.ts              # Uses NEXT_PUBLIC_API_URL
│   ├── constants/
│   │   └── index.ts            # Exports API_BASE_URL from env
│   └── components/
│       └── ...                  # All use api client
└── next.config.ts              # Next.js configuration
```

## Related Documentation

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [API Integration Guide](./docs/API_CONTRACTS.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
