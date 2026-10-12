import express from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Notification } from '../models/Notification.js';
import { protect, requireBuyer, requireFarmer } from '../middleware/auth.js';

const router = express.Router();

// Helper to format order number
const generateOrderNumber = async () => {
  const count = await Order.countDocuments();
  return `EF-${1001 + count}`;
};

// @route   GET /api/orders
// @desc    Get user orders (farmer sees received orders, buyer sees placed orders)
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'farmer' ? { farmer: req.user._id } : { buyer: req.user._id };

    const orders = await Order.find(filter)
      .populate('buyer', 'name contact email location')
      .populate('farmer', 'name contact email location')
      .populate('product', 'name category unit price harvestDate location')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name contact email location')
      .populate('farmer', 'name contact email location')
      .populate('product', 'name category unit price harvestDate location');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization: user must be buyer or farmer
    if (
      order.buyer._id.toString() !== req.user._id.toString() &&
      order.farmer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create a new pre-order (Buyer only)
router.post('/', protect, requireBuyer, async (req, res) => {
  try {
    const { productId, qty, recipientName, phone, deliveryAddress, preferredDate, notes, paymentMethod } = req.body;

    if (!productId || !qty || Number(qty) < 1 || !recipientName || !phone || !deliveryAddress) {
      return res.status(400).json({ message: 'Please provide all required delivery details' });
    }

    const orderQty = Number(qty);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.qty < orderQty) {
      return res.status(400).json({ message: `Insufficient stock. Only ${product.qty} ${product.unit} available.` });
    }

    // Decrement stock
    product.qty -= orderQty;
    await product.save();

    const orderNumber = await generateOrderNumber();
    const subtotal = product.price * orderQty;
    const deliveryFee = 50;
    const total = subtotal + deliveryFee;

    const order = await Order.create({
      orderNumber,
      buyer: req.user._id,
      farmer: product.farmer,
      product: product._id,
      productName: product.name,
      category: product.category,
      qty: orderQty,
      unit: product.unit,
      price: product.price,
      subtotal,
      deliveryFee,
      total,
      recipientName,
      phone,
      deliveryAddress,
      preferredDate: preferredDate || product.harvestDate,
      notes: notes || '',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      status: 'processing',
    });

    // Notify Farmer
    await Notification.create({
      user: product.farmer,
      text: `New pre-order #${orderNumber}: ${orderQty} ${product.unit} of ${product.name} (₱${total.toLocaleString()})`,
      type: 'order',
      link: 'orders',
      linkId: order._id.toString(),
    });

    // Notify Buyer
    await Notification.create({
      user: req.user._id,
      text: `Order #${orderNumber} placed! We will notify you when it ships.`,
      type: 'order',
      link: 'orders',
      linkId: order._id.toString(),
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name contact email location')
      .populate('farmer', 'name contact email location')
      .populate('product');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Advance order status (processing -> shipped -> delivered) (Farmer only)
router.patch('/:id/status', protect, requireFarmer, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    if (!['shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Status must be shipped or delivered' });
    }

    order.status = status;
    await order.save();

    // Notify buyer
    if (status === 'shipped') {
      await Notification.create({
        user: order.buyer,
        text: `Order #${order.orderNumber} (${order.productName}) has been shipped! 🚚`,
        type: 'order',
        link: 'orders',
        linkId: order._id.toString(),
      });
    } else if (status === 'delivered') {
      await Notification.create({
        user: order.buyer,
        text: `Order #${order.orderNumber} (${order.productName}) was delivered ✅ — leave a review!`,
        type: 'order',
        link: 'orders',
        linkId: order._id.toString(),
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
