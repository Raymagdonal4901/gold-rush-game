
export const CURRENCY = '$';
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

export const EQUIPMENT_SERIES: Record<string, { title: string; desc: string; tiers: { rarity: string; name: string; stat: string }[] }> = {
    hat: {
        title: "Power Supply",
        desc: "แหล่งจ่ายไฟ & ความเสถียร",
        tiers: [
            { rarity: 'COMMON', name: 'แหล่งจ่ายไฟ 500W Standard', stat: 'ค่าซ่อม -5%' },
            { rarity: 'RARE', name: 'แหล่งจ่ายไฟ 750W Gold', stat: 'ค่าซ่อม -10%' },
            { rarity: 'EPIC', name: 'แหล่งจ่ายไฟ 1000W Platinum', stat: 'ค่าซ่อม -15%' },
            { rarity: 'LEGENDARY', name: 'แหล่งจ่ายไฟ 1600W Titanium', stat: 'ค่าซ่อม -20%' },
        ]
    },
    uniform: {
        title: "ระบบระบายความร้อน",
        desc: "อุณหภูมิ & อายุการใช้งาน",
        tiers: [
            { rarity: 'COMMON', name: 'พัดลมเคส 120mm', stat: 'สัญญา +5 วัน' },
            { rarity: 'RARE', name: 'ฮีรตซิงค์ระบายความร้อน', stat: 'สัญญา +10 วัน' },
            { rarity: 'EPIC', name: 'ชุดน้ำปิด (AIO Water Cool)', stat: 'สัญญา +20 วัน' },
            { rarity: 'LEGENDARY', name: 'ห้องเย็น (Immersion Cooling)', stat: 'สัญญา +30 วัน' },
        ]
    },
    bag: {
        title: "Hardware Wallet",
        desc: "ความปลอดภัย & มูลค่า",
        tiers: [
            { rarity: 'COMMON', name: 'Paper Wallet', stat: 'ราคาขาย +1%' },
            { rarity: 'RARE', name: 'USB Wallet', stat: 'ราคาขาย +2%' },
            { rarity: 'EPIC', name: 'Crypto Steel', stat: 'ราคาขาย +3%' },
            { rarity: 'LEGENDARY', name: 'Cold Storage Vault', stat: 'ราคาขาย +5%' },
        ]
    },
    boots: {
        title: "สายไฟ & การเชื่อมต่อ",
        desc: "ความเสถียร & ประหยัดไฟ",
        tiers: [
            { rarity: 'COMMON', name: 'สายไฟมาตรฐาน', stat: 'ประหยัดค่าไฟ 5%' },
            { rarity: 'RARE', name: 'สายถักทนความร้อน', stat: 'ประหยัดค่าไฟ 10%' },
            { rarity: 'EPIC', name: 'รางไฟอุตสาหกรรม', stat: 'ประหยัดค่าไฟ 20%' },
            { rarity: 'LEGENDARY', name: 'ระบบเดินไฟอัจฉริยะ', stat: 'ประหยัดค่าไฟ 30%' },
        ]
    },
    mobile: {
        title: "Network Connection",
        desc: "การเชื่อมต่อ & ความเร็ว",
        tiers: [
            { rarity: 'COMMON', name: 'LAN Cable Cat5e', stat: 'ลดค่าใช้จ่าย 2%' },
            { rarity: 'RARE', name: 'WiFi 6 Router', stat: 'ลดค่าใช้จ่าย 5%' },
            { rarity: 'EPIC', name: 'Fiber Optic', stat: 'ลดค่าใช้จ่าย 8%' },
            { rarity: 'LEGENDARY', name: 'Satellite Link (Starlink)', stat: 'ลดค่าใช้จ่าย 12%' },
        ]
    },
    pc: {
        title: "Control Board",
        desc: "ควบคุม & ประมวลผล",
        tiers: [
            { rarity: 'COMMON', name: 'Raspberry Pi', stat: 'โอกาสโบนัส 1%' },
            { rarity: 'RARE', name: 'Mainboard BTC', stat: 'โอกาสโบนัส 2%' },
            { rarity: 'EPIC', name: 'Industrial Controller', stat: 'โอกาสโบนัส 4%' },
            { rarity: 'LEGENDARY', name: 'Quantum Controller', stat: 'โอกาสโบนัส 6%' },
        ]
    },
    glasses: {
        title: "Mining Firmware",
        desc: "ซอฟต์แวร์ & ประสิทธิภาพ",
        tiers: [
            { rarity: 'COMMON', name: 'Stock Firmware', stat: 'โบนัส +2%' },
            { rarity: 'RARE', name: 'Overclock BIOS', stat: 'โบนัส +5%' },
            { rarity: 'EPIC', name: 'Custom Modded OS', stat: 'โบนัส +8%' },
            { rarity: 'LEGENDARY', name: 'AI Optimized Kernel', stat: 'โบนัส +12%' },
        ]
    },
    auto_excavator: {
        title: "Rig Frame",
        desc: "โครงสร้าง & ความจุ",
        tiers: [
            { rarity: 'COMMON', name: 'โครงเหล็ก (Steel Frame)', stat: 'Jackpot 2%' },
            { rarity: 'RARE', name: 'เคสอลูมิเนียม (Alu Case)', stat: 'Jackpot 5%' },
            { rarity: 'EPIC', name: 'ตู้ Rack Server', stat: 'Jackpot 8%' },
            { rarity: 'LEGENDARY', name: 'ตู้คอนเทนเนอร์ (Container)', stat: 'Jackpot 12%' },
        ]
    }
};

export const GLOVE_DETAILS: Record<string, { name: string }> = {
    COMMON: { name: 'คนงานทั่วไป (JUNIOR)' },
    RARE: { name: 'หัวหน้าคนงาน (SENIOR)' },
    SUPER_RARE: { name: 'วิศวกรเหมือง (ENGINEER)' },
    EPIC: { name: 'ผู้เชี่ยวชาญ (EXPERT)' },
    LEGENDARY: { name: 'ตำนานนักขุด (LEGEND)' },
};

export const GIFT_CYCLE_DAYS = 30;

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
    DROP_INTERVAL_MS: 72000000, // 20 Hours (20 * 60 * 60 * 1000)
    NAMES: {
        0: 'วัสดุปริศนา', // Shifted
        1: 'ถ่านหิน', // Coal (was Stone)
        2: 'ทองแดง', // Copper (was Iron)
        3: 'เหล็ก', // Iron (was Gold)
        4: 'ทองคำ', // Gold (was Diamond)
        5: 'เพชร', // Diamond (was Crude Oil)
        6: 'น้ำมันดิบ', // Crude Oil (was Vibranium)
        7: 'แร่วาเบรเนียม', // Vibranium (was Mysterious)
        8: 'แร่ลึกลับ', // Mysterious (was Legendary)
        9: 'แร่ในตำนาน', // Legendary
    },
    PRICES: {
        1: 0.3,
        2: 0.6,
        3: 1.0,
        4: 1.8,
        5: 3.5,
        6: 9.0,
        7: 45.0,
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
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 1.5, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 3.0, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 9.0, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 30.0, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    uniform: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 1.5, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 3.0, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 9.0, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 30.0, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    bag: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 1.5, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 3.0, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 9.0, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 30.0, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    boots: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 1.5, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 3.0, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 9.0, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 30.0, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    glasses: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 1.5, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 3.0, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 9.0, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 30.0, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    mobile: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 1.5, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 3.0, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 9.0, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 30.0, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    pc: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 1.5, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 3.0, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 9.0, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 30.0, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    auto_excavator: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 1.5, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 3.0, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 9.0, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 30.0, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    },
    glove: {
        1: { matTier: 1, matAmount: 10, chipAmount: 1, cost: 1.5, chance: 1.0, targetBonus: 0.5, risk: 'NONE' },
        2: { matTier: 1, matAmount: 20, chipAmount: 5, cost: 3.0, chance: 0.8, targetBonus: 1.5, risk: 'DROP' },
        3: { matTier: 2, matAmount: 20, chipAmount: 10, cost: 9.0, chance: 0.5, targetBonus: 3.0, risk: 'DROP' },
        4: { matTier: 2, matAmount: 40, chipAmount: 20, cost: 30.0, chance: 0.25, targetBonus: 6.0, risk: 'BREAK' },
    }
};
export const UPGRADE_REQUIREMENTS: Record<number, { matTier: number; matAmount: number; chance: number; label: string; catalyst?: number; chipAmount?: number; maxBonus?: number; cost: number; targetBonus?: number; risk?: string }> = {
    1: { matTier: 1, matAmount: 10, chipAmount: 1, chance: 1.0, label: '+2', cost: 1.5, targetBonus: 0.5, risk: 'NONE' },
    2: { matTier: 1, matAmount: 20, chipAmount: 5, chance: 0.8, label: '+3', cost: 3.0, targetBonus: 1.5, risk: 'DROP' },
    3: { matTier: 2, matAmount: 20, chipAmount: 10, chance: 0.5, label: '+4', cost: 9.0, targetBonus: 3.0, risk: 'DROP' },
    4: { matTier: 2, matAmount: 40, chipAmount: 20, chance: 0.25, label: '+5', cost: 30.0, targetBonus: 6.0, risk: 'BREAK' },
};

// สูตรการแปรรูปวัตถุดิบ (Tier ทรัพยากรหลักที่กด -> สูตรและผลลัพธ์)
export const MATERIAL_RECIPES: Record<number, { ingredients: Record<number, number>; fee: number; requiredItem?: string }> = {
    1: { ingredients: { 1: 2 }, fee: 0.05, requiredItem: 'mixer' }, // ถ่านหิน x2 + 1 Baht -> ทองแดง
    2: { ingredients: { 1: 1, 2: 1 }, fee: 0.1, requiredItem: 'mixer' }, // ถ่านหิน x1 + ทองแดง x1 + 2 Baht -> เหล็ก
    3: { ingredients: { 2: 1, 3: 1 }, fee: 0.15, requiredItem: 'mixer' }, // ทองแดง x1 + เหล็ก x1 + 3 Baht -> ทองคำ
    4: { ingredients: { 2: 1, 3: 1, 4: 1 }, fee: 0.25, requiredItem: 'mixer' }, // ทองแดง x1 + เหล็ก x1 + ทองคำ x1 + 5 Baht -> เพชร
    5: { ingredients: { 4: 1, 5: 1 }, fee: 0.5, requiredItem: 'mixer' }, // ทองคำ x1 + เพชร x1 + 10 Baht -> น้ำมันดิบ
    6: { ingredients: { 1: 15, 2: 10, 3: 10, 4: 5, 5: 3, 6: 1 }, fee: 1.5, requiredItem: 'magnifying_glass' }, // Multi-mix -> แร่วาเบรเนียม
};

export interface RigPreset {
    id: number;
    name: string;
    price: number;
    dailyProfit: number;
    bonusProfit?: number;
    durationMonths?: number;
    durationDays?: number;
    repairCost: number;
    energyCostPerDay: number;
    craftingRecipe?: { materials?: Record<number, number>; items?: Record<string, number> };
    specialProperties?: { infiniteDurability?: boolean; zeroEnergy?: boolean; maxAllowed?: number; noGift?: boolean };
    image?: string;
    description?: string;
    type?: string;
    materialChance?: number;
}

export const RIG_PRESETS: RigPreset[] = [
    { id: 1, name: 'พลั่วสนิมเขรอะ', price: 8.5, dailyProfit: 1.4, bonusProfit: 0.8, durationDays: 7, repairCost: 0, energyCostPerDay: 0.03, specialProperties: { infiniteDurability: false, noGift: true } },
    { id: 2, name: 'สว่านพกพา', price: 14.0, dailyProfit: 1.1, bonusProfit: 2.0, durationDays: 15, repairCost: 0, energyCostPerDay: 0.06, image: '/images/rooms/fan_room.png', description: 'พลั่วขุดมาตรฐานเพื่อเริ่มกิจการ', type: 'UNCOMMON', materialChance: 0.1, specialProperties: { infiniteDurability: false, noGift: true } },
    { id: 3, name: 'เครื่องขุดถ่านหิน', price: 28.0, dailyProfit: 1.3, durationMonths: 1, repairCost: 1.8, energyCostPerDay: 0.09 },
    { id: 4, name: 'เครื่องขุดทองแดง', price: 42.0, dailyProfit: 1.6, durationMonths: 2, repairCost: 3.5, energyCostPerDay: 0.18, image: '/images/rooms/aircon_deluxe.png', description: 'สว่านแรงดันสูงเพื่อเจาะชั้นดินลึก', type: 'SUPER_RARE', materialChance: 0.2 },
    { id: 5, name: 'เครื่องขุดเหล็ก', price: 57.0, dailyProfit: 1.9, durationMonths: 3, repairCost: 5.2, energyCostPerDay: 0.28, type: 'EPIC' },
    { id: 6, name: 'เครื่องขุดทองคำ', price: 72.0, dailyProfit: 2.1, durationMonths: 4, repairCost: 7.2, energyCostPerDay: 0.42, type: 'MYTHIC' },
    { id: 7, name: 'เครื่องขุดเพชร', price: 85.0, dailyProfit: 2.5, durationMonths: 5, repairCost: 8.5, energyCostPerDay: 0.62, type: 'LEGENDARY' },
    {
        id: 8,
        name: 'เครื่องขุดปฏิกรณ์ไวเบรเนียม',
        price: 0,
        dailyProfit: 2.8,
        bonusProfit: 0,
        durationMonths: 12,
        repairCost: 0,
        energyCostPerDay: 1.42,
        craftingRecipe: {
            materials: { 7: 1, 8: 2, 9: 3 }
        },
        specialProperties: { infiniteDurability: false, zeroEnergy: false, maxAllowed: 1 },
        type: 'ULTRA_LEGENDARY'
    }
];

export const SLOT_EXPANSION_CONFIG: Record<number, { title: string; cost: number; mats: Record<number, number>; item?: string; itemCount?: number }> = {
    4: { title: 'ขยายพื้นที่ขุดเจาะช่องที่ 4', cost: 57.0, mats: { 3: 30, 4: 10 }, item: 'chest_key', itemCount: 1 },
    5: { title: 'ขยายพื้นที่ขุดเจาะช่องที่ 5', cost: 85.0, mats: { 5: 10, 6: 5 }, item: 'upgrade_chip', itemCount: 5 },
    6: { title: 'สร้างแท่นขุดเจาะพิเศษ (Master Wing)', cost: 142.0, mats: { 7: 1, 8: 1, 9: 1 }, item: undefined, itemCount: 0 },
};

export const TRANSACTION_LIMITS = {
    DEPOSIT: {
        MIN: 3,
        MAX: 1000,
    },
    WITHDRAW: {
        MIN: 3,
        MAX: 100,
    }
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
    FUEL_REFILL_COST: 0.05, // 0.05 USD for 24 Hours
    COST_PER_UNIT: 0.0005, // 0.0005 USD per 1% energy refill
    MIN_REFILL_FEE: 0.05, // Minimum 0.05 USD fee
    OVERCLOCK_REFILL_COST: 1.5, // 1.5 USD for 48 Hours of x2 Power
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
    name: string;
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
    specialEffect?: string;
    description?: string;
    tier?: number;
}

export const SHOP_ITEMS: ShopItemConfig[] = [
    { id: 'upgrade_chip', name: 'ชิปอัปเกรด', price: 0.15, icon: 'Cpu', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: 'ใช้สำหรับอัปเกรดเครื่องจักรเพื่อเพิ่มกำลังการขุด' },
    { id: 'chest_key', name: 'กุญแจเข้าเหมือง', price: 0.15, icon: 'Key', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 365, description: 'ใช้เปิดถ้ำสำรวจเพื่อลุ้นรับไอเทมหายาก', buyable: false },
    { id: 'mixer', name: 'โต๊ะช่างสกัดแร่', price: 0.15, icon: 'Factory', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 365, description: 'ใช้สำหรับสกัดแร่ระดับต่ำให้เป็นแร่ระดับสูง' },
    { id: 'magnifying_glass', name: 'แว่นขยายส่องแร่', price: 0.15, icon: 'Search', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 365, description: 'ใช้ตรวจสอบหาแร่หายากโดยอัตโนมัติ' },
    { id: 'robot', name: 'หุ่นยนต์ AI', price: 2.8, icon: 'Bot', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 30, description: 'หุ่นยนต์อัจฉริยะ: เก็บของขวัญอัตโนมัติ, เติมพลังงาน/ซ่อมแซมอัตโนมัติ, แจ้งเตือนราคาตลาด' },
    { id: 'insurance_card', name: 'ใบประกันความเสี่ยง', price: 8.5, icon: 'FileText', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 0, description: 'ป้องกันระดับเครื่องจักรลดระดับเมื่ออัปเกรดล้มเหลว', buyable: true },
    { id: 'ancient_blueprint', name: 'แผนที่ขุดทองโบราณ', price: 285.0, icon: 'FileText', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: 'ใช้แทนวัสดุหายากในการสร้างแท่นขุดระดับสูง', buyable: false },

    { id: 'hourglass_small', name: 'นาฬิกาทราย (เล็ก)', price: 0.15, icon: 'Hourglass', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: 'เร่งเวลาการสำรวจ 30 นาที' },
    { id: 'hourglass_medium', name: 'นาฬิกาทราย (กลาง)', price: 0.6, icon: 'Hourglass', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: 'เร่งเวลาการสำรวจ 2 ชั่วโมง' },
    { id: 'hourglass_large', name: 'นาฬิกาทราย (ใหญ่)', price: 1.7, icon: 'Hourglass', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: 'เร่งเวลาการสำรวจ 6 ชั่วโมง' },

    { id: 'repair_kit', name: 'ชุดบำรุงรักษาพิเศษ', price: 1.4, icon: 'Tool', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: 'ซ่อมแซมเครื่องจักรจนเต็ม 100%', buyable: false },

    {
        id: 'hat', name: 'หมวกนิรภัยมาตรฐาน', price: 1.4, icon: 'HardHat', minBonus: 0.1, maxBonus: 0.5, durationBonus: 1, lifespanDays: 30, tier: 1,
        craftingRecipe: { 1: 3 }, craftingFee: 0.3, craftDurationMinutes: 30, buyable: false, specialEffect: 'ลดค่าดูแล -5%'
    },
    {
        id: 'uniform', name: 'ชุดป้องกัน', price: 3.4, icon: 'Shirt', minBonus: 0.5, maxBonus: 1.5, durationBonus: 3, lifespanDays: 30, tier: 1,
        craftingRecipe: { 1: 4, 2: 3 }, craftingFee: 0.3, craftDurationMinutes: 60, buyable: false, specialEffect: 'สัญญา +5 วัน'
    },
    {
        id: 'bag', name: 'เป้สนามอเนกประสงค์', price: 5.7, icon: 'Backpack', minBonus: 1.0, maxBonus: 2.0, durationBonus: 5, lifespanDays: 45, tier: 2,
        craftingRecipe: { 2: 4, 3: 2 }, craftingFee: 0.6, craftDurationMinutes: 180, buyable: false, specialEffect: 'ราคาขาย +1%'
    },
    {
        id: 'boots', name: 'รองเท้าเซฟตี้', price: 10.0, icon: 'Footprints', minBonus: 2.0, maxBonus: 3.0, durationBonus: 5, lifespanDays: 45, tier: 2,
        craftingRecipe: { 3: 5, 4: 2 }, craftingFee: 0.7, craftDurationMinutes: 300, buyable: false, specialEffect: 'ประหยัดพลังงาน 5%'
    },
    {
        id: 'glasses', name: 'แว่นตากันฝุ่น', price: 11.4, icon: 'Glasses', minBonus: 2.5, maxBonus: 3.5, durationBonus: 7, lifespanDays: 60, tier: 2,
        craftingRecipe: { 4: 3, 3: 4 }, craftingFee: 2.2, craftDurationMinutes: 420, buyable: false, specialEffect: 'โบนัส +2%'
    },
    {
        id: 'mobile', name: 'สมาทโฟน', price: 12.8, icon: 'Smartphone', minBonus: 3.0, maxBonus: 4.0, durationBonus: 7, lifespanDays: 90, tier: 2,
        craftingRecipe: { 5: 1, 4: 4 }, craftingFee: 3.4, craftDurationMinutes: 540, buyable: false, specialEffect: 'ลดค่าใช้จ่าย 2%'
    },
    {
        id: 'pc', name: 'โน๊ตบุ๊ค', price: 14.2, icon: 'Monitor', minBonus: 4.0, maxBonus: 5.0, durationBonus: 7, lifespanDays: 90, tier: 3,
        craftingRecipe: { 5: 2, 4: 3 }, craftingFee: 5.1, craftDurationMinutes: 720, buyable: false, specialEffect: 'โอกาสโบนัส 1%'
    },
    {
        id: 'auto_excavator', name: 'รถไฟฟ้า', price: 18.5, icon: 'TrainFront', minBonus: 10.0, maxBonus: 12.0, durationBonus: 0, lifespanDays: 120, tier: 3,
        craftingRecipe: { 6: 1, 5: 2 }, craftingFee: 14.2, craftDurationMinutes: 1440, buyable: false, specialEffect: 'Jackpot 2%'
    }
];

export const DAILY_CHECKIN_REWARDS = [
    { day: 1, reward: 'money', amount: 0.3, label: '0.3 $' },
    { day: 2, reward: 'material', tier: 1, amount: 2, label: 'ถ่านหิน x2' },
    { day: 3, reward: 'money', amount: 0.4, label: '0.4 $' },
    { day: 4, reward: 'material', tier: 1, amount: 3, label: 'ถ่านหิน x3' },
    { day: 5, reward: 'money', amount: 0.5, label: '0.5 $' },
    { day: 6, reward: 'item', id: 'chest_key', amount: 1, label: 'กุญแจเข้าเหมือง x1' },
    { day: 7, reward: 'item', id: 'chest_key', amount: 3, label: 'กุญแจเข้าเหมือง x3', highlight: true },
    { day: 8, reward: 'money', amount: 0.7, label: '0.7 $' },
    { day: 9, reward: 'material', tier: 2, amount: 2, label: 'ทองแดง x2' },
    { day: 10, reward: 'money', amount: 0.8, label: '0.8 $' },
    { day: 11, reward: 'material', tier: 3, amount: 1, label: 'เหล็ก x1' },
    { day: 12, reward: 'money', amount: 1.0, label: '1.0 $' },
    { day: 13, reward: 'item', id: 'upgrade_chip', amount: 2, label: 'ชิปอัปเกรด x2' },
    { day: 14, reward: 'material', tier: 4, amount: 1, label: 'ทองคำ x1', highlight: true },
    { day: 15, reward: 'money', amount: 1.1, label: '1.1 $' },
    { day: 16, reward: 'material', tier: 3, amount: 2, label: 'เหล็ก x2' },
    { day: 17, reward: 'material', tier: 2, amount: 5, label: 'ทองแดง x5' },
    { day: 18, reward: 'money', amount: 1.2, label: '1.2 $' },
    { day: 19, reward: 'material', tier: 3, amount: 2, label: 'เหล็ก x2' },
    { day: 20, reward: 'item', id: 'upgrade_chip', amount: 5, label: 'ชิปอัปเกรด x5' },
    { day: 21, reward: 'item', id: 'upgrade_chip', amount: 15, label: 'ชิปอัปเกรด x15', highlight: true },
    { day: 22, reward: 'money', amount: 1.4, label: '1.4 $' },
    { day: 23, reward: 'material', tier: 4, amount: 1, label: 'ทองคำ x1' },
    { day: 24, reward: 'item', id: 'chest_key', amount: 5, label: 'กุญแจเข้าเหมือง x5' },
    { day: 25, reward: 'money', amount: 1.7, label: '1.7 $' },
    { day: 26, reward: 'material', tier: 4, amount: 1, label: 'ทองคำ x1' },
    { day: 27, reward: 'item', id: 'mixer', amount: 1, label: 'โต๊ะช่างสกัดแร่' },
    { day: 28, reward: 'money', amount: 2.8, label: 'Jackpot 2.8 $', highlight: true },
    { day: 29, reward: 'material', tier: 4, amount: 1, label: 'ทองคำ x1' },
    { day: 30, reward: 'grand_prize', label: 'ใบประกันความเสี่ยง + แท่นขุดเจาะพิเศษ', highlight: true, special: true },
];

export const VIP_TIERS = [
    { level: 0, minExp: 0, perk: 'สมาชิกทั่วไป', bonusDrop: 0 },
    { level: 1, minExp: 30, perk: 'เพิ่มอัตราดรอป 5%', bonusDrop: 0.05 },
    { level: 2, minExp: 140, perk: 'เพิ่มอัตราดรอป 10%', bonusDrop: 0.10 },
    { level: 3, minExp: 570, perk: 'เพิ่มอัตราดรอป 15% + ส่วนลดร้านค้า 5%', bonusDrop: 0.15 },
    { level: 4, minExp: 1420, perk: 'เพิ่มอัตราดรอป 20% + ส่วนลดร้านค้า 10%', bonusDrop: 0.20 },
    { level: 5, minExp: 2850, perk: 'King of Dormitory (มาสเตอร์อาคาร: ดรอป +30%, ร้านค้า -15%)', bonusDrop: 0.30 },
];

export const QUESTS = [
    { id: 'q1', type: 'materials_crafted', target: 20, rewardType: 'points', rewardAmount: 20, title: 'นักสกัดแร่', desc: 'สกัดวัสดุสำเร็จ 20 ครั้ง' },
    { id: 'q2', type: 'spend', target: 142, rewardType: 'points', rewardAmount: 30, title: 'นักลงทุนเหมือง', desc: 'ใช้จ่าย 142 $' },
    { id: 'q3', type: 'dungeon', target: 30, rewardType: 'points', rewardAmount: 50, title: 'นักสำรวจยอดเยี่ยม', desc: 'สำรวจแหล่งแร่ 30 รอบ' },
    { id: 'q4', type: 'items_crafted', target: 20, rewardType: 'points', rewardAmount: 40, title: 'ช่างประกอบหัวเจาะ', desc: 'ประกอบหัวเจาะ 20 ชิ้น' },
    { id: 'q5', type: 'repair', target: 100, rewardType: 'points', rewardAmount: 20, title: 'ผู้ดูแลเครื่องจักร', desc: 'ซ่อมบำรุงหัวเจาะครบ 100%' },
    { id: 'q6', type: 'rare_loot', target: 1, rewardType: 'points', rewardAmount: 60, title: 'ดวงมหาเฮง', desc: 'ค้นพบแร่หายาก' },
];

export const MINING_RANKS = [
    { id: 'bronze', label: 'นักขุดระดับบรอนซ์', points: 100, rewardId: 'chest_key', amount: 5, buff: '', desc: 'รับกุญแจเข้าเหมือง x5' },
    { id: 'silver', label: 'นักขุดระดับซิลเวอร์', points: 300, rewardId: null, amount: 0, buff: 'ค่าซ่อมบำรุง -5%', desc: 'ลดค่าซ่อมบำรุงเครื่องจักร 5% (30 วัน)' },
    { id: 'gold', label: 'นักขุดระดับโกลด์', points: 600, rewardId: 'robot', amount: 1, buff: '', desc: 'หุ่นยนต์ AI (30 วัน)' },
    { id: 'platinum', label: 'นักขุดระดับแพลตตินัม', points: 1000, rewardId: null, amount: 0, buff: 'ภาษีตลาด 3%', desc: 'ลดภาษีขายแร่ 3% (30 วัน)' },
    { id: 'diamond', label: 'นักขุดระดับแชมป์', points: 1500, rewardId: null, amount: 0, buff: 'Craft Great Success +5%', desc: 'เพิ่มโอกาสสกัดแร่สำเร็จ +5% (30 วัน)' },
];

export const ACHIEVEMENTS = [
    { id: 'a1', type: 'materials_crafted', target: 50, points: 50, title: 'ช่างฝีมือ', desc: 'แปรรูปวัสดุสำเร็จ 50 ครั้ง' },
    { id: 'a2', type: 'vip', target: 285, points: 100, title: 'VIP Member', desc: 'สะสมยอดใช้จ่ายครบ 285 $' },
];

export const LUCKY_DRAW_CONFIG = {
    COST: 0.3,
    FREE_COOLDOWN_MS: 24 * 60 * 60 * 1000,
    PROBABILITIES: [
        { type: 'money', amount: 0.15, chance: 41, label: 'เงิน 0.15 $' },
        { type: 'material', chance: 15, label: 'วัสดุสุ่ม (ถ่านหิน/ทองแดง/เหล็ก)' },
        { type: 'energy', amount: 50, chance: 30, label: 'พลังงานเครื่องจักร +50%' },
        { type: 'item', chance: 13, label: 'ไอเทมสุ่ม (กุญแจเข้าเหมือง/ชิป/โต๊ะช่าง)' },
        { type: 'robot', id: 'robot', chance: 1, label: 'หุ่นยนต์ AI' },
    ]
};

export interface DungeonLevel {
    id: number;
    name: string;
    description: string;
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
        name: 'สำรวจแหล่งแร่พื้นฐาน (Online)',
        description: 'ค้นหาแหล่งแร่ออนไลน์ระดับเริ่มต้น',
        cost: 2.8,
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
        name: 'ทีมสำรวจมืออาชีพ (Expedition)',
        description: 'ว่าจ้างทีมงานสำรวจหาแร่หายาก',
        cost: 8.5,
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
        name: 'มหกรรมขุดเหมืองโลก (Mining Expo)',
        description: 'เข้าร่วมงานประมูลเหมืองระดับนานาชาติ',
        cost: 28.5,
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

