# CORS Configuration Guide

## Overview

The CORS (Cross-Origin Resource Sharing) configuration has been optimized to provide maximum flexibility while maintaining security. This guide explains how to configure CORS for different environments.

## Features

### ✅ **Optimized CORS Setup**

- **Environment-aware**: Automatically adapts to development and production
- **Flexible origins**: Support for multiple frontend URLs and patterns
- **Development-friendly**: Includes common development ports by default
- **Production-secure**: Strict origin checking for production environments
- **Dynamic checking**: Fallback pattern matching for deployment platforms

### 🔧 **Development Mode**

In development mode (NODE_ENV=development), the following origins are automatically allowed:

```javascript
// Default development origins
'http://localhost:3000',    // React default
'http://localhost:3001',    // React alternative
'http://localhost:5173',    // Vite default
'http://localhost:5174',    // Vite alternative
'http://localhost:5175',    // Vite alternative
'http://localhost:4173',    // Vite preview
'http://127.0.0.1:5173',    // Vite localhost alternative
'http://127.0.0.1:3000',    // React localhost alternative
```

### 🚀 **Production Mode**

In production mode (NODE_ENV=production), only explicitly configured origins are allowed.

## Environment Variables

### Primary Configuration

```bash
# Primary frontend URL (most common use case)
FRONTEND_URL=https://your-frontend-domain.com

# Node environment (affects CORS behavior)
NODE_ENV=production
```

### Advanced Configuration

```bash
# Multiple additional origins (comma-separated)
ADDITIONAL_ORIGINS=https://staging.yourapp.com,https://admin.yourapp.com

# Alternative: specify all production origins at once
PRODUCTION_ORIGINS=https://yourapp.com,https://www.yourapp.com,https://api.yourapp.com
```

## Usage Examples

### 1. Simple Single Frontend

```bash
# .env
NODE_ENV=production
FRONTEND_URL=https://myplantstore.vercel.app
```

### 2. Multiple Frontends/Domains

```bash
# .env
NODE_ENV=production
FRONTEND_URL=https://myplantstore.com
ADDITIONAL_ORIGINS=https://admin.myplantstore.com,https://staging.myplantstore.com
```

### 3. Deployment Platform Auto-Detection

If no origins are configured in production, the system automatically allows:

- Vercel apps (\*.vercel.app)
- Netlify apps (\*.netlify.app)
- Heroku apps (\*.herokuapp.com)
- Railway apps (\*.railway.app)
- Render apps (\*.render.com)

### 4. Development with Custom URL

```bash
# .env
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
ADDITIONAL_ORIGINS=http://localhost:8080
```

## CORS Options

The following CORS options are configured:

```javascript
{
  credentials: true,                    // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [                     // Comprehensive header support
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
    // ... more headers
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Content-Length'],
  optionsSuccessStatus: 200,           // Legacy browser support
  maxAge: 86400                        // 24-hour preflight cache
}
```

## Security Features

### ✅ **Development Security**

- Still validates origins, just more permissive
- Logs all allowed origins for transparency
- Prevents completely open CORS

### 🔒 **Production Security**

- Strict origin checking
- No wildcards or overly permissive patterns
- Explicit whitelist approach
- Pattern matching for known deployment platforms only

### 🛡️ **General Security**

- No `Access-Control-Allow-Origin: *` ever used
- Credentials properly handled
- Comprehensive header filtering
- Preflight request optimization

## Troubleshooting

### Common Issues

**1. Frontend can't connect in development:**

```bash
# Check if your dev server port is in the default list
# Or add it to FRONTEND_URL
FRONTEND_URL=http://localhost:3002
```

**2. Production deployment failing:**

```bash
# Make sure FRONTEND_URL is set correctly
FRONTEND_URL=https://your-actual-deployed-frontend.com
```

**3. Multiple domains not working:**

```bash
# Use ADDITIONAL_ORIGINS for extra domains
ADDITIONAL_ORIGINS=https://domain2.com,https://domain3.com
```

### Debug Information

The server logs detailed CORS information on startup:

```
🌐 CORS Configuration:
   Environment: production
   Credentials: true
   Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
   Max Age: 86400s
   Origins: 2 configured
     1. https://myplantstore.vercel.app
     2. https://admin.myplantstore.vercel.app
```

## Migration from Old CORS

If you were using the old hardcoded CORS configuration, simply:

1. Remove any hardcoded origins from your code
2. Set `FRONTEND_URL` in your environment variables
3. The new system will handle the rest automatically

### Before (Old)

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
    ],
    // ... rest of config
  })
);
```

### After (New)

```javascript
// Automatically configured based on environment
const corsConfig = CORSManager.getCORSConfig();
app.use(cors(corsConfig));
```

## Benefits

1. **🔧 No more hardcoded URLs** - All configuration through environment variables
2. **🚀 Environment-aware** - Different behavior for dev/prod automatically
3. **📈 Scalable** - Easy to add new origins without code changes
4. **🛡️ Secure by default** - Strict production settings with flexible development
5. **🐛 Easy debugging** - Comprehensive logging and clear error messages
6. **⚡ Performance optimized** - Preflight caching and efficient origin checking
