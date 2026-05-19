# Greenify

Plant e-commerce platform built with the MERN stack.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, JWT, Cloudinary
- **Frontend:** React 18, Vite, React Router, React Hook Form, Redux Toolkit

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas account

### Installation

```bash
npm run install-all
```

### Environment Variables

**backend/.env**
```
NODE_ENV=development
PORT=10000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-secret>
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
PRODUCTION_ORIGINS=https://your-frontend-domain.vercel.app
```

**frontend/.env**
```
VITE_API_URL=http://localhost:10000/api
```

### Run Development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:10000

## API Endpoints

| Resource | Method | Path |
|----------|--------|------|
| Auth | POST | `/api/auth/register`, `/api/auth/login` |
| Auth | GET/PUT | `/api/auth/me`, `/api/auth/profile` |
| Plants | GET | `/api/plants`, `/api/plants/:id` |
| Plants | POST/PUT/DELETE | `/api/plants`, `/api/plants/:id` (Admin) |
| Cart | GET/POST/PUT/DELETE | `/api/cart/*` |
| Orders | GET/POST | `/api/orders`, `/api/orders/:id` |
| Orders | PUT | `/api/orders/:id/status` (Admin) |
| AI Chat | POST | `/api/ai-chat` |

## Deployment

- **Frontend:** Vercel (configured via `vercel.json`)
- **Backend:** Render (configured via `render.yaml`)

## Author

**Datt Patel** — [GitHub](https://github.com/HMTking) · [LinkedIn](https://www.linkedin.com/in/datt-patel-a312a5256/)
