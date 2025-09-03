// Enhanced Plant mongoose model with better validation and constants
const mongoose = require('mongoose');
const { PLANT_CATEGORIES, VALIDATION_LIMITS } = require('../utils/constants');

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
    required: [true, 'Plant name is required'],
    trim: true,
    minlength: [2, 'Plant name must be at least 2 characters long'],
    maxlength: [100, 'Plant name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Plant description is required'],
    minlength: [VALIDATION_LIMITS.DESCRIPTION.MIN, `Description must be at least ${VALIDATION_LIMITS.DESCRIPTION.MIN} characters long`],
    maxlength: [VALIDATION_LIMITS.DESCRIPTION.MAX, `Description cannot exceed ${VALIDATION_LIMITS.DESCRIPTION.MAX} characters`]
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [VALIDATION_LIMITS.PRICE.MIN, `Price must be at least ₹${VALIDATION_LIMITS.PRICE.MIN}`],
    max: [VALIDATION_LIMITS.PRICE.MAX, `Price cannot exceed ₹${VALIDATION_LIMITS.PRICE.MAX}`],
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Price must be an integer (no decimal places allowed)'
    }
  },
  originalPrice: {
    type: Number,
    min: [VALIDATION_LIMITS.PRICE.MIN, `Original price must be at least ₹${VALIDATION_LIMITS.PRICE.MIN}`],
    max: [VALIDATION_LIMITS.PRICE.MAX, `Original price cannot exceed ₹${VALIDATION_LIMITS.PRICE.MAX}`],
    validate: {
      validator: function(value) {
        return value === undefined || value === null || Number.isInteger(value);
      },
      message: 'Original price must be an integer (no decimal places allowed)'
    }
  },
  categories: {
    type: [{
      type: String,
      enum: {
        values: PLANT_CATEGORIES,
        message: 'Invalid category. Must be one of: ' + PLANT_CATEGORIES.join(', ')
      }
    }],
    validate: {
      validator: function(categories) {
        return categories && categories.length > 0;
      },
      message: 'At least one category is required'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [VALIDATION_LIMITS.STOCK.MIN, 'Stock cannot be negative'],
    max: [VALIDATION_LIMITS.STOCK.MAX, `Stock cannot exceed ${VALIDATION_LIMITS.STOCK.MAX}`],
    default: 0,
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Stock must be an integer'
    }
  },
  image: {
    type: String,
    default: '',
    validate: {
      validator: function(value) {
        if (!value) return true; // Allow empty strings
        // Basic URL validation
        return /^https?:\/\/.+/.test(value) || value.startsWith('/') || value.startsWith('./');
      },
      message: 'Image must be a valid URL or path'
    }
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0,
    validate: {
      validator: function(value) {
        return value === 0 || (value >= 1 && value <= 5);
      },
      message: 'Rating must be 0 or between 1 and 5'
    }
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Review count must be an integer'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Additional metadata
  careLevel: {
    type: String,
    enum: {
      values: ['Easy', 'Medium', 'Hard'],
      message: 'Care level must be Easy, Medium, or Hard'
    },
    default: 'Medium'
  },
  sunlight: {
    type: String,
    enum: {
      values: ['Full Sun', 'Partial Sun', 'Shade'],
      message: 'Sunlight requirement must be Full Sun, Partial Sun, or Shade'
    },
    default: 'Partial Sun'
  },
  waterFrequency: {
    type: String,
    enum: {
      values: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'],
      message: 'Water frequency must be Daily, Weekly, Bi-weekly, or Monthly'
    },
    default: 'Weekly'
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

// Virtual for discount percentage
plantSchema.virtual('discountPercentage').get(function() {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Virtual for stock status
plantSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'Out of Stock';
  if (this.stock <= 5) return 'Low Stock';
  return 'In Stock';
});

// Instance methods
plantSchema.methods.updateRating = async function(newRating, isNewReview = true) {
  if (isNewReview) {
    // Add new review
    const totalRating = (this.rating * this.reviewCount) + newRating;
    this.reviewCount += 1;
    this.rating = totalRating / this.reviewCount;
  } else {
    // Update existing review (this would need old rating to calculate correctly)
    // For now, just recalculate from all ratings
    // This should be called from the ratings service with proper calculation
  }
  
  // Round to 1 decimal place
  this.rating = Math.round(this.rating * 10) / 10;
  
  return this.save();
};

plantSchema.methods.updateStock = function(quantity, operation = 'decrease') {
  if (operation === 'decrease') {
    this.stock = Math.max(0, this.stock - quantity);
  } else if (operation === 'increase') {
    this.stock += quantity;
  }
  return this.save();
};

// Static methods
plantSchema.statics.findByCategory = function(category) {
  return this.find({ 
    categories: category, 
    isActive: true 
  }).sort({ createdAt: -1 });
};

plantSchema.statics.findInStock = function() {
  return this.find({ 
    stock: { $gt: 0 }, 
    isActive: true 
  }).sort({ stock: -1 });
};

plantSchema.statics.searchPlants = function(query, options = {}) {
  const searchCriteria = {
    isActive: true,
    $or: [
      { name: new RegExp(query, 'i') },
      { description: new RegExp(query, 'i') },
      { categories: new RegExp(query, 'i') }
    ]
  };

  // Add price filter if provided
  if (options.minPrice || options.maxPrice) {
    searchCriteria.price = {};
    if (options.minPrice) searchCriteria.price.$gte = options.minPrice;
    if (options.maxPrice) searchCriteria.price.$lte = options.maxPrice;
  }

  // Add category filter if provided
  if (options.category) {
    searchCriteria.categories = options.category;
  }

  let queryBuilder = this.find(searchCriteria);

  // Add sorting
  switch (options.sortBy) {
    case 'price_asc':
      queryBuilder = queryBuilder.sort({ price: 1 });
      break;
    case 'price_desc':
      queryBuilder = queryBuilder.sort({ price: -1 });
      break;
    case 'rating':
      queryBuilder = queryBuilder.sort({ rating: -1, reviewCount: -1 });
      break;
    case 'newest':
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
      break;
    default:
      queryBuilder = queryBuilder.sort({ name: 1 });
  }

  return queryBuilder;
};

// Ensure virtuals are included when converting to JSON
plantSchema.set('toJSON', { virtuals: true });
plantSchema.set('toObject', { virtuals: true });

// Create indexes for search and performance
plantSchema.index({ name: 'text', description: 'text' });
plantSchema.index({ categories: 1 }); // Index for category filtering
plantSchema.index({ createdAt: -1 }); // Index for sorting by creation date
plantSchema.index({ price: 1 }); // Index for price filtering
plantSchema.index({ rating: -1 }); // Index for rating sorting
plantSchema.index({ stock: 1 }); // Index for stock filtering
plantSchema.index({ isActive: 1 }); // Index for active status filtering

module.exports = mongoose.model('Plant', plantSchema);
