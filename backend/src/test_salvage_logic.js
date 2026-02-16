
const SALVAGE_CONFIG = {
    TIER_1: {
        materials: [
            { tier: 1, min: 3, max: 5 }, // Coal
            { tier: 2, min: 1, max: 2 }  // Copper
        ],
        bonus: { itemId: 'repair_kit_1', chance: 0.10 }
    },
    TIER_2: {
        materials: [
            { tier: 2, min: 4, max: 6 }, // Copper
            { tier: 3, min: 1, max: 3 }  // Iron
        ],
        bonus: { itemId: 'repair_kit_1', chance: 0.15 }
    },
    TIER_3: {
        materials: [
            { tier: 3, min: 5, max: 8 }, // Iron
            { tier: 4, min: 1, max: 2 }  // Gold
        ],
        bonus: { itemId: 'repair_kit_2', chance: 0.10 }
    },
    TIER_4: {
        materials: [
            { tier: 4, min: 4, max: 6 }, // Gold
            { tier: 5, min: 0, max: 1, chance: 0.30 } // 30% Chance for Diamond
        ],
        bonus: { itemId: 'repair_kit_2', chance: 0.20, count: 2 }
    }
};

function testSalvage(salvageTier) {
    console.log(`\n--- Testing ${salvageTier} ---`);
    const config = SALVAGE_CONFIG[salvageTier];
    let totalMats = {};
    let bonusCount = 0;
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
        for (const mat of config.materials) {
            const chance = mat.chance ?? 1;
            if (Math.random() <= chance) {
                const amount = Math.floor(Math.random() * (mat.max - mat.min + 1)) + mat.min;
                totalMats[mat.tier] = (totalMats[mat.tier] || 0) + amount;
            }
        }
        if (config.bonus && Math.random() <= config.bonus.chance) {
            bonusCount += (config.bonus.count || 1);
        }
    }

    console.log(`After ${iterations} iterations:`);
    for (const tier in totalMats) {
        console.log(`  Material Tier ${tier}: Total ${totalMats[tier]}, Avg: ${(totalMats[tier] / iterations).toFixed(2)}`);
    }
    console.log(`  Bonus Items (Repair Kits): Total ${bonusCount}, Actual Rate: ${(bonusCount / iterations * 100).toFixed(2)}%`);
}

testSalvage('TIER_1');
testSalvage('TIER_2');
testSalvage('TIER_3');
testSalvage('TIER_4');
