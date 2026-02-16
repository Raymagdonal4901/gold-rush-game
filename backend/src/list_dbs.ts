import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';

const listDBs = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        const admin = new mongoose.mongo.Admin(conn.connection.db);
        const dbs = await admin.listDatabases();
        console.log('[MONGODB] Databases available:', JSON.stringify(dbs, null, 2));

        // Also check current connected db
        console.log('[MONGODB] Currently connected to DB:', conn.connection.db.databaseName);

        process.exit(0);
    } catch (error) {
        console.error('List DBs failed:', error);
        process.exit(1);
    }
};

listDBs();
