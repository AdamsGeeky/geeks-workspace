# Troubleshooting Guide

## Build & Server Issues

### 1. Turbopack Build Manifest Error

**Error Message**:
```
⨯ Error: ENOENT: no such file or directory, open '.../build-manifest.json'
```

**Cause**: The Turbopack `.next/dev` cache gets out of sync when:
- Switching between git branches
- Pulling changes with new/deleted files  
- Interrupted dev server restarts
- Node modules are updated

**Solution** (in order of severity):

**Quick Fix** (most common):
```bash
rm -rf .next/dev
npm run dev
```

**Full Cache Clear** (if quick fix doesn't work):
```bash
rm -rf .next
npm run dev
```

**Nuclear Option** (if still failing):
```bash
rm -rf .next node_modules .eslintcache
npm install
npm run dev
```

---

### 2. Module Not Found Errors

**Error**: `Error: Cannot find module '@/components/ui/...'`

**Solution**:
1. Check the file exists: `ls src/components/ui/`
2. Verify the import path matches exactly (case-sensitive on Linux/Mac)
3. Clear cache: `rm -rf .next && npm run dev`

---

### 3. TypeScript Errors After Pull

**Error**: `Type 'X' is not assignable to type 'Y'`

**Solution**:
```bash
# Regenerate TypeScript cache
rm -rf .next .eslintcache
npm run dev
```

---

## Runtime Issues

### 4. Pages Show Skeleton Loaders Only

**Cause**: Mock data fallback is working but API is not responding.

**Solution**:
- This is **expected behavior** — the app uses mock data by default
- To use real API, set `NEXT_PUBLIC_API_URL` in `.env.local`:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```
- Check that the DigitalOcean API is running on port 8000

---

### 5. Authentication Not Working

**Issue**: Clicking login keeps redirecting to `/login`

**Cause**: The `proxy.ts` middleware checks for `accessToken` cookie. Without it, all `/dashboard` and other app routes redirect to login.

**Solution**:
- This is **correct behavior** — the auth system is working
- To test, you need to:
  1. Either connect to a real backend that sets cookies
  2. Or modify `proxy.ts` to mock a user session for development

**Temporary Development Mock** (add to `proxy.ts`):
```typescript
// For development: allow any user with a test cookie
if (process.env.NODE_ENV === 'development') {
  request.cookies.set('accessToken', 'dev-mock-token')
}
```

---

### 6. Sidebar Links Don't Navigate

**Issue**: Clicking sidebar links doesn't change the page

**Solution**:
- Check the `NEXT_PUBLIC_API_URL` is set correctly
- The app might be stuck waiting for API data
- Try refreshing the page (browser F5)
- Check browser console for errors: `F12 → Console tab`

---

## Development Workflow Issues

### 7. Changes Not Showing Up

**Cause**: Turbopack might not be watching the file

**Solution**:
```bash
# Restart dev server (Ctrl+C then):
npm run dev

# If that doesn't work, full rebuild:
rm -rf .next
npm run dev
```

---

### 8. Slow Build Times

**Expected**: First build is slow (~5-10 seconds)

**Optimization**:
- Subsequent builds should be fast (<1 second) due to Turbopack incremental compilation
- If builds remain slow:
  ```bash
  # Check what's slowing things down
  npm run build -- --debug
  ```

---

### 9. Memory Issues / Out of Memory

**Error**: `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory`

**Solution**:
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Or set permanently in .env:
NODE_OPTIONS=--max-old-space-size=4096
```

---

## Dependencies & Installation

### 10. Package Installation Fails

**Error**: `npm ERR! code ERESOLVE unable to resolve dependency tree`

**Solution**:
```bash
# Use legacy dependency resolution
npm install --legacy-peer-deps
```

---

### 11. Missing Dependencies

**Error**: `Module not found: Can't resolve 'react-query'`

**Solution**:
```bash
# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## API & Data Issues

### 12. API Calls Always Return 404

**Cause**: The mock data fallback is masking the real API error

**Solution**:
1. Open browser DevTools (`F12`)
2. Go to **Network** tab
3. Try navigating to a page
4. Check if API calls are failing (red responses)
5. Verify `NEXT_PUBLIC_API_URL` matches your backend

---

### 13. CORS Errors

**Error**: `Access to XMLHttpRequest ... blocked by CORS policy`

**Solution**:
- The backend API needs to allow cross-origin requests
- Add this to your DigitalOcean API response headers:
  ```
  Access-Control-Allow-Origin: http://localhost:3000
  Access-Control-Allow-Credentials: true
  ```

---

## Environment Variables

### 14. Environment Variables Not Loading

**Issue**: `process.env.NEXT_PUBLIC_API_URL` is undefined

**Solution**:
1. Create `.env.local` in the project root:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
2. Restart dev server
3. Only variables starting with `NEXT_PUBLIC_` are exposed to the browser

---

## Git & Deployment

### 15. Merge Conflicts After Pull

**Solution**:
1. Resolve conflicts in files:
   ```bash
   git status
   ```
2. Clear cache after resolving:
   ```bash
   rm -rf .next/dev
   npm run dev
   ```

---

### 16. Build Fails in Production

**Error**: `Build failed with status code 1`

**Solution**:
```bash
# Test production build locally
npm run build

# Check for TypeScript errors
npm run build -- --debug

# Look for failing components or pages
```

---

## Debug Tips

### Enable Debug Logging

Add to any component to trace execution:

```typescript
console.log('[v0] Mounting LoginForm')
console.log('[v0] Auth state:', authStore.getState())
console.log('[v0] API response:', data)
```

### Check React DevTools

1. Install React DevTools Chrome extension
2. Open DevTools (`F12`)
3. Go to **Components** tab to inspect component tree
4. Check props and state values

### Network Tab Debugging

1. Open DevTools (`F12`)
2. Go to **Network** tab
3. Reload page
4. Check API requests and responses
5. Look for failing requests (red 4xx/5xx)

---

## Getting Help

If issues persist:

1. **Check the logs**: `npm run dev` shows detailed error messages
2. **Clear everything**: `rm -rf .next node_modules && npm install && npm run dev`
3. **Check dependencies**: Verify Node.js 18+ and npm 9+
4. **Read the docs**: Check [CHANGELOG.md](./CHANGELOG.md) and [docs/SPEC.md](./docs/SPEC.md)
