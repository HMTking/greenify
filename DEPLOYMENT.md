# 🚀 PRODUCTION DEPLOYMENT GUIDE

## 🚨 CURRENT STATUS: Frontend Deployed, Backend Needs Deployment

Your frontend is live at: https://greenify-frontend-chi.vercel.app
**Issue**: Backend is running locally and needs to be deployed!

## IMMEDIATE SOLUTION STEPS:

### Step 1: Deploy Backend to Render

1. Go to [Render.com](https://render.com) and create account
2. Click "New" → "Web Service"
3. Connect GitHub repository: `HMTking/greenify`
4. Configure:
   - **Name**: `greenify-backend` (or any name)
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free tier (for testing)

### Step 2: Set Environment Variables on Render

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://dattpatel2020:Alpha%40123@cluster0.q254byc.mongodb.net/mini-plant-store
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production_CHANGE_THIS
PRODUCTION_ORIGINS=https://greenify-frontend-chi.vercel.app
CLOUDINARY_CLOUD_NAME=de2hye9hl
CLOUDINARY_API_KEY=165716258911393
CLOUDINARY_API_SECRET=x_02Q127Cx1JJFFt0yP2jKqL2ek
CLOUDINARY_URL=cloudinary://165716258911393:x_02Q127Cx1JJFFt0yP2jKqL2ek@de2hye9hl
GEMINI_API_KEY=AIzaSyDwZTsojnsSLzwGBSjV1MlpRKqPLIXELTc
```

### Step 3: Update Frontend Configuration

After backend deployment, you'll get a URL like: `https://greenify-backend-xyz.onrender.com`

Update the production environment file we created:

- File: `/frontend/.env.production`
- Content: `VITE_API_URL=https://YOUR_ACTUAL_RENDER_URL/api`

### Step 4: Redeploy Frontend

1. Commit these changes to GitHub
2. Vercel will auto-redeploy with new API URL
3. Your frontend will now connect to production backend

## ✅ WHAT WE'VE ALREADY FIXED:

- **CORS Configuration**: ✅ Updated to allow your Vercel domain
- **Environment Variables**: ✅ Configured for production
- **API Client**: ✅ Environment-aware configuration
- **Error Handling**: ✅ Production-ready
- **Validation**: ✅ All API endpoints fixed

## 🧪 TESTING AFTER DEPLOYMENT:

Visit https://greenify-frontend-chi.vercel.app and test:

1. ✅ Homepage loads
2. ✅ Plant catalog displays
3. ✅ User registration/login
4. ✅ Shopping cart functionality
5. ✅ Admin dashboard (login with admin credentials)
6. ✅ Plant management in admin panel

## 🔐 SECURITY RECOMMENDATIONS:

⚠️ **CRITICAL**: Change JWT_SECRET to a secure random string
⚠️ **Database**: Consider separate production database
⚠️ **Monitoring**: Set up error monitoring

## 📋 ALTERNATIVE QUICK TEST (5 minutes):

If you want to test immediately:

1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 5000`
3. Update `.env.production` with ngrok URL
4. Redeploy frontend

This will expose your local backend temporarily for testing!

## Frontend Deployment on Vercel

1. **Environment Variables** - Set this in your Vercel dashboard:

   ```
   VITE_API_URL=https://your-backend-domain.onrender.com/api
   ```

2. **Build Configuration**:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Critical Deployment Steps:

### Step 1: Deploy Backend First

1. Create a new service on Render
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Add all environment variables listed above
5. **IMPORTANT**: Leave `FRONTEND_URL` empty initially
6. Deploy and note the backend URL (e.g., `https://yourapp.onrender.com`)

### Step 2: Deploy Frontend

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=https://yourapp.onrender.com/api`
5. Deploy and note the frontend URL (e.g., `https://yourapp.vercel.app`)

### Step 3: Update Backend CORS

1. Go back to Render dashboard
2. Update `FRONTEND_URL` to your Vercel URL: `https://yourapp.vercel.app`
3. Redeploy the backend service

## Testing Deployment:

After deployment, test these features in order:

1. ✅ Homepage loads
2. ✅ Plant catalogue displays
3. ✅ User registration works
4. ✅ User login works
5. ✅ Adding plants to cart
6. ✅ Checkout process
7. ✅ Admin dashboard (if admin user exists)

## Important Notes:

1. **CORS Configuration**: The backend validates origins against `FRONTEND_URL`
2. **URL Format**:
   - `VITE_API_URL` should end with `/api`
   - `FRONTEND_URL` should NOT have trailing slash
3. **HTTPS**: Both services must use HTTPS in production
4. **API Calls**: All API calls now use the centralized configuration

## Troubleshooting:

### CORS Errors

```bash
# Check backend logs for:
"CORS blocked origin: https://yourfrontend.vercel.app"
"Allowed origins: ['https://correctfrontend.vercel.app']"
```

**Solution**: Ensure `FRONTEND_URL` exactly matches your Vercel domain

### API Connection Issues

- Verify `VITE_API_URL` in Vercel environment variables
- Test backend endpoint directly: `https://yourbackend.onrender.com/api`
- Check network tab in browser dev tools

### Environment Variables

- Backend: Check Render dashboard environment variables
- Frontend: Check Vercel dashboard environment variables
- Local: Create `.env` files as shown below

## Local Development Setup:

**Backend (.env)**:

```bash
NODE_ENV=development
MONGO_URI=mongodb+srv://your-username:password@cluster.mongodb.net/mini-plant-store
JWT_SECRET=your-local-jwt-secret-key
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_AI_API_KEY=your_google_ai_api_key
PORT=5000
```

**Frontend (.env.local)**:

```bash
VITE_API_URL=http://localhost:5000/api
```

## Pre-Deployment Checklist:

### Backend ✅

- [x] CORS configuration with environment variable
- [x] All routes use proper authentication middleware
- [x] Password change endpoint added
- [x] Environment variables documented
- [x] Error handling implemented

### Frontend ✅

- [x] Centralized API configuration
- [x] All axios calls updated to use API utility
- [x] Authentication interceptors configured
- [x] Environment variables configured
- [x] Error handling for API calls

### Additional Features Added:

- [x] Automatic token refresh handling
- [x] Request/response interceptors
- [x] Proper error handling with user feedback
- [x] Password change functionality
- [x] Admin routes protection
