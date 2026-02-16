
import { MINING_VOLATILITY_CONFIG } from './constants';

function calculateDailyYield(presetId: number): { amount: number; isJackpot: boolean } {
    const config = MINING_VOLATILITY_CONFIG[presetId];
    if (!config) return { amount: 0, isJackpot: false };

    const randomBonus = Math.floor(Math.random() * (config.maxRandom + 1));
    const rawYield = config.baseValue + randomBonus;

    let finalYield = rawYield;
    let isJackpot = false;

    if (config.jackpotChance > 0 && Math.random() < config.jackpotChance) {
        finalYield = Math.floor(rawYield * config.jackpotMultiplier);
        isJackpot = true;
    }

    return { amount: Math.floor(finalYield), isJackpot };
}

console.log("=== MINING YIELD SIMULATION (10,000 attempts per tier) ===");
Object.keys(MINING_VOLATILITY_CONFIG).forEach(tierId => {
    const tier = Number(tierId);
    let min = Infinity;
    let max = -Infinity;
    let jackpots = 0;
    let total = 0;
    const iterations = 10000;

    for (let i = 0; i < iterations; i++) {
        const { amount, isJackpot } = calculateDailyYield(tier);
        if (amount < min) min = amount;
        if (amount > max) max = amount;
        if (isJackpot) jackpots++;
        total += amount;
    }

    const config = MINING_VOLATILITY_CONFIG[tier];
    console.log(`Tier ${tier} (${config.type}):`);
    console.log(`  Expected Range: ${config.baseValue} - ${config.baseValue + config.maxRandom} THB`);
    console.log(`  Actual Min: ${min} | Max: ${max}`);
    console.log(`  Average Yield: ${(total / iterations).toFixed(2)} THB`);
    console.log(`  Jackpots: ${jackpots} (${(jackpots / iterations * 100).toFixed(2)}%)`);
    console.log("-----------------------------------------");
});
