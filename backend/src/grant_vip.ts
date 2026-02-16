import mongoose from 'mongoose';
import User from './models/User';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-rush';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const email = 'raymagdonal4901@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`Found user: ${user.username}`);

        // Check if already has VIP card
        const hasVip = user.inventory.some((i: any) => i.itemId === 'vip_withdrawal_card' || i.id === 'vip_withdrawal_card');

        if (hasVip) {
            console.log('User already has VIP card.');
        } else {
            console.log('Granting VIP card...');
            // Add to inventory
            user.inventory.push({
                itemId: 'vip_withdrawal_card', // Using standardized ID
                typeId: 'vip_withdrawal_card',
                id: 'vip_withdrawal_card',
                name: 'VIP Withdrawal Card',
                quantity: 1,
                acquiredAt: new Date()
            });
            await user.save();
            console.log('VIP card granted successfully!');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
