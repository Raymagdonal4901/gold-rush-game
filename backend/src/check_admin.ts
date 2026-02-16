import mongoose from 'mongoose';
import User from './models/User';

const checkAdmin = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gold-rush';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const admin = await User.findOne({ username: 'admin' }).select('+passwordHash +pin');
        if (admin) {
            console.log('FOUND_ADMIN_USER');
            console.log('Role:', admin.role);
            console.log('Has Password:', !!admin.passwordHash);
            console.log('Has PIN:', !!admin.pin);
        } else {
            console.log('ADMIN_USER_NOT_FOUND');
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkAdmin();
