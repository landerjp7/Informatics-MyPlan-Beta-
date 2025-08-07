# 🚀 Deployment Guide - UW Course Planner Beta

This guide will help you deploy both the frontend and backend of your UW Course Planner application.

## 📋 Prerequisites

- GitHub account
- Railway account (free at [railway.app](https://railway.app))
- Git installed on your computer

## 🎯 Deployment Steps

### **Step 1: Push to GitHub**

First, push your code to GitHub:

```bash
git push origin main
```

If you encounter authentication issues, you may need to:
- Create a Personal Access Token in GitHub Settings
- Or use GitHub CLI: `gh auth login`

### **Step 2: Deploy Backend to Railway**

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `landerjp7/Informatics-MyPlan-Beta-`

3. **Configure Deployment**
   - Railway will automatically detect it's a Node.js project
   - The `railway.json` file will configure the deployment
   - Set the root directory to `backend`

4. **Get Your Backend URL**
   - Once deployed, Railway will provide a URL like: `https://your-app-name.railway.app`
   - Copy this URL for the next step

### **Step 3: Update Frontend API URL**

1. **Go to your GitHub repository**
2. **Navigate to**: `frontend/src/App.tsx`
3. **Find all API calls** and update the base URL
4. **Replace**: `http://localhost:5000` with your Railway URL

### **Step 4: Deploy Frontend to GitHub Pages**

1. **Go to your repository settings**
   - Navigate to `Settings` → `Pages`
   - Under "Source", select "Deploy from a branch"
   - Choose `gh-pages` branch
   - Click "Save"

2. **Monitor Deployment**
   - Check the "Actions" tab to see deployment progress
   - Once complete, your frontend will be available at:
   - `https://landerjp7.github.io/Informatics-MyPlan-Beta/`

## 🔗 Your Application URLs

- **Frontend**: `https://landerjp7.github.io/Informatics-MyPlan-Beta/`
- **Backend API**: `https://your-railway-app.railway.app`
- **GitHub Repository**: `https://github.com/landerjp7/Informatics-MyPlan-Beta-`

## 🛠️ Manual API URL Update

If you need to update the API URL manually, replace all instances of:
```javascript
fetch('/api/...')
```

With:
```javascript
fetch('https://your-railway-app.railway.app/api/...')
```

## 📊 Monitoring

- **Frontend**: Check GitHub Actions for deployment status
- **Backend**: Monitor Railway dashboard for logs and performance
- **Health Check**: Visit `https://your-railway-app.railway.app/api/health`

## 🔧 Troubleshooting

### **Backend Issues**
- Check Railway logs for errors
- Verify the `start` script in `package.json`
- Ensure all dependencies are in `dependencies` (not `devDependencies`)

### **Frontend Issues**
- Check browser console for API errors
- Verify the API URL is correct
- Check GitHub Actions for build errors

### **Database Issues**
- Railway provides persistent storage
- The SQLite database will be created automatically
- Check logs for database connection errors

## 🎉 Success!

Once deployed, your full-stack application will be accessible to anyone with the URLs above. Users can:
- Register and login
- Browse courses and pathways
- Create and manage their course plans
- Access all features from anywhere in the world!

## 📞 Support

If you encounter issues:
1. Check the logs in Railway dashboard
2. Review GitHub Actions for frontend deployment
3. Test the health check endpoint
4. Verify all environment variables are set correctly
