import { Response } from 'express';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import { UPGRADE_CONFIG, SHOP_ITEMS } from '../constants';

export const upgradeItem = async (req: AuthRequest, res: Response) => {
    try {
        const { targetItemId, materialItemId } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.inventory) user.inventory = [];

        const targetIndex = user.inventory.findIndex((i: any) => i.id === targetItemId);
        const materialIndex = user.inventory.findIndex((i: any) => i.id === materialItemId);

        if (targetIndex === -1 || materialIndex === -1) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (targetIndex === materialIndex) {
            return res.status(400).json({ message: 'Cannot fuse the same item' });
        }

        const targetItem = user.inventory[targetIndex];
        const materialItem = user.inventory[materialIndex];

        // Validation
        if (targetItem.typeId !== materialItem.typeId) {
            return res.status(400).json({ message: 'Items must be of the same type' });
        }

        // Check if material is Level 1 (simplification)
        if ((materialItem.level || 1) > 1) {
            return res.status(400).json({ message: 'Material item must be Level 1' });
        }

        const currentLevel = targetItem.level || 1;
        if (currentLevel >= UPGRADE_CONFIG.MAX_LEVEL) {
            return res.status(400).json({ message: 'Item is already at max level' });
        }

        const nextLevel = currentLevel + 1;
        const config = UPGRADE_CONFIG.LEVELS[nextLevel];

        if (!config) {
            return res.status(400).json({ message: 'Configuration for next level not found' });
        }

        // Check Catalyst (Magnifying Glass)
        const catalystId = 'magnifying_glass';
        const catalystCount = user.inventory.filter((i: any) => i.typeId === catalystId).length;

        if (catalystCount < config.catalystCost) {
            return res.status(400).json({ message: `Insufficient Magnifying Glasses (Need ${config.catalystCost})` });
        }

        // Check Fee
        if (user.balance < config.fee) {
            return res.status(400).json({ message: `Insufficient balance (Need ${config.fee} THB)` });
        }

        // Consume Fee
        user.balance -= config.fee;

        // Consume Catalyst(s)
        let catalystsConsumed = 0;
        // Iterate backwards to remove safely
        for (let i = user.inventory.length - 1; i >= 0; i--) {
            if (user.inventory[i].typeId === catalystId) {
                user.inventory.splice(i, 1);
                catalystsConsumed++;
                if (catalystsConsumed >= config.catalystCost) break;
            }
        }

        // Consume Material Item
        // Re-find index as splice might have shifted indices
        const freshMaterialIndex = user.inventory.findIndex((i: any) => i.id === materialItemId);
        if (freshMaterialIndex !== -1) {
            user.inventory.splice(freshMaterialIndex, 1);
        } else {
            // Should not happen if logic is correct, but safe check
            return res.status(500).json({ message: 'Error consuming material item' });
        }

        // Calculate Success
        const roll = Math.random();
        const isSuccess = roll <= config.successRate;
        let message = '';

        // Re-find target index
        const freshTargetIndex = user.inventory.findIndex((i: any) => i.id === targetItemId);
        if (freshTargetIndex === -1) return res.status(404).json({ message: 'Target item lost during process' });

        if (isSuccess) {
            user.inventory[freshTargetIndex].level = nextLevel;
            // Stats calculation
            // Bonus: Base * (1 + (Lvl-1)*0.2) -> This is total bonus.
            // But usually we store the Base stats in config, and calculate dynamic stats on frontend/backend helper.
            // However, the types.ts has statsMultiplier.
            // Let's set statsMultiplier.
            // Level 1 = 1.0
            // Level 2 = 1.0 + (1 * 0.2) = 1.2 ??? User said "Level 2 = 1.1x"? 
            // Formula in prompt: Bonus = Base * (1 + (Level - 1) * 0.2).
            // Lvl 1: 1 + 0 = 1.0
            // Lvl 2: 1 + 0.2 = 1.2.
            // The prompt example said "Level 2 = 1.1x, Level 10 = 3.0x". 
            // Let's stick to the specific formula: 1 + (Level-1)*0.2.

            user.inventory[freshTargetIndex].statsMultiplier = 1 + (nextLevel - 1) * 0.2;

            // Max Durability: Base * (1 + (Lvl-1)*0.1)
            const baseDurability = user.inventory[freshTargetIndex].maxDurability / (1 + (currentLevel - 1) * 0.1); // reverse engineer base? Or just assumed base is roughly valid?
            // Safer: Just assume current maxDurability IS the base if level is 1. If level > 1, we might need original config.
            // Ideally lookup SHOP_ITEMS for base.
            const shopItem = SHOP_ITEMS.find(i => i.id === user.inventory[freshTargetIndex].typeId);
            const originalMaxDurability = shopItem?.maxDurability || 100;

            user.inventory[freshTargetIndex].maxDurability = Math.floor(originalMaxDurability * (1 + (nextLevel - 1) * 0.1));

            message = 'Upgrade Successful!';
        } else {
            message = 'Upgrade Failed!';
        }

        user.markModified('inventory');
        await user.save();

        // Log Transaction
        const tx = new Transaction({
            userId,
            type: 'EQUIPMENT_UPGRADE',
            amount: config.fee,
            status: isSuccess ? 'COMPLETED' : 'FAILED',
            description: `Upgrade ${targetItem.name.en} Lv.${currentLevel} -> Lv.${nextLevel}: ${isSuccess ? 'Success' : 'Fail'}`
        });
        await tx.save();

        res.json({
            success: isSuccess,
            message,
            item: user.inventory[freshTargetIndex],
            inventory: user.inventory,
            balance: user.balance
        });

    } catch (error) {
        console.error('Upgrade Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
