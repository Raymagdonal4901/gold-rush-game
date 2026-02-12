import { Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

// --- CONSTANTS (Mirrored from frontend) ---
const MATERIAL_CONFIG = {
    NAMES: {
        1: { th: 'ถ่านหิน', en: 'Coal' },
        2: { th: 'ทองแดง', en: 'Copper' },
        3: { th: 'เหล็ก', en: 'Iron' },
        4: { th: 'ทองคำ', en: 'Gold' },
        5: { th: 'เพชร', en: 'Diamond' },
        6: { th: 'น้ำมันดิบสังเคราะห์', en: 'Synthetic Crude Oil' },
        7: { th: 'ไวเบรเนียม', en: 'Vibranium' }
    } as Record<number, { th: string; en: string }>
};

export const SHOP_ITEMS = [
    {
        id: 'hat', name: { th: 'หมวกนิรภัยมาตรฐาน', en: 'Standard Safety Hat' }, minBonus: 0.1, maxBonus: 0.5, lifespanDays: 30, tier: 1,
        craftingRecipe: { 1: 3 }, craftingFee: 0.2857, craftDurationMinutes: 30, specialEffect: 'ลดค่าซ่อม -5%'
    },
    {
        id: 'uniform', name: { th: 'ชุดหมีช่างกล', en: 'Mechanic Uniform' }, minBonus: 0.5, maxBonus: 1.5, lifespanDays: 30, tier: 1,
        craftingRecipe: { 1: 4, 2: 3 }, craftingFee: 0.2857, craftDurationMinutes: 60, specialEffect: 'อายุใช้งาน +5 วัน'
    },
    {
        id: 'bag', name: { th: 'กระเป๋าผ้าใบ', en: 'Canvas Bag' }, minBonus: 1.0, maxBonus: 2.0, lifespanDays: 45, tier: 2,
        craftingRecipe: { 2: 4, 3: 2 }, craftingFee: 0.5714, craftDurationMinutes: 180, specialEffect: 'ราคาขาย +1%'
    },
    {
        id: 'boots', name: { th: 'รองเท้าบูทกันน้ำ', en: 'Waterproof Boots' }, minBonus: 2.0, maxBonus: 3.0, lifespanDays: 45, tier: 2,
        craftingRecipe: { 3: 5, 4: 2 }, craftingFee: 0.7143, craftDurationMinutes: 300, specialEffect: 'โอกาสประหยัดไฟ 5%'
    },
    {
        id: 'glasses', name: { th: 'แว่นตานิรภัยใส', en: 'Clear Safety Glasses' }, minBonus: 2.5, maxBonus: 3.5, lifespanDays: 60, tier: 2,
        craftingRecipe: { 4: 3, 3: 4 }, craftingFee: 2.2857, craftDurationMinutes: 420, specialEffect: 'โอกาสดรอป +2%'
    },
    {
        id: 'mobile', name: { th: 'มือถือรุ่นปุ่มกด', en: 'Button Phone' }, minBonus: 3.0, maxBonus: 4.0, lifespanDays: 90, tier: 2,
        craftingRecipe: { 5: 1, 4: 4 }, craftingFee: 3.4286, craftDurationMinutes: 540, specialEffect: 'ลดภาษีตลาด 2%'
    },
    {
        id: 'pc', name: { th: 'พีซีสำนักงาน', en: 'Office PC' }, minBonus: 4.0, maxBonus: 5.0, lifespanDays: 90, tier: 3,
        craftingRecipe: { 5: 2, 4: 3 }, craftingFee: 5.1429, craftDurationMinutes: 720, specialEffect: 'โอกาสเบิ้ลรายได้ 1%'
    },
    {
        id: 'auto_excavator', name: { th: 'รถขุดไฟฟ้า (Electric)', en: 'Electric Excavator' }, minBonus: 10.0, maxBonus: 12.0, lifespanDays: 120, tier: 3,
        craftingRecipe: { 6: 1, 5: 2 }, craftingFee: 14.2857, craftDurationMinutes: 1440, specialEffect: 'โอกาส Jackpot 2%'
    },
    {
        id: 'time_skip_ticket', name: { th: 'ตั๋วเร่งเวลา', en: 'Time Skip Ticket' }, price: 0.142857, icon: 'Timer',
        description: { th: 'ลดเวลาการคราฟต์ 1 ชั่วโมง (กดซ้ำได้)', en: 'Reduce crafting time by 1 hour (stackable)' }
    },
    {
        id: 'construction_nanobot', name: { th: 'นาโนบอทก่อสร้าง', en: 'Construction Nanobot' }, price: 2.828571, icon: 'Cpu',
        description: { th: 'สร้างอุปกรณ์เสร็จทันที 100%', en: 'Instantly finish crafting (100%)' }
    }
];

// --- REPAIR KIT DEFINITIONS ---
const REPAIR_KITS = [
    {
        id: 'repair_kit_1',
        name: { th: 'ชุดซ่อมพื้นฐาน', en: 'Basic Repair Kit' },
        repairTier: 1,
        repairDays: 30,
        targetEquipment: ['hat', 'uniform'],
        craftingRecipe: { 1: 2, 2: 2 }, // Coal x2, Copper x2
        craftingFee: 5,
        craftDurationMinutes: 15
    },
    {
        id: 'repair_kit_2',
        name: { th: 'ชุดซ่อมมาตรฐาน', en: 'Standard Repair Kit' },
        repairTier: 2,
        repairDays: 30,
        targetEquipment: ['bag', 'boots'],
        craftingRecipe: { 3: 3, 2: 3 }, // Iron x3, Copper x3
        craftingFee: 10,
        craftDurationMinutes: 30
    },
    {
        id: 'repair_kit_3',
        name: { th: 'ชุดซ่อมขั้นสูง', en: 'Advanced Repair Kit' },
        repairTier: 3,
        repairDays: 30,
        targetEquipment: ['glasses', 'mobile'],
        craftingRecipe: { 3: 5, 4: 2 }, // Iron x5, Gold x2
        craftingFee: 50,
        craftDurationMinutes: 60
    },
    {
        id: 'repair_kit_4',
        name: { th: 'ชุดซ่อมเครื่องจักรกล', en: 'Master Repair Kit' },
        repairTier: 4,
        repairDays: 30,
        targetEquipment: ['pc', 'auto_excavator'],
        craftingRecipe: { 4: 5, 5: 1 }, // Gold x5, Diamond x1
        craftingFee: 200,
        craftDurationMinutes: 120
    }
];

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
            // Repair Kit: no bonus, no expiry, just a consumable
            const kitId = Math.random().toString(36).substr(2, 9);
            newItem = {
                id: kitId,
                typeId: itemConfig.id,
                name: itemConfig.name,
                price: 0,
                dailyBonus: 0,
                rarity: 'COMMON',
                purchasedAt: Date.now(),
                isRepairKit: true,
                repairTier: (itemConfig as any).repairTier,
                repairDays: (itemConfig as any).repairDays,
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
            const expireAt = Date.now() + (lifespanDays * 24 * 60 * 60 * 1000);

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
                level: 1,
                specialEffect: (itemConfig as any).specialEffect,
                isHandmade: true
            };
        }

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
