# Frontend-Backend Routes Mapping

This document provides a comprehensive mapping of all frontend routes and their corresponding backend API endpoints.

## Backend API Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://greenify-backend-sygr.onrender.com/api`

---

## 🔐 Authentication Routes

### Frontend Pages: `/login`, `/register`, `/profile`

| Frontend Action | Method | Backend Endpoint        | Purpose               |
| --------------- | ------ | ----------------------- | --------------------- |
| Login           | POST   | `/auth/login`           | User authentication   |
| Register        | POST   | `/auth/register`        | User registration     |
| Get Profile     | GET    | `/auth/me`              | Get current user data |
| Update Profile  | PUT    | `/auth/profile`         | Update user profile   |
| Change Password | PUT    | `/auth/change-password` | Change user password  |

---

## 🌱 Plants Routes

### Frontend Pages: `/`, `/catalogue`, `/plants/:id`

| Frontend Action  | Method | Backend Endpoint          | Purpose                          |
| ---------------- | ------ | ------------------------- | -------------------------------- |
| Get All Plants   | GET    | `/plants`                 | Fetch plants with filters/search |
| Get Single Plant | GET    | `/plants/:id`             | Get plant details                |
| Get Categories   | GET    | `/plants/categories/list` | Get all plant categories         |
| Get Plant Stats  | GET    | `/plants/stats/count`     | Admin dashboard stats            |
| Create Plant     | POST   | `/plants`                 | Admin: Create new plant          |
| Update Plant     | PUT    | `/plants/:id`             | Admin: Update plant              |
| Delete Plant     | DELETE | `/plants/:id`             | Admin: Soft delete plant         |

**Query Parameters for `/plants`:**

- `search` - Search in name/description
- `category` - Filter by category
- `minPrice`/`maxPrice` - Price range
- `minRating` - Minimum rating
- `inStock` - Only in-stock items
- `sortBy` - Sort field (name, price, rating)
- `sortOrder` - asc/desc
- `page`/`limit` - Pagination

---

## 🛒 Cart Routes

### Frontend Pages: `/cart`

| Frontend Action | Method | Backend Endpoint        | Purpose               |
| --------------- | ------ | ----------------------- | --------------------- |
| Get Cart        | GET    | `/cart`                 | Get user's cart       |
| Add to Cart     | POST   | `/cart/add`             | Add item to cart      |
| Update Quantity | PUT    | `/cart/update/:plantId` | Update item quantity  |
| Remove Item     | DELETE | `/cart/remove/:plantId` | Remove item from cart |
| Clear Cart      | DELETE | `/cart/clear`           | Clear entire cart     |

---

## 📦 Orders Routes

### Frontend Pages: `/checkout`, `/orders`, `/admin/orders`

| Frontend Action  | Method | Backend Endpoint      | Purpose                    |
| ---------------- | ------ | --------------------- | -------------------------- |
| Create Order     | POST   | `/orders`             | Place new order            |
| Get User Orders  | GET    | `/orders`             | Get user's order history   |
| Get Single Order | GET    | `/orders/:id`         | Get order details          |
| Cancel Order     | PUT    | `/orders/:id/cancel`  | User: Cancel pending order |
| Get All Orders   | GET    | `/orders/admin/all`   | Admin: All orders          |
| Get Order Stats  | GET    | `/orders/admin/stats` | Admin: Order statistics    |
| Update Status    | PUT    | `/orders/:id/status`  | Admin: Update order status |

---

## ⭐ Ratings Routes

### Frontend Pages: `/orders` (Rating Modal)

| Frontend Action     | Method | Backend Endpoint                           | Purpose                        |
| ------------------- | ------ | ------------------------------------------ | ------------------------------ |
| Submit Rating       | POST   | `/ratings`                                 | Submit/update plant rating     |
| Get Plant Ratings   | GET    | `/ratings/plant/:plantId`                  | Get all ratings for plant      |
| Get User Rating     | GET    | `/ratings/user/existing/:orderId/:plantId` | Get user's existing rating     |
| Get Eligible Plants | GET    | `/ratings/user/eligible/:orderId`          | Get plants eligible for rating |

---

## 🤖 AI Chat Routes

### Frontend Pages: `/plant-care-ai`

| Frontend Action | Method | Backend Endpoint              | Purpose                          |
| --------------- | ------ | ----------------------------- | -------------------------------- |
| Send Message    | POST   | `/ai-chat/message`            | Send message to AI assistant     |
| Clear Session   | DELETE | `/ai-chat/session/:sessionId` | Clear chat session               |
| Get Sessions    | GET    | `/ai-chat/sessions`           | Get active sessions (monitoring) |

---

## 👨‍💼 Admin Routes

### Frontend Pages: `/admin/dashboard`, `/admin/plants`, `/admin/orders`

Admin routes use the same endpoints as regular users but with admin authentication middleware:

- **Plants Management**: All `/plants` endpoints with admin middleware
- **Orders Management**: All `/orders/admin/*` endpoints
- **Dashboard Stats**: `/plants/stats/count`, `/orders/admin/stats`

---

## 🔒 Authentication Middleware

### Protected Routes (require `auth` middleware):

- All `/cart/*` routes
- All `/orders/*` routes
- All `/ratings/*` routes
- `/auth/me`, `/auth/profile`, `/auth/change-password`

### Admin Routes (require `auth` + `admin` middleware):

- `POST`, `PUT`, `DELETE` on `/plants/*`
- All `/orders/admin/*` routes

---

## 🌐 CORS Configuration

The backend allows requests from:

- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev port)
- `https://greenify-frontend-chi.vercel.app` (Production frontend)
- Environment variable `FRONTEND_URL`

---

## 📱 Frontend Route Guards

### Public Routes:

- `/` (Home)
- `/catalogue` (Plant Catalogue)
- `/plants/:id` (Plant Details)
- `/login`, `/register`
- `/plant-care-ai`

### Protected Routes (require login):

- `/cart`, `/checkout`, `/orders`, `/profile`

### Admin Routes (require admin role):

- `/admin/dashboard`, `/admin/plants`, `/admin/orders`

---

## 🔧 Environment Variables

### Frontend (.env):

```bash
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env):

```bash
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
```

---

## ✅ Route Synchronization Status

All frontend routes are properly synchronized with backend endpoints:

- ✅ Authentication flows work correctly
- ✅ Plant CRUD operations are connected
- ✅ Cart management is functional
- ✅ Order processing works end-to-end
- ✅ Rating system is integrated
- ✅ AI chat functionality is connected
- ✅ Admin panels have proper API connections
- ✅ CORS is properly configured
- ✅ Route ordering prevents conflicts

The project has a well-structured API with proper separation of concerns and consistent naming conventions.
