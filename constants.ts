
export const CURRENCY = 'บาท';
export const BASE_CLAIM_AMOUNT = 0;
export const DEMO_SPEED_MULTIPLIER = 720; // 24 hours -> 2 minutes

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
        title: "Helmet Series",
        desc: "ความปลอดภัย & การซ่อมบำรุง",
        tiers: [
            { rarity: 'COMMON', name: 'หมวกนิรภัยมาตรฐาน', stat: 'ค่าซ่อม -5%' },
            { rarity: 'RARE', name: 'หมวกวิศวกรคุมงาน', stat: 'ค่าซ่อม -10%' },
            { rarity: 'EPIC', name: 'หมวกนิรภัยติดไฟฉาย LED', stat: 'ค่าซ่อม -15%' },
            { rarity: 'LEGENDARY', name: 'หมวกสมาร์ทฮัด (HUD)', stat: 'ค่าซ่อม -20%' },
        ]
    },
    glasses: {
        title: "Goggles Series",
        desc: "การมองเห็น & การค้นหา",
        tiers: [
            { rarity: 'COMMON', name: 'แว่นตานิรภัยใส', stat: 'ดรอป +2%' },
            { rarity: 'RARE', name: 'แว่นกันแสงเชื่อม', stat: 'ดรอป +5%' },
            { rarity: 'EPIC', name: 'แว่นสแกนความร้อน', stat: 'ดรอป +8%' },
            { rarity: 'LEGENDARY', name: 'แว่นวิเคราะห์โครงสร้างแร่', stat: 'ดรอป +12%' },
        ]
    },
    uniform: {
        title: "Suit Series",
        desc: "ความทนทาน & อายุการใช้งาน",
        tiers: [
            { rarity: 'COMMON', name: 'ชุดหมีช่างกล', stat: 'อายุ +5 วัน' },
            { rarity: 'RARE', name: 'ชุดกันความร้อนสูง', stat: 'อายุ +10 วัน' },
            { rarity: 'EPIC', name: 'ชุดปฏิบัติการพิเศษ', stat: 'อายุ +20 วัน' },
            { rarity: 'LEGENDARY', name: 'ชุดเกราะเอ็กโซสูท', stat: 'อายุ +30 วัน' },
        ]
    },
    bag: {
        title: "Bag Series",
        desc: "การค้าขาย & มูลค่า",
        tiers: [
            { rarity: 'COMMON', name: 'กระเป๋าผ้าใบ', stat: 'ราคาขาย +1%' },
            { rarity: 'RARE', name: 'กล่องเครื่องมือเหล็ก', stat: 'ราคาขาย +2%' },
            { rarity: 'EPIC', name: 'เป้สนามเดินป่า', stat: 'ราคาขาย +3%' },
            { rarity: 'LEGENDARY', name: 'กระเป๋ามิติควอนตัม', stat: 'ราคาขาย +5%' },
        ]
    },
    boots: {
        title: "Boots Series",
        desc: "ความคล่องตัว & พลังงาน",
        tiers: [
            { rarity: 'COMMON', name: 'รองเท้าบูทกันน้ำ', stat: 'โอกาสประหยัดไฟ 5%' },
            { rarity: 'RARE', name: 'รองเท้าหัวเหล็ก', stat: 'โอกาสประหยัดไฟ 10%' },
            { rarity: 'EPIC', name: 'รองเท้าคอมแบท', stat: 'โอกาสประหยัดไฟ 20%' },
            { rarity: 'LEGENDARY', name: 'รองเท้าต้านแรงโน้มถ่วง', stat: 'โอกาสประหยัดไฟ 30%' },
        ]
    },
    mobile: {
        title: "Smartphone Series",
        desc: "คอนเนกชั่น & ตลาดกลาง",
        tiers: [
            { rarity: 'COMMON', name: 'มือถือรุ่นปุ่มกด', stat: 'ลดภาษี 2%' },
            { rarity: 'RARE', name: 'สมาร์ทโฟนจอสัมผัส', stat: 'ลดภาษี 5%' },
            { rarity: 'EPIC', name: 'แท็บเล็ตควบคุมระยะไกล', stat: 'ลดภาษี 8%' },
            { rarity: 'LEGENDARY', name: 'โฮโลแกรมคอมมูนิเตเตอร์', stat: 'ลดภาษี 12%' },
        ]
    },
    pc: {
        title: "Computer Series",
        desc: "การประมวลผล & โบนัส",
        tiers: [
            { rarity: 'COMMON', name: 'พีซีสำนักงาน', stat: 'คริติคอล 1%' },
            { rarity: 'RARE', name: 'เครื่องเซิร์ฟเวอร์ขุด', stat: 'คริติคอล 2%' },
            { rarity: 'EPIC', name: 'ซูเปอร์คอมพิวเตอร์', stat: 'คริติคอล 4%' },
            { rarity: 'LEGENDARY', name: 'ควอนตัมคอมพิวเตอร์', stat: 'คริติคอล 6%' },
        ]
    },
    auto_excavator: {
        title: "Excavator Series",
        desc: "ผลผลิตสูงสุด & Jackpot",
        tiers: [
            { rarity: 'COMMON', name: 'รถขุดไฟฟ้า (Electric)', stat: 'Jackpot 2%' },
            { rarity: 'RARE', name: 'รถขุดไฟฟ้าหัวสว่าน', stat: 'Jackpot 5%' },
            { rarity: 'EPIC', name: 'รถขุดเลเซอร์ไฮบริด', stat: 'Jackpot 8%' },
            { rarity: 'LEGENDARY', name: 'รถขุดแม่เหล็กไฟฟ้า', stat: 'Jackpot 12%' },
        ]
    }
};

export const GLOVE_DETAILS: Record<string, { name: string }> = {
    COMMON: { name: 'ถุงมือทำงาน (WORK)' },
    RARE: { name: 'ถุงมือเสริมแรง (REINFORCED)' },
    SUPER_RARE: { name: 'ถุงมือยุทธวิธี (TACTICAL)' },
    EPIC: { name: 'ถุงมือพาวเวอร์ (POWER)' },
    LEGENDARY: { name: 'ถุงมืออินฟินิตี้ (INFINITY)' },
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

export const UPGRADE_REQUIREMENTS: Record<number, { matTier: number; matAmount: number; chance: number; label: string; catalyst?: number; maxBonus?: number; cost: number }> = {
    1: { matTier: 1, matAmount: 1, chance: 1.0, label: '+1 (ใช้หิน)', catalyst: 0, maxBonus: 0.5, cost: 10 },
    2: { matTier: 1, matAmount: 1, chance: 1.0, label: '+2 (ใช้หิน)', catalyst: 0, maxBonus: 1.0, cost: 20 },
    3: { matTier: 2, matAmount: 1, chance: 1.0, label: '+3 (ใช้ทองแดง)', catalyst: 1, maxBonus: 2.0, cost: 30 },
    4: { matTier: 2, matAmount: 1, chance: 0.8, label: '+4 (ใช้ทองแดง)', catalyst: 2, maxBonus: 3.5, cost: 50 },
};

export const UPGRADE_CONFIG = {
    CHIP_COST: 1,
    HIGH_LEVEL_THRESHOLD: 6,
    HIGH_RIG_PRICE_REQ: 2000,
};

export const MATERIAL_CONFIG = {
    MAX_CAPACITY: 1,
    DROP_CHANCE: 1.0, // Guaranteed drop when interval hits
    DROP_INTERVAL_MS: 72000000, // 20 Hours (20 * 60 * 60 * 1000)
    NAMES: {
        0: 'แร่ปริศนา',
        1: 'ถ่านหิน',
        2: 'ทองแดง',
        3: 'เหล็ก',
        4: 'ทองคำ',
        5: 'เพชร',
        6: 'น้ำมันดิบสังเคราะห์',
        7: 'ไวเบรเนียม',
        8: 'แร่ลึกลับ',
        9: 'แร่ในตำนาน',
    },
    PRICES: {
        0: 0,
        1: 10,
        2: 20,
        3: 35,
        4: 60,
        5: 120,
        6: 300,
        7: 1500,
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

export const EQUIPMENT_UPGRADE_CONFIG: Record<string, Record<number, { matTier: number; matAmount: number; chance: number; chipAmount: number; cost: number; bonusMultiplier: number }>> = {
    hat: {
        1: { matTier: 1, matAmount: 3, chipAmount: 1, cost: 5, chance: 1.0, bonusMultiplier: 1.10 },
        2: { matTier: 1, matAmount: 5, chipAmount: 2, cost: 10, chance: 0.8, bonusMultiplier: 1.25 },
        3: { matTier: 1, matAmount: 10, chipAmount: 3, cost: 20, chance: 0.6, bonusMultiplier: 1.50 },
        4: { matTier: 2, matAmount: 2, chipAmount: 5, cost: 50, chance: 0.4, bonusMultiplier: 1.80 },
        5: { matTier: 2, matAmount: 4, chipAmount: 10, cost: 100, chance: 0.2, bonusMultiplier: 2.50 },
    },
    uniform: {
        1: { matTier: 1, matAmount: 5, chipAmount: 2, cost: 15, chance: 1.0, bonusMultiplier: 1.10 },
        2: { matTier: 1, matAmount: 10, chipAmount: 4, cost: 30, chance: 0.8, bonusMultiplier: 1.25 },
        3: { matTier: 1, matAmount: 20, chipAmount: 6, cost: 60, chance: 0.6, bonusMultiplier: 1.50 },
        4: { matTier: 2, matAmount: 4, chipAmount: 8, cost: 120, chance: 0.4, bonusMultiplier: 1.80 },
        5: { matTier: 2, matAmount: 8, chipAmount: 15, cost: 250, chance: 0.2, bonusMultiplier: 2.50 },
    },
    bag: {
        1: { matTier: 3, matAmount: 2, chipAmount: 2, cost: 20, chance: 1.0, bonusMultiplier: 1.10 },
        2: { matTier: 3, matAmount: 4, chipAmount: 4, cost: 40, chance: 0.7, bonusMultiplier: 1.25 },
        3: { matTier: 3, matAmount: 8, chipAmount: 6, cost: 80, chance: 0.5, bonusMultiplier: 1.50 },
        4: { matTier: 4, matAmount: 1, chipAmount: 10, cost: 150, chance: 0.3, bonusMultiplier: 1.80 },
        5: { matTier: 4, matAmount: 3, chipAmount: 20, cost: 300, chance: 0.15, bonusMultiplier: 2.50 },
    },
    boots: {
        1: { matTier: 3, matAmount: 3, chipAmount: 3, cost: 30, chance: 1.0, bonusMultiplier: 1.10 },
        2: { matTier: 3, matAmount: 6, chipAmount: 6, cost: 60, chance: 0.7, bonusMultiplier: 1.25 },
        3: { matTier: 3, matAmount: 12, chipAmount: 9, cost: 120, chance: 0.5, bonusMultiplier: 1.50 },
        4: { matTier: 4, matAmount: 2, chipAmount: 15, cost: 250, chance: 0.3, bonusMultiplier: 1.80 },
        5: { matTier: 4, matAmount: 5, chipAmount: 25, cost: 500, chance: 0.15, bonusMultiplier: 2.50 },
    },
    glasses: {
        1: { matTier: 3, matAmount: 5, chipAmount: 4, cost: 40, chance: 1.0, bonusMultiplier: 1.10 },
        2: { matTier: 3, matAmount: 10, chipAmount: 8, cost: 80, chance: 0.7, bonusMultiplier: 1.25 },
        3: { matTier: 3, matAmount: 20, chipAmount: 12, cost: 160, chance: 0.5, bonusMultiplier: 1.50 },
        4: { matTier: 4, matAmount: 3, chipAmount: 20, cost: 350, chance: 0.3, bonusMultiplier: 1.80 },
        5: { matTier: 4, matAmount: 7, chipAmount: 35, cost: 700, chance: 0.15, bonusMultiplier: 2.50 },
    },
    mobile: {
        1: { matTier: 4, matAmount: 3, chipAmount: 5, cost: 100, chance: 1.0, bonusMultiplier: 1.10 },
        2: { matTier: 5, matAmount: 1, chipAmount: 10, cost: 200, chance: 0.6, bonusMultiplier: 1.25 },
        3: { matTier: 5, matAmount: 2, chipAmount: 15, cost: 400, chance: 0.4, bonusMultiplier: 1.50 },
        4: { matTier: 5, matAmount: 3, chipAmount: 25, cost: 800, chance: 0.25, bonusMultiplier: 1.80 },
        5: { matTier: 7, matAmount: 1, chipAmount: 50, cost: 1500, chance: 0.1, bonusMultiplier: 2.50 },
    },
    pc: {
        1: { matTier: 4, matAmount: 5, chipAmount: 8, cost: 150, chance: 1.0, bonusMultiplier: 1.10 },
        2: { matTier: 5, matAmount: 2, chipAmount: 16, cost: 300, chance: 0.6, bonusMultiplier: 1.25 },
        3: { matTier: 5, matAmount: 4, chipAmount: 24, cost: 600, chance: 0.4, bonusMultiplier: 1.50 },
        4: { matTier: 5, matAmount: 6, chipAmount: 40, cost: 1200, chance: 0.25, bonusMultiplier: 1.80 },
        5: { matTier: 7, matAmount: 2, chipAmount: 80, cost: 2500, chance: 0.1, bonusMultiplier: 2.50 },
    },
    auto_excavator: {
        1: { matTier: 4, matAmount: 10, chipAmount: 20, cost: 500, chance: 1.0, bonusMultiplier: 1.10 },
        2: { matTier: 5, matAmount: 5, chipAmount: 40, cost: 1000, chance: 0.6, bonusMultiplier: 1.25 },
        3: { matTier: 5, matAmount: 10, chipAmount: 60, cost: 2500, chance: 0.4, bonusMultiplier: 1.50 },
        4: { matTier: 7, matAmount: 2, chipAmount: 100, cost: 5000, chance: 0.25, bonusMultiplier: 1.80 },
        5: { matTier: 7, matAmount: 5, chipAmount: 200, cost: 10000, chance: 0.1, bonusMultiplier: 2.50 },
    }
};

// สูตรการแปรรูปวัตถุดิบ (Tier ทรัพยากรหลักที่กด -> สูตรและผลลัพธ์)
export const MATERIAL_RECIPES: Record<number, { ingredients: Record<number, number>; fee: number; requiredItem?: string }> = {
    1: { ingredients: { 1: 2 }, fee: 1, requiredItem: 'mixer' }, // Coal x2 + 1 Baht -> Copper
    2: { ingredients: { 1: 1, 2: 1 }, fee: 2, requiredItem: 'mixer' }, // Coal x1 + Copper x1 + 2 Baht -> Iron
    3: { ingredients: { 2: 1, 3: 1 }, fee: 3, requiredItem: 'mixer' }, // Copper x1 + Iron x1 + 3 Baht -> Gold
    4: { ingredients: { 2: 1, 3: 1, 4: 1 }, fee: 5, requiredItem: 'mixer' }, // Copper x1 + Iron x1 + Gold x1 + 5 Baht -> Diamond
    5: { ingredients: { 4: 1, 5: 1 }, fee: 10, requiredItem: 'mixer' }, // Gold x1 + Diamond x1 + 10 Baht -> Synthetic Oil
    6: { ingredients: { 1: 15, 2: 10, 3: 10, 4: 5, 5: 3, 6: 1 }, fee: 50, requiredItem: 'magnifying_glass' }, // Multi-mix -> Vibranium (Updated to require Magnifying Glass)
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
    { id: 1, name: 'พลั่วสนิมเขรอะ', price: 300, dailyProfit: 48, bonusProfit: 29, durationDays: 7, repairCost: 0, energyCostPerDay: 1, specialProperties: { infiniteDurability: true, noGift: true } },
    { id: 2, name: 'สว่านพกพา', price: 500, dailyProfit: 40, bonusProfit: 70, durationDays: 15, repairCost: 0, energyCostPerDay: 2, image: '/images/rigs/drill.png', description: 'สว่านมือถือสำหรับนักขุดมือใหม่', type: 'UNCOMMON', materialChance: 0.1, specialProperties: { infiniteDurability: true, noGift: true } },
    { id: 3, name: 'เครื่องขุดถ่านหิน', price: 1000, dailyProfit: 45, durationMonths: 1, repairCost: 60, energyCostPerDay: 3 },
    { id: 4, name: 'เครื่องขุดทองแดง', price: 1500, dailyProfit: 55, durationMonths: 2, repairCost: 120, energyCostPerDay: 6, image: '/images/rigs/copper_rig.png', description: 'เครื่องขุดขนาดกลาง ทำจากทองแดงทนทาน', type: 'SUPER_RARE', materialChance: 0.2 },
    { id: 5, name: 'เครื่องขุดเหล็ก', price: 2000, dailyProfit: 65, durationMonths: 3, repairCost: 180, energyCostPerDay: 10, type: 'EPIC' },
    { id: 6, name: 'เครื่องขุดทองคำ', price: 2500, dailyProfit: 75, durationMonths: 4, repairCost: 250, energyCostPerDay: 15, type: 'MYTHIC' },
    { id: 7, name: 'เครื่องขุดเพชร', price: 3000, dailyProfit: 90, durationMonths: 5, repairCost: 300, energyCostPerDay: 22, type: 'LEGENDARY' },
    {
        id: 8,
        name: 'เครื่องขุดปฏิกรณ์ไวเบรเนียม',
        price: 0,
        dailyProfit: 100,
        bonusProfit: 0,
        durationMonths: 12,
        repairCost: 500,
        energyCostPerDay: 50,
        craftingRecipe: {
            materials: { 7: 1, 8: 2, 9: 3 }
        },
        specialProperties: { infiniteDurability: false, zeroEnergy: false, maxAllowed: 1 },
        type: 'ULTRA_LEGENDARY'
    }
];

export const SLOT_EXPANSION_CONFIG: Record<number, { title: string; cost: number; mats: Record<number, number>; item?: string; itemCount?: number }> = {
    4: { title: 'โรงงานมาตรฐาน', cost: 2000, mats: { 3: 30, 4: 10 }, item: 'chest_key', itemCount: 1 },
    5: { title: 'อาณาจักรเหมือง', cost: 3000, mats: { 5: 10, 6: 5 }, item: 'upgrade_chip', itemCount: 5 },
    6: { title: 'ติดตั้ง Dimensional Warp Core', cost: 5000, mats: { 7: 1, 8: 1, 9: 1 }, item: undefined, itemCount: 0 },
};

export const TRANSACTION_LIMITS = {
    MIN: 100,
    MAX: 1000,
};

export const WITHDRAWAL_FEE_PERCENT = 0.05;

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
    COST_PER_UNIT: 0.02, // 2 Baht for 100 Units
    MIN_REFILL_FEE: 1.00,
};

export const MARKET_CONFIG = {
    UPDATE_INTERVAL_HOURS: 0.5, // Halved from 1
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
    { id: 'upgrade_chip', name: 'ชิปอัปเกรด', price: 5, icon: 'Cpu', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: 'ใช้สำหรับอัปเกรดระดับของถุงมือเพื่อเพิ่มโบนัสรายได้' },
    { id: 'chest_key', name: 'กุญแจไขหีบ', price: 5, icon: 'Key', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 365, description: 'ใช้ไขเปิดกล่องของขวัญที่ได้รับจากเครื่องจักรเพื่อลุ้นรับอุปกรณ์', buyable: false },
    { id: 'mixer', name: 'เครื่องผสมอนุภาค', price: 5, icon: 'Factory', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 365, description: 'ใช้ผสมวัตถุดิบระดับต่ำ 5 ชิ้น ให้เป็นระดับสูงขึ้น 1 ชิ้น' },
    { id: 'magnifying_glass', name: 'แว่นขยายส่องน้ำมัน', price: 5, icon: 'Search', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 365, description: 'ใช้ส่องตรวจสอบแร่ปริศนาหรือน้ำมันดิบเพื่อค้นหาไอเทมหายาก' },
    { id: 'robot', name: 'หุ่นยนต์ AI', price: 100, icon: 'Bot', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 30, description: 'ผู้ช่วยอัตโนมัติ: เก็บผลผลิต ซ่อมเครื่อง และจ่ายค่าไฟให้คุณ (อายุ 30 วัน)' },
    { id: 'insurance_card', name: 'ใบประกันความเสี่ยง', price: 300, icon: 'FileText', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 0, description: 'ใช้ป้องกันไอเทมลดระดับเมื่อตีบวกล้มเหลว (ใช้ 1 ใบต่อการตี 1 ครั้ง)', buyable: true },
    { id: 'ancient_blueprint', name: 'พิมพ์เขียวรถขุดโบราณ', price: 9999, icon: 'FileText', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: 'ใช้แทนน้ำมันดิบในการคราฟต์รถขุดระดับสูง', buyable: false },

    { id: 'hourglass_small', name: 'นาฬิกาทราย (เล็ก)', price: 5, icon: 'Hourglass', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: 'เร่งเวลาสำรวจเหมืองลับ 30 นาที (ใช้แล้วหมดไป)' },
    { id: 'hourglass_medium', name: 'นาฬิกาทราย (กลาง)', price: 20, icon: 'Hourglass', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: 'เร่งเวลาสำรวจเหมืองลับ 2 ชั่วโมง (ใช้แล้วหมดไป)' },
    { id: 'hourglass_large', name: 'นาฬิกาทราย (ใหญ่)', price: 60, icon: 'Hourglass', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: 'เร่งเวลาสำรวจเหมืองลับ 6 ชั่วโมง (ใช้แล้วหมดไป)' },

    { id: 'repair_kit', name: 'ชุดซ่อมแซมเต็มสูบ', price: 50, icon: 'Tool', minBonus: 0, maxBonus: 0, durationBonus: 0, lifespanDays: 999, description: 'ซ่อมแซมเครื่องจักรฟรี 100% (ใช้แล้วหมดไป)', buyable: false },

    {
        id: 'hat', name: 'หมวกนิรภัยมาตรฐาน', price: 50, icon: 'HardHat', minBonus: 0.1, maxBonus: 0.5, durationBonus: 1, lifespanDays: 15, tier: 1,
        craftingRecipe: { 1: 3 }, craftingFee: 10, craftDurationMinutes: 30, specialEffect: 'ลดค่าซ่อม -5%'
    },
    {
        id: 'uniform', name: 'ชุดหมีช่างกล', price: 120, icon: 'Shirt', minBonus: 0.5, maxBonus: 1.5, durationBonus: 3, lifespanDays: 30, tier: 1,
        craftingRecipe: { 1: 4, 2: 3 }, craftingFee: 10, craftDurationMinutes: 60, specialEffect: 'อายุใช้งาน +5 วัน'
    },
    {
        id: 'bag', name: 'กระเป๋าผ้าใบ', price: 200, icon: 'Backpack', minBonus: 1.0, maxBonus: 2.0, durationBonus: 5, lifespanDays: 45, tier: 2,
        craftingRecipe: { 2: 4, 3: 2 }, craftingFee: 20, craftDurationMinutes: 180, specialEffect: 'ราคาขาย +1%'
    },
    {
        id: 'boots', name: 'รองเท้าบูทกันน้ำ', price: 350, icon: 'Footprints', minBonus: 2.0, maxBonus: 3.0, durationBonus: 5, lifespanDays: 45, tier: 2,
        craftingRecipe: { 3: 5, 4: 2 }, craftingFee: 25, craftDurationMinutes: 300, specialEffect: 'โอกาสประหยัดไฟ 5%'
    },
    {
        id: 'glasses', name: 'แว่นตานิรภัยใส', price: 400, icon: 'Glasses', minBonus: 2.5, maxBonus: 3.5, durationBonus: 7, lifespanDays: 60, tier: 2,
        craftingRecipe: { 4: 3, 3: 4 }, craftingFee: 80, craftDurationMinutes: 420, buyable: false, specialEffect: 'โอกาสดรอป +2%'
    },
    {
        id: 'mobile', name: 'มือถือรุ่นปุ่มกด', price: 450, icon: 'Smartphone', minBonus: 3.0, maxBonus: 4.0, durationBonus: 7, lifespanDays: 60, tier: 2,
        craftingRecipe: { 5: 1, 4: 4 }, craftingFee: 120, craftDurationMinutes: 540, buyable: false, specialEffect: 'ลดภาษีตลาด 2%'
    },
    {
        id: 'pc', name: 'พีซีสำนักงาน', price: 500, icon: 'Monitor', minBonus: 4.0, maxBonus: 5.0, durationBonus: 7, lifespanDays: 60, tier: 3,
        craftingRecipe: { 5: 2, 4: 3 }, craftingFee: 180, craftDurationMinutes: 720, buyable: false, specialEffect: 'โอกาสเบิ้ลรายได้ 1%'
    },
    {
        id: 'auto_excavator', name: 'รถขุดไฟฟ้า (Electric)', price: 650, icon: 'Truck', minBonus: 10.0, maxBonus: 12.0, durationBonus: 0, lifespanDays: 120, tier: 3,
        craftingRecipe: { 6: 1, 5: 2 }, craftingFee: 500, craftDurationMinutes: 1440, buyable: false, specialEffect: 'โอกาส Jackpot 2%'
    }
];

export const DAILY_CHECKIN_REWARDS = [
    { day: 1, reward: 'money', amount: 10, label: '10 บาท' },
    { day: 2, reward: 'material', tier: 1, amount: 2, label: 'ถ่านหิน x2' },
    { day: 3, reward: 'money', amount: 15, label: '15 บาท' },
    { day: 4, reward: 'material', tier: 1, amount: 3, label: 'ถ่านหิน x3' },
    { day: 5, reward: 'money', amount: 20, label: '20 บาท' },
    { day: 6, reward: 'item', id: 'chest_key', amount: 1, label: 'กุญแจหีบ x1' },
    { day: 7, reward: 'item', id: 'chest_key', amount: 3, label: 'กุญแจหีบ x3', highlight: true },
    { day: 8, reward: 'money', amount: 25, label: '25 บาท' },
    { day: 9, reward: 'material', tier: 2, amount: 2, label: 'ทองแดง x2' },
    { day: 10, reward: 'money', amount: 30, label: '30 บาท' },
    { day: 11, reward: 'material', tier: 3, amount: 1, label: 'เหล็ก x1' },
    { day: 12, reward: 'money', amount: 35, label: '35 บาท' },
    { day: 13, reward: 'item', id: 'upgrade_chip', amount: 2, label: 'ชิป x2' },
    { day: 14, reward: 'material', tier: 4, amount: 1, label: 'ทองคำ x1', highlight: true },
    { day: 15, reward: 'money', amount: 40, label: '40 บาท' },
    { day: 16, reward: 'material', tier: 3, amount: 2, label: 'เหล็ก x2' },
    { day: 17, reward: 'material', tier: 2, amount: 5, label: 'ทองแดง x5' },
    { day: 18, reward: 'money', amount: 45, label: '45 บาท' },
    { day: 19, reward: 'material', tier: 3, amount: 2, label: 'เหล็ก x2' },
    { day: 20, reward: 'item', id: 'upgrade_chip', amount: 5, label: 'ชิป x5' },
    { day: 21, reward: 'item', id: 'upgrade_chip', amount: 15, label: 'ชิป x15', highlight: true },
    { day: 22, reward: 'money', amount: 50, label: '50 บาท' },
    { day: 23, reward: 'material', tier: 4, amount: 1, label: 'ทองคำ x1' },
    { day: 24, reward: 'item', id: 'chest_key', amount: 5, label: 'กุญแจ x5' },
    { day: 25, reward: 'money', amount: 60, label: '60 บาท' },
    { day: 26, reward: 'material', tier: 4, amount: 1, label: 'ทองคำ x1' },
    { day: 27, reward: 'item', id: 'mixer', amount: 1, label: 'เครื่องผสม' },
    { day: 28, reward: 'money', amount: 100, label: 'Jackpot 100 บาท', highlight: true },
    { day: 29, reward: 'material', tier: 4, amount: 1, label: 'ทองคำ x1' },
    { day: 30, reward: 'grand_prize', label: 'ใบประกันความเสี่ยง + เพชร', highlight: true, special: true },
];

export const VIP_TIERS = [
    { level: 0, minExp: 0, perk: 'สมาชิกทั่วไป', bonusDrop: 0 },
    { level: 1, minExp: 1000, perk: 'เพิ่มอัตราดรอป 5%', bonusDrop: 0.05 },
    { level: 2, minExp: 5000, perk: 'เพิ่มอัตราดรอป 10%', bonusDrop: 0.10 },
    { level: 3, minExp: 20000, perk: 'เพิ่มอัตราดรอป 15% + ส่วนลดร้านค้า 5%', bonusDrop: 0.15 },
    { level: 4, minExp: 50000, perk: 'เพิ่มอัตราดรอป 20% + ส่วนลดร้านค้า 10%', bonusDrop: 0.20 },
    { level: 5, minExp: 100000, perk: 'King of Mining (ดรอป +30%, ร้านค้า -15%)', bonusDrop: 0.30 },
];

export const QUESTS = [
    { id: 'q1', type: 'materials_crafted', target: 20, rewardType: 'points', rewardAmount: 20, title: 'นักเล่นแร่แปรธาตุ', desc: 'ผสมแร่ 20 ครั้ง' },
    { id: 'q2', type: 'spend', target: 5000, rewardType: 'points', rewardAmount: 30, title: 'นักช้อป', desc: 'ซื้อขาย/ใช้จ่าย 5,000 บาท' },
    { id: 'q3', type: 'dungeon', target: 30, rewardType: 'points', rewardAmount: 50, title: 'นักผจญภัย', desc: 'ลงดันเจี้ยน 30 รอบ' },
    { id: 'q4', type: 'items_crafted', target: 20, rewardType: 'points', rewardAmount: 40, title: 'ช่างฝีมือ', desc: 'คราฟต์ของ 20 ชิ้น' },
    { id: 'q5', type: 'repair', target: 100, rewardType: 'points', rewardAmount: 20, title: 'ช่างซ่อมบำรุง', desc: 'ซ่อมครบ 100 หน่วย (100%)' },
    { id: 'q6', type: 'rare_loot', target: 1, rewardType: 'points', rewardAmount: 60, title: 'ดวงดีมีชัย', desc: 'ได้กล่อง Rare+' },
];

export const MINING_RANKS = [
    { id: 'bronze', label: 'Bronze Miner', points: 100, rewardId: 'chest_key', amount: 5, buff: '', desc: 'ปลดล๊อครางวัล' },
    { id: 'silver', label: 'Silver Miner', points: 300, rewardId: null, amount: 0, buff: 'ค่าซ่อม -5%', desc: 'ลดค่าซ่อมเครื่องจักร 5% (30 วัน)' },
    { id: 'gold', label: 'Gold Miner', points: 600, rewardId: 'robot', amount: 1, buff: '', desc: 'หุ่นยนต์ AI (30 วัน)' },
    { id: 'platinum', label: 'Platinum Miner', points: 1000, rewardId: null, amount: 0, buff: 'ภาษีตลาด 12%', desc: 'ลดภาษีตลาดเหลือ 12% (30 วัน)' },
    { id: 'diamond', label: 'Diamond Miner', points: 1500, rewardId: null, amount: 0, buff: 'Craft Great Success +5%', desc: 'เพิ่มโอกาส Great Success +5% (30 วัน)' },
];

export const ACHIEVEMENTS = [
    { id: 'a1', type: 'materials_crafted', target: 50, points: 50, title: 'นักรีไซเคิล', desc: 'ใช้เครื่องผสมอนุภาคผสมแร่สำเร็จ 50 ครั้ง' },
    { id: 'a2', type: 'vip', target: 10000, points: 100, title: 'VIP Member', desc: 'สะสมยอดใช้จ่ายครบ 10,000 บาท' },
];

export const LUCKY_DRAW_CONFIG = {
    COST: 10,
    FREE_COOLDOWN_MS: 24 * 60 * 60 * 1000,
    PROBABILITIES: [
        { type: 'money', amount: 5, chance: 41, label: 'เงิน 5 บาท' },
        { type: 'material', chance: 15, label: 'แร่สุ่ม (หิน/ทองแดง/เหล็ก)' },
        { type: 'energy', amount: 50, chance: 30, label: 'พลังงาน 50%' },
        { type: 'item', chance: 13, label: 'ไอเทมสุ่ม (กุญแจ/ชิป/เครื่องผสม)' },
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
        name: 'เหมืองร้าง (Abandoned Mine)',
        description: 'เหมาะสำหรับผู้เริ่มต้น',
        cost: 100, // Updated 50 -> 100
        keyCost: 2, // Added Key Cost
        durationHours: 2,
        rewards: {
            common: [
                { tier: 1, amount: 10, chance: 50 }, // Coal x10
                { tier: 2, amount: 5, chance: 50 }   // Copper x5
            ],
            salt: [
                { tier: 1, amount: 5, chance: 100 } // Coal x5
            ],
            rare: [
                { itemId: 'chest_key', amount: 1, chance: 0.1 },
                { itemId: 'hourglass_small', amount: 1, chance: 0.1 },
                { itemId: 'upgrade_chip', amount: 1, chance: 0.1 }
            ]
        }
    },
    {
        id: 2,
        name: 'ถ้ำคริสตัล (Crystal Cave)',
        description: 'แหล่งทรัพยากรระดับกลาง',
        cost: 300, // Updated 200 -> 300
        keyCost: 10, // Added Key Cost
        durationHours: 6,
        rewards: {
            common: [
                { tier: 3, amount: 10, chance: 50 }, // Iron x10
                { tier: 4, amount: 5, chance: 50 }   // Gold x5
            ],
            salt: [
                { tier: 3, amount: 5, chance: 50 }, // Iron x5
                { tier: 1, amount: 5, chance: 50 }  // Coal x5
            ],
            rare: [
                { itemId: 'upgrade_chip', amount: 1, chance: 0.2 },
                { itemId: 'mixer', amount: 1, chance: 0.1 },
                { itemId: 'magnifying_glass', amount: 1, chance: 0.1 },
                { itemId: 'hourglass_medium', amount: 1, chance: 0.1 }
            ]
        }
    },
    {
        id: 3,
        name: 'ซากยานต่างดาว (Alien Ruins)',
        description: 'พื้นที่อันตรายสูงสุดสำหรับเศรษฐี',
        cost: 1000,
        durationHours: 12,
        rewards: {
            common: [
                { tier: 5, amount: 15, chance: 50 }, // Diamond x15
                { tier: 6, amount: 5, chance: 50 }   // Oil x5
            ],
            salt: [
                { tier: 5, amount: 5, chance: 100 } // Diamond x5
            ],
            rare: [
                { tier: 9, amount: 1, chance: 0.1 }, // Legendary Ore
                { tier: 8, amount: 1, chance: 0.1 }  // Mystery Ore
            ]
        }
    }
];
