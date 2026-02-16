import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ ERROR: MONGODB_URI is not defined in Environment Variables.');
    console.error('Please check your Render.com dashboard (Dashboard -> Environment -> Environment Variables).');
    console.error('Ensure the key is "MONGODB_URI" and the value is your MongoDB Atlas connection string.');
    process.exit(1);
  }

  try {
    console.log(`📡 Attempting connection to: ${uri!.split('@')[1] || uri}`);
    const conn = await mongoose.connect(uri!, {
      connectTimeoutMS: 10000, // 10s timeout
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error:`, error.message);
    if (error.name === 'MongooseServerSelectionError') {
      console.error('💡 TIP: This is likely an IP Whitelist issue. Ensure 0.0.0.0/0 is added to your Atlas Network Access.');
    }
    process.exit(1);
  }
};