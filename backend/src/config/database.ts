import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // บรรทัดนี้จะไปดึงลิงก์จากไฟล์ .env มาใช้เชื่อมต่อ
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error:`, error);
    process.exit(1); // ปิดโปรแกรมทันทีถ้าต่อ Database ไม่ได้
  }
};