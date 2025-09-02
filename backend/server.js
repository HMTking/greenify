const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plants', require('./routes/plants'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/ai-chat', require('./routes/ai-chat'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Mini Plant Store API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
