import { Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { SHOP_ITEMS } from './craftingController';

// --- MIRRORED CONSTANTS ---
const MATERIAL_CONFIG = {
    NAMES: {
        1: { th: 'ถ่านหิน', en: 'Coal' },
        2: { th: 'ทองแดง', en: 'Copper' },
        3: { th: 'เหล็ก', en: 'Iron' },
        4: { th: 'ทองคำ', en: 'Gold' },
        5: { th: 'เพชร', en: 'Diamond' },
        7: { th: 'ไวเบรเนียม', en: 'Vibranium' }
    } as Record<number, { th: string; en: string }>
};

const EQUIPMENT_UPGRADE_CONFIG: Record<string, Record<number, any>> = {
    'glove': {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    }
};

const UPGRADE_REQUIREMENTS: Record<number, any> = {
    1: { matTier: 1, matAmount: 10, chipAmount: 1, chance: 1.0, label: '+2', cost: 50, targetBonus: 0.5, risk: 'NONE' },
    2: { matTier: 1, matAmount: 20, chipAmount: 5, chance: 0.8, label: '+3', cost: 100, targetBonus: 1.5, risk: 'DROP' },
    3: { matTier: 2, matAmount: 20, chipAmount: 10, chance: 0.5, label: '+4', cost: 300, targetBonus: 3.0, risk: 'DROP' },
    4: { matTier: 2, matAmount: 40, chipAmount: 20, chance: 0.25, label: '+5', cost: 1000, targetBonus: 6.0, risk: 'BREAK' },
};



// ... existing buyAccessory ...
export const buyAccessory = async (req: AuthRequest, res: Response) => {
    const start = Date.now();
    try {
        const { itemId, typeId, price, name, dailyBonus, rarity, lifespanDays } = req.body;
        const actualItemId = itemId || typeId; // Handle mismatch
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.balance < price) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // --- AI ROBOT COOLDOWN CHECK ---
        if (actualItemId === 'robot') {
            const existingRobot = (user.inventory || []).find((i: any) => i.typeId === 'robot');
            if (existingRobot) {
                const now = Date.now();
                if (existingRobot.expireAt && existingRobot.expireAt > now) {
                    const diff = existingRobot.expireAt - now;
                    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                    return res.status(400).json({ message: `หุ่นยนต์ AI ยังทำงานอยู่ (คูลดาวน์ ${days} วัน)` });
                }
            }
        }

        // Deduct balance
        user.balance -= price;

        const accessoryId = Math.random().toString(36).substr(2, 9);
        const expireAt = lifespanDays ? Date.now() + (lifespanDays * 24 * 60 * 60 * 1000) : null;

        // --- BONUS RANDOMIZATION LOGIC ---
        // Mirroring min/max bonus logic from frontend constants to ensure server-side validation/generation
        let calculatedBonus = dailyBonus || 0;

        // Define bonus ranges for known items (Mirrored from constants.ts)
        const BONUS_CONFIG: Record<string, { min: number, max: number }> = {
            'hat': { min: 0.1, max: 0.5 },
            'uniform': { min: 0.5, max: 1.5 },
            'bag': { min: 1.0, max: 2.0 },
            'boots': { min: 2.0, max: 3.0 },
            'glasses': { min: 2.5, max: 3.5 },
            'mobile': { min: 3.0, max: 4.0 },
            'pc': { min: 4.0, max: 5.0 },
            'auto_excavator': { min: 10.0, max: 12.0 }
        };

        if (BONUS_CONFIG[actualItemId]) {
            const { min, max } = BONUS_CONFIG[actualItemId];
            // Randomize between min and max (inclusive-ish for floats)
            calculatedBonus = Math.random() * (max - min) + min;
            // Round to 2 decimal places
            calculatedBonus = Math.round(calculatedBonus * 100) / 100;
        }

        const newItem = {
            id: accessoryId,
            typeId: actualItemId,
            name: name,
            price: price,
            dailyBonus: calculatedBonus,
            rarity: rarity || 'COMMON',
            purchasedAt: Date.now(),
            lifespanDays: lifespanDays || 9999,
            expireAt: expireAt,
            level: 1
        };

        if (!user.inventory) user.inventory = [];
        user.inventory.push(newItem);

        await user.save();

        // Update Weekly Stats for Quests
        if (!user.weeklyStats) user.weeklyStats = { materialsCrafted: 0, moneySpent: 0, dungeonsEntered: 0, itemsCrafted: 0, repairAmount: 0, rareLootCount: 0 };
        user.weeklyStats.itemsCrafted = (user.weeklyStats.itemsCrafted || 0) + 1;
        user.weeklyStats.moneySpent = (user.weeklyStats.moneySpent || 0) + price;
        user.markModified('weeklyStats');

        // Log Transaction
        const purchaseTx = new Transaction({
            userId,
            type: 'ACCESSORY_PURCHASE',
            amount: price,
            status: 'COMPLETED',
            description: `ซื้ออุปกรณ์: ${typeof name === 'object' ? name.th : name}`
        });
        await purchaseTx.save();

        res.status(201).json({
            success: true,
            balance: user.balance,
            item: newItem
        });
        console.log(`[PERF] buyAccessory took ${Date.now() - start}ms`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const upgradeAccessory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { itemId, useInsurance } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.inventory) return res.status(404).json({ message: 'User not found' });

        const itemIndex = user.inventory.findIndex((i: any) => (i.id === itemId || i._id === itemId));
        if (itemIndex === -1) return res.status(404).json({ message: 'Item not found' });

        const item = user.inventory[itemIndex];
        const currentLevel = item.level || 1;

        if (currentLevel >= 5) return res.status(400).json({ message: 'Item is already at max level' });

        // Insurance Check
        if (useInsurance) {
            const cardIdx = user.inventory.findIndex((i: any) => i.typeId === 'insurance_card');
            if (cardIdx === -1) return res.status(400).json({ message: 'ไม่มีใบประกันความเสี่ยง' });
            // Consume card
            user.inventory.splice(cardIdx, 1);
        }

        // Determine Config
        let seriesKey = Object.keys(EQUIPMENT_UPGRADE_CONFIG).find(key => item.typeId.includes(key)) || null;
        let reqs = seriesKey ? EQUIPMENT_UPGRADE_CONFIG[seriesKey][currentLevel] : UPGRADE_REQUIREMENTS[currentLevel];

        if (!reqs) return res.status(400).json({ message: 'Upgrade configuration not found' });

        const matTier = reqs.matTier || 1;
        const matAmount = reqs.matAmount || 0;
        const cost = reqs.cost || 0;
        const chipAmount = reqs.chipAmount || reqs.catalyst || 0;
        const chance = reqs.chance || 0.5;

        // Validate Materials
        if (!user.materials || (user.materials[matTier.toString()] || 0) < matAmount) {
            return res.status(400).json({ message: `วัตถุดิบไม่พอ: ${MATERIAL_CONFIG.NAMES[matTier]?.th || matTier}` });
        }

        // Validate Chips
        if (chipAmount > 0) {
            const chips = user.inventory.filter((i: any) => i.typeId === 'upgrade_chip');
            if (chips.length < chipAmount) {
                return res.status(400).json({ message: `ชิปอัปเกรดไม่พอ (มี ${chips.length}/${chipAmount})` });
            }
        }

        // Validate Balance
        if (user.balance < cost) {
            return res.status(400).json({ message: 'ยอดเงินไม่เพียงพอ' });
        }

        // Execute Deductions
        user.balance -= cost;
        user.materials[matTier.toString()] -= matAmount;
        user.markModified('materials');

        if (chipAmount > 0) {
            let removed = 0;
            while (removed < chipAmount) {
                const idx = user.inventory.findIndex((i: any) => i.typeId === 'upgrade_chip');
                if (idx !== -1) {
                    user.inventory.splice(idx, 1);
                    removed++;
                } else break;
            }
        }

        // Roll for success
        const roll = Math.random();
        let success = roll < chance;

        if (success) {
            item.level = currentLevel + 1;
            // Refined Incremental Logic:
            const currentTarget = UPGRADE_REQUIREMENTS[currentLevel - 1]?.targetBonus || 0;
            const nextTarget = reqs.targetBonus || 0;
            const increase = nextTarget - currentTarget;

            item.dailyBonus = parseFloat((item.dailyBonus + increase).toFixed(2));
        } else {
            if (!useInsurance) {
                // If not using insurance, level drops or item breaks? 
                // MockDB says: item breakage or level drop. 
                // Let's implement level drop for now to be less harsh.
                item.level = Math.max(1, currentLevel - 1);
                // Also reduce bonus
                item.dailyBonus = parseFloat((item.dailyBonus * 0.8).toFixed(2));
            }
            // If insurance used, nothing happens to the item level
        }

        user.markModified('inventory');
        // Update Weekly Stats for Quests
        if (!user.weeklyStats) user.weeklyStats = { materialsCrafted: 0, moneySpent: 0, dungeonsEntered: 0, itemsCrafted: 0, repairAmount: 0, rareLootCount: 0 };
        user.weeklyStats.moneySpent = (user.weeklyStats.moneySpent || 0) + cost;
        user.markModified('weeklyStats');

        await user.save();

        // Log Transaction
        const upgradeTx = new Transaction({
            userId,
            type: 'ACCESSORY_UPGRADE',
            amount: cost,
            status: success ? 'COMPLETED' : 'REJECTED',
            description: `อัปเกรดอุปกรณ์: ${typeof item.name === 'object' ? item.name.th : item.name} (ระดับ ${currentLevel} -> ${item.level})`
        });
        await upgradeTx.save();

        res.json({
            success,
            message: success ? 'อัปเกรดสำเร็จ!' : (useInsurance ? 'การอัปเกรดล้มเหลว (ใบประกันทำงาน)' : 'การอัปเกรดล้มเหลว!'),
            item: item,
            inventory: user.inventory,
            balance: user.balance
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- EQUIPMENT REPAIR ---
// Repair Kit Tier -> Target Equipment mapping
const REPAIR_KIT_TARGETS: Record<string, string[]> = {
    'repair_kit_1': ['hat', 'uniform'],
    'repair_kit_2': ['bag', 'boots'],
    'repair_kit_3': ['glasses', 'mobile'],
    'repair_kit_4': ['pc', 'auto_excavator']
};

export const repairEquipment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { targetItemId, repairKitId } = req.body;

        if (!targetItemId || !repairKitId) {
            return res.status(400).json({ message: 'กรุณาระบุอุปกรณ์และชุดซ่อม' });
        }

        const user = await User.findById(userId);
        if (!user || !user.inventory) return res.status(404).json({ message: 'User not found' });

        // Find both items in inventory
        const targetIndex = user.inventory.findIndex((i: any) => i.id === targetItemId);
        const kitIndex = user.inventory.findIndex((i: any) => i.id === repairKitId);

        if (targetIndex === -1) return res.status(404).json({ message: 'ไม่พบอุปกรณ์ที่ต้องการซ่อม' });
        if (kitIndex === -1) return res.status(404).json({ message: 'ไม่พบชุดซ่อม' });

        const targetItem = user.inventory[targetIndex];
        const repairKit = user.inventory[kitIndex];

        // Validate it's actually a repair kit
        if (!repairKit.isRepairKit && !repairKit.typeId?.startsWith('repair_kit_')) {
            return res.status(400).json({ message: 'ไอเทมนี้ไม่ใช่ชุดซ่อม' });
        }

        // Validate tier match
        const kitTypeId = repairKit.typeId;
        const allowedTargets = repairKit.targetEquipment || REPAIR_KIT_TARGETS[kitTypeId] || [];
        const targetTypeId = targetItem.typeId || '';

        if (!allowedTargets.includes(targetTypeId)) {
            return res.status(400).json({
                message: `ชุดซ่อมนี้ใช้ไม่ได้กับ ${typeof targetItem.name === 'object' ? targetItem.name.th : targetItem.name}`,
                allowedTargets
            });
        }

        // Validate target has expireAt
        if (!targetItem.expireAt && !targetItem.lifespanDays) {
            return res.status(400).json({ message: 'อุปกรณ์นี้ไม่มีอายุการใช้งาน ไม่ต้องซ่อม' });
        }

        // Calculate new expiry
        const repairDays = repairKit.repairDays || 30;
        const repairMs = repairDays * 24 * 60 * 60 * 1000;
        const now = Date.now();

        // If expired, extend from now. If not expired, extend from current expiry.
        // If expired, extend from now. If not expired, extend from current expiry.
        const currentExpiry = targetItem.expireAt || now;
        const baseTime = currentExpiry > now ? currentExpiry : now;

        let newExpiry = baseTime + repairMs;

        // Cap expiry to max lifespan (prevent infinite stacking)
        if (targetItem.lifespanDays) {
            const maxExpiry = now + (targetItem.lifespanDays * 24 * 60 * 60 * 1000);
            if (newExpiry > maxExpiry) {
                newExpiry = maxExpiry;
            }
        } else {
            // Fallback to finding config if lifespanDays missing on item instance
            const config = SHOP_ITEMS.find(s => s.id === targetItem.typeId);
            if (config && config.lifespanDays) {
                const maxExpiry = now + (config.lifespanDays * 24 * 60 * 60 * 1000);
                if (newExpiry > maxExpiry) {
                    newExpiry = maxExpiry;
                }
            }
        }

        targetItem.expireAt = newExpiry;

        // Burn the repair kit
        user.inventory.splice(kitIndex, 1);
        user.markModified('inventory');

        // Update weekly stats
        if (!user.weeklyStats) user.weeklyStats = {};
        user.weeklyStats.repairAmount = (user.weeklyStats.repairAmount || 0) + 1;
        user.markModified('weeklyStats');

        await user.save();

        // Log transaction
        const repairTx = new Transaction({
            userId,
            type: 'EQUIPMENT_REPAIR',
            amount: 0,
            status: 'COMPLETED',
            description: JSON.stringify({
                th: `ซ่อมบำรุง: ${typeof targetItem.name === 'object' ? targetItem.name.th : targetItem.name} (+${repairDays} วัน)`,
                en: `Repaired: ${typeof targetItem.name === 'object' ? targetItem.name.en : targetItem.name} (+${repairDays} days)`
            })
        });
        await repairTx.save();

        const newExpiryDate = new Date(targetItem.expireAt);
        const daysLeft = Math.ceil((targetItem.expireAt - now) / (24 * 60 * 60 * 1000));

        console.log(`[REPAIR] User ${userId} repaired ${targetItem.typeId} with ${kitTypeId}, new expiry: ${newExpiryDate.toISOString()}`);

        res.json({
            success: true,
            message: `ซ่อมบำรุงสำเร็จ! อายุใช้งานเพิ่ม ${repairDays} วัน`,
            item: targetItem,
            newExpireAt: targetItem.expireAt,
            daysLeft,
            inventory: user.inventory
        });

    } catch (error) {
        console.error('repairEquipment Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

