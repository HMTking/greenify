// Order management API routes for creating and tracking customer orders
// Handles order placement, status updates, and admin order management functionality
const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Plant = require('../models/Plant');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/orders
// @desc Create new order with atomic stock deduction
// @access Private
router.post('/', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { deliveryAddress } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.plantId', 'name price stock')
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let total = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.plantId) {
        await session.abortTransaction();
        return res.status(400).json({ message: 'A plant in your cart is no longer available' });
      }

      const updated = await Plant.findOneAndUpdate(
        {
          _id: item.plantId._id,
          stock: { $gte: item.quantity },
          isActive: true,
        },
        { $inc: { stock: -item.quantity } },
        { new: true, session }
      );

      if (!updated) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Insufficient stock for "${item.plantId.name}". Available: ${item.plantId.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = item.plantId.price * item.quantity;
      total += itemTotal;
      orderItems.push({
        plantId: item.plantId._id,
        plantName: item.plantId.name,
        quantity: item.quantity,
        price: item.plantId.price
      });
    }

    const order = new Order({
      userId: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      items: orderItems,
      deliveryAddress,
      total,
      paymentMethod: 'COD'
    });

    await order.save({ session });
    await Cart.findOneAndDelete({ userId: req.user._id }).session(session);

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// @route GET /api/orders
// @desc Get user orders
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.plantId', 'name image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/orders/admin/all
// @desc Get all orders (Admin only)
// @access Private/Admin
router.get('/admin/all', auth, admin, async (req, res) => {
  try {
    // Set cache headers for better performance
    res.set({
      'Cache-Control': 'max-age=30', // Cache for 30 seconds
      'ETag': `orders-${Date.now()}`
    });

    const orders = await Order.find()
      .populate('items.plantId', 'name image')
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance since we don't need full mongoose documents

    res.json({
      success: true,
      orders,
      total: orders.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/orders/admin/stats
// @desc Get order statistics (Admin only)
// @access Private/Admin
router.get('/admin/stats', auth, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue excluding cancelled orders
    const totalRevenue = await Order.aggregate([
      { 
        $match: { 
          status: { $ne: 'cancelled' } // Exclude cancelled orders from revenue
        } 
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentOrders = await Order.find()
      .populate('items.plantId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/orders/:id
// @desc Get single order
// @access Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.plantId', 'name image');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/orders/:id/cancel
// @desc Cancel order (Customer only - if order is pending)
// @access Private
router.put('/:id/cancel', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    order.status = 'cancelled';
    await order.save({ session });

    for (const item of order.items) {
      await Plant.findByIdAndUpdate(
        item.plantId,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// @route PUT /api/orders/:id/status
// @desc Update order status (Admin only)
// @access Private/Admin
router.put('/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
