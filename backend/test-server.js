const express = require('express');
const cors = require('cors');

const app = express();

// Simple CORS for testing
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Test server running' });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API working' });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
