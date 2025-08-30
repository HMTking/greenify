// Rating model for customer reviews of purchased plants
// Stores individual ratings that customers give to plants they've bought and received
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plant',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
ratingSchema.index({ userId: 1, plantId: 1, orderId: 1 }, { unique: true });
ratingSchema.index({ plantId: 1, createdAt: -1 }); // For plant rating queries
ratingSchema.index({ userId: 1, createdAt: -1 }); // For user rating history

module.exports = mongoose.model('Rating', ratingSchema);
