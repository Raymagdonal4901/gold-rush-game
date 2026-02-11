import React, { useState, useRef, useEffect } from 'react';
import { X, Wallet, Send, QrCode, Upload, Image as ImageIcon, AlertTriangle, CheckCircle, ArrowRight, Percent, Clock } from 'lucide-react';
import { CURRENCY, TRANSACTION_LIMITS, WITHDRAWAL_FEE_PERCENT, EXCHANGE_RATE_USD_THB, USDT_WITHDRAW_LIMITS } from '../constants';
import { PinModal } from './PinModal';
import { useTranslation } from './LanguageContext';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    walletBalance: number;
    onWithdraw: (amount: number, pin: string, method: 'BANK' | 'USDT', walletAddress?: string) => void;
    savedQrCode?: string; // Add saved QR Code prop
    onSaveQr: (base64: string) => void; // Handler to save QR
    currentWalletAddress?: string; // Add current wallet address prop
    inventory?: any[];
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
    isOpen,
    onClose,
    walletBalance,
    onWithdraw,
    savedQrCode,
    onSaveQr,
    currentWalletAddress,
    inventory
}) => {
    const { t, language, formatCurrency } = useTranslation();
    const [amount, setAmount] = useState<string>('');
    const [method, setMethod] = useState<'BANK' | 'USDT'>('BANK');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);
    const [walletAddressInput, setWalletAddressInput] = useState(currentWalletAddress || '');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setIsConfirming(false);
            setShowPinModal(false);
            setAmount('');
            setWalletAddressInput(currentWalletAddress || '');
        }
    }, [isOpen, currentWalletAddress]);

    if (!isOpen) return null;

    // --- Mode 1: Setup QR Code (If not exists) ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveQr = () => {
        if (previewUrl) {
            onSaveQr(previewUrl);
            // Note: The parent component will update savedQrCode, triggering a re-render to Mode 2
        }
    };

    // --- Mode 2: Withdraw Form ---
    const handleWithdrawClick = () => {
        const val = parseFloat(amount);
        const isUSDT = method === 'USDT';
        // Normalize value to USD for limit checks
        const systemAmount = isUSDT ? val : Number((val / EXCHANGE_RATE_USD_THB).toFixed(8));
        const currentLimits = isUSDT ? USDT_WITHDRAW_LIMITS : TRANSACTION_LIMITS.WITHDRAW;

        if (!isNaN(val) && systemAmount >= currentLimits.MIN && systemAmount <= currentLimits.MAX && systemAmount <= walletBalance) {
            setIsConfirming(true);
        }
    };

    const handleConfirmWithdraw = () => {
        const val = parseFloat(amount);
        const isUSDT = method === 'USDT';
        const systemAmount = isUSDT ? val : Number((val / EXCHANGE_RATE_USD_THB).toFixed(8));

        if (!isNaN(systemAmount) && systemAmount > 0 && systemAmount <= walletBalance) {
            onWithdraw(systemAmount, "", method, isUSDT ? walletAddressInput : undefined);
            setAmount('');
            setIsConfirming(false);
            onClose();
        }
    };

    const handlePinSuccess = (pin: string) => {
        const val = parseFloat(amount);
        const isUSDT = method === 'USDT';
        const systemAmount = isUSDT ? val : Number((val / EXCHANGE_RATE_USD_THB).toFixed(8));

        if (!isNaN(systemAmount) && systemAmount > 0 && systemAmount <= walletBalance) {
            onWithdraw(systemAmount, pin, method, isUSDT ? walletAddressInput : undefined);
            setAmount('');
            setIsConfirming(false);
            setShowPinModal(false);
            onClose();
        }
    };

    const setMaxAmount = () => {
        const isUSDT = method === 'USDT';
        const currentLimits = isUSDT ? USDT_WITHDRAW_LIMITS : TRANSACTION_LIMITS.WITHDRAW;
        const maxLimitUSD = currentLimits.MAX;
        const maxWithdrawalUSD = Math.min(walletBalance, maxLimitUSD);
        let maxDisplay = isUSDT ? maxWithdrawalUSD : maxWithdrawalUSD * EXCHANGE_RATE_USD_THB;

        // Fix floating point errors for display (e.g., 999.99999995 -> 1000)
        if (!isUSDT && Math.abs(maxDisplay - Math.round(maxDisplay)) < 0.001) {
            maxDisplay = Math.round(maxDisplay);
        }

        setAmount(maxDisplay.toFixed(isUSDT ? 4 : 2));
    };

    // Calculations (in system USD units for formatCurrency)
    const isUSDT = method === 'USDT';
    const exchangeRate = isUSDT ? EXCHANGE_RATE_USD_THB : 1;
    const displayBalance = walletBalance;
    const rawVal = parseFloat(amount) || 0;
    const systemAmount = isUSDT ? rawVal : Number((rawVal / EXCHANGE_RATE_USD_THB).toFixed(8));
    const feePercent = WITHDRAWAL_FEE_PERCENT;
    const systemFee = systemAmount * feePercent;
    const systemNetReceived = systemAmount - systemFee;
    const currentLimits = isUSDT ? USDT_WITHDRAW_LIMITS : TRANSACTION_LIMITS.WITHDRAW;
    const maxWithdrawDisplay = isUSDT ? USDT_WITHDRAW_LIMITS.MAX : TRANSACTION_LIMITS.WITHDRAW.MAX;
    const minWithdrawDisplay = isUSDT ? USDT_WITHDRAW_LIMITS.MIN : TRANSACTION_LIMITS.WITHDRAW.MIN;

    // --- RENDER ---

    const isSetupMode = !savedQrCode;

    const hasVipCard = inventory?.some(i => i.typeId === 'vip_withdrawal_card');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {isSetupMode ? <QrCode className="text-yellow-500" /> : method === 'USDT' ? <Wallet className="text-blue-500" /> : <Wallet className="text-emerald-500" />}
                        {isSetupMode ? t('withdraw.status_setup') : isConfirming ? t('withdraw.status_confirm') : t('withdraw.title')}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {!hasVipCard && !isSetupMode && !isConfirming && (
                        <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-xl space-y-3 animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center gap-3 text-red-400">
                                <AlertTriangle size={24} />
                                <div className="font-bold text-sm uppercase tracking-wider">{language === 'th' ? 'ต้องใช้บัตร VIP' : 'VIP Card Required'}</div>
                            </div>
                            <p className="text-xs text-red-200/70 leading-relaxed">
                                {language === 'th'
                                    ? 'คุณต้องมี "บัตร VIP ปลดล็อกถอนเงิน" เพื่อถอนเงินออกจากระบบ โปรดซื้อบัตรที่ร้านค้าก่อนดำเนินการต่อ'
                                    : 'You need a "VIP Withdrawal Card" to withdraw money. Please purchase it from the shop before proceeding.'}
                            </p>
                        </div>
                    )}

                    {isSetupMode ? (
                        // --- VIEW 1: Upload QR ---
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-yellow-900/20 border border-yellow-700/30 p-4 rounded-lg flex gap-3">
                                <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                                <div className="text-xs text-yellow-200/80 leading-relaxed">
                                    <span className="font-bold text-yellow-500 block mb-1">{t('withdraw.action_required')}</span>
                                    {t('withdraw.setup_desc')}
                                </div>
                            </div>

                            <div
                                className="border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />

                                {previewUrl ? (
                                    <div className="relative w-32 h-32">
                                        <img src={previewUrl} alt="QR Preview" className="w-full h-full object-cover rounded-lg shadow-lg" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                            <Upload size={24} className="text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-3 text-slate-400">
                                            <ImageIcon size={32} />
                                        </div>
                                        <span className="text-slate-300 font-bold text-sm">{t('withdraw.tap_upload')}</span>
                                        <span className="text-slate-500 text-xs mt-1">{t('withdraw.support_formats')}</span>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={handleSaveQr}
                                disabled={!previewUrl}
                                className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-700 disabled:text-slate-500 text-stone-900 font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all font-display tracking-wide"
                            >
                                <CheckCircle size={18} /> {t('withdraw.save_account')}
                            </button>
                        </div>
                    ) : isConfirming ? (
                        // --- VIEW 3: Confirmation ---
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
                            <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                                <ArrowRight size={32} className="text-emerald-500" />
                            </div>

                            <h3 className="text-stone-300 font-medium mb-1">{t('withdraw.actual_receive')}</h3>
                            <div className="text-4xl font-mono font-bold text-white mb-2">
                                {isUSDT ? `${systemNetReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT` : formatCurrency(systemNetReceived)}
                                <div className="text-sm text-emerald-500 font-mono mt-1">
                                    ≈ {isUSDT ? formatCurrency(systemNetReceived * EXCHANGE_RATE_USD_THB) : formatCurrency(systemNetReceived, { forceUSD: true })}
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 mb-4 text-xs space-y-2">
                                <div className="flex justify-between text-stone-400">
                                    <span>{t('withdraw.withdraw_amount')}</span>
                                    <span>{isUSDT ? `${systemAmount.toLocaleString()} USDT` : formatCurrency(systemAmount)}</span>
                                </div>
                                <div className="flex justify-between text-red-400">
                                    <span>{t('withdraw.fee')} ({WITHDRAWAL_FEE_PERCENT * 100}%)</span>
                                    <span>-{isUSDT ? `${systemFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT` : formatCurrency(systemFee)}</span>
                                </div>
                                <div className="h-px bg-slate-700 my-1"></div>
                                <div className="flex justify-between text-emerald-400 font-bold">
                                    <span>{t('withdraw.net_received')}</span>
                                    <span>{isUSDT ? `${systemNetReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT` : formatCurrency(systemNetReceived)}</span>
                                </div>
                            </div>

                            {/* Warning Notice */}
                            <div className="bg-blue-900/20 border border-blue-900/50 p-3 rounded-lg flex items-start gap-2 mb-6 text-left">
                                <Clock className="text-blue-400 shrink-0 mt-0.5" size={16} />
                                <div className="text-xs text-blue-300/80">
                                    <span className="font-bold text-blue-400 block mb-0.5">{t('withdraw.processing_time')}</span>
                                    {t('withdraw.processing_period')}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsConfirming(false)}
                                    className="py-3 rounded-lg border border-slate-600 text-slate-400 font-bold hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleConfirmWithdraw}
                                    className="py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20"
                                >
                                    {t('common.confirm')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // --- VIEW 2: Withdraw Form ---
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Method Selector */}
                            {!isConfirming && (
                                <div className="flex bg-slate-900 p-1 rounded-xl mb-6 border border-slate-700">
                                    <button
                                        onClick={() => setMethod('BANK')}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${method === 'BANK' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        <ImageIcon size={16} /> {t('withdraw.bank_usd')}
                                    </button>
                                    <button
                                        onClick={() => setMethod('USDT')}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${method === 'USDT' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                                    >
                                        <Wallet size={16} /> USDT (BSC)
                                    </button>
                                </div>
                            )}

                            <div className="text-center space-y-1 mb-6">
                                <span className="text-sm text-slate-400">{t('withdraw.withdrawable_balance')}</span>
                                <div className="text-3xl font-bold text-white font-mono">
                                    {isUSDT ? `${displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT` : formatCurrency(walletBalance)}
                                    {isUSDT && (
                                        <div className="text-[10px] text-slate-500 font-sans font-normal mt-1">
                                            ≈ {formatCurrency(displayBalance)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {method === 'BANK' ? (
                                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white p-0.5 rounded flex items-center justify-center overflow-hidden shrink-0">
                                            <img src={savedQrCode} alt="Saved QR" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{t('withdraw.receiving_account')}</div>
                                            <div className="text-sm text-emerald-400 flex items-center gap-1 font-bold truncate">
                                                <CheckCircle size={12} /> {t('withdraw.qr_connected')}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-900/40 rounded flex items-center justify-center shrink-0">
                                                <Wallet size={20} className="text-blue-400" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">BSC Wallet</div>
                                                <div className="text-[10px] text-slate-400 truncate">
                                                    (BEP-20 Preferred)
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-1">
                                            <input
                                                type="text"
                                                value={walletAddressInput}
                                                onChange={(e) => setWalletAddressInput(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-xs font-mono text-blue-400 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">{t('withdraw.withdraw_amount')}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 text-white focus:border-emerald-500 outline-none transition-colors"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <span className="text-[10px] text-slate-500 font-bold">{isUSDT ? 'USDT' : '฿'}</span>
                                            <button
                                                onClick={setMaxAmount}
                                                className="text-xs bg-slate-700 hover:bg-slate-600 text-emerald-400 px-2 py-1 rounded"
                                            >
                                                {t('common.max')}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start text-[10px] text-slate-500">
                                        <span>{t('withdraw.fee')} {WITHDRAWAL_FEE_PERCENT * 100}%</span>
                                        <div className="text-right">
                                            <div>Min: {isUSDT ? `${minWithdrawDisplay} USDT` : formatCurrency(minWithdrawDisplay)}</div>
                                            <div>Max: {isUSDT ? `${maxWithdrawDisplay.toLocaleString()} USDT` : formatCurrency(maxWithdrawDisplay)}</div>
                                        </div>
                                    </div>

                                    {systemAmount > 0 && (
                                        <div className="text-xs text-right mt-1 font-bold text-emerald-500">
                                            {t('withdraw.net_received')}: {isUSDT ? `${systemNetReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT` : formatCurrency(Math.max(0, systemNetReceived))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-yellow-900/10 border border-yellow-800/30 p-2 rounded text-[10px] text-yellow-500/80 flex items-center gap-2">
                                    <Clock size={12} /> {t('withdraw.arrival_period')}
                                </div>
                            </div>

                            <button
                                onClick={handleWithdrawClick}
                                disabled={!hasVipCard || !amount || systemAmount < currentLimits.MIN || systemAmount > currentLimits.MAX || systemAmount > walletBalance || (isUSDT && !walletAddressInput)}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all mt-6"
                            >
                                {t('withdraw.title')} <Send size={18} />
                            </button>
                        </div>
                    )}

                </div>
            </div>

            <PinModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onSuccess={handlePinSuccess}
            />
        </div>
    );
};