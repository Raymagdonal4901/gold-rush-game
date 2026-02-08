import { Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';

// --- CONSTANTS (Mirrored from frontend for now) ---
const MATERIAL_CONFIG = {
    NAMES: {
        0: 'แร่ปริศนา',
        1: 'ถ่านหิน',
        2: 'ทองแดง',
        3: 'เหล็ก',
        4: 'ทองคำ',
        5: 'เพชร',
        6: 'น้ำมันดิบสังเคราะห์',
        7: 'ไวเบรเนียม',
        8: 'แร่ลึกลับ',
        9: 'แร่ในตำนาน',
    } as Record<number, string>
};

const MATERIAL_RECIPES: Record<number, { ingredients: Record<number, number>; fee: number; requiredItem?: string }> = {
    1: { ingredients: { 1: 2 }, fee: 1, requiredItem: 'mixer' }, // Coal x2 + 1 Baht -> Copper
    2: { ingredients: { 1: 1, 2: 1 }, fee: 2, requiredItem: 'mixer' }, // Coal x1 + Copper x1 + 2 Baht -> Iron
    3: { ingredients: { 2: 1, 3: 1 }, fee: 3, requiredItem: 'mixer' }, // Copper x1 + Iron x1 + 3 Baht -> Gold
    4: { ingredients: { 2: 1, 3: 1, 4: 1 }, fee: 5, requiredItem: 'mixer' }, // Copper x1 + Iron x1 + Gold x1 + 5 Baht -> Diamond
    5: { ingredients: { 4: 1, 5: 1 }, fee: 10, requiredItem: 'mixer' }, // Gold x1 + Diamond x1 + 10 Baht -> Synthetic Oil
    6: { ingredients: { 1: 15, 2: 10, 3: 10, 4: 5, 5: 3, 6: 1 }, fee: 50, requiredItem: 'magnifying_glass' }, // Multi-mix -> Vibranium
};

const SHOP_ITEMS = [
    { id: 'mixer', name: 'เครื่องผสมอนุภาค' },
    { id: 'magnifying_glass', name: 'แว่นขยาย' }
];

// --- MARKET LOGIC ---
const BASE_PRICES: Record<number, number> = {
    1: 10, 2: 20, 3: 35, 4: 60, 5: 120, 6: 300, 7: 1500
};

export const getMarketPrices = () => {
    const now = Date.now();
    const cycle = 4 * 60 * 60 * 1000; // 4 hours cycle
    const trends: any = {};

    [1, 2, 3, 4, 5, 6, 7].forEach(id => {
        const base = BASE_PRICES[id];
        // Use sine wave based on time + seed from id to simulate different trends
        const timeOffset = (now % cycle) / cycle;
        const seed = id * 1000;
        const fluctuation = Math.sin((timeOffset * 2 * Math.PI) + seed) * 0.15; // +/- 15%

        const currentPrice = base * (1 + fluctuation);
        const trend = fluctuation > 0.05 ? 'UP' : fluctuation < -0.05 ? 'DOWN' : 'STABLE';

        // Generate a small history for the chart
        const history = [];
        for (let i = 0; i < 20; i++) {
            const hTime = now - (i * 15 * 60 * 1000); // 15 mins steps
            const hOffset = (hTime % cycle) / cycle;
            history.unshift(base * (1 + Math.sin((hOffset * 2 * Math.PI) + seed) * 0.15));
        }

        trends[id] = {
            basePrice: base,
            currentPrice: parseFloat(currentPrice.toFixed(2)),
            multiplier: 1 + fluctuation,
            trend,
            history
        };
    });

    return trends;
};

export const getMarketStatus = async (req: AuthRequest, res: Response) => {
    try {
        const trends = getMarketPrices();
        res.json({
            trends,
            nextUpdate: Date.now() + 15 * 60 * 1000 // Info only
        });
    } catch (err) {
        res.status(500).json({ message: 'Market state error' });
    }
};

export const craftMaterial = async (req: AuthRequest, res: Response) => {
    try {
        const { sourceTier } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const recipe = MATERIAL_RECIPES[sourceTier];
        if (!recipe) return res.status(400).json({ message: 'สูตรการผลิตไม่ถูกต้อง' });

        const targetTier = sourceTier + 1;

        // Initialize materials if missing
        if (!user.materials) user.materials = {};

        // 1. Check Ingredients
        for (const [tierStr, amountNeeded] of Object.entries(recipe.ingredients)) {
            const tier = parseInt(tierStr);
            const userAmount = user.materials[tier.toString()] || 0; // Access via string key for Mongoose Map or Object
            console.log(`Checking ingredient Tier ${tier}: Needed ${amountNeeded}, Have ${userAmount}`);
            if (userAmount < amountNeeded) {
                const matName = MATERIAL_CONFIG.NAMES[tier] || `Material #${tier}`;
                return res.status(400).json({
                    message: `วัตถุดิบไม่พอ: ต้องการ ${matName} จำนวน ${amountNeeded} ชิ้น`
                });
            }
        }

        // 2. Check Balance
        if (user.balance < recipe.fee) {
            console.log(`Insufficient balance: Fee ${recipe.fee}, Have ${user.balance}`);
            return res.status(400).json({
                message: `เงินไม่พอสำหรับค่าธรรมเนียม (${recipe.fee} บาท)`
            });
        }

        // 3. Check Required Item (Mixer, etc.)
        if (recipe.requiredItem) {
            const hasItem = user.inventory && user.inventory.some((i: any) => i.typeId === recipe.requiredItem);
            if (!hasItem) {
                console.log(`Missing required item: ${recipe.requiredItem}`);
                const requiredItemName = SHOP_ITEMS.find(i => i.id === recipe.requiredItem)?.name || recipe.requiredItem;
                return res.status(400).json({
                    message: `จำเป็นต้องมีอุปกรณ์: ${requiredItemName}`
                });
            }
        }

        // --- EXECUTE CRAFT ---

        // Deduct Ingredients
        // Mongoose Map/Object handling warning: Modify the object directly but mark Modified if needed
        // If materials is mixed type (Object), we can just modify properties.
        const newMaterials = { ...user.materials }; // Clone to ensure change detection if it helps, though usually direct mod works if we set it back

        for (const [tierStr, amountNeeded] of Object.entries(recipe.ingredients)) {
            const key = tierStr.toString();
            newMaterials[key] = (newMaterials[key] || 0) - amountNeeded;
        }

        // Add Target Material
        const targetKey = targetTier.toString();
        newMaterials[targetKey] = (newMaterials[targetKey] || 0) + 1;

        user.materials = newMaterials;
        user.markModified('materials'); // Important for Mixed types

        // Deduct Fee
        user.balance -= recipe.fee;

        // 4. Consume Required Item (if applicable)
        if (recipe.requiredItem) {
            const itemIndex = user.inventory.findIndex((i: any) => i.typeId === recipe.requiredItem);
            if (itemIndex !== -1) {
                user.inventory.splice(itemIndex, 1);
                user.markModified('inventory');
            }
        }

        // Stats
        if (!user.stats) user.stats = {};
        user.stats.materialsCrafted = (user.stats.materialsCrafted || 0) + 1;
        user.stats.totalMoneySpent = (user.stats.totalMoneySpent || 0) + recipe.fee;
        user.markModified('stats');

        // Weekly Stats for Quests
        if (!user.weeklyStats) user.weeklyStats = { materialsCrafted: 0, moneySpent: 0, dungeonsEntered: 0, itemsCrafted: 0, repairAmount: 0, rareLootCount: 0 };
        user.weeklyStats.materialsCrafted = (user.weeklyStats.materialsCrafted || 0) + 1;
        user.weeklyStats.moneySpent = (user.weeklyStats.moneySpent || 0) + recipe.fee;
        user.markModified('weeklyStats');

        await user.save();

        // Log Transaction
        const craftTx = new Transaction({
            userId,
            type: 'MATERIAL_CRAFT',
            amount: recipe.fee,
            status: 'COMPLETED',
            description: `ผลิตแร่: ${MATERIAL_CONFIG.NAMES[targetTier]}`
        });
        await craftTx.save();

        res.status(200).json({
            success: true,
            sourceName: MATERIAL_CONFIG.NAMES[sourceTier] || 'Unknown',
            targetName: MATERIAL_CONFIG.NAMES[targetTier] || 'Unknown',
            targetTier: targetTier,
            amount: 1,
            balance: user.balance,
            materials: user.materials
        });

    } catch (error) {
        console.error('Craft Error:', error);
        res.status(500).json({ message: 'Server error during crafting' });
    }
};

export const sellMaterial = async (req: AuthRequest, res: Response) => {
    try {
        const { tier, amount } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const currentMats = user.materials || {};
        if (!user.materials) user.materials = {};
        const userAmount = (user.materials[tier.toString()] || 0);

        if (userAmount < amount) {
            return res.status(400).json({ message: 'จำนวนวัตถุดิบไม่เพียงพอสำหรับการขาย' });
        }

        // Get Current Market Price
        const market = getMarketPrices();
        const item = market[tier];
        if (!item) return res.status(400).json({ message: 'Invalid material tier' });

        const unitPrice = item.currentPrice;
        const subTotal = unitPrice * amount;
        const tax = Math.floor(subTotal * 0.15); // 15% Market Tax
        const totalEarned = subTotal - tax;

        const newMaterials = { ...user.materials };
        newMaterials[tier.toString()] = userAmount - amount;
        user.materials = newMaterials;
        user.markModified('materials');

        user.balance += totalEarned;

        await user.save();

        // Log Transaction (Seller side)
        const sellTx = new Transaction({
            userId,
            type: 'MATERIAL_SELL',
            amount: totalEarned,
            status: 'COMPLETED',
            description: `ขายแร่: ${MATERIAL_CONFIG.NAMES[tier]} (${amount} ชิ้น)`
        });
        await sellTx.save();

        // Log Transaction (System Tax side)
        const taxTx = new Transaction({
            userId,
            type: 'MARKET_TAX',
            amount: tax,
            status: 'COMPLETED',
            description: `ภาษีตลาดจากการขาย: ${MATERIAL_CONFIG.NAMES[tier]} (${amount} ชิ้น)`
        });
        await taxTx.save();

        res.json({
            success: true,
            materials: user.materials,
            balance: user.balance,
            earned: totalEarned
        });

    } catch (error) {
        console.error('Sell Error:', error);
        res.status(500).json({ message: 'Server error during selling' });
    }
};
export const buyMaterial = async (req: AuthRequest, res: Response) => {
    try {
        const { tier, amount } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get Current Market Price
        const market = getMarketPrices();
        const item = market[tier];
        if (!item) return res.status(400).json({ message: 'Invalid material tier' });

        const unitPrice = item.currentPrice;
        const subTotal = unitPrice * amount;

        // Calculate Spread/Markup (Market Fee) - 15% for regular, 12% for Platinum
        // Mastery discount if points >= 1000
        const spreadPercent = (user.masteryPoints || 0) >= 1000 ? 0.12 : 0.15;
        const tax = Math.ceil(subTotal * spreadPercent);
        const totalCost = subTotal + tax;

        if (user.balance < totalCost) {
            return res.status(400).json({ message: 'เงินคงเหลือไม่พอสำหรับการซื้อ' });
        }

        // Deduct Balance
        user.balance -= totalCost;

        // Update Materials
        const newMaterials = { ...user.materials };
        newMaterials[tier.toString()] = (newMaterials[tier.toString()] || 0) + amount;
        user.materials = newMaterials;
        user.markModified('materials');

        // Stats
        const newStats = { ...user.stats };
        newStats.totalMoneySpent = (newStats.totalMoneySpent || 0) + totalCost;
        user.stats = newStats;
        user.markModified('stats');

        // Weekly Stats for Quests
        if (!user.weeklyStats) user.weeklyStats = { materialsCrafted: 0, moneySpent: 0, dungeonsEntered: 0, itemsCrafted: 0, repairAmount: 0, rareLootCount: 0 };
        user.weeklyStats.moneySpent = (user.weeklyStats.moneySpent || 0) + totalCost;
        user.markModified('weeklyStats');

        await user.save();

        // Log Transaction (Buyer side)
        const buyTx = new Transaction({
            userId,
            type: 'MATERIAL_BUY',
            amount: totalCost,
            status: 'COMPLETED',
            description: `ซื้อแร่: ${MATERIAL_CONFIG.NAMES[tier]} (${amount} ชิ้น)`
        });
        await buyTx.save();

        // Log Transaction (System Tax side)
        const taxTx = new Transaction({
            userId,
            type: 'MARKET_TAX',
            amount: tax,
            status: 'COMPLETED',
            description: `ค่าธรรมเนียม/ภาษีตลาดจากการซื้อ: ${MATERIAL_CONFIG.NAMES[tier]} (${amount} ชิ้น)`
        });
        await taxTx.save();

        res.json({
            success: true,
            materials: user.materials,
            balance: user.balance,
            spent: totalCost,
            tax
        });

    } catch (error) {
        console.error('Buy Error:', error);
        res.status(500).json({ message: 'Server error during buying' });
    }
};
