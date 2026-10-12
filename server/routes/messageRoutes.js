import express from 'express';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Notification } from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/messages/contacts
// @desc    Get all conversation contacts for current user
router.get('/contacts', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find contacts from messages
    const sent = await Message.distinct('to', { from: currentUserId });
    const received = await Message.distinct('from', { to: currentUserId });

    // Find contacts from orders (buyers & farmers they've interacted with)
    const farmerOrders = await Order.distinct('buyer', { farmer: currentUserId });
    const buyerOrders = await Order.distinct('farmer', { buyer: currentUserId });

    const contactIds = Array.from(
      new Set([...sent, ...received, ...farmerOrders, ...buyerOrders].map((id) => id.toString()))
    ).filter((id) => id !== currentUserId.toString());

    const contacts = await User.find({ _id: { $in: contactIds } })
      .select('name role location contact email')
      .lean();

    // Attach unread counts
    const contactsWithUnread = await Promise.all(
      contacts.map(async (c) => {
        const unreadCount = await Message.countDocuments({
          from: c._id,
          to: currentUserId,
          read: false,
        });
        return {
          ...c,
          unreadCount,
        };
      })
    );

    res.json(contactsWithUnread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/messages/:userId
// @desc    Get chat thread with a specific user & mark messages as read
router.get('/:userId', protect, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    // Mark received messages from this user as read
    await Message.updateMany(
      { from: otherUserId, to: currentUserId, read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: otherUserId },
        { from: otherUserId, to: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('from', 'name role')
      .populate('to', 'name role');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/messages
// @desc    Send a message to another user
router.post('/', protect, async (req, res) => {
  try {
    const { to, text } = req.body;

    if (!to || !text || !text.trim()) {
      return res.status(400).json({ message: 'Recipient and message text are required' });
    }

    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    const message = await Message.create({
      from: req.user._id,
      to,
      text: text.trim(),
    });

    // Notify recipient
    const snippet = text.length > 40 ? text.slice(0, 40) + '…' : text;
    await Notification.create({
      user: to,
      text: `💬 New message from ${req.user.name}: "${snippet}"`,
      type: 'message',
      link: 'messages',
      linkId: req.user._id.toString(),
    });

    const populated = await Message.findById(message._id)
      .populate('from', 'name role')
      .populate('to', 'name role');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
