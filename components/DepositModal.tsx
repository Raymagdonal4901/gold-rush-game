import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, ArrowRight, CheckCircle, Upload, AlertCircle, ScanLine, Clock, FileText, Copy } from 'lucide-react';
import { CURRENCY, TRANSACTION_LIMITS, EXCHANGE_RATE_USD_THB, EXCHANGE_RATE_USDT_THB } from '../constants';
import { api } from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';
import { User } from '../services/types';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onDepositSuccess: () => void;
    addNotification?: (n: any) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, user, onDepositSuccess, addNotification }) => {
    const { t, language, formatCurrency } = useTranslation();
    const [amount, setAmount] = useState('');
    const [depositCurrency, setDepositCurrency] = useState<'USD' | 'THB'>('THB');
    const [step, setStep] = useState<'INPUT' | 'PAYMENT' | 'SUCCESS'>('INPUT');
    const [systemQr, setSystemQr] = useState<string | null>(null);
    const [systemUsdtWallet, setSystemUsdtWallet] = useState<string | null>(null);
    const [slipFile, setSlipFile] = useState<File | null>(null);
    const [slipPreview, setSlipPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [method, setMethod] = useState<'BANK' | 'USDT'>('BANK');
    const [walletAddress, setWalletAddress] = useState(user?.walletAddress || '');
    const [isSavingWallet, setIsSavingWallet] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setStep('INPUT');
            setSlipFile(null);
            setSlipPreview(null);
            api.getSystemConfig().then(config => {
                setSystemQr(config.receivingQrCode || null);
                setSystemUsdtWallet(config.usdtWalletAddress || '0xc523c42cb3dce0df59b998d8ae899fa4132b6de7');
            }).catch(err => {
                console.error("Failed to load system config", err);
            });
        }
    }, [isOpen]);

    const copyUsdtWallet = () => {
        if (systemUsdtWallet) {
            navigator.clipboard.writeText(systemUsdtWallet);
            if (addNotification) {
                addNotification({
                    id: Date.now().toString(),
                    userId: user.id,
                    message: language === 'th' ? 'คัดลอกเลขกระเป๋าแล้ว!' : 'Wallet address copied!',
                    type: 'SUCCESS',
                    read: false,
                    timestamp: Date.now()
                });
            } else {
                alert(language === 'th' ? 'คัดลอกเลขกระเป๋าแล้ว!' : 'Wallet address copied!');
            }
        }
    };

    const handleNextStep = () => {
        const val = parseFloat(amount);
        const limits = depositCurrency === 'USD' ? (TRANSACTION_LIMITS as any).DEPOSIT_USD : TRANSACTION_LIMITS.DEPOSIT;

        if (isNaN(val) || val < limits.MIN || val > limits.MAX) return;
        setStep('PAYMENT');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSlipFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setSlipPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirmPayment = (isUSDT: boolean = false) => {
        if (!isUSDT && !slipPreview) return;
        if (!user || isLoading) return;

        setIsLoading(true);

        // Create Pending Request
        // Normalize all deposits to THB for backend (consistent with balance storage)
        let finalAmount = parseFloat(amount);
        if (depositCurrency === 'USD') {
            finalAmount = finalAmount * EXCHANGE_RATE_USDT_THB;
        }

        // For USDT we use a placeholder slip or indicate it's a USDT direct transfer
        const slipData = isUSDT ? "USDT_DIRECT_TRANSFER" : slipPreview!;

        api.createDepositRequest(
            finalAmount,
            slipData,
            isUSDT ? 'USDT' : 'BANK',
            isUSDT ? walletAddress : undefined
        ).then(() => {
            setStep('SUCCESS');
        }).catch(err => {
            console.error("Deposit failed", err);
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: t('common.error') + ": " + (err.response?.data?.message || err.message),
                type: 'ERROR',
                read: false,
                timestamp: Date.now()
            });
        }).finally(() => {
            setIsLoading(false);
        });
    };

    const handleUpdateWallet = () => {
        if (!walletAddress || isSavingWallet) return;
        setIsSavingWallet(true);
        api.user.updateProfile({ walletAddress }).then(() => {
            if (addNotification) addNotification({
                id: Date.now().toString(),
                userId: user.id,
                message: t('deposit.wallet_link_success'),
                type: 'SUCCESS',
                read: false,
                timestamp: Date.now()
            });
        }).catch(err => {
            console.error("Failed to update wallet", err);
        }).finally(() => {
            setIsSavingWallet(false);
        });
    };

    if (!isOpen) return null;

    const currentLimits = depositCurrency === 'USD' ? (TRANSACTION_LIMITS as any).DEPOSIT_USD : TRANSACTION_LIMITS.DEPOSIT;
    const quickAddValues = depositCurrency === 'USD' ? [10, 50, 100] : [500, 1000, 2000];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="bg-stone-900 border border-stone-700 w-[95%] sm:w-full sm:max-w-sm rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-900/40 to-stone-900 p-4 border-b border-emerald-900/30 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-500/10 p-2 rounded text-emerald-500">
                            <QrCode size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-none">{t('deposit.title')}</h2>
                            <span className="text-[10px] text-emerald-500/70 font-mono uppercase tracking-widest">{t('deposit.subtitle')}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">

                    {/* STEP 1: INPUT AMOUNT */}
                    {step === 'INPUT' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            <div className="text-center space-y-4">
                                <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 w-fit mx-auto">
                                    <button
                                        onClick={() => setDepositCurrency('USD')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${depositCurrency === 'USD' ? 'bg-stone-800 text-yellow-500 shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
                                    >
                                        USD
                                    </button>
                                    <button
                                        onClick={() => setDepositCurrency('THB')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${depositCurrency === 'THB' ? 'bg-stone-800 text-yellow-500 shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
                                    >
                                        THB
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-stone-400">{t('deposit.amount_label')}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            autoFocus
                                            className="w-full bg-stone-950 border border-stone-800 rounded-xl py-4 px-4 text-center text-3xl font-mono font-bold text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-stone-800"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-600 font-bold">{depositCurrency === 'THB' ? '฿' : '$'}</span>
                                    </div>
                                </div>
                                {depositCurrency === 'USD' && amount && !isNaN(parseFloat(amount)) && (
                                    <div className="flex items-center justify-center gap-2 text-stone-500 text-xs font-mono">
                                        <span>≈</span>
                                        <span className="text-emerald-500 font-bold">{(parseFloat(amount) * EXCHANGE_RATE_USDT_THB).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ฿</span>
                                    </div>
                                )}

                                <p className="text-xs text-stone-500">
                                    {t('common.min')} {depositCurrency === 'USD' ? `$${currentLimits.MIN}` : `${currentLimits.MIN.toLocaleString()} $`} - {t('common.max')} {depositCurrency === 'USD' ? `$${currentLimits.MAX}` : `${currentLimits.MAX.toLocaleString()} $`}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {quickAddValues.map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val.toString())}
                                        className="py-2 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold border border-stone-700 transition-colors"
                                    >
                                        +{val.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleNextStep}
                                disabled={!amount || parseFloat(amount) < currentLimits.MIN || parseFloat(amount) > currentLimits.MAX}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {t('deposit.proceed')} <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* METHOD SELECTION (New Step or part of INPUT) */}
                    {step === 'PAYMENT' && (
                        <div className="space-y-4 animate-in slide-in-from-right duration-300">
                            <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800">
                                <button
                                    onClick={() => setMethod('BANK')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${method === 'BANK' ? 'bg-emerald-600 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
                                >
                                    {t('deposit.method_bank')}
                                </button>
                                <button
                                    onClick={() => setMethod('USDT')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${method === 'USDT' ? 'bg-emerald-600 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300'}`}
                                >
                                    {t('deposit.method_usdt')}
                                </button>
                            </div>

                            <div className="space-y-6">
                                {method === 'USDT' && (
                                    <div className="space-y-4 text-center">
                                        <div className="bg-emerald-900/10 border border-emerald-500/30 p-4 rounded-xl">
                                            <p className="text-xs text-stone-400 mb-2">USDT Wallet Address (BEP-20)</p>
                                            <div className="flex gap-2 items-center bg-black/40 p-3 rounded border border-stone-800 break-all font-mono text-[10px] text-emerald-400">
                                                <span className="flex-1 select-all">{systemUsdtWallet}</span>
                                                <button
                                                    onClick={copyUsdtWallet}
                                                    className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded border border-emerald-500/30 transition-colors"
                                                    title="Copy Address"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-stone-500 mt-2 italic">* {t('deposit.wallet_hint') || 'Transfer USDT (BEP-20) to this wallet and upload slip'}</p>
                                        </div>

                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pl-1">{t('deposit.wallet_link_label')}</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={walletAddress}
                                                    onChange={(e) => setWalletAddress(e.target.value)}
                                                    placeholder="0x..."
                                                    className="flex-1 bg-stone-950 border border-stone-800 rounded-lg py-2 px-3 text-xs font-mono text-emerald-400 focus:border-emerald-500 outline-none"
                                                />
                                                <button
                                                    onClick={handleUpdateWallet}
                                                    disabled={isSavingWallet || !walletAddress}
                                                    className="px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-bold border border-stone-700 disabled:opacity-50"
                                                >
                                                    {isSavingWallet ? '...' : t('deposit.wallet_link_btn')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {method === 'BANK' && !systemQr ? (
                                    <div className="bg-red-900/20 border border-red-900/50 p-6 rounded-xl text-center">
                                        <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
                                        <p className="text-red-400 font-bold">{t('deposit.maintenance_title')}</p>
                                        <p className="text-stone-500 text-sm mt-1 text-center">{t('deposit.maintenance_desc')}</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* QR Section (Only for Bank) */}
                                        {method === 'BANK' && !slipFile && (
                                            <div className="space-y-4 text-center">
                                                <div className="bg-white p-4 rounded-xl mx-auto w-48 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative group">
                                                    <img src={systemQr!} alt="Deposit QR" className="w-full h-full object-contain" />
                                                </div>
                                                <div>
                                                    <p className="text-stone-400 text-xs mb-1">{t('deposit.scan_pay')}</p>
                                                    <div className="text-2xl font-mono font-bold text-white">
                                                        {depositCurrency === 'THB' ? (
                                                            <>
                                                                {parseFloat(amount).toLocaleString()} $
                                                                <span className="text-xs text-stone-500 ml-2">({(parseFloat(amount) / EXCHANGE_RATE_USD_THB).toLocaleString(undefined, { minimumFractionDigits: 2 })} {CURRENCY})</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {CURRENCY}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="h-px bg-stone-800 w-full"></div>
                                            </div>
                                        )}

                                        {/* Amount input for USDT (since it doesn't have the QR price display) */}
                                        {method === 'USDT' && !slipFile && (
                                            <div className="space-y-4 text-center">
                                                <div className="text-2xl font-mono font-bold text-white">
                                                    {parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {CURRENCY}
                                                </div>
                                                <div className="h-px bg-stone-800 w-full"></div>
                                            </div>
                                        )}

                                        {/* Upload Section */}
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${slipFile
                                                ? 'border-emerald-500/50 bg-emerald-900/10 text-center'
                                                : 'border-stone-700 hover:border-stone-500 hover:bg-stone-800/50 cursor-pointer text-center'
                                                }`}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                            />

                                            {slipFile ? (
                                                <div className="relative w-full text-center">
                                                    <div className="w-32 h-40 mx-auto bg-stone-950 rounded-lg overflow-hidden border border-stone-600 mb-2 relative">
                                                        {slipPreview && <img src={slipPreview} alt="Slip" className="w-full h-full object-cover" />}
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                            <Upload className="text-white" />
                                                        </div>
                                                    </div>
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSlipFile(null);
                                                        setSlipPreview(null);
                                                    }} className="text-xs text-stone-400 hover:text-white underline">{t('common.cancel')}</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mb-3 text-stone-400 mx-auto">
                                                        <Upload size={24} />
                                                    </div>
                                                    <span className="text-stone-300 font-bold text-sm block">{t('deposit.upload_slip')}</span>
                                                    <span className="text-stone-500 text-xs mt-1 block">{t('deposit.drag_drop')}</span>
                                                </>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleConfirmPayment(method === 'USDT')}
                                            disabled={!slipFile || isLoading}
                                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full"></div>
                                                    <span>{t('common.loading')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FileText size={18} /> {t('deposit.submit')}
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => setStep('INPUT')}
                                            className="text-xs text-stone-500 hover:text-stone-300 underline block text-center mt-2"
                                        >
                                            {t('deposit.change_amount')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {step === 'SUCCESS' && (
                        <div className="py-8 text-center space-y-6 animate-in zoom-in duration-300">
                            <div className="w-24 h-24 bg-yellow-500/20 rounded-full mx-auto flex items-center justify-center border-2 border-yellow-500">
                                <Clock className="text-yellow-500 w-12 h-12" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-display font-bold text-white mb-2">{t('deposit.success_title')}</h3>
                                <p className="text-stone-400 text-sm px-4">
                                    {t('deposit.success_desc')}
                                </p>
                            </div>

                            <div className="bg-stone-800/50 p-4 rounded-lg border border-stone-700">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-stone-500">{t('deposit.summary_amount')}</span>
                                    <span className="text-white font-mono">
                                        {depositCurrency === 'THB' ?
                                            <>{formatCurrency(parseFloat(amount) / EXCHANGE_RATE_USD_THB)} <span className="text-xs text-stone-500">({formatCurrency(parseFloat(amount) / EXCHANGE_RATE_USD_THB, { forceUSD: true })})</span></> :
                                            <>{formatCurrency(parseFloat(amount))}</>
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">{t('deposit.summary_status')}</span>
                                    <span className="text-yellow-500 font-bold uppercase">{t('deposit.status_pending')}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    onClose();
                                    onDepositSuccess(); // Just to refresh data
                                }}
                                className="w-full bg-stone-800 hover:bg-stone-700 text-white font-bold py-3 rounded-xl border border-stone-600 transition-colors"
                            >
                                {t('common.confirm')}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};