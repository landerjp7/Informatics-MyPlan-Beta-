# Frontend Deployment Guide

## Manual Deployment to GitHub Pages

Since the automated gh-pages deployment is having issues on Windows, here's how to deploy manually:

### Step 1: Build the Frontend
```bash
cd frontend
npm run build
```

### Step 2: Enable GitHub Pages
1. Go to your GitHub repository: `https://github.com/landerjp7/Informatics-MyPlan-Beta-`
2. Click on "Settings"
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select "Deploy from a branch"
5. Choose "gh-pages" branch
6. Click "Save"

### Step 3: Create gh-pages Branch
```bash
# Create and switch to gh-pages branch
git checkout -b gh-pages

# Remove all files except dist
git rm -rf .
git checkout main -- frontend/dist
git mv frontend/dist/* .
rm -rf frontend

# Commit and push
git add .
git commit -m "Deploy frontend to GitHub Pages"
git push origin gh-pages

# Switch back to main
git checkout main
```

### Step 4: Your App Will Be Live At
`https://landerjp7.github.io/Informatics-MyPlan-Beta-`

## Alternative: Use Vercel (Recommended)

For easier deployment, consider using Vercel:

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Set the root directory to `frontend`
5. Deploy automatically

Your app will be live at: `https://your-app-name.vercel.app`

## Current Status

✅ **Backend**: Deployed to Railway at `https://informatics-myplan-beta-production-43aa.up.railway.app`  
✅ **Frontend**: Built successfully, ready for deployment  
✅ **API Configuration**: Updated to use Railway backend  

## Next Steps

1. Choose deployment method (GitHub Pages or Vercel)
2. Deploy frontend
3. Test the full application
4. Share your live app!
