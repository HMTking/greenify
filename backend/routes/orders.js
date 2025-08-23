const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Plant = require('../models/Plant');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/orders
// @desc Create new order
// @access Private
router.post('/', auth, async (req, res) => {
  try {
    const { deliveryAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.plantId', 'name price stock');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check stock availability for all items
    for (let item of cart.items) {
      if (!item.plantId || item.plantId.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.plantId?.name || 'unknown plant'}` 
        });
      }
    }

    // Calculate total and prepare order items
    let total = 0;
    const orderItems = cart.items.map(item => {
      const itemTotal = item.plantId.price * item.quantity;
      total += itemTotal;
      return {
        plantId: item.plantId._id,
        plantName: item.plantId.name,
        quantity: item.quantity,
        price: item.plantId.price
      };
    });

    // Create order
    const order = new Order({
      userId: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      items: orderItems,
      deliveryAddress,
      total,
      paymentMethod: 'COD'
    });

    await order.save();

    // Update plant stock
    for (let item of cart.items) {
      await Plant.findByIdAndUpdate(
        item.plantId._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear user's cart
    await Cart.findOneAndDelete({ userId: req.user._id });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// @route PUT /api/orders/:id/cancel
// @desc Cancel order (Customer only - if order is pending)
// @access Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order can be cancelled (only pending orders)
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot cancel order with status: ${order.status}` 
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();

    // Restore plant stock
    for (let item of order.items) {
      await Plant.findByIdAndUpdate(
        item.plantId,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

module.exports = router;
