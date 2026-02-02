import { Request, Response } from 'express';
import Rig from '../models/Rig';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Get all rigs for a user
export const getMyRigs = async (req: AuthRequest, res: Response) => {
    try {
        const rigs = await Rig.find({ ownerId: req.userId });
        res.json(rigs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Buy a rig
export const buyRig = async (req: AuthRequest, res: Response) => {
    try {
        const { name, investment, dailyProfit, durationDays, repairCost, energyCostPerDay, bonusProfit } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.balance < investment) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Deduct balance
        user.balance -= investment;

        // --- GLOVE GENERATION (Free Starter Glove) ---
        const rand = Math.random() * 100;
        let rarity = 'COMMON';
        let bonus = 10;
        if (rand < 80) { rarity = 'COMMON'; bonus = 10; }
        else if (rand < 91) { rarity = 'RARE'; bonus = 20; }
        else if (rand < 96) { rarity = 'SUPER_RARE'; bonus = 50; }
        else if (rand < 99) { rarity = 'EPIC'; bonus = 100; }
        else { rarity = 'LEGENDARY'; bonus = 200; }

        const gloveId = Math.random().toString(36).substr(2, 9);
        // Simple name mapping
        const names: any = { COMMON: 'ถุงมือทำงาน', RARE: 'ถุงมือช่างทอง', SUPER_RARE: 'ถุงมือหยก', EPIC: 'ถุงมือราชันย์', LEGENDARY: 'ถุงมือพระเจ้า' };

        const newGlove = {
            id: gloveId,
            typeId: 'glove',
            name: names[rarity] || 'Glove',
            price: 0,
            dailyBonus: bonus,
            durationBonus: 0,
            rarity,
            purchasedAt: Date.now(),
            lifespanDays: 9999,
            expireAt: Date.now() + (9999 * 24 * 60 * 60 * 1000),
            level: 1
        };

        // Add to inventory (using type casting because Mongoose arrays are tricky with Mixed)
        if (!user.inventory) user.inventory = [];
        user.inventory.push(newGlove);
        await user.save();

        // Create Rig with Glove Equipped in Slot 0
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        const rig = await Rig.create({
            ownerId: userId,
            name,
            investment,
            dailyProfit,
            expiresAt,
            slots: [gloveId, null, null, null, null], // Equip glove
            rarity,
            repairCost: repairCost || 0,
            energyCostPerDay: energyCostPerDay || 0,
            bonusProfit: bonusProfit || 0
        });
        rig.rarity = rarity; // Update rig rarity
        await rig.save();

        // Return both
        res.status(201).json({ rig, glove: newGlove });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Refill a specific rig's energy
export const refillRigEnergy = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { id: rigId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: userId });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // Calculate needed energy (simplified drain logic matching frontend/MockDB for consistency)
        const now = new Date();
        const lastUpdate = rig.lastEnergyUpdate || rig.purchaseDate || now;
        const elapsedHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

        // 100% in 24 hours (4.166% per hour)
        const drain = elapsedHours * 4.166666666666667;
        const currentEnergy = Math.max(0, Math.min(100, (rig.energy ?? 100) - drain));
        const needed = 100 - currentEnergy;

        if (needed <= 0) {
            return res.status(400).json({ message: 'Energy is already full' });
        }

        // Cost is proportional to needed energy
        const baseCost = rig.energyCostPerDay || 0;
        let cost = (needed / 100) * baseCost;
        if (cost < 0.1) cost = 0.1; // Minimum fee

        if (user.balance < cost) {
            return res.status(400).json({ message: 'ยอดเงินในวอลเลทไม่เพียงพอ' });
        }

        // Deduct balance and update rig
        user.balance -= cost;
        rig.energy = 100;
        rig.lastEnergyUpdate = now;

        await user.save();
        await rig.save();

        res.json({
            message: 'Rig energy refilled',
            cost,
            balance: user.balance,
            energy: rig.energy
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
