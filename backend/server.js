const express = require('express');
const mongoose = require('mongoose');
// CORS (cross origin resource sharing) allows your frontend running on a different port/domain to make requests to your backend API.
const cors = require('cors');

// To load environment variables from a .env file into process.env.
const dotenv = require('dotenv');
// Load environment variables Example: process.env.MONGO_URI. If .env has MONGO_URI
dotenv.config();

// Express application instance.
const app = express();

// Middleware
// Applies the CORS middleware globally.
app.use(cors());

// Middleware to parse JSON request bodies.
// Example: if frontend sends { "name": "Plant" }, Express will parse it and put it in req.body.
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plants', require('./routes/plants'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Mini Plant Store API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
