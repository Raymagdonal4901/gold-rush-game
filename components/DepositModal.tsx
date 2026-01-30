import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, ArrowRight, CheckCircle, Upload, AlertCircle, ScanLine, Clock, FileText } from 'lucide-react';
import { CURRENCY, TRANSACTION_LIMITS } from '../constants';
import { MockDB } from '../services/db';
import { User } from '../types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onDepositSuccess }) => {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'INPUT' | 'PAYMENT' | 'SUCCESS'>('INPUT');
  const [systemQr, setSystemQr] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser: User | null = MockDB.getSession();

  useEffect(() => {
    if (isOpen) {
        setAmount('');
        setStep('INPUT');
        setSlipFile(null);
        setSlipPreview(null);
        const config = MockDB.getSystemConfig();
        setSystemQr(config.receivingQrCode || null);
    }
  }, [isOpen]);

  const handleNextStep = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < TRANSACTION_LIMITS.MIN || val > TRANSACTION_LIMITS.MAX) return;
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

  const handleConfirmPayment = () => {
    if (!slipPreview || !currentUser) return;
    
    // Create Pending Request
    MockDB.createDepositRequest(
        currentUser.id,
        currentUser.username,
        parseFloat(amount),
        slipPreview
    );

    setStep('SUCCESS');
    // We don't call onDepositSuccess here because it's not instant anymore
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-stone-900 p-4 border-b border-emerald-900/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 p-2 rounded text-emerald-500">
                <QrCode size={20} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-white leading-none">แจ้งฝากเงิน</h2>
                <span className="text-[10px] text-emerald-500/70 font-mono uppercase tracking-widest">รอผู้ดูแลอนุมัติ</span>
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
                    <div className="text-center space-y-2">
                        <label className="text-sm font-medium text-stone-400">ระบุจำนวนเงินที่ต้องการฝาก</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                autoFocus
                                className="w-full bg-stone-950 border border-stone-800 rounded-xl py-4 px-4 text-center text-3xl font-mono font-bold text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-stone-800"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-600 font-bold">{CURRENCY}</span>
                        </div>
                        <p className="text-xs text-stone-500">
                            ขั้นต่ำ {TRANSACTION_LIMITS.MIN.toLocaleString()} - สูงสุด {TRANSACTION_LIMITS.MAX.toLocaleString()} {CURRENCY}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {[500, 1000, 5000].map(val => (
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
                        disabled={!amount || parseFloat(amount) < TRANSACTION_LIMITS.MIN || parseFloat(amount) > TRANSACTION_LIMITS.MAX}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        ดำเนินการต่อ <ArrowRight size={18} />
                    </button>
                </div>
            )}

            {/* STEP 2: SHOW QR & UPLOAD SLIP */}
            {step === 'PAYMENT' && (
                <div className="space-y-6 animate-in slide-in-from-right duration-300 text-center">
                    
                    {!systemQr ? (
                        <div className="bg-red-900/20 border border-red-900/50 p-6 rounded-xl">
                            <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
                            <p className="text-red-400 font-bold">ปิดปรับปรุงระบบ</p>
                            <p className="text-stone-500 text-sm mt-1">QR Code รับเงินยังไม่พร้อมใช้งาน</p>
                        </div>
                    ) : (
                        <>
                            {/* QR Section */}
                            {!slipFile && (
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl mx-auto w-48 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative group">
                                        <img src={systemQr} alt="Deposit QR" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <p className="text-stone-400 text-xs mb-1">สแกนเพื่อจ่าย</p>
                                        <div className="text-2xl font-mono font-bold text-white">
                                            {parseFloat(amount).toLocaleString(undefined, {minimumFractionDigits: 2})} {CURRENCY}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            {!slipFile && <div className="h-px bg-stone-800 w-full"></div>}

                            {/* Upload Section */}
                            <div 
                                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${
                                    slipFile 
                                        ? 'border-emerald-500/50 bg-emerald-900/10' 
                                        : 'border-stone-700 hover:border-stone-500 hover:bg-stone-800/50 cursor-pointer'
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
                                    <div className="relative w-full">
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
                                        }} className="text-xs text-stone-400 hover:text-white underline">เปลี่ยนรูป</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center mb-3 text-stone-400">
                                            <Upload size={24} />
                                        </div>
                                        <span className="text-stone-300 font-bold text-sm">อัปโหลดสลิปโอนเงิน</span>
                                        <span className="text-stone-500 text-xs mt-1">เพื่อใช้ในการตรวจสอบ</span>
                                    </>
                                )}
                            </div>

                            <button 
                                onClick={handleConfirmPayment}
                                disabled={!slipFile}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <FileText size={18} /> ยืนยันการแจ้งโอน
                            </button>
                            
                            <button 
                                onClick={() => setStep('INPUT')}
                                className="text-xs text-stone-500 hover:text-stone-300 underline"
                            >
                                ยกเลิก / เปลี่ยนจำนวนเงิน
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* STEP 3: SUCCESS */}
            {step === 'SUCCESS' && (
                <div className="py-8 text-center space-y-6 animate-in zoom-in duration-300">
                     <div className="w-24 h-24 bg-yellow-500/20 rounded-full mx-auto flex items-center justify-center border-2 border-yellow-500">
                        <Clock className="text-yellow-500 w-12 h-12" />
                     </div>

                     <div>
                        <h3 className="text-2xl font-display font-bold text-white mb-2">ส่งคำร้องเรียบร้อย</h3>
                        <p className="text-stone-400 text-sm px-4">
                            ผู้ดูแลระบบจะตรวจสอบสลิปและอนุมัติยอดเงินเข้ากระเป๋าของคุณในไม่ช้า
                        </p>
                     </div>

                     <div className="bg-stone-800/50 p-4 rounded-lg border border-stone-700">
                         <div className="flex justify-between text-sm mb-1">
                             <span className="text-stone-500">ยอดเงินแจ้งฝาก</span>
                             <span className="text-white font-mono">{parseFloat(amount).toLocaleString()} {CURRENCY}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-stone-500">สถานะ</span>
                             <span className="text-yellow-500 font-bold uppercase">รออนุมัติ (Pending)</span>
                         </div>
                     </div>

                     <button 
                        onClick={() => {
                            onClose();
                            onDepositSuccess(); // Just to refresh data
                        }}
                        className="w-full bg-stone-800 hover:bg-stone-700 text-white font-bold py-3 rounded-xl border border-stone-600 transition-colors"
                    >
                        ตกลง
                    </button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};