import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/efarmers';

    // Auto-fix accidental angle brackets in password (e.g. <mypassword>)
    if (mongoUri.includes('<') && mongoUri.includes('>')) {
      mongoUri = mongoUri.replace(/<([^>]+)>/g, '$1');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`🌿 MongoDB Connected successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);

    if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
      console.error(
        '\n💡 Notice: Your network or Windows DNS blocked the MongoDB SRV query.' +
        '\n   Use the direct standard replica set URI in server/.env instead of mongodb+srv://.\n'
      );
    } else {
      console.error(
        '\n💡 Note: Make sure MongoDB is running locally (e.g. "mongod" service), or configure your MongoDB Atlas connection string in server/.env\n'
      );
    }
    process.exit(1);
  }
};

