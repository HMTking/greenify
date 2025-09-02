// Plant management API routes for CRUD operations and plant catalog
// Handles plant creation, updates, deletion with image upload and search functionality
const express = require('express');
const multer = require('multer');
const Plant = require('../models/Plant');
const { auth, admin } = require('../middleware/auth');
const { storage } = require('../config/cloudinary');

const router = express.Router();

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
router.get('/', async (req, res) => {
  try {
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
      if (minPrice) query.price.$gte = +minPrice;
      if (maxPrice) query.price.$lte = +maxPrice;
    }

    if (minRating) query.rating = { $gte: +minRating };
    if (inStock === 'true') query.stock = { $gt: 0 };

    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const limitNum = +limit;
    const skip = (+page - 1) * limitNum;

    const [plants, total] = await Promise.all([
      Plant.find(query).sort(sortOptions).limit(limitNum).skip(skip),
      Plant.countDocuments(query)
    ]);

    res.json({
      success: true,
      plants,
      pagination: {
        currentPage: +page,
        totalPages: Math.ceil(total / limitNum),
        totalPlants: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/plants/:id
// @desc Get single plant
// @access Public
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    
    if (!plant || !plant.isActive) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    res.json({
      success: true,
      plant
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/plants
// @desc Create new plant (Admin only)
// @access Private/Admin
router.post('/', auth, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, originalPrice, categories, stock } = req.body;

    // Parse categories
    const parsedCategories = categories 
      ? (Array.isArray(categories) ? categories : categories.split(',').map(cat => cat.trim()).filter(Boolean))
      : [];

    const plantData = {
      name,
      description,
      price: Math.floor(+price),
      originalPrice: originalPrice ? Math.floor(+originalPrice) : undefined,
      categories: parsedCategories,
      stock: +stock,
      rating: 0,
      reviewCount: 0
    };

    if (req.file) plantData.image = req.file.path;

    const plant = new Plant(plantData);
    
    await plant.save();

    res.status(201).json({
      success: true,
      plant
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/plants/:id
// @desc Update plant (Admin only)
// @access Private/Admin
router.put('/:id', auth, admin, upload.single('image'), async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    const { name, description, price, originalPrice, categories, stock } = req.body;

    // Parse categories
    const parsedCategories = categories 
      ? (Array.isArray(categories) ? categories : categories.split(',').map(cat => cat.trim()).filter(Boolean))
      : plant.categories;

    Object.assign(plant, {
      name: name || plant.name,
      description: description || plant.description,
      price: price ? Math.floor(+price) : plant.price,
      originalPrice: originalPrice ? Math.floor(+originalPrice) : plant.originalPrice,
      categories: parsedCategories,
      stock: stock !== undefined ? +stock : plant.stock
    });

    if (req.file) plant.image = req.file.path;

    await plant.save();

    res.json({
      success: true,
      plant
    });
  } catch (error) {
    console.error('Error updating plant:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route DELETE /api/plants/:id
// @desc Delete plant (Admin only)
// @access Private/Admin
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }

    plant.isActive = false;
    await plant.save();

    res.json({
      success: true,
      message: 'Plant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/plants/categories/list
// @desc Get all categories
// @access Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Plant.distinct('categories', { isActive: true });
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/plants/stats/count
// @desc Get total plant count for admin dashboard
// @access Public
router.get('/stats/count', async (req, res) => {
  try {
    const [totalPlants, inStockPlants, outOfStockPlants] = await Promise.all([
      Plant.countDocuments({ isActive: true }),
      Plant.countDocuments({ isActive: true, stock: { $gt: 0 } }),
      Plant.countDocuments({ isActive: true, stock: 0 })
    ]);
    
    res.json({
      success: true,
      stats: { totalPlants, inStockPlants, outOfStockPlants }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
