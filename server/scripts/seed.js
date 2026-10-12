import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { BuyerRequest } from '../models/BuyerRequest.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';

dotenv.config();

const seedData = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/efarmers';
    if (mongoUri.includes('<') && mongoUri.includes('>')) {
      mongoUri = mongoUri.replace(/<([^>]+)>/g, '$1');
    }
    const maskedUri = mongoUri.replace(/:([^@:]+)@/, ':****@');
    console.log(`Connecting to MongoDB at: ${maskedUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });


    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      BuyerRequest.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('Seeding demo users...');
    const juan = await User.create({
      name: 'Juan Dela Cruz',
      email: 'juan@farm.com',
      password: '123456',
      role: 'farmer',
      contact: '0917 555 0101',
      location: 'Nueva Ecija',
      prefs: 'Rice, corn, vegetables',
    });

    const maria = await User.create({
      name: 'Maria Santos',
      email: 'maria@market.com',
      password: '123456',
      role: 'buyer',
      contact: '0917 555 0202',
      location: 'Quezon City',
      prefs: 'Tomatoes, leafy greens',
    });

    const pedro = await User.create({
      name: 'Pedro Reyes',
      email: 'pedro@farm.com',
      password: '123456',
      role: 'farmer',
      contact: '0917 555 0303',
      location: 'Benguet',
      prefs: 'Highland vegetables',
    });

    console.log('Seeding products...');
    const now = Date.now();
    const day = 86400000;
    const dateOffset = (d) => new Date(now + d * day);

    await Product.create([
      {
        farmer: juan._id,
        name: 'Sweet Corn',
        category: 'Vegetables',
        harvestDate: dateOffset(12),
        qty: 150,
        unit: 'kg',
        price: 45,
        desc: 'Fresh sweet corn harvested at dawn, husked and ready for pre-order.',
        location: 'Nueva Ecija',
      },
      {
        farmer: juan._id,
        name: 'Ripe Tomatoes',
        category: 'Vegetables',
        harvestDate: dateOffset(-1),
        qty: 80,
        unit: 'kg',
        price: 60,
        desc: 'Vine-ripened tomatoes, perfect for restaurants and markets.',
        location: 'Nueva Ecija',
      },
      {
        farmer: juan._id,
        name: 'Dinorado Rice',
        category: 'Grains',
        harvestDate: dateOffset(-3),
        qty: 200,
        unit: 'sack',
        price: 1350,
        desc: 'Newly milled dinorado rice, 25kg per sack.',
        location: 'Nueva Ecija',
      },
      {
        farmer: pedro._id,
        name: 'Crisp Lettuce',
        category: 'Vegetables',
        harvestDate: dateOffset(0),
        qty: 40,
        unit: 'kg',
        price: 95,
        desc: 'Hydroponic lettuce, harvested to order.',
        location: 'Benguet',
      },
      {
        farmer: pedro._id,
        name: 'Carabao Mango',
        category: 'Fruits',
        harvestDate: dateOffset(20),
        qty: 100,
        unit: 'kg',
        price: 120,
        desc: 'Sweet carabao mangoes. Reserve early for harvest season!',
        location: 'Benguet',
      },
      {
        farmer: pedro._id,
        name: 'Calamansi',
        category: 'Fruits',
        harvestDate: dateOffset(5),
        qty: 60,
        unit: 'kg',
        price: 85,
        desc: 'Juicy calamansi straight from the highlands.',
        location: 'Benguet',
      },
      {
        farmer: pedro._id,
        name: 'Free-range Eggs',
        category: 'Dairy & Eggs',
        harvestDate: dateOffset(2),
        qty: 30,
        unit: 'tray',
        price: 220,
        desc: 'A dozen free-range eggs per tray, collected daily.',
        location: 'Benguet',
      },
    ]);

    console.log('Seeding buyer request...');
    await BuyerRequest.create({
      buyer: maria._id,
      product: 'Tomatoes',
      category: 'Vegetables',
      qty: 50,
      unit: 'kg',
      byDate: dateOffset(7),
      details: 'Need regularly for my restaurant. Weekly deliveries preferred.',
    });

    console.log('Seeding initial notifications...');
    await Notification.create([
      {
        user: juan._id,
        text: 'Welcome to E-Farmers! Add your product listings to start selling.',
        type: 'system',
        link: 'dashboard',
      },
      {
        user: maria._id,
        text: 'Welcome to E-Farmers! Browse the marketplace or post a request.',
        type: 'system',
        link: 'market',
      },
      {
        user: pedro._id,
        text: 'Welcome to E-Farmers! Your products from Benguet are now live.',
        type: 'system',
        link: 'dashboard',
      },
    ]);

    console.log('✅ Demo data seeded successfully into MongoDB!');
    console.log('Demo Credentials:');
    console.log(' - Farmer: juan@farm.com / 123456');
    console.log(' - Buyer:  maria@market.com / 123456');
    console.log(' - Farmer: pedro@farm.com / 123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
