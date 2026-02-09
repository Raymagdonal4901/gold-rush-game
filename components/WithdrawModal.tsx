import React, { useState, useRef, useEffect } from 'react';
import { X, Wallet, Send, QrCode, Upload, Image as ImageIcon, AlertTriangle, CheckCircle, ArrowRight, Percent, Clock } from 'lucide-react';
import { CURRENCY, TRANSACTION_LIMITS, WITHDRAWAL_FEE_PERCENT, EXCHANGE_RATE_USD_THB } from '../constants';
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
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
    isOpen,
    onClose,
    walletBalance,
    onWithdraw,
    savedQrCode,
    onSaveQr,
    currentWalletAddress
}) => {
    const { t, language } = useTranslation();
    const [amount, setAmount] = useState<string>('');
    const [method, setMethod] = useState<'BANK' | 'USDT'>('BANK');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setIsConfirming(false);
            setShowPinModal(false);
            setAmount('');
        }
    }, [isOpen]);

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
        if (!isNaN(val) && val >= TRANSACTION_LIMITS.WITHDRAW.MIN && val <= TRANSACTION_LIMITS.WITHDRAW.MAX && val <= walletBalance) {
            // Skips confirmation check and PIN for direct experience if desired, 
            // but usually we keep Confirmation view and just skip PIN.
            setIsConfirming(true);
        }
    };

    const handleConfirmWithdraw = () => {
        // Direct call, bypass PIN
        const val = parseFloat(amount);
        if (!isNaN(val) && val > 0 && val <= walletBalance) {
            // @ts-ignore - Updating standard onWithdraw to support method & address if needed, 
            // but usually we just update the API call in the parent component.
            // Assuming onWithdraw handles the current state of the modal.
            onWithdraw(val, "");
            setAmount('');
            setIsConfirming(false);
            onClose();
        }
    };

    const handlePinSuccess = (pin: string) => {
        const val = parseFloat(amount);
        if (!isNaN(val) && val > 0 && val <= walletBalance) {
            onWithdraw(val, pin);
            setAmount('');
            setIsConfirming(false);
            setShowPinModal(false);
            onClose();
        }
    };

    const setMaxAmount = () => {
        const maxPossible = Math.min(walletBalance, TRANSACTION_LIMITS.WITHDRAW.MAX);
        setAmount(maxPossible.toString());
    };

    // Calculations
    const rawAmount = parseFloat(amount) || 0;
    const fee = rawAmount * WITHDRAWAL_FEE_PERCENT;
    const netReceived = rawAmount - fee;

    // --- RENDER ---

    const isSetupMode = !savedQrCode;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {isSetupMode ? <QrCode className="text-yellow-500" /> : method === 'USDT' ? <Wallet className="text-blue-500" /> : <Wallet className="text-emerald-500" />}
                        {isSetupMode ? (language === 'th' ? 'ตั้งค่าบัญชีรับเงิน' : 'Setup Receiving Account') : isConfirming ? (language === 'th' ? 'ยืนยันรายการ' : 'Confirm Transaction') : (language === 'th' ? 'ถอนเงิน' : 'Withdraw')}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {isSetupMode ? (
                        // --- VIEW 1: Upload QR ---
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-yellow-900/20 border border-yellow-700/30 p-4 rounded-lg flex gap-3">
                                <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                                <div className="text-xs text-yellow-200/80 leading-relaxed">
                                    <span className="font-bold text-yellow-500 block mb-1">{language === 'th' ? 'ต้องดำเนินการ' : 'Action Required'}</span>
                                    {language === 'th'
                                        ? 'เพื่อรับเงิน คุณต้องอัปโหลด QR Code บัญชีธนาคารของคุณ การตั้งค่านี้ทำเพียงครั้งเดียวและจะถูกบันทึกไว้สำหรับการถอนเงินในอนาคต'
                                        : 'To receive payments, you must upload your bank account QR code. This is a one-time setup and will be saved for future withdrawals.'}
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
                                        <span className="text-slate-300 font-bold text-sm">{language === 'th' ? 'แตะเพื่ออัปโหลดรูป QR' : 'Tap to upload QR'}</span>
                                        <span className="text-slate-500 text-xs mt-1">{language === 'th' ? 'รองรับ JPG, PNG' : 'Supports JPG, PNG'}</span>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={handleSaveQr}
                                disabled={!previewUrl}
                                className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-700 disabled:text-slate-500 text-stone-900 font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all font-display tracking-wide"
                            >
                                <CheckCircle size={18} /> {language === 'th' ? 'บันทึกบัญชีรับเงิน' : 'Save Account'}
                            </button>
                        </div>
                    ) : isConfirming ? (
                        // --- VIEW 3: Confirmation ---
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
                            <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                                <ArrowRight size={32} className="text-emerald-500" />
                            </div>

                            <h3 className="text-stone-300 font-medium mb-1">{language === 'th' ? 'ยอดเงินที่จะได้รับจริง' : 'Actual Amount to Receive'}</h3>
                            <div className="text-4xl font-mono font-bold text-white mb-2">
                                {netReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm text-stone-500">{CURRENCY}</span>
                                <div className="text-sm text-emerald-500 font-mono mt-1">
                                    ≈ {(netReceived * EXCHANGE_RATE_USD_THB).toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 mb-4 text-xs space-y-2">
                                <div className="flex justify-between text-stone-400">
                                    <span>{language === 'th' ? 'ยอดถอน' : 'Withdraw Amount'}</span>
                                    <span>{rawAmount.toLocaleString()} {CURRENCY}</span>
                                </div>
                                <div className="flex justify-between text-red-400">
                                    <span>{language === 'th' ? 'ค่าธรรมเนียม' : 'Fee'} ({WITHDRAWAL_FEE_PERCENT * 100}%)</span>
                                    <span>-{fee.toLocaleString()} {CURRENCY}</span>
                                </div>
                                <div className="h-px bg-slate-700 my-1"></div>
                                <div className="flex justify-between text-emerald-400 font-bold">
                                    <span>{language === 'th' ? 'รับสุทธิ' : 'Net Received'}</span>
                                    <span>{netReceived.toLocaleString()} {CURRENCY}</span>
                                </div>
                            </div>

                            {/* Warning Notice */}
                            <div className="bg-blue-900/20 border border-blue-900/50 p-3 rounded-lg flex items-start gap-2 mb-6 text-left">
                                <Clock className="text-blue-400 shrink-0 mt-0.5" size={16} />
                                <div className="text-xs text-blue-300/80">
                                    <span className="font-bold text-blue-400 block mb-0.5">{language === 'th' ? 'ระยะเวลาดำเนินการ' : 'Processing Time'}</span>
                                    {language === 'th'
                                        ? <span>เงินจะเข้าบัญชีของคุณในช่วงเวลา <strong>22.00 - 00.00 น.</strong> ของทุกวัน</span>
                                        : <span>Funds will reach your account between <strong>10:00 PM - 12:00 AM</strong> daily.</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsConfirming(false)}
                                    className="py-3 rounded-lg border border-slate-600 text-slate-400 font-bold hover:bg-slate-700 hover:text-white transition-colors"
                                >
                                    {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                                </button>
                                <button
                                    onClick={handleConfirmWithdraw}
                                    className="py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20"
                                >
                                    {language === 'th' ? 'ยืนยัน' : 'Confirm'}
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
                                        <ImageIcon size={16} /> {language === 'th' ? 'ธนาคาร (USD)' : 'Bank (USD)'}
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
                                <span className="text-sm text-slate-400">{language === 'th' ? 'เงินทุนที่ถอนได้' : 'Withdrawable Balance'}</span>
                                <div className="text-3xl font-bold text-white font-mono">{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} {CURRENCY}</div>
                            </div>

                            <div className="space-y-4">
                                {method === 'BANK' ? (
                                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white p-0.5 rounded flex items-center justify-center overflow-hidden shrink-0">
                                            <img src={savedQrCode} alt="Saved QR" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">{language === 'th' ? 'บัญชีรับเงิน' : 'Receiving Account'}</div>
                                            <div className="text-sm text-emerald-400 flex items-center gap-1 font-bold truncate">
                                                <CheckCircle size={12} /> {language === 'th' ? 'เชื่อมต่อ QR แล้ว' : 'QR Connected'}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-900/40 rounded flex items-center justify-center shrink-0">
                                            <Wallet size={20} className="text-blue-400" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">BSC Wallet</div>
                                            <div className="text-sm text-blue-400 flex items-center gap-1 font-bold truncate">
                                                <CheckCircle size={12} /> {language === 'th' ? 'ใช้ที่อยู่ที่ผูกไว้ในระบบ' : 'Using linked address'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">{language === 'th' ? 'จำนวนเงินที่ต้องการถอน' : 'Withdraw Amount'}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 text-white focus:border-emerald-500 outline-none transition-colors"
                                        />
                                        <button
                                            onClick={setMaxAmount}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-slate-700 hover:bg-slate-600 text-emerald-400 px-2 py-1 rounded"
                                        >
                                            {language === 'th' ? 'สูงสุด' : 'MAX'}
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-start text-[10px] text-slate-500">
                                        <span>{language === 'th' ? 'ค่าธรรมเนียม' : 'Fee'} {WITHDRAWAL_FEE_PERCENT * 100}%</span>
                                        <span>Max: {TRANSACTION_LIMITS.WITHDRAW.MAX.toLocaleString()} {CURRENCY}</span>
                                    </div>

                                    {rawAmount > 0 && (
                                        <div className="text-xs text-right mt-1 font-bold text-emerald-500">
                                            {language === 'th' ? 'รับสุทธิ' : 'Net Received'}: {Math.max(0, netReceived).toLocaleString()} {CURRENCY}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-yellow-900/10 border border-yellow-800/30 p-2 rounded text-[10px] text-yellow-500/80 flex items-center gap-2">
                                    <Clock size={12} /> {language === 'th' ? 'เงินเข้าช่วงเวลา 22.00 - 00.00 น.' : 'Arrival period: 10 PM - 12 AM'}
                                </div>
                            </div>

                            <button
                                onClick={handleWithdrawClick}
                                disabled={!amount || parseFloat(amount) > walletBalance || parseFloat(amount) < TRANSACTION_LIMITS.WITHDRAW.MIN || parseFloat(amount) > TRANSACTION_LIMITS.WITHDRAW.MAX}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all mt-6"
                            >
                                {language === 'th' ? 'ถอนเงิน' : 'Withdraw'} <Send size={18} />
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