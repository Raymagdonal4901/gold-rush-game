import { Response } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Rig from '../models/Rig';
import WithdrawalRequest from '../models/WithdrawalRequest';
import DepositRequest from '../models/DepositRequest';
import ClaimRequest from '../models/ClaimRequest';
import SystemConfig from '../models/SystemConfig';
import Transaction from '../models/Transaction';

// Convert All Currency Data to USD (1 USD = 32 THB)
export const adminConvertCurrencyToUSD = async (req: AuthRequest, res: Response) => {
    try {
        const rate = 1;

        // 1. Convert User Balances
        await User.updateMany({}, [
            { $set: { balance: { $divide: ["$balance", rate] } } }
        ]);

        // 2. Convert Rig Data
        await Rig.updateMany({}, [
            {
                $set: {
                    investment: { $divide: ["$investment", rate] },
                    dailyProfit: { $divide: ["$dailyProfit", rate] },
                    bonusProfit: { $divide: ["$bonusProfit", rate] }
                }
            }
        ]);

        // 3. Convert Transaction History
        await Transaction.updateMany({}, [
            { $set: { amount: { $divide: ["$amount", rate] } } }
        ]);

        // 4. Convert Deposit Requests
        await DepositRequest.updateMany({}, [
            { $set: { amount: { $divide: ["$amount", rate] } } }
        ]);

        // 5. Convert Withdrawal Requests
        await WithdrawalRequest.updateMany({}, [
            { $set: { amount: { $divide: ["$amount", rate] } } }
        ]);

        // 6. Convert Claim Requests
        await ClaimRequest.updateMany({}, [
            { $set: { amount: { $divide: ["$amount", rate] } } }
        ]);

        res.json({ message: 'Global currency conversion to USD completed successfully' });
    } catch (error) {
        console.error('[ADMIN ERROR] adminConvertCurrencyToUSD failed:', error);
        res.status(500).json({ message: 'Server error during conversion', error });
    }
};

// Give Compensation (Add Balance)
export const adminGiveCompensation = async (req: AuthRequest, res: Response) => {
    try {
        console.log('[ADMIN DEBUG] adminGiveCompensation called. Payload:', JSON.stringify(req.body));
        const { userId, amount, reason } = req.body;

        if (!userId) {
            console.warn('[ADMIN DEBUG] Missing userId in payload');
            return res.status(400).json({ message: 'Missing userId' });
        }

        let user;
        // Check if userId is a valid ObjectId (Hex 24 chars)
        if (typeof userId === 'string' && userId.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(userId);
            if (user) console.log(`[ADMIN DEBUG] User found by ID: ${userId}`);
        }

        if (!user) {
            console.log(`[ADMIN DEBUG] User not found by ID (or invalid ID), checking username: ${userId}`);
            user = await User.findOne({ username: userId });
        }

        if (!user) {
            console.warn(`[ADMIN DEBUG] User not found: ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            console.warn(`[ADMIN DEBUG] Invalid amount: ${amount}`);
            return res.status(400).json({ message: 'Invalid amount' });
        }

        console.log(`[ADMIN DEBUG] Adding ${amountNum} to user ${user.username} (Current Balance: ${user.balance})`);
        user.balance += amountNum;
        await user.save();

        // Create Transaction Record
        try {
            const transaction = new Transaction({
                userId: user.id || user._id,
                type: 'COMPENSATION',
                amount: amountNum,
                status: 'COMPLETED',
                description: reason || 'Server Maintenance Compensation'
            });
            await transaction.save();
            console.log('[ADMIN DEBUG] Transaction created successfully');
        } catch (txError) {
            console.error('[ADMIN ERROR] Failed to create transaction record:', txError);
            // We don't fail the request if transaction logs fail, but good to know
        }

        res.json({ message: 'Compensation successful', newBalance: user.balance });
    } catch (error) {
        console.error('[ADMIN ERROR] adminGiveCompensation failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Give Compensation to ALL Users
export const adminGiveCompensationAll = async (req: AuthRequest, res: Response) => {
    try {
        console.log('[ADMIN DEBUG] adminGiveCompensationAll called. Payload:', JSON.stringify(req.body));
        const { amount, reason } = req.body;

        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // 1. Update all users' balance
        const result = await User.updateMany({}, { $inc: { balance: amountNum } });

        // 2. Create Transaction Records for everyone
        // Note: For large user bases, this should be a background job.
        // For current scale, we can fetch all IDs and batch insert transactions.
        const users = await User.find({}, '_id');
        const transactions = users.map(u => ({
            userId: u._id,
            type: 'COMPENSATION',
            amount: amountNum,
            status: 'COMPLETED',
            description: reason || 'Server Maintenance Compensation (Bulk)'
        }));

        if (transactions.length > 0) {
            await Transaction.insertMany(transactions);
        }

        console.log(`[ADMIN DEBUG] Bulk compensation completed. Updated ${result.modifiedCount} users.`);
        res.json({ message: `Compensation successful for ${result.modifiedCount} users`, count: result.modifiedCount });
    } catch (error) {
        console.error('[ADMIN ERROR] adminGiveCompensationAll failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Add Item to User (Single or All) via Mailbox
export const adminAddItem = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, itemId, amount, message } = req.body; // Added message (optional)
        const amountNum = Number(amount) || 1;

        // Common Item Structure Template
        const createItem = () => ({
            id: uuidv4(),
            typeId: itemId,
            name: itemId,
            rarity: 'COMMON',
            purchasedAt: Date.now(),
            lifespanDays: 30,
            isHandmade: false
        });

        // Generate the item array
        const itemsToSend: any[] = [];
        for (let i = 0; i < amountNum; i++) {
            itemsToSend.push(createItem());
        }

        const notificationTitle = 'Admin Gift';
        const notificationMessage = message || `คุณได้รับไอเทมจากผู้ดูแลระบบจำนวน ${amountNum} ชิ้น`;

        const createNotification = () => ({
            id: uuidv4(),
            userId: '', // Will be set in loop or below
            title: notificationTitle,
            message: notificationMessage,
            type: 'REWARD',
            read: false,
            timestamp: Date.now(),
            hasReward: true,
            rewardType: 'ITEM',
            rewardValue: itemsToSend,
            isClaimed: false
        });

        if (userId === 'ALL') {
            console.log(`[ADMIN] Sending ${amountNum}x ${itemId} to ALL users (Mailbox)...`);
            const users = await User.find({});
            let count = 0;

            for (const user of users) {
                // Duplicate items for each user to ensure unique IDs (though createItem call above does it once per request, 
                // wait, strict uniqueness means I should generate items INSIDE the loop if the Item ID matters globally.
                // However, User.inventory validation usually checks uniqueness within the user doc.
                // But better safe: UUIDs should be unique globally. 
                // Let's regenerate items for each user to be safe.

                const userItems = [];
                for (let i = 0; i < amountNum; i++) {
                    userItems.push(createItem());
                }

                const notif = createNotification();
                notif.userId = user._id.toString(); // Fix ObjectId to string
                notif.rewardValue = userItems; // unique items for this user

                user.notifications.push(notif);
                user.markModified('notifications');
                await user.save();
                count++;
            }

            console.log(`[ADMIN] Successfully sent items to ${count} users.`);
            return res.json({ message: `Successfully sent ${itemId} x${amountNum} to all ${count} users (via Mailbox).` });

        } else {
            // Single User Logic
            let user;
            if (userId.match(/^[0-9a-fA-F]{24}$/)) {
                user = await User.findById(userId);
            }
            if (!user) {
                user = await User.findOne({ username: userId });
            }

            if (!user) return res.status(404).json({ message: 'User not found' });

            const notif = createNotification();
            notif.userId = user._id.toString(); // Fix ObjectId to string

            user.notifications.push(notif);

            user.markModified('notifications');
            await user.save();

            console.log(`[ADMIN] Sent ${amountNum}x ${itemId} to user ${user.username} (Mailbox)`);
            res.json({ message: 'Item sent to Mailbox successfully', notifications: user.notifications });
        }

    } catch (error) {
        console.error('[ADMIN ERROR] adminAddItem failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get User Stats (Deposits/Withdrawals/Revenue/History)
export const getUserStats = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const objId = new mongoose.Types.ObjectId(userId);

        // Total Deposits (APPROVED only)
        const depositStats = await DepositRequest.aggregate([
            { $match: { userId: objId, status: 'APPROVED' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalDeposits = depositStats.length > 0 ? depositStats[0].total : 0;

        // Total Withdrawals (APPROVED only)
        const withdrawalStats = await WithdrawalRequest.aggregate([
            { $match: { userId: objId, status: 'APPROVED' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalWithdrawals = withdrawalStats.length > 0 ? withdrawalStats[0].total : 0;

        // --- Developer Revenue Calculation ---
        const revenueStats = await Transaction.aggregate([
            { $match: { userId: userId.toString() } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const revenueMap: Record<string, number> = {};
        revenueStats.forEach(s => revenueMap[s._id] = s.total);

        // 3.1 Energy/Overclock/Battery (Energy Refill + Accessory Purchase)
        const rev_energy_items = (revenueMap['ENERGY_REFILL'] || 0) + (revenueMap['ACCESSORY_PURCHASE'] || 0);

        // 3.2 Market Fee (Tax from Selling)
        const rev_market_fees = revenueMap['MARKET_TAX'] || 0;

        // 3.3 Withdrawal Fee (Currently 0 as no explicit transaction type yet)
        const rev_withdrawal_fees = 0;

        // 3.4 Repair Fee
        const rev_repair_fees = revenueMap['REPAIR'] || 0;

        // 3.5 Total Revenue
        const total_revenue = rev_energy_items + rev_market_fees + rev_withdrawal_fees + rev_repair_fees;

        // --- Transaction History ---
        const withdrawalHistory = await WithdrawalRequest.find({ userId: objId }).sort({ createdAt: -1 });
        const depositHistory = await DepositRequest.find({ userId: objId }).sort({ createdAt: -1 });

        res.json({
            totalDeposits,
            totalWithdrawals,
            revenue: {
                energy_items: rev_energy_items,
                market_fees: rev_market_fees,
                withdrawal_fees: rev_withdrawal_fees,
                repair_fees: rev_repair_fees,
                total: total_revenue
            },
            withdrawalHistory,
            depositHistory
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get All Users
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await User.find().select('-password -pin').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get All Rigs
export const getAllRigs = async (req: AuthRequest, res: Response) => {
    try {
        const rigs = await Rig.find().sort({ purchasedAt: -1 });
        res.json(rigs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get System Config (Real)
export const getSystemConfig = async (req: AuthRequest, res: Response) => {
    try {
        let config = await SystemConfig.findOne();
        if (!config) {
            config = await SystemConfig.create({});
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update System Config
export const updateSystemConfig = async (req: AuthRequest, res: Response) => {
    try {
        const { receivingQrCode, isMaintenanceMode } = req.body;

        // Upsert logic
        let config = await SystemConfig.findOne();
        if (!config) {
            config = new SystemConfig({});
        }

        if (receivingQrCode !== undefined) config.receivingQrCode = receivingQrCode;
        if (isMaintenanceMode !== undefined) config.isMaintenanceMode = isMaintenanceMode;
        if (req.body.dropRate !== undefined) config.dropRate = req.body.dropRate;

        await config.save();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get Pending Deposits
export const getPendingDeposits = async (req: AuthRequest, res: Response) => {
    try {
        const deposits = await DepositRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
        res.json(deposits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Process Deposit (Approve/Reject)
export const processDepositRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // APPROVED or REJECTED

        const deposit = await DepositRequest.findById(id);
        if (!deposit) return res.status(404).json({ message: 'Deposit request not found' });
        if (deposit.status !== 'PENDING') return res.status(400).json({ message: 'Request already processed' });

        deposit.status = status;
        deposit.processedAt = new Date();
        await deposit.save();

        if (status === 'APPROVED') {
            const user = await User.findById(deposit.userId);
            if (user) {
                user.balance += deposit.amount;

                // --- REFERRAL LOGIC: First Deposit Reward ---
                if (!user.isFirstDepositPaid && user.referredBy) {
                    const referrer = await User.findById(user.referredBy);
                    if (referrer) {
                        // Reward: 1 Gacha Key (Key to the Mine)
                        const rewardItem = {
                            id: uuidv4(),
                            typeId: 'chest_key',
                            name: { th: 'กุญแจเข้าเหมือง', en: 'Mine Key' },
                            rarity: 'RARE',
                            purchasedAt: Date.now(),
                            tier: 1, // Standard Key
                            dailyBonus: 0
                        };

                        referrer.inventory.push(rewardItem);
                        referrer.referralCount = (referrer.referralCount || 0) + 1;
                        await referrer.save();

                        // Create Transaction Record for Referrer (Optional but good for tracking)
                        await Transaction.create({
                            userId: referrer._id,
                            type: 'REFERRAL_BONUS',
                            amount: 0, // Item reward, not cash
                            status: 'COMPLETED',
                            description: `Referral Reward for user ${user.username}`
                        });

                        console.log(`[REFERRAL] Awarded 1 Mine Key to ${referrer.username} for referring ${user.username}`);
                    }

                    // Mark as paid so we don't double reward
                    user.isFirstDepositPaid = true;
                }

                await user.save();
            }
        }

        res.json({ message: `Deposit ${status}`, deposit });
    } catch (error: any) {
        res.status(500).json({
            message: 'Server error processing deposit',
            error: error.message || error
        });
    }
};

// Get Pending Withdrawals
export const getPendingWithdrawals = async (req: AuthRequest, res: Response) => {
    try {
        const withdrawals = await WithdrawalRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Process Withdrawal (Approve/Reject)
export const processWithdrawalRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // APPROVED or REJECTED

        const withdrawal = await WithdrawalRequest.findById(id);
        if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found' });
        if (withdrawal.status !== 'PENDING') return res.status(400).json({ message: 'Request already processed' });

        withdrawal.status = status;
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        if (status === 'REJECTED') {
            // Refund the user if rejected
            const user = await User.findById(withdrawal.userId);
            if (user) {
                user.balance += withdrawal.amount;
                await user.save();
            }
        }

        res.json({ message: `Withdrawal ${status}`, withdrawal });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
// Get Pending Claims
export const getPendingClaims = async (req: AuthRequest, res: Response) => {
    try {
        const claims = await ClaimRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
        res.json(claims);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get Global Revenue Stats
export const getGlobalRevenueStats = async (req: AuthRequest, res: Response) => {
    try {
        console.log('[ADMIN DEBUG] getGlobalRevenueStats called');

        // 1. Basic Transaction aggregation
        const revenueStats = await Transaction.aggregate([
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const revenueMap: Record<string, number> = {};
        revenueStats.forEach(s => revenueMap[s._id] = s.total);

        // 2. Deposit Method aggregation (APPROVED only)
        const depositStats = await DepositRequest.aggregate([
            { $match: { status: 'APPROVED' } },
            {
                $group: {
                    _id: { $toUpper: { $cond: { if: { $eq: ["$slipImage", "CRYPTO_USDT_BSC"] }, then: "USDT", else: "BANK" } } },
                    total: { $sum: "$amount" }
                }
            }
        ]);
        const depMap: Record<string, number> = {};
        depositStats.forEach(s => depMap[s._id] = s.total);

        // 3. Withdrawal Method aggregation (APPROVED only)
        const withdrawStats = await WithdrawalRequest.aggregate([
            { $match: { status: 'APPROVED' } },
            {
                $group: {
                    _id: '$method',
                    total: { $sum: "$amount" }
                }
            }
        ]);
        const withMap: Record<string, number> = {};
        withdrawStats.forEach(s => withMap[s._id] = s.total);

        // 3.1 Energy/Overclock/Battery (Energy Refill + Accessory Purchase)
        const rev_energy_items = (revenueMap['ENERGY_REFILL'] || 0) + (revenueMap['ACCESSORY_PURCHASE'] || 0);

        // 3.2 Market Fee (Tax from Selling)
        const rev_market_fees = revenueMap['MARKET_TAX'] || 0;

        // 3.3 Withdrawal Fee (10% of approved withdrawals)
        const withdrawal_fees_bank = (withMap['BANK'] || 0) * 0.1;
        const withdrawal_fees_usdt = (withMap['USDT'] || 0) * 0.1;
        const rev_withdrawal_fees = withdrawal_fees_bank + withdrawal_fees_usdt;

        // 3.4 Repair Fee
        const rev_repair_fees = revenueMap['REPAIR'] || 0;

        // 3.4.1 System Adjustments (Can be negative/deduction)
        const rev_adjustments = revenueMap['SYSTEM_ADJUSTMENT'] || 0;

        // 3.5 Total Revenue
        const total_revenue = rev_energy_items + rev_market_fees + rev_withdrawal_fees + rev_repair_fees + rev_adjustments;

        res.json({
            energy_items: rev_energy_items,
            market_fees: rev_market_fees,
            withdrawal_fees: rev_withdrawal_fees,
            withdrawal_fees_bank: withdrawal_fees_bank,
            withdrawal_fees_usdt: withdrawal_fees_usdt,
            repair_fees: rev_repair_fees,
            adjustments: rev_adjustments,
            total: total_revenue,
            usdt_deposits: depMap['USDT'] || 0,
            bank_deposits: depMap['BANK'] || 0,
            usdt_withdrawals: withMap['USDT'] || 0,
            bank_withdrawals: withMap['BANK'] || 0
        });
    } catch (error) {
        console.error('[ADMIN ERROR] getGlobalRevenueStats failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};



// Delete User Permanently
export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const objId = new mongoose.Types.ObjectId(userId);

        // Delete all related records
        await Rig.deleteMany({ ownerId: userId });
        await Transaction.deleteMany({ userId: userId });
        await DepositRequest.deleteMany({ userId: userId });
        await WithdrawalRequest.deleteMany({ userId: userId });
        await ClaimRequest.deleteMany({ userId: userId });

        // Finally delete the user
        const result = await User.findByIdAndDelete(userId);

        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[ADMIN] User ${userId} and all related data deleted permanently.`);
        res.json({ message: 'User and all associated data deleted successfully' });
    } catch (error) {
        console.error('[ADMIN ERROR] deleteUser failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Clear Global Revenue Stats
export const clearRevenueStats = async (req: AuthRequest, res: Response) => {
    try {
        console.log('[ADMIN] Clearing developer revenue stats...');

        // Define transaction types that count as revenue
        const revenueTypes = ['ENERGY_REFILL', 'ACCESSORY_PURCHASE', 'MARKET_TAX', 'REPAIR', 'SYSTEM_ADJUSTMENT'];

        // Delete or mark these transactions as processed/cleared
        // For now we delete them to reset the sum to 0
        const result = await Transaction.deleteMany({ type: { $in: revenueTypes } });

        // Add: Clear Deposit and Withdrawal history to reset Volume metrics
        const depResult = await DepositRequest.deleteMany({});
        const withResult = await WithdrawalRequest.deleteMany({});

        console.log(`[ADMIN] Revenue stats cleared. Deleted ${result.deletedCount} transactions, ${depResult.deletedCount} deposits, ${withResult.deletedCount} withdrawals.`);
        res.json({
            message: 'Revenue stats cleared successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('[ADMIN ERROR] clearRevenueStats failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
// Reset All User Balances to Zero
export const resetAllBalances = async (req: AuthRequest, res: Response) => {
    try {
        console.log('[ADMIN] Resetting all user balances to 0...');

        // Reset everyone to 0
        const result = await User.updateMany({}, { $set: { balance: 0 } });

        // Also clear any pending withdrawal/deposit? 
        // For safety, let's just reset the balance as requested first.

        console.log(`[ADMIN] All balances reset. Updated ${result.modifiedCount} users.`);
        res.json({
            message: 'All balances reset to 0 successfully',
            count: result.modifiedCount
        });
    } catch (error) {
        console.error('[ADMIN ERROR] resetAllBalances failed:', error);
        res.status(500).json({ message: 'Server error during reset', error });
    }
};
// Delete Rig (Admin)
export const deleteRig = async (req: AuthRequest, res: Response) => {
    try {
        const { rigId } = req.params;
        console.log(`[ADMIN] Deleting rig ${rigId}...`);

        const rig = await Rig.findById(rigId);
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // 1. Remove equipped items from owner's inventory
        if (rig.ownerId) {
            const user = await User.findById(rig.ownerId);
            if (user) {
                const itemsToDestroy = (rig.slots || []).filter(id => id !== null);
                if (itemsToDestroy.length > 0) {
                    console.log(`[ADMIN] Removing ${itemsToDestroy.length} items from user ${user.username}`);
                    user.inventory = user.inventory.filter((item: any) => {
                        const itemId = item.id || item._id;
                        return !itemsToDestroy.includes(itemId.toString());
                    });
                    user.markModified('inventory');
                    await user.save();
                }
            }
        }

        // 2. Delete the rig
        await Rig.deleteOne({ _id: rigId });

        res.json({ message: 'Rig deleted successfully' });
    } catch (error) {
        console.error('[ADMIN ERROR] deleteRig failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Adjust Global Revenue (System Adjustment)
export const adminAdjustRevenue = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, reason } = req.body;
        const amountNum = Number(amount);

        if (isNaN(amountNum)) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const adjustment = new Transaction({
            userId: 'SYSTEM', // Special tag for system adjustments
            type: 'SYSTEM_ADJUSTMENT',
            amount: amountNum,
            status: 'COMPLETED',
            description: reason || 'Revenue Adjustment'
        });

        await adjustment.save();

        res.json({ message: 'Revenue adjustment successful', amount: amountNum });
    } catch (error) {
        console.error('[ADMIN ERROR] adminAdjustRevenue failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Reset Individual User (Money, Rigs, Inventory)
export const resetUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[ADMIN] Resetting user ${user.username} (${userId})...`);

        // 1. Reset user fields
        user.balance = 0;
        user.inventory = [];
        user.materials = {};
        user.energy = 100;
        user.lastEnergyUpdate = new Date();
        user.markModified('inventory');
        user.markModified('materials');
        await user.save();

        // 2. Delete all rigs owned by the user
        await Rig.deleteMany({ ownerId: userId });

        // 3. Delete related requests to keep it clean
        await ClaimRequest.deleteMany({ userId: userId });

        res.json({ message: 'User reset successfully' });
    } catch (error) {
        console.error('[ADMIN ERROR] resetUser failed:', error);
        res.status(500).json({ message: 'Server error during user reset', error });
    }
};

// Remove VIP Card from User
export const removeVip = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[ADMIN] Removing VIP status from user ${user.username}...`);

        // Filter out VIP items from inventory
        const originalCount = user.inventory.length;
        user.inventory = user.inventory.filter((item: any) => item.typeId !== 'vip_withdrawal_card');

        if (user.inventory.length === originalCount) {
            return res.status(400).json({ message: 'User does not have a VIP card' });
        }

        user.markModified('inventory');
        await user.save();

        res.json({ message: 'VIP card removed successfully' });
    } catch (error) {
        console.error('[ADMIN ERROR] removeVip failed:', error);
        res.status(500).json({ message: 'Server error during VIP removal', error });
    }
};
