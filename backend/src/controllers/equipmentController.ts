import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ENHANCE_RULES, EQUIPMENT_PRIMARY_MATERIALS, SHOP_ITEMS } from '../constants';
import { recalculateUserIncome } from './userController';

export const enhanceEquipment = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        if (!user || !user.inventory) return res.status(401).json({ message: 'Unauthorized' });

        const { itemId } = req.body;
        const itemIndex = user.inventory.findIndex((i: any) => i.id === itemId);
        if (itemIndex === -1) return res.status(404).json({ message: 'Item not found' });

        const item = user.inventory[itemIndex];
        const currentLevel = item.level || 0;

        if (currentLevel >= 5) return res.status(400).json({ message: 'Item is already at max level (+5)' });

        const targetLevel = currentLevel + 1;
        const rules = ENHANCE_RULES[targetLevel];
        if (!rules) return res.status(400).json({ message: 'Enhancement rules not found' });

        // 1. Determine Primary Material
        // We match the typeId (e.g., 'hat_v1') to the generic type (e.g., 'hat')
        const genericType = Object.keys(EQUIPMENT_PRIMARY_MATERIALS).find(type => item.typeId.startsWith(type));
        if (!genericType) return res.status(400).json({ message: 'This item cannot be enhanced' });

        const matTier = EQUIPMENT_PRIMARY_MATERIALS[genericType];
        const matAmount = rules.matAmount;
        const chipAmount = rules.chipAmount;

        // 2. Validation
        // Check Materials
        if (!user.materials || (user.materials[matTier.toString()] || 0) < matAmount) {
            return res.status(400).json({ message: 'Insufficient materials' });
        }

        // Check Chips
        const chips = user.inventory.filter((i: any) => i.typeId === 'upgrade_chip');
        if (chips.length < chipAmount) {
            return res.status(400).json({ message: 'Insufficient Upgrade Chips' });
        }

        // 3. Deduct Resources
        // Deduct Materials
        user.materials[matTier.toString()] -= matAmount;
        user.markModified('materials');

        // Deduct Chips
        let chipsToDeduct = chipAmount;
        while (chipsToDeduct > 0) {
            const chipIdx = user.inventory.findIndex((i: any) => i.typeId === 'upgrade_chip');
            user.inventory.splice(chipIdx, 1);
            chipsToDeduct--;
        }

        // 4. RNG Roll
        const roll = Math.random();
        const success = roll <= rules.chance;

        let status = 'FAIL';
        let oldLevel = currentLevel;
        let newLevel = currentLevel;

        if (success) {
            status = 'SUCCESS';
            newLevel = targetLevel;
            item.level = newLevel;

            // Apply Stat Bonus
            // Assuming baseBonus is stored on the item. If not, we set it now.
            if (item.baseBonus === undefined) {
                // If it's the first time upgrading, the current dailyBonus is the base
                item.baseBonus = item.dailyBonus;
            }

            // New Bonus = baseBonus * (1 + bonus_from_table)
            item.dailyBonus = item.baseBonus * (1 + rules.statBonus);
            item.dailyBonus = Math.round(item.dailyBonus * 100) / 100;
        } else {
            // Failure Penalty
            if (rules.penalty === 'DOWNGRADE') {
                newLevel = Math.max(0, currentLevel - 1);
                status = 'DOWNGRADE';
            } else if (rules.penalty === 'RESET') {
                newLevel = 0;
                status = 'RESET';
            }

            item.level = newLevel;

            // Re-calculate bonus based on new (lower/reset) level
            if (item.baseBonus !== undefined) {
                if (newLevel === 0) {
                    item.dailyBonus = item.baseBonus;
                } else {
                    const prevRules = ENHANCE_RULES[newLevel];
                    item.dailyBonus = item.baseBonus * (1 + prevRules.statBonus);
                    item.dailyBonus = Math.round(item.dailyBonus * 100) / 100;
                }
            }
        }

        user.markModified('inventory');
        await user.save();
        await recalculateUserIncome((user._id as any).toString());

        return res.json({
            success: success,
            status: status,
            oldLevel: oldLevel,
            newLevel: newLevel,
            item: item,
            consumed: {
                matTier,
                matAmount,
                chipAmount
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
