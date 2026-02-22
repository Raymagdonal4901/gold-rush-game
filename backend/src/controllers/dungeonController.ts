import { Response } from 'express';
import User from '../models/User';
import Rig from '../models/Rig';
import Transaction from '../models/Transaction';
import { AuthRequest } from '../middleware/auth';
import SystemConfig from '../models/SystemConfig';
import { SHOP_ITEMS, DUNGEON_CONFIG, MATERIAL_CONFIG } from '../constants';

const materialNames = MATERIAL_CONFIG.NAMES;

export const startExpedition = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { dungeonId, rigId, useKey } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.activeExpedition) {
            return res.status(400).json({ message: 'คุณอยู่ในระหว่างการสำรวจอยู่แล้ว' });
        }

        const dungeon = DUNGEON_CONFIG.find(d => d.id === dungeonId);
        if (!dungeon) return res.status(404).json({ message: 'Dungeon not found' });

        const rig = await Rig.findOne({ _id: rigId, ownerId: userId });
        if (!rig) return res.status(404).json({ message: 'Rig not found' });

        // Cost validation
        if (useKey) {
            const keyCost = dungeon.keyCost || 1;
            const keys = user.inventory.filter(i => {
                const typeId = (i.typeId || '').toLowerCase();
                let nameStr = '';
                if (i.name && typeof i.name === 'object') {
                    nameStr = (i.name as any).en || (i.name as any).th || '';
                } else if (typeof i.name === 'string') {
                    nameStr = i.name;
                }
                const nameLower = nameStr.toLowerCase();
                return typeId === 'chest_key' || nameLower.includes('key') || nameLower.includes('กุญแจ');
            });

            if (keys.length < keyCost) {
                return res.status(400).json({
                    message: `คุณต้องใช้กุญแจ ${keyCost} ดอกเพื่อเข้าสำรวจ (คุณมี ${keys.length} ดอก)`
                });
            }

            // Remove the specified number of keys
            let removedCount = 0;
            user.inventory = user.inventory.filter(item => {
                const typeId = (item.typeId || '').toLowerCase();
                let nameStr = '';
                if (item.name && typeof item.name === 'object') {
                    nameStr = (item.name as any).en || (item.name as any).th || '';
                } else if (typeof item.name === 'string') {
                    nameStr = item.name;
                }
                const nameLower = nameStr.toLowerCase();
                const isKey = typeId === 'chest_key' || nameLower.includes('key') || nameLower.includes('กุญแจ');

                if (isKey && removedCount < keyCost) {
                    removedCount++;
                    return false;
                }
                return true;
            });
            user.markModified('inventory');
        } else {
            if (user.balance < dungeon.cost) {
                return res.status(400).json({ message: 'ยอดเงินไม่เพียงพอ' });
            }
            user.balance -= dungeon.cost;

            // Log Transaction
            const tx = new Transaction({
                userId,
                type: 'DUNGEON_ENTRY',
                amount: dungeon.cost,
                status: 'COMPLETED',
                description: `เข้าสำรวจ: ${typeof dungeon.name === 'object' ? dungeon.name.th : dungeon.name}`
            });
            await tx.save();
        }

        const startTime = Date.now();
        const endTime = startTime + (dungeon.durationHours * 60 * 60 * 1000);

        user.activeExpedition = {
            dungeonId,
            rigId,
            startTime,
            endTime
        };

        // Update stats
        if (!user.weeklyStats) user.weeklyStats = {};
        user.weeklyStats.dungeonsEntered = (user.weeklyStats.dungeonsEntered || 0) + 1;
        user.markModified('activeExpedition');
        user.markModified('weeklyStats');
        user.markModified('materials');
        user.markModified('inventory');

        await user.save();

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const claimExpedition = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user || !user.activeExpedition) {
            return res.status(400).json({ message: 'ไม่มีการสำรวจที่พร้อมรับรางวัล' });
        }

        const GRACE_PERIOD = 2000; // 2 seconds grace period
        if (Date.now() < user.activeExpedition.endTime - GRACE_PERIOD) {
            return res.status(400).json({ message: 'การสำรวจยังไม่เสร็จสิ้น' });
        }

        const dungeon = DUNGEON_CONFIG.find(d => d.id === user.activeExpedition!.dungeonId);
        if (!dungeon) return res.status(404).json({ message: 'Dungeon config not found' });

        // Reward Generation Logic
        let rewards: any[] = [];
        let rewardType = 'common';
        let rewardString = '';

        // 1. Determine Reward Tier based on probabilities
        const probs = dungeon.probabilities || { common: 80, salt: 20, rare: 0 };
        const roll = Math.random() * 100;

        // Helper to pick items from a pool
        const pickItems = (pool: any[], poolType: string) => {
            const result: any[] = [];
            if (!pool || pool.length === 0) return result;

            const tierDropMode = dungeon.dropRules?.[poolType as 'common' | 'salt' | 'rare'] || dungeon.dropMode || 'PICK_ONE';

            if (tierDropMode === 'ALL') {
                pool.forEach(item => {
                    let finalAmount = item.amount || 1;
                    if (item.minAmount !== undefined && item.maxAmount !== undefined) {
                        finalAmount = Math.floor(Math.random() * (item.maxAmount - item.minAmount + 1)) + item.minAmount;
                    }
                    result.push({ ...item, amount: finalAmount, type: poolType });
                });
            } else {
                const idx = Math.floor(Math.random() * pool.length);
                const item = pool[idx];
                let finalAmount = item.amount || 1;
                if (item.minAmount !== undefined && item.maxAmount !== undefined) {
                    finalAmount = Math.floor(Math.random() * (item.maxAmount - item.minAmount + 1)) + item.minAmount;
                }
                result.push({ ...item, amount: finalAmount, type: poolType });
            }
            return result;
        };

        if (dungeon.probabilities) {
            if (roll < probs.rare) {
                // JACKPOT: Rare + Common + Salt
                rewards.push(...pickItems(dungeon.rewards.rare, 'rare'));
                rewards.push(...pickItems(dungeon.rewards.common, 'common'));
                rewards.push(...pickItems(dungeon.rewards.salt, 'salt'));
                rewardType = 'rare';
            } else if (roll < probs.rare + probs.salt) {
                // SALT
                rewards.push(...pickItems(dungeon.rewards.salt, 'salt'));
            } else {
                // COMMON
                rewards.push(...pickItems(dungeon.rewards.common, 'common'));
            }
        } else {
            // Legacy Fallback
            if (roll < 20) {
                rewards.push(...pickItems(dungeon.rewards.salt, 'salt'));
            } else {
                rewards.push(...pickItems(dungeon.rewards.common, 'common'));
            }
        }

        // 3. Legacy Jackpot Logic (Only for Dungeons without specific probabilities config, i.e., ID 2 & 3 - IF they haven't been migrated yet)
        // Since we are migrating ID 2, we shouldn't trigger this for it anymore if probabilities are set.
        if (!dungeon.probabilities && dungeon.id !== 1 && dungeon.rewards.rare.length > 0) {
            const idx = Math.floor(Math.random() * dungeon.rewards.rare.length);
            rewards.push({ ...dungeon.rewards.rare[idx], type: 'rare' });
            rewardType = 'rare';
        }

        // 4. Global Key Drop Chance (Configurable via Admin)
        const config = await SystemConfig.findOne();
        const dropRate = config?.dropRate || 0; // percentage (0-100)

        if (dropRate > 0) {
            const rollKey = Math.random() * 100;
            if (rollKey <= dropRate) {
                rewards.push({ itemId: 'chest_key', amount: 1, chance: dropRate, type: 'rare' });
                rewardType = 'rare'; // Upgrade visual to rare if key drops
            }
        }

        const materialNames: any = {
            0: { th: 'เศษหิน', en: 'Stone Shards' },
            1: { th: 'ถ่านหิน', en: 'Coal' },
            2: { th: 'ทองแดง', en: 'Copper' },
            3: { th: 'เหล็ก', en: 'Iron' },
            4: { th: 'ทองคำ', en: 'Gold' },
            5: { th: 'เพชร', en: 'Diamond' },
            6: { th: 'น้ำมันดิบ', en: 'Crude Oil' },
            7: { th: 'แร่วาเบรเนียม', en: 'Vibranium' },
            8: { th: 'แร่ลึกลับ', en: 'Mysterious Ore' },
            9: { th: 'แร่ในตำนาน', en: 'Legendary Ore' }
        };

        // Apply Rewards
        for (const r of rewards) {
            let nameObj: { th: string, en: string } = { th: '', en: '' };
            if (r.itemId) {
                const shopItem = SHOP_ITEMS.find((s: any) => s.id === r.itemId);
                if (shopItem) {
                    nameObj = shopItem.name;
                    const lifespan = shopItem.lifespanDays || 29;
                    const bonus = (Number(shopItem.minBonus) + Number(shopItem.maxBonus)) / 2 || 0;

                    user.inventory.push({
                        id: Math.random().toString(36).substr(2, 9),
                        typeId: shopItem.id,
                        name: shopItem.name,
                        price: shopItem.price,
                        dailyBonus: bonus,
                        durationBonus: shopItem.durationBonus || 0,
                        rarity: 'RARE',
                        purchasedAt: Date.now(),
                        lifespanDays: lifespan,
                        expireAt: Date.now() + (lifespan * 24 * 60 * 60 * 1000),
                        maxDurability: shopItem.maxDurability || (lifespan * 100),
                        currentDurability: shopItem.maxDurability || (lifespan * 100),
                        level: 1
                    });
                    user.markModified('inventory');
                }
            } else if (r.tier !== undefined) {
                if (!user.materials) user.materials = {};
                user.materials[r.tier.toString()] = (user.materials[r.tier.toString()] || 0) + (r.amount || 1);
                nameObj = materialNames[r.tier] || { th: `Unknown Ore (${r.tier})`, en: `Unknown Ore (${r.tier})` };
                user.markModified('materials');
            }

            const label = r.type === 'rare' ? '[JACKPOT] ' : '';
            const nameStr = typeof nameObj === 'object' ? nameObj.th : nameObj;
            rewardString += `${rewardString ? ' + ' : ''}${label}${nameStr} x${r.amount || 1}`;
        }

        user.activeExpedition = null; // CRITICAL: Clear expedition BEFORE marking modified
        user.markModified('activeExpedition');
        user.markModified('materials');
        user.markModified('inventory');
        await user.save();

        // Log Transaction
        const rewardTx = new Transaction({
            userId,
            type: 'DUNGEON_REWARD',
            amount: 0,
            status: 'COMPLETED',
            description: `รับรางวัลจากการสำรวจ: ${rewardString}`
        });
        await rewardTx.save();

        // Log Transaction if reward included significant things (optional)

        res.json({
            success: true,
            reward: rewardString,
            type: rewardType,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const skipExpeditionTime = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { itemId } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.activeExpedition) {
            return res.status(400).json({ message: 'No active expedition' });
        }

        const itemIndex = user.inventory.findIndex(i => i.typeId === itemId);
        if (itemIndex === -1) return res.status(400).json({ message: 'Item not found in inventory' });

        let skipMs = 0;
        if (itemId === 'hourglass_small') skipMs = 30 * 60 * 1000;
        else if (itemId === 'hourglass_medium') skipMs = 2 * 60 * 60 * 1000;
        else if (itemId === 'hourglass_large') skipMs = 6 * 60 * 60 * 1000;

        user.activeExpedition.endTime -= skipMs;
        user.inventory.splice(itemIndex, 1);
        user.markModified('activeExpedition');
        user.markModified('inventory');

        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
