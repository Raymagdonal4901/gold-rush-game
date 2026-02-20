import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Users, LayoutDashboard, Hammer, Coins, LogOut, Search, ShieldCheck, ShieldAlert, Info, Bell, CheckCircle, XCircle, FileText, ChevronRight, X, ArrowUpRight, ArrowDownLeft, AlertTriangle, QrCode, Upload, Save, CheckCircle2, AlertCircle as AlertCircleIcon, Download, Wallet, Trash2, Check, TrendingUp, CreditCard, Clock, Zap, Briefcase, Star, HardHat, Glasses, Shirt, Backpack, Footprints, Smartphone, Monitor, Bot, Truck, Cpu, Copy } from 'lucide-react';
import { MockDB } from '../services/db';
import { api } from '../services/api';
import { User, OilRig, ClaimRequest, WithdrawalRequest, Withdrawal, DepositRequest, Notification } from '../services/types';
import { CURRENCY, SHOP_ITEMS, MATERIAL_CONFIG, EXCHANGE_RATE_USD_THB, EXCHANGE_RATE_USDT_THB, RIG_PRESETS } from '../constants';
import { ChatSystem } from './ChatSystem';
import { useTranslation } from '../contexts/LanguageContext';
import { StatCard } from './StatCard';
import { AdminRevenuePage } from './AdminRevenuePage';

interface AdminDashboardProps {
    currentUser: User;
    onLogout: () => void;
    onSwitchToPlayer: () => void;
    onBack?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onLogout, onSwitchToPlayer, onBack }) => {
    const { t, getLocalized, language } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [rigs, setRigs] = useState<OilRig[]>([]);
    const [pendingClaims, setPendingClaims] = useState<ClaimRequest[]>([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState<Withdrawal[]>([]);
    const [pendingDeposits, setPendingDeposits] = useState<DepositRequest[]>([]); // New Phase 1
    const [allDeposits, setAllDeposits] = useState<DepositRequest[]>([]);
    const [stats, setStats] = useState<{ totalUsers: number, totalRigs: number, pendingWithdrawalsCount: number } | null>(null);
    const [search, setSearch] = useState('');
    const [globalRevenue, setGlobalRevenue] = useState<{
        totals: {
            RIG_BUY: number;
            REPAIR: number;
            WITHDRAW_FEE: number;
            MARKET_FEE: number;
            ITEM_BUY: number;
            GAME_LOSS: number;
            ENERGY_REFILL: number;
            total: number;
        };
        volumes?: {
            bank_deposits: number;
            usdt_deposits: number;
            bank_withdrawals: number;
            usdt_withdrawals: number;
        };
    } | null>(null);

    // Notifications
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Status State
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // System Config State
    const [systemQr, setSystemQr] = useState<string | null>(null);
    const [isMaintenance, setIsMaintenance] = useState(false); // New
    const [systemUsdtWallet, setSystemUsdtWallet] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Game Config State
    const [gameConfig, setGameConfig] = useState({
        dropRate: 5,
        taxRate: 15,
        repairCost: 1.0
    });

    const handleConfigChange = (key: keyof typeof gameConfig, value: number) => {
        setGameConfig(prev => ({ ...prev, [key]: value }));
    };

    // User Details Modal State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showAudit, setShowAudit] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [userStats, setUserStats] = useState<{
        totalDeposits: number;
        totalWithdrawals: number;
        revenue?: {
            energy_items: number;
            market_fees: number;
            withdrawal_fees: number;
            repair_fees: number;
            total: number;
        };
        withdrawalHistory?: Withdrawal[];
        depositHistory?: DepositRequest[];
    } | null>(null);

    // Economy Control State
    const [economyForm, setEconomyForm] = useState({
        targetUser: '', // Username or ID
        itemId: 'mobile_rig',
        itemAmount: 1,
        compUser: '',
        compAmount: 0,
        compReason: t('admin.adjust_reason_default'),
        compScope: 'SINGLE' as 'SINGLE' | 'ALL',
        itemScope: 'SINGLE' as 'SINGLE' | 'ALL',
        message: '' // Custom message for items
    });
    const [compCurrency, setCompCurrency] = useState<'THB' | 'USDT'>('THB');
    const [adjustForm, setAdjustForm] = useState({
        amount: 0,
        reason: t('admin.adjust_reason_default')
    });

    // View State
    const [activeView, setActiveView] = useState<'DASHBOARD' | 'REVENUE'>('DASHBOARD');

    // Confirmation Modal State
    const [confirmAction, setConfirmAction] = useState<{
        type: 'CLAIM' | 'WITHDRAWAL' | 'DEPOSIT';
        id: string;
        action: 'APPROVED' | 'REJECTED';
        details: string;
        amount: number;
    } | null>(null);
    const [isAddingRig, setIsAddingRig] = useState(false);
    const [addingRigPresetId, setAddingRigPresetId] = useState<number>(1);

    // USDT Search State
    const [usdtSearchWallet, setUsdtSearchWallet] = useState('');
    const [usdtSearchResults, setUsdtSearchResults] = useState<DepositRequest[]>([]);
    const [isSearchingUsdt, setIsSearchingUsdt] = useState(false);

    const [depositSearch, setDepositSearch] = useState('');
    const [showAllDeposits, setShowAllDeposits] = useState(true);
    const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);
    const [withdrawalSearch, setWithdrawalSearch] = useState('');
    const [showAllWithdrawals, setShowAllWithdrawals] = useState(true);

    // Referral Network State
    const [referralDetailTab, setReferralDetailTab] = useState<'GENERAL' | 'NETWORK'>('GENERAL');
    const [networkData, setNetworkData] = useState<{
        network?: {
            l1: any[];
            l2: any[];
            l3: any[];
        };
        actualCounts?: {
            l1: number;
            l2: number;
            l3: number;
            total: number;
        };
    } | null>(null);
    const [isFetchingNetwork, setIsFetchingNetwork] = useState(false);

    // Initial Load
    useEffect(() => {
        console.log("AdminDashboard mounted - Force Refresh for All Withdrawals");
        setWithdrawalSearch('');
        refreshData();
    }, []);

    // Polling
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData(true);
        }, 10000); // Poll every 10 seconds (increased from 3s to prevent overload)

        return () => clearInterval(interval);
    }, []); // Empty dependency array for polling interval to prevent re-creation

    const refreshData = async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            setFetchError(null);

            // Fetch data with individual error handling to prevent dashboard crash
            const fetchSafe = async (fn: () => Promise<any>, fallback: any) => {
                try {
                    return await fn();
                } catch (e) {
                    console.error("Partial fetch error:", e);
                    return fallback;
                }
            };

            const [
                fetchedUsers,
                fetchedRigs,
                config,
                claims,
                withdrawals,
                deposits,
                fetchedAllDeposits,
                fetchedAllWithdrawals,
                revenue,
                dashboardStats,
                revenueStats
            ] = await Promise.all([
                fetchSafe(() => api.admin.getUsers(), []),
                fetchSafe(() => api.admin.getRigs(), []),
                fetchSafe(() => api.admin.getSystemConfig(), {}),
                fetchSafe(() => api.admin.getPendingClaims(), []),
                fetchSafe(() => api.admin.getPendingWithdrawals(), []),
                fetchSafe(() => api.admin.getPendingDeposits(), []),
                fetchSafe(() => api.admin.getAllDeposits(), []),
                fetchSafe(() => api.admin.getAllWithdrawals(), []),
                fetchSafe(() => api.admin.getGlobalRevenue(), null),
                fetchSafe(() => api.admin.getDashboardStats(), null),
                fetchSafe(() => api.admin.getRevenueStats(), null)
            ]);

            setUsers(fetchedUsers);
            setRigs(fetchedRigs || []);
            setPendingClaims(claims || []);
            setPendingWithdrawals(withdrawals || []);
            setPendingDeposits(deposits || []);
            setAllDeposits(fetchedAllDeposits || []);


            // Fallback: If getAllWithdrawals returns empty but we have pending, show pending at least
            console.log('[DEBUG] fetchedAllWithdrawals:', fetchedAllWithdrawals);
            console.log('[DEBUG] pendingWithdrawals (fallback):', withdrawals);

            const finalAllWithdrawals = (fetchedAllWithdrawals && fetchedAllWithdrawals.length > 0)
                ? fetchedAllWithdrawals
                : (withdrawals || []);

            setAllWithdrawals(finalAllWithdrawals);
            setGlobalRevenue(revenueStats); // Use the new comprehensive revenue stats
            setStats(dashboardStats);

            if (config) {
                setSystemQr(config.receivingQrCode || null);
                setSystemUsdtWallet(config.usdtWalletAddress || '');
                setIsMaintenance(config.isMaintenanceMode || false);
            }

        } catch (error: any) {
            console.error("Failed to fetch admin data", error);
            setFetchError(error.message || t('admin.fetch_error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUsdtLookup = async () => {
        if (!usdtSearchWallet) return;
        try {
            setIsSearchingUsdt(true);
            const results = await api.admin.lookupUSDTDeposit(usdtSearchWallet);
            setUsdtSearchResults(results);
            if (results.length === 0) {
                alert(t('admin.no_data') || 'No USDT deposits found for this wallet.');
            }
        } catch (error) {
            console.error("USDT lookup failed", error);
            alert(t('admin.process_error') || 'Failed to search for USDT deposits.');
        } finally {
            setIsSearchingUsdt(false);
        }
    };

    const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                try {
                    await api.admin.updateSystemConfig({ receivingQrCode: base64 });
                    setSystemQr(base64);
                    alert(t('admin.qr_update_success'));
                } catch (error) {
                    console.error("Failed to upload QR", error);
                    alert(t('admin.upload_error'));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleMaintenance = async () => {
        const newState = !isMaintenance;
        try {
            await api.admin.updateSystemConfig({ isMaintenanceMode: newState });
            setIsMaintenance(newState);
            alert(`${t('admin.server_status')}: ${newState ? t('admin.status_maintenance') : t('admin.status_online')}`);
        } catch (error) {
            console.error("Failed to update maintenance mode", error);
            alert(t('admin.status_update_error'));
        }
    };

    const handleUpdateUsdtWallet = async () => {
        try {
            await api.admin.updateSystemConfig({ usdtWalletAddress: systemUsdtWallet });
            alert(t('admin.config_saved') || 'USDT Wallet Address updated successfully.');
        } catch (error) {
            console.error("Failed to update USDT wallet", error);
            alert(t('admin.process_error'));
        }
    };

    const handleBanUser = async (userId: string) => {
        if (confirm(t('admin.ban_confirm'))) {
            try {
                await api.admin.toggleBan(userId);
                refreshData();
                if (selectedUser?.id === userId) setSelectedUser(prev => prev ? ({ ...prev, isBanned: true }) : null);
                alert(t('admin.ban_success'));
            } catch (error) {
                console.error("Failed to ban user", error);
                alert(t('admin.process_error'));
            }
        }
    };

    const handleUnbanUser = async (userId: string) => {
        if (confirm(t('admin.unban_confirm'))) {
            try {
                await api.admin.toggleBan(userId);
                refreshData();
                if (selectedUser?.id === userId) setSelectedUser(prev => prev ? ({ ...prev, isBanned: false }) : null);
                alert(t('admin.unban_success'));
            } catch (error) {
                console.error("Failed to unban user", error);
                alert(t('admin.process_error'));
            }
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm(t('admin.delete_user_confirm'))) return;

        try {
            await api.admin.deleteUser(userId);
            refreshData();
            setSelectedUser(null);
            alert(t('admin.delete_user_success'));
        } catch (error) {
            console.error("Failed to delete user", error);
            alert(t('admin.process_error'));
        }
    };

    const handleResetUser = async (userId: string) => {
        if (!confirm(t('admin.reset_confirm'))) return;

        try {
            await api.admin.resetUser(userId);
            refreshData();
            alert(t('admin.reset_success'));
            // Re-fetch user stats if modal is open
            if (selectedUser?.id === userId) {
                const updatedUser = users.find(u => u.id === userId);
                if (updatedUser) {
                    setSelectedUser({ ...updatedUser, balance: 0 });
                    setUserStats({ totalDeposits: 0, totalWithdrawals: 0 });
                }
            }
        } catch (error) {
            console.error("Failed to reset user", error);
            alert(t('admin.reset_error'));
        }
    };

    const handleRemoveVip = async (userId: string) => {
        if (!confirm(t('admin.remove_vip_confirm'))) return;

        try {
            await api.admin.removeVip(userId);
            refreshData();
            alert(t('admin.remove_vip_success'));
            if (selectedUser?.id === userId) {
                setSelectedUser(prev => prev ? ({
                    ...prev,
                    inventory: prev.inventory.filter((i: any) => i.typeId !== 'vip_withdrawal_card')
                }) : null);
            }
        } catch (error) {
            console.error("Failed to remove VIP", error);
            alert(t('admin.remove_vip_error'));
        }
    };

    const handleDeleteRig = async (rigId: string) => {
        if (!confirm(t('common.delete_machine_confirm'))) return;

        try {
            await api.admin.deleteRig(rigId);
            refreshData();
            // Update selected user view if open
            if (selectedUser) {
                setRigs(prev => prev.filter(r => r.id !== rigId));
                alert(t('common.add_success'));
            }
        } catch (error) {
            console.error("Failed to delete rig", error);
            alert(t('admin.process_error'));
        }
    };

    const handleClearRevenue = async () => {
        if (!confirm(t('admin.clear_revenue_confirm'))) return;

        try {
            await api.admin.clearGlobalRevenue();
            refreshData();
            alert(t('admin.clear_revenue_success'));
        } catch (error) {
            console.error("Failed to clear revenue", error);
            alert(t('admin.process_error'));
        }
    };

    const handleAdjustRevenue = async () => {
        if (!adjustForm.amount) return;
        try {
            await api.admin.adjustGlobalRevenue(adjustForm.amount, adjustForm.reason);
            alert(t('admin.adjust_success'));
            setAdjustForm({ amount: 0, reason: t('admin.adjust_reason_default') || 'Manual Adjustment' });
            refreshData();
        } catch (error) {
            console.error("Failed to adjust revenue", error);
            alert(t('admin.process_error'));
        }
    };

    const handleConvertCurrency = async () => {
        if (!confirm(t('admin.convert_thb_confirm'))) return;

        try {
            await api.admin.convertCurrencyToUSD();
            refreshData();
            alert(t('admin.convert_usd_success'));
        } catch (error) {
            console.error("Failed to convert currency", error);
            alert(t('admin.process_error'));
        }
    };

    const fetchReferralNetwork = async (code: string) => {
        try {
            setIsFetchingNetwork(true);
            const data = await api.admin.getUserReferralNetwork(code);
            setNetworkData(data);
        } catch (error) {
            console.error("Failed to fetch referral network", error);
            alert("Failed to fetch referral network data");
        } finally {
            setIsFetchingNetwork(false);
        }
    };

    const handleSelectUser = async (user: User) => {
        setSelectedUser(user);
        setReferralDetailTab('GENERAL');
        setNetworkData(null);
        setEconomyForm(prev => ({ ...prev, targetUser: user.id, compUser: user.id }));
        try {
            const stats = await api.admin.getUserStats(user.id);
            setUserStats(stats);
        } catch (error) {
            console.error("Failed to fetch user stats", error);
        }
    };

    const handleResetAllPlayerData = async () => {
        if (!confirm(t('admin.reset_all_confirm'))) return;

        try {
            const res = await api.admin.resetAllPlayerData();
            refreshData();
            alert(`${t('admin.reset_balances_success')} (อัปเดต ${res.count} บัญชี)`);
        } catch (error) {
            console.error("Failed to reset player data", error);
            alert(t('admin.process_error'));
        }
    };

    const handleDeleteAllUsers = async () => {
        if (!confirm(t('admin.delete_all_users_confirm'))) return;
        if (!confirm("Are you ABSOLUTELY sure? This will PERMANENTLY delete all users and their data. This action is IRREVERSIBLE.")) return;
        const confirmText = prompt("Type 'DELETE ALL PLAYERS' below to confirm mass deletion:");
        if (confirmText !== 'DELETE ALL PLAYERS') {
            alert("Deletion cancelled. Confirmation text did not match.");
            return;
        }

        try {
            await api.admin.deleteAllUsers();
            refreshData();
            alert(t('admin.reset_balances_success'));
        } catch (error) {
            console.error("Failed to delete all users", error);
            alert(t('admin.process_error'));
        }
    };

    const handleAdminAddRig = async () => {
        if (!selectedUser) return;
        try {
            await api.admin.addRig(selectedUser.id, addingRigPresetId);
            setIsAddingRig(false);
            alert(t('common.add_success'));
            // Refresh rigs
            const updatedRigs = await api.admin.getRigs();
            setRigs(updatedRigs);
        } catch (error) {
            console.error("Failed to add rig", error);
            alert(t('admin.process_error'));
        }
    };

    const initiateProcessClaim = (claim: ClaimRequest, status: 'APPROVE' | 'REJECT') => {

        setConfirmAction({
            type: 'CLAIM',
            id: claim.id,
            action: status,
            details: `เก็บผลผลิตจาก ${claim.rigName} โดย ${claim.username}`,
            amount: claim.amount
        });
    };

    const handleAddItem = async () => {
        if (economyForm.itemScope === 'SINGLE' && !economyForm.targetUser) {
            alert('กรุณาระบุไอดีผู้ใช้ (Please specify a target user ID)');
            return;
        }
        if (economyForm.itemAmount <= 0) {
            alert('กรุณาระบุจำนวนที่ถูกต้อง (Please enter a valid amount)');
            return;
        }
        if (!economyForm.itemId) {
            alert('กรุณาเลือกไอเทม (Please select an item)');
            return;
        }

        const targetLabel = economyForm.itemScope === 'ALL' ? 'Everyone' : economyForm.targetUser;
        if (!confirm(`Send ${economyForm.itemAmount}x [${economyForm.itemId}] to ${targetLabel}?`)) return;

        try {
            const target = economyForm.itemScope === 'ALL' ? 'ALL' : economyForm.targetUser;
            await api.admin.addItem(target, economyForm.itemId, economyForm.itemAmount, economyForm.message);
            alert(t('admin.item_send_success'));
            setEconomyForm(prev => ({ ...prev, targetUser: '', itemAmount: 1, message: '' }));
            refreshData();
        } catch (error) {
            console.error(error);
            alert(t('admin.item_send_error'));
        }
    };

    const handleGiveCompensation = async () => {
        if (economyForm.compScope === 'SINGLE' && !economyForm.compUser) {
            alert('กรุณาระบุไอดีผู้ใช้ (Please specify a target user ID)');
            return;
        }
        if (economyForm.compAmount <= 0) {
            alert('กรุณาระบุจำนวนที่ถูกต้อง (Please enter a valid amount)');
            return;
        }

        let finalAmount = economyForm.compAmount;
        let currencyLabel = 'บาท';

        if (compCurrency === 'USDT') {
            finalAmount = economyForm.compAmount * EXCHANGE_RATE_USDT_THB;
            currencyLabel = `USDT (~${finalAmount.toLocaleString()} ${CURRENCY})`;
        }

        const targetLabel = economyForm.compScope === 'ALL' ? 'ผู้เล่นทุกคนในเซิร์ฟเวอร์ (All Users)' : economyForm.compUser;
        if (!confirm(`ยืนยันการชดเชยเงิน ${economyForm.compAmount.toLocaleString()} ${currencyLabel} ให้กับ ${targetLabel}?`)) return;

        try {
            if (economyForm.compScope === 'ALL') {
                await api.admin.giveCompensationAll(finalAmount, economyForm.compReason);
            } else {
                await api.admin.giveCompensation(economyForm.compUser, finalAmount, economyForm.compReason);
            }
            alert(t('admin.comp_send_success'));
            // Clear fields on success
            setEconomyForm(prev => ({ ...prev, compUser: '', compAmount: 0, targetUser: '' }));
            refreshData();
        } catch (error) {
            console.error(error);
            alert(t('admin.comp_send_error'));
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        try {
            if (confirmAction.type === 'WITHDRAWAL') {
                await api.admin.processWithdrawal(confirmAction.id, confirmAction.action);
            } else if (confirmAction.type === 'DEPOSIT') {
                await api.admin.processDeposit(confirmAction.id, confirmAction.action);
            } else if (confirmAction.type === 'CLAIM') {
                // handle claim if API exists...
                alert(t('admin.process_error'));
            }
            alert(confirmAction.action === 'APPROVE' ? t('admin.approved_success') : t('admin.rejected_success'));
        } catch (error: any) {
            console.error('[DEBUG] Action Error:', error);
            const msg = error.response?.data?.message || error.message || t('admin.process_error');
            alert(`Error: ${msg}`);
        }
        setConfirmAction(null);
        refreshData();
    };

    const initiateProcessWithdrawal = (w: Withdrawal, status: 'APPROVE' | 'REJECT') => {
        setConfirmAction({
            type: 'WITHDRAWAL',
            id: w.id,
            action: status,
            details: `คำร้องถอนเงินโดย ${w.user?.username || 'Unknown'}`,
            amount: w.amount
        });
    };

    const initiateProcessDeposit = (d: DepositRequest, status: 'APPROVE' | 'REJECT') => {
        setConfirmAction({
            type: 'DEPOSIT',
            id: d.id,
            action: status,
            details: `คำร้องฝากเงินโดย ${d.username}`,
            amount: d.amount
        });
    };

    const handleDirectProcessDeposit = async (id: string, status: 'APPROVE' | 'REJECT') => {
        try {
            await api.admin.processDeposit(id, status);
            refreshData();
            alert(status === 'APPROVE' ? t('admin.approved_success') : t('admin.rejected_success'));
        } catch (error: any) {
            console.error("Failed to process deposit", error);
            alert(t('admin.process_error'));
        }
    };

    const downloadQr = (base64: string, username: string) => {
        const link = document.createElement('a');
        link.href = base64;
        link.download = `QR_${username}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalInvestment = rigs.reduce((acc, r) => acc + r.investment, 0);

    const getRigsForUser = (userId: string) => rigs.filter(r => r.ownerId === userId);
    const getDailyProfitForUser = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return 0;

        const userRigs = getRigsForUser(userId);
        const userInventory = user.inventory || [];

        // Multipliers (Synced with PlayerDashboard)
        const hasVibranium = userInventory.some((i: any) => i.typeId === 'vibranium' && (!i.expireAt || i.expireAt > Date.now()));
        const globalMultiplier = hasVibranium ? 2 : 1;

        const isOverclockActive = user.overclockExpiresAt ? new Date(user.overclockExpiresAt).getTime() > Date.now() : false;
        const overclockMultiplier = isOverclockActive ? (userRigs.length <= 2 ? 1.1 : userRigs.length <= 4 ? 1.25 : 1.4) : 1;

        const dailyProfitSum = userRigs.reduce((acc, r) => {
            const nameStr = typeof r.name === 'string' ? r.name : (r.name?.en || r.name?.th || '');
            const isNoBonusRig = ['พลั่วสนิมเขรอะ', 'สว่านพกพา', 'Rusty Shovel', 'Portable Drill'].includes(nameStr);

            // Legacy Scale Fallback: If profit is tiny (< 5), it's likely old USD scale
            const baseDailyProfit = (r.dailyProfit < 5 && r.dailyProfit > 0) ? r.dailyProfit * 35 : r.dailyProfit;
            const effectiveBonusProfit = isNoBonusRig ? 0 : (r.bonusProfit || 0);

            let equippedBonus = 0;
            if (r.slots) {
                r.slots.forEach(slotItemId => {
                    if (slotItemId) {
                        const item = userInventory.find((i: any) => i.id === slotItemId);
                        if (item) {
                            const effectiveItemBonus = (item.dailyBonus < 0.5 && item.dailyBonus > 0) ? item.dailyBonus * 35 : item.dailyBonus;
                            equippedBonus += effectiveItemBonus;
                        }
                    }
                });
            }

            return acc + (baseDailyProfit + effectiveBonusProfit + equippedBonus);
        }, 0);

        return Math.floor(dailyProfitSum * globalMultiplier * overclockMultiplier);
    };

    const totalDailyProduction = users.reduce((sum, u) => sum + getDailyProfitForUser(u.id), 0);
    const totalUserBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.id && u.id.toString().toLowerCase().includes(search.toLowerCase()))
    );

    if (isLoading && users.length === 0) {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
                <div className="text-yellow-500 font-display animate-pulse uppercase tracking-widest text-sm">{t('common.loading')}...</div>
            </div>
        );
    }

    if (fetchError && users.length === 0) {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 mb-6 rounded-full bg-red-900/20 flex items-center justify-center border-2 border-red-500/50 text-red-500">
                    <AlertTriangle size={40} />
                </div>
                <h1 className="text-2xl font-display font-bold text-white mb-2 uppercase">{t('admin.fetch_error')}</h1>
                <p className="text-stone-400 max-w-md mx-auto mb-8 font-mono text-sm">{fetchError}</p>
                <div className="flex gap-4">
                    <button onClick={refreshData} className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-stone-900 font-bold rounded shadow-lg transition-all flex items-center gap-2">
                        {t('common.retry')}
                    </button>
                    <button onClick={onLogout} className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded transition-colors">
                        {t('settings.logout')}
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-stone-950 text-stone-200 font-sans relative">

            {/* Toast Notifications */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className="pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-2xl border backdrop-blur-md animate-in slide-in-from-right duration-500 fade-in w-80 bg-stone-900/90 border-yellow-600/50">
                        <div className="p-1 rounded-full bg-yellow-500/20 text-yellow-400">
                            <Bell size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-yellow-400">{t('admin.new_notification')}</h4>
                            <p className="text-xs text-stone-300 mt-1">{n.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal Overlay */}
            {confirmAction && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-stone-900 border border-stone-700 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100">
                        <div className="p-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 
                          ${confirmAction.action === 'APPROVED' ? 'bg-emerald-900/30 border-emerald-500/20 text-emerald-500' : 'bg-red-900/30 border-red-500/20 text-red-500'}`}>
                                {confirmAction.action === 'APPROVED' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">
                                {t('admin.approve')}
                                /
                                {t('admin.reject')}?
                            </h3>
                            <p className="text-stone-400 text-sm mb-4">
                                {confirmAction.details}
                            </p>

                            <div className="bg-stone-950 p-3 rounded border border-stone-800 mb-6">
                                <div className="text-xs text-stone-500 uppercase tracking-wider">{t('admin.amount_label')}</div>
                                <div className="text-2xl font-mono font-bold text-white">
                                    {confirmAction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {CURRENCY}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    className="py-3 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    className={`py-3 rounded font-bold text-white shadow-lg transition-transform hover:scale-[1.02]
                                ${confirmAction.action === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}
                                >
                                    {t('common.confirm')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur p-4 animate-in fade-in duration-200">
                    <div className="bg-stone-900 border border-stone-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-950">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${selectedUser.role.includes('ADMIN') ? 'bg-red-900/40 text-red-500' : 'bg-stone-800 text-stone-400'}`}>
                                    {selectedUser.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        {selectedUser.username}
                                        {selectedUser.isBanned && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase">BANNED</span>}
                                    </h2>
                                    <div className="text-stone-500 text-xs font-mono">{selectedUser.id}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowAudit(!showAudit)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${showAudit ? 'bg-yellow-600 text-stone-900' : 'bg-stone-800 text-stone-400 hover:text-white'}`}
                                >
                                    <ShieldAlert size={14} /> {t('admin.financial_audit') || "FINANCIAL AUDIT (ตรวจสอบ)"}
                                </button>
                                <button onClick={() => { setSelectedUser(null); setShowAudit(false); }} className="text-stone-500 hover:text-white p-2 hover:bg-stone-800 rounded">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Tab Switcher */}
                            <div className="flex border-b border-stone-800 -mx-6 px-6 mb-6">
                                <button
                                    onClick={() => setReferralDetailTab('GENERAL')}
                                    className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${referralDetailTab === 'GENERAL' ? 'border-yellow-600 text-yellow-500 bg-yellow-600/5' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
                                >
                                    {t('admin.general_info') || "GENERAL INFO"}
                                </button>
                                <button
                                    onClick={() => {
                                        setReferralDetailTab('NETWORK');
                                        if (selectedUser && !networkData) fetchReferralNetwork(selectedUser.referralCode || selectedUser.username);
                                    }}
                                    className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${referralDetailTab === 'NETWORK' ? 'border-yellow-600 text-yellow-500 bg-yellow-600/5' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
                                >
                                    {t('admin.referral_network') || "REFERRAL NETWORK (ลูกทีม)"}
                                </button>
                            </div>

                            {referralDetailTab === 'GENERAL' ? (
                                <>
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-stone-950 p-3 rounded border border-stone-800">
                                            <div className="text-xs text-stone-500 uppercase">{t('admin.user_balance')}</div>
                                            <div className="text-lg font-bold text-white">{Math.floor(selectedUser.balance).toLocaleString()} {CURRENCY}</div>
                                        </div>
                                        <div className="bg-stone-900/50 p-3 rounded border border-stone-800">
                                            <div className="text-xs text-stone-500 uppercase">{t('admin.rigs_count')}</div>
                                            <div className="text-lg font-bold text-yellow-500">{getRigsForUser(selectedUser.id).length}</div>
                                        </div>
                                        <div className="bg-emerald-900/10 p-3 rounded border border-emerald-900/30">
                                            <div className="text-xs text-emerald-500 font-bold uppercase">{t('admin.daily_yield')}</div>
                                            <div className="text-lg font-bold text-emerald-400">+{Math.floor(getDailyProfitForUser(selectedUser.id)).toLocaleString()} {CURRENCY}</div>
                                        </div>
                                        <div className="bg-blue-900/10 p-3 rounded border border-blue-900/30">
                                            <div className="text-xs text-blue-400 font-bold uppercase">{t('admin.role')}</div>
                                            <div className="text-sm font-bold text-blue-200 uppercase">{selectedUser.role}</div>
                                        </div>
                                    </div>

                                    {showAudit && userStats?.audit && (
                                        <div className="bg-stone-950 border border-yellow-900/30 rounded-lg p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                                                <div className="flex items-center gap-2 text-yellow-500 font-bold uppercase text-xs">
                                                    <ShieldAlert size={16} /> {t('admin.financial_audit')}
                                                </div>
                                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${userStats.audit.profitabilityRatio > 3 ? 'bg-red-900 text-red-100' : userStats.audit.profitabilityRatio > 1.5 ? 'bg-orange-900 text-orange-100' : 'bg-emerald-900 text-emerald-100'}`}>
                                                    {t('admin.fraud_risk')}: {userStats.audit.profitabilityRatio > 3 ? t('admin.risk_high') : userStats.audit.profitabilityRatio > 1.5 ? t('admin.risk_medium') : t('admin.risk_low')}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] text-stone-500 uppercase font-bold">{t('admin.profitability')}</div>
                                                    <div className={`text-xl font-mono font-bold ${userStats.audit.profitabilityRatio > 3 ? 'text-red-500' : 'text-white'}`}>
                                                        {(userStats.audit.profitabilityRatio * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] text-stone-500 uppercase font-bold">{t('admin.total_mined')}</div>
                                                    <div className="text-xl font-mono font-bold text-emerald-400">
                                                        +{Math.floor(userStats.audit.totalMiningProfit).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] text-stone-500 uppercase font-bold">{t('admin.free_income')}</div>
                                                    <div className="text-xl font-mono font-bold text-blue-400">
                                                        +{Math.floor(userStats.audit.totalBonusIncome).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] text-stone-500 uppercase font-bold">{t('admin.net_cashflow')}</div>
                                                    <div className={`text-xl font-mono font-bold ${userStats.audit.netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {userStats.audit.netCashFlow > 0 ? '+' : ''}{Math.floor(userStats.audit.netCashFlow).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-stone-900/50 p-3 rounded text-[10px] text-stone-400 italic">
                                                <Info size={12} className="inline mr-1 mb-0.5" />
                                                {t('admin.audit_desc')}
                                            </div>
                                        </div>
                                    )}

                                    {/* Grid Container for Machines and History */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                        {/* Left Column: Mining Machines List */}
                                        <div className="bg-stone-950 rounded border border-stone-800 overflow-hidden">
                                            <div className="p-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between">
                                                <div className="font-bold text-xs text-yellow-500 uppercase tracking-wider flex items-center gap-2">
                                                    <Hammer size={14} /> {t('admin.mining_machines')}
                                                    <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full lowercase">{getRigsForUser(selectedUser.id).length} machines</span>
                                                </div>
                                                <button
                                                    onClick={() => setIsAddingRig(!isAddingRig)}
                                                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded transition-colors"
                                                >
                                                    <Zap size={12} />
                                                    {t('common.add_machine')}
                                                </button>
                                            </div>

                                            {isAddingRig && (
                                                <div className="p-3 bg-stone-900 border-b border-stone-800 space-y-3">
                                                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t('common.select_machine')}</div>
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={addingRigPresetId}
                                                            onChange={(e) => setAddingRigPresetId(Number(e.target.value))}
                                                            className="flex-1 bg-stone-950 border border-stone-800 rounded px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                                                        >
                                                            {RIG_PRESETS.map(preset => (
                                                                <option key={preset.id} value={preset.id}>
                                                                    {getLocalized(preset.name)} (+{preset.dailyProfit} {CURRENCY}/day)
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={handleAdminAddRig}
                                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded transition-colors"
                                                        >
                                                            {t('common.add_machine')}
                                                        </button>
                                                        <button
                                                            onClick={() => setIsAddingRig(false)}
                                                            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-400 text-[10px] font-bold rounded transition-colors"
                                                        >
                                                            {t('common.cancel')}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="max-h-80 overflow-y-auto">
                                                {getRigsForUser(selectedUser.id).length > 0 ? (
                                                    <table className="w-full text-left text-sm">
                                                        <thead className="bg-stone-900/50 text-stone-500 text-xs uppercase sticky top-0">
                                                            <tr>
                                                                <th className="p-3 font-medium">{t('admin.name')}</th>
                                                                <th className="p-3 font-medium text-right">{t('admin.daily_profit')}</th>
                                                                <th className="p-3 font-medium text-right italic text-stone-400">{t('admin.pending')}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-stone-800">
                                                            {getRigsForUser(selectedUser.id).map(r =>
                                                                <tr key={r.id} className="hover:bg-stone-900 transition-colors group">
                                                                    <td className="p-3">
                                                                        <div className="font-bold text-stone-200">{getLocalized(r.name)}</div>
                                                                        <div className="text-[10px] text-stone-500 font-mono">ID: {r.id}</div>
                                                                        <div className={`text-[10px] font-mono mt-0.5 flex items-center gap-1 ${r.expiresAt < Date.now() ? 'text-red-500 font-bold' : 'text-stone-400'}`}>
                                                                            <Clock size={10} /> {t('rig.expires_at')}: {new Date(r.expiresAt).toLocaleString()}
                                                                        </div>
                                                                        {/* Accessories */}
                                                                        {r.slots && r.slots.some(id => id) && (
                                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                                {r.slots.map((slotItemId, idx) => {
                                                                                    if (!slotItemId) return null;
                                                                                    const item = selectedUser.inventory?.find((i: any) => i.id === slotItemId);
                                                                                    if (!item) return null;

                                                                                    const typeIdLower = (item.typeId || '').toLowerCase();
                                                                                    let IconComp = Zap;
                                                                                    let colorClass = "text-yellow-400";

                                                                                    const nameRaw = item.name;
                                                                                    const enName = typeof nameRaw === 'object' ? (nameRaw as any).en || '' : String(nameRaw || '');
                                                                                    const thName = typeof nameRaw === 'object' ? (nameRaw as any).th || '' : String(nameRaw || '');

                                                                                    if (typeIdLower.startsWith('glasses') || thName.includes('แว่น') || enName.includes('Glasses')) { IconComp = Glasses; colorClass = "text-blue-400"; }
                                                                                    else if (typeIdLower.startsWith('uniform') || typeIdLower.startsWith('shirt') || thName.includes('ชุด') || enName.includes('Uniform') || enName.includes('Suit')) { IconComp = Shirt; colorClass = "text-orange-400"; }
                                                                                    else if (typeIdLower.startsWith('bag') || thName.includes('กระเป๋า') || enName.includes('Bag') || enName.includes('Backpack')) { IconComp = Backpack; colorClass = "text-purple-400"; }
                                                                                    else if (typeIdLower.startsWith('boots') || thName.includes('รองเท้า') || enName.includes('Boots')) { IconComp = Footprints; colorClass = "text-yellow-400"; }
                                                                                    else if (typeIdLower.startsWith('mobile') || thName.includes('มือถือ') || enName.includes('Mobile')) { IconComp = Smartphone; colorClass = "text-cyan-400"; }
                                                                                    else if (typeIdLower.startsWith('pc') || thName.includes('คอม') || enName.includes('PC')) { IconComp = Monitor; colorClass = "text-rose-400"; }

                                                                                    return (
                                                                                        <div key={idx} className={`flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-[9px] font-bold ${colorClass}`} title={getLocalized(item.name)}>
                                                                                            <IconComp size={10} />
                                                                                            {item.level > 1 && <span>+{item.level}</span>}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-3 text-right">
                                                                        <div className="flex flex-col items-end">
                                                                            {(() => {
                                                                                const nameStr = typeof r.name === 'string' ? r.name : (r.name?.en || r.name?.th || '');
                                                                                const isNoBonusRig = ['พลั่วสนิมเขรอะ', 'สว่านพกพา', 'Rusty Shovel', 'Portable Drill'].includes(nameStr);
                                                                                const baseDailyProfit = (r.dailyProfit < 5 && r.dailyProfit > 0) ? r.dailyProfit * 35 : r.dailyProfit;
                                                                                const effectiveBonusProfit = isNoBonusRig ? 0 : (r.bonusProfit || 0);

                                                                                let equippedBonus = 0;
                                                                                if (r.slots) {
                                                                                    r.slots.forEach(slotItemId => {
                                                                                        if (slotItemId) {
                                                                                            const item = selectedUser.inventory?.find((i: any) => i.id === slotItemId);
                                                                                            if (item) {
                                                                                                const effectiveItemBonus = (item.dailyBonus < 0.5 && item.dailyBonus > 0) ? item.dailyBonus * 35 : item.dailyBonus;
                                                                                                equippedBonus += effectiveItemBonus;
                                                                                            }
                                                                                        }
                                                                                    });
                                                                                }

                                                                                const totalRowProfit = baseDailyProfit + effectiveBonusProfit + equippedBonus;

                                                                                return (
                                                                                    <>
                                                                                        <div className="font-mono font-bold text-emerald-400">+{Math.floor(totalRowProfit).toLocaleString()}</div>
                                                                                        <div className="text-[10px] text-stone-500 flex flex-col items-end">
                                                                                            <span>{Math.floor(baseDailyProfit + effectiveBonusProfit).toLocaleString()} {t('rig.base_profit') || 'base'}</span>
                                                                                            {equippedBonus > 1 && <span className="text-blue-400">+{Math.floor(equippedBonus).toLocaleString()} {t('rig.bonus') || 'bonus'}</span>}
                                                                                        </div>
                                                                                    </>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3 text-right">
                                                                        {(() => {
                                                                            const lastClaim = r.lastClaimAt || r.purchasedAt;
                                                                            const secondsElapsed = Math.max(0, (Date.now() - lastClaim) / 1000);
                                                                            const nameStr = typeof r.name === 'string' ? r.name : (r.name?.en || r.name?.th || '');
                                                                            const isNoBonusRig = ['พลั่วสนิมเขรอะ', 'สว่านพกพา', 'Rusty Shovel', 'Portable Drill'].includes(nameStr);
                                                                            const baseDailyProfit = (r.dailyProfit < 5 && r.dailyProfit > 0) ? r.dailyProfit * 35 : r.dailyProfit;
                                                                            const effectiveBonusProfit = isNoBonusRig ? 0 : (r.bonusProfit || 0);

                                                                            let equippedBonus = 0;
                                                                            if (r.slots) {
                                                                                r.slots.forEach(slotItemId => {
                                                                                    if (slotItemId) {
                                                                                        const item = selectedUser.inventory?.find((i: any) => i.id === slotItemId);
                                                                                        if (item) {
                                                                                            const effectiveItemBonus = (item.dailyBonus < 0.5 && item.dailyBonus > 0) ? item.dailyBonus * 35 : item.dailyBonus;
                                                                                            equippedBonus += effectiveItemBonus;
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }

                                                                            const dailyRate = baseDailyProfit + effectiveBonusProfit + equippedBonus;
                                                                            const pending = (dailyRate / 86400) * secondsElapsed;
                                                                            return (
                                                                                <div className="flex flex-col items-end">
                                                                                    <div className="font-mono font-bold text-yellow-500">+{pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                                                    <div className="text-[10px] text-stone-600">{CURRENCY}</div>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                    </td>
                                                                    <td className="p-3 text-right">
                                                                        <div className="flex items-center justify-end">
                                                                            <button
                                                                                onClick={() => handleDeleteRig(r.id)}
                                                                                className="p-1.5 text-stone-600 hover:text-red-500 hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                                                title={t('common.delete_machine_confirm')}
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="p-8 text-center text-stone-600 text-sm italic">
                                                        {t('admin.no_rigs')}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 bg-stone-900 flex gap-3">
                                                <div className="flex-1 bg-stone-950 p-3 rounded border border-stone-800">
                                                    <div className="text-xs text-stone-500 uppercase">{t('common.total_deposit')}</div>
                                                    <div className="text-lg font-bold text-emerald-400">+{Math.floor(userStats?.totalDeposits || 0).toLocaleString()} {CURRENCY}</div>
                                                </div>
                                                <div className="flex-1 bg-stone-950 p-3 rounded border border-stone-800">
                                                    <div className="text-xs text-stone-500 uppercase">{t('common.total_withdraw')}</div>
                                                    <div className="text-lg font-bold text-red-500">-{Math.floor(userStats?.totalWithdrawals || 0).toLocaleString()} {CURRENCY}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: History Stack (2 Rows) */}
                                        <div className="space-y-6">
                                            {/* Withdrawal History */}
                                            <div className="bg-stone-950 rounded border border-stone-800 overflow-hidden">
                                                <div className="p-3 bg-stone-900 border-b border-stone-800 font-bold text-xs text-stone-400 uppercase tracking-wider flex items-center gap-2">
                                                    <FileText size={14} /> {t('admin.withdrawal_history')}
                                                </div>
                                                <div className="max-h-60 overflow-y-auto overflow-x-auto custom-scrollbar">
                                                    {userStats?.withdrawalHistory && userStats.withdrawalHistory.length > 0 ? (
                                                        <table className="w-full text-left text-sm min-w-[500px]">
                                                            <thead className="bg-stone-900/50 text-stone-500 text-xs uppercase sticky top-0">
                                                                <tr>
                                                                    <th className="p-3 font-medium whitespace-nowrap">{t('history.date')}</th>
                                                                    <th className="p-3 font-medium text-right whitespace-nowrap">{t('admin.amount_label')}</th>
                                                                    <th className="p-3 font-medium text-center whitespace-nowrap">{t('history.method')}</th>
                                                                    <th className="p-3 font-medium text-center whitespace-nowrap">{t('admin.status')}</th>
                                                                    <th className="p-3 font-medium text-right whitespace-nowrap">{t('admin.management')}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-stone-800">
                                                                {userStats.withdrawalHistory.map(w => (
                                                                    <tr key={w.id} className="hover:bg-stone-900 transition-colors">
                                                                        <td className="p-3 text-stone-400 text-xs font-mono">{new Date(w.timestamp).toLocaleString()}</td>
                                                                        <td className="p-3 text-right font-mono text-white">
                                                                            {w.method === 'BANK'
                                                                                ? `${Math.floor(w.amount * EXCHANGE_RATE_USD_THB).toLocaleString()} ฿`
                                                                                : `$${Math.floor(w.amount).toLocaleString()}`
                                                                            }
                                                                        </td>
                                                                        <td className="p-3 text-center">
                                                                            <div className="flex flex-col items-center gap-1">
                                                                                {(w.method === 'USDT' || (w.walletAddress && !w.bankQrCode)) ? (
                                                                                    <div className="flex flex-col items-center">
                                                                                        <span className="text-[10px] font-bold text-blue-400">USDT</span>
                                                                                        {(w.walletAddress || selectedUser.walletAddress) ? (
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    const addr = w.walletAddress || selectedUser.walletAddress;
                                                                                                    navigator.clipboard.writeText(addr!);
                                                                                                    alert(t('admin.copy_address_success'));
                                                                                                }}
                                                                                                className="text-[10px] text-stone-400 font-mono hover:text-blue-400 transition-colors break-all max-w-[120px]"
                                                                                                title={w.walletAddress || selectedUser.walletAddress}
                                                                                            >
                                                                                                {w.walletAddress || selectedUser.walletAddress}
                                                                                            </button>
                                                                                        ) : (
                                                                                            <span className="text-[10px] text-red-500 italic">{t('common.no_data')}</span>
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    <>
                                                                                        {w.bankQrCode ? (
                                                                                            <div
                                                                                                className="w-8 h-8 bg-white p-0.5 rounded cursor-zoom-in overflow-hidden border border-stone-700"
                                                                                                onClick={() => setPreviewImage(w.bankQrCode!)}
                                                                                            >
                                                                                                <img src={w.bankQrCode} alt="QR" className="w-full h-full object-cover" />
                                                                                            </div>
                                                                                        ) : (
                                                                                            <span className="text-stone-600 text-[10px] italic">No QR</span>
                                                                                        )}
                                                                                        <span className="text-[10px] font-bold text-stone-500 uppercase">BANK</span>
                                                                                        {selectedUser.walletAddress && (
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    navigator.clipboard.writeText(selectedUser.walletAddress!);
                                                                                                    alert(t('admin.copy_address_success'));
                                                                                                }}
                                                                                                className="text-[9px] text-blue-400/50 hover:text-blue-400 font-mono transition-colors"
                                                                                                title="USDT Wallet (BSC)"
                                                                                            >
                                                                                                {selectedUser.walletAddress.substring(0, 6)}...
                                                                                            </button>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-3 text-center">
                                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${w.status === 'APPROVED' ? 'bg-emerald-900/30 text-emerald-500' :
                                                                                w.status === 'REJECTED' ? 'bg-red-900/30 text-red-500' :
                                                                                    'bg-yellow-900/30 text-yellow-500'
                                                                                }`}>
                                                                                {w.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="p-3 text-right">
                                                                            {w.status === 'PENDING' && (
                                                                                <div className="flex justify-end gap-1">
                                                                                    <button
                                                                                        onClick={() => initiateProcessWithdrawal(w, 'APPROVE')}
                                                                                        className="p-1.5 bg-emerald-900/30 text-emerald-500 hover:bg-emerald-900/50 rounded transition-colors"
                                                                                        title="Approve"
                                                                                    >
                                                                                        <Check size={14} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => initiateProcessWithdrawal(w, 'REJECT')}
                                                                                        className="p-1.5 bg-red-900/30 text-red-500 hover:bg-red-900/50 rounded transition-colors"
                                                                                        title={t('admin.reject')}
                                                                                    >
                                                                                        <X size={14} />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <div className="p-8 text-center text-stone-600 text-sm italic">
                                                            {t('common.no_data')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Deposit History */}
                                            <div className="bg-stone-950 rounded border border-stone-800 overflow-hidden">
                                                <div className="p-3 bg-stone-900 border-b border-stone-800 font-bold text-xs text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                                                    <FileText size={14} /> {t('admin.deposit_history')}
                                                </div>
                                                <div className="max-h-60 overflow-y-auto overflow-x-auto custom-scrollbar">
                                                    {userStats?.depositHistory && userStats.depositHistory.length > 0 ? (
                                                        <table className="w-full text-left text-sm min-w-[500px]">
                                                            <thead className="bg-stone-900/50 text-stone-500 text-xs uppercase sticky top-0">
                                                                <tr>
                                                                    <th className="p-3 font-medium whitespace-nowrap">{t('history.date')}</th>
                                                                    <th className="p-3 font-medium text-right whitespace-nowrap">{t('admin.amount_label')}</th>
                                                                    <th className="p-3 font-medium text-center whitespace-nowrap">{t('history.method')}</th>
                                                                    <th className="p-3 font-medium text-center whitespace-nowrap">{t('admin.status')}</th>
                                                                    <th className="p-3 font-medium text-right whitespace-nowrap">{t('admin.management')}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-stone-800">
                                                                {userStats.depositHistory.map(d => (
                                                                    <tr key={d.id} className="hover:bg-stone-900 transition-colors">
                                                                        <td className="p-3 text-stone-400 text-xs font-mono">{new Date(d.timestamp).toLocaleString()}</td>
                                                                        <td className="p-3 text-right font-mono text-emerald-400">+{Math.floor(d.amount).toLocaleString()}</td>
                                                                        <td className="p-3 text-center">
                                                                            <div
                                                                                className="w-8 h-8 bg-stone-800 p-0.5 rounded cursor-zoom-in mx-auto overflow-hidden border border-stone-700"
                                                                                onClick={() => setPreviewImage(d.slipImage)}
                                                                            >
                                                                                {d.slipImage === 'USDT_DIRECT_TRANSFER' ? (
                                                                                    <div className="w-full h-full flex items-center justify-center bg-blue-900/20 text-blue-400" title="USDT Direct Transfer">
                                                                                        <Wallet size={16} />
                                                                                    </div>
                                                                                ) : (
                                                                                    <img src={d.slipImage} alt="Slip" className="w-full h-full object-cover" />
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-3 text-center">
                                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${d.status === 'APPROVED' ? 'bg-emerald-900/30 text-emerald-500' :
                                                                                d.status === 'REJECTED' ? 'bg-red-900/30 text-red-500' :
                                                                                    'bg-yellow-900/30 text-yellow-500'
                                                                                }`}>
                                                                                {d.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="p-3 text-right">
                                                                            {d.status === 'PENDING' && (
                                                                                <div className="flex justify-end gap-1">
                                                                                    <button
                                                                                        onClick={() => handleDirectProcessDeposit(d.id, 'APPROVE')}
                                                                                        className="p-1.5 bg-emerald-900/30 text-emerald-500 hover:bg-emerald-900/50 rounded transition-colors"
                                                                                        title="Approve"
                                                                                    >
                                                                                        <Check size={14} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => initiateProcessDeposit(d, 'REJECT')}
                                                                                        className="p-1.5 bg-red-900/30 text-red-500 hover:bg-red-900/50 rounded transition-colors"
                                                                                        title={t('admin.reject')}
                                                                                    >
                                                                                        <X size={14} />
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <div className="p-8 text-center text-stone-600 text-sm italic">
                                                            {t('common.no_data')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <ReferralNetworkView data={networkData} isLoading={isFetchingNetwork} />
                            )}
                        </div>

                        {/* Action Buttons - Fixed at bottom */}
                        <div className="p-6 bg-stone-950 border-t border-stone-800 flex flex-wrap gap-4">
                            <button
                                onClick={() => setShowAudit(!showAudit)}
                                className={`flex-1 min-w-[150px] py-3 rounded font-bold transition-all flex items-center justify-center gap-2 border ${showAudit ? 'bg-yellow-600 text-stone-900 border-yellow-500' : 'bg-stone-800 text-yellow-500 border-stone-700 hover:bg-stone-700'}`}
                            >
                                <ShieldAlert size={18} />
                                {t('admin.financial_audit')}
                            </button>
                            {selectedUser.isBanned ? (
                                <button
                                    onClick={() => handleUnbanUser(selectedUser.id)}
                                    className="flex-1 bg-emerald-900/40 hover:bg-emerald-800 text-emerald-400 border border-emerald-900 py-3 rounded font-bold transition-colors"
                                >
                                    {t('admin.unban_confirm').split('?')[0].toUpperCase()}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleBanUser(selectedUser.id)}
                                    className="flex-1 bg-red-900/40 hover:bg-red-800 text-red-500 border border-red-900 py-3 rounded font-bold transition-colors"
                                >
                                    {t('admin.ban_confirm').split('?')[0].toUpperCase()}
                                </button>
                            )}
                            <button
                                onClick={() => handleDeleteUser(selectedUser.id)}
                                className="px-4 bg-stone-950 hover:bg-red-950 text-stone-600 hover:text-red-600 border border-stone-800 hover:border-red-900 py-3 rounded font-bold transition-colors"
                                title="Delete User Permanently"
                            >
                                <Trash2 size={24} />
                            </button>
                            <button
                                onClick={() => handleResetUser(selectedUser.id)}
                                className="flex-1 bg-orange-900/40 hover:bg-orange-800 text-orange-500 border border-orange-900 py-3 rounded font-bold transition-colors"
                            >
                                {t('admin.reset_confirm').split('?')[0].toUpperCase()}
                            </button>
                            {selectedUser.inventory?.some((i: any) => i.typeId === 'vip_withdrawal_card') && (
                                <button
                                    onClick={() => handleRemoveVip(selectedUser.id)}
                                    className="flex-1 bg-yellow-900/40 hover:bg-yellow-800 text-yellow-500 border border-yellow-900 py-3 rounded font-bold transition-colors"
                                >
                                    {t('admin.remove_vip_confirm').split('?')[0].toUpperCase()}
                                </button>
                            )}
                            <button className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 py-3 rounded font-bold transition-colors">
                                {t('admin.reset_password')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Overlay */}
            {
                previewImage && (
                    <div
                        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                        onClick={() => setPreviewImage(null)}
                    >
                        <div className="relative max-w-full max-h-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <img src={previewImage} alt="Preview" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl border border-stone-700 object-contain" />
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="absolute -top-12 right-0 text-white hover:text-stone-300 flex items-center gap-2 font-bold bg-black/20 p-2 rounded-full transition-colors"
                            >
                                <X size={32} />
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Admin Navbar */}
            <nav className="bg-stone-900 border-b border-yellow-900/20 p-4 sticky top-0 z-30">
                <div className="w-full px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-900/20 p-2 rounded text-red-500">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold text-white">{t('admin.title')}</h1>
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest">{t('admin.subtitle')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 px-4 py-2 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-800 text-xs font-bold transition-all"
                            >
                                <ArrowRight size={14} className="rotate-180" />
                                {language === 'th' ? 'หน้าหลัก' : 'HOME'}
                            </button>
                        )}
                        <button
                            onClick={() => setActiveView(activeView === 'DASHBOARD' ? 'REVENUE' : 'DASHBOARD')}
                            className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${activeView === 'REVENUE'
                                ? 'bg-yellow-600 text-stone-900 border border-yellow-500'
                                : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-800'
                                }`}
                        >
                            <TrendingUp size={14} /> {activeView === 'REVENUE' ? t('admin.main_dashboard') : t('admin.revenue_analytics')}
                        </button>
                        <button
                            onClick={onSwitchToPlayer}
                            className="bg-stone-800 hover:bg-stone-700 px-4 py-2 rounded text-xs font-bold text-stone-300 transition-colors flex items-center gap-2"
                        >
                            <LayoutDashboard size={14} /> {t('admin.player_view')}
                        </button>
                        <span className="text-sm text-stone-400 font-mono">{currentUser.username}</span>
                        <button
                            onClick={onLogout}
                            className="bg-stone-800 hover:bg-stone-700 p-2 rounded transition-colors text-red-400"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            {
                activeView === 'REVENUE' ? (
                    <div className="max-w-[1920px] mx-auto">
                        <AdminRevenuePage />
                    </div>
                ) : (
                    <div className="w-full px-6 py-6 space-y-8 max-w-[1920px] mx-auto">

                        {/* === Notification / Approval Center === */}
                        {(pendingWithdrawals.length > 0 || pendingDeposits.length > 0) && (
                            <div className="bg-stone-900 border-l-4 border-yellow-500 shadow-2xl overflow-hidden rounded-r-lg animate-in slide-in-from-top-4 duration-500">
                                <div className="bg-yellow-900/20 p-3 flex items-center justify-between border-b border-yellow-900/30">
                                    <div className="flex items-center gap-2 text-yellow-500 font-bold uppercase tracking-wider text-sm">
                                        <Bell className="animate-pulse" size={16} /> {t('admin.pending_requests')} ({pendingWithdrawals.length + pendingDeposits.length})
                                    </div>
                                </div>
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">

                                    {/* Deposits First */}
                                    {pendingDeposits.map(d => (
                                        <div key={d.id} className="p-4 border-b border-stone-800 flex flex-col sm:flex-row items-center justify-between hover:bg-emerald-950/10 transition-colors bg-emerald-950/5 gap-4">
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <div className="p-2 bg-emerald-900/20 rounded border border-emerald-900/50 text-emerald-500">
                                                    <Wallet size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-white text-sm flex items-center gap-2">
                                                        <span className="text-yellow-500">{d.username}</span>
                                                        <span className="text-xs bg-emerald-900/40 text-emerald-300 px-1.5 rounded">{t('admin.deposit_label')}</span>
                                                    </div>
                                                    <div className="text-xs text-stone-500 font-mono mt-0.5">{new Date(d.timestamp).toLocaleString()}</div>
                                                    {d.fromWallet && (
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <div className="bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-900/30 flex items-center gap-1.5">
                                                                <span className="text-[10px] font-mono text-blue-400 select-all">{d.fromWallet}</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigator.clipboard.writeText(d.fromWallet!);
                                                                        alert(t('admin.copy_address_success') || 'Wallet address copied');
                                                                    }}
                                                                    className="p-1 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                                                                    title="Copy Wallet Address"
                                                                >
                                                                    <Copy size={10} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Slip Preview */}
                                                <div
                                                    className={`w-12 h-16 bg-stone-950 border border-stone-700 rounded overflow-hidden shadow-lg ${!d.slipImage || d.slipImage === 'USDT_DIRECT_TRANSFER' ? 'cursor-default' : 'cursor-pointer hover:scale-125 transition-transform origin-center'}`}
                                                    onClick={() => d.slipImage && d.slipImage !== 'USDT_DIRECT_TRANSFER' && setPreviewImage(d.slipImage)}
                                                >
                                                    {d.slipImage === 'USDT_DIRECT_TRANSFER' || !d.slipImage ? (
                                                        <div className="w-full h-full flex flex-col items-center justify-center bg-blue-900/10 text-blue-400 gap-1">
                                                            <Wallet size={16} />
                                                            <span className="text-[8px] font-bold">USDT</span>
                                                        </div>
                                                    ) : (
                                                        <img src={d.slipImage} className="w-full h-full object-cover" alt="Slip" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                <span className="font-mono font-bold text-lg text-emerald-400">+{Math.floor(d.amount).toLocaleString()} <span className="text-stone-500 text-xs">{CURRENCY}</span></span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => initiateProcessDeposit(d, 'REJECT')}
                                                        className="px-3 py-1.5 rounded border border-red-900/50 bg-stone-900 text-stone-400 text-xs font-bold uppercase hover:bg-red-900/20 hover:text-red-400 flex items-center gap-1 transition-colors"
                                                    >
                                                        <XCircle size={14} /> {t('admin.reject')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDirectProcessDeposit(d.id, 'APPROVE')}
                                                        className="px-3 py-1.5 rounded border border-emerald-500 bg-emerald-600 text-white text-xs font-bold uppercase hover:bg-emerald-500 flex items-center gap-1 transition-colors shadow-lg shadow-emerald-900/20"
                                                    >
                                                        <CheckCircle size={14} /> {t('admin.approve')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Withdrawals */}
                                    {pendingWithdrawals.map(w => (
                                        <div key={w.id} className="p-4 border-b border-stone-800 flex flex-col sm:flex-row items-center justify-between hover:bg-red-950/10 transition-colors bg-red-950/5 gap-4">
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <div className="p-2 bg-red-900/20 rounded border border-red-900/50 text-red-500">
                                                    <ArrowUpRight size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-white text-sm flex items-center gap-2">
                                                        <span className="text-yellow-500">{w.username}</span>
                                                        <span className={`text-xs px-1.5 rounded ${(w.method === 'USDT' || (w.walletAddress && !w.bankQrCode)) ? 'bg-blue-900/40 text-blue-300' : 'bg-red-900/40 text-red-300'}`}>
                                                            {t('admin.withdraw_label')} {(w.method === 'USDT' || (w.walletAddress && !w.bankQrCode)) ? 'USDT' : 'BANK'}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-stone-500 font-mono mt-0.5 flex flex-col gap-1">
                                                        <span>{new Date(w.timestamp).toLocaleString()}</span>
                                                        {(w.walletAddress || users.find(u => u.id === w.userId)?.walletAddress) && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <button
                                                                    onClick={() => {
                                                                        const addr = w.walletAddress || users.find(u => u.id === w.userId)?.walletAddress;
                                                                        if (addr) {
                                                                            navigator.clipboard.writeText(addr);
                                                                            alert('Copied Wallet Address');
                                                                        }
                                                                    }}
                                                                    className="text-blue-400/80 hover:text-blue-300 flex items-center gap-1.5 bg-blue-900/10 px-2 py-1 rounded border border-blue-900/30 w-fit transition-colors hover:bg-blue-900/20"
                                                                    title="BSC Wallet Address"
                                                                >
                                                                    <Wallet size={12} />
                                                                    <span className="text-[10px] font-mono break-all max-w-[180px]">
                                                                        {w.walletAddress || users.find(u => u.id === w.userId)?.walletAddress}
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Method Specific Display (QR or Wallet Address Icon) */}
                                                {(w.method === 'BANK' || (w.bankQrCode && !w.walletAddress)) && w.bankQrCode && (
                                                    <div
                                                        className="w-12 h-16 bg-white border border-stone-700 rounded overflow-hidden shadow-lg cursor-pointer hover:scale-125 transition-transform origin-center shrink-0"
                                                        onClick={() => setPreviewImage(w.bankQrCode!)}
                                                    >
                                                        <img src={w.bankQrCode} className="w-full h-full object-cover" alt="Bank QR" />
                                                    </div>
                                                )}
                                                {(w.method === 'USDT' || (w.walletAddress && !w.bankQrCode)) && (
                                                    <div className="w-12 h-16 flex flex-col items-center justify-center bg-blue-900/10 text-blue-400 border border-blue-900/20 rounded shrink-0">
                                                        <Wallet size={16} />
                                                        <span className="text-[8px] font-bold">USDT</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                <span className="font-mono font-bold text-lg text-white">
                                                    {(w.method === 'BANK' || (w.bankQrCode && !w.walletAddress))
                                                        ? `${Math.floor(w.amount * EXCHANGE_RATE_USD_THB).toLocaleString()} ฿`
                                                        : `$${Math.floor(w.amount).toLocaleString()}`
                                                    }
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => initiateProcessWithdrawal(w, 'REJECT')}
                                                        className="px-3 py-1.5 rounded border border-red-900/50 bg-stone-900 text-stone-400 text-xs font-bold uppercase hover:bg-red-900/20 hover:text-red-400 flex items-center gap-1 transition-colors"
                                                    >
                                                        <XCircle size={14} /> {t('admin.reject')}
                                                    </button>
                                                    <button
                                                        onClick={() => initiateProcessWithdrawal(w, 'APPROVE')}
                                                        className="px-3 py-1.5 rounded border border-red-500 bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-500 flex items-center gap-1 transition-colors shadow-lg shadow-red-900/20"
                                                    >
                                                        <CheckCircle size={14} /> {t('admin.approve')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}


                                </div>
                            </div>
                        )}

                        {/* === USDT DEPOSIT VERIFICATION TOOL === */}
                        <div className="bg-stone-900 border border-blue-900/30 shadow-xl rounded-lg overflow-hidden">
                            <div className="p-4 bg-blue-950/20 border-b border-blue-900/30 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-sm">
                                    <Search size={16} /> {t('admin.verify_usdt_deposit') || 'VERIFY USDT DEPOSIT (ตรวจสอบ USDT)'}
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                                        <input
                                            type="text"
                                            placeholder={t('admin.enter_wallet_address') || 'Enter Wallet Address...'}
                                            value={usdtSearchWallet}
                                            onChange={e => setUsdtSearchWallet(e.target.value)}
                                            className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-blue-600 outline-none transition-all font-mono"
                                        />
                                    </div>
                                    <button
                                        onClick={handleUsdtLookup}
                                        disabled={!usdtSearchWallet || isSearchingUsdt}
                                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-stone-800 disabled:text-stone-600 px-8 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                                    >
                                        {isSearchingUsdt ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <Search size={18} />
                                        )}
                                        {t('common.search') || 'SEARCH'}
                                    </button>
                                </div>

                                {usdtSearchResults.length > 0 && (
                                    <div className="mt-4 border border-stone-800 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-stone-950 text-stone-500 text-xs uppercase">
                                                <tr>
                                                    <th className="p-3 font-bold">{t('history.date')}</th>
                                                    <th className="p-3 font-bold">{t('admin.username')}</th>
                                                    <th className="p-3 font-bold text-right">{t('admin.amount_label')}</th>
                                                    <th className="p-3 font-bold text-center">{t('admin.status')}</th>
                                                    <th className="p-3 font-bold text-right">{t('admin.management')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-800">
                                                {usdtSearchResults.map(res => (
                                                    <tr key={res.id} className="bg-stone-900/50 hover:bg-stone-900 transition-colors">
                                                        <td className="p-3 text-stone-400 font-mono text-xs">
                                                            {new Date(res.timestamp).toLocaleString()}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="text-white font-bold">{res.username}</div>
                                                            {res.fromWallet && (
                                                                <div className="text-[10px] text-blue-400 font-mono flex items-center gap-1 mt-0.5">
                                                                    <span>{res.fromWallet.slice(0, 6)}...{res.fromWallet.slice(-4)}</span>
                                                                    <button
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(res.fromWallet!);
                                                                            alert(t('admin.copy_address_success') || 'Wallet address copied');
                                                                        }}
                                                                        className="hover:text-blue-300 transition-colors"
                                                                    >
                                                                        <Copy size={10} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-right text-emerald-400 font-mono font-bold">
                                                            +{res.amount.toLocaleString()} USDT
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${res.status === 'APPROVED' ? 'bg-emerald-900/30 text-emerald-500' :
                                                                res.status === 'REJECTED' ? 'bg-red-900/30 text-red-500' :
                                                                    'bg-yellow-900/30 text-yellow-500'
                                                                }`}>
                                                                {res.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            {res.status === 'PENDING' && (
                                                                <button
                                                                    onClick={() => handleDirectProcessDeposit(res.id, 'APPROVED')}
                                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded transition-colors"
                                                                    title="Approve"
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* === Full Deposit History Section === */}
                        <div className="bg-stone-900 border border-stone-800 shadow-xl rounded-lg overflow-hidden">
                            <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-stone-400 font-bold uppercase tracking-wider text-sm">
                                        <FileText size={16} /> ประวัติการฝากเงินทั้งหมด (ALL DEPOSITS)
                                    </div>
                                    <button
                                        onClick={() => setShowAllDeposits(!showAllDeposits)}
                                        className="flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-500 hover:text-white hover:border-stone-700 transition-all"
                                    >
                                        {showAllDeposits ? (
                                            <><ShieldCheck size={12} className="text-emerald-500" /> ซ่อนข้อมูล (HIDE)</>
                                        ) : (
                                            <><ShieldAlert size={12} className="text-yellow-500" /> แสดงข้อมูล (SHOW)</>
                                        )}
                                    </button>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={14} />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อผู้ใช้งาน..."
                                        value={depositSearch}
                                        onChange={e => setDepositSearch(e.target.value)}
                                        className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:border-yellow-600 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            {showAllDeposits && (
                                <div className="overflow-x-auto max-h-[600px] custom-scrollbar animate-in fade-in slide-in-from-top-4 duration-300">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-stone-950 text-stone-500 text-[10px] uppercase font-bold sticky top-0 z-10 shadow-md">
                                            <tr>
                                                <th className="p-4">{t('history.date')}</th>
                                                <th className="p-4">{t('admin.username')}</th>
                                                <th className="p-4 text-right">{t('admin.amount_label')}</th>
                                                <th className="p-4 text-center">{t('admin.method_label') || 'METHOD'}</th>
                                                <th className="p-4 text-center">{t('admin.status')}</th>
                                                <th className="p-4 text-right">{t('admin.slip') || 'SLIP'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-800">
                                            {allDeposits
                                                .filter(d => d.username.toLowerCase().includes(depositSearch.toLowerCase()))
                                                .map(d => (
                                                    <tr key={d.id} className="hover:bg-stone-800/30 transition-colors group">
                                                        <td className="p-4 text-stone-500 font-mono text-xs">
                                                            {new Date(d.timestamp).toLocaleString()}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="text-stone-200 font-bold">{d.username}</div>
                                                            <div className="text-[10px] text-stone-600 font-mono">{d.userId}</div>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="text-emerald-400 font-mono font-bold">+{d.amount.toLocaleString()}</div>
                                                            <div className="text-[10px] text-stone-500">{CURRENCY}</div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${d.method === 'USDT' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20' : 'bg-stone-800 text-stone-400 border border-stone-700'}`}>
                                                                {d.method || 'BANK'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${d.status === 'APPROVED' ? 'bg-emerald-900/30 text-emerald-500' :
                                                                d.status === 'REJECTED' ? 'bg-red-900/30 text-red-500' :
                                                                    'bg-yellow-900/30 text-yellow-500'
                                                                }`}>
                                                                {d.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div
                                                                className={`inline-block w-8 h-10 bg-stone-950 border border-stone-800 rounded overflow-hidden shadow-sm ${!d.slipImage || d.slipImage === 'USDT_DIRECT_TRANSFER' ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
                                                                onClick={() => d.slipImage && d.slipImage !== 'USDT_DIRECT_TRANSFER' && setPreviewImage(d.slipImage)}
                                                            >
                                                                {d.slipImage === 'USDT_DIRECT_TRANSFER' || !d.slipImage ? (
                                                                    <div className="w-full h-full flex items-center justify-center text-stone-800">
                                                                        <Wallet size={12} />
                                                                    </div>
                                                                ) : (
                                                                    <img src={d.slipImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Slip" />
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            {allDeposits.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-12 text-center text-stone-600 italic">
                                                        {t('admin.no_data') || 'No deposit history found.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* === ALL WITHDRAWALS HISTORY === */}
                        <div className="bg-stone-900 border border-red-900/30 shadow-xl rounded-lg overflow-hidden">
                            <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-stone-400 font-bold uppercase tracking-wider text-sm">
                                        <ArrowUpRight size={16} /> ประวัติการถอนเงินทั้งหมด (ALL WITHDRAWALS)
                                    </div>
                                    <button
                                        onClick={() => setShowAllWithdrawals(!showAllWithdrawals)}
                                        className="flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded bg-stone-900 border border-stone-800 text-stone-500 hover:text-white hover:border-stone-700 transition-all"
                                    >
                                        {showAllWithdrawals ? (
                                            <><ShieldCheck size={12} className="text-emerald-500" /> ซ่อนข้อมูล (HIDE)</>
                                        ) : (
                                            <><ShieldAlert size={12} className="text-yellow-500" /> แสดงข้อมูล (SHOW)</>
                                        )}
                                    </button>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={14} />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อผู้ใช้งาน..."
                                        value={withdrawalSearch}
                                        onChange={e => setWithdrawalSearch(e.target.value)}
                                        className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:border-red-600 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            {showAllWithdrawals && (
                                <div className="overflow-x-auto max-h-[600px] custom-scrollbar animate-in fade-in slide-in-from-top-4 duration-300">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-stone-950 text-stone-500 text-[10px] uppercase font-bold sticky top-0 z-10 shadow-md">
                                            <tr>
                                                <th className="p-4">{t('history.date')}</th>
                                                <th className="p-4">{t('admin.username')}</th>
                                                <th className="p-4 text-right">{t('admin.amount_label')}</th>
                                                <th className="p-4 text-center">{t('admin.method_label') || 'METHOD'}</th>
                                                <th className="p-4 text-center">{t('admin.status')}</th>
                                                <th className="p-4 text-right">{t('admin.management')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-800">
                                            {allWithdrawals
                                                .filter(w => (w.user?.username || 'Unknown').toLowerCase().includes(withdrawalSearch.toLowerCase()))
                                                .map(w => (
                                                    <tr key={w.id} className="hover:bg-stone-800/30 transition-colors group">
                                                        <td className="p-4 text-stone-500 font-mono text-xs">
                                                            {new Date(w.createdAt).toLocaleString()}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="text-stone-200 font-bold">
                                                                {(w.user?.username && w.user.username !== 'Unknown') ? w.user.username : (w.username || w.userId || w.id)}
                                                            </div>
                                                            <div className="text-[10px] text-stone-600 font-mono">
                                                                {(w.user?.username && w.user.username !== 'Unknown') ? (w.userId || w.id) : 'ID Only'}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="text-red-400 font-mono font-bold">-{w.amount.toLocaleString()}</div>
                                                            <div className="text-[10px] text-stone-500">{CURRENCY}</div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${(w.method === 'BANK' || (w.bankDetails && w.bankDetails.bankName)) ? 'bg-stone-800 text-stone-400 border border-stone-700' : 'bg-blue-900/20 text-blue-400 border border-blue-500/20'}`}>
                                                                {(w.method === 'BANK' || (w.bankDetails && w.bankDetails.bankName)) ? 'BANK' : 'USDT'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${w.status === 'APPROVED' ? 'bg-emerald-900/30 text-emerald-500' :
                                                                w.status === 'REJECTED' ? 'bg-red-900/30 text-red-500' :
                                                                    'bg-yellow-900/30 text-yellow-500'
                                                                }`}>
                                                                {w.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            {w.status === 'PENDING' ? (
                                                                <div className="flex justify-end gap-1">
                                                                    <button
                                                                        onClick={() => initiateProcessWithdrawal(w, 'REJECT')}
                                                                        className="p-1.5 bg-red-900/30 text-red-500 hover:bg-red-900/50 rounded transition-colors"
                                                                        title={t('admin.reject')}
                                                                    >
                                                                        <XCircle size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => initiateProcessWithdrawal(w, 'APPROVE')}
                                                                        className="p-1.5 bg-emerald-900/30 text-emerald-500 hover:bg-emerald-900/50 rounded transition-colors"
                                                                        title="Approve"
                                                                    >
                                                                        <CheckCircle size={14} />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] text-stone-600 italic">Processed</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            {allWithdrawals.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-12 text-center text-stone-600 italic">
                                                        {t('admin.no_data') || 'No withdrawal history found.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* System Settings: QR Code */}
                        <div className="bg-stone-900 border border-stone-800 shadow-xl rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/50 text-blue-400">
                                    <QrCode size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{t('admin.setup_qr')}</h3>
                                    <p className="text-sm text-stone-400">{t('admin.setup_qr_desc')}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                {/* Maintenance Toggle */}
                                <div className="flex items-center gap-3 pr-6 border-r border-stone-800">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-stone-500 uppercase font-bold">{t('admin.server_status')}</span>
                                        <span className={`text-sm font-bold ${isMaintenance ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {isMaintenance ? t('admin.status_maintenance') : t('admin.status_online')}
                                        </span>
                                    </div>
                                    <button
                                        onClick={toggleMaintenance}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-stone-950 ${isMaintenance ? 'bg-red-600' : 'bg-stone-700'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMaintenance ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                {systemQr && (
                                    <div className="w-16 h-16 bg-white rounded p-1">
                                        <img src={systemQr} alt="System QR" className="w-full h-full object-contain" />
                                    </div>
                                )}

                                <div
                                    className="relative cursor-pointer bg-stone-950 hover:bg-stone-800 border border-stone-700 border-dashed rounded-lg px-6 py-3 flex items-center gap-3 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleQrUpload}
                                    />
                                    <Upload size={18} className="text-stone-400" />
                                    <span className="text-sm font-bold text-stone-300">{t('admin.upload_new_qr')}</span>
                                </div>
                            </div>
                        </div>

                        {/* System Overview Cards (PART 6) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="relative overflow-hidden bg-stone-900 p-6 border border-stone-800 shadow-xl cursor-pointer hover:bg-stone-800 transition-all group rounded-xl"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Clock size={80} />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-stone-500 text-xs font-bold uppercase tracking-widest">{t('admin.pending_requests')}</span>
                                    <div className="p-2 bg-yellow-900/20 rounded-lg text-yellow-500">
                                        <Bell size={20} />
                                    </div>
                                </div>
                                <div className="text-4xl font-display font-bold text-white mb-1">
                                    {stats?.pendingWithdrawalsCount || 0}
                                </div>
                                <div className="text-xs text-stone-500 font-medium">{t('admin.pending_checks')} (Withdrawals)</div>
                            </div>

                            <div
                                onClick={() => document.getElementById('user-management')?.scrollIntoView({ behavior: 'smooth' })}
                                className="relative overflow-hidden bg-stone-900 p-6 border border-stone-800 shadow-xl cursor-pointer hover:bg-stone-800 transition-all group rounded-xl"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Users size={80} />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-stone-500 text-xs font-bold uppercase tracking-widest">{t('admin.total_users')}</span>
                                    <div className="p-2 bg-blue-900/20 rounded-lg text-blue-500">
                                        <Users size={20} />
                                    </div>
                                </div>
                                <div className="text-4xl font-display font-bold text-white mb-1">
                                    {(stats?.totalUsers || users.length).toLocaleString()}
                                </div>
                                <div className="text-xs text-stone-500 font-medium">{t('admin.all_members')}</div>
                            </div>

                            <div
                                onClick={() => document.getElementById('game-config')?.scrollIntoView({ behavior: 'smooth' })}
                                className="relative overflow-hidden bg-stone-900 p-6 border border-stone-800 shadow-xl cursor-pointer hover:bg-stone-800 transition-all group rounded-xl"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Wallet size={80} />
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-stone-500 text-xs font-bold uppercase tracking-widest">{t('admin.system_balance')}</span>
                                    <div className="p-2 bg-emerald-900/20 rounded-lg text-emerald-500">
                                        <Coins size={20} />
                                    </div>
                                </div>
                                <div className="text-4xl font-display font-bold text-white mb-1">
                                    {totalUserBalance.toLocaleString()}
                                </div>
                                <div className="text-xs text-stone-500 font-medium">{t('admin.total_user_balance_desc')} ({CURRENCY})</div>
                            </div>
                        </div>

                        {/* Developer Revenue Summary */}
                        {
                            globalRevenue && (
                                <div className="bg-stone-900 border border-stone-800 shadow-xl rounded-lg p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
                                        <div className="bg-yellow-900/20 p-2 rounded text-yellow-500">
                                            <Coins size={20} />
                                        </div>
                                        <div className="flex-1 flex justify-between items-center">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleResetAllPlayerData}
                                                    className="px-3 py-1 bg-orange-900/20 hover:bg-orange-900/40 text-orange-500 border border-orange-900/30 rounded text-xs font-bold transition-all flex items-center gap-2"
                                                >
                                                    <AlertTriangle size={14} /> {t('admin.reset_balances')}
                                                </button>
                                                <button
                                                    onClick={handleDeleteAllUsers}
                                                    className="px-3 py-1 bg-red-900/40 hover:bg-red-900 border border-red-900/50 rounded text-xs font-bold transition-all flex items-center gap-2 text-white"
                                                >
                                                    <Trash2 size={14} /> {t('admin.delete_all_users')}
                                                </button>
                                                <button
                                                    onClick={handleClearRevenue}
                                                    className="px-3 py-1 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/30 rounded text-xs font-bold transition-all flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} /> {t('admin.clear_all_revenue')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                                        <div className="bg-stone-950 p-4 rounded border border-stone-800 hover:bg-stone-800 transition-colors">
                                            <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">{t('admin.rig_sales')}</div>
                                            <div className="text-xl font-mono font-bold text-emerald-400">+{Math.floor(globalRevenue.totals.RIG_BUY || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-stone-950 p-4 rounded border border-stone-800 hover:bg-stone-800 transition-colors">
                                            <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">{t('admin.repairs_renew')}</div>
                                            <div className="text-xl font-mono font-bold text-emerald-400">+{Math.floor(globalRevenue.totals.REPAIR || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-stone-950 p-4 rounded border border-stone-800 hover:bg-stone-800 transition-colors">
                                            <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">{t('admin.withdraw_fees')}</div>
                                            <div className="text-xl font-mono font-bold text-emerald-400">+{Math.floor(globalRevenue.totals.WITHDRAW_FEE || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-stone-950 p-4 rounded border border-stone-800 hover:bg-stone-800 transition-colors">
                                            <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">{t('admin.market_fees')}</div>
                                            <div className="text-xl font-mono font-bold text-emerald-400">+{Math.floor(globalRevenue.totals.MARKET_FEE || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-stone-950 p-4 rounded border border-stone-800 hover:bg-stone-800 transition-colors">
                                            <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">{t('admin.item_sales')}</div>
                                            <div className="text-xl font-mono font-bold text-emerald-400">+{Math.floor(globalRevenue.totals.ITEM_BUY || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-stone-950 p-4 rounded border border-stone-800 hover:bg-stone-800 transition-colors">
                                            <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">{t('admin.game_profits')}</div>
                                            <div className="text-xl font-mono font-bold text-emerald-400">+{Math.floor(globalRevenue.totals.GAME_LOSS || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-stone-950 p-4 rounded border border-stone-800 hover:bg-stone-800 transition-colors">
                                            <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">{t('admin.energy_oc')}</div>
                                            <div className="text-xl font-mono font-bold text-emerald-400">+{Math.floor(globalRevenue.totals.ENERGY_REFILL || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="bg-yellow-900/10 p-4 rounded border border-yellow-500/30 hover:bg-yellow-900/20 transition-colors">
                                            <div className="text-[10px] text-yellow-500 uppercase font-bold mb-1">{t('admin.dev_revenue')}</div>
                                            <div className="text-xl font-mono font-bold text-yellow-400">+{Math.floor(globalRevenue.totals.total || 0).toLocaleString()} ฿</div>
                                        </div>
                                    </div>

                                    {/* Revenue Adjustment Form */}
                                    <div className="flex flex-col md:flex-row items-end gap-3 mt-4 pt-4 border-t border-stone-800/50">
                                        <div className="flex-1 w-full">
                                            <label className="block text-[10px] text-stone-500 uppercase font-bold mb-1">{t('admin.adjust_reason')}</label>
                                            <input
                                                type="text"
                                                placeholder={t('admin.adjust_reason')}
                                                className="w-full bg-stone-950 border border-stone-800 rounded px-3 py-2 text-sm text-white focus:border-yellow-600 outline-none transition-colors"
                                                value={adjustForm.reason}
                                                onChange={(e) => setAdjustForm(prev => ({ ...prev, reason: e.target.value }))}
                                            />
                                        </div>
                                        <div className="w-full md:w-48">
                                            <label className="block text-[10px] text-stone-500 uppercase font-bold mb-1">{t('admin.adjust_amount')}</label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-full bg-stone-950 border border-stone-800 rounded px-3 py-2 text-sm text-emerald-400 font-mono focus:border-yellow-600 outline-none transition-colors"
                                                value={adjustForm.amount === 0 ? '' : adjustForm.amount}
                                                onChange={(e) => setAdjustForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                            />
                                        </div>
                                        <button
                                            onClick={handleAdjustRevenue}
                                            disabled={!adjustForm.amount}
                                            className="w-full md:w-auto px-6 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-stone-800 disabled:text-stone-600 text-stone-900 font-bold rounded text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 size={16} />
                                            {t('admin.adjust_revenue')}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-800/50">
                                        <div className="bg-stone-950/50 p-4 rounded border border-stone-800 flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">Total Deposit Volume</div>
                                                <div className="flex gap-4">
                                                    <div>
                                                        <span className="text-xs text-stone-400 block">Bank</span>
                                                        <span className="text-lg font-mono font-bold text-white">{Math.floor(globalRevenue.volumes?.bank_deposits || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-px h-8 bg-stone-800 self-center"></div>
                                                    <div>
                                                        <span className="text-xs text-blue-400 block">USDT</span>
                                                        <span className="text-lg font-mono font-bold text-blue-400">{Math.floor(globalRevenue.volumes?.usdt_deposits || 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowUpRight className="text-emerald-500 opacity-20" size={40} />
                                        </div>
                                        <div className="bg-stone-950/50 p-4 rounded border border-stone-800 flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">Total Withdrawal Volume</div>
                                                <div className="flex gap-4">
                                                    <div>
                                                        <span className="text-xs text-stone-400 block">Bank</span>
                                                        <span className="text-lg font-mono font-bold text-white">{Math.floor(globalRevenue.volumes?.bank_withdrawals || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-px h-8 bg-stone-800 self-center"></div>
                                                    <div>
                                                        <span className="text-xs text-blue-400 block">USDT</span>
                                                        <span className="text-lg font-mono font-bold text-blue-400">{Math.floor(globalRevenue.volumes?.usdt_withdrawals || 0).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowDownLeft className="text-red-500 opacity-20" size={40} />
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {/* === USERS MANAGEMENT === */}
                        <div id="user-management" className="bg-stone-900 border border-stone-800 shadow-xl rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950">
                                <div className="flex items-center gap-2">
                                    <Users size={20} className="text-blue-400" />
                                    <h3 className="font-bold text-white">{t('admin.manage_users')} ({users.length})</h3>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={14} />
                                    <input
                                        type="text"
                                        placeholder={t('admin.search_user')}
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="bg-stone-900 border border-stone-700 rounded-full pl-9 pr-4 py-1.5 text-sm text-stone-200 focus:outline-none focus:border-yellow-600 w-64"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-stone-900/50 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-800">
                                            <th className="p-4 font-bold">{t('admin.user_info')}</th>
                                            <th className="p-4 font-bold text-right">{t('admin.balance')}</th>
                                            <th className="p-4 font-bold text-center">{t('admin.rigs_count')}</th>
                                            <th className="p-4 font-bold text-right text-emerald-400">{t('admin.daily_profit')}</th>
                                            <th className="p-4 font-bold text-center">{t('admin.status')}</th>
                                            <th className="p-4 font-bold text-right">{t('admin.management')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-800">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-stone-800/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.role?.includes('ADMIN') ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-stone-800 text-stone-400'}`}>
                                                            {u.username.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-sm flex items-center gap-2">
                                                                {u.username}
                                                                {u.role?.includes('ADMIN') && <span className="text-[10px] bg-red-900/40 text-red-400 px-1 rounded border border-red-900/50">ADMIN</span>}
                                                                {u.inventory?.some((i: any) => i.typeId === 'vip_withdrawal_card') && (
                                                                    <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded border border-yellow-500/30 font-black shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                                                                        <CreditCard size={10} />
                                                                        VIP
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-stone-500 font-mono">ID: {u.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {u.role?.includes('ADMIN') ? (
                                                        <span className="text-stone-600 font-bold">-</span>
                                                    ) : (
                                                        <>
                                                            <div className="font-mono font-bold text-emerald-400 text-sm">{Math.floor(u.balance).toLocaleString()}</div>
                                                            <div className="text-[10px] text-stone-600">{CURRENCY}</div>
                                                        </>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="inline-flex items-center gap-1 bg-stone-900 px-2 py-1 rounded border border-stone-800">
                                                        <Hammer size={10} className="text-yellow-500" />
                                                        <span className="text-xs font-bold text-stone-300">{getRigsForUser(u.id).length}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="font-mono font-bold text-emerald-400 text-sm">+{Math.floor(getDailyProfitForUser(u.id)).toLocaleString()}</div>
                                                    <div className="text-[10px] text-stone-600">{CURRENCY}/Day</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${u.isBanned ? 'bg-red-900/20 text-red-500 border-red-900/30' : 'bg-emerald-900/20 text-emerald-500 border-emerald-900/30'}`}>
                                                        {u.isBanned ? 'BANNED' : 'Active'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        className="text-stone-500 hover:text-white p-2 rounded hover:bg-stone-800 transition-colors"
                                                        title="View Details"
                                                        onClick={() => handleSelectUser(u)}
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredUsers.length === 0 && (
                                <div className="p-8 text-center text-stone-500 text-sm">
                                    {t('admin.no_user_found')}
                                </div>
                            )}
                        </div>


                        {/* === ECONOMY CONTROL === */}
                        <div id="economy-control" className="bg-stone-900 border border-stone-800 shadow-xl rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-6 border-b border-stone-800 pb-4">
                                <Coins size={24} className="text-yellow-500" />
                                <h3 className="text-xl font-bold text-white">{t('admin.economy_control')}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Add Item Form */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest">{t('admin.add_item')}</h4>
                                    <div className="space-y-3">
                                        <div className="flex bg-stone-950 p-1 rounded border border-stone-800">
                                            <button
                                                className={`flex-1 py-1 text-xs font-bold rounded transition-all ${economyForm.itemScope === 'SINGLE' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:text-stone-300'}`}
                                                onClick={() => setEconomyForm({ ...economyForm, itemScope: 'SINGLE' })}
                                            >
                                                รายบุคคล (Single)
                                            </button>
                                            <button
                                                className={`flex-1 py-1 text-xs font-bold rounded transition-all ${economyForm.itemScope === 'ALL' ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-900/50' : 'text-stone-500 hover:text-stone-300'}`}
                                                onClick={() => setEconomyForm({ ...economyForm, itemScope: 'ALL' })}
                                            >
                                                ทั้งหมด (All Users)
                                            </button>
                                        </div>

                                        {economyForm.itemScope === 'SINGLE' && (
                                            <input
                                                type="text"
                                                placeholder="User ID / Username"
                                                className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none"
                                                value={economyForm.targetUser}
                                                onChange={e => setEconomyForm({ ...economyForm, targetUser: e.target.value })}
                                            />
                                        )}
                                        <select
                                            className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none"
                                            value={economyForm.itemId}
                                            onChange={e => setEconomyForm({ ...economyForm, itemId: e.target.value })}
                                        >
                                            <option value="">{t('admin.choose_item')}</option>
                                            <optgroup label="Items & Equipment">
                                                {SHOP_ITEMS.map(item => (
                                                    <option key={item.id} value={item.id}>{getLocalized(item.name)} ({item.id})</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="Materials">
                                                {Object.entries(MATERIAL_CONFIG.NAMES).map(([id, name]) => (
                                                    <option key={`mat-${id}`} value={`material_${id}`}>{getLocalized(name)} (Tier {id})</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="ข้อความ (Optional)"
                                            className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none"
                                            value={economyForm.message}
                                            onChange={e => setEconomyForm({ ...economyForm, message: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            placeholder={t('admin.amount')}
                                            className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none"
                                            value={economyForm.itemAmount}
                                            onChange={e => setEconomyForm({ ...economyForm, itemAmount: parseInt(e.target.value) || 1 })}
                                        />
                                        <button
                                            className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-stone-800 disabled:text-stone-600 text-stone-900 font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
                                            onClick={handleAddItem}
                                            disabled={economyForm.itemScope === 'SINGLE' && !economyForm.targetUser}
                                        >
                                            {economyForm.itemScope === 'SINGLE' && !economyForm.targetUser && <AlertTriangle size={16} className="text-yellow-600" />}
                                            {t('admin.send_item')}
                                        </button>
                                    </div>
                                </div>

                                {/* Give Compensation Form */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest">{t('admin.compensation')}</h4>
                                        <span className="text-xs text-emerald-500 font-mono">{t('admin.server_issues_refunds')}</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex bg-stone-950 p-1 rounded border border-stone-800">
                                            <button
                                                className={`flex-1 py-1 text-xs font-bold rounded transition-all ${economyForm.compScope === 'SINGLE' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:text-stone-300'}`}
                                                onClick={() => setEconomyForm({ ...economyForm, compScope: 'SINGLE' })}
                                            >
                                                ไอดีเดียว (Single)
                                            </button>
                                            <button
                                                className={`flex-1 py-1 text-xs font-bold rounded transition-all ${economyForm.compScope === 'ALL' ? 'bg-red-900/40 text-red-400 border border-red-900/50' : 'text-stone-500 hover:text-stone-300'}`}
                                                onClick={() => setEconomyForm({ ...economyForm, compScope: 'ALL' })}
                                            >
                                                ทั้งหมด (All Users)
                                            </button>
                                        </div>

                                        {economyForm.compScope === 'SINGLE' && (
                                            <input
                                                type="text"
                                                placeholder="User ID / Username"
                                                className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none"
                                                value={economyForm.compUser}
                                                onChange={e => setEconomyForm({ ...economyForm, compUser: e.target.value })}
                                            />
                                        )}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="sm:w-1/3 bg-emerald-900/20 border border-emerald-900/50 rounded p-3 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                                {t('admin.add_funds')}
                                            </div>
                                            <div className="flex bg-stone-950 border border-stone-700 rounded overflow-hidden shadow-lg shrink-0">
                                                <button
                                                    className={`px-3 py-1 text-xs font-bold transition-colors ${compCurrency === 'THB' ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-stone-500 hover:text-stone-300'}`}
                                                    onClick={() => setCompCurrency('THB')}
                                                >
                                                    {CURRENCY}
                                                </button>
                                                <button
                                                    className={`px-3 py-1 text-xs font-bold transition-colors ${compCurrency === 'USDT' ? 'bg-blue-600 text-white' : 'bg-stone-900 text-stone-500 hover:text-stone-300'}`}
                                                    onClick={() => setCompCurrency('USDT')}
                                                >
                                                    USDT
                                                </button>
                                            </div>
                                            <input
                                                type="number"
                                                placeholder={`${t('admin.amount')} (${compCurrency})`}
                                                className="flex-1 bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none"
                                                value={economyForm.compAmount || ''}
                                                onChange={e => setEconomyForm({ ...economyForm, compAmount: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={t('admin.comp_reason_placeholder')}
                                            className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none"
                                            value={economyForm.compReason}
                                            onChange={e => setEconomyForm({ ...economyForm, compReason: e.target.value })}
                                        />
                                        <button
                                            className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:bg-stone-800 disabled:text-stone-600 disabled:border-transparent text-white font-bold py-3 rounded border border-emerald-600 transition-colors flex items-center justify-center gap-2"
                                            onClick={handleGiveCompensation}
                                            disabled={economyForm.compScope === 'SINGLE' && !economyForm.compUser}
                                        >
                                            {economyForm.compScope === 'SINGLE' && !economyForm.compUser && <AlertTriangle size={16} className="text-yellow-600" />}
                                            {t('admin.confirm_comp')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* === GAME CONFIG === */}
                        <div id="game-config" className="bg-stone-900 border border-stone-800 shadow-xl rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-6 border-b border-stone-800 pb-4">
                                <LayoutDashboard size={24} className="text-purple-400" />
                                <h3 className="text-xl font-bold text-white">{t('admin.game_config')}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Drop Rate */}
                                <div className="bg-stone-950 p-4 rounded border border-stone-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-stone-400 font-bold text-sm">{t('admin.drop_rate')}</span>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={gameConfig.dropRate}
                                                onChange={(e) => handleConfigChange('dropRate', Number(e.target.value))}
                                                className="w-16 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-right font-mono text-emerald-400 focus:border-emerald-500 outline-none text-sm"
                                            />
                                            <span className="text-stone-600 text-xs">%</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={gameConfig.dropRate}
                                        onChange={(e) => handleConfigChange('dropRate', Number(e.target.value))}
                                        className="w-full accent-emerald-500 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Tax Rate */}
                                <div className="bg-stone-950 p-4 rounded border border-stone-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-stone-400 font-bold text-sm">{t('admin.tax_rate')}</span>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={gameConfig.taxRate}
                                                onChange={(e) => handleConfigChange('taxRate', Number(e.target.value))}
                                                className="w-16 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-right font-mono text-red-400 focus:border-red-500 outline-none text-sm"
                                            />
                                            <span className="text-stone-600 text-xs">%</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="50"
                                        value={gameConfig.taxRate}
                                        onChange={(e) => handleConfigChange('taxRate', Number(e.target.value))}
                                        className="w-full accent-red-500 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="bg-stone-950 p-4 rounded border border-stone-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-stone-400 font-bold text-sm">{t('admin.repair_cost')}</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-stone-600 text-xs">x</span>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={gameConfig.repairCost}
                                                onChange={(e) => handleConfigChange('repairCost', Number(e.target.value))}
                                                className="w-16 bg-stone-900 border border-stone-700 rounded px-2 py-1 text-right font-mono text-yellow-400 focus:border-yellow-500 outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1" max="5.0" step="0.1"
                                        value={gameConfig.repairCost}
                                        onChange={(e) => handleConfigChange('repairCost', Number(e.target.value))}
                                        className="w-full accent-yellow-500 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div className="bg-stone-950 p-4 rounded border border-stone-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-stone-400 font-bold text-sm">USDT (BEP-20) Wallet</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={systemUsdtWallet}
                                            onChange={(e) => setSystemUsdtWallet(e.target.value)}
                                            placeholder="0x..."
                                            className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 font-mono text-blue-400 focus:border-blue-500 outline-none text-xs"
                                        />
                                        <button
                                            onClick={handleUpdateUsdtWallet}
                                            className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1 rounded border border-stone-700 text-xs font-bold transition-colors"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-6 py-2 rounded font-bold transition-colors" onClick={() => alert(t('admin.config_saved'))}>
                                    {t('admin.save_config')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Chat System for Admin */}
            <ChatSystem currentUser={currentUser} />
        </div>
    );
};

function ReferralNetworkView({ data, isLoading }: { data: any, isLoading: boolean }) {
    if (isLoading) return (
        <div className="p-12 flex flex-col items-center justify-center gap-4 text-stone-500 animate-pulse">
            <div className="w-10 h-10 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            <div className="font-mono tracking-widest uppercase text-xs">FETCHING NETWORK DATA...</div>
        </div>
    );

    if (!data) return (
        <div className="p-12 text-center text-stone-500 border-2 border-dashed border-stone-800 rounded-xl">
            No network data available for this user.
        </div>
    );

    const { network, actualCounts } = data;

    return (
        <div className="space-y-4 animate-in fade-in duration-500 mt-4">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-stone-900 border border-stone-800 p-3 rounded-lg">
                    <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">Total Network</div>
                    <div className="text-xl font-bold text-white">{data.totalCount || 0}</div>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-lg">
                    <div className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Level 1</div>
                    <div className="text-xl font-bold text-emerald-400">{actualCounts?.l1 || 0}</div>
                </div>
                <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-lg">
                    <div className="text-[10px] text-blue-500 uppercase font-bold mb-1">Level 2</div>
                    <div className="text-xl font-bold text-blue-400">{actualCounts?.l2 || 0}</div>
                </div>
                <div className="bg-purple-950/20 border border-purple-900/30 p-3 rounded-lg">
                    <div className="text-[10px] text-purple-500 uppercase font-bold mb-1">Level 3</div>
                    <div className="text-xl font-bold text-purple-400">{actualCounts?.l3 || 0}</div>
                </div>
            </div>

            {/* Level 1 Members */}
            {network.l1.length > 0 && (
                <div className="space-y-2">
                    <div className="text-[10px] font-bold text-emerald-500 bg-emerald-900/20 px-3 py-1 rounded w-fit">LEVEL 1 MEMBERS</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {network.l1.map((u: any) => (
                            <div key={u.id} className="bg-stone-900 border border-stone-800 p-2 rounded flex justify-between items-center">
                                <div className="text-xs font-bold text-stone-200">{u.username}</div>
                                <div className="text-[10px] text-emerald-500">{u.invitedCount}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Level 2 Members */}
            {network.l2.length > 0 && (
                <div className="space-y-2">
                    <div className="text-[10px] font-bold text-blue-500 bg-blue-900/20 px-3 py-1 rounded w-fit">LEVEL 2 MEMBERS</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {network.l2.map((u: any) => (
                            <div key={u.id} className="bg-stone-900 border border-stone-800 p-2 rounded flex justify-between items-center opacity-80">
                                <div className="text-xs font-bold text-stone-300">{u.username}</div>
                                <div className="text-[10px] text-blue-500">{u.invitedCount}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Level 3 Members */}
            {network.l3.length > 0 && (
                <div className="space-y-2">
                    <div className="text-[10px] font-bold text-purple-500 bg-purple-900/20 px-3 py-1 rounded w-fit">LEVEL 3 MEMBERS</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {network.l3.map((u: any) => (
                            <div key={u.id} className="bg-stone-900 border border-stone-800 p-2 rounded flex justify-between items-center opacity-70">
                                <div className="text-xs font-bold text-stone-400">{u.username}</div>
                                <div className="text-[10px] text-purple-500">{u.invitedCount}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}