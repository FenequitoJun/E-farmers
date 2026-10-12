import express from 'express';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { BuyerRequest } from '../models/BuyerRequest.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { Message } from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/stats/home
// @desc    Get public statistics for home hero
router.get('/home', async (req, res) => {
  try {
    const [farmers, listings, requests, orders] = await Promise.all([
      User.countDocuments({ role: 'farmer' }),
      Product.countDocuments({ qty: { $gt: 0 } }),
      BuyerRequest.countDocuments(),
      Order.countDocuments(),
    ]);

    res.json({
      farmers,
      listings,
      requests,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/stats/dashboard
// @desc    Get dashboard metrics for the authenticated user
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const isFarmer = req.user.role === 'farmer';

    const unreadMessages = await Message.countDocuments({
      to: userId,
      read: false,
    });

    if (isFarmer) {
      const [listings, openOrders, totalOrders, reviews] = await Promise.all([
        Product.countDocuments({ farmer: userId }),
        Order.countDocuments({ farmer: userId, status: { $ne: 'delivered' } }),
        Order.countDocuments({ farmer: userId }),
        Review.find({ farmer: userId }),
      ]);

      const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
        : null;

      res.json({
        listings,
        openOrders,
        totalOrders,
        avgRating,
        unreadMessages,
      });
    } else {
      const [activeOrders, totalOrders, requests] = await Promise.all([
        Order.countDocuments({ buyer: userId, status: { $ne: 'delivered' } }),
        Order.countDocuments({ buyer: userId }),
        BuyerRequest.countDocuments({ buyer: userId }),
      ]);

      res.json({
        activeOrders,
        totalOrders,
        requests,
        unreadMessages,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
