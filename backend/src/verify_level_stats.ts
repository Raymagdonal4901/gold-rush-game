
import mongoose from 'mongoose';
import { LEVEL_CONFIG } from './constants';
import { calculateUserStats } from './controllers/userController';

const verifyLevelStats = async () => {
    console.log('--- Verifying Level Stats Logic ---');
    console.log('LEVEL_CONFIG:', JSON.stringify(LEVEL_CONFIG, null, 2));

    // Expected values based on user request:
    // Lv 1: Energy 100, Fee 10.0%
    // Lv 2: Energy 105, Fee 9.5%
    // Lv 10: Energy 145, Fee 5.5%

    const testLevels = [1, 2, 3, 10];

    testLevels.forEach(level => {
        const stats = calculateUserStats(level);
        console.log(`\nLevel ${level}:`);
        console.log(`  Max Energy: ${stats.maxEnergy}`);
        console.log(`  Market Fee: ${stats.marketFee}%`);

        let expectedEnergy = 100 + (level - 1) * 5;
        let expectedFee = Math.max(5.0, 10.0 - (level - 1) * 0.5);

        if (stats.maxEnergy === expectedEnergy && stats.marketFee === expectedFee) {
            console.log('  ✅ Correct');
        } else {
            console.error(`  ❌ Incorrect! Expected Energy: ${expectedEnergy}, Fee: ${expectedFee}`);
        }
    });
};

verifyLevelStats();
