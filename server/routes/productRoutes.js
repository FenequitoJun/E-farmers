import express from 'express';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { BuyerRequest } from '../models/BuyerRequest.js';
import { Notification } from '../models/Notification.js';
import { protect, requireFarmer } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with search, filter, and sorting
router.get('/', async (req, res) => {
  try {
    const { q, category, location, maxPrice, availability, inStock, sort, farmerId } = req.query;

    const query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { desc: { $regex: q, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      query.price = { $lte: Number(maxPrice) };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (availability === 'available') {
      query.harvestDate = { $lte: today };
    } else if (availability === 'preorder') {
      query.harvestDate = { $gt: today };
    }

    if (inStock === 'true' || inStock === true) {
      query.qty = { $gt: 0 };
    }

    if (farmerId) {
      query.farmer = farmerId;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };

    let products = await Product.find(query)
      .populate('farmer', 'name contact location email')
      .sort(sortOption)
      .lean();

    // Attach product ratings
    const productIds = products.map((p) => p._id);
    const reviews = await Review.find({ product: { $in: productIds } }).lean();

    products = products.map((p) => {
      const pReviews = reviews.filter((r) => String(r.product) === String(p._id));
      const avgRating = pReviews.length
        ? pReviews.reduce((sum, r) => sum + r.stars, 0) / pReviews.length
        : null;
      return {
        ...p,
        avgRating,
        reviewCount: pReviews.length,
      };
    });

    if (sort === 'rating') {
      products.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name contact location email createdAt')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id })
      .populate('buyer', 'name location')
      .sort({ createdAt: -1 })
      .lean();

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
      : null;

    // Also get farmer's overall rating
    const farmerReviews = await Review.find({ farmer: product.farmer._id }).lean();
    const farmerAvgRating = farmerReviews.length
      ? farmerReviews.reduce((sum, r) => sum + r.stars, 0) / farmerReviews.length
      : null;

    res.json({
      ...product,
      reviews,
      avgRating,
      reviewCount: reviews.length,
      farmerAvgRating,
      farmerReviewCount: farmerReviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create a new product listing (Farmer only)
router.post('/', protect, requireFarmer, async (req, res) => {
  try {
    const { name, category, harvestDate, qty, unit, price, location, desc } = req.body;

    if (!name || !harvestDate || !qty || qty < 1 || price === undefined || !location) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const product = await Product.create({
      farmer: req.user._id,
      name,
      category: category || 'Vegetables',
      harvestDate,
      qty: Number(qty),
      unit: unit || 'kg',
      price: Number(price),
      location: location || req.user.location,
      desc: desc || '',
    });

    // Check for matching buyer requests and notify them
    try {
      const requests = await BuyerRequest.find({});
      for (const r of requests) {
        const words = (r.product || '').toLowerCase().split(' ').filter(Boolean);
        const nameLower = name.toLowerCase();
        const matchesName = words.some((w) => nameLower.includes(w));
        const matchesCategory = r.category === category;

        if (matchesName || matchesCategory) {
          await Notification.create({
            user: r.buyer,
            text: `Product match: "${name}" was just listed — it matches your request for ${r.product}!`,
            type: 'product',
            link: 'market',
            linkId: product._id.toString(),
          });
        }
      }
    } catch (notifErr) {
      console.error('Error generating product match notification:', notifErr);
    }

    const populated = await Product.findById(product._id).populate('farmer', 'name location contact email');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product listing (Farmer only, owner only)
router.put('/:id', protect, requireFarmer, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this listing' });
    }

    const fields = ['name', 'category', 'harvestDate', 'qty', 'unit', 'price', 'location', 'desc'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    const updated = await Product.findById(product._id).populate('farmer', 'name location contact email');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product listing (Farmer only, owner only)
router.delete('/:id', protect, requireFarmer, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
