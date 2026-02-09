
export type Rarity = 'COMMON' | 'RARE' | 'SUPER_RARE' | 'EPIC' | 'LEGENDARY';

export interface RigConfig {
  investment: number;
  durationMonths?: number;
  durationDays?: number;
}

export interface OilRig {
  id: string;
  ownerId: string;
  name: string;
  investment: number;
  durationMonths: number;
  durationDays?: number; // Added for shorter contracts
  dailyProfit: number;
  ratePerSecond: number;
  purchasedAt: number;
  lastClaimAt: number;
  lastGiftAt?: number;
  lastRepairAt?: number;
  bonusProfit: number;
  rarity: Rarity;
  expiresAt: number;
  renewalCount?: number;
  currentMaterials?: number;
  lastCollectionAt?: number;
  repairCost: number;
  energyCostPerDay: number;
  energy: number;
  lastEnergyUpdate?: number;
  slots?: (string | null)[]; // Index 0 is reserved for Glove
  explorationEnd?: number; // Timestamp when dungeon exploration ends
}

export interface AccessoryItem {
  id: string;
  typeId: string;
  itemId?: string; // Add for API compatibility
  name: string;
  price: number;
  dailyBonus: number;
  durationBonus: number;
  rarity: Rarity;
  purchasedAt: number;
  lifespanDays: number;
  expireAt: number;
  level?: number; // Upgrade Level
  isHandmade?: boolean; // New: Great Success flag
  specialEffect?: string; // New: Description of the specific effect
}

export interface CraftingQueueItem {
  id: string;
  itemId: string;
  startedAt: number;
  finishAt: number;
  isClaimed: boolean;
}

export interface WalletState {
  balance: number;
}

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserStats {
  totalMaterialsMined: number;
  totalMoneySpent: number;
  totalLogins: number;
  luckyDraws: number;
  questsCompleted: number;
  // New metrics for missions
  materialsCrafted?: number;
  dungeonsEntered?: number;
  itemsCrafted?: number;
  repairPercent?: number; // Accumulated percentage repaired (units)
  rareLootCount?: number;
  totalDeposited?: number; // New: Total amount deposited from real money
  withdrawalHistory?: WithdrawalRequest[]; // New: History of approved withdrawals
}

export interface Expedition {
  dungeonId: number;
  rigId: string;
  startTime: number;
  endTime: number;
  isCompleted: boolean;
}

export interface User {
  id: string;
  username: string;
  password: string;
  pin: string;
  role: UserRole;
  balance: number;
  createdAt: number;
  lastLogin?: number;
  bankQrCode?: string;
  // Inventory & Queue
  inventory: AccessoryItem[];
  craftingQueue?: CraftingQueueItem[];
  lastEquipmentClaimAt?: number;

  // Resources
  materials?: Record<number, number>;
  energy: number;
  lastEnergyUpdate?: number;
  overclockEnergy?: number;
  isOverclockActive?: boolean;
  lastOverclockUpdate?: number;
  demoStartTime?: number;
  isDemo?: boolean;

  // Game State
  unlockedSlots?: number;
  masteryPoints?: number;
  claimedRanks: string[];
  checkInStreak?: number;
  lastCheckIn?: number;
  lastLuckyDraw?: number;
  claimedQuests?: string[];
  claimedAchievements?: string[];
  isBanned?: boolean;

  // Session
  sessionExpiry?: number;
  lastLoginDate?: string;
  consecutiveLoginDays?: number;
  dailyGiftClaimed?: boolean;


  // Social
  referralCode?: string;
  referredBy?: string;
  referralEarnings?: number;
  vipExp?: number;
  notifications: Notification[];

  // Complex Objects
  stats: UserStats;
  weeklyStats?: UserStats; // New: Weekly stats for quest tracking
  lastQuestReset?: number; // New: Timestamp of last weekly reset
  activeExpedition?: {
    dungeonId: number;
    rigId: string;
    startTime: number;
    endTime: number;
    isCompleted: boolean;
  } | null;

  // Admin Dashboard Aggregated Stats
  totalDeposits?: number;
  totalWithdrawals?: number;
  pendingWithdrawalsCount?: number;
  pendingDepositsCount?: number;

  // Overclock
  overclockExpiresAt?: number;
  walletAddress?: string; // BSC Wallet Address for USDT
}

export interface ClaimRequest {
  id: string;
  userId: string;
  username: string;
  rigId: string;
  rigName: string;
  amount: number;
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  transactionId?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  slipImage: string;
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  transactionId?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  method?: 'BANK' | 'USDT';
  walletAddress?: string;
  bankQrCode?: string;
  transactionId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title?: string;
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO';
  read: boolean;
  timestamp: number;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'MINING_CLAIM' | 'ASSET_PURCHASE' | 'REFUND' | 'ACCESSORY_PURCHASE' | 'ACCESSORY_SELL' | 'ACCESSORY_UPGRADE' | 'ACCESSORY_CRAFT' | 'EQUIPMENT_CLAIM' | 'RIG_RENEWAL' | 'REPAIR' | 'MATERIAL_SELL' | 'MATERIAL_BUY' | 'MATERIAL_CRAFT' | 'ENERGY_REFILL' | 'REFERRAL_BONUS' | 'DAILY_BONUS' | 'QUEST_REWARD' | 'LUCKY_DRAW' | 'SLOT_EXPANSION' | 'DUNGEON_ENTRY' | 'DUNGEON_REWARD' | 'RANK_REWARD' | 'GIFT_CLAIM' | 'MINING_REVENUE' | 'COMPENSATION' | 'MARKET_TAX' | 'MATERIAL_MINED';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  timestamp: number;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  description: string;
}

export interface SystemConfig {
  receivingQrCode?: string;
  isMaintenanceMode?: boolean; // New: Maintenance toggle
}

export type MarketTrend = 'UP' | 'DOWN' | 'STABLE';

export interface MarketItemData {
  basePrice: number;
  currentPrice: number;
  multiplier: number;
  trend: MarketTrend;
  history: number[];
}

export interface MarketState {
  trends: Record<number, MarketItemData>;
  nextUpdate: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  role: UserRole;
  message: string;
  timestamp: number;
  isVip?: boolean;
}
