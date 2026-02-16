
// Mock test for Overclock Standardization (1.5x)
import { ENERGY_CONFIG } from './constants';

const mockUser = {
    username: 'testuser',
    energy: 100,
    lastEnergyUpdate: new Date(),
    overclockExpiresAt: new Date(Date.now() + 1000000), // Active
    save: async () => { }
};

async function testEnergyDecay() {
    console.log("=== Testing Energy Decay (1.5x) ===");
    const drainRateBase = 4.166666666666667;
    const boost = ENERGY_CONFIG.OVERCLOCK_PROFIT_BOOST || 1.5;
    const drainRateOC = drainRateBase * boost;

    console.log(`Base Drain: ${drainRateBase.toFixed(2)} %/hr`);
    console.log(`OC Drain (1.5x): ${drainRateOC.toFixed(2)} %/hr`);

    if (Math.abs(drainRateOC - 6.25) < 0.01) {
        console.log("✅ Energy Decay Math: PASS");
    } else {
        console.log(`❌ Energy Decay Math: FAIL (Expected ~6.25, got ${drainRateOC.toFixed(2)})`);
    }
}

async function testDurabilityDecay() {
    console.log("\n=== Testing Durability Decay (1.5x) ===");
    const baseDecay = 100;
    const boost = ENERGY_CONFIG.OVERCLOCK_PROFIT_BOOST || 1.5;
    const ocDecay = baseDecay * boost;

    console.log(`Base Decay: ${baseDecay}`);
    console.log(`OC Decay (1.5x): ${ocDecay}`);

    if (ocDecay === 150) {
        console.log("✅ Durability Decay Math: PASS");
    } else {
        console.log(`❌ Durability Decay Math: FAIL (Expected 150, got ${ocDecay})`);
    }
}

async function runTests() {
    await testEnergyDecay();
    await testDurabilityDecay();
}

runTests();
