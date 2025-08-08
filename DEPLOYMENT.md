# Deployment Guide - Fixing SQLite3 Binary Issues

## Problem
The error `invalid ELF header` occurs because the SQLite3 native binary was compiled for a different architecture than the deployment environment. This is common when deploying to cloud platforms like Railway, Heroku, or Docker containers.

## Solutions

### Solution 1: Use better-sqlite3 (Recommended)
I've updated your backend to use `better-sqlite3` which has better deployment compatibility.

**Changes Made:**
- Replaced `sqlite3` with `better-sqlite3` in `package.json`
- Added `@types/better-sqlite3` for TypeScript support
- Created a flexible database configuration in `src/database.ts`
- Updated Railway configuration to rebuild binaries

**Next Steps:**
1. Commit and push your changes
2. Deploy to Railway - the new configuration should work

### Solution 2: Use PostgreSQL (Most Reliable for Production)
For production deployments, PostgreSQL is more reliable than SQLite.

**Setup:**
1. Add a PostgreSQL database to your Railway project
2. Set the `DATABASE_URL` environment variable in Railway
3. The app will automatically use PostgreSQL when `DATABASE_URL` is available

**Environment Variables to Set in Railway:**
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### Solution 3: Alternative Railway Configuration
If you prefer to stick with the original sqlite3, you can use this alternative approach:

**Update railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm rebuild sqlite3 && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Testing Locally

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Test the build:**
   ```bash
   npm run build
   ```

3. **Test locally:**
   ```bash
   npm run dev
   ```

## Deployment Commands

**For Railway:**
```bash
# The deployment will automatically:
# 1. Install dependencies
# 2. Rebuild better-sqlite3 binaries
# 3. Build TypeScript
# 4. Start the application
```

**Manual deployment steps:**
```bash
cd backend
npm install
npm run rebuild  # Rebuild native binaries
npm run build    # Build TypeScript
npm start        # Start the application
```

## Troubleshooting

### If you still get binary errors:
1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Force rebuild:**
   ```bash
   npm run rebuild
   ```

3. **Check your Node.js version:**
   ```bash
   node --version
   ```
   Make sure it matches your deployment environment (Node.js 18.x)

### If you want to use PostgreSQL:
1. Add PostgreSQL service to your Railway project
2. Set the `DATABASE_URL` environment variable
3. The app will automatically switch to PostgreSQL

## Environment Variables

**Required for Railway:**
- `PORT` (automatically set by Railway)
- `NODE_ENV=production`

**Optional:**
- `DATABASE_URL` (for PostgreSQL)
- `USE_POSTGRES=true` (force PostgreSQL usage)

## Database Migration

The new database configuration automatically:
- Creates SQLite tables if using SQLite
- Works with existing PostgreSQL schemas
- Handles both database types seamlessly

No manual migration is required - the app will work with either database type.
