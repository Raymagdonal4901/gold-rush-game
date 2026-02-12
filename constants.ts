export const CURRENCY = '฿';
export const EXCHANGE_RATE_USD_THB = 1;
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
        title: { th: "Power Supply", en: "Power Supply" },
        desc: { th: "แหล่งจ่ายไฟ & ความเสถียร", en: "Power Supply & Stability" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'แหล่งจ่ายไฟ 500W Standard', en: 'Power Supply 500W Standard' }, stat: { th: 'ค่าซ่อม -5%', en: 'Repair Cost -5%' } },
            { rarity: 'RARE', name: { th: 'แหล่งจ่ายไฟ 750W Gold', en: 'Power Supply 750W Gold' }, stat: { th: 'ค่าซ่อม -10%', en: 'Repair Cost -10%' } },
            { rarity: 'EPIC', name: { th: 'แหล่งจ่ายไฟ 1000W Platinum', en: 'Power Supply 1000W Platinum' }, stat: { th: 'ค่าซ่อม -15%', en: 'Repair Cost -15%' } },
            { rarity: 'LEGENDARY', name: { th: 'แหล่งจ่ายไฟ 1600W Titanium', en: 'Power Supply 1600W Titanium' }, stat: { th: 'ค่าซ่อม -20%', en: 'Repair Cost -20%' } },
        ]
    },
    uniform: {
        title: { th: "ระบบระบายความร้อน", en: "Cooling System" },
        desc: { th: "อุณหภูมิ & อายุการใช้งาน", en: "Temperature & Lifespan" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'พัดลมเคส 120mm', en: '120mm Case Fan' }, stat: { th: 'สัญญา +5 วัน', en: 'Contract +5 Days' } },
            { rarity: 'RARE', name: { th: 'ฮีรตซิงค์ระบายความร้อน', en: 'Heat Sink' }, stat: { th: 'สัญญา +10 วัน', en: 'Contract +10 Days' } },
            { rarity: 'EPIC', name: { th: 'ชุดน้ำปิด (AIO Water Cool)', en: 'AIO Water Cooling' }, stat: { th: 'สัญญา +20 วัน', en: 'Contract +20 Days' } },
            { rarity: 'LEGENDARY', name: { th: 'ห้องเย็น (Immersion Cooling)', en: 'Immersion Cooling' }, stat: { th: 'สัญญา +30 วัน', en: 'Contract +30 Days' } },
        ]
    },
    bag: {
        title: { th: "Hardware Wallet", en: "Hardware Wallet" },
        desc: { th: "ความปลอดภัย & มูลค่า", en: "Security & Value" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'Paper Wallet', en: 'Paper Wallet' }, stat: { th: 'ราคาขาย +1%', en: 'Sell Price +1%' } },
            { rarity: 'RARE', name: { th: 'USB Wallet', en: 'USB Wallet' }, stat: { th: 'ราคาขาย +2%', en: 'Sell Price +2%' } },
            { rarity: 'EPIC', name: { th: 'Crypto Steel', en: 'Crypto Steel' }, stat: { th: 'ราคาขาย +3%', en: 'Sell Price +3%' } },
            { rarity: 'LEGENDARY', name: { th: 'Cold Storage Vault', en: 'Cold Storage Vault' }, stat: { th: 'ราคาขาย +5%', en: 'Sell Price +5%' } },
        ]
    },
    boots: {
        title: { th: "สายไฟ & การเชื่อมต่อ", en: "Power Cables & Connectivity" },
        desc: { th: "ความเสถียร & ประหยัดไฟ", en: "Stability & Energy Saving" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'สายไฟมาตรฐาน', en: 'Standard Power Cable' }, stat: { th: 'ประหยัดค่าไฟ 5%', en: 'Save Energy 5%' } },
            { rarity: 'RARE', name: { th: 'สายถักทนความร้อน', en: 'Heat-Resistant Braided Cable' }, stat: { th: 'ประหยัดค่าไฟ 10%', en: 'Save Energy 10%' } },
            { rarity: 'EPIC', name: { th: 'รางไฟอุตสาหกรรม', en: 'Industrial Power Strip' }, stat: { th: 'ประหยัดค่าไฟ 20%', en: 'Save Energy 20%' } },
            { rarity: 'LEGENDARY', name: { th: 'ระบบเดินไฟอัจฉริยะ', en: 'Smart Power System' }, stat: { th: 'ประหยัดค่าไฟ 30%', en: 'Save Energy 30%' } },
        ]
    },
    mobile: {
        title: { th: "Network Connection", en: "Network Connection" },
        desc: { th: "การเชื่อมต่อ & ความเร็ว", en: "Connectivity & Speed" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'LAN Cable Cat5e', en: 'LAN Cable Cat5e' }, stat: { th: 'ลดค่าใช้จ่าย 2%', en: 'Reduce Expenses 2%' } },
            { rarity: 'RARE', name: { th: 'WiFi 6 Router', en: 'WiFi 6 Router' }, stat: { th: 'ลดค่าใช้จ่าย 5%', en: 'Reduce Expenses 5%' } },
            { rarity: 'EPIC', name: { th: 'Fiber Optic', en: 'Fiber Optic' }, stat: { th: 'ลดค่าใช้จ่าย 8%', en: 'Reduce Expenses 8%' } },
            { rarity: 'LEGENDARY', name: { th: 'Satellite Link (Starlink)', en: 'Satellite Link (Starlink)' }, stat: { th: 'ลดค่าใช้จ่าย 12%', en: 'Reduce Expenses 12%' } },
        ]
    },
    pc: {
        title: { th: "Control Board", en: "Control Board" },
        desc: { th: "ควบคุม & ประมวลผล", en: "Control & Processing" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'Raspberry Pi', en: 'Raspberry Pi' }, stat: { th: 'โอกาสโบนัส 1%', en: 'Bonus Chance 1%' } },
            { rarity: 'RARE', name: { th: 'Mainboard BTC', en: 'Mainboard BTC' }, stat: { th: 'โอกาสโบนัส 2%', en: 'Bonus Chance 2%' } },
            { rarity: 'EPIC', name: { th: 'Industrial Controller', en: 'Industrial Controller' }, stat: { th: 'โอกาสโบนัส 4%', en: 'Bonus Chance 4%' } },
            { rarity: 'LEGENDARY', name: { th: 'Quantum Controller', en: 'Quantum Controller' }, stat: { th: 'โอกาสโบนัส 6%', en: 'Bonus Chance 6%' } },
        ]
    },
    glasses: {
        title: { th: "Mining Firmware", en: "Mining Firmware" },
        desc: { th: "ซอฟต์แวร์ & ประสิทธิภาพ", en: "Software & Performance" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'Stock Firmware', en: 'Stock Firmware' }, stat: { th: 'โบนัส +2%', en: 'Bonus +2%' } },
            { rarity: 'RARE', name: { th: 'Overclock BIOS', en: 'Overclock BIOS' }, stat: { th: 'โบนัส +5%', en: 'Bonus +5%' } },
            { rarity: 'EPIC', name: { th: 'Custom Modded OS', en: 'Custom Modded OS' }, stat: { th: 'โบนัส +8%', en: 'Bonus +8%' } },
            { rarity: 'LEGENDARY', name: { th: 'AI Optimized Kernel', en: 'AI Optimized Kernel' }, stat: { th: 'โบนัส +12%', en: 'Bonus +12%' } },
        ]
    },
    auto_excavator: {
        title: { th: "Rig Frame", en: "Rig Frame" },
        desc: { th: "โครงสร้าง & ความจุ", en: "Structure & Capacity" },
        tiers: [
            { rarity: 'COMMON', name: { th: 'โครงเหล็ก (Steel Frame)', en: 'Steel Frame' }, stat: { th: 'Jackpot 2%', en: 'Jackpot 2%' } },
            { rarity: 'RARE', name: { th: 'เคสอลูมิเนียม (Alu Case)', en: 'Aluminum Case' }, stat: { th: 'Jackpot 5%', en: 'Jackpot 5%' } },
            { rarity: 'EPIC', name: { th: 'ตู้ Rack Server', en: 'Server Rack' }, stat: { th: 'Jackpot 8%', en: 'Jackpot 8%' } },
            { rarity: 'LEGENDARY', name: { th: 'ตู้คอนเทนเนอร์ (Container)', en: 'Mining Container' }, stat: { th: 'Jackpot 12%', en: 'Jackpot 12%' } },
        ]
    }
};

export const GLOVE_DETAILS: Record<string, { name: { th: string; en: string } }> = {
    COMMON: { name: { th: 'พนักงานทั่วไป (STAFF)', en: 'Staff (STAFF)' } },
    RARE: { name: { th: 'หัวหน้างาน (SUPERVISOR)', en: 'Supervisor (SUPERVISOR)' } },
    SUPER_RARE: { name: { th: 'ผู้จัดการหอพัก (MANAGER)', en: 'Manager (MANAGER)' } },
    EPIC: { name: { th: 'ผู้บริหารอาคาร (EXECUTIVE)', en: 'Executive (EXECUTIVE)' } },
    LEGENDARY: { name: { th: 'หุ้นส่วนใหญ่ (PARTNER)', en: 'Partner (PARTNER)' } },
};

export const GIFT_CYCLE_DAYS = 1;

export const RENEWAL_CONFIG = {
    WINDOW_DAYS: 3,
    MAX_RENEWALS: 2,
    DISCOUNT_PERCENT: 0.05,
};

export const REPAIR_CONFIG = {
    DURABILITY_DAYS: 15,
    COST_DIVISOR: 5,
};


export const UPGRADE_CONFIG = {
    CHIP_COST: 0.05,
    HIGH_LEVEL_THRESHOLD: 6,
    HIGH_RIG_PRICE_REQ: 60,
};

export const MATERIAL_CONFIG = {
    MAX_CAPACITY: 1,
    DROP_CHANCE: 1.0, // Guaranteed drop when interval hits
    DROP_INTERVAL_MS: 86400000, // 24 Hours (24 * 60 * 60 * 1000)
    NAMES: {
        0: { th: 'เศษหิน', en: 'Stone Shards' },
        1: { th: 'ถ่านหิน', en: 'Coal' },
        2: { th: 'ทองแดง', en: 'Copper' },
        3: { th: 'เหล็ก', en: 'Iron' },
        4: { th: 'ทองคำ', en: 'Gold' },
        5: { th: 'เพชร', en: 'Diamond' },
        6: { th: 'น้ำมันดิบ', en: 'Crude Oil' },
        7: { th: 'แร่วาเบรเนียม', en: 'Vibranium' },
        8: { th: 'แร่ลึกลับ', en: 'Mysterious Ore' },
        9: { th: 'แร่ในตำนาน', en: 'Legendary Ore' },
    },
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

export const EQUIPMENT_UPGRADE_CONFIG: Record<string, Record<number, { matTier: number; matAmount: number; chance: number; chipAmount: number; cost: number; targetBonus: number; risk: string }>> = {
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
    },
    glove: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 50, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 100, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 300, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 1000, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    }
};
export const UPGRADE_REQUIREMENTS: Record<number, { matTier: number; matAmount: number; chance: number; label: string; catalyst?: number; chipAmount?: number; maxBonus?: number; cost: number; targetBonus?: number; risk?: string }> = {
    1: { matTier: 1, matAmount: 10, chipAmount: 1, chance: 1.0, label: '+2', cost: 50, targetBonus: 0.5, risk: 'NONE' },
    2: { matTier: 1, matAmount: 20, chipAmount: 5, chance: 0.8, label: '+3', cost: 100, targetBonus: 1.5, risk: 'DROP' },
    3: { matTier: 2, matAmount: 20, chipAmount: 10, chance: 0.5, label: '+4', cost: 300, targetBonus: 3.0, risk: 'DROP' },
    4: { matTier: 2, matAmount: 40, chipAmount: 20, chance: 0.25, label: '+5', cost: 1000, targetBonus: 6.0, risk: 'BREAK' },
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
    };
    image?: string;
    description?: { th: string; en: string };
    type?: string;
    materialChance?: number;
}

export const RIG_PRESETS: RigPreset[] = [
    { id: 1, name: { th: 'พลั่วสนิมเขรอะ', en: 'Rusty Shovel' }, price: 300, dailyProfit: 50, bonusProfit: 30, durationDays: 7, repairCost: 0, energyCostPerDay: 1, specialProperties: { infiniteDurability: false, noGift: true } },
    { id: 2, name: { th: 'สว่านพกพา', en: 'Portable Drill' }, price: 500, dailyProfit: 40, bonusProfit: 70, durationDays: 15, repairCost: 0, energyCostPerDay: 2, image: '/images/rooms/fan_room.png', description: { th: 'รับกุญแจเข้าเหมืองทุก 24 ชม.', en: 'Get Mining Key every 24h' }, type: 'UNCOMMON', specialProperties: { infiniteDurability: false } },
    { id: 3, name: { th: 'เครื่องขุดถ่านหิน', en: 'Coal Excavator' }, price: 1000, dailyProfit: 45, durationMonths: 1, repairCost: 63, energyCostPerDay: 3, description: { th: 'รับกุญแจเข้าเหมืองทุก 24 ชม.', en: 'Get Mining Key every 24h' } },
    { id: 4, name: { th: 'เครื่องขุดทองแดง', en: 'Copper Excavator' }, price: 1500, dailyProfit: 56, durationMonths: 2, repairCost: 122, energyCostPerDay: 6, image: '/images/rooms/aircon_deluxe.png', description: { th: 'รับกุญแจเข้าเหมืองทุก 24 ชม.', en: 'Get Mining Key every 24h' }, type: 'SUPER_RARE' },
    { id: 5, name: { th: 'เครื่องขุดเหล็ก', en: 'Iron Excavator' }, price: 2000, dailyProfit: 66, durationMonths: 3, repairCost: 182, energyCostPerDay: 10, type: 'EPIC' },
    { id: 6, name: { th: 'เครื่องขุดทองคำ', en: 'Gold Excavator' }, price: 2500, dailyProfit: 73, durationMonths: 4, repairCost: 252, energyCostPerDay: 15, type: 'MYTHIC' },
    { id: 7, name: { th: 'เครื่องขุดเพชร', en: 'Diamond Excavator' }, price: 3000, dailyProfit: 87, durationMonths: 5, repairCost: 297, energyCostPerDay: 22, type: 'LEGENDARY' },
    {
        id: 8,
        name: { th: 'เครื่องขุดปฏิกรณ์ไวเบรเนียม', en: 'Vibranium Reactor' },
        price: 0,
        dailyProfit: 100,
        bonusProfit: 0,
        durationMonths: 12,
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
        dailyProfit: 20,
        bonusProfit: 0,
        durationDays: 3,
        repairCost: 0, // Free repair
        energyCostPerDay: 1,
        specialProperties: { infiniteDurability: false, noGift: true, maxAllowed: 1, cannotRenew: true },
        description: { th: 'ถุงมือเก่าๆ สำหรับผู้เริ่มต้น (จำกัด 1 ชิ้น/ไอดี)', en: 'Old glove for beginners (Limit 1/ID)' },
        type: 'COMMON'
    }
];

export const SLOT_EXPANSION_CONFIG: Record<number, { title: { th: string; en: string }; cost: number; mats: Record<number, number>; item?: string; itemCount?: number }> = {
    4: { title: { th: 'ขยายพื้นที่ขุดเจาะช่องที่ 4', en: 'Expand Mining Slot 4' }, cost: 2000, mats: { 3: 30, 4: 10 }, item: 'chest_key', itemCount: 1 },
    5: { title: { th: 'ขยายพื้นที่ขุดเจาะช่องที่ 5', en: 'Expand Mining Slot 5' }, cost: 3000, mats: { 5: 10, 6: 5 }, item: 'upgrade_chip', itemCount: 5 },
    6: { title: { th: 'สร้างแท่นขุดเจาะพิเศษ (Master Wing)', en: 'Establish Special Platform (Master Wing)' }, cost: 5000, mats: { 7: 1, 8: 1, 9: 1 }, item: undefined, itemCount: 0 },
};

export const TRANSACTION_LIMITS = {
    DEPOSIT: {
        MIN: 3,
        MAX: 1000,
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

export const ENERGY_CONFIG = {
    DRAIN_PER_RIG_PER_HOUR: 4.166, // 100% / 24 Hours
    MAX_ENERGY: 100,
    FUEL_REFILL_COST: 2, // 2 THB for 24 Hours
    COST_PER_UNIT: 0.02, // 0.02 THB per 1% energy refill
    MIN_REFILL_FEE: 2, // Minimum 2 THB fee
    OVERCLOCK_REFILL_COST: 50, // 50 THB for 48 Hours of x2 Power
    OVERCLOCK_DURATION_HOURS: 48,
    PROFIT_BOOST: 1.0, // Base boost when powered (not used if Overclock x2 is active)
    OVERCLOCK_PROFIT_BOOST: 2.0, // x2 Speed Booster
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
export const MAX_RIGS_PER_USER = 6;
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
    craftingRecipe?: Record<number, number>;
    craftingFee?: number;
    craftDurationMinutes?: number;
    buyable?: boolean;
    specialEffect?: { th: string; en: string };
    description?: { th: string; en: string };
    tier?: number;
}

export const SHOP_ITEMS: ShopItemConfig[] = [
    { id: 'upgrade_chip', name: { th: 'ชิปอัปเกรด', en: 'Upgrade Chip' }, price: 5, icon: 'Cpu', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'ใช้สำหรับอัปเกรดเครื่องจักรเพื่อเพิ่มกำลังการขุด', en: 'Used for upgrading rigs to increase mining power' } },
    { id: 'chest_key', name: { th: 'กุญแจเข้าเหมือง', en: 'Mine Key' }, price: 5, icon: 'Key', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 365, description: { th: 'ใช้เปิดถ้ำสำรวจเพื่อลุ้นรับไอเทมหายาก', en: 'Used to open exploration caves for rare items' }, buyable: false },
    { id: 'mixer', name: { th: 'โต๊ะช่างสกัดแร่', en: 'Crafting Table' }, price: 5, icon: 'Factory', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 365, description: { th: 'ใช้สำหรับสกัดแร่ระดับต่ำให้เป็นแร่ระดับสูง', en: 'Used for refining low tier materials' } },
    { id: 'magnifying_glass', name: { th: 'แว่นขยายส่องแร่', en: 'Magnifying Glass' }, price: 5, icon: 'Search', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 365, description: { th: 'ใช้ตรวจสอบหาแร่หายากโดยอัตโนมัติ', en: 'Automatically detects rare minerals' } },
    { id: 'robot', name: { th: 'หุ่นยนต์ AI', en: 'AI Robot' }, price: 100, icon: 'Bot', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 30, description: { th: 'หุ่นยนต์อัจฉริยะ: เก็บของขวัญอัตโนมัติ, เติมพลังงาน/ซ่อมแซมอัตโนมัติ, แจ้งเตือนราคาตลาด', en: 'Smart Robot: Auto-collect gifts, Auto-repair/refill, Market alerts' } },
    { id: 'insurance_card', name: { th: 'ใบประกันความเสี่ยง', en: 'Insurance Card' }, price: 300, icon: 'FileText', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 0, description: { th: 'ป้องกันระดับเครื่องจักรลดระดับเมื่ออัปเกรดล้มเหลว', en: 'Prevents rig downgrade upon upgrade failure' }, buyable: true },
    { id: 'vip_withdrawal_card', name: { th: 'บัตร VIP ปลดล็อกถอนเงิน', en: 'VIP Withdrawal Card' }, price: 200, icon: 'CreditCard', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 0, description: { th: 'ใช้สำหรับปลดล็อกการถอนเงินถาวร', en: 'Unlocks permanent withdrawals' } },
    { id: 'ancient_blueprint', name: { th: 'แผนที่ขุดทองโบราณ', en: 'Ancient Blueprint' }, price: 10000, icon: 'FileText', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'ใช้แทนวัสดุหายากในการสร้างแท่นขุดระดับสูง', en: 'Substitute for rare materials in crafting high-tier rigs' }, buyable: false },
    { id: 'hourglass_small', name: { th: 'นาฬิกาทราย (เล็ก)', en: 'Hourglass (Small)' }, price: 5, icon: 'Hourglass', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'เร่งเวลาการสำรวจ 30 นาที', en: 'Speed up exploration by 30 mins' } },
    { id: 'hourglass_medium', name: { th: 'นาฬิกาทราย (กลาง)', en: 'Hourglass (Medium)' }, price: 20, icon: 'Hourglass', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'เร่งเวลาการสำรวจ 2 ชั่วโมง', en: 'Speed up exploration by 2 hours' } },
    { id: 'hourglass_large', name: { th: 'นาฬิกาทราย (ใหญ่)', en: 'Hourglass (Large)' }, price: 60, icon: 'Hourglass', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'เร่งเวลาการสำรวจ 6 ชั่วโมง', en: 'Speed up exploration by 6 hours' } },
    { id: 'time_skip_ticket', name: { th: 'ตั๋วเร่งเวลา', en: 'Time Skip Ticket' }, price: 5, icon: 'Timer', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'ลดเวลาการคราฟต์ 1 ชั่วโมง (กดซ้ำได้)', en: 'Reduce crafting time by 1 hour (stackable)' } },
    { id: 'construction_nanobot', name: { th: 'นาโนบอทก่อสร้าง', en: 'Construction Nanobot' }, price: 100, icon: 'Cpu', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'สร้างอุปกรณ์เสร็จทันที 100%', en: 'Instantly finish crafting (100%)' } },


    { id: 'repair_kit', name: { th: 'ชุดบำรุงรักษาพิเศษ', en: 'Repair Kit' }, price: 50, icon: 'Tool', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: { th: 'ซ่อมแซมเครื่องจักรจนเต็ม 100%', en: 'Fully repairs a rig to 100%' }, buyable: false },

    {
        id: 'hat', name: { th: 'หมวกนิรภัยมาตรฐาน', en: 'Standard Helmet' }, price: 50, icon: 'HardHat', minBonus: 0.5, maxBonus: 1.0, durationBonus: 1, lifespanDays: 30, tier: 1, // 0.5 - 1.0 THB
        craftingRecipe: { 1: 3 }, craftingFee: 10, craftDurationMinutes: 30, buyable: false, specialEffect: { th: 'ลดค่าดูแล -5%', en: 'Maintenance cost -5%' }
    },
    {
        id: 'uniform', name: { th: 'ชุดป้องกัน', en: 'Safety Uniform' }, price: 120, icon: 'Shirt', minBonus: 1.0, maxBonus: 2.0, durationBonus: 3, lifespanDays: 30, tier: 1, // 1.0 - 2.0 THB
        craftingRecipe: { 1: 4, 2: 3 }, craftingFee: 20, craftDurationMinutes: 60, buyable: false, specialEffect: { th: 'ลดค่าชาร์จแบต 5%', en: 'Reduce charging cost 5%' }
    },
    {
        id: 'bag', name: { th: 'เป้สนามอเนกประสงค์', en: 'Utility Backpack' }, price: 200, icon: 'Backpack', minBonus: 1.5, maxBonus: 3.0, durationBonus: 5, lifespanDays: 45, tier: 2, // 1.5 - 3.0 THB
        craftingRecipe: { 2: 4, 3: 2 }, craftingFee: 30, craftDurationMinutes: 180, buyable: false, specialEffect: { th: 'ราคาขาย +1%', en: 'Sell price +1%' }
    },
    {
        id: 'boots', name: { th: 'รองเท้าเซฟตี้', en: 'Safety Boots' }, price: 350, icon: 'Footprints', minBonus: 2.0, maxBonus: 4.0, durationBonus: 5, lifespanDays: 45, tier: 2, // 2.0 - 4.0 THB
        craftingRecipe: { 3: 5, 4: 2 }, craftingFee: 50, craftDurationMinutes: 300, buyable: false, specialEffect: { th: 'ประหยัดพลังงาน 5%', en: 'Energy saving 5%' }
    },
    {
        id: 'glasses', name: { th: 'แว่นตากันฝุ่น', en: 'Safety Glasses' }, price: 400, icon: 'Glasses', minBonus: 2.5, maxBonus: 5.0, durationBonus: 7, lifespanDays: 60, tier: 2, // 2.5 - 5.0 THB
        craftingRecipe: { 4: 3, 3: 4 }, craftingFee: 80, craftDurationMinutes: 420, buyable: false, specialEffect: { th: 'โบนัส +2%', en: 'Bonus +2%' }
    },
    {
        id: 'mobile', name: { th: 'สมาทโฟน', en: 'Smartphone' }, price: 450, icon: 'Smartphone', minBonus: 3.0, maxBonus: 6.0, durationBonus: 7, lifespanDays: 90, tier: 2, // 3.0 - 6.0 THB
        craftingRecipe: { 5: 1, 4: 4 }, craftingFee: 120, craftDurationMinutes: 540, buyable: false, specialEffect: { th: 'ลดค่าใช้จ่าย 2%', en: 'Reduce expenses 2%' }
    },
    {
        id: 'pc', name: { th: 'โน๊ตบุ๊ค', en: 'Notebook' }, price: 500, icon: 'Monitor', minBonus: 4.0, maxBonus: 8.0, durationBonus: 7, lifespanDays: 90, tier: 3, // 4.0 - 8.0 THB
        craftingRecipe: { 5: 2, 4: 3 }, craftingFee: 180, craftDurationMinutes: 720, buyable: false, specialEffect: { th: 'โอกาสโบนัส 1%', en: 'Bonus chance 1%' }
    },
    {
        id: 'auto_excavator', name: { th: 'รถไฟฟ้า', en: 'Electric Vehicle' }, price: 650, icon: 'TrainFront', minBonus: 10.0, maxBonus: 15.0, durationBonus: 0, lifespanDays: 120, tier: 3, // 10.0 - 15.0 THB
        craftingRecipe: { 6: 1, 5: 2 }, craftingFee: 500, craftDurationMinutes: 1440, buyable: false, specialEffect: { th: 'Jackpot 2%', en: 'Jackpot 2%' }
    }
];

// --- REPAIR KIT DEFINITIONS ---
export const REPAIR_KITS = [
    {
        id: 'repair_kit_1',
        name: { th: 'ชุดซ่อมพื้นฐาน', en: 'Basic Repair Kit' },
        repairTier: 1,
        repairDays: 30,
        targetEquipment: ['hat', 'uniform'],
        craftingRecipe: { 1: 2, 2: 2 } as Record<number, number>,
        craftingFee: 5,
        craftDurationMinutes: 15,
        icon: 'Wrench'
    },
    {
        id: 'repair_kit_2',
        name: { th: 'ชุดซ่อมมาตรฐาน', en: 'Standard Repair Kit' },
        repairTier: 2,
        repairDays: 30,
        targetEquipment: ['bag', 'boots'],
        craftingRecipe: { 3: 3, 2: 3 } as Record<number, number>,
        craftingFee: 10,
        craftDurationMinutes: 30,
        icon: 'Wrench'
    },
    {
        id: 'repair_kit_3',
        name: { th: 'ชุดซ่อมขั้นสูง', en: 'Advanced Repair Kit' },
        repairTier: 3,
        repairDays: 30,
        targetEquipment: ['glasses', 'mobile'],
        craftingRecipe: { 3: 5, 4: 2 } as Record<number, number>,
        craftingFee: 50,
        craftDurationMinutes: 60,
        icon: 'Wrench'
    },
    {
        id: 'repair_kit_4',
        name: { th: 'ชุดซ่อมเครื่องจักรกล', en: 'Master Repair Kit' },
        repairTier: 4,
        repairDays: 30,
        targetEquipment: ['pc', 'auto_excavator'],
        craftingRecipe: { 4: 5, 5: 1 } as Record<number, number>,
        craftingFee: 200,
        craftDurationMinutes: 120,
        icon: 'Wrench'
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
    { day: 8, reward: 'money', amount: 25, label: { th: '25 ฿', en: '25 THB' } },
    { day: 9, reward: 'material', tier: 2, amount: 2, label: { th: 'ทองแดง x2', en: 'Copper x2' } },
    { day: 10, reward: 'money', amount: 30, label: { th: '30 ฿', en: '30 THB' } },
    { day: 11, reward: 'material', tier: 3, amount: 1, label: { th: 'เหล็ก x1', en: 'Iron x1' } },
    { day: 12, reward: 'money', amount: 35, label: { th: '35 ฿', en: '35 THB' } },
    { day: 13, reward: 'item', id: 'upgrade_chip', amount: 2, label: { th: 'ชิปอัปเกรด x2', en: 'Upgrade Chip x2' } },
    { day: 14, reward: 'material', tier: 4, amount: 1, label: { th: 'ทองคำ x1', en: 'Gold x1' }, highlight: true },
    { day: 15, reward: 'money', amount: 40, label: { th: '40 ฿', en: '40 THB' } },
    { day: 16, reward: 'material', tier: 3, amount: 2, label: { th: 'เหล็ก x2', en: 'Iron x2' } },
    { day: 17, reward: 'material', tier: 2, amount: 5, label: { th: 'ทองแดง x5', en: 'Copper x5' } },
    { day: 18, reward: 'money', amount: 45, label: { th: '45 ฿', en: '45 THB' } },
    { day: 19, reward: 'material', tier: 3, amount: 2, label: { th: 'เหล็ก x2', en: 'Iron x2' } },
    { day: 20, reward: 'item', id: 'upgrade_chip', amount: 5, label: { th: 'ชิปอัปเกรด x5', en: 'Upgrade Chip x5' } },
    { day: 21, reward: 'item', id: 'upgrade_chip', amount: 15, label: { th: 'ชิปอัปเกรด x15', en: 'Upgrade Chip x15' }, highlight: true },
    { day: 22, reward: 'money', amount: 50, label: { th: '50 ฿', en: '50 THB' } },
    { day: 23, reward: 'material', tier: 4, amount: 1, label: { th: 'ทองคำ x1', en: 'Gold x1' } },
    { day: 24, reward: 'item', id: 'chest_key', amount: 5, label: { th: 'กุญแจเข้าเหมือง x5', en: 'Mine Key x5' } },
    { day: 25, reward: 'money', amount: 60, label: { th: '60 ฿', en: '60 THB' } },
    { day: 26, reward: 'material', tier: 4, amount: 1, label: { th: 'ทองคำ x1', en: 'Gold x1' } },
    { day: 27, reward: 'item', id: 'mixer', amount: 1, label: { th: 'โต๊ะช่างสกัดแร่', en: 'Crafting Table' } },
    { day: 28, reward: 'money', amount: 100, label: { th: 'Jackpot 100 ฿', en: 'Jackpot 100 THB' }, highlight: true },
    { day: 29, reward: 'material', tier: 4, amount: 1, label: { th: 'ทองคำ x1', en: 'Gold x1' } },
    { day: 30, reward: 'grand_prize', label: { th: 'ใบประกันความเสี่ยง + แท่นขุดเจาะพิเศษ', en: 'Insurance Card + Master Wing' }, highlight: true, special: true },
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
    { id: 'gold', label: { th: 'นักขุดระดับโกลด์', en: 'Gold Miner' }, points: 600, rewardId: 'robot', amount: 1, buff: '', desc: { th: 'หุ่นยนต์ AI (30 วัน)', en: 'AI Robot (30 days)' } },
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
        { type: 'money', amount: 5, chance: 41, label: { th: 'เงิน 5 ฿', en: '5 THB Cash' } },
        { type: 'material', chance: 15, label: { th: 'วัสดุสุ่ม (ถ่านหิน/ทองแดง/เหล็ก)', en: 'Random Material (Coal/Copper/Iron)' } },
        { type: 'energy', amount: 50, chance: 30, label: { th: 'พลังงานเครื่องจักร +50%', en: 'Machine Energy +50%' } },
        { type: 'item', chance: 13, label: { th: 'ไอเทมสุ่ม (กุญแจเข้าเหมือง/ชิป/โต๊ะช่าง)', en: 'Random Item (Key/Chip/Crafting Table)' } },
        { type: 'robot', id: 'robot', chance: 1, label: { th: 'หุ่นยนต์ AI', en: 'AI Robot' } },
    ]
};

export interface DungeonLevel {
    id: number;
    name: { th: string; en: string };
    description: { th: string; en: string };
    cost: number;
    keyCost?: number;
    durationHours: number;
    rewards: {
        common: { tier: number, amount: number, chance: number }[];
        salt: { tier: number, amount: number, chance: number }[];
        rare: { itemId?: string, tier?: number, amount: number, chance: number }[];
    }
}

export const DUNGEON_CONFIG: DungeonLevel[] = [
    {
        id: 1,
        name: { th: 'หุบเขาเหมืองร้าง (The Abandoned Canyon)', en: 'The Abandoned Canyon' },
        description: { th: 'ค้นหาเศษแร่ที่หลงเหลือในเหมืองร้าง', en: 'Search for leftover ore fragments in the abandoned mine.' },
        cost: 100,
        keyCost: 2,
        durationHours: 2,
        rewards: {
            common: [
                { tier: 1, amount: 10, chance: 50 }, // ถ่านหิน x10
                { tier: 2, amount: 5, chance: 50 }   // ทองแดง x5
            ],
            salt: [
                { tier: 1, amount: 5, chance: 100 } // ถ่านหิน x5
            ],
            rare: [
                { itemId: 'chest_key', amount: 1, chance: 1 },
                { itemId: 'hourglass_small', amount: 1, chance: 1 },
                { itemId: 'upgrade_chip', amount: 1, chance: 1 }
            ]
        }
    },
    {
        id: 2,
        name: { th: 'นครทองคำที่สาบสูญ (Lost City of Gold)', en: 'Lost City of Gold' },
        description: { th: 'ปฏิบัติการเจาะทะลุชั้นหินแข็ง เพื่อค้นหาทรัพยากรล้ำค่าที่ซ่อนอยู่', en: 'Drilling through hard rock layers to find hidden precious resources.' },
        cost: 300,
        keyCost: 10,
        durationHours: 6,
        rewards: {
            common: [
                { tier: 3, amount: 10, chance: 50 }, // เหล็ก x10
                { tier: 4, amount: 5, chance: 50 }   // ทองคำ x5
            ],
            salt: [
                { tier: 3, amount: 5, chance: 50 }, // เหล็ก x5
                { tier: 1, amount: 5, chance: 50 }  // ถ่านหิน x5
            ],
            rare: [
                { itemId: 'upgrade_chip', amount: 1, chance: 1 },
                { itemId: 'mixer', amount: 1, chance: 1 },
                { itemId: 'magnifying_glass', amount: 1, chance: 1 },
                { itemId: 'hourglass_medium', amount: 1, chance: 1 }
            ]
        }
    },
    {
        id: 3,
        name: { th: 'เหมืองผลึกคริสตัล (Crystal Caverns)', en: 'Crystal Caverns' },
        description: { th: 'เดินทางสู่ดินแดนต้องห้าม ที่เล่าขานว่ามีขุมทรัพย์ระดับตำนานหลับใหลอยู่', en: 'Journey to forbidden lands where legendary treasures are said to lie.' },
        cost: 1000,
        durationHours: 12,
        rewards: {
            common: [
                { tier: 5, amount: 15, chance: 50 }, // เพชร x15
                { tier: 6, amount: 5, chance: 50 }   // น้ำมันดิบ x5
            ],
            salt: [
                { tier: 5, amount: 5, chance: 100 } // เพชร x5
            ],
            rare: [
                { tier: 9, amount: 1, chance: 1 }, // แร่ในตำนาน
                { tier: 8, amount: 1, chance: 1 }  // แร่ลึกลับ
            ]
        }
    }
];

