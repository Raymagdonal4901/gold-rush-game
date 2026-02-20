export const CURRENCY = '฿';
export const EXCHANGE_RATE_USD_THB = 1;
export const EXCHANGE_RATE_USDT_THB = 31;
export const BASE_CLAIM_AMOUNT = 0;
export const DEMO_SPEED_MULTIPLIER = 10; // 10x Speed for simulation

export const RARITY_SETTINGS: Record<string, { color: string; label: string; bonus: number; upgradeIncrement: number; border: string; bgGradient: string; shadow: string }> = {
    COMMON: { color: 'text-stone-400', label: 'Common', bonus: 0.5, upgradeIncrement: 0.2, border: 'border-stone-600', bgGradient: 'from-stone-800 to-stone-900', shadow: 'shadow-none' },
    UNCOMMON: { color: 'text-emerald-400', label: 'Uncommon', bonus: 0.75, upgradeIncrement: 0.25, border: 'border-emerald-500', bgGradient: 'from-emerald-900 to-emerald-800', shadow: 'shadow-emerald-500/20' },
    RARE: { color: 'text-blue-400', label: 'Rare', bonus: 1.0, upgradeIncrement: 0.3, border: 'border-blue-500', bgGradient: 'from-blue-900 to-blue-800', shadow: 'shadow-blue-500/20' },
    SUPER_RARE: { color: 'text-purple-400', label: 'Super Rare', bonus: 1.5, upgradeIncrement: 0.4, border: 'border-purple-500', bgGradient: 'from-purple-900 to-purple-800', shadow: 'shadow-purple-500/20' },
    EPIC: { color: 'text-orange-400', label: 'Epic', bonus: 2.0, upgradeIncrement: 0.5, border: 'border-orange-500', bgGradient: 'from-orange-900 to-orange-800', shadow: 'shadow-orange-500/20' },
    LEGENDARY: { color: 'text-yellow-400', label: 'Legendary', bonus: 3.0, upgradeIncrement: 0.6, border: 'border-yellow-500', bgGradient: 'from-yellow-900 to-yellow-800', shadow: 'shadow-yellow-500/20' },
    MYTHIC: { color: 'text-rose-500', label: 'Mythic', bonus: 4.0, upgradeIncrement: 0.8, border: 'border-rose-500', bgGradient: 'from-rose-900 to-rose-800', shadow: 'shadow-rose-500/30' },
    ULTRA_LEGENDARY: { color: 'text-cyan-400', label: 'Ultra Legendary', bonus: 5.0, upgradeIncrement: 1.0, border: 'border-cyan-500', bgGradient: 'from-cyan-900 to-cyan-800', shadow: 'shadow-cyan-500/30' },
    DIVINE: { color: 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]', label: 'Divine', bonus: 10.0, upgradeIncrement: 2.0, border: 'border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.3)]', bgGradient: 'from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500', shadow: 'shadow-white/20' },
};

export const EQUIPMENT_SERIES: Record<string, { title: { th: string; en: string }; desc: { th: string; en: string }; tiers: { rarity: string; name: { th: string; en: string }; stat: { th: string; en: string } }[] }> = {
    hat: {
        title: { th: "หมวกนิรภัย", en: "Safety Helmet" },
        desc: { th: "เพิ่มความปลอดภัย & ลดค่าซ่อม", en: "Safety & Repair Cost Reduction" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'หมวกนิรภัยมาตรฐาน', en: 'Standard Safety Helmet' }, stat: { th: 'ค่าซ่อม -5%', en: 'Repair Cost -5%' } },
            { rarity: 'RARE', name: { th: 'หมวกนิรภัยทนความร้อน', en: 'Heat-Resistant Helmet' }, stat: { th: 'ค่าซ่อม -10%', en: 'Repair Cost -10%' } },
            { rarity: 'EPIC', name: { th: 'หมวกนิรภัยอัจฉริยะ', en: 'Smart Helmet' }, stat: { th: 'ค่าซ่อม -15%', en: 'Repair Cost -15%' } },
            { rarity: 'LEGENDARY', name: { th: 'หมวกนิรภัยนาโน', en: 'Nano Helmet' }, stat: { th: 'ค่าซ่อม -20%', en: 'Repair Cost -20%' } },
        ]
    },
    uniform: {
        title: { th: "ชุดปฏิบัติงาน", en: "Work Uniform" },
        desc: { th: "ลดความเหนื่อยล้า & ยืดอายุสัญญา", en: "Reduce Fatigue & Extend Contract" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'ชุดป้องกัน', en: 'Safety Uniform' }, stat: { th: 'สัญญา +5 วัน', en: 'Contract +5 Days' } },
            { rarity: 'RARE', name: { th: 'ชุดหมีช่าง', en: 'Mechanic Coveralls' }, stat: { th: 'สัญญา +10 วัน', en: 'Contract +10 Days' } },
            { rarity: 'EPIC', name: { th: 'ชุดกันความร้อน', en: 'Heat Suit' }, stat: { th: 'สัญญา +20 วัน', en: 'Contract +20 Days' } },
            { rarity: 'LEGENDARY', name: { th: 'ชุดเกราะ Exosuit', en: 'Exosuit Armor' }, stat: { th: 'สัญญา +30 วัน', en: 'Contract +30 Days' } },
        ]
    },
    bag: {
        title: { th: "กระเป๋าใส่อุปกรณ์", en: "Equipment Bag" },
        desc: { th: "เก็บของได้เยอะ & เพิ่มมูลค่า", en: "Capacity & Value" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'เป้สนามอเนกประสงค์', en: 'Utility Backpack' }, stat: { th: 'ราคาขาย +1%', en: 'Sell Price +1%' } },
            { rarity: 'RARE', name: { th: 'กระเป๋าเก็บความเย็น', en: 'Cooler Bag' }, stat: { th: 'ราคาขาย +2%', en: 'Sell Price +2%' } },
            { rarity: 'EPIC', name: { th: 'กล่องนิรภัย', en: 'Security Box' }, stat: { th: 'ราคาขาย +3%', en: 'Sell Price +3%' } },
            { rarity: 'LEGENDARY', name: { th: 'ตู้เซฟพกพา', en: 'Portable Safe' }, stat: { th: 'ราคาขาย +5%', en: 'Sell Price +5%' } },
        ]
    },
    boots: {
        title: { th: "รองเท้าปฏิบัติงาน", en: "Work Boots" },
        desc: { th: "ความคล่องตัว & ประหยัดพลังงาน", en: "Agility & Energy Saving" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'รองเท้าเซฟตี้', en: 'Safety Boots' }, stat: { th: 'ประหยัดค่าไฟ 5%', en: 'Save Energy 5%' } },
            { rarity: 'RARE', name: { th: 'รองเท้าพื้นยางกันลื่น', en: 'Anti-Slip Boots' }, stat: { th: 'ประหยัดค่าไฟ 10%', en: 'Save Energy 10%' } },
            { rarity: 'EPIC', name: { th: 'รองเท้าแม่เหล็ก', en: 'Magnetic Boots' }, stat: { th: 'ประหยัดค่าไฟ 20%', en: 'Save Energy 20%' } },
            { rarity: 'LEGENDARY', name: { th: 'รองเท้าไร้น้ำหนัก', en: 'Zero-G Boots' }, stat: { th: 'ประหยัดค่าไฟ 30%', en: 'Save Energy 30%' } },
        ]
    },
    mobile: {
        title: { th: "อุปกรณ์สื่อสาร", en: "Communication Device" },
        desc: { th: "การเชื่อมต่อ & ลดค่าใช้จ่าย", en: "Connection & Reduce Expenses" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'สมาทโฟน', en: 'Smartphone' }, stat: { th: 'ลดค่าใช้จ่าย 2%', en: 'Reduce Expenses 2%' } },
            { rarity: 'RARE', name: { th: 'แท็บเล็ตสื่อสาร', en: 'Comm Tablet' }, stat: { th: 'ลดค่าใช้จ่าย 5%', en: 'Reduce Expenses 5%' } },
            { rarity: 'EPIC', name: { th: 'ดาวเทียมพกพา', en: 'Portable Satellite' }, stat: { th: 'ลดค่าใช้จ่าย 8%', en: 'Reduce Expenses 8%' } },
            { rarity: 'LEGENDARY', name: { th: 'เครื่องสื่อสารควอนตัม', en: 'Quantum Comm' }, stat: { th: 'ลดค่าใช้จ่าย 12%', en: 'Reduce Expenses 12%' } },
        ]
    },
    pc: {
        title: { th: "อุปกรณ์ควบคุม", en: "Control Unit" },
        desc: { th: "ควบคุมการทำงาน & เพิ่มโบนัส", en: "Control & Bonus Chance" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'โน๊ตบุ๊ค', en: 'Notebook' }, stat: { th: 'โอกาสโบนัส 1%', en: 'Bonus Chance 1%' } },
            { rarity: 'RARE', name: { th: 'พีซีตั้งโต๊ะ', en: 'Desktop PC' }, stat: { th: 'โอกาสโบนัส 2%', en: 'Bonus Chance 2%' } },
            { rarity: 'EPIC', name: { th: 'เซิร์ฟเวอร์', en: 'Server' }, stat: { th: 'โอกาสโบนัส 4%', en: 'Bonus Chance 4%' } },
            { rarity: 'LEGENDARY', name: { th: 'ซูเปอร์คอมพิวเตอร์', en: 'Super Computer' }, stat: { th: 'โอกาสโบนัส 6%', en: 'Bonus Chance 6%' } },
        ]
    },
    glasses: {
        title: { th: "แว่นตาอัจฉริยะ", en: "Smart Glasses" },
        desc: { th: "การมองเห็น & ประสิทธิภาพ", en: "Vision & Performance" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'แว่นตากันฝุ่น', en: 'Safety Glasses' }, stat: { th: 'โบนัส +2%', en: 'Bonus +2%' } },
            { rarity: 'RARE', name: { th: 'แว่นตากรองแสง', en: 'Blue Light Glasses' }, stat: { th: 'โบนัส +5%', en: 'Bonus +5%' } },
            { rarity: 'EPIC', name: { th: 'แว่นตา AR', en: 'AR Glasses' }, stat: { th: 'โบนัส +8%', en: 'Bonus +8%' } },
            { rarity: 'LEGENDARY', name: { th: 'แว่นตา X-Ray', en: 'X-Ray Glasses' }, stat: { th: 'โบนัส +12%', en: 'Bonus +12%' } },
        ]
    },
    auto_excavator: {
        title: { th: "ยานพาหนะ", en: "Vehicle" },
        desc: { th: "ขนส่ง & ความจุ", en: "Transport & Capacity" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'รถไฟฟ้า', en: 'Electric Vehicle' }, stat: { th: 'Jackpot 2%', en: 'Jackpot 2%' } },
            { rarity: 'RARE', name: { th: 'รถกระบะ', en: 'Pickup Truck' }, stat: { th: 'Jackpot 5%', en: 'Jackpot 5%' } },
            { rarity: 'EPIC', name: { th: 'รถบรรทุก', en: 'Truck' }, stat: { th: 'Jackpot 8%', en: 'Jackpot 8%' } },
            { rarity: 'LEGENDARY', name: { th: 'โดรนขนส่ง', en: 'Transport Drone' }, stat: { th: 'Jackpot 12%', en: 'Jackpot 12%' } },
        ]
    },
    glove: {
        title: { th: "ถุงมือทำงาน", en: "Work Gloves" },
        desc: { th: "เพิ่มความเร็วในการขุด & ประสิทธิภาพ", en: "Mining Speed & Efficiency" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'ถุงมือมาตรฐาน', en: 'Standard Gloves' }, stat: { th: 'โบนัสขุด +5%', en: 'Mining Bonus +5%' } },
            { rarity: 'RARE', name: { th: 'ถุงมือช่างมืออาชีพ', en: 'Pro Mechanic Gloves' }, stat: { th: 'โบนัสขุด +10%', en: 'Mining Bonus +10%' } },
            { rarity: 'EPIC', name: { th: 'ถุงมือสั่นสะเทือน', en: 'Vibration Gloves' }, stat: { th: 'โบนัสขุด +15%', en: 'Mining Bonus +15%' } },
            { rarity: 'LEGENDARY', name: { th: 'ถุงมือพลังงานไซเบอร์', en: 'Cybernetic Gloves' }, stat: { th: 'โบนัสขุด +20%', en: 'Mining Bonus +20%' } },
        ]
    },
    pendant: {
        title: { th: "สร้อยคอโชคดี", en: "Lucky Pendant" },
        desc: { th: "เพิ่มโอกาสพบไอเทม & โบนัส", en: "Item Drop & Bonus Chance" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'จี้เหรียญโบราณ', en: 'Ancient Coin Pendant' }, stat: { th: 'โบนัส +2%', en: 'Bonus +2%' } },
            { rarity: 'RARE', name: { th: 'จี้หยกนำโชค', en: 'Lucky Jade Pendant' }, stat: { th: 'โบนัส +5%', en: 'Bonus +5%' } },
            { rarity: 'EPIC', name: { th: 'จี้คริสตัลพลังงาน', en: 'Energy Crystal Pendant' }, stat: { th: 'โบนัส +8%', en: 'Bonus +8%' } },
            { rarity: 'LEGENDARY', name: { th: 'จี้มิติดาวตก', en: 'Meteorite Pendant' }, stat: { th: 'โบนัส +12%', en: 'Bonus +12%' } },
        ]
    },
    ring: {
        title: { th: "แหวนแห่งความมั่งคั่ง", en: "Ring of Wealth" },
        desc: { th: "เพิ่มรายได้ & ความมั่นคง", en: "Yield & Stability" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'แหวนนากพื้นเมือง', en: 'Local Bronze Ring' }, stat: { th: 'รายได้ +1%', en: 'Yield +1%' } },
            { rarity: 'RARE', name: { th: 'แหวนเงินสลักลาย', en: 'Engraved Silver Ring' }, stat: { th: 'รายได้ +3%', en: 'Yield +3%' } },
            { rarity: 'EPIC', name: { th: 'แหวนทองคำขาว', en: 'White Gold Ring' }, stat: { th: 'รายได้ +6%', en: 'Yield +6%' } },
            { rarity: 'LEGENDARY', name: { th: 'แหวนนพเก้า', en: 'Legendary Nine Gems Ring' }, stat: { th: 'รายได้ +10%', en: 'Yield +10%' } },
        ]
    }
};


export const GIFT_CYCLE_DAYS = 1;

export const RENEWAL_CONFIG = {
    WINDOW_DAYS: 3,
    MAX_RENEWALS: 2,
    DISCOUNT_PERCENT: 0.05,
};

export const REPAIR_CONFIG = {
    DURABILITY_DAYS: 7,
    COST_DIVISOR: 5,
};

export const REFERRAL_COMMISSION = {
    BUY: {
        L1: 0.05, // 5%
        L2: 0.02, // 2%
        L3: 0.01  // 1%
    },
    YIELD: {
        L1: 0.01,   // 1%
        L2: 0.005,  // 0.5%
        L3: 0.002   // 0.2%
    }
};


export const UPGRADE_CONFIG = {
    MAX_LEVEL: 10,
    LEVELS: {
        2: { successRate: 1.0, catalystCost: 1, fee: 10 },
        3: { successRate: 0.9, catalystCost: 2, fee: 20 },
        4: { successRate: 0.8, catalystCost: 3, fee: 40 },
        5: { successRate: 0.7, catalystCost: 5, fee: 80 },
        6: { successRate: 0.6, catalystCost: 8, fee: 150 },
        7: { successRate: 0.5, catalystCost: 12, fee: 300 },
        8: { successRate: 0.4, catalystCost: 18, fee: 500 },
        9: { successRate: 0.3, catalystCost: 25, fee: 1000 },
        10: { successRate: 0.2, catalystCost: 35, fee: 2000 }
    } as Record<number, { successRate: number; catalystCost: number; fee: number }>
};

export const MATERIAL_CONFIG = {
    MAX_CAPACITY: 1,
    DROP_CHANCE: 0.1, // 10% chance to drop when interval hits
    DROP_INTERVAL_MS: 14400000, // 4 Hours (matching frontend)
    NAMES: {
        0: { th: 'เศษหิน', en: 'Stone Shards' },
        1: { th: 'ถ่านหิน', en: 'Coal' },
        2: { th: 'ทองแดง', en: 'Copper' },
        3: { th: 'เหล็ก', en: 'Iron' },
        4: { th: 'ทองคำ', en: 'Gold' },
        5: { th: 'เพชร', en: 'Diamond' },
        6: { th: 'น้ำมันดิบสังเคราะห์', en: 'Synthetic Crude Oil' },
        7: { th: 'ไวเบรเนียม', en: 'Vibranium' },
        8: { th: 'แร่ลึกลับ', en: 'Mysterious Ore' },
        9: { th: 'แร่ในตำนาน', en: 'Legendary Ore' }
    } as Record<number, { th: string; en: string }>,
    PRICES: {
        0: 0,
        1: 10, // (10 THB)
        2: 20, // (20 THB)
        3: 32, // (32 THB)
        4: 60, // (60 THB)
        5: 120, // (120 THB)
        6: 300, // (300 THB)
        7: 1500, // (1500 THB)
        8: 0,
        9: 0
    },
    COLORS: {
        0: 'text-stone-500',
        1: 'text-stone-400',
        2: 'text-orange-400',
        3: 'text-blue-300',
        4: 'text-yellow-400',
        5: 'text-cyan-400',
        6: 'text-purple-500',
        7: 'text-emerald-500',
    }
};

export interface LootEntry {
    matTier?: number;
    itemId?: string;
    minAmount: number;
    maxAmount: number;
    chance: number;
}

export const RIG_LOOT_TABLES: Record<number, LootEntry[]> = {
    // All rigs now only drop the Mine Key
    2: [{ itemId: 'chest_key', minAmount: 1, maxAmount: 1, chance: 100 }],
    3: [{ itemId: 'chest_key', minAmount: 1, maxAmount: 1, chance: 100 }],
    4: [{ itemId: 'chest_key', minAmount: 1, maxAmount: 1, chance: 100 }],
    5: [{ itemId: 'chest_key', minAmount: 1, maxAmount: 1, chance: 100 }],
    6: [{ itemId: 'chest_key', minAmount: 1, maxAmount: 1, chance: 100 }],
    7: [{ itemId: 'chest_key', minAmount: 1, maxAmount: 1, chance: 100 }],
    8: [{ itemId: 'chest_key', minAmount: 1, maxAmount: 1, chance: 100 }],
};

// --- NEW ENHANCEMENT SYSTEM ---
export const ENHANCE_RULES: Record<number, { chipAmount: number; matAmount: number; chance: number; multiplier: number; penalty: 'NONE' | 'KEEP' | 'DOWNGRADE' | 'RESET' }> = {
    1: { chipAmount: 1, matAmount: 10, chance: 1.0, multiplier: 0.10, penalty: 'NONE' },
    2: { chipAmount: 1, matAmount: 20, chance: 0.8, multiplier: 0.25, penalty: 'KEEP' },
    3: { chipAmount: 2, matAmount: 40, chance: 0.6, multiplier: 0.50, penalty: 'KEEP' },
    4: { chipAmount: 3, matAmount: 80, chance: 0.4, multiplier: 1.00, penalty: 'DOWNGRADE' },
    5: { chipAmount: 5, matAmount: 150, chance: 0.2, multiplier: 2.50, penalty: 'RESET' },
};

export const EQUIPMENT_PRIMARY_MATERIALS: Record<string, number> = {
    hat: 1,      // Coal
    uniform: 1,  // Coal
    boots: 2,    // Copper
    bag: 2,      // Copper
    glove: 3,    // Iron
    pendant: 4,  // Gold
    ring: 4,     // Gold
    glasses: 3,  // Iron
    mobile: 5,   // Diamond
    pc: 6,       // Crude Oil
    auto_excavator: 7 // Vibranium
};

export const EQUIPMENT_UPGRADE_CONFIG: Record<string, Record<number, { matTier: number; matAmount: number; chipAmount: number; cost: number; chance: number; targetBonus: number; risk: string }>> = {
    hat: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    uniform: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    bag: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    boots: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    glasses: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    mobile: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    pc: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    auto_excavator: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
        5: { matTier: 3, matAmount: 40, chipAmount: 30, cost: 2000, chance: 0.20, targetBonus: 10.0, risk: 'BREAK' },
        6: { matTier: 3, matAmount: 80, chipAmount: 40, cost: 5000, chance: 0.15, targetBonus: 15.0, risk: 'BREAK' },
        7: { matTier: 4, matAmount: 100, chipAmount: 50, cost: 10000, chance: 0.10, targetBonus: 25.0, risk: 'BREAK' },
        8: { matTier: 5, matAmount: 50, chipAmount: 60, cost: 20000, chance: 0.08, targetBonus: 40.0, risk: 'BREAK' },
        9: { matTier: 6, matAmount: 20, chipAmount: 80, cost: 50000, chance: 0.05, targetBonus: 60.0, risk: 'BREAK' },
    },
    glove: {
        1: { matTier: 3, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 3, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 4, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 4, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    pendant: {
        1: { matTier: 4, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 4, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 5, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 5, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    ring: {
        1: { matTier: 4, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 4, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 5, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 5, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    }
};
export const UPGRADE_REQUIREMENTS: Record<number, { matTier: number; matAmount: number; chance: number; label: string; catalyst?: number; chipAmount?: number; maxBonus?: number; cost: number; targetBonus?: number; risk?: string }> = {
    1: { matTier: 1, matAmount: 10, chipAmount: 1, chance: 1.0, label: '+2', cost: 50, targetBonus: 0.5, risk: 'NONE' },
    2: { matTier: 1, matAmount: 20, chipAmount: 5, chance: 0.8, label: '+3', cost: 100, targetBonus: 1.5, risk: 'DROP' },
    3: { matTier: 2, matAmount: 20, chipAmount: 10, chance: 0.5, label: '+4', cost: 300, targetBonus: 3.0, risk: 'DROP' },
    4: { matTier: 2, matAmount: 40, chipAmount: 20, chance: 0.25, label: '+5', cost: 1000, targetBonus: 6.0, risk: 'BREAK' },
    5: { matTier: 3, matAmount: 40, chipAmount: 30, chance: 0.20, label: '+6', cost: 2000, targetBonus: 10.0, risk: 'BREAK' },
    6: { matTier: 3, matAmount: 80, chipAmount: 40, chance: 0.15, label: '+7', cost: 5000, targetBonus: 15.0, risk: 'BREAK' },
    7: { matTier: 4, matAmount: 100, chipAmount: 50, chance: 0.10, label: '+8', cost: 10000, targetBonus: 25.0, risk: 'BREAK' },
    8: { matTier: 5, matAmount: 50, chipAmount: 60, chance: 0.08, label: '+9', cost: 20000, targetBonus: 40.0, risk: 'BREAK' },
    9: { matTier: 6, matAmount: 20, chipAmount: 80, chance: 0.05, label: '+10', cost: 50000, targetBonus: 60.0, risk: 'BREAK' },
};

// สูตรการแปรรูปวัตถุดิบ (Tier ทรัพยากรหลักที่กด -> สูตรและผลลัพธ์)
export const MATERIAL_RECIPES: Record<number, { ingredients: Record<number, number>; fee: number; requiredItem?: string }> = {
    0: { ingredients: { 0: 5 }, fee: 0, requiredItem: 'mixer' }, // เศษหิน x5 + 0 Baht -> ถ่านหิน
    1: { ingredients: { 1: 2 }, fee: 1, requiredItem: 'mixer' }, // ถ่านหิน x2 + 1 Baht -> ทองแดง
    2: { ingredients: { 1: 1, 2: 1 }, fee: 2, requiredItem: 'mixer' }, // ถ่านหิน x1 + ทองแดง x1 + 2 Baht -> เหล็ก
    3: { ingredients: { 2: 1, 3: 1 }, fee: 3, requiredItem: 'mixer' }, // ทองแดง x1 + เหล็ก x1 + 3 Baht -> ทองคำ
    4: { ingredients: { 2: 1, 3: 1, 4: 1 }, fee: 5, requiredItem: 'mixer' }, // ทองแดง x1 + เหล็ก x1 + ทองคำ x1 + 5 Baht -> เพชร
    5: { ingredients: { 4: 1, 5: 1 }, fee: 10, requiredItem: 'mixer' }, // ทองคำ x1 + เพชร x1 + 10 Baht -> น้ำมันดิบ
    6: { ingredients: { 1: 15, 2: 10, 3: 10, 4: 5, 5: 3, 6: 1 }, fee: 50, requiredItem: 'magnifying_glass' }, // Multi-mix -> แร่วาเบรเนียม (50 Baht)
};

export interface RigPreset {
    id: number;
    name: { th: string; en: string };
    price: number;
    dailyProfit: number;
    bonusProfit?: number;
    durationMonths?: number;
    durationDays?: number;
    repairCost: number;
    energyCostPerDay: number;
    craftingRecipe?: { materials?: Record<number, number>; items?: Record<string, number> };
    specialProperties?: {
        infiniteDurability?: boolean;
        zeroEnergy?: boolean;
        maxAllowed?: number;
        noGift?: boolean;
        cannotRenew?: boolean;
        cannotMerge?: boolean;
    };
    image?: string;
    description?: { th: string; en: string };
    type?: string;
    materialChance?: number;
}



export const RIG_PRESETS: RigPreset[] = [
    { id: 1, name: { th: 'พลั่วสนิมเขรอะ', en: 'Starter' }, price: 300, dailyProfit: 10, durationDays: 60, repairCost: 0, energyCostPerDay: 1, specialProperties: { infiniteDurability: false, noGift: true }, type: 'COMMON' },
    { id: 2, name: { th: 'สว่านพกพา', en: 'Common' }, price: 500, dailyProfit: 18.5, durationDays: 60, repairCost: 0, energyCostPerDay: 2, description: { th: 'รับกุญแจเข้าเหมืองทุก 24 ชม.', en: 'Get Mining Key every 24h' }, type: 'UNCOMMON', specialProperties: { infiniteDurability: false } },
    { id: 3, name: { th: 'เครื่องขุดถ่านหิน', en: 'Uncommon' }, price: 1000, dailyProfit: 38.5, durationDays: 90, repairCost: 63, energyCostPerDay: 3, description: { th: 'รับกุญแจเข้าเหมืองทุก 24 ชม.', en: 'Get Mining Key every 24h' }, type: 'RARE' },
    { id: 4, name: { th: 'เครื่องขุดทองแดง', en: 'Rare' }, price: 1500, dailyProfit: 62.5, durationDays: 90, repairCost: 122, energyCostPerDay: 6, description: { th: 'รับกุญแจเข้าเหมืองทุก 24 ชม.', en: 'Get Mining Key every 24h' }, type: 'SUPER_RARE' },
    { id: 5, name: { th: 'เครื่องขุดเหล็ก', en: 'Epic' }, price: 2000, dailyProfit: 85, durationDays: 120, repairCost: 182, energyCostPerDay: 10, type: 'EPIC' },
    { id: 6, name: { th: 'เครื่องขุดทองคำ', en: 'Legendary' }, price: 2500, dailyProfit: 115, durationDays: 120, repairCost: 252, energyCostPerDay: 15, type: 'MYTHIC' },
    { id: 7, name: { th: 'เครื่องขุดเพชร', en: 'Mythical' }, price: 3000, dailyProfit: 150, durationDays: 120, repairCost: 297, energyCostPerDay: 22, type: 'LEGENDARY' },
    {
        id: 8,
        name: { th: 'เครื่องขุดปฏิกรณ์ไวเบรเนียม', en: 'God' },
        price: 0,
        dailyProfit: 400,
        bonusProfit: 0,
        durationDays: 150,
        repairCost: 0,
        energyCostPerDay: 50,
        craftingRecipe: {
            materials: { 7: 1, 8: 2, 9: 3 }
        },
        description: { th: 'รับกุญแจเข้าเหมืองทุก 24 ชม. (แร่วาเบรเนียมได้จากการสกัดเท่านั้น)', en: 'Get Mining Key every 24h (Vibranium from refining only)' },
        specialProperties: { infiniteDurability: false, zeroEnergy: false, maxAllowed: 1 },
        type: 'ULTRA_LEGENDARY'
    },
    {
        id: 9,
        name: { th: 'ถุงมือเน่า', en: 'Rotten Glove' },
        price: 0,
        dailyProfit: 2,
        bonusProfit: 0,
        durationDays: 5,
        repairCost: 0,
        energyCostPerDay: 0,
        description: { th: 'เครื่องขุดเริ่มต้นสำหรับมือใหม่ (ขุดฟรี 5 วัน)', en: 'Starter rig for beginners (Free Mining 5 Days)' },
        specialProperties: { infiniteDurability: false, zeroEnergy: true, noGift: true, cannotMerge: true },
        type: 'COMMON'
    },
];

// === Dynamic Volatility Mining Config ===
// แต่ละ Tier มี baseValue + Random(0~maxRandom) + โอกาส Jackpot (Critical Hit)
// Hashrate เป็นค่าแสดงผล UI เท่านั้น (ตาม Spec ใหม่ Modulo Volatility)
export const MINING_VOLATILITY_CONFIG: Record<number, {
    type: string;
    baseValue: number;
    maxRandom: number;
    jackpotChance: number;
    jackpotMultiplier: number;
    stabilityStars: number;
    stabilityLabel?: string;
    hashrateMin: number;
    hashrateMax: number;
    durabilityMax: number;
    durabilityDecay: number;
    tag?: string;
    tagColor?: 'green' | 'orange' | 'purple' | 'red' | 'gold';
    maxQuantity: number;
}> = {
    1: { type: 'Stable', baseValue: 8, maxRandom: 4, jackpotChance: 0.01, jackpotMultiplier: 1.5, stabilityStars: 4, hashrateMin: 10, hashrateMax: 20, durabilityMax: 3000, durabilityDecay: 428, tag: 'Starter Choice', tagColor: 'green', maxQuantity: 10 },
    2: { type: 'Stable', baseValue: 15, maxRandom: 5, jackpotChance: 0.02, jackpotMultiplier: 1.5, stabilityStars: 4, hashrateMin: 20, hashrateMax: 40, durabilityMax: 3000, durabilityDecay: 428, maxQuantity: 10 },
    3: { type: 'Balanced', baseValue: 25, maxRandom: 15, jackpotChance: 0.03, jackpotMultiplier: 1.5, stabilityStars: 3, hashrateMin: 50, hashrateMax: 80, durabilityMax: 3000, durabilityDecay: 428, tag: 'Best Value', tagColor: 'orange', maxQuantity: 50 },
    4: { type: 'Balanced', baseValue: 40, maxRandom: 20, jackpotChance: 0.04, jackpotMultiplier: 1.5, stabilityStars: 3, hashrateMin: 80, hashrateMax: 120, durabilityMax: 4000, durabilityDecay: 571, tag: 'Popular', tagColor: 'orange', maxQuantity: 50 },
    5: { type: 'Balanced', baseValue: 55, maxRandom: 25, jackpotChance: 0.05, jackpotMultiplier: 1.5, stabilityStars: 3, hashrateMin: 120, hashrateMax: 180, durabilityMax: 5000, durabilityDecay: 714, maxQuantity: 50 },
    6: { type: 'Volatile', baseValue: 65, maxRandom: 45, jackpotChance: 0.06, jackpotMultiplier: 2.0, stabilityStars: 2, stabilityLabel: 'High Variance', hashrateMin: 150, hashrateMax: 250, durabilityMax: 6000, durabilityDecay: 857, tag: 'High Volatility', tagColor: 'purple', maxQuantity: 50 },
    7: { type: 'Volatile', baseValue: 80, maxRandom: 60, jackpotChance: 0.08, jackpotMultiplier: 2.0, stabilityStars: 1, stabilityLabel: 'Extreme Risk', hashrateMin: 200, hashrateMax: 350, durabilityMax: 8000, durabilityDecay: 1142, tag: 'Tycoon Only', tagColor: 'red', maxQuantity: 50 },
    8: { type: 'Chaos', baseValue: 100, maxRandom: 100, jackpotChance: 0.10, jackpotMultiplier: 3.0, stabilityStars: 0, stabilityLabel: 'Danger', hashrateMin: 1000, hashrateMax: 2000, durabilityMax: 12000, durabilityDecay: 1714, tag: 'God Tier', tagColor: 'gold', maxQuantity: 3 },
    9: { type: 'Stable', baseValue: 2, maxRandom: 3, jackpotChance: 0, jackpotMultiplier: 1.0, stabilityStars: 5, hashrateMin: 1, hashrateMax: 5, durabilityMax: 999999, durabilityDecay: 0, tag: 'F2P Starter', tagColor: 'green', maxQuantity: 1 },
};

// === Rig Level Up System ===
export const MAX_RIG_LEVEL = 10;
export const RIG_UPGRADE_RULES: Record<number, {
    materialTier: number; baseCost: number;
    costMultiplier: number; statGrowth: number;
    durabilityBonus: number;
}> = {
    // costMultiplier: 1.3 (Balanced Sweet Spot)
    // Higher tier material = Lower base cost required
    1: { materialTier: 0, baseCost: 20, costMultiplier: 1.3, statGrowth: 1.03, durabilityBonus: 100 },  // Starter → Stone
    2: { materialTier: 0, baseCost: 20, costMultiplier: 1.3, statGrowth: 1.03, durabilityBonus: 100 },  // Drill → Stone
    3: { materialTier: 1, baseCost: 20, costMultiplier: 1.3, statGrowth: 1.03, durabilityBonus: 150 },  // Coal → Coal
    4: { materialTier: 2, baseCost: 18, costMultiplier: 1.3, statGrowth: 1.06, durabilityBonus: 200 },  // Copper → Copper
    5: { materialTier: 3, baseCost: 16, costMultiplier: 1.3, statGrowth: 1.07, durabilityBonus: 300 },  // Iron → Iron
    6: { materialTier: 4, baseCost: 14, costMultiplier: 1.3, statGrowth: 1.08, durabilityBonus: 400 },  // Gold → Gold
    7: { materialTier: 5, baseCost: 12, costMultiplier: 1.3, statGrowth: 1.09, durabilityBonus: 500 },  // Diamond → Diamond
    8: { materialTier: 6, baseCost: 10, costMultiplier: 1.3, statGrowth: 1.10, durabilityBonus: 1000 }, // Reactor → Crude Oil
    9: { materialTier: 0, baseCost: 20, costMultiplier: 1.3, statGrowth: 1.03, durabilityBonus: 100 },  // Free Rig → Stone
};

// === Rig Stats Calculation (Per Rig Level) ===
export const RIG_STATS_CONFIG = {
    minLevel: 1,
    maxLevel: 10,

    // Base Stats (Lv.1)
    baseEnergy: 100,
    baseFee: 10.0,

    // Growth per Level (Linear)
    energyStep: 5,    // +5 per level
    feeStep: 0.5      // -0.5% per level
};

export const SLOT_EXPANSION_CONFIG: Record<number, { title: { th: string; en: string }; cost: number; mats: Record<number, number>; item?: string; itemCount?: number }> = {
    4: { title: { th: 'ขยายพื้นที่ขุดเจาะช่องที่ 4', en: 'Expand Mining Slot 4' }, cost: 0, mats: {}, item: 'slot_blueprint', itemCount: 1 },
    5: { title: { th: 'ขยายพื้นที่ขุดเจาะช่องที่ 5', en: 'Expand Mining Slot 5' }, cost: 0, mats: {}, item: 'slot_blueprint', itemCount: 1 },
    6: { title: { th: 'สร้างแท่นขุดเจาะพิเศษ (Master Wing)', en: 'Establish Special Platform (Master Wing)' }, cost: 0, mats: {}, item: 'slot_blueprint', itemCount: 1 },
    7: { title: { th: 'ขยายพื้นที่ขุดเจาะช่องที่ 7', en: 'Expand Mining Slot 7' }, cost: 0, mats: {}, item: 'slot_blueprint', itemCount: 1 },
    8: { title: { th: 'ขยายพื้นที่ขุดเจาะช่องที่ 8', en: 'Expand Mining Slot 8' }, cost: 0, mats: {}, item: 'slot_blueprint', itemCount: 1 },
    9: { title: { th: 'ขยายพื้นที่ขุดเจาะช่องที่ 9', en: 'Expand Mining Slot 9' }, cost: 0, mats: {}, item: 'slot_blueprint', itemCount: 1 },
    10: { title: { th: 'ขยายพื้นที่ขุดเจาะช่องที่ 10', en: 'Expand Mining Slot 10' }, cost: 0, mats: {}, item: 'slot_blueprint', itemCount: 1 },
};

export const TRANSACTION_LIMITS = {
    DEPOSIT: {
        MIN: 200,
        MAX: 5000,
    },
    DEPOSIT_USD: {
        MIN: 10,
        MAX: 200,
    },
    WITHDRAW: {
        MIN: 100,
        MAX: 1000,
    }
};

export const USDT_WITHDRAW_LIMITS = {
    MIN: 5,
    MAX: 50,
};

export const WITHDRAWAL_FEE_PERCENT = 0.10;

export const LEVEL_CONFIG = {
    baseCost: 50,
    costMultiplier: 1.5,
    yieldBonusPerLevel: 0.01,
    baseIncomePerLevel: 0.5,
    // Stats Logic
    baseEnergy: 100,
    energyPerLevel: 5,        // +5 per level
    baseMarketFee: 10.0,
    feeReductionPerLevel: 0.5, // -0.5% per level
    minMarketFee: 5.0          // Cap at 5%
};


export const STORAGE_KEYS = {
    USERS: 'oil_baron_users',
    RIGS: 'oil_baron_rigs',
    SESSION: 'oil_baron_session',
    TRANSACTIONS: 'oil_baron_transactions',
    CLAIMS: 'oil_baron_claims',
    DEPOSITS: 'oil_baron_deposits',
    WITHDRAWALS: 'oil_baron_withdrawals',
    NOTIFICATIONS: 'oil_baron_notifications',
    SYSTEM_CONFIG: 'oil_baron_system_config',
    MARKET_STATE: 'oil_baron_market_state',
    CHAT: 'gold_rush_chat'
};

export const SALVAGE_CONFIG: Record<string, {
    materials: { tier: number; min: number; max: number; chance?: number }[];
    bonus?: { itemId: string; chance: number; count?: number };
}> = {
    TIER_1: {
        materials: [
            { tier: 1, min: 3, max: 5 }, // Coal
            { tier: 2, min: 1, max: 2 }  // Copper
        ],
        bonus: { itemId: 'repair_kit_1', chance: 0.10 } // 10% Chance for Basic Kit
    },
    TIER_2: {
        materials: [
            { tier: 2, min: 4, max: 6 }, // Copper
            { tier: 3, min: 1, max: 3 }  // Iron
        ],
        bonus: { itemId: 'repair_kit_1', chance: 0.15 } // 15% Chance for Basic Kit
    },
    TIER_3: {
        materials: [
            { tier: 3, min: 5, max: 8 }, // Iron
            { tier: 4, min: 1, max: 2 }  // Gold
        ],
        bonus: { itemId: 'repair_kit_2', chance: 0.10 } // 10% Chance for Standard Kit
    },
    TIER_4: {
        materials: [
            { tier: 4, min: 4, max: 6 }, // Gold
            { tier: 5, min: 0, max: 1, chance: 0.30 } // 30% Chance for Diamond
        ],
        bonus: { itemId: 'repair_kit_2', chance: 0.20, count: 2 } // 20% Chance for 2 Standard Kits
    }
};

export const ENERGY_CONFIG = {
    DRAIN_PER_RIG_PER_HOUR: 4.166, // 100% / 24 Hours
    MAX_ENERGY: 100,
    FUEL_REFILL_COST: 2, // 2 THB for 24 Hours
    COST_PER_UNIT: 0.02, // 0.02 THB per 1% energy refill
    MIN_REFILL_FEE: 2, // Minimum 2 THB fee
    OVERCLOCK_REFILL_COST: 50, // 50 THB for 24 Hours of Boost
    OVERCLOCK_DURATION_HOURS: 24,
    PROFIT_BOOST: 1.0,
    OVERCLOCK_PROFIT_BOOST: 1.5, // 1.5x Yield Booster
    BOX_DROP_SPEED_BOOST: 1.1, // +10%
    KEY_DROP_SPEED_BOOST: 1.05, // +5%
};

export const MARKET_CONFIG = {
    UPDATE_INTERVAL_HOURS: 0.016, // ~1 minute for demo (was 0.5 = 30min)
    MAX_FLUCTUATION: 0.3,
    BOT_INTERVENTION_THRESHOLD: 0.3, // 30% from base price
};

export const ROBOT_CONFIG = {
    ENERGY_THRESHOLD: 50,
    REPAIR_THRESHOLD: 0,
    DUNGEON_REDUCTION: 0.10, // 10% faster
    SAFE_SELL_THRESHOLD: -0.15, // Warn if price drop > 15%
    NOTIFY_PRICE_THRESHOLD: 0.20 // Notify if price surge > 20%
};

export const MAX_ACCESSORIES = 20;
export const MAX_RIGS_PER_USER = 10;
export const MAX_SLOTS_PER_RIG = 5;

export interface ShopItemConfig {
    id: string;
    name: { th: string; en: string };
    price: number;
    icon: string;
    minBonus: number;
    maxBonus: number;
    durationBonus: number;
    lifespanDays: number;
    maxDurability?: number; // HP-based durability (1 day = 100 HP)
    craftingRecipe?: Record<number, number>;
    craftingFee?: number;
    craftDurationMinutes?: number;
    buyable?: boolean;
    specialEffect?: { th: string; en: string };
    description?: { th: string; en: string };
    tier?: number;
    rarity?: string;
    requiredItem?: string;
    buffs?: {
        repairDiscount?: number;
        decayReduction?: number;
        dropRateBoost?: number;
        critChance?: number;
        claimCooldownMultiplier?: number;
        hashrateBoost?: number;
    };
}

export const SHOP_ITEMS: ShopItemConfig[] = [
    { id: 'upgrade_chip', name: { th: 'ชิปอัปเกรด', en: 'Upgrade Chip' }, price: 5, icon: 'Cpu', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, rarity: 'RARE', description: { th: 'ใช้สำหรับอัปเกรดเครื่องจักรเพื่อเพิ่มกำลังการขุด', en: 'Used for upgrading rigs to increase mining power' } },
    { id: 'chest_key', name: { th: 'กุญแจเข้าเหมือง', en: 'Mine Key' }, price: 5, icon: 'Key', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 365, rarity: 'EPIC', description: { th: 'ใช้เปิดถ้ำสำรวจเพื่อลุ้นรับไอเทมหายาก', en: 'Used to open exploration caves for rare items' }, buyable: false },
    { id: 'mixer', name: { th: 'โต๊ะช่างสกัดแร่', en: 'Crafting Table' }, price: 5, icon: 'Factory', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 365, description: { th: 'ใช้สำหรับสกัดแร่ระดับต่ำให้เป็นแร่ระดับสูง', en: 'Used for refining low tier materials' } },
    { id: 'magnifying_glass', name: { th: 'แว่นขยายส่องแร่', en: 'Magnifying Glass' }, price: 5, icon: 'Search', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 365, description: { th: 'ใช้ตรวจสอบหาแร่หายากโดยอัตโนมัติ', en: 'Automatically detects rare minerals' } },
    { id: 'insurance_card', name: { th: 'ใบประกันความเสี่ยง', en: 'Insurance Card' }, price: 300, icon: 'FileText', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 0, description: { th: 'ป้องกันระดับเครื่องจักรลดระดับเมื่ออัปเกรดล้มเหลว', en: 'Prevents rig downgrade upon upgrade failure' }, buyable: true },
    { id: 'vip_withdrawal_card', name: { th: 'บัตร VIP ปลดล็อกถอนเงิน', en: 'VIP Withdrawal Card' }, price: 99, icon: 'CreditCard', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 0, description: { th: 'ใช้สำหรับปลดล็อกการถอนเงินถาวร', en: 'Unlocks permanent withdrawals' } },
    { id: 'ancient_blueprint', name: { th: 'แผนที่ขุดทองโบราณ', en: 'Ancient Blueprint' }, price: 10000, icon: 'FileText', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'ใช้แทนวัสดุหายากในการสร้างแท่นขุดระดับสูง', en: 'Substitute for rare materials in crafting high-tier rigs' }, buyable: false },
    { id: 'hourglass_small', name: { th: 'นาฬิกาทราย (เล็ก)', en: 'Hourglass (Small)' }, price: 5, icon: 'Hourglass', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'เร่งเวลาการสำรวจ 30 นาที', en: 'Speed up exploration by 30 mins' } },
    { id: 'hourglass_medium', name: { th: 'นาฬิกาทราย (กลาง)', en: 'Hourglass (Medium)' }, price: 20, icon: 'Hourglass', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'เร่งเวลาการสำรวจ 2 ชั่วโมง', en: 'Speed up exploration by 2 hours' } },
    { id: 'hourglass_large', name: { th: 'นาฬิกาทราย (ใหญ่)', en: 'Hourglass (Large)' }, price: 60, icon: 'Hourglass', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'เร่งเวลาการสำรวจ 6 ชั่วโมง', en: 'Speed up exploration by 6 hours' } },
    { id: 'time_skip_ticket', name: { th: 'ตั๋วเร่งเวลา', en: 'Time Skip Ticket' }, price: 5, icon: 'Timer', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'ลดเวลาการคราฟต์ 1 ชั่วโมง (กดซ้ำได้)', en: 'Reduce crafting time by 1 hour (stackable)' } },
    {
        id: 'construction_nanobot', name: { th: 'นาโนบอทก่อสร้าง', en: 'Construction Nanobot' }, price: 99, icon: 'Cpu',
        minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 0,
        description: { th: 'สร้างอุปกรณ์เสร็จทันที 100%', en: 'Instantly finish crafting (100%)' }
    },
    {
        id: 'magnifying_glass', name: { th: 'แว่นขยายส่องแร่', en: 'Magnifying Glass' },
        price: 0,
        icon: 'Search',
        minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 0,
        description: { th: 'อุปกรณ์จำเป็นสำหรับการอัปเกรดอุปกรณ์', en: 'Essential tool for equipment upgrades' },
        craftingRecipe: { 2: 2, 8: 5 }, // 2 Copper, 5 Dirt
        craftingFee: 5,
        craftDurationMinutes: 5,
        buyable: false,
    },
    {
        id: 'slot_blueprint',
        name: { th: 'ใบพิมพ์เขียวขยายพื้นที่', en: 'Slot Expansion Blueprint' },
        price: 0,
        icon: 'FileText',
        minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 0,
        description: { th: 'ใช้ขยายพื้นที่โกดังเก็บเครื่องจักร (+1 ช่อง)', en: 'Expand warehouse capacity (+1 Slot)' },
        craftingRecipe: { 1: 1, 2: 1, 3: 1, 4: 1 }, // materials
        requiredItem: 'mixer',
        craftingFee: 100,
        craftDurationMinutes: 10,
        buyable: false,
    },
    { id: 'repair_kit', name: { th: 'ชุดบำรุงรักษาพิเศษ', en: 'Repair Kit' }, price: 50, icon: 'Tool', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'ซ่อมแซมเครื่องจักรจนเต็ม 100%', en: 'Fully repairs a rig to 100%' }, buyable: false },

    {
        id: 'hat', name: { th: 'หมวกนิรภัย', en: 'Safety Helmet' }, price: 80, icon: 'HardHat', minBonus: 1.0, maxBonus: 1.0, durationBonus: 0, lifespanDays: 30, maxDurability: 3000, tier: 1,
        craftingRecipe: { 1: 3, 2: 2 }, craftingFee: 15, craftDurationMinutes: 45, buyable: false, specialEffect: { th: 'ลดค่าซ่อม 3%', en: 'Repair discount 3%' },
        buffs: { repairDiscount: 0.03 }
    },
    {
        id: 'uniform', name: { th: 'ชุดป้องกัน', en: 'Safety Uniform' }, price: 120, icon: 'Shirt', minBonus: 2.0, maxBonus: 2.0, durationBonus: 3, lifespanDays: 30, maxDurability: 3000, tier: 1,
        craftingRecipe: { 1: 4, 2: 3 }, craftingFee: 20, craftDurationMinutes: 60, buyable: false, specialEffect: { th: 'ความเสียหายลดลง 5%', en: 'Decay reduction 5%' },
        buffs: { decayReduction: 0.05 }
    },
    {
        id: 'bag', name: { th: 'เป้สนามอเนกประสงค์', en: 'Utility Backpack' }, price: 200, icon: 'Backpack', minBonus: 0, maxBonus: 0, durationBonus: 5, lifespanDays: 45, maxDurability: 4500, tier: 2,
        craftingRecipe: { 2: 4, 3: 2 }, craftingFee: 30, craftDurationMinutes: 180, buyable: false, specialEffect: { th: 'เพิ่มโอกาสดรอป 5%', en: 'Drop rate boost +5%' },
        buffs: { dropRateBoost: 0.05 }
    },
    {
        id: 'glasses', name: { th: 'แว่นตากันฝุ่น', en: 'Safety Glasses' }, price: 400, icon: 'Glasses', minBonus: 2.0, maxBonus: 2.0, durationBonus: 7, lifespanDays: 30, maxDurability: 3000, tier: 2,
        craftingRecipe: { 4: 3, 3: 4 }, craftingFee: 80, craftDurationMinutes: 420, buyable: false, specialEffect: { th: 'เพิ่มโอกาสขุดติดคริ 1%', en: 'Crit chance +1%' },
        buffs: { critChance: 0.01 }
    },
    {
        id: 'mobile', name: { th: 'สมาทโฟน', en: 'Smartphone' }, price: 450, icon: 'Smartphone', minBonus: 5.0, maxBonus: 5.0, durationBonus: 7, lifespanDays: 60, maxDurability: 6000, tier: 2,
        craftingRecipe: { 5: 1, 4: 4 }, craftingFee: 120, craftDurationMinutes: 540, buyable: false, specialEffect: { th: 'รับเงินเร็วขึ้น 10%', en: 'Claim 10% faster' },
        buffs: { claimCooldownMultiplier: 0.90 }
    },
    {
        id: 'pc', name: { th: 'โน๊ตบุ๊ค', en: 'Notebook' }, price: 500, icon: 'Monitor', minBonus: 10.0, maxBonus: 10.0, durationBonus: 7, lifespanDays: 60, maxDurability: 6000, tier: 3,
        craftingRecipe: { 5: 2, 4: 3 }, craftingFee: 180, craftDurationMinutes: 720, buyable: false, specialEffect: { th: 'กำลังการขุดรวม +3%', en: 'Total hashrate boost +3%' },
        buffs: { hashrateBoost: 1.03 }
    },
    {
        id: 'auto_excavator', name: { th: 'รถไฟฟ้า', en: 'Electric Vehicle' }, price: 650, icon: 'TrainFront', minBonus: 10.0, maxBonus: 15.0, durationBonus: 0, lifespanDays: 120, maxDurability: 12000, tier: 3,
        craftingRecipe: { 6: 1, 5: 2 }, craftingFee: 500, craftDurationMinutes: 1440, buyable: false, specialEffect: { th: 'Jackpot 2%', en: 'Jackpot 2%' }
    }
];

// --- REPAIR KIT DEFINITIONS (HP-based) ---
export const REPAIR_KITS = [
    {
        id: 'repair_kit_1',
        name: { th: 'ชุดซ่อมพื้นฐาน', en: 'Basic Repair Kit' },
        repairTier: 1,
        repairValue: 3000, // +3,000 HP
        targetEquipment: ['uniform', 'hat'],
        craftingRecipe: { 1: 2, 2: 2 } as Record<number, number>, // Coal×2, Copper×2
        craftingFee: 5,
        craftDurationMinutes: 15,
        icon: 'Hammer',
        rarity: 'UNCOMMON',
        category: 'REPAIR_KIT'
    },
    {
        id: 'repair_kit_2',
        name: { th: 'ชุดซ่อมมาตรฐาน', en: 'Standard Repair Kit' },
        repairTier: 2,
        repairValue: 4500, // +4,500 HP
        targetEquipment: ['bag', 'boots'],
        craftingRecipe: { 2: 3, 3: 3 } as Record<number, number>, // Copper×3, Iron×3
        craftingFee: 10,
        craftDurationMinutes: 30,
        icon: 'Briefcase',
        rarity: 'SUPER_RARE',
        category: 'REPAIR_KIT'
    },
    {
        id: 'repair_kit_3',
        name: { th: 'ชุดซ่อมอิเล็กทรอนิกส์', en: 'Electronic Repair Kit' },
        repairTier: 3,
        repairValue: 6000, // +6,000 HP
        targetEquipment: ['glasses', 'mobile'],
        craftingRecipe: { 3: 5, 4: 2 } as Record<number, number>, // Iron×5, Gold×2
        craftingFee: 50,
        craftDurationMinutes: 60,
        icon: 'Cpu',
        rarity: 'LEGENDARY',
        category: 'REPAIR_KIT'
    },
    {
        id: 'repair_kit_4',
        name: { th: 'ชุดซ่อมเครื่องจักรกล', en: 'Mechanic Parts Kit' },
        repairTier: 4,
        repairValue: 9000, // +9,000 HP
        targetEquipment: ['pc', 'auto_excavator'],
        craftingRecipe: { 4: 5, 5: 1, 6: 1 } as Record<number, number>, // Gold×5, Diamond×1, Oil×1
        craftingFee: 200,
        craftDurationMinutes: 120,
        icon: 'Settings',
        rarity: 'MYTHIC',
        category: 'REPAIR_KIT'
    }
];

export const DAILY_CHECKIN_REWARDS = [
    { day: 1, reward: 'money', amount: 10, label: { th: '10 ฿', en: '10 THB' } },
    { day: 2, reward: 'material', tier: 1, amount: 2, label: { th: 'ถ่านหิน x2', en: 'Coal x2' } },
    { day: 3, reward: 'money', amount: 15, label: { th: '15 ฿', en: '15 THB' } },
    { day: 4, reward: 'material', tier: 1, amount: 3, label: { th: 'ถ่านหิน x3', en: 'Coal x3' } },
    { day: 5, reward: 'money', amount: 20, label: { th: '20 ฿', en: '20 THB' } },
    { day: 6, reward: 'item', id: 'chest_key', amount: 1, label: { th: 'กุญแจเข้าเหมือง x1', en: 'Mine Key x1' } },
    { day: 7, reward: 'item', id: 'chest_key', amount: 3, label: { th: 'กุญแจเข้าเหมือง x3', en: 'Mine Key x3' }, highlight: true },
    { day: 8, reward: 'item', id: 'upgrade_chip', amount: 2, label: { th: 'ชิปอัปเกรด x2', en: 'Upgrade Chip x2' } },
    { day: 9, reward: 'item', id: 'chest_key', amount: 2, label: { th: 'กุญแจเข้าเหมือง x2', en: 'Mine Key x2' } },
    { day: 10, reward: 'item', id: 'time_skip_ticket', amount: 2, label: { th: 'ตั๋วเร่งเวลา x2', en: 'Time Skip Ticket x2' } },
    { day: 11, reward: 'item', id: 'magnifying_glass', amount: 2, label: { th: 'แว่นขยาย x2', en: 'Magnifying Glass x2' } },
    { day: 12, reward: 'item', id: 'hourglass_small', amount: 2, label: { th: 'นาฬิกาทราย (เล็ก) x2', en: 'Hourglass (S) x2' } },
    { day: 13, reward: 'item', id: 'mixer', amount: 2, label: { th: 'โต๊ะช่าง x2', en: 'Crafting Table x2' } },
    { day: 14, reward: 'item', id: 'upgrade_chip', amount: 3, label: { th: 'ชิปอัปเกรด x3', en: 'Upgrade Chip x3' }, highlight: true },
    { day: 15, reward: 'item', id: 'chest_key', amount: 3, label: { th: 'กุญแจเข้าเหมือง x3', en: 'Mine Key x3' } },
    { day: 16, reward: 'item', id: 'time_skip_ticket', amount: 3, label: { th: 'ตั๋วเร่งเวลา x3', en: 'Time Skip Ticket x3' } },
    { day: 17, reward: 'item', id: 'magnifying_glass', amount: 3, label: { th: 'แว่นขยาย x3', en: 'Magnifying Glass x3' } },
    { day: 18, reward: 'item', id: 'hourglass_small', amount: 3, label: { th: 'นาฬิกาทราย (เล็ก) x3', en: 'Hourglass (S) x3' } },
    { day: 19, reward: 'item', id: 'mixer', amount: 3, label: { th: 'โต๊ะช่าง x3', en: 'Crafting Table x3' } },
    { day: 20, reward: 'item', id: 'upgrade_chip', amount: 3, label: { th: 'ชิปอัปเกรด x3', en: 'Upgrade Chip x3' } },
    { day: 21, reward: 'item', id: 'chest_key', amount: 3, label: { th: 'กุญแจเข้าเหมือง x3', en: 'Mine Key x3' }, highlight: true },
    { day: 22, reward: 'item', id: 'time_skip_ticket', amount: 3, label: { th: 'ตั๋วเร่งเวลา x3', en: 'Time Skip Ticket x3' } },
    { day: 23, reward: 'item', id: 'magnifying_glass', amount: 3, label: { th: 'แว่นขยาย x3', en: 'Magnifying Glass x3' } },
    { day: 24, reward: 'item', id: 'hourglass_small', amount: 3, label: { th: 'นาฬิกาทราย (เล็ก) x3', en: 'Hourglass (S) x3' } },
    { day: 25, reward: 'item', id: 'mixer', amount: 3, label: { th: 'โต๊ะช่าง x3', en: 'Crafting Table x3' } },
    { day: 26, reward: 'item', id: 'upgrade_chip', amount: 3, label: { th: 'ชิปอัปเกรด x3', en: 'Upgrade Chip x3' } },
    { day: 27, reward: 'item', id: 'chest_key', amount: 3, label: { th: 'กุญแจเข้าเหมือง x3', en: 'Mine Key x3' } },
    { day: 28, reward: 'item', id: 'time_skip_ticket', amount: 3, label: { th: 'ตั๋วเร่งเวลา x3', en: 'Time Skip Ticket x3' }, highlight: true },
    { day: 29, reward: 'item', id: 'magnifying_glass', amount: 3, label: { th: 'แว่นขยาย x3', en: 'Magnifying Glass x3' } },
    { day: 30, reward: 'material', tier: 5, amount: 1, label: { th: 'เพชร x1', en: 'Diamond x1' }, highlight: true, special: true },
];

export const VIP_TIERS = [
    { level: 0, minExp: 0, perk: { th: 'สมาชิกทั่วไป', en: 'Regular Member' }, bonusDrop: 0 },
    { level: 1, minExp: 1000, perk: { th: 'เพิ่มอัตราดรอป 5%', en: 'Drop Rate +5%' }, bonusDrop: 0.05 },
    { level: 2, minExp: 5000, perk: { th: 'เพิ่มอัตราดรอป 10%', en: 'Drop Rate +10%' }, bonusDrop: 0.10 },
    { level: 3, minExp: 20000, perk: { th: 'เพิ่มอัตราดรอป 15% + ส่วนลดร้านค้า 5%', en: 'Drop Rate +15%, Shop Discount 5%' }, bonusDrop: 0.15 },
    { level: 4, minExp: 50000, perk: { th: 'เพิ่มอัตราดรอป 20% + ส่วนลดร้านค้า 10%', en: 'Drop Rate +20%, Shop Discount 10%' }, bonusDrop: 0.20 },
    { level: 5, minExp: 100000, perk: { th: 'King of Dormitory (มาสเตอร์อาคาร: ดรอป +30%, ร้านค้า -15%)', en: 'King of Dormitory (Master: Drop +30%, Shop -15%)' }, bonusDrop: 0.30 },
];

export const QUESTS = [
    { id: 'q1', type: 'materials_crafted', target: 20, rewardType: 'points', rewardAmount: 20, title: { th: 'นักสกัดแร่', en: 'Mineral Refiner' }, desc: { th: 'สกัดวัสดุสำเร็จ 20 ครั้ง', en: 'Successfully refine 20 materials' } },
    { id: 'q2', type: 'spend', target: 5000, rewardType: 'points', rewardAmount: 30, title: { th: 'นักลงทุนเหมือง', en: 'Mine Investor' }, desc: { th: 'ใช้จ่าย 5000 ฿', en: 'Spend 5000 THB' } },
    { id: 'q3', type: 'dungeon', target: 30, rewardType: 'points', rewardAmount: 50, title: { th: 'นักสำรวจยอดเยี่ยม', en: 'Top Explorer' }, desc: { th: 'สำรวจแหล่งแร่ 30 รอบ', en: 'Complete 30 expeditions' } },
    { id: 'q4', type: 'items_crafted', target: 20, rewardType: 'points', rewardAmount: 40, title: { th: 'ช่างประกอบหัวเจาะ', en: 'Drill Assembler' }, desc: { th: 'ประกอบหัวเจาะ 20 ชิ้น', en: 'Assemble 20 drills' } },
    { id: 'q5', type: 'repair', target: 100, rewardType: 'points', rewardAmount: 20, title: { th: 'ผู้ดูแลเครื่องจักร', en: 'Machine Maintainer' }, desc: { th: 'ซ่อมบำรุงหัวเจาะครบ 100%', en: 'Reach 100% repair status' } },
    { id: 'q6', type: 'rare_loot', target: 1, rewardType: 'points', rewardAmount: 60, title: { th: 'ดวงมหาเฮง', en: 'Super Lucky' }, desc: { th: 'ค้นพบแร่หายาก', en: 'Find a rare mineral' } },
];

export const MINING_RANKS = [
    { id: 'bronze', label: { th: 'นักขุดระดับบรอนซ์', en: 'Bronze Miner' }, points: 100, rewardId: 'chest_key', amount: 5, buff: '', desc: { th: 'รับกุญแจเข้าเหมือง x5', en: 'Get Mine Key x5' } },
    { id: 'silver', label: { th: 'นักขุดระดับซิลเวอร์', en: 'Silver Miner' }, points: 300, rewardId: null, amount: 0, buff: { th: 'ค่าซ่อมบำรุง -5%', en: 'Repair Cost -5%' }, desc: { th: 'ลดค่าซ่อมบำรุงเครื่องจักร 5% (30 วัน)', en: 'Reduce repair cost 5% (30 days)' } },
    { id: 'gold', label: { th: 'นักขุดระดับโกลด์', en: 'Gold Miner' }, points: 600, rewardId: 'chest_key', amount: 3, buff: '', desc: { th: 'กุญแจเข้าเหมือง x3', en: 'Mine Key x3' } },
    { id: 'platinum', label: { th: 'นักขุดระดับแพลตตินัม', en: 'Platinum Miner' }, points: 1000, rewardId: null, amount: 0, buff: { th: 'ภาษีตลาด 3%', en: 'Market Tax 3%' }, desc: { th: 'ลดภาษีขายแร่ 3% (30 วัน)', en: 'Reduce sell tax 3% (30 days)' } },
    { id: 'diamond', label: { th: 'นักขุดระดับแชมป์', en: 'Champion Miner' }, points: 1500, rewardId: null, amount: 0, buff: { th: 'Craft Great Success +5%', en: 'Craft Great Success +5%' }, desc: { th: 'เพิ่มโอกาสสกัดแร่สำเร็จ +5% (30 วัน)', en: 'Increase craft success +5% (30 days)' } },
];

export const ACHIEVEMENTS = [
    { id: 'a1', type: 'materials_crafted', target: 50, points: 50, title: { th: 'ช่างฝีมือ', en: 'Craftsman' }, desc: { th: 'แปรรูปวัสดุสำเร็จ 50 ครั้ง', en: 'Refine 50 materials' } },
    { id: 'a2', type: 'vip', target: 10000, points: 100, title: { th: 'VIP Member', en: 'VIP Member' }, desc: { th: 'สะสมยอดใช้จ่ายครบ 10000 ฿', en: 'Total spend 10000 THB' } },
];

export const LUCKY_DRAW_CONFIG = {
    COST: 10,
    FREE_COOLDOWN_MS: 24 * 60 * 60 * 1000,
    PROBABILITIES: [
        { type: 'money', amount: 500, chance: 0.1, label: { th: 'JACKPOT! 500 ฿', en: 'JACKPOT! 500 THB' } },
        { type: 'money', amount: 100, chance: 1.0, label: { th: 'เงินรางวัล 100 ฿', en: '100 THB Reward' } },
        { type: 'money', amount: 20, chance: 5.0, label: { th: 'เงินรางวัล 20 ฿', en: '20 THB Reward' } },
        { type: 'item', id: 'chest_key', amount: 1, chance: 2.0, label: { th: 'กุญแจเข้าเหมือง x1', en: 'Mine Key x1' } },
        { type: 'item', id: 'hourglass_medium', amount: 1, chance: 8.0, label: { th: 'เร่งเวลา 2 ชั่วโมง', en: '2 Hours Time Skip' } },
        { type: 'item', id: 'mixer', amount: 1, chance: 30.0, label: { th: 'โต๊ะช่างสกัดแร่', en: 'Crafting Table' } },
        { type: 'material', tier: 0, amount: 4, chance: 20.0, label: { th: 'เศษหิน x4', en: 'Stone Shard x4' } },
        { type: 'money', amount: 5, chance: 33.9, label: { th: 'รางวัลปลอบใจ 5 ฿', en: '5 THB Consolation' } },
    ]
};

export interface DungeonLevel {
    id: number;
    name: { th: string; en: string };
    description: { th: string; en: string };
    cost: number;
    keyCost?: number;
    durationHours: number;
    probabilities?: { common: number; salt: number; rare: number }; // Custom drop rates
    dropMode?: 'PICK_ONE' | 'ALL'; // 'ALL' = Drop everything in the tier (for common/salt)
    dropRules?: { common?: 'PICK_ONE' | 'ALL'; salt?: 'PICK_ONE' | 'ALL'; rare?: 'PICK_ONE' | 'ALL' };
    rewards: {
        common: { tier: number; amount?: number; minAmount?: number; maxAmount?: number; chance: number }[];
        salt: { tier: number; amount?: number; minAmount?: number; maxAmount?: number; chance: number }[];
        rare: { itemId?: string; tier?: number; amount?: number; minAmount?: number; maxAmount?: number; chance: number }[];
    }
}

export const DUNGEON_CONFIG: DungeonLevel[] = [
    {
        id: 1,
        name: { th: 'หุบเขาเหมืองร้าง (The Abandoned Canyon)', en: 'The Abandoned Canyon' },
        description: { th: 'ค้นหาเศษแร่ที่หลงเหลือในเหมืองร้าง', en: 'Search for leftover ore fragments in the abandoned mine.' },
        cost: 100,
        keyCost: 10,
        durationHours: 2,
        probabilities: { common: 80, salt: 15, rare: 5 },
        dropMode: 'PICK_ONE',
        dropRules: { common: 'PICK_ONE', salt: 'PICK_ONE', rare: 'PICK_ONE' },
        rewards: {
            common: [
                { tier: 1, minAmount: 8, maxAmount: 15, chance: 100 }, // ถ่านหิน (Coal) 8-15
                { tier: 2, minAmount: 3, maxAmount: 8, chance: 100 }   // ทองแดง (Copper) 3-8
            ],
            salt: [
                { tier: 0, minAmount: 30, maxAmount: 30, chance: 100 } // เศษหิน (Stone Shards) x30 (Salt)
            ],
            rare: [
                { itemId: 'hourglass_medium', amount: 1, chance: 100 } // Jackpot: Hourglass Medium
            ]
        }
    },
    {
        id: 2,
        name: { th: 'นครทองคำที่สาบสูญ (Lost City of Gold)', en: 'Lost City of Gold' },
        description: { th: 'ปฏิบัติการเจาะทะลุชั้นหินแข็ง เพื่อค้นหาทรัพยากรล้ำค่าที่ซ่อนอยู่', en: 'Drilling through hard rock layers to find hidden precious resources.' },
        cost: 300,
        durationHours: 6,
        probabilities: { common: 80, salt: 15, rare: 5 },
        dropRules: { common: 'PICK_ONE', salt: 'PICK_ONE', rare: 'PICK_ONE' },
        rewards: {
            common: [
                { tier: 3, minAmount: 10, maxAmount: 15, chance: 100 }, // เหล็ก x10-15
                { tier: 4, minAmount: 5, maxAmount: 7, chance: 100 }   // ทองคำ x5-7
            ],
            salt: [
                { tier: 2, minAmount: 10, maxAmount: 15, chance: 100 } // ทองแดง x10-15
            ],
            rare: [
                { itemId: 'construction_nanobot', amount: 1, chance: 50 },
                { itemId: 'hourglass_large', amount: 3, chance: 50 }
            ]
        }
    },
    {
        id: 3,
        name: { th: 'เหมืองผลึกคริสตัล (Crystal Caverns)', en: 'Crystal Caverns' },
        description: { th: 'เดินทางสู่ดินแดนต้องห้าม ที่เล่าขานว่ามีขุมทรัพย์ระดับตำนานหลับใหลอยู่', en: 'Journey to forbidden lands where legendary treasures are said to lie.' },
        cost: 1000,
        durationHours: 12,
        probabilities: { common: 80, salt: 15, rare: 5 },
        dropRules: { common: 'PICK_ONE', salt: 'PICK_ONE', rare: 'PICK_ONE' },
        rewards: {
            common: [
                { tier: 5, minAmount: 7, maxAmount: 12, chance: 100 }, // เพชร 7-12
                { tier: 6, minAmount: 3, maxAmount: 5, chance: 100 }   // น้ำมันดิบ 3-5
            ],
            salt: [
                { tier: 4, minAmount: 10, maxAmount: 15, chance: 100 } // ทองคำ 10-15
            ],
            rare: [
                { tier: 9, amount: 1, chance: 33 }, // แร่ในตำนาน
                { tier: 8, amount: 1, chance: 33 }, // แร่ลึกลับ
                { tier: 7, amount: 1, chance: 33 } // ไวเบรเนียม
            ]
        }
    }
];

