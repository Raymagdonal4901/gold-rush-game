import { Response } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import { SHOP_ITEMS, RIG_PRESETS, MINING_VOLATILITY_CONFIG } from '../constants';
import User from '../models/User';
import Rig from '../models/Rig';
import WithdrawalRequest from '../models/WithdrawalRequest';
import DepositRequest from '../models/DepositRequest';
import ClaimRequest from '../models/ClaimRequest';
import SystemConfig from '../models/SystemConfig';
import Transaction from '../models/Transaction';
import Withdrawal from '../models/Withdrawal';
import { recalculateUserIncome } from './userController';

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

        // Common Item Structure Template (using centralized metadata)
        const shopItem = SHOP_ITEMS.find(s => s.id === itemId);

        const createItem = () => {
            const lifespan = shopItem?.lifespanDays || 30;
            const bonus = shopItem ? (Number(shopItem.minBonus) + Number(shopItem.maxBonus)) / 2 : 0;

            return {
                id: uuidv4(),
                typeId: itemId,
                name: shopItem?.name || itemId,
                rarity: shopItem ? 'RARE' : 'COMMON',
                purchasedAt: Date.now(),
                lifespanDays: lifespan,
                expireAt: lifespan > 0 ? Date.now() + (lifespan * 24 * 60 * 60 * 1000) : 0,
                dailyBonus: bonus,
                durationBonus: shopItem?.durationBonus || 0,
                currentDurability: shopItem?.maxDurability || (lifespan * 100),
                maxDurability: shopItem?.maxDurability || (lifespan * 100),
                level: 1,
                isHandmade: false
            };
        };

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

        // --- Fraud Audit Stats ---
        const user = await User.findById(objId);
        const currentBalance = user?.balance || 0;

        // Total Mining Claims
        const totalMiningProfit = revenueMap['MINING_CLAIM'] || 0;
        const totalCompensation = revenueMap['COMPENSATION'] || 0;
        const totalReferralBonus = revenueMap['REFERRAL_BONUS'] || 0;
        const totalQuestReward = revenueMap['QUEST_REWARD'] || 0;
        const totalDailyBonus = revenueMap['DAILY_BONUS'] || 0;
        const totalLuckyDraw = revenueMap['LUCKY_DRAW'] || 0;

        // Sum of all "Free money" from system
        const totalBonusIncome = totalCompensation + totalReferralBonus + totalQuestReward + totalDailyBonus + totalLuckyDraw;

        // Profitability Ratio: (Withdrawals + Balance) / Deposits
        const cashOutPotential = totalWithdrawals + currentBalance;
        const profitabilityRatio = totalDeposits > 0 ? (cashOutPotential / totalDeposits) : 0;

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
            audit: {
                currentBalance,
                totalMiningProfit,
                totalBonusIncome,
                totalCompensation,
                totalReferralBonus,
                totalQuestReward,
                totalDailyBonus,
                profitabilityRatio,
                netCashFlow: totalDeposits - totalWithdrawals
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
        const users = await User.find().select('-passwordHash -pin').sort({ createdAt: -1 });
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
        const { receivingQrCode, usdtWalletAddress, isMaintenanceMode } = req.body;

        // Upsert logic
        let config = await SystemConfig.findOne();
        if (!config) {
            config = new SystemConfig({});
        }

        if (receivingQrCode !== undefined) config.receivingQrCode = receivingQrCode;
        if (usdtWalletAddress !== undefined) config.usdtWalletAddress = usdtWalletAddress;
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

// Get All Deposits (History)
export const getAllDeposits = async (req: AuthRequest, res: Response) => {
    try {
        const deposits = await DepositRequest.find({}).sort({ createdAt: -1 });
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
                if (!user.isFirstDepositPaid && user.referrerId) {
                    const referrer = await User.findById(user.referrerId);
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
                        referrer.referralStats.totalInvited = (referrer.referralStats.totalInvited || 0) + 1;
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

// Get Pending Withdrawals (LEGACY)
export const getLegacyPendingWithdrawals = async (req: AuthRequest, res: Response) => {
    try {
        const withdrawals = await WithdrawalRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Process Withdrawal (Approve/Reject) (LEGACY)
export const processLegacyWithdrawalRequest = async (req: AuthRequest, res: Response) => {
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
// Reset All User Progress and Data (Full Wipe)
export const resetAllPlayerData = async (req: AuthRequest, res: Response) => {
    try {
        console.log('[ADMIN] Performing TOTAL PLAYER DATA RESET (Global Wipe)...');

        // 1. Reset all users to default values
        const userResult = await User.updateMany({}, {
            $set: {
                balance: 0,
                energy: 100,
                inventory: [],
                materials: {},
                stats: {},
                weeklyStats: {},
                claimedQuests: [],
                claimedAchievements: [],
                masteryPoints: 0,
                claimedRanks: [],
                notifications: [],
                checkInStreak: 0,
                lastCheckIn: undefined,
                activeExpedition: null,
                craftingQueue: [],
                unlockedSlots: 3,
                miningSlots: 3,
                lastLuckyDraw: 0,
                overclockExpiresAt: undefined,
                overclockRemainingMs: 0,
                isOverclockActive: false,
                isFirstDepositPaid: false,
                referralStats: { totalInvited: 0, totalEarned: 0 },
                lastEnergyUpdate: new Date(),
                totalDailyIncome: 0
            }
        });

        // 2. Clear all associated game assets and history
        console.log('[ADMIN] Deleting all rigs, transactions, and requests...');
        const rigResult = await Rig.deleteMany({});
        const txResult = await Transaction.deleteMany({});
        const claimResult = await ClaimRequest.deleteMany({});
        const withResult = await WithdrawalRequest.deleteMany({});
        const depResult = await DepositRequest.deleteMany({});

        console.log(`[ADMIN] Total Reset Complete:
            - Users Updated: ${userResult.modifiedCount}
            - Rigs Deleted: ${rigResult.deletedCount}
            - Transactions Deleted: ${txResult.deletedCount}
            - Claims Deleted: ${claimResult.deletedCount}
            - Withdrawals Deleted: ${withResult.deletedCount}
            - Deposits Deleted: ${depResult.deletedCount}`);

        res.json({
            message: 'All player data has been reset successfully',
            count: userResult.modifiedCount,
            details: {
                rigs: rigResult.deletedCount,
                transactions: txResult.deletedCount,
                claims: claimResult.deletedCount,
                withdrawals: withResult.deletedCount,
                deposits: depResult.deletedCount
            }
        });
    } catch (error) {
        console.error('[ADMIN ERROR] resetAllPlayerData failed:', error);
        res.status(500).json({ message: 'Server error during total reset', error });
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

// Reset Individual User (Money, Rigs, Inventory, Stats, Expeditions)
export const resetUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[ADMIN] Performing FULL RESET for user ${user.username} (${userId})...`);

        // 1. Reset user fields to defaults
        user.balance = 0;
        user.energy = 100;
        user.inventory = [];
        user.materials = {};
        user.stats = {};
        user.weeklyStats = {};
        user.claimedQuests = [];
        user.claimedAchievements = [];
        user.masteryPoints = 0;
        user.claimedRanks = [];
        user.notifications = [];
        user.checkInStreak = 0;
        user.lastCheckIn = undefined;
        user.activeExpedition = null;
        user.craftingQueue = [];
        user.unlockedSlots = 3;
        user.miningSlots = 3;
        user.lastLuckyDraw = 0;
        user.overclockExpiresAt = undefined;
        user.overclockRemainingMs = 0;
        user.isOverclockActive = false;
        user.isFirstDepositPaid = false;
        user.referralStats = { totalInvited: 0, totalEarned: 0 };
        user.lastEnergyUpdate = new Date();

        // Mark modified for complex objects/arrays
        user.markModified('inventory');
        user.markModified('materials');
        user.markModified('stats');
        user.markModified('weeklyStats');
        user.markModified('claimedQuests');
        user.markModified('claimedAchievements');
        user.markModified('claimedRanks');
        user.markModified('notifications');
        user.markModified('activeExpedition');
        user.markModified('craftingQueue');

        await user.save();

        // 2. Delete all rigs owned by the user
        const rigDeleteResult = await Rig.deleteMany({ ownerId: userId });
        console.log(`[ADMIN] Deleted ${rigDeleteResult.deletedCount} rigs for user ${user.username}`);

        // 3. Delete related requests to keep it clean
        await ClaimRequest.deleteMany({ userId: userId });
        await Transaction.deleteMany({ userId: userId });

        res.json({ message: 'User reset successfully' });
    } catch (error) {
        console.error('[ADMIN ERROR] resetUser failed:', error);
        res.status(500).json({ message: 'Server error during user reset', error: error instanceof Error ? error.message : error });
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

        user.inventory = user.inventory.filter((item: any) => item.typeId !== 'vip_withdrawal_card');
        user.markModified('inventory');
        await user.save();

        res.json({ message: 'VIP card removed successfully' });
    } catch (error) {
        console.error('[ADMIN ERROR] removeVip failed:', error);
        res.status(500).json({ message: 'Server error during VIP removal', error });
    }
};

export const toggleBan = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isBanned = !user.isBanned;
        await user.save();
        res.json({ message: user.isBanned ? 'User banned' : 'User unbanned', isBanned: user.isBanned });
    } catch (error) {
        console.error('[ADMIN ERROR] toggleBan failed:', error);
        res.status(500).json({ message: 'Server error during toggle-ban', error });
    }
};

// --- NEW ADMIN FUNCTIONS (PART 6) ---

/**
 * Get overall dashboard stats
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRigs = await Rig.countDocuments();
        const pendingWithdrawalsCount = await Withdrawal.countDocuments({ status: 'PENDING' });

        // Calculate total revenue from specific transaction types
        const revenueTypes = ['RIG_BUY', 'REPAIR', 'WITHDRAW_FEE', 'MARKET_FEE', 'ITEM_BUY', 'GAME_LOSS', 'ENERGY_REFILL'];
        const revenueAggregation = await Transaction.aggregate([
            {
                $match: {
                    status: 'COMPLETED',
                    type: { $in: revenueTypes }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

        res.json({
            totalUsers,
            totalRigs,
            pendingWithdrawalsCount,
            totalRevenue
        });
    } catch (error) {
        console.error('[ADMIN ERROR] getDashboardStats failed:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

/**
 * Get detailed revenue stats by type
 */
export const getRevenueStats = async (req: AuthRequest, res: Response) => {
    try {
        const revenueTypes = ['RIG_BUY', 'REPAIR', 'WITHDRAW_FEE', 'MARKET_FEE', 'ITEM_BUY', 'GAME_LOSS', 'ENERGY_REFILL'];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // 1. Totals (Current aggregation)
        const stats = await Transaction.aggregate([
            {
                $match: {
                    status: 'COMPLETED',
                    type: { $in: revenueTypes }
                }
            },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        const totals: Record<string, number> = {
            RIG_BUY: 0,
            REPAIR: 0,
            WITHDRAW_FEE: 0,
            MARKET_FEE: 0,
            ITEM_BUY: 0,
            GAME_LOSS: 0,
            ENERGY_REFILL: 0,
            total: 0
        };

        let grandTotal = 0;
        stats.forEach(item => {
            if (item._id && totals.hasOwnProperty(item._id)) {
                totals[item._id] = item.totalAmount;
                grandTotal += item.totalAmount;
            }
        });
        totals.total = grandTotal;

        // 2. Trend (7-day time series)
        const trendData = await Transaction.aggregate([
            {
                $match: {
                    status: 'COMPLETED',
                    type: { $in: revenueTypes },
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    amount: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Map trend data to a readable format (Date, Amount)
        const trend = trendData.map(d => ({
            date: d._id,
            amount: d.amount
        }));

        // 3. Recent major revenue transactions
        const recent = await Transaction.find({
            status: 'COMPLETED',
            type: { $in: revenueTypes }
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'username');

        const recentFormatted = recent.map((tx: any) => ({
            id: tx._id,
            username: tx.userId?.username || 'System',
            type: tx.type,
            amount: tx.amount,
            description: tx.description,
            timestamp: tx.createdAt
        }));

        // 4. Volume aggregation (APPROVED only) - Ported from getGlobalRevenueStats
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

        const withdrawStats = await Withdrawal.aggregate([
            { $match: { status: 'APPROVED' } },
            {
                $group: {
                    _id: { $cond: { if: { $eq: ["$method", "USDT"] }, then: "USDT", else: "BANK" } },
                    total: { $sum: "$amount" }
                }
            }
        ]);
        const withMap: Record<string, number> = {};
        withdrawStats.forEach(s => withMap[s._id] = s.total);

        res.json({
            totals,
            trend,
            recent: recentFormatted,
            volumes: {
                bank_deposits: depMap['BANK'] || 0,
                usdt_deposits: depMap['USDT'] || 0,
                bank_withdrawals: withMap['BANK'] || 0,
                usdt_withdrawals: withMap['USDT'] || 0
            }
        });
    } catch (error) {
        console.error('[ADMIN ERROR] getRevenueStats failed:', error);
        res.status(500).json({ message: 'Server error fetching revenue stats' });
    }
};

/**
 * Get all pending withdrawals with user details
 */
export const getPendingWithdrawals = async (req: AuthRequest, res: Response) => {
    try {
        const withdrawals = await Withdrawal.find({ status: 'PENDING' })
            .populate('userId', 'username email')
            .sort({ createdAt: -1 });

        res.json(withdrawals);
    } catch (error) {
        console.error('[ADMIN ERROR] getPendingWithdrawals failed:', error);
        res.status(500).json({ message: 'Server error fetching withdrawals' });
    }
};

/**
 * Process a withdrawal request (Approve/Reject)
 */
export const processWithdrawal = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { action, adminNote } = req.body; // action: 'APPROVE' | 'REJECT'

        if (!['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const withdrawal = await Withdrawal.findById(id);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        if (withdrawal.status !== 'PENDING') {
            return res.status(400).json({ message: 'Withdrawal already processed' });
        }

        const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        withdrawal.status = status;
        if (adminNote) withdrawal.adminNote = adminNote;
        await withdrawal.save({ session });

        // Update associated transaction status
        await Transaction.findOneAndUpdate(
            { refId: id, type: 'WITHDRAWAL' },
            { status: status === 'APPROVED' ? 'COMPLETED' : 'FAILED' },
            { session }
        );

        if (action === 'REJECT') {
            // Refund user balance
            const user = await User.findById(withdrawal.userId).session(session);
            if (user) {
                user.balance += withdrawal.amount;
                await user.save({ session });
            }
        }

        await session.commitTransaction();
        res.json({ message: `Withdrawal ${action.toLowerCase()}d successfully`, withdrawal });
    } catch (error) {
        await session.abortTransaction();
        console.error('[ADMIN ERROR] processWithdrawal failed:', error);
        res.status(500).json({ message: 'Server error processing withdrawal' });
    } finally {
        session.endSession();
    }
};

// Delete ALL Players (High Danger)
export const deleteAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        console.log('[ADMIN] CAUTION: Deleting ALL non-admin users...');

        // 1. Find all users who are NOT admins, and NOT the current requester, and NOT the super admin email
        const SUPER_ADMIN_EMAIL = 'raymagdonal4901@gmail.com';
        const usersToDelete = await User.find({
            $and: [
                { role: { $ne: 'ADMIN' } },
                { _id: { $ne: req.userId } },
                { email: { $ne: SUPER_ADMIN_EMAIL } }
            ]
        }, '_id');
        const userIds = usersToDelete.map(u => u._id.toString());

        if (userIds.length === 0) {
            return res.json({ message: 'No player accounts found to delete', count: 0 });
        }

        // 2. Cascade delete all linked records for these specific users
        const rigResult = await Rig.deleteMany({ ownerId: { $in: userIds } });
        const txResult = await Transaction.deleteMany({ userId: { $in: userIds } });
        const claimResult = await ClaimRequest.deleteMany({ userId: { $in: userIds } });
        const withResult = await WithdrawalRequest.deleteMany({ userId: { $in: userIds } });
        const depResult = await DepositRequest.deleteMany({ userId: { $in: userIds } });

        // 3. Finally delete the User records themselves
        const userResult = await User.deleteMany({ _id: { $in: userIds } });

        console.log(`[ADMIN] MASS DELETE COMPLETE:
            - Users Deleted: ${userResult.deletedCount}
            - Rigs Deleted: ${rigResult.deletedCount}
            - Transactions Deleted: ${txResult.deletedCount}
            - Financial Requests Deleted: ${claimResult.deletedCount + withResult.deletedCount + depResult.deletedCount}`);

        res.json({
            message: `Successfully deleted all player accounts (${userResult.deletedCount} users)`,
            count: userResult.deletedCount,
            details: {
                rigs: rigResult.deletedCount,
                transactions: txResult.deletedCount
            }
        });

    } catch (error) {
        console.error('[ADMIN ERROR] deleteAllUsers failed:', error);
        res.status(500).json({ message: 'Server error during mass deletion', error });
    }
};

// Admin Manual Add Rig
export const adminAddRig = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { presetId } = req.body; // The ID from RIG_PRESETS

        console.log(`[ADMIN] Manual Add Rig Preset ${presetId} to User ${userId}...`);

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const preset = RIG_PRESETS.find(p => p.id === Number(presetId));
        if (!preset) return res.status(400).json({ message: 'Invalid Rig Preset ID' });

        const volConfig = MINING_VOLATILITY_CONFIG[preset.id];
        const lifespanDays = preset.durationMonths ? (preset.durationMonths * 30) : (preset.durationDays || 365);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + lifespanDays);

        const rig = await Rig.create({
            ownerId: user._id,
            name: preset.name,
            investment: preset.price,
            dailyProfit: preset.dailyProfit,
            expiresAt,
            slots: [null, null, null, null, null],
            rarity: preset.type || 'COMMON',
            repairCost: preset.repairCost || 0,
            energyCostPerDay: preset.energyCostPerDay || 0,
            bonusProfit: preset.bonusProfit || 0,
            lastClaimAt: new Date(),
            tierId: preset.id,
            currentDurability: volConfig?.durabilityMax || 3000,
            status: 'ACTIVE',
            totalMined: 0,
            level: 1
        });

        // Log Transaction
        const adminTx = new Transaction({
            userId: 'SYSTEM',
            type: 'SYSTEM_ADJUSTMENT',
            amount: 0,
            status: 'COMPLETED',
            description: `Admin manual add rig: ${preset.name.en} to user ${user.username}`
        });
        await adminTx.save();

        // Recalculate Income
        await recalculateUserIncome(user._id.toString());

        res.json({ message: 'Rig added successfully by admin', rig });
    } catch (error) {
        console.error('[ADMIN ERROR] adminAddRig failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

/**
 * REPAIR REFERRAL LINKS
 * 
 * สแกนผู้ใช้ทั้งหมดที่ไม่มี referrerId แต่มีการลงทะเบียนผ่าน referral link
 * โดยการตรวจสอบ username ของผู้แนะนำที่อาจถูกเก็บไว้ใน field อื่น
 * หรือสร้าง referrerId ใหม่จาก referralCode ที่ตรงกัน
 * 
 * วิธีการ: ดึงผู้ใช้ทุกคน แล้วหาว่าใครที่ referralCode ตรงกับ referrerId ที่ควรจะเป็น
 */
export const repairReferralLinks = async (req: AuthRequest, res: Response) => {
    try {
        console.log('[REPAIR] Starting referral link repair...');

        // ดึงผู้ใช้ทั้งหมดที่ไม่มี referrerId หรือเป็น null
        const usersWithoutReferrer = await User.find({
            $or: [
                { referrerId: { $exists: false } },
                { referrerId: null }
            ]
        })
            .select('_id username referralCode usedReferralCode createdAt')
            .lean();

        // ดึงผู้ใช้ทั้งหมดที่มีข้อมูล (เพื่อใช้ lookup)
        const allUsers = await User.find({})
            .select('_id username referralCode')
            .lean();

        // สร้าง map สำหรับ lookup (ทั้ง username และ referralCode)
        const lookupMap: Record<string, any> = {};
        for (const u of allUsers) {
            if (u.referralCode) lookupMap[u.referralCode.toUpperCase()] = u;
            if (u.username) lookupMap[u.username.toUpperCase()] = u;
        }

        let fixed = 0;
        const report: string[] = [];

        for (const user of usersWithoutReferrer) {
            // ลองซ่อมจาก usedReferralCode (ถ้ามี)
            let refCode = (user as any).usedReferralCode?.toUpperCase();

            // ถ้าไม่มี usedReferralCode ให้ลองหาจาก field อื่นๆ ที่อาจจะเก็บไว้ (ถ้ามี)
            if (!refCode && (user as any).referrerUsername) {
                refCode = (user as any).referrerUsername.toUpperCase();
            }

            if (refCode && lookupMap[refCode]) {
                const referrer = lookupMap[refCode];
                // ป้องกันการแนะนำตัวเอง
                if (referrer._id.toString() !== user._id.toString()) {
                    await User.updateOne(
                        { _id: user._id },
                        { $set: { referrerId: referrer._id } }
                    );
                    // อัปเดต stat ให้ผู้แนะนำด้วย
                    await User.updateOne(
                        { _id: referrer._id },
                        { $inc: { 'referralStats.totalInvited': 1 } }
                    );
                    fixed++;
                    report.push(`Fixed: ${user.username} -> referred by ${referrer.username}`);
                }
            }
        }

        console.log(`[REPAIR] Complete. Fixed ${fixed} referral links.`);
        res.json({
            message: `Repair complete. Fixed ${fixed} referral links.`,
            totalUsersScanned: usersWithoutReferrer.length,
            fixedCount: fixed,
            report
        });
    } catch (error) {
        console.error('[REPAIR ERROR]', error);
        res.status(500).json({ message: 'Repair failed', error });
    }
};

/**
 * SYNC REFERRAL STATS FOR A SPECIFIC USER
 * 
 * นับจำนวนลูกทีมจริงจากฐานข้อมูล แล้วอัปเดต referralStats ให้ถูกต้อง
 */
export const syncReferralStats = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // นับจำนวนลูกทีมจริง
        const l1Count = await User.countDocuments({ referrerId: targetUser._id });
        const l1Users = await User.find({ referrerId: targetUser._id }).select('_id');
        const l1Ids = l1Users.map(u => u._id);
        const l2Count = await User.countDocuments({ referrerId: { $in: l1Ids } });
        const l2Users = await User.find({ referrerId: { $in: l1Ids } }).select('_id');
        const l2Ids = l2Users.map(u => u._id);
        const l3Count = await User.countDocuments({ referrerId: { $in: l2Ids } });

        const oldStats = { ...targetUser.referralStats };

        // อัปเดต stats
        await User.updateOne(
            { _id: targetUser._id },
            {
                $set: {
                    'referralStats.totalInvited': l1Count
                }
            }
        );

        res.json({
            success: true,
            username: targetUser.username,
            oldStats,
            newStats: { totalInvited: l1Count },
            actualCounts: { l1: l1Count, l2: l2Count, l3: l3Count, total: l1Count + l2Count + l3Count }
        });
    } catch (error) {
        console.error('[SYNC ERROR]', error);
        res.status(500).json({ message: 'Sync failed', error });
    }
};

/**
 * SYNC ALL REFERRAL STATS
 * 
 * Recalculates and syncs referral counts for ALL users in the database.
 */
export const syncAllReferralStats = async (req: AuthRequest, res: Response) => {
    try {
        console.log('[REPAIR] Starting global referral stats sync...');
        const allUsers = await User.find({}).select('_id username referralStats');

        let updatedCount = 0;
        const reports = [];

        for (const user of allUsers) {
            const actualL1Count = await User.countDocuments({ referrerId: user._id });
            const currentStats = (user as any).referralStats?.totalInvited || 0;

            if (actualL1Count !== currentStats) {
                await User.updateOne(
                    { _id: user._id },
                    { $set: { 'referralStats.totalInvited': actualL1Count } }
                );
                updatedCount++;
                reports.push(`Updated ${user.username}: ${currentStats} -> ${actualL1Count}`);
            }
        }

        console.log(`[REPAIR] Global sync complete. Updated ${updatedCount} users.`);
        res.json({
            success: true,
            message: `Global sync complete. Updated ${updatedCount} users.`,
            updatedCount,
            reports: reports.slice(0, 50) // Return only first 50 to avoid huge response
        });
    } catch (error) {
        console.error('[SYNC ALL ERROR]', error);
        res.status(500).json({ message: 'Global sync failed', error });
    }
};

/**
 * GET USER BY REFERRAL CODE (for admin lookup)
 * รองรับทั้งการค้นหาด้วย referralCode และ username
 */
export const getUserByReferralCode = async (req: AuthRequest, res: Response) => {
    try {
        const { code } = req.params;
        const normalizedCode = code.trim().toUpperCase();

        const user = await User.findOne({
            $or: [
                { referralCode: { $regex: new RegExp(`^${normalizedCode}$`, 'i') } },
                { username: { $regex: new RegExp(`^${normalizedCode}$`, 'i') } }
            ]
        }).select('_id username referralCode referralStats createdAt');

        if (!user) {
            return res.status(404).json({ message: `No user found with code/username: ${code}` });
        }

        // นับจำนวนลูกทีมจริง
        const l1Users = await User.find({ referrerId: user._id }).select('username createdAt');
        const l1Ids = l1Users.map(u => u._id);
        const l2Count = await User.countDocuments({ referrerId: { $in: l1Ids } });
        const l2Users = await User.find({ referrerId: { $in: l1Ids } }).select('_id');
        const l2Ids = l2Users.map(u => u._id);
        const l3Count = await User.countDocuments({ referrerId: { $in: l2Ids } });

        res.json({
            user: {
                id: user._id,
                username: user.username,
                referralCode: user.referralCode,
                storedStats: user.referralStats,
                createdAt: user.createdAt
            },
            actualCounts: {
                l1: l1Users.length,
                l2: l2Count,
                l3: l3Count,
                total: l1Users.length + l2Count + l3Count
            },
            l1Members: l1Users.map(u => ({ username: u.username, joinedAt: (u as any).createdAt }))
        });
    } catch (error) {
        console.error('[LOOKUP ERROR]', error);
        res.status(500).json({ message: 'Lookup failed', error });
    }
};
export const lookupUSDTDeposit = async (req: AuthRequest, res: Response) => {
    try {
        const { walletAddress } = req.query;

        if (!walletAddress) {
            return res.status(400).json({ message: 'Wallet address is required' });
        }

        const deposits = await DepositRequest.find({
            $or: [
                { fromWallet: { $regex: new RegExp(`^${walletAddress}$`, 'i') } },
                { slipImage: 'CRYPTO_USDT_BSC' } // Fallback for auto-detected ones
            ]
        }).sort({ createdAt: -1 });

        res.json(deposits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
