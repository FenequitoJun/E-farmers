import express from 'express';
import { BuyerRequest } from '../models/BuyerRequest.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { protect, requireBuyer } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/requests
// @desc    Get all buyer requests
router.get('/', async (req, res) => {
  try {
    const requests = await BuyerRequest.find()
      .populate('buyer', 'name contact location email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/requests
// @desc    Create a new buyer request (Buyer only)
router.post('/', protect, requireBuyer, async (req, res) => {
  try {
    const { product, category, qty, unit, byDate, details } = req.body;

    if (!product || !qty || Number(qty) < 1) {
      return res.status(400).json({ message: 'Product name and quantity are required' });
    }

    const request = await BuyerRequest.create({
      buyer: req.user._id,
      product,
      category: category || 'Vegetables',
      qty: Number(qty),
      unit: unit || 'kg',
      byDate: byDate || null,
      details: details || '',
    });

    // Notify all farmers
    try {
      const farmers = await User.find({ role: 'farmer' });
      for (const farmer of farmers) {
        await Notification.create({
          user: farmer._id,
          text: `New buyer request: ${qty} ${unit || 'kg'} of ${product}`,
          type: 'request',
          link: 'requests',
          linkId: request._id.toString(),
        });
      }
    } catch (notifErr) {
      console.error('Error notifying farmers of request:', notifErr);
    }

    const populated = await BuyerRequest.findById(request._id).populate('buyer', 'name contact location email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete buyer request (Owner only)
router.delete('/:id', protect, requireBuyer, async (req, res) => {
  try {
    const request = await BuyerRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await BuyerRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
