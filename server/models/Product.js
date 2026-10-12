import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Vegetables', 'Fruits', 'Grains', 'Dairy & Eggs', 'Livestock', 'Herbs', 'Other'],
      default: 'Vegetables',
    },
    harvestDate: {
      type: Date,
      required: [true, 'Harvest date is required'],
    },
    qty: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0,
    },
    unit: {
      type: String,
      enum: ['kg', 'piece', 'bundle', 'tray', 'sack', 'liter', 'box'],
      default: 'kg',
    },
    price: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: 0,
    },
    location: {
      type: String,
      required: [true, 'Farm location is required'],
      trim: true,
    },
    desc: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for pre-order check
productSchema.virtual('isPreorder').get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.harvestDate > today;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export const Product = mongoose.model('Product', productSchema);
