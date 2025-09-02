// Shopping cart API routes for managing user cart operations
// Handles adding/removing items, updating quantities and cart retrieval
const express = require('express');
const Cart = require('../models/Cart');
const Plant = require('../models/Plant');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/cart
// @desc Get user cart
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.plantId', 'name price image stock isActive');

    if (!cart || !cart.items.length) {
      return res.json({
        success: true,
        cart: { items: [], total: 0 }
      });
    }

    // Filter out inactive plants and calculate total
    const activeItems = cart.items.filter(item => item.plantId?.isActive);
    const total = activeItems.reduce((sum, item) => sum + (item.plantId.price * item.quantity), 0);

    res.json({
      success: true,
      cart: {
        items: activeItems,
        total: Math.floor(total)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/cart/add
// @desc Add item to cart
// @access Private
router.post('/add', auth, async (req, res) => {
  try {
    const { plantId, quantity = 1 } = req.body;

    // Check if plant exists and is active
    const plant = await Plant.findById(plantId);
    if (!plant || !plant.isActive) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    // Check stock availability
    if (plant.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId: req.user._id,
        items: [{ plantId, quantity: Number(quantity) }]
      });
    } else {
      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.plantId.toString() === plantId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + Number(quantity);
        
        if (plant.stock < newQuantity) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }
        
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        cart.items.push({ plantId, quantity: Number(quantity) });
      }
    }

    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findOne({ userId: req.user._id })
      .populate('items.plantId', 'name price image stock isActive');

    const total = updatedCart.items.reduce((sum, item) => {
      return sum + (item.plantId.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      message: 'Item added to cart',
      cart: {
        items: updatedCart.items,
        total: Math.floor(total)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/cart/update/:plantId
// @desc Update cart item quantity
// @access Private
router.put('/update/:plantId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { plantId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Check if plant exists and has enough stock
    const plant = await Plant.findById(plantId);
    if (!plant || !plant.isActive) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    if (plant.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.plantId.toString() === plantId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findOne({ userId: req.user._id })
      .populate('items.plantId', 'name price image stock isActive');

    const total = updatedCart.items.reduce((sum, item) => {
      return sum + (item.plantId.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      message: 'Cart updated',
      cart: {
        items: updatedCart.items,
        total: Math.floor(total)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/cart/remove/:plantId
// @desc Remove item from cart
// @access Private
router.delete('/remove/:plantId', auth, async (req, res) => {
  try {
    const { plantId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.plantId.toString() !== plantId
    );

    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findOne({ userId: req.user._id })
      .populate('items.plantId', 'name price image stock isActive');

    const total = updatedCart.items.reduce((sum, item) => {
      return sum + (item.plantId.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        items: updatedCart.items,
        total: Math.floor(total)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/cart/clear
// @desc Clear cart
// @access Private
router.delete('/clear', auth, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });

    res.json({
      success: true,
      message: 'Cart cleared',
      cart: { items: [], total: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
