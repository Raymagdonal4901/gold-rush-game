
function simulateLoot() {
    const results = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const materialNames = { 1: 'Coal', 2: 'Copper', 3: 'Iron', 4: 'Gold', 5: 'Diamond' };
    const iterations = 10000;

    for (let i = 0; i < iterations; i++) {
        const rand = Math.random() * 100;
        let lootTier = 1;
        if (rand < 40) lootTier = 1;
        else if (rand < 70) lootTier = 2;
        else if (rand < 85) lootTier = 3;
        else if (rand < 95) lootTier = 4;
        else lootTier = 5;
        results[lootTier]++;
    }

    console.log(`Simulation over ${iterations} iterations:`);
    for (let tier in results) {
        const percent = ((results[tier] / iterations) * 100).toFixed(2);
        console.log(`${materialNames[tier]} (Tier ${tier}): ${results[tier]} times (${percent}%)`);
    }
}

simulateLoot();
