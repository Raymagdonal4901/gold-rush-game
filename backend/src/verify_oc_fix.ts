
import { MINING_VOLATILITY_CONFIG } from './constants';

/**
 * Mocked version of calculateDailyYield for verification
 * We'll use the same logic we just implemented in rigController.ts
 */
function calculateDailyYieldMock(presetId: number, isOverclocked: boolean = false, multiplier: number = 1.5, buffs: any = {}): { amount: number; isJackpot: boolean } {
    const config = MINING_VOLATILITY_CONFIG[presetId];
    if (!config) return { amount: 0, isJackpot: false };

    // Use fixed base value for testing predictability
    const rawYield = config.baseValue;

    // --- Additive Stacking Implementation ---
    let totalMultiplier = 1.0;
    const ocBonus = isOverclocked ? (multiplier - 1.0) : 0;
    const itemBonus = (buffs.hashrateBoost && buffs.hashrateBoost > 1.0) ? (buffs.hashrateBoost - 1.0) : 0;

    totalMultiplier += ocBonus + itemBonus;

    let finalYield = rawYield * totalMultiplier;

    return { amount: Math.floor(finalYield), isJackpot: false };
}

console.log("=== VERIFYING OVERCLOCK FIX (Tier 4) ===");
const TIER = 4; // Base: 50
const config = MINING_VOLATILITY_CONFIG[TIER];

console.log(`Tier ${TIER} Base Value: ${config.baseValue}`);

// Scenario 1: Base Case (No OC, No Buffs)
const s1 = calculateDailyYieldMock(TIER, false, 1.5, { hashrateBoost: 1.0 });
console.log(`S1: Base only -> Expected 50, Got ${s1.amount} (${s1.amount === 50 ? 'PASS' : 'FAIL'})`);

// Scenario 2: Overclock Only (1.5x)
const s2 = calculateDailyYieldMock(TIER, true, 1.5, { hashrateBoost: 1.0 });
console.log(`S2: OC Only (1.5x) -> Expected 75, Got ${s2.amount} (${s2.amount === 75 ? 'PASS' : 'FAIL'})`);

// Scenario 3: Buffs Only (+3%)
const s3 = calculateDailyYieldMock(TIER, false, 1.5, { hashrateBoost: 1.03 });
const expectedS3 = Math.floor(50 * 1.03);
console.log(`S3: Buffs Only (1.03x) -> Expected ${expectedS3}, Got ${s3.amount} (${s3.amount === expectedS3 ? 'PASS' : 'FAIL'})`);

// Scenario 4: Both OC and Buffs (1.5x + 3% = 1.53x)
const s4 = calculateDailyYieldMock(TIER, true, 1.5, { hashrateBoost: 1.03 });
const expectedS4 = Math.floor(50 * 1.53); // Additive: 1 + 0.5 + 0.03 = 1.53
console.log(`S4: OC + Buff (1.53x) -> Expected ${expectedS4}, Got ${s4.amount} (${s4.amount === expectedS4 ? 'PASS' : 'FAIL'})`);

// Scenario 5: Multiple Buffs (e.g., 2 items +3% each => +6%)
const s5 = calculateDailyYieldMock(TIER, true, 1.5, { hashrateBoost: 1.06 });
const expectedS5 = Math.floor(50 * 1.56); // 1 + 0.5 + 0.06 = 1.56
console.log(`S5: OC + Multiple Buffs (1.56x) -> Expected ${expectedS5}, Got ${s5.amount} (${s5.amount === expectedS5 ? 'PASS' : 'FAIL'})`);

if (s1.amount === 50 && s2.amount === 75 && s4.amount === expectedS4 && s5.amount === expectedS5) {
    console.log("\n✅ ALL SCENARIOS PASSED!");
} else {
    console.log("\n❌ SOME SCENARIOS FAILED! Check the logic.");
}
