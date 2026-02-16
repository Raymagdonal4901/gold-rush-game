import { Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { MATERIAL_CONFIG, SHOP_ITEMS, REPAIR_KITS } from '../constants';

// Helper to find item config from either SHOP_ITEMS or REPAIR_KITS
const findCraftableItem = (itemId: string) => {
    const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
    if (shopItem) return { ...shopItem, isRepairKit: false };
    const repairKit = REPAIR_KITS.find(i => i.id === itemId);
    if (repairKit) return { ...repairKit, isRepairKit: true, lifespanDays: 0, minBonus: 0, maxBonus: 0 };
    return null;
};

// Get crafting queue
export const getCraftingQueue = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ queue: user.craftingQueue || [] });
    } catch (error) {
        console.error('getCraftingQueue Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Start crafting an item
export const startCrafting = async (req: AuthRequest, res: Response) => {
    try {
        const { itemId } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const itemConfig = findCraftableItem(itemId);
        if (!itemConfig || !itemConfig.craftingRecipe) {
            return res.status(400).json({ message: 'ไม่พบสูตรการผลิตสำหรับไอเทมนี้' });
        }

        // Initialize materials if missing
        if (!user.materials) user.materials = {};

        // Convert user.materials to ensure consistent access (handle Map vs Object vs undefined)
        const userMaterials: Record<string, number> = user.materials instanceof Map ? Object.fromEntries(user.materials) : user.materials;

        // Check materials
        for (const [tierStr, needed] of Object.entries(itemConfig.craftingRecipe)) {
            const tier = parseInt(tierStr);
            const owned = userMaterials[tier.toString()] || 0;

            if (owned < needed) {
                const matNameObj = MATERIAL_CONFIG.NAMES[tier] || { th: `แร่ #${tier}`, en: `Material #${tier}` };
                const matName = typeof matNameObj === 'object' ? matNameObj.th : matNameObj;
                return res.status(400).json({
                    message: `วัตถุดิบไม่พอ: ต้องการ ${matName} (${owned}/${needed})`,
                    missing: { id: tier, name: matName, need: needed, have: owned }
                });
            }
        }

        // Check balance for fee
        const fee = itemConfig.craftingFee || 0;
        if (user.balance < fee) {
            return res.status(400).json({ message: `เงินไม่พอสำหรับค่าธรรมเนียม (${fee} บาท)` });
        }

        // Check required item (e.g., Mixer)
        if ((itemConfig as any).requiredItem) {
            const requiredItemId = (itemConfig as any).requiredItem;
            const hasItem = user.inventory && user.inventory.some((i: any) => i.typeId === requiredItemId);
            if (!hasItem) {
                const itemName = SHOP_ITEMS.find(i => i.id === requiredItemId)?.name.th || requiredItemId;
                return res.status(400).json({ message: `จำเป็นต้องมีอุปกรณ์: ${itemName}` });
            }

            // Consume required item
            const itemIndex = user.inventory.findIndex((i: any) => i.typeId === requiredItemId);
            if (itemIndex !== -1) {
                user.inventory.splice(itemIndex, 1);
                user.markModified('inventory');
            }
        }

        // Deduct materials
        for (const [tierStr, needed] of Object.entries(itemConfig.craftingRecipe)) {
            const tier = parseInt(tierStr);
            // Ensure we update the actual user.materials object/map
            if (user.materials instanceof Map) {
                const curent = user.materials.get(tier.toString()) || 0;
                user.materials.set(tier.toString(), Math.max(0, curent - needed));
            } else {
                user.materials[tier.toString()] = (user.materials[tier.toString()] || 0) - needed;
            }
        }
        user.markModified('materials');

        // Deduct fee
        user.balance -= fee;

        // Add to crafting queue
        const queueId = Math.random().toString(36).substr(2, 9);
        const now = Date.now();
        const durationMs = (itemConfig.craftDurationMinutes || 30) * 60 * 1000;

        if (!user.craftingQueue) user.craftingQueue = [];
        user.craftingQueue.push({
            id: queueId,
            itemId: itemId,
            startedAt: now,
            finishAt: now + durationMs
        });
        user.markModified('craftingQueue');

        // Update weekly stats
        if (!user.weeklyStats) user.weeklyStats = {};
        user.weeklyStats.moneySpent = (user.weeklyStats.moneySpent || 0) + fee;
        user.markModified('weeklyStats');

        await user.save();

        // Log transaction
        const craftTx = new Transaction({
            userId,
            type: 'ACCESSORY_CRAFT_START',
            amount: fee,
            status: 'COMPLETED',
            description: `เริ่มผลิต: ${typeof itemConfig.name === 'object' ? itemConfig.name.th : itemConfig.name}`
        });
        await craftTx.save();

        console.log(`[CRAFTING] User ${userId} started crafting ${itemId}, Queue ID: ${queueId}`);

        res.json({
            success: true,
            queueId,
            queue: user.craftingQueue,
            materials: user.materials,
            balance: user.balance
        });

    } catch (error) {
        console.error('startCrafting Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Claim a crafted item
export const claimCraftedItem = async (req: AuthRequest, res: Response) => {
    try {
        const { queueId } = req.params;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.craftingQueue) user.craftingQueue = [];
        const queueIndex = user.craftingQueue.findIndex((q: any) => q.id === queueId);
        if (queueIndex === -1) {
            return res.status(404).json({ message: 'ไม่พบรายการในคิว' });
        }

        const queueItem = user.craftingQueue[queueIndex];
        const now = Date.now();

        if (now < queueItem.finishAt) {
            const remaining = Math.ceil((queueItem.finishAt - now) / 60000);
            return res.status(400).json({ message: `ยังไม่เสร็จ อีก ${remaining} นาที` });
        }

        const itemConfig = findCraftableItem(queueItem.itemId);
        if (!itemConfig) {
            return res.status(400).json({ message: 'ไม่พบข้อมูลไอเทม' });
        }

        let newItem: any;
        let isGreatSuccess = false;

        if (itemConfig.isRepairKit) {
            // Repair Kit: consumable with specific rarity
            const kitId = Math.random().toString(36).substr(2, 9);
            newItem = {
                id: kitId,
                typeId: itemConfig.id,
                name: itemConfig.name,
                price: 0,
                dailyBonus: 0,
                rarity: (itemConfig as any).rarity || 'COMMON', // Use config rarity
                purchasedAt: Date.now(),
                isRepairKit: true,
                repairTier: (itemConfig as any).repairTier,
                repairValue: (itemConfig as any).repairValue, // HP-based
                targetEquipment: (itemConfig as any).targetEquipment
            };
        } else {
            // Regular equipment crafting
            isGreatSuccess = Math.random() < 0.1;
            const bonusMultiplier = isGreatSuccess ? 1.5 : 1.0;

            const minBonus = itemConfig.minBonus || 0;
            const maxBonus = itemConfig.maxBonus || 0;
            let dailyBonusValue = Math.random() * (maxBonus - minBonus) + minBonus;
            dailyBonusValue = Math.round(dailyBonusValue * bonusMultiplier * 100) / 100;

            const accessoryId = Math.random().toString(36).substr(2, 9);
            const lifespanDays = itemConfig.lifespanDays || 30;
            const maxDurability = (itemConfig as any).maxDurability || lifespanDays * 100;
            const expireAt = Date.now() + (lifespanDays * 24 * 60 * 60 * 1000); // Keep for backward compat

            newItem = {
                id: accessoryId,
                typeId: itemConfig.id,
                name: itemConfig.name,
                price: 0,
                dailyBonus: dailyBonusValue,
                rarity: isGreatSuccess ? 'RARE' : 'COMMON',
                purchasedAt: Date.now(),
                lifespanDays: lifespanDays,
                expireAt,
                currentDurability: maxDurability, // เริ่มต้น HP เต็ม
                maxDurability: maxDurability,
                level: 1,
                specialEffect: (itemConfig as any).specialEffect,
                isHandmade: true
            };
        }

        // All items including blueprints now go to inventory normally

        // Add to inventory
        if (!user.inventory) user.inventory = [];
        user.inventory.push(newItem);
        user.markModified('inventory');

        // Remove from queue
        user.craftingQueue.splice(queueIndex, 1);
        user.markModified('craftingQueue');

        // Update weekly stats
        if (!user.weeklyStats) user.weeklyStats = {};
        user.weeklyStats.itemsCrafted = (user.weeklyStats.itemsCrafted || 0) + 1;
        user.markModified('weeklyStats');

        await user.save();

        // Log transaction
        const claimTx = new Transaction({
            userId,
            type: 'ACCESSORY_CRAFT_CLAIM',
            amount: 0,
            status: 'COMPLETED',
            description: `รับไอเทม: ${typeof itemConfig.name === 'object' ? itemConfig.name.th : itemConfig.name}${isGreatSuccess ? ' (Great Success!)' : ''}`
        });
        await claimTx.save();

        console.log(`[CRAFTING] User ${userId} claimed ${typeof itemConfig.name === 'object' ? itemConfig.name.en : itemConfig.name}, ID: ${newItem.id}, Great: ${isGreatSuccess}`);

        res.json({
            success: true,
            item: newItem,
            isGreatSuccess,
            queue: user.craftingQueue,
            inventory: user.inventory
        });

    } catch (error) {
        console.error('claimCraftedItem Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Use Time Skip Item (Ticket or Nanobot)
export const useTimeSkip = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { queueId, itemTypeId } = req.body;

        if (!queueId || !itemTypeId) {
            return res.status(400).json({ message: 'Missing parameters' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 1. Find entry in crafting queue
        const queueIndex = user.craftingQueue.findIndex((q: any) => q.id === queueId);
        if (queueIndex === -1) {
            return res.status(404).json({ message: 'ไม่พบรายการคราฟต์นี้' });
        }

        const queueItem = user.craftingQueue[queueIndex];
        if (Date.now() >= queueItem.finishAt) {
            return res.status(400).json({ message: 'รายการนี้สร้างเสร็จแล้ว' });
        }

        // 2. Check if user owns the skip item
        const itemIndex = user.inventory.findIndex((i: any) => i.typeId === itemTypeId);
        if (itemIndex === -1) {
            return res.status(400).json({ message: 'คุณไม่มีไอเทมนี้ในกระเป๋า' });
        }

        // 3. Apply effect
        let skipAmountMs = 0;
        let itemName = '';

        if (itemTypeId === 'time_skip_ticket') {
            skipAmountMs = 60 * 60 * 1000; // 1 hour
            itemName = 'ตั๋วเร่งเวลา (Time Skip Ticket)';
            queueItem.finishAt -= skipAmountMs;
        } else if (itemTypeId === 'construction_nanobot') {
            itemName = 'นาโนบอทก่อสร้าง (Construction Nanobot)';
            queueItem.finishAt = Date.now(); // Instant finish
        } else {
            return res.status(400).json({ message: 'ไอเทมนี้ไม่สามารถใช้เร่งเวลาได้' });
        }

        // 4. Burn the item
        user.inventory.splice(itemIndex, 1);
        user.markModified('inventory');
        user.markModified('craftingQueue');

        await user.save();

        // Log transaction
        const skipTx = new Transaction({
            userId,
            type: 'ACCESSORY_PURCHASE', // Or define a new type like TIME_SKIP_USE
            amount: 0,
            status: 'COMPLETED',
            description: `ใช้ไอเทมเร่งเวลา: ${itemName}`
        });
        await skipTx.save();

        res.json({
            success: true,
            message: `ใช้ ${itemName} เรียบร้อยแล้ว`,
            queue: user.craftingQueue,
            inventory: user.inventory
        });

    } catch (error) {
        console.error('useTimeSkip Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
