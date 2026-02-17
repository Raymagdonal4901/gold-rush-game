import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Transaction, User, AccessoryItem } from '../services/types';
import { useLanguage } from '../contexts/LanguageContext';
import { CreditCard, Wallet as WalletIcon, ArrowLeft } from 'lucide-react';

interface WalletPageProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onBack: () => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ user, onUpdateUser, onBack }) => {
    const { t, formatCurrency, language, getLocalized } = useLanguage();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const [amount, setAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');

    // Legacy translations for old records (Synced from HistoryModal.tsx)
    const LEGACY_TRANSLATIONS: Record<string, string> = {
        "ฝากเงินผ่านระบบ": "Deposit via System",
        "ซื้อเครื่องจักร: เครื่องขุดถ่านหิน": "Purchase Rig: Coal Miner",
        "เร่งพลังการผลิต (Overclock 48 ชม.)": "Overclock (48 Hours)",
        "เติมพลังงาน": "Energy Refill",
        "ซ่อมแซมเครื่องขุด": "Repair Rig",
        "ขายไอเทม": "Sell Item",
        "อัพเกรดไอเทม": "Upgrade Item",
        "สร้างไอเทม": "Craft Item",
        "รางวัลภารกิจ": "Mission Reward",
        "รางวัลจัดอันดับ": "Rank Reward",
        "สุ่มกาชา": "Lucky Draw",
        "เข้าดันเจี้ยน": "Dungeon Entry",
        "รางวัลจากดันเจี้ยน": "Dungeon Reward",
        "รับของขวัญ": "Claim Gift",
        "เก็บแร่": "Collect Material",
        "ภาษีตลาด": "Market Tax",
        "อัพเกรด": "Upgrade",
        "เป็น": "to",
        "ใช้": "Using",
        "ชิ้น": "Units",
        "เก็บผลผลิตจากเครื่องขุด": "Claim Mining Yield",
        "รวมเครื่องขุด": "Merge Rigs",
        "ซ่อมบำรุงเครื่องขุด": "Repair Rig",
        "ซื้อแร่": "Buy Material",
        "ค่าธรรมเนียมตลาดจากการซื้อ": "Market Tax (Purchase)"
    };

    const getLocalizedDescription = (desc: string) => {
        try {
            // 1. Try parsing dictionary JSON (New format)
            if (desc.trim().startsWith('{') && desc.includes('"th":') && desc.includes('"en":')) {
                const obj = JSON.parse(desc);
                return getLocalized ? getLocalized(obj) : obj[language] || obj.en;
            }
        } catch (e) {
            // Ignore parse error
        }

        // 2. Fallback to Legacy Mapping (If English is selected but desc is Thai)
        if (language === 'en') {
            let result = desc;

            // Handle dynamic patterns with regex first
            // 2.1 Upgrade: "อัพเกรด [NAME] เป็น Lv.[X] (ใช้ [MATERIAL] x[Y])"
            if (result.includes("อัพเกรด") && result.includes("เป็น Lv.")) {
                result = result.replace(/อัพเกรด/g, "Upgrade")
                    .replace(/เป็น/g, "to")
                    .replace(/ใช้/g, "Using");
            }

            // 2.2 Material units: "(X ชิ้น)"
            if (result.includes("ชิ้น")) {
                result = result.replace(/(\d+)\s*ชิ้น/g, "$1 Units");
            }

            // 2.3 Store patterns: "ซื้อแร่: [NAME] (X Units)"
            if (result.includes("ซื้อแร่")) {
                result = result.replace(/ซื้อแร่/g, "Buy Material");
            }

            // 2.4 Claim Yield: "เก็บผลผลิตจากเครื่องขุด: [NAME] (X THB)"
            if (result.includes("เก็บผลผลิตจากเครื่องขุด")) {
                result = result.replace(/เก็บผลผลิตจากเครื่องขุด/g, "Claim Mining Yield");
            }

            // 2.5 Repair: "ซ่อมบำรุงเครื่องขุด: [NAME]"
            if (result.includes("ซ่อมบำรุงเครื่องขุด")) {
                result = result.replace(/ซ่อมบำรุงเครื่องขุด/g, "Repair Rig");
            }

            // 2.6 Market Fee: "ค่าธรรมเนียมตลาดจากการซื้อ: [NAME] (X Units)"
            if (result.includes("ค่าธรรมเนียมตลาดจากการซื้อ")) {
                result = result.replace(/ค่าธรรมเนียมตลาดจากการซื้อ/g, "Market Fee (Purchase)");
            }

            // 2.7 Merge: "รวมเครื่องขุด: [NAME] Rank X (Fee: Y)"
            if (result.includes("รวมเครื่องขุด")) {
                result = result.replace(/รวมเครื่องขุด/g, "Merge Rigs");
            }

            // Use the dictionary for remaining replacements
            for (const [key, val] of Object.entries(LEGACY_TRANSLATIONS)) {
                if (result.includes(key)) {
                    result = result.replace(new RegExp(key, 'g'), val);
                }
            }

            return result;
        }

        // 3. Return original for TH or unknown
        return desc;
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const history = await api.wallet.getHistory();
            setTransactions(history);
        } catch (error) {
            console.error('Failed to fetch wallet history', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (numAmount < 100) return alert(t('wallet.min_withdraw_error'));
        if (numAmount > user.balance) return alert(t('market.insufficient_funds'));

        setIsSubmitting(true);
        try {
            const res = await api.wallet.requestWithdraw(numAmount, {
                bankName,
                accountNumber,
                accountName
            });
            alert(res.message);
            setShowWithdrawModal(false);
            // Refresh user and history
            const updatedUser = await api.getMe();
            onUpdateUser(updatedUser);
            fetchHistory();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Withdrawal failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">{t('history.status_completed')}</span>;
            case 'PENDING':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">{t('history.status_pending')}</span>;
            case 'REJECTED':
            case 'FAILED':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">{t('history.status_rejected')}</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-500/20 text-stone-400 border border-stone-500/30">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-200 font-sans selection:bg-yellow-500/30">
            {/* Header */}
            <div className="bg-stone-900/50 border-b border-stone-800/50 sticky top-0 z-30 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-stone-400 hover:text-yellow-500 transition-colors group shrink-0"
                    >
                        <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center group-hover:bg-yellow-500/10 transition-all border border-stone-700/50 group-hover:border-yellow-500/30">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">{t('common.back_to_mine')}</span>
                    </button>
                    <div className="flex-1"></div> {/* Spacer to keep layout balanced if needed, or just let it be */}
                    <div className="w-10 sm:w-24 shrink-0"></div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 py-4 sm:py-8 overflow-hidden w-full">
                {/* Balance Card */}
                <div className="relative overflow-hidden group mb-4 sm:mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-4 sm:p-8 rounded-2xl bg-stone-900/40 border border-yellow-500/30 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-stone-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1 sm:mb-2">{t('wallet.available_balance')}</p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter flex flex-wrap items-baseline justify-center md:justify-start gap-1 sm:gap-2">
                                {language === 'th' ? formatCurrency(user.balance) : formatCurrency(user.balance)}
                                {language === 'th' && <span className="text-yellow-500 text-lg sm:text-xl uppercase">{t('common.thb')}</span>}
                            </h2>
                        </div>
                        {/* Withdraw Button Moved to Dashboard */}
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-stone-900/30 rounded-2xl border border-stone-800/50 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-stone-800/50 flex flex-wrap items-center justify-between gap-4 bg-stone-900/20">
                        <h3 className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                            <i className="fas fa-history text-yellow-500"></i>
                            {t('wallet.transaction_history')}
                        </h3>
                        <button onClick={fetchHistory} className="text-stone-500 hover:text-yellow-500 transition-colors">
                            <i className={`fas fa-sync-alt ${isLoading ? 'animate-spin' : ''}`}></i>
                        </button>
                    </div>

                    <div className="overflow-x-auto w-full custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[8px] sm:text-[10px] font-black text-stone-500 uppercase tracking-widest bg-stone-900/40">
                                    <th className="px-3 py-3 sm:px-6 sm:py-4">{t('wallet.date_time')}</th>
                                    <th className="px-3 py-3 sm:px-6 sm:py-4">{t('wallet.description')}</th>
                                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-right">{t('common.amount')}</th>
                                    <th className="px-3 py-3 sm:px-6 sm:py-4 text-center">{t('wallet.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-800/40">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-stone-500 italic text-sm">
                                            {t('wallet.loading')}
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-stone-500 italic text-sm">
                                            {t('wallet.no_history')}
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-white/5 transition-colors group border-b border-stone-800/20 last:border-0">
                                            <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                                <div className="text-[10px] sm:text-xs font-medium text-stone-400">{new Date(tx.timestamp).toLocaleDateString()}</div>
                                                <div className="text-[8px] sm:text-[10px] text-stone-600">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-3 py-3 sm:px-6 sm:py-4">
                                                <p className="text-[10px] sm:text-xs text-stone-300 max-w-[120px] sm:max-w-xs truncate">{getLocalizedDescription(tx.description)}</p>
                                            </td>
                                            <td className={`px-3 py-3 sm:px-6 sm:py-4 text-right font-bold text-xs sm:text-sm whitespace-nowrap ${tx.amount < 0 || tx.type === 'WITHDRAWAL' ? 'text-red-400' : 'text-green-400'}`}>
                                                {(tx.type === 'WITHDRAWAL' || tx.amount < 0) ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                                            </td>
                                            <td className="px-3 py-3 sm:px-6 sm:py-4 text-center uppercase tracking-tighter sm:tracking-normal">
                                                {getStatusBadge(tx.status)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-stone-950/80 animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-stone-900 border border-yellow-500/30 rounded-2xl overflow-hidden shadow-2xl scale-in duration-300">
                        <div className="p-6 border-b border-stone-800">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-black text-yellow-500 uppercase tracking-widest">{t('wallet.withdraw_modal_title')}</h3>
                                <button onClick={() => setShowWithdrawModal(false)} className="text-stone-500 hover:text-white transition-colors">
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <p className="text-xs text-stone-400">{t('wallet.withdraw_modal_desc')}</p>
                        </div>
                        <form onSubmit={handleWithdraw} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">{t('wallet.amount_placeholder')} ({t('common.usd')})</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Min 100"
                                        required
                                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all"
                                    />
                                    <span className="absolute right-4 top-3 text-stone-600 font-bold text-xs">{t('common.usd')}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">{t('wallet.bank_name')}</label>
                                    <input
                                        type="text"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        placeholder={t('wallet.bank_placeholder')}
                                        required
                                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm focus:border-yellow-500/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">{t('wallet.account_number')}</label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        placeholder={t('wallet.account_placeholder')}
                                        required
                                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm focus:border-yellow-500/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">{t('wallet.account_name')}</label>
                                    <input
                                        type="text"
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        placeholder={t('wallet.account_name_placeholder')}
                                        required
                                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm focus:border-yellow-500/50 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    disabled={isSubmitting}
                                    className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-black py-4 rounded-xl transition-all uppercase tracking-[0.2em] text-xs"
                                >
                                    {isSubmitting ? t('wallet.processing') : t('wallet.confirm_request')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
