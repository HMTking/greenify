# 🌱 Mini Plant Store

A fast, responsive plant e-commerce application built with the MERN stack (MongoDB, Express.js, React, Node.js) using Vite and Cloudinary for image management.

## Deployed: greenify-frontend-seven.vercel.app

## ✨ Features

### Customer Features

- Browse plants with search and filtering
- View plant details with pricing and stock info
- Shopping cart management
- User authentication (register/login)
- Checkout with Cash on Delivery (COD)
- Order history and profile management

### Admin Features

- Admin dashboard with statistics
- Plant management (CRUD operations)
- Order management and status updates
- Cloud-based image upload for plants (Cloudinary)

## 🛠️ Tech Stack

### Backend

- **Node.js** + **Express.js** - Server and API
- **MongoDB Atlas** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage and optimization
- **Multer** - File upload handling
- **CORS** - Cross-Origin Resource Sharing

### Frontend

- **React 18** - UI Framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Context API** - State management
- **Regular CSS** - Styling (no framework)

## 🌐 Live Demo

- **Frontend**: [Deployed on Vercel](https://your-vercel-app.vercel.app)
- **Backend**: [Deployed on Render](https://your-render-app.onrender.com)

## 📁 Project Structure

```
mini-plant-store/
├── backend/
│   ├── config/           # Configuration files (Cloudinary)
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── server.js         # Entry point
│   └── .env              # Environment variables
└── frontend/
    ├── src/
    │   ├── components/   # Reusable components
    │   ├── pages/        # Page components
    │   ├── context/      # React Context providers
    │   ├── utils/        # Utility functions
    │   └── App.jsx       # Main app component
    ├── public/           # Static assets
    └── vercel.json       # Vercel deployment config
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB Atlas** account
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mini-plant-store
   ```

2. **Install all dependencies** (Recommended)

   ```bash
   npm run install-all
   ```

   **Or install manually:**

   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB Atlas connection string

   # Frontend environment
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your API URL
   ```

### Environment Variables

#### Backend (.env)

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-plant-store
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
PORT=5000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

#### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy using the `render.yaml` configuration

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy using the `vercel.json` configuration

### Running the Application

**Option 1: Run both servers simultaneously (Recommended)**

```bash
npm run dev
```

**Option 2: Run servers separately**

1. **Start the Backend** (Terminal 1)

   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend** (Terminal 2)

   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📊 Database Schema

### Users Collection

- User authentication and profile information
- Roles: 'customer' | 'admin'
- Address information for delivery

### Plants Collection

- Plant details (name, description, price, categories)
- Stock management
- Image storage
- Rating system (1-5 stars)

### Orders Collection

- Customer orders with items and delivery details
- Order status tracking
- Cash on Delivery (COD) payment method

### Cart Collection

- User shopping cart management
- Item quantities and plant references

## 🛣️ API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Plants

- `GET /api/plants` - Get all plants (with filtering)
- `GET /api/plants/:id` - Get single plant
- `POST /api/plants` - Create plant (Admin)
- `PUT /api/plants/:id` - Update plant (Admin)
- `DELETE /api/plants/:id` - Delete plant (Admin)

### Cart

- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:plantId` - Update cart item
- `DELETE /api/cart/remove/:plantId` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

## 🎨 Design Features

- **Responsive Design** - Mobile-first approach
- **Clean UI** - Simple and intuitive interface
- **Fast Loading** - Optimized images and minimal CSS
- **Accessibility** - Semantic HTML and keyboard navigation
- **Modern Styling** - CSS Grid, Flexbox, and transitions

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected routes (Private/Admin)
- Input validation and sanitization
- CORS configuration

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px

## 👨‍💻 Developer

**Datt Patel**  
_Full Stack Developer_

🎓 **Education**: Indian Institute of Information Technology, Surat  
🏆 **Achievements**:

- GATE All India Rank 387 (Computer Science)
- GATE All India Rank 877 (Data Science & Artificial Intelligence)

📧 **Contact**: [dattpatel2020@gmail.com](mailto:dattpatel2020@gmail.com)  
💼 **LinkedIn**: [linkedin.com/in/datt-patel-a312a5256](https://www.linkedin.com/in/datt-patel-a312a5256/)  
💻 **GitHub**: [github.com/HMTking](https://github.com/HMTking)

_Built with ❤️ using the MERN stack_

---

**Happy Gardening! 🌱**
