import { Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { MATERIAL_CONFIG, MATERIAL_RECIPES, SHOP_ITEMS, LEVEL_CONFIG } from '../constants';



export const getMarketPrices = () => {
    const now = Date.now();
    const cycle = 4 * 60 * 60 * 1000; // 4 hours cycle
    const trends: any = {};

    [1, 2, 3, 4, 5, 6, 7].forEach(id => {
        const base = (MATERIAL_CONFIG.PRICES as Record<number, number>)[id] || 10;
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
                const matName = MATERIAL_CONFIG.NAMES[tier]?.th || `Material #${tier}`;
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
                const requiredItemName = SHOP_ITEMS.find(i => i.id === recipe.requiredItem)?.name.th || recipe.requiredItem;
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
            description: `ผลิตแร่: ${MATERIAL_CONFIG.NAMES[targetTier]?.th || 'Unknown'}`
        });
        await craftTx.save();

        res.status(200).json({
            success: true,
            sourceName: MATERIAL_CONFIG.NAMES[sourceTier]?.th || 'Unknown',
            targetName: MATERIAL_CONFIG.NAMES[targetTier]?.th || 'Unknown',
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
        const matTier = Number(tier);
        const matAmount = Number(amount);

        console.log(`[SELL] User: ${user.username}, Tier: ${matTier}, Amount: ${matAmount}`);

        if (!user.materials) user.materials = {};
        const userAmount = (user.materials[matTier.toString()] || 0);

        if (matTier === 0) {
            return res.status(400).json({ message: 'เศษหินไม่สามารถขายได้' });
        }

        if (matTier === 7) {
            return res.status(400).json({ message: 'การขายแร่วาเบรเนียมถูกระงับชั่วคราว' });
        }

        if (userAmount < matAmount) {
            return res.status(400).json({ message: 'จำนวนวัตถุดิบไม่เพียงพอสำหรับการขาย' });
        }

        // Get Current Market Price
        const market = getMarketPrices();
        const item = market[tier];
        if (!item) return res.status(400).json({ message: 'Invalid material tier' });

        const unitPrice = item.currentPrice;
        const subTotal = unitPrice * amount;

        // Dynamic Market Tax based on Account Level
        const baseTax = (LEVEL_CONFIG.baseMarketFee || 10.0) / 100;
        const reduction = ((user.accountLevel || 1) - 1) * (LEVEL_CONFIG.marketFeeReduction / 100);
        const taxRate = Math.max(LEVEL_CONFIG.minMarketFee / 100, baseTax - reduction);
        const tax = Math.floor(subTotal * taxRate);
        const totalEarned = subTotal - tax;

        const newMaterials = { ...user.materials };
        newMaterials[matTier.toString()] = userAmount - matAmount;
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
            description: `ขายแร่: ${MATERIAL_CONFIG.NAMES[matTier].th} (${matAmount} ชิ้น)`
        });
        await sellTx.save();

        // Log Transaction (System Tax side)
        const taxTx = new Transaction({
            userId,
            type: 'MARKET_FEE',
            amount: tax,
            status: 'COMPLETED',
            description: `ค่าธรรมเนียมตลาดจากการขาย: ${MATERIAL_CONFIG.NAMES[matTier].th} (${matAmount} ชิ้น)`
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

        const matTier = Number(tier);
        const matAmount = Number(amount);

        console.log(`[BUY] User: ${user.username}, Tier: ${matTier}, Amount: ${matAmount}`);

        // Get Current Market Price
        const market = getMarketPrices();
        const item = market[matTier];
        if (!item) return res.status(400).json({ message: 'Invalid material tier' });

        if (matTier === 7) {
            return res.status(400).json({ message: 'การซื้อแร่วาเบรเนียมถูกระงับชั่วคราว' });
        }

        const unitPrice = item.currentPrice;
        const subTotal = unitPrice * matAmount;

        // Dynamic Market Tax based on Account Level
        const baseTax = (LEVEL_CONFIG.baseMarketFee || 10.0) / 100;
        const reduction = ((user.accountLevel || 1) - 1) * (LEVEL_CONFIG.marketFeeReduction / 100);
        const taxRate = Math.max(LEVEL_CONFIG.minMarketFee / 100, baseTax - reduction);
        const tax = Math.ceil(subTotal * taxRate);
        const totalCost = subTotal + tax;

        if (user.balance < totalCost) {
            return res.status(400).json({ message: 'เงินคงเหลือไม่พอสำหรับการซื้อ' });
        }

        // Deduct Balance
        user.balance -= totalCost;

        // Update Materials
        const newMaterials = { ...user.materials };
        newMaterials[matTier.toString()] = (newMaterials[matTier.toString()] || 0) + matAmount;
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
            description: `ซื้อแร่: ${MATERIAL_CONFIG.NAMES[matTier].th} (${matAmount} ชิ้น)`
        });
        await buyTx.save();

        // Log Transaction (System Tax side)
        const taxTx = new Transaction({
            userId,
            type: 'MARKET_FEE',
            amount: tax,
            status: 'COMPLETED',
            description: `ค่าธรรมเนียมตลาดจากการซื้อ: ${MATERIAL_CONFIG.NAMES[matTier].th} (${matAmount} ชิ้น)`
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
