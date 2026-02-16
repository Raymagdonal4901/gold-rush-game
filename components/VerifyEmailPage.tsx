import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Pickaxe, ArrowRight, Mountain } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface VerifyEmailPageProps {
    onGoToLogin: () => void;
    onBack?: () => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onGoToLogin, onBack }) => {
    const { language } = useLanguage();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');

            if (!token) {
                setStatus('error');
                setMessage('Verification token is missing.');
                return;
            }

            try {
                const res = await api.verifyEmail(token);
                setStatus('success');
                setMessage(res.message);
            } catch (err: any) {
                console.error('[VERIFY ERROR]', err);
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. Token may be expired.');
            }
        };

        verify();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-stone-950 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className={`absolute top-[20%] left-[20%] w-[60%] h-[60%] blur-[120px] rounded-full animate-pulse transition-colors duration-1000 ${status === 'loading' ? 'bg-yellow-500/5' :
                    status === 'success' ? 'bg-emerald-500/5' : 'bg-red-500/5'
                    }`}></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {onBack && (
                    <div className="flex justify-start mb-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/20 bg-stone-900/50 hover:bg-stone-800 text-[10px] font-black tracking-widest text-yellow-500 transition-all backdrop-blur-sm group"
                        >
                            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                            {language === 'th' ? 'หน้าหลัก' : 'BACK TO HOME'}
                        </button>
                    </div>
                )}
                <div className={`bg-stone-900/80 border rounded-3xl p-10 backdrop-blur-xl shadow-2xl text-center transition-colors duration-500 ${status === 'loading' ? 'border-yellow-500/10' :
                    status === 'success' ? 'border-emerald-500/20' : 'border-red-500/20'
                    }`}>

                    <div className="mb-10 flex justify-center">
                        <div className="relative">
                            {status === 'loading' && (
                                <div className="relative w-24 h-24">
                                    <div className="absolute inset-0 border-4 border-yellow-500/10 border-t-yellow-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Pickaxe size={32} className="text-yellow-500 animate-bounce" />
                                    </div>
                                </div>
                            )}
                            {status === 'success' && (
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border-2 border-emerald-500/30 animate-in zoom-in duration-500">
                                    <CheckCircle2 size={48} className="text-emerald-400" />
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30 animate-in zoom-in duration-500">
                                    <XCircle size={48} className="text-red-400" />
                                </div>
                            )}
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
                        {status === 'loading' ? 'Decrypting Token...' :
                            status === 'success' ? 'Protocol Activated' : 'System Rejection'}
                    </h1>

                    <p className={`text-sm mb-10 leading-relaxed font-medium ${status === 'loading' ? 'text-stone-500' :
                        status === 'success' ? 'text-emerald-400/80' : 'text-red-400/80'
                        }`}>
                        {message || 'Verifying your mining credentials with the central database...'}
                    </p>

                    {status !== 'loading' && (
                        <button
                            onClick={onGoToLogin}
                            className={`w-full py-4 font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 text-xs ${status === 'success'
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10'
                                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                                }`}
                        >
                            <span>{status === 'success' ? 'Enter Mining Terminal' : 'Back to Induction'}</span>
                            <ArrowRight size={16} />
                        </button>
                    )}

                    {status === 'loading' && (
                        <div className="text-[10px] text-stone-600 font-bold uppercase tracking-[0.4em] animate-pulse">
                            Processing Data Stream
                        </div>
                    )}
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 opacity-20 grayscale">
                    <Mountain size={16} className="text-stone-500" />
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Central Extraction Authority</span>
                </div>
            </div>
        </div>
    );
};
