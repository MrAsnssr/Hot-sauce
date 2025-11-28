import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/arabic-trivia';
    if (!mongoUri || mongoUri === 'mongodb://localhost:27017/arabic-trivia') {
      console.warn('⚠️  Using default MongoDB URI. Set MONGODB_URI environment variable for production.');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db?.databaseName || 'unknown');
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message || error);
    console.warn('⚠️  Continuing without database connection. Some features may not work.');
    console.warn('⚠️  Make sure MongoDB is running or set MONGODB_URI environment variable.');
    // Don't exit - allow server to run without DB for development
  }
};

