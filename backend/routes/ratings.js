// Rating management API routes for customer reviews
// Handles rating submission for delivered orders and rating aggregation
const express = require('express');
const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const Order = require('../models/Order');
const Plant = require('../models/Plant');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/ratings
// @desc Submit rating for a plant in a delivered order
// @access Private
router.post('/', auth, async (req, res) => {
  try {
    const { plantId, orderId, rating } = req.body;
    const userId = req.user._id;

    // Input validation
    const validationError = validateRatingInput({ plantId, orderId, rating });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Single query to get order and validate ownership/status
    const order = await Order.findOne({
      _id: orderId,
      userId,
      status: 'delivered',
      'items.plantId': plantId
    });

    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found, not delivered, or plant not in order' 
      });
    }

    // Check if already rated - if so, update instead of create
    const existingRating = await Rating.findOne({ userId, plantId, orderId });
    
    let savedRating;
    if (existingRating) {
      // Update existing rating
      savedRating = await Rating.findByIdAndUpdate(
        existingRating._id,
        { rating },
        { new: true }
      );
    } else {
      // Create new rating and mark as rated in single transaction
      const session = await mongoose.startSession();
      await session.withTransaction(async () => {
        savedRating = await Rating.create([{
          userId,
          plantId,
          orderId,
          rating
        }], { session });

        await Order.updateOne(
          { _id: orderId, 'items.plantId': plantId },
          { $set: { 'items.$.rated': true } },
          { session }
        );
      });
      session.endSession();
      savedRating = savedRating[0];
    }

    // Recalculate plant rating asynchronously
    setImmediate(() => recalculatePlantRating(plantId));

    res.status(200).json({
      success: true,
      message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully',
      rating: savedRating,
      isUpdate: !!existingRating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validation helper function
function validateRatingInput({ plantId, orderId, rating }) {
  if (!plantId || !orderId) {
    return 'Plant ID and Order ID are required';
  }
  if (!rating || rating < 1 || rating > 5) {
    return 'Rating must be between 1 and 5';
  }
  if (!mongoose.Types.ObjectId.isValid(plantId)) {
    return 'Invalid plant ID';
  }
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return 'Invalid order ID';
  }
  return null;
}

// @route GET /api/ratings/plant/:plantId
// @desc Get all ratings for a plant
// @access Public
router.get('/plant/:plantId', async (req, res) => {
  try {
    const ratings = await Rating.find({ plantId: req.params.plantId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      ratings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/ratings/user/existing/:orderId/:plantId
// @desc Get existing rating for a specific order item
// @access Private
router.get('/user/existing/:orderId/:plantId', auth, async (req, res) => {
  try {
    const { orderId, plantId } = req.params;
    const userId = req.user._id;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(plantId) || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid plant ID or order ID' });
    }

    // Single query to validate order ownership and get rating
    const [order, existingRating] = await Promise.all([
      Order.findOne({ _id: orderId, userId }, '_id'),
      Rating.findOne({ userId, plantId, orderId })
    ]);

    if (!order) {
      return res.status(404).json({ message: 'Order not found or access denied' });
    }

    if (!existingRating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.json({
      success: true,
      rating: existingRating
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/ratings/user/eligible/:orderId
// @desc Get plants eligible for rating in an order
// @access Private
router.get('/user/eligible/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.plantId', 'name image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only show plants that can be rated (delivered order, not yet rated)
    const eligibleItems = [];
    
    if (order.status === 'delivered') {
      for (let item of order.items) {
        if (!item.rated) {
          eligibleItems.push({
            plantId: item.plantId._id,
            plantName: item.plantName,
            plantImage: item.plantId?.image,
            quantity: item.quantity
          });
        }
      }
    }

    res.json({
      success: true,
      eligibleItems,
      orderStatus: order.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to recalculate plant rating
async function recalculatePlantRating(plantId) {
  try {
    // Use simple find query instead of aggregation for better compatibility
    const ratings = await Rating.find({ plantId });
    
    const updateData = ratings.length > 0 
      ? { 
          rating: Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10,
          reviewCount: ratings.length 
        }
      : { rating: 0, reviewCount: 0 };

    await Plant.findByIdAndUpdate(plantId, updateData);
  } catch (error) {
    console.error('Error recalculating plant rating:', error);
  }
}

module.exports = router;
