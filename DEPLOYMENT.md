# Deployment Guide

## Backend Deployment on Render

1. **Environment Variables** - Set these in your Render dashboard:

   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-plant-store
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   PORT=5000
   ```

2. **Build Configuration**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`

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
