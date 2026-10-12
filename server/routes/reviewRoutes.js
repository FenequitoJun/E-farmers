import express from 'express';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Notification } from '../models/Notification.js';
import { protect, requireBuyer } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/reviews
// @desc    Submit a review for a delivered order (Buyer only)
router.post('/', protect, requireBuyer, async (req, res) => {
  try {
    const { orderId, stars, text } = req.body;

    if (!orderId || !stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Valid star rating (1-5) and order ID are required' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this order' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Reviews can only be posted for delivered orders' });
    }

    if (order.reviewed) {
      return res.status(400).json({ message: 'Order has already been reviewed' });
    }

    const review = await Review.create({
      order: order._id,
      product: order.product,
      farmer: order.farmer,
      buyer: req.user._id,
      stars: Number(stars),
      text: text || 'No comment provided.',
    });

    order.reviewed = true;
    await order.save();

    // Notify farmer
    const starString = '★'.repeat(Number(stars));
    await Notification.create({
      user: order.farmer,
      text: `You received a ${starString} review on ${order.productName}!`,
      type: 'review',
      link: 'orders',
      linkId: order._id.toString(),
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('buyer', 'name location')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/reviews/farmer/:farmerId
// @desc    Get all reviews for a farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const reviews = await Review.find({ farmer: req.params.farmerId })
      .populate('buyer', 'name location')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
