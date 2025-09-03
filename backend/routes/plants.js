// Plant management API routes for CRUD operations and plant catalog
// Handles plant creation, updates, deletion with image upload and search functionality
const express = require('express');
const multer = require('multer');
const Plant = require('../models/Plant');
const { auth, admin } = require('../middleware/auth');
const { storage } = require('../config/cloudinary');
const { ResponseUtils } = require('../utils/helpers');
const ValidationUtils = require('../utils/validation');
const { HTTP_STATUS, VALIDATION_LIMITS } = require('../utils/constants');

const router = express.Router();

// Async handler utility function
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Multer configuration for Cloudinary image upload
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route GET /api/plants
// @desc Get all plants with filtering and search
// @access Public
const getAllPlants = asyncHandler(async (req, res) => {
  console.log('🌱 GET /api/plants called with query:', req.query);
  
  const { 
    search, 
    category, 
    minPrice, 
    maxPrice, 
    minRating,
    inStock, 
    sortBy = 'name',
    sortOrder = 'asc',
    page = 1,
    limit = 12
  } = req.query;

  // Validate page and limit parameters
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(
    Math.max(1, parseInt(limit)), 
    VALIDATION_LIMITS.MAX_ITEMS_PER_PAGE
  );

  const query = { isActive: true };

  // Build query object
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) query.categories = { $in: [category] };
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Math.max(0, parseInt(minPrice));
    if (maxPrice) query.price.$lte = Math.max(0, parseInt(maxPrice));
  }

  if (minRating) query.rating = { $gte: Math.max(0, parseInt(minRating)) };
  if (inStock === 'true') query.stock = { $gt: 0 };

  const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
  const skip = (pageNum - 1) * limitNum;

  const [plants, total] = await Promise.all([
    Plant.find(query).sort(sortOptions).limit(limitNum).skip(skip),
    Plant.countDocuments(query)
  ]);

  console.log('🌱 Found plants:', plants.length, 'Total in DB:', total);

  ResponseUtils.success(res, HTTP_STATUS.OK, 'Plants retrieved successfully', {
    plants,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalPlants: total,
      hasNext: skip + limitNum < total,
      hasPrev: pageNum > 1
    }
  });
});

router.get('/', getAllPlants);

// @route GET /api/plants/categories/list
// @desc Get all categories
// @access Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Plant.distinct('categories', { isActive: true });
  ResponseUtils.success(res, HTTP_STATUS.OK, 'Categories retrieved successfully', { categories });
});

router.get('/categories/list', getCategories);

// @route GET /api/plants/stats/count
// @desc Get total plant count for admin dashboard
// @access Public
const getPlantStats = asyncHandler(async (req, res) => {
  const [totalPlants, inStockPlants, outOfStockPlants] = await Promise.all([
    Plant.countDocuments({ isActive: true }),
    Plant.countDocuments({ isActive: true, stock: { $gt: 0 } }),
    Plant.countDocuments({ isActive: true, stock: 0 })
  ]);
  
  ResponseUtils.success(res, HTTP_STATUS.OK, 'Plant stats retrieved successfully', {
    stats: { 
      totalPlants, 
      inStockPlants, 
      outOfStockPlants,
      stockPercentage: totalPlants > 0 ? Math.round((inStockPlants / totalPlants) * 100) : 0
    }
  });
});

router.get('/stats/count', getPlantStats);

// @route GET /api/plants/:id
// @desc Get single plant
// @access Public
const getPlantById = asyncHandler(async (req, res) => {
  const validation = ValidationUtils.validateObjectId(req.params.id, 'Plant');
  if (!validation.isValid) {
    return ResponseUtils.error(res, validation.message, HTTP_STATUS.BAD_REQUEST);
  }

  const plant = await Plant.findById(req.params.id);
  
  if (!plant || !plant.isActive) {
    return ResponseUtils.error(res, 'Plant not found', HTTP_STATUS.NOT_FOUND);
  }

  ResponseUtils.success(res, HTTP_STATUS.OK, 'Plant retrieved successfully', { plant });
});

router.get('/:id', getPlantById);

// @route POST /api/plants
// @desc Create new plant (Admin only)
// @access Private/Admin
const createPlant = asyncHandler(async (req, res) => {
  const { name, description, price, originalPrice, categories, stock } = req.body;

  // Validate required fields
  const validation = ValidationUtils.validatePlantData(req.body);
  if (!validation.isValid) {
    return ResponseUtils.validationError(res, validation.errors);
  }

  // Parse categories
  const parsedCategories = categories 
    ? (Array.isArray(categories) ? categories : categories.split(',').map(cat => cat.trim()).filter(Boolean))
    : [];

  const plantData = {
    name: name.trim(),
    description: description.trim(),
    price: Math.floor(parseInt(price)),
    originalPrice: originalPrice ? Math.floor(parseInt(originalPrice)) : undefined,
    categories: parsedCategories,
    stock: parseInt(stock),
    rating: 0,
    reviewCount: 0
  };

  if (req.file) {
    plantData.image = req.file.path;
  }

  const plant = new Plant(plantData);
  await plant.save();

  ResponseUtils.success(res, HTTP_STATUS.CREATED, 'Plant created successfully', { plant });
});

router.post('/', auth, admin, upload.single('image'), createPlant);

// @route PUT /api/plants/:id
// @desc Update plant (Admin only)
// @access Private/Admin
const updatePlant = asyncHandler(async (req, res) => {
  if (!ValidationUtils.validateObjectId(req.params.id).isValid) {
    return ResponseUtils.error(res, 'Invalid plant ID format', HTTP_STATUS.BAD_REQUEST);
  }

  const plant = await Plant.findById(req.params.id);
  
  if (!plant) {
    return ResponseUtils.error(res, 'Plant not found', HTTP_STATUS.NOT_FOUND);
  }

  const { name, description, price, originalPrice, categories, stock } = req.body;

  // Only validate fields that are being updated
  const fieldsToUpdate = {};
  const validation = { isValid: true, errors: [] };

  if (name) {
    const nameValidation = ValidationUtils.validateName(name);
    if (!nameValidation.isValid) {
      validation.errors.push(nameValidation.message);
      validation.isValid = false;
    } else {
      fieldsToUpdate.name = nameValidation.value;
    }
  }

  if (description) {
    if (description.trim().length < 10 || description.trim().length > 1000) {
      validation.errors.push('Description must be between 10 and 1000 characters');
      validation.isValid = false;
    } else {
      fieldsToUpdate.description = description.trim();
    }
  }

  if (price) {
    const priceValidation = ValidationUtils.validatePrice(price);
    if (!priceValidation.isValid) {
      validation.errors.push(priceValidation.message);
      validation.isValid = false;
    } else {
      fieldsToUpdate.price = priceValidation.value;
    }
  }

  if (originalPrice) {
    const originalPriceValidation = ValidationUtils.validatePrice(originalPrice, false);
    if (!originalPriceValidation.isValid) {
      validation.errors.push(`Original ${originalPriceValidation.message.toLowerCase()}`);
      validation.isValid = false;
    } else {
      const currentPrice = fieldsToUpdate.price || plant.price;
      if (originalPriceValidation.value < currentPrice) {
        validation.errors.push('Original price must be greater than or equal to the current price');
        validation.isValid = false;
      } else {
        fieldsToUpdate.originalPrice = originalPriceValidation.value;
      }
    }
  }

  if (stock !== undefined) {
    const stockValidation = ValidationUtils.validateStock(stock);
    if (!stockValidation.isValid) {
      validation.errors.push(stockValidation.message);
      validation.isValid = false;
    } else {
      fieldsToUpdate.stock = stockValidation.value;
    }
  }

  if (categories) {
    const parsedCategories = Array.isArray(categories) 
      ? categories 
      : categories.split(',').map(cat => cat.trim()).filter(Boolean);
    
    if (parsedCategories.length === 0) {
      validation.errors.push('At least one category must be selected');
      validation.isValid = false;
    } else {
      fieldsToUpdate.categories = parsedCategories;
    }
  }

  if (!validation.isValid) {
    return ResponseUtils.validationError(res, validation.errors);
  }

  // Update plant with validated fields
  Object.assign(plant, fieldsToUpdate);
  
  if (req.file) {
    plant.image = req.file.path;
  }

  await plant.save();

  ResponseUtils.success(res, HTTP_STATUS.OK, 'Plant updated successfully', { plant });
});

router.put('/:id', auth, admin, upload.single('image'), updatePlant);

// @route DELETE /api/plants/:id
// @desc Delete plant (Admin only)
// @access Private/Admin
const deletePlant = asyncHandler(async (req, res) => {
  if (!ValidationUtils.validateObjectId(req.params.id).isValid) {
    return ResponseUtils.error(res, 'Invalid plant ID format', HTTP_STATUS.BAD_REQUEST);
  }

  const plant = await Plant.findById(req.params.id);
  
  if (!plant) {
    return ResponseUtils.error(res, 'Plant not found', HTTP_STATUS.NOT_FOUND);
  }

  // Soft delete by setting isActive to false
  plant.isActive = false;
  await plant.save();

  ResponseUtils.success(res, HTTP_STATUS.OK, 'Plant deleted successfully');
});

router.delete('/:id', auth, admin, deletePlant);

module.exports = router;
