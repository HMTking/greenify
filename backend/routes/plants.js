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

    let query = { isActive: true };

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.categories = { $in: [category] };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Filter by stock
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const plants = await Plant.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Plant.countDocuments(query);

    res.json({
      success: true,
      plants,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
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
    const { name, description, price, originalPrice, categories, stock, rating } = req.body;

    // Parse categories - handle comma-separated string or array
    let parsedCategories = [];
    if (categories) {
      if (Array.isArray(categories)) {
        parsedCategories = categories;
      } else if (typeof categories === 'string') {
        parsedCategories = categories.split(',').map(cat => cat.trim()).filter(cat => cat);
      }
    }

    const plantData = {
      name,
      description,
      price: Math.floor(Number(price)),
      originalPrice: originalPrice ? Math.floor(Number(originalPrice)) : undefined,
      categories: parsedCategories,
      stock: Number(stock),
      rating: rating ? Number(rating) : 5
    };

    if (req.file) {
      plantData.image = req.file.path; // Cloudinary returns the full URL in req.file.path
    }

    const plant = new Plant(plantData);
    console.log('Creating plant with data:', plantData);
    console.log('Plant before save:', plant);
    
    await plant.save();
    console.log('Plant after save:', plant);

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

    const { name, description, price, originalPrice, categories, stock, rating } = req.body;

    // Parse categories - handle comma-separated string or array
    let parsedCategories = plant.categories; // Keep existing if not provided
    if (categories) {
      if (Array.isArray(categories)) {
        parsedCategories = categories;
      } else if (typeof categories === 'string') {
        parsedCategories = categories.split(',').map(cat => cat.trim()).filter(cat => cat);
      }
    }

    plant.name = name || plant.name;
    plant.description = description || plant.description;
    plant.price = price ? Math.floor(Number(price)) : plant.price;
    plant.originalPrice = originalPrice ? Math.floor(Number(originalPrice)) : plant.originalPrice;
    plant.categories = parsedCategories;
    plant.stock = stock !== undefined ? Number(stock) : plant.stock;
    plant.rating = rating ? Number(rating) : plant.rating;

    if (req.file) {
      plant.image = req.file.path; // Cloudinary returns the full URL in req.file.path
    }

    console.log('Updating plant:', plant.plantId, 'with data:', {
      name: plant.name,
      price: plant.price,
      categories: plant.categories
    });

    await plant.save();

    console.log('Plant updated successfully:', plant.plantId);

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
    const totalPlants = await Plant.countDocuments({ isActive: true });
    const inStockPlants = await Plant.countDocuments({ isActive: true, stock: { $gt: 0 } });
    const outOfStockPlants = await Plant.countDocuments({ isActive: true, stock: 0 });
    
    res.json({
      success: true,
      stats: {
        totalPlants,
        inStockPlants,
        outOfStockPlants
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
