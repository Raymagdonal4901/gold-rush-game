import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import rigRoutes from './routes/rigRoutes';
import adminRoutes from './routes/adminRoutes';
import questRoutes from './routes/questRoutes';
import accessoryRoutes from './routes/accessoryRoutes';
import dungeonRoutes from './routes/dungeonRoutes';
import userRoutes from './routes/userRoutes';
import materialRoutes from './routes/materialRoutes';
import chatRoutes from './routes/chatRoutes';
import upgradeRoutes from './routes/upgradeRoutes';
// โหลด Environment Variables
dotenv.config();

// ตรวจสอบตัวแปรที่จำเป็น (Required Environment Variables)
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
    console.error(`❌ ERROR: Missing required environment variables: ${missingEnv.join(', ')}`);
    console.error('Please check your Render.com dashboard (Dashboard -> Environment -> Environment Variables).');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
import transactionRoutes from './routes/transactionRoutes';
import { checkMaintenance } from './middleware/checkMaintenance';

// Routes
// Apply Global Maintenance Check (Logic inside handles bypass for auth/admin)
app.use(checkMaintenance);

app.use('/api/auth', authRoutes);
app.use('/api/rigs', rigRoutes);
app.use('/api/quests', questRoutes); // Add Quests API
app.use('/api/accessories', accessoryRoutes);
app.use('/api/dungeons', dungeonRoutes);
app.use('/api/users', userRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upgrade', upgradeRoutes);
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