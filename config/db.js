const mongoose = require('mongoose');
const config = require('config');

// Get MongoDB URI from environment or config
const getMongoURI = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.MONGO_URI;
  }
  return config.get('mongoURI');
};

// Connection to MongoDB
const connectDB = async () => {
  try {
    const db = getMongoURI();
    await mongoose.connect(db, {
      // MongoDB connection options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
