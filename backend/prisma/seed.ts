// Admin Seeding Script for Gold Rush Backend
// Creates SUPER_ADMIN account with specified credentials

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const PIN_SALT_ROUNDS = 10;

// ============================================
// SUPER ADMIN CREDENTIALS
// ============================================
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'bleach',
    pinCode: '4901',
    role: UserRole.SUPER_ADMIN,
};

// ============================================
// DEFAULT GAME CONFIGURATION
// ============================================
const DEFAULT_GAME_CONFIG = [
    // Machine Tiers
    {
        key: 'machine_tiers',
        category: 'machines',
        description: 'Mining machine tier configurations',
        value: [
            { id: 1, name: 'เครื่องขุดถ่านหิน (Coal)', price: 1000, dailyProfit: 40, durationMonths: 1, repairCost: 60 },
            { id: 2, name: 'เครื่องขุดทองแดง (Copper)', price: 1500, dailyProfit: 35, durationMonths: 2, repairCost: 90 },
            { id: 3, name: 'เครื่องขุดเหล็ก (Iron)', price: 2000, dailyProfit: 40, durationMonths: 3, repairCost: 120 },
            { id: 4, name: 'เครื่องขุดทองคำ (Gold)', price: 2500, dailyProfit: 45, durationMonths: 4, repairCost: 150 },
            { id: 5, name: 'เครื่องขุดเพชร (Diamond)', price: 3000, dailyProfit: 50, durationMonths: 5, repairCost: 180 },
            { id: 6, name: 'เครื่องขุดปฏิกรณ์ไวเบรเนียม', price: 0, dailyProfit: 100, durationMonths: 999, repairCost: 0, specialProperties: { infiniteDurability: true, zeroEnergy: true, maxAllowed: 1 } },
        ],
    },
    // Material Prices
    {
        key: 'material_prices',
        category: 'materials',
        description: 'Material tier prices',
        value: {
            0: 0,   // Mystery Ore
            1: 10,  // Coal
            2: 20,  // Copper
            3: 35,  // Iron
            4: 60,  // Gold
            5: 120, // Diamond
            6: 300, // Synthetic Oil
            7: 1500 // Vibranium
        },
    },
    // Drop Rates
    {
        key: 'drop_rates',
        category: 'rates',
        description: 'Material drop rates',
        value: {
            dropChance: 0.05,
            dropIntervalMs: 30000,
        },
    },
    // Market Settings
    {
        key: 'market_settings',
        category: 'market',
        description: 'Marketplace configuration',
        value: {
            taxRate: 0.15,
            listingExpiryDays: 7,
            maxListingsPerUser: 20,
        },
    },
    // Energy Settings
    {
        key: 'energy_settings',
        category: 'energy',
        description: 'Energy system configuration',
        value: {
            drainPerRigPerHour: 2.0,
            maxEnergy: 100,
            costPerUnit: 0.02,
        },
    },
    // Repair Settings
    {
        key: 'repair_settings',
        category: 'machines',
        description: 'Machine repair configuration',
        value: {
            durabilityDays: 15,
            costDivisor: 5,
        },
    },
    // Crafting Settings
    {
        key: 'crafting_settings',
        category: 'crafting',
        description: 'Crafting system configuration',
        value: {
            greatSuccessChance: 0.10,
            greatSuccessMultiplier: 1.5,
        },
    },
    // Referral Commission
    {
        key: 'referral_settings',
        category: 'referral',
        description: 'Referral system configuration',
        value: {
            level1Commission: 0.05,  // 5% of referral's tax
            level2Commission: 0.02,  // 2% of level 2 referral's tax
            maxLevels: 2,
        },
    },
    // Slot Expansion
    {
        key: 'slot_expansion',
        category: 'expansion',
        description: 'Slot unlock requirements',
        value: {
            4: { title: 'โรงงานมาตรฐาน', cost: 2000, mats: { 3: 30, 4: 10 }, item: 'chest_key', itemCount: 1 },
            5: { title: 'อาณาจักรเหมือง', cost: 3000, mats: { 5: 10, 6: 5 }, item: 'upgrade_chip', itemCount: 5 },
            6: { title: 'เขตหวงห้ามระดับ 6', cost: 0, mats: { 7: 3, 6: 5 }, item: 'upgrade_chip', itemCount: 10 },
        },
    },
];

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // ============================================
    // 1. Create SUPER_ADMIN Account
    // ============================================
    console.log('👤 Creating SUPER_ADMIN account...');

    const passwordHash = await bcrypt.hash(ADMIN_CREDENTIALS.password, SALT_ROUNDS);
    const pinHash = await bcrypt.hash(ADMIN_CREDENTIALS.pinCode, PIN_SALT_ROUNDS);

    const adminUser = await prisma.user.upsert({
        where: { username: ADMIN_CREDENTIALS.username },
        update: {
            passwordHash,
            pinHash,
            role: ADMIN_CREDENTIALS.role,
        },
        create: {
            username: ADMIN_CREDENTIALS.username,
            passwordHash,
            pinHash,
            role: ADMIN_CREDENTIALS.role,
            referralCode: 'ADMIN_REF_CODE',
            wallet: {
                create: {
                    cashBalance: 999999999,
                    coinBalance: 999999,
                    energy: 100,
                },
            },
        },
        include: {
            wallet: true,
        },
    });

    console.log(`   ✅ SUPER_ADMIN created:`);
    console.log(`      Username: ${adminUser.username}`);
    console.log(`      Role: ${adminUser.role}`);
    console.log(`      ID: ${adminUser.id}`);
    console.log(`      Cash Balance: ${adminUser.wallet?.cashBalance}\n`);

    // ============================================
    // 2. Seed Game Configuration
    // ============================================
    console.log('⚙️  Seeding game configuration...');

    for (const config of DEFAULT_GAME_CONFIG) {
        await prisma.gameConfig.upsert({
            where: { key: config.key },
            update: {
                value: config.value,
                description: config.description,
                updatedBy: adminUser.id,
            },
            create: {
                key: config.key,
                category: config.category,
                value: config.value,
                description: config.description,
                updatedBy: adminUser.id,
            },
        });
        console.log(`   ✅ Config: ${config.key}`);
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n========================================');
    console.log('SUPER_ADMIN CREDENTIALS:');
    console.log('========================================');
    console.log(`Username: ${ADMIN_CREDENTIALS.username}`);
    console.log(`Password: ${ADMIN_CREDENTIALS.password}`);
    console.log(`PIN Code: ${ADMIN_CREDENTIALS.pinCode}`);
    console.log('========================================\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
