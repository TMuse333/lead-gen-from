# Cache Reset Guide for Next.js Dev Server

## Quick Reset Commands

### Option 1: Full Reset (Recommended)
```bash
# Stop the dev server (Ctrl+C)

# Navigate to frontend directory
cd frontend

# Remove Next.js build cache
rm -rf .next

# Remove node_modules cache (if exists)
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

### Option 2: Nuclear Reset (If Option 1 doesn't work)
```bash
# Stop the dev server (Ctrl+C)

# Navigate to frontend directory
cd frontend

# Remove all caches
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo  # If using Turbopack

# Clear npm cache (optional, but thorough)
npm cache clean --force

# Reinstall dependencies (if needed)
# npm install

# Restart dev server
npm run dev
```

### Option 3: Browser Cache Reset
If code changes still don't appear after server reset:

1. **Hard Refresh in Browser:**
   - **Chrome/Edge (Mac):** `Cmd + Shift + R`
   - **Chrome/Edge (Windows):** `Ctrl + Shift + R` or `Ctrl + F5`
   - **Safari (Mac):** `Cmd + Option + R`
   - **Firefox:** `Ctrl + Shift + R` or `Ctrl + F5`

2. **Clear Browser Cache:**
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

3. **Clear localStorage/sessionStorage:**
   - Open DevTools Console
   - Run: `localStorage.clear()` and `sessionStorage.clear()`

---

## What Each Cache Does

### `.next/` folder
- Next.js build cache
- Contains compiled pages, API routes, and static assets
- **When to clear:** After major code changes, routing changes, or when pages don't update

### `node_modules/.cache/`
- Module resolution cache
- Cached imports and dependencies
- **When to clear:** When imports aren't resolving correctly

### `.turbo/` (if using Turbopack)
- Turbopack build cache
- Faster incremental builds
- **When to clear:** If Turbopack is behaving strangely

### Browser Cache
- Cached JavaScript, CSS, and assets
- **When to clear:** When UI changes don't appear despite server restart

---

## Common Scenarios

### "Code changes aren't showing up"
1. Stop dev server (Ctrl+C)
2. `rm -rf .next`
3. `npm run dev`
4. Hard refresh browser (Cmd+Shift+R)

### "Import errors after moving files"
1. `rm -rf .next`
2. `rm -rf node_modules/.cache`
3. `npm run dev`

### "Routing not working correctly"
1. `rm -rf .next`
2. Clear browser cache
3. `npm run dev`
4. Hard refresh

### "Styling not updating"
1. Hard refresh browser first (Cmd+Shift+R)
2. If still not working: `rm -rf .next` and restart

---

## One-Liner Commands

### Quick Reset (Mac/Linux)
```bash
cd frontend && rm -rf .next node_modules/.cache && npm run dev
```

### Quick Reset (Windows PowerShell)
```powershell
cd frontend; Remove-Item -Recurse -Force .next, node_modules\.cache -ErrorAction SilentlyContinue; npm run dev
```

---

## Prevention Tips

1. **Use `.gitignore`** - Make sure `.next/` is ignored
2. **Regular restarts** - Restart dev server after major changes
3. **Browser DevTools** - Keep "Disable cache" checked while developing
4. **Hot Reload** - Next.js should hot reload, but sometimes needs manual refresh

---

## When to Use Each Method

- **Option 1 (Quick):** Most common issues, after code changes
- **Option 2 (Nuclear):** Persistent issues, after major refactoring
- **Browser Reset:** UI/styling issues, when server reset doesn't help

---

## Troubleshooting

If reset doesn't work:

1. **Check for syntax errors:**
   ```bash
   npm run build
   ```

2. **Check for TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

3. **Verify file changes were saved:**
   - Check file timestamps
   - Ensure files are actually saved

4. **Check for multiple dev servers:**
   ```bash
   lsof -ti:3000  # Check what's using port 3000
   kill -9 $(lsof -ti:3000)  # Kill it
   ```

5. **Restart your IDE/editor:**
   - Sometimes editors cache file contents

---

## Next.js Specific Cache Locations

- `.next/` - Build output and cache
- `.next/cache/` - Internal Next.js cache
- `node_modules/.cache/` - Webpack/Module cache
- Browser DevTools → Application → Cache Storage

---

**Pro Tip:** Add this to your `package.json` scripts for easy access:
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:clean": "rm -rf .next && npm run dev",
    "dev:fresh": "rm -rf .next node_modules/.cache && npm run dev"
  }
}
```

Then run: `npm run dev:clean` or `npm run dev:fresh`

