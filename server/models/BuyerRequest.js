import mongoose from 'mongoose';

const buyerRequestSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Vegetables', 'Fruits', 'Grains', 'Dairy & Eggs', 'Livestock', 'Herbs', 'Other'],
      default: 'Vegetables',
    },
    qty: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
    },
    unit: {
      type: String,
      enum: ['kg', 'piece', 'bundle', 'tray', 'sack', 'liter', 'box'],
      default: 'kg',
    },
    byDate: {
      type: Date,
    },
    details: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BuyerRequest = mongoose.model('BuyerRequest', buyerRequestSchema);
