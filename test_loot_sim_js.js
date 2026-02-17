
const { RIG_LOOT_TABLES, MATERIAL_CONFIG } = require('./backend/src/constants');

function getRigBuffs() {
    return { dropRateBoost: 0 };
}

function rollLoot(presetId: number, buffs: any = {}): { matTier?: number; itemId?: string; amount: number } {
    const table = RIG_LOOT_TABLES[presetId];
    if (!table) return { tier: 1, amount: 1 };

    const boostPercent = (buffs.dropRateBoost || 0) * 100;
    const rand = Math.random() * Math.max(1, 100 - boostPercent);
    let cumulative = 0;
    for (const entry of table) {
        cumulative += entry.chance;
        if (rand < cumulative) {
            const amount = entry.minAmount === entry.maxAmount
                ? entry.minAmount
                : Math.floor(Math.random() * (entry.maxAmount - entry.minAmount + 1)) + entry.minAmount;
            return { tier: entry.matTier, itemId: entry.itemId, amount };
        }
    }
    const last = table[table.length - 1];
    return { tier: last.matTier, itemId: last.itemId, amount: last.minAmount };
}

async function runSimulation(iterations = 1000) {
    console.log(`Simulating ${iterations} intervals...`);
    let successCount = 0;
    let keyCount = 0;
    let otherCount = 0;

    for (let i = 0; i < iterations; i++) {
        // Step 1: Check Drop Chance (MATERIAL_CONFIG.DROP_CHANCE = 0.1)
        if (Math.random() < MATERIAL_CONFIG.DROP_CHANCE) {
            successCount++;
            // Step 2: Roll Loot
            const loot = rollLoot(3); // Testing with Tier 3
            if (loot.itemId === 'chest_key') {
                keyCount++;
            } else {
                otherCount++;
            }
        }
    }

    console.log(`Results:`);
    console.log(`- Success Rate: ${(successCount / iterations * 100).toFixed(2)}% (Target: ~10%)`);
    console.log(`- Mine Keys: ${keyCount}`);
    console.log(`- Other Items: ${otherCount}`);

    if (otherCount === 0 && successCount === keyCount) {
        console.log('Test PASSED: Only Mine Keys are dropping correctly.');
    } else {
        console.log('Test FAILED: Non-key items detected or logic mismatch.');
    }
}

runSimulation();
