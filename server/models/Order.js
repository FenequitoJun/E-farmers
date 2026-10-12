import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 50,
    },
    total: {
      type: Number,
      required: true,
    },
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
    },
    preferredDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Bank Transfer', 'E-Wallet'],
      default: 'Cash on Delivery',
    },
    status: {
      type: String,
      enum: ['processing', 'shipped', 'delivered'],
      default: 'processing',
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model('Order', orderSchema);
