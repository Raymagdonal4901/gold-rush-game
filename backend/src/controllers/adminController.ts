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

// Convert All Currency Data to USD (1 USD = 35 THB)
export const adminConvertCurrencyToUSD = async (req: AuthRequest, res: Response) => {
    try {
        const rate = 35;

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
        console.log('[ADMIN DEBUG] adminGiveCompensation called body:', req.body);
        const { userId, amount, reason } = req.body;
        let user;
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(userId);
        }
        if (!user) {
            user = await User.findOne({ username: userId });
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        user.balance += amountNum;
        await user.save();

        // Create Transaction Record
        const transaction = new Transaction({
            userId: user.id,
            type: 'COMPENSATION',
            amount: amountNum,
            status: 'COMPLETED',
            description: reason || 'Server Maintenance Compensation'
        });
        await transaction.save();

        res.json({ message: 'Compensation successful', newBalance: user.balance });
    } catch (error) {
        console.error('[ADMIN ERROR] adminGiveCompensation failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Add Item to User
export const adminAddItem = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, itemId, amount } = req.body;
        let user;
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(userId);
        }
        if (!user) {
            user = await User.findOne({ username: userId });
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        const amountNum = Number(amount) || 1;

        const newItem = {
            id: uuidv4(),
            typeId: itemId,
            name: itemId,
            rarity: 'COMMON',
            purchasedAt: Date.now(),
            lifespanDays: 30,
            isHandmade: false
        };

        for (let i = 0; i < amountNum; i++) {
            user.inventory.push({ ...newItem, id: uuidv4() });
        }

        await user.save();

        res.json({ message: 'Item added successfully', inventory: user.inventory });
    } catch (error) {
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

        // 3.5 Total Revenue
        const total_revenue = rev_energy_items + rev_market_fees + rev_withdrawal_fees + rev_repair_fees;

        res.json({
            energy_items: rev_energy_items,
            market_fees: rev_market_fees,
            withdrawal_fees: rev_withdrawal_fees,
            withdrawal_fees_bank: withdrawal_fees_bank,
            withdrawal_fees_usdt: withdrawal_fees_usdt,
            repair_fees: rev_repair_fees,
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
        const revenueTypes = ['ENERGY_REFILL', 'ACCESSORY_PURCHASE', 'MARKET_TAX', 'REPAIR'];

        // Delete or mark these transactions as processed/cleared
        // For now we delete them to reset the sum to 0
        const result = await Transaction.deleteMany({ type: { $in: revenueTypes } });

        console.log(`[ADMIN] Revenue stats cleared. Deleted ${result.deletedCount} transactions.`);
        res.json({
            message: 'Revenue stats cleared successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('[ADMIN ERROR] clearRevenueStats failed:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
