import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Transaction, User, AccessoryItem } from '../services/types';
import { useLanguage } from '../contexts/LanguageContext';
import { CreditCard, Wallet as WalletIcon } from 'lucide-react';

interface WalletPageProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onBack: () => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ user, onUpdateUser, onBack }) => {
    const { t, formatCurrency, language } = useLanguage();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const [amount, setAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');

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
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-stone-400 hover:text-yellow-500 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center group-hover:bg-yellow-500/10 transition-colors">
                            <i className="fas fa-arrow-left text-xs"></i>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">{t('common.back_to_mine')}</span>
                    </button>
                    <div className="text-center">
                        <h1 className="text-sm font-black text-yellow-500 tracking-[0.3em] uppercase">{t('wallet.title')}</h1>
                    </div>
                    <div className="w-24"></div> {/* Spacer */}
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Balance Card */}
                <div className="relative overflow-hidden group mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-8 rounded-2xl bg-stone-900/40 border border-yellow-500/30 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <p className="text-stone-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{t('wallet.available_balance')}</p>
                            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                                {formatCurrency(user.balance)} <span className="text-yellow-500 text-2xl">{t('common.thb')}</span>
                            </h2>
                        </div>
                        {/* Withdraw Button Moved to Dashboard */}
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-stone-900/30 rounded-2xl border border-stone-800/50 overflow-hidden">
                    <div className="p-6 border-b border-stone-800/50 flex items-center justify-between bg-stone-900/20">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                            <i className="fas fa-history text-yellow-500"></i>
                            {t('wallet.transaction_history')}
                        </h3>
                        <button onClick={fetchHistory} className="text-stone-500 hover:text-yellow-500 transition-colors">
                            <i className={`fas fa-sync-alt ${isLoading ? 'animate-spin' : ''}`}></i>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-stone-500 uppercase tracking-widest bg-stone-900/40">
                                    <th className="px-6 py-4">{t('wallet.date_time')}</th>
                                    <th className="px-6 py-4">{t('wallet.type')}</th>
                                    <th className="px-6 py-4">{t('wallet.description')}</th>
                                    <th className="px-6 py-4 text-right">{t('common.amount')}</th>
                                    <th className="px-6 py-4 text-center">{t('wallet.status')}</th>
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
                                        <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs font-medium text-stone-400">{new Date(tx.timestamp).toLocaleDateString()}</div>
                                                <div className="text-[10px] text-stone-600">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black tracking-widest uppercase text-yellow-500/70">{tx.type}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-stone-300 max-w-xs truncate">{tx.description}</p>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold text-sm ${tx.amount < 0 || tx.type === 'WITHDRAWAL' ? 'text-red-400' : 'text-green-400'}`}>
                                                {(tx.type === 'WITHDRAWAL' || tx.amount < 0) ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                                            </td>
                                            <td className="px-6 py-4 text-center">
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
                                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">{t('wallet.amount_placeholder')} ({t('common.thb')})</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Min 100"
                                        required
                                        className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all"
                                    />
                                    <span className="absolute right-4 top-3 text-stone-600 font-bold text-xs">{t('common.thb')}</span>
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
