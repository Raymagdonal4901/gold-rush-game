import { Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

// --- CONSTANTS (Mirrored from frontend) ---
const MATERIAL_CONFIG = {
    NAMES: {
        1: 'ถ่านหิน', 2: 'ทองแดง', 3: 'เหล็ก', 4: 'ทองคำ', 5: 'เพชร', 6: 'น้ำมันดิบสังเคราะห์', 7: 'ไวเบรเนียม'
    } as Record<number, string>
};

const SHOP_ITEMS = [
    {
        id: 'hat', name: 'หมวกนิรภัยมาตรฐาน', minBonus: 0.1, maxBonus: 0.5, lifespanDays: 30, tier: 1,
        craftingRecipe: { 1: 3 }, craftingFee: 0.2857, craftDurationMinutes: 30, specialEffect: 'ลดค่าซ่อม -5%'
    },
    {
        id: 'uniform', name: 'ชุดหมีช่างกล', minBonus: 0.5, maxBonus: 1.5, lifespanDays: 30, tier: 1,
        craftingRecipe: { 1: 4, 2: 3 }, craftingFee: 0.2857, craftDurationMinutes: 60, specialEffect: 'อายุใช้งาน +5 วัน'
    },
    {
        id: 'bag', name: 'กระเป๋าผ้าใบ', minBonus: 1.0, maxBonus: 2.0, lifespanDays: 45, tier: 2,
        craftingRecipe: { 2: 4, 3: 2 }, craftingFee: 0.5714, craftDurationMinutes: 180, specialEffect: 'ราคาขาย +1%'
    },
    {
        id: 'boots', name: 'รองเท้าบูทกันน้ำ', minBonus: 2.0, maxBonus: 3.0, lifespanDays: 45, tier: 2,
        craftingRecipe: { 3: 5, 4: 2 }, craftingFee: 0.7143, craftDurationMinutes: 300, specialEffect: 'โอกาสประหยัดไฟ 5%'
    },
    {
        id: 'glasses', name: 'แว่นตานิรภัยใส', minBonus: 2.5, maxBonus: 3.5, lifespanDays: 60, tier: 2,
        craftingRecipe: { 4: 3, 3: 4 }, craftingFee: 2.2857, craftDurationMinutes: 420, specialEffect: 'โอกาสดรอป +2%'
    },
    {
        id: 'mobile', name: 'มือถือรุ่นปุ่มกด', minBonus: 3.0, maxBonus: 4.0, lifespanDays: 90, tier: 2,
        craftingRecipe: { 5: 1, 4: 4 }, craftingFee: 3.4286, craftDurationMinutes: 540, specialEffect: 'ลดภาษีตลาด 2%'
    },
    {
        id: 'pc', name: 'พีซีสำนักงาน', minBonus: 4.0, maxBonus: 5.0, lifespanDays: 90, tier: 3,
        craftingRecipe: { 5: 2, 4: 3 }, craftingFee: 5.1429, craftDurationMinutes: 720, specialEffect: 'โอกาสเบิ้ลรายได้ 1%'
    },
    {
        id: 'auto_excavator', name: 'รถขุดไฟฟ้า (Electric)', minBonus: 10.0, maxBonus: 12.0, lifespanDays: 120, tier: 3,
        craftingRecipe: { 6: 1, 5: 2 }, craftingFee: 14.2857, craftDurationMinutes: 1440, specialEffect: 'โอกาส Jackpot 2%'
    }
];

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

        const itemConfig = SHOP_ITEMS.find(i => i.id === itemId);
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
                const matName = MATERIAL_CONFIG.NAMES[tier] || `Material #${tier}`;
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
            description: `เริ่มผลิต: ${itemConfig.name}`
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

        const itemConfig = SHOP_ITEMS.find(i => i.id === queueItem.itemId);
        if (!itemConfig) {
            return res.status(400).json({ message: 'ไม่พบข้อมูลไอเทม' });
        }

        // Roll for Great Success (10% chance for bonus stats)
        const isGreatSuccess = Math.random() < 0.1;
        const bonusMultiplier = isGreatSuccess ? 1.5 : 1.0;

        // Calculate random bonus within range
        const { minBonus, maxBonus } = itemConfig;
        let dailyBonus = Math.random() * (maxBonus - minBonus) + minBonus;
        dailyBonus = Math.round(dailyBonus * bonusMultiplier * 100) / 100;

        // Create the accessory item
        const accessoryId = Math.random().toString(36).substr(2, 9);
        const expireAt = Date.now() + (itemConfig.lifespanDays * 24 * 60 * 60 * 1000);

        const newItem = {
            id: accessoryId,
            typeId: itemConfig.id,
            name: itemConfig.name,
            price: 0,
            dailyBonus,
            rarity: isGreatSuccess ? 'RARE' : 'COMMON',
            purchasedAt: Date.now(),
            lifespanDays: itemConfig.lifespanDays,
            expireAt,
            level: 1,
            specialEffect: itemConfig.specialEffect,
            isHandmade: true
        };

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
            description: `รับไอเทม: ${itemConfig.name}${isGreatSuccess ? ' (Great Success!)' : ''}`
        });
        await claimTx.save();

        console.log(`[CRAFTING] User ${userId} claimed ${itemConfig.name}, ID: ${accessoryId}, Great: ${isGreatSuccess}`);

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
