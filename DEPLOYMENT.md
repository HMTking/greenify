# 🚀 Deployment Guide

This guide covers deploying the Mini Plant Store to Render (backend) and Vercel (frontend).

## Prerequisites

- [GitHub account](https://github.com) with your project repository
- [Render account](https://render.com) for backend deployment
- [Vercel account](https://vercel.com) for frontend deployment
- [MongoDB Atlas](https://cloud.mongodb.com) database
- [Cloudinary account](https://cloudinary.com) for image storage

## 📋 Pre-deployment Checklist

1. ✅ Ensure all environment variables are properly configured
2. ✅ Test the application locally
3. ✅ Commit and push all changes to GitHub
4. ✅ Update API URL in frontend environment variables for production

## 🔧 Backend Deployment (Render)

### Step 1: Create Web Service

1. Log into [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `mini-plant-store-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 2: Environment Variables

Add these environment variables in Render:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-plant-store
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
NODE_ENV=production
PORT=10000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### Step 3: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL: `https://your-app.onrender.com`

## 🎨 Frontend Deployment (Vercel)

### Step 1: Connect Repository

1. Log into [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Environment Variables

Add these environment variables in Vercel:

```
VITE_API_URL=https://your-backend-app.onrender.com/api
VITE_NODE_ENV=production
```

### Step 3: Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Note your frontend URL: `https://your-app.vercel.app`

## 🔄 Auto Deployment

Both Render and Vercel support automatic deployments:

- **Render**: Auto-deploys on pushes to main branch
- **Vercel**: Auto-deploys on pushes to main branch

## 🧪 Testing Deployment

### Backend Testing

```bash
# Test API health
curl https://your-backend-app.onrender.com/

# Test plants endpoint
curl https://your-backend-app.onrender.com/api/plants
```

### Frontend Testing

1. Visit your Vercel URL
2. Test user registration/login
3. Test plant browsing and cart functionality
4. Test admin features (if applicable)

## 🐛 Troubleshooting

### Common Backend Issues

1. **MongoDB Connection**: Ensure IP whitelist includes `0.0.0.0/0` in MongoDB Atlas
2. **Environment Variables**: Double-check all environment variables are set
3. **CORS Issues**: Ensure frontend URL is in CORS configuration

### Common Frontend Issues

1. **API Connection**: Verify `VITE_API_URL` points to correct backend URL
2. **Build Errors**: Check for ESLint errors and fix them
3. **Environment Variables**: Ensure all VITE\_ prefixed variables are set

## 📝 Post-Deployment Tasks

1. ✅ Update README.md with live demo links
2. ✅ Test all functionality on live site
3. ✅ Update any hardcoded URLs in the code
4. ✅ Monitor application logs for errors
5. ✅ Set up monitoring and alerts

## 🔒 Security Considerations

1. **Never commit `.env` files**
2. **Use strong JWT secrets in production**
3. **Enable MongoDB authentication**
4. **Use HTTPS only in production**
5. **Regularly update dependencies**

## 📱 Domain Configuration (Optional)

### Custom Domain for Frontend (Vercel)

1. Go to Vercel project settings
2. Add your custom domain
3. Configure DNS records as instructed

### Custom Domain for Backend (Render)

1. Go to Render service settings
2. Add your custom domain
3. Configure DNS records as instructed

---

🎉 **Congratulations! Your Mini Plant Store is now live!**
