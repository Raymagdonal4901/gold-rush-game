import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import rigRoutes from './routes/rigRoutes';
import adminRoutes from './routes/adminRoutes';
// โหลด Environment Variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
import transactionRoutes from './routes/transactionRoutes';
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rigs', rigRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Gold Rush Backend is running!' });
});
// เชื่อมต่อ Database และ Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});