// Order mongoose model for managing customer orders and order tracking
// Defines order schema with customer details, items, delivery address and status
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  items: [{
    plantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      required: true
    },
    plantName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function(value) {
          return Number.isInteger(value);
        },
        message: 'Item price must be an integer (no decimal places allowed)'
      }
    },
    rated: {
      type: Boolean,
      default: false
    }
  }],
  deliveryAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'COD'
  },
  total: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Total amount must be an integer (no decimal places allowed)'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
