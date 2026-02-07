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
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error:`, error);
    process.exit(1); // ปิดโปรแกรมทันทีถ้าต่อ Database ไม่ได้
  }
};