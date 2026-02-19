import mongoose from 'mongoose';
const MONGODB_URI = 'mongodb+srv://goldRushAdmin:bleach4901@cluster0.ighf9fo.mongodb.net/gold-rush?retryWrites=true&w=majority';

async function checkUser() {
    await mongoose.connect(MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({
        username: String,
        referralCode: String,
        referrerId: mongoose.Schema.Types.ObjectId,
        usedReferralCode: String
    }, { strict: false }));

    const code = '1ZK0SG2G';
    const user = await User.findOne({
        $or: [
            { referralCode: code },
            { username: code }
        ]
    });

    if (user) {
        console.log('FOUND USER:', JSON.stringify(user, null, 2));
        const referrals = await User.find({ referrerId: user._id });
        console.log(`REFERRALS COUNT: ${referrals.length}`);
        console.log('REFERRAL USERNAMES:', referrals.map(u => u.username));
    } else {
        console.log('USER NOT FOUND with code:', code);
        // Try case insensitive
        const userCI = await User.findOne({
            $or: [
                { referralCode: { $regex: new RegExp(`^${code}$`, 'i') } },
                { username: { $regex: new RegExp(`^${code}$`, 'i') } }
            ]
        });
        if (userCI) {
            console.log('FOUND USER (Case Insensitive):', JSON.stringify(userCI, null, 2));
        } else {
            console.log('USER NOT FOUND EVEN WITH CASE INSENSITIVE SEARCH');
        }
    }
    await mongoose.disconnect();
}
checkUser();
