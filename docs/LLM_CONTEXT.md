# Greenify System Architecture & Audit Context

> **Document Purpose:** Single Source of Truth (SSOT) for downstream LLMs operating on this codebase.  
> **Last Updated:** 2026-05-18  
> **Stack:** React 18 (Vite) + Express.js 4 + MongoDB Atlas + Cloudinary + Google Gemini AI  
> **Deployment:** Frontend on Vercel, Backend on Render  

---

## 1. SYSTEM OVERVIEW & DETERMINISTIC FILE MAP

### 1.1 Complete Directory Tree

```
greenify/
├── backend/
│   ├── config/
│   │   └── cloudinary.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Plant.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   └── Rating.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── plants.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── ratings.js
│   │   └── ai-chat.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validation.js
│   │   └── corsConfig.js
│   ├── server.js
│   ├── admin-setup.js
│   ├── reset-admin.js
│   ├── test-server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── AdminRedirect.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── TestCredentials.jsx
│   │   │   └── common/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── CataloguePage.jsx
│   │   │   ├── PlantDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── PlantCareAI.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminPlants.jsx
│   │   │       └── AdminOrders.jsx
│   │   ├── store/
│   │   │   ├── index.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       └── cartSlice.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   └── useForm.js
│   │   ├── utils/
│   │   │   ├── api.js
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   ├── validation.js
│   │   │   └── update-axios.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── vite.config.js
│   ├── vercel.json
│   └── package.json
│
├── package.json              (root workspace with concurrently)
├── render.yaml               (Render deployment blueprint)
├── start-dev.sh
├── test-routes.sh
├── README.md
├── ROUTES_MAPPING.md
├── CORS_GUIDE.md
└── DEPLOYMENT.md
```

### 1.2 Structural Responsibility Map

#### Backend Layer Boundaries

| Path | Responsibility | Boundary Rule |
|------|---------------|---------------|
| `backend/server.js` | Express app initialization, middleware registration, route mounting, MongoDB connection. | NO business logic. Only wiring. |
| `backend/middleware/auth.js` | JWT verification (`auth`), admin role gate (`admin`), optional auth (`optionalAuth`). Attaches `req.user` via `.lean()` query. | NO data mutations. Only identity resolution and access control. |
| `backend/middleware/errorHandler.js` | Global error handler, `notFoundHandler`, `requestLogger`, `securityHeaders`. Formats Mongoose validation/duplicate/cast errors. | NO route-specific logic. Pure cross-cutting concerns. |
| `backend/models/*.js` | Mongoose schemas, virtuals, instance methods, static query methods, pre-save hooks, index definitions. | ALL data validation and domain invariants live here. No HTTP awareness. |
| `backend/routes/*.js` | Express Router handlers. Orchestrate request parsing, model calls, and response formatting. | Business orchestration layer. Must NOT contain raw Mongoose queries outside of model static methods. Must use `ResponseUtils` for all HTTP responses. |
| `backend/utils/constants.js` | Centralized enums: `HTTP_STATUS`, `USER_ROLES`, `ORDER_STATUS`, `PLANT_CATEGORIES`, `VALIDATION_PATTERNS`, `VALIDATION_LIMITS`, `CORS_CONFIG`, `JWT_CONFIG`, `FILE_CONFIG`, `PAGINATION`. | Immutable. All magic values must reference this file. |
| `backend/utils/helpers.js` | `ResponseUtils` (success, error, validation, unauthorized, forbidden, conflict, asyncHandler), `UtilityHelpers` (sanitize, pagination, format). | Stateless utilities only. |
| `backend/utils/validation.js` | Input validation functions using patterns from `constants.js`. | Stateless. Used in route handlers before model calls. |
| `backend/utils/corsConfig.js` | `CORSManager` class: environment-aware origin resolution, dynamic origin checker for production with pattern matching (Vercel, Netlify, Heroku, Railway, Render). | CORS policy lives here exclusively. |
| `backend/config/cloudinary.js` | Cloudinary SDK + multer-storage-cloudinary configuration. | Image pipeline only. |

#### Frontend Layer Boundaries

| Path | Responsibility | Boundary Rule |
|------|---------------|---------------|
| `frontend/src/App.jsx` | Route definitions using React Router v6. Wraps in `<Provider>` (Redux) and `<BrowserRouter>`. Conditional layout (hides footer on AI page). | NO business logic. Only routing topology and layout shell. |
| `frontend/src/App.css` | Global styles: reset, `.container`, `.btn-*`, `.form-*`, grid utilities, responsive breakpoints, animations, utility classes. | All global CSS. Page-specific styles go in co-located `.css` files. |
| `frontend/src/components/*.jsx` | Presentational and guard components. `PrivateRoute` checks auth state. `AdminRoute` checks admin role. `AdminRedirect` prevents admin from accessing customer pages. | NO API calls. NO direct Redux dispatch. Receive props or read store via hooks. |
| `frontend/src/pages/*.jsx` | Page-level components. Own their data fetching (via hooks or thunks), state management interaction, and page-specific CSS. | Each page owns its CSS file. Business logic delegated to hooks and slices. |
| `frontend/src/store/index.js` | Redux Toolkit `configureStore` combining `authReducer` and `cartReducer`. | NO thunks defined here. Store shape only. |
| `frontend/src/store/slices/authSlice.js` | Auth state: user object, token, loading, error. Async thunks for login, register, profile fetch, profile update, password change. | ALL auth API calls live here as thunks. |
| `frontend/src/store/slices/cartSlice.js` | Cart state: items array, loading, error. Async thunks for fetch, add, update quantity, remove, clear. | ALL cart API calls live here as thunks. |
| `frontend/src/hooks/useAuth.js` | Custom hook wrapping auth slice dispatch + selectors. Provides `login`, `register`, `logout`, `updateProfile`. | Thin orchestration over Redux. No raw API calls. |
| `frontend/src/hooks/useCart.js` | Custom hook wrapping cart slice dispatch + selectors. | Thin orchestration over Redux. No raw API calls. |
| `frontend/src/hooks/useForm.js` | Generic form state management: field values, errors, touched, validation, submission. | Stateless form logic. No API awareness. |
| `frontend/src/utils/api.js` | Axios instance with `baseURL` from `VITE_API_URL`, request interceptor (Bearer token injection), response interceptor (401 handling, auto-redirect). Exports `apiHelpers` for file upload, download, health check, retry. | Single HTTP client. All API calls MUST use this instance. |
| `frontend/src/utils/constants.js` | Frontend-specific constants, endpoint paths, storage keys, error messages. | Mirrors backend constants where applicable. |
| `frontend/src/utils/helpers.js` | `UIUtils`, `ErrorUtils`, `StorageUtils`, `UtilityHelpers` (debounce, throttle, deepClone, slug). | Stateless. No React or Redux dependencies. |
| `frontend/src/utils/validation.js` | Client-side validation functions matching backend patterns. | Must stay in sync with `backend/utils/constants.js` patterns. |

### 1.3 API Route Map

```
Base URL: /api

/api/auth
  POST   /register          → Create user (public)
  POST   /login             → JWT issuance (public)
  GET    /me                → Current user profile (auth)
  PUT    /profile           → Update profile/address (auth)
  PUT    /change-password   → Change password (auth)

/api/plants
  GET    /                  → List plants (public, filterable, paginated)
  GET    /categories/list   → Category enum (public)
  GET    /stats/count       → Dashboard stats (auth + admin)
  GET    /:id               → Single plant (public)
  POST   /                  → Create plant (auth + admin, multipart)
  PUT    /:id               → Update plant (auth + admin, multipart)
  DELETE /:id               → Soft-delete plant (auth + admin)

/api/cart
  GET    /                  → User cart (auth)
  POST   /add              → Add item with stock check (auth)
  PUT    /update/:plantId  → Update quantity (auth)
  DELETE /remove/:plantId  → Remove item (auth)
  DELETE /clear            → Clear cart (auth)

/api/orders
  POST   /                  → Create order with stock deduction (auth)
  GET    /                  → User orders (auth)
  GET    /admin/all         → All orders (auth + admin)
  GET    /admin/stats       → Order statistics (auth + admin)
  GET    /:id               → Single order (auth)
  PUT    /:id/status        → Update status (auth + admin)
  PUT    /:id/cancel        → Cancel pending order (auth)

/api/ratings
  POST   /                  → Submit/update rating (auth)
  GET    /plant/:plantId    → Plant ratings (public)
  GET    /user/eligible/:orderId → Eligible items for rating (auth)

/api/ai-chat
  POST   /message           → Send to Google Gemini (public, supports image)
  DELETE /session/:sessionId → Clear AI session
  GET    /sessions          → List active AI sessions
```

### 1.4 Frontend Route Map

```
/                    → HomePage (AdminRedirect wrapper)
/catalogue           → CataloguePage (AdminRedirect wrapper)
/plant/:id           → PlantDetailPage (AdminRedirect wrapper)
/login               → LoginPage (public)
/register            → RegisterPage (public)
/plant-care-ai       → PlantCareAI (public, full-height layout)
/cart                → CartPage (AdminRedirect + PrivateRoute)
/checkout            → CheckoutPage (AdminRedirect + PrivateRoute)
/orders              → OrdersPage (AdminRedirect + PrivateRoute)
/profile             → ProfilePage (PrivateRoute)
/admin/dashboard     → AdminDashboard (AdminRoute)
/admin/plants        → AdminPlants (AdminRoute)
/admin/orders        → AdminOrders (AdminRoute)
```

### 1.5 Data Model Relationships

```
User (1) ←→ (1) Cart
User (1) ←→ (N) Order
User (1) ←→ (N) Rating
Plant (1) ←→ (N) Cart.items
Plant (1) ←→ (N) Order.items
Plant (1) ←→ (N) Rating
Order (1) ←→ (N) Order.items (embedded)
Counter (1:1 singleton) → Plant.plantId auto-increment (PLT-XXXXXX)
```

### 1.6 Authentication Flow

```
1. POST /api/auth/register → bcrypt hash (12 rounds) → save User → return JWT
2. POST /api/auth/login → find User → comparePassword() → sign JWT (30d expiry, HS256)
3. Client stores token in localStorage via StorageUtils
4. Axios request interceptor attaches "Bearer <token>" header
5. backend/middleware/auth.js verifies token → attaches req.user (.lean() projection, no password)
6. Axios response interceptor catches 401 → clears StorageUtils → redirects to /login
```

---

## 2. COMPREHENSIVE LOOPHOLE & ISSUE REGISTRY

### Issue A: Critical Failure in Mobile Responsiveness

#### Symptoms
- Layout degradation between 320px and 768px viewports
- Horizontal overflow causing unwanted scrolling on product grids and admin tables
- Touch targets below 44px minimum on action buttons in cart and order views
- Cumulative Layout Shift (CLS) from unsized images and font-loading flash
- Navigation hamburger overlap with page content on small screens
- Form inputs triggering iOS zoom due to `font-size < 16px` on focus

#### File-by-File Deterministic Solutions

**[`frontend/src/App.css`] -> Fixed-width grid declarations break below 768px -> Replace with fluid responsive system**

Current flaw: The `.grid.grid-cols-3` utility uses fixed column count without responsive adaptation. The `.container` max-width transitions cause content reflow.

```css
/* REPLACE existing grid utilities with fluid responsive grid */
.grid {
  display: grid;
  gap: 1.5rem;
  width: 100%;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1024px) {
  .grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
}

@media (max-width: 640px) {
  .grid-cols-3 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* Prevent CLS: enforce aspect ratios on image containers */
.plant-card-image,
.product-image-container {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  position: relative;
  background-color: #f0f0f0; /* placeholder color during load */
}

.plant-card-image img,
.product-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

/* Fluid typography to prevent layout shifts */
html {
  font-size: clamp(14px, 2.5vw, 16px);
}
```

**[`frontend/src/pages/HomePage.jsx` + `HomePage.css`] -> Hero section uses fixed heights and absolute positioning -> Convert to viewport-relative fluid layout**

```css
/* HomePage.css - Mobile-first hero */
.hero {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
}

.hero-content h1 {
  font-size: clamp(1.75rem, 5vw, 3rem);
  line-height: 1.2;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  margin-bottom: 1.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 480px) {
  .hero {
    min-height: 50vh;
    padding: 1.5rem 0.75rem;
  }
  
  .hero .btn-lg {
    width: 100%;
    max-width: 280px;
  }
}
```

**[`frontend/src/pages/CataloguePage.jsx`] -> Filter sidebar and product grid compete for horizontal space -> Convert to mobile bottom sheet pattern**

```jsx
// Mobile filter pattern: overlay bottom sheet on viewports < 768px
// Add state to CataloguePage:
const [filtersOpen, setFiltersOpen] = useState(false);

// Conditional rendering:
// Desktop: sidebar filter panel (existing layout)
// Mobile: fixed-bottom toggle button + slide-up panel

// CSS for mobile filter bottom sheet:
```
```css
/* CataloguePage.css additions */
@media (max-width: 768px) {
  .catalogue-layout {
    display: flex;
    flex-direction: column;
  }

  .filter-sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: white;
    border-radius: 1rem 1rem 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 70vh;
    overflow-y: auto;
    padding: 1.5rem;
    -webkit-overflow-scrolling: touch;
  }

  .filter-sidebar.open {
    transform: translateY(0);
  }

  .filter-toggle-btn {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    padding: 0.75rem 1.5rem;
    min-height: 48px;
    min-width: 120px;
    border-radius: 2rem;
    background: #22c55e;
    color: white;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  }

  .filter-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .filter-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding-bottom: 5rem; /* space for filter toggle */
  }
}

@media (max-width: 400px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
```

**[`frontend/src/pages/CartPage.jsx`] -> Table layout breaks on narrow viewports -> Convert to stacked card layout**

```css
/* CartPage.css - Mobile card adaptation */
@media (max-width: 768px) {
  .cart-table {
    display: none;
  }

  .cart-mobile-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .cart-mobile-item {
    display: grid;
    grid-template-columns: 80px 1fr;
    grid-template-rows: auto auto;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    background: white;
  }

  .cart-mobile-item__image {
    grid-row: 1 / 3;
    aspect-ratio: 1;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .cart-mobile-item__details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .cart-mobile-item__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .quantity-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .quantity-control button {
    min-width: 36px;
    min-height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (min-width: 769px) {
  .cart-mobile-list {
    display: none;
  }
}
```

**[`frontend/src/pages/admin/AdminDashboard.jsx`] -> Stats cards and data tables overflow on mobile -> Horizontal scroll containers + responsive cards**

```css
/* AdminDashboard.css - Mobile adaptations */
@media (max-width: 768px) {
  .admin-stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .admin-stats-card {
    padding: 1rem;
  }

  .admin-stats-card h3 {
    font-size: 0.75rem;
  }

  .admin-stats-card .stat-value {
    font-size: 1.25rem;
  }

  .admin-table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0 -0.75rem;
    padding: 0 0.75rem;
  }

  .admin-table {
    min-width: 600px;
    font-size: 0.85rem;
  }

  .admin-table th,
  .admin-table td {
    padding: 0.5rem 0.75rem;
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .admin-stats-grid {
    grid-template-columns: 1fr;
  }
}
```

**[`frontend/src/components/Navbar.jsx`] -> Desktop nav items overflow on mobile -> Implement hamburger menu with slide-in drawer**

```css
/* Navbar mobile pattern */
@media (max-width: 768px) {
  .nav-links {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 280px;
    max-width: 80vw;
    background: white;
    flex-direction: column;
    padding: 5rem 1.5rem 2rem;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    overflow-y: auto;
  }

  .nav-links.mobile-open {
    transform: translateX(0);
  }

  .nav-links a {
    padding: 0.75rem 0;
    font-size: 1.1rem;
    border-bottom: 1px solid #f3f4f6;
    min-height: 48px;
    display: flex;
    align-items: center;
  }

  .hamburger-btn {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 0.5rem;
    min-width: 44px;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1002;
  }

  .hamburger-btn span {
    width: 24px;
    height: 2px;
    background: #1f2937;
    transition: all 0.3s ease;
  }

  .mobile-nav-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .mobile-nav-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }
}

@media (min-width: 769px) {
  .hamburger-btn,
  .mobile-nav-overlay {
    display: none;
  }
}
```

**[Global] -> Image loading without dimensions causes CLS -> Implement lazy loading with aspect-ratio reservation**

```jsx
// Create: frontend/src/components/common/OptimizedImage.jsx
import { useState, useRef, useEffect, memo } from 'react';

const OptimizedImage = memo(({ src, alt, aspectRatio = '4/3', className = '' }) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className={`optimized-image-wrapper ${className}`}
      style={{ aspectRatio, position: 'relative', overflow: 'hidden', backgroundColor: '#f3f4f6' }}
    >
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
    </div>
  );
});

export default OptimizedImage;
```

**[`frontend/src/pages/CheckoutPage.jsx`] -> Form layout breaks on mobile, inputs too small for touch -> Full-width stacked form with proper touch targets**

```css
/* CheckoutPage.css - Mobile form */
@media (max-width: 768px) {
  .checkout-layout {
    flex-direction: column;
    gap: 1.5rem;
  }

  .checkout-form {
    order: 1;
  }

  .checkout-summary {
    order: 2;
    position: sticky;
    bottom: 0;
    background: white;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    z-index: 10;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .form-group {
    width: 100%;
  }

  .form-input,
  .form-select,
  .form-textarea {
    font-size: 16px; /* prevents iOS zoom */
    min-height: 48px;
    padding: 14px;
  }

  .btn-checkout {
    width: 100%;
    min-height: 52px;
    font-size: 1.1rem;
    position: sticky;
    bottom: 1rem;
  }
}
```

---

### Issue B: Backend Performance, Scalability & Resource Bottlenecks

#### Symptoms
- AI chat route (`/api/ai-chat/message`) blocks the event loop during multi-turn Gemini API calls with image processing
- MongoDB connection exhaustion under concurrent reads on `/api/plants` with complex aggregation queries
- No caching layer: repeated identical catalogue queries hit the database every time
- Image upload processing (Cloudinary) blocks request handling during multipart parsing
- Order creation with stock deduction has a race condition under concurrent purchases

#### File-by-File Deterministic Solutions

**[`backend/server.js`] -> No connection pool tuning for MongoDB -> Add explicit connection options**

```javascript
// REPLACE the mongoose.connect call with:
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 20,          // max concurrent connections
  minPoolSize: 5,           // keep warm connections
  maxIdleTimeMS: 30000,     // close idle connections after 30s
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  w: 'majority',
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Add connection event monitoring:
mongoose.connection.on('error', err => {
  console.error('MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting reconnect...');
});
```

**[`backend/routes/ai-chat.js`] -> Synchronous Gemini API call blocks event loop -> Implement async worker pattern with timeout and abort**

```javascript
// ai-chat.js - Non-blocking AI processing with timeout
const { AbortController } = require('abort-controller');

const AI_TIMEOUT_MS = 30000; // 30 second max for AI response

router.post('/message', async (req, res) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const { message, sessionId, image } = req.body;

    // Offload to microtask to prevent blocking
    const responsePromise = processAIMessage(message, sessionId, image, controller.signal);

    const result = await responsePromise;
    clearTimeout(timeoutId);

    return ResponseUtils.success(res, HTTP_STATUS.OK, 'AI response generated', result);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return ResponseUtils.error(res, HTTP_STATUS.GATEWAY_TIMEOUT,
        'AI response timed out. Please try a shorter query.');
    }
    throw error;
  }
});

async function processAIMessage(message, sessionId, image, signal) {
  // Process in separate async context
  return new Promise((resolve, reject) => {
    setImmediate(async () => {
      try {
        if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'));
        // ... existing Gemini API logic ...
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  });
}
```

**[`backend/routes/plants.js`] -> No caching on high-read catalogue endpoint -> Implement in-memory cache with TTL**

```javascript
// In-memory cache for catalogue (lightweight, no Redis dependency required)
// For production scale, replace with Redis cache-aside pattern below.

const NodeCache = require('node-cache'); // npm install node-cache
const plantCache = new NodeCache({
  stdTTL: 60,        // 60 second TTL
  checkperiod: 120,  // Check for expired keys every 120s
  maxKeys: 200,      // Prevent memory bloat
});

// Cache-aside pattern for GET /api/plants
router.get('/', async (req, res) => {
  const cacheKey = `plants:${JSON.stringify(req.query)}`;

  // Check cache first
  const cached = plantCache.get(cacheKey);
  if (cached) {
    return ResponseUtils.success(res, HTTP_STATUS.OK, 'Plants retrieved (cached)', cached);
  }

  // Cache miss: query database
  const result = await fetchPlantsFromDB(req.query);

  // Store in cache
  plantCache.set(cacheKey, result);

  return ResponseUtils.success(res, HTTP_STATUS.OK, 'Plants retrieved', result);
});

// Invalidate cache on write operations
function invalidatePlantCache() {
  plantCache.flushAll();
}

// Call invalidatePlantCache() in POST, PUT, DELETE handlers
```

**[Redis Cache-Aside Pattern - Production Grade]**

When Redis is introduced (recommended for multi-instance deployment):

```javascript
// backend/config/redis.js
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
  enableReadyCheck: true,
  connectTimeout: 10000,
});

redis.on('error', (err) => console.error('Redis error:', err));
redis.on('connect', () => console.log('Redis connected'));

module.exports = redis;
```

```javascript
// Cache-aside integration in routes/plants.js
const redis = require('../config/redis');

const CACHE_TTL = 120; // 2 minutes

async function getCachedOrFetch(key, fetchFn) {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch (err) {
    console.warn('Redis read failed, falling back to DB:', err.message);
  }

  const data = await fetchFn();

  // Write-behind: don't await cache write
  redis.setex(key, CACHE_TTL, JSON.stringify(data)).catch(() => {});

  return data;
}

// Cache invalidation on mutations
async function invalidatePattern(pattern) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}
```

**[`backend/routes/orders.js`] -> Race condition on stock deduction during concurrent order creation -> Use MongoDB atomic operations with optimistic concurrency**

```javascript
// REPLACE the stock deduction logic in order creation with atomic findOneAndUpdate:

async function createOrderWithAtomicStock(items) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const stockUpdates = [];

    for (const item of items) {
      // Atomic decrement with stock floor check
      const updated = await Plant.findOneAndUpdate(
        {
          _id: item.plantId,
          stock: { $gte: item.quantity }, // guard: only if sufficient
          isActive: true,
        },
        {
          $inc: { stock: -item.quantity },
        },
        {
          new: true,
          session,
        }
      );

      if (!updated) {
        await session.abortTransaction();
        const plant = await Plant.findById(item.plantId).lean();
        const available = plant ? plant.stock : 0;
        throw new Error(
          `Insufficient stock for "${plant?.name || item.plantId}". ` +
          `Requested: ${item.quantity}, Available: ${available}`
        );
      }

      stockUpdates.push(updated);
    }

    // All stock decrements succeeded, create the order
    const order = new Order({ /* ... order data ... */ });
    await order.save({ session });

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

**[`backend/models/Plant.js`] -> Missing compound indexes for common query patterns -> Add performance indexes**

```javascript
// Add after schema definition, before model export:

// Compound indexes for common query patterns
plantSchema.index({ categories: 1, price: 1 });                    // Filter by category + sort by price
plantSchema.index({ isActive: 1, categories: 1, createdAt: -1 });  // Active plants, category filter, newest first
plantSchema.index({ isActive: 1, rating: -1 });                    // Active plants sorted by rating
plantSchema.index({ isActive: 1, stock: 1 });                      // In-stock queries
plantSchema.index({ name: 'text', description: 'text' });          // Full-text search (if not already present)
plantSchema.index({ plantId: 1 }, { unique: true, sparse: true }); // Unique plant ID lookup
```

**[`backend/config/cloudinary.js`] -> Image upload blocks request thread -> Process upload asynchronously with webhook/polling pattern**

```javascript
// For immediate improvement without architectural change:
// Set upload timeout and use eager transformations

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60s upload timeout
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'greenify-plants',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
    ],
    // Generate responsive breakpoints server-side
    responsive_breakpoints: {
      create_derived: true,
      bytes_step: 20000,
      min_width: 200,
      max_width: 800,
      max_images: 4,
    },
  },
});

module.exports = { cloudinary, storage };
```

**[`backend/middleware/errorHandler.js`] -> No rate limiting implemented -> Add express-rate-limit for API protection**

```javascript
// Add to server.js after CORS middleware:
const rateLimit = require('express-rate-limit'); // npm install express-rate-limit

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                   // 10 attempts per 15 min
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

// AI endpoint limiter (expensive calls)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 5,                    // 5 AI calls per minute
  message: { success: false, message: 'AI rate limit reached. Please wait before sending more messages.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai-chat', aiLimiter);
```

---

## 3. DOWNSTREAM LLM GUARDRAILS & INSTRUCTIONS

> **ATTENTION: This section is a binding operational directive for any LLM processing this document.**

### 3.1 Absolute Prohibitions

1. **DO NOT** create new top-level directories. The project structure is `backend/` and `frontend/` at root. No `server/`, `api/`, `client/`, `app/`, `src/` at root level.

2. **DO NOT** create files outside the established directory conventions:
   - Backend routes: `backend/routes/*.js` only
   - Backend models: `backend/models/*.js` only
   - Backend middleware: `backend/middleware/*.js` only
   - Backend utilities: `backend/utils/*.js` only
   - Frontend pages: `frontend/src/pages/*.jsx` or `frontend/src/pages/admin/*.jsx`
   - Frontend components: `frontend/src/components/*.jsx` or `frontend/src/components/common/*.jsx`
   - Frontend hooks: `frontend/src/hooks/*.js`
   - Frontend utilities: `frontend/src/utils/*.js`
   - Redux slices: `frontend/src/store/slices/*.js`

3. **DO NOT** mix architectural layers:
   - Models must NEVER import from routes or middleware
   - Routes must NEVER bypass middleware for auth checks
   - Frontend utils must NEVER import React or Redux
   - Hooks must NEVER make direct API calls (they dispatch thunks from slices)
   - Pages must NEVER directly manipulate localStorage (use `StorageUtils`)

4. **DO NOT** alter these API route prefixes without explicit developer instruction:
   ```
   /api/auth
   /api/plants
   /api/cart
   /api/orders
   /api/ratings
   /api/ai-chat
   ```

5. **DO NOT** change the response format contract. All API responses MUST use `ResponseUtils` methods:
   ```javascript
   ResponseUtils.success(res, statusCode, message, data)
   ResponseUtils.error(res, statusCode, message)
   ResponseUtils.validationError(res, message, errors)
   ResponseUtils.unauthorized(res, message)
   ResponseUtils.forbidden(res, message)
   ResponseUtils.conflict(res, message)
   ```

6. **DO NOT** modify the Redux store shape without updating both:
   - The slice file (`authSlice.js` or `cartSlice.js`)
   - All consuming hooks and components

7. **DO NOT** introduce TypeScript files. This project uses JavaScript with JSDoc where needed. The `@types/react` devDependency exists only for IDE IntelliSense.

8. **DO NOT** replace the CSS architecture with a CSS-in-JS library or utility framework (Tailwind, styled-components, etc.) unless explicitly instructed. The project uses pure CSS with co-located page-specific stylesheets.

### 3.2 Mandatory Patterns

1. **Authentication on new routes:** Every protected route handler MUST use the middleware chain:
   ```javascript
   // Customer route:
   router.get('/endpoint', auth, handlerFn);
   // Admin route:
   router.get('/endpoint', auth, admin, handlerFn);
   ```

2. **New Mongoose models MUST:**
   - Define in `backend/models/` with PascalCase filename matching the model name
   - Include validation messages on all required fields
   - Export a single model: `module.exports = mongoose.model('Name', schema);`
   - Use constants from `backend/utils/constants.js` for enums and limits

3. **New frontend pages MUST:**
   - Be added to `frontend/src/App.jsx` route definitions
   - Include appropriate route guard (`PrivateRoute`, `AdminRoute`, `AdminRedirect`)
   - Have a co-located CSS file: `PageName.css` imported at the top
   - Use the `api` instance from `frontend/src/utils/api.js` for HTTP calls (via slice thunks)

4. **Error handling:** Backend route handlers MUST be wrapped in `ResponseUtils.asyncHandler()` or use explicit try/catch with `ResponseUtils.error()`.

5. **Environment variables:**
   - Backend: Access via `process.env.VARIABLE_NAME`
   - Frontend: Access via `import.meta.env.VITE_VARIABLE_NAME` (must be prefixed with `VITE_`)
   - New env vars MUST be documented in the respective `.env.example` file

6. **Validation flow:**
   ```
   Client validation (frontend/src/utils/validation.js)
     → Request sent
       → Server validation (backend/utils/validation.js or Mongoose schema validators)
         → Database constraints (unique indexes, type checks)
   ```
   All three layers must be maintained in sync.

### 3.3 Variable Scope & Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Backend constants | SCREAMING_SNAKE_CASE | `HTTP_STATUS`, `USER_ROLES` |
| Backend functions | camelCase | `asyncHandler`, `getErrorMessage` |
| Backend route files | lowercase kebab-case | `ai-chat.js` |
| Backend models | PascalCase | `Plant.js`, `User.js` |
| Frontend components | PascalCase | `AdminDashboard.jsx` |
| Frontend hooks | camelCase with `use` prefix | `useAuth.js`, `useCart.js` |
| Frontend utils | camelCase | `api.js`, `helpers.js` |
| Redux slices | camelCase with `Slice` suffix | `authSlice.js` |
| CSS classes | kebab-case | `.plant-card-image` |
| Environment variables | SCREAMING_SNAKE_CASE | `MONGO_URI`, `VITE_API_URL` |

### 3.4 Dependency Constraints

Do not add new npm packages without justification. The project intentionally avoids:
- CSS frameworks (Tailwind, Bootstrap) - uses custom CSS
- ORM layers over Mongoose - uses Mongoose directly
- Server-side rendering frameworks - this is a Vite SPA
- WebSocket libraries - the app uses REST exclusively
- Authentication libraries (Passport.js) - uses custom JWT implementation

### 3.5 Deployment Awareness

- **Frontend builds** produce static assets via `vite build` → `dist/` directory → served by Vercel CDN
- **Backend** is a single Node.js process on Render with no horizontal scaling unless manually configured
- **MongoDB Atlas** handles its own connection pooling; the application pool settings in `mongoose.connect()` control the driver-side pool
- **Cloudinary** is the ONLY image storage mechanism; do not introduce local file storage or alternative CDNs
- **CORS** is dynamically resolved; adding new deployment domains requires updating `CORS_CONFIG.DEVELOPMENT_ORIGINS` in constants or setting environment variables — NOT hardcoding in `corsConfig.js` pattern matchers

---

## 4. CRITICAL INVARIANTS SUMMARY

| Invariant | Enforcement Location |
|-----------|---------------------|
| All prices are integers (no decimals) | `Plant.price` Mongoose validator |
| Plant IDs follow `PLT-XXXXXX` format | `Plant.pre('save')` hook with Counter model |
| Passwords are never returned in API responses | `User.findById().select('-password')` in auth middleware |
| Orders cannot be cancelled after `shipped` status | `Order` route handler business logic |
| Cart is user-scoped (one cart per user) | `Cart` schema unique index on `user` field |
| Admin cannot access customer shopping routes | `AdminRedirect` component in frontend routing |
| Soft-delete: plants are deactivated, not removed | `isActive: false` flag, queries filter by `isActive: true` |
| JWT tokens expire in 30 days | `JWT_CONFIG.EXPIRES_IN` in constants |
| Maximum 50 items per paginated response | `VALIDATION_LIMITS.MAX_ITEMS_PER_PAGE` |
| Image uploads max 10MB, JPEG/PNG/WebP only | `FILE_CONFIG` in constants + Cloudinary params |
