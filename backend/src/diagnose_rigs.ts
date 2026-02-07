import mongoose from 'mongoose';
import Rig from './models/Rig';
import User from './models/User';

const run = async () => {
    try {
        const uri = 'mongodb://localhost:27017/gold-rush';
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const rigs = await Rig.find({});
        console.log('Total Rigs in DB:', rigs.length);

        for (const rig of rigs) {
            console.log(`Rig: ${rig.name}, OwnerId: ${rig.ownerId}, ID: ${rig._id}`);
        }

        const users = await User.find({});
        console.log('Total Users in DB:', users.length);
        for (const user of users) {
            console.log(`User: ${user.username}, ID: ${user._id}`);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
