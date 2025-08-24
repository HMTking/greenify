# 🎯 Pre-Deployment Checklist

## ✅ **Required Accounts & Services:**

### 1. GitHub Repository

- ✅ Repository: https://github.com/HMTking/greenify
- ✅ Latest code pushed with Cloudinary integration
- ✅ Clean project structure

### 2. Database (MongoDB Atlas)

- [ ] MongoDB Atlas account: https://cloud.mongodb.com
- [ ] Database cluster created
- [ ] Database user created with password
- [ ] IP whitelist set to 0.0.0.0/0 (allow all IPs)
- [ ] Connection string ready

### 3. Image Storage (Cloudinary)

- ✅ Cloudinary account with credentials:
  - Cloud Name: de2hye9hl
  - API Key: 165716258911393
  - API Secret: x_02Q127Cx1JJFFt0yP2jKqL2ek

### 4. Deployment Platforms

- [ ] Render account: https://render.com (for backend)
- [ ] Vercel account: https://vercel.com (for frontend)

## 📋 **Environment Variables Ready:**

### Backend (.env) Variables:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-plant-store
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
NODE_ENV=production
PORT=10000
CLOUDINARY_CLOUD_NAME=de2hye9hl
CLOUDINARY_API_KEY=165716258911393
CLOUDINARY_API_SECRET=x_02Q127Cx1JJFFt0yP2jKqL2ek
CLOUDINARY_URL=cloudinary://165716258911393:x_02Q127Cx1JJFFt0yP2jKqL2ek@de2hye9hl
```

### Frontend (.env) Variables:

```
VITE_API_URL=https://your-backend-app.onrender.com/api
VITE_NODE_ENV=production
```

---

**Ready to proceed? Let me know which step you'd like to start with!**
