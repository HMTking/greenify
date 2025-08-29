const mongoose = require('mongoose');

// Auto-increment counter schema for plant IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const plantSchema = new mongoose.Schema({
  plantId: {
    type: String,
    unique: true,
    sparse: true // Allow null during creation, but must be unique when present
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Price must be an integer (no decimal places allowed)'
    }
  },
  originalPrice: {
    type: Number,
    min: 0,
    validate: {
      validator: function(value) {
        return value === undefined || value === null || Number.isInteger(value);
      },
      message: 'Original price must be an integer (no decimal places allowed)'
    }
  },
  categories: [{
    type: String,
    enum: ['Indoor', 'Outdoor', 'Succulents', 'Flowering', 'Herbs', 'Trees']
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-generate unique Plant ID before saving
plantSchema.pre('save', async function(next) {
  // Only generate Plant ID for new documents that don't have one
  if (this.isNew && !this.plantId) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'plantId',
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      
      // Generate plant ID in format: PLT-000001, PLT-000002, etc.
      this.plantId = `PLT-${counter.sequence_value.toString().padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Create indexes for search and performance
plantSchema.index({ name: 'text', description: 'text' });
plantSchema.index({ categories: 1 }); // Index for category filtering
plantSchema.index({ createdAt: -1 }); // Index for sorting by creation date

module.exports = mongoose.model('Plant', plantSchema);
