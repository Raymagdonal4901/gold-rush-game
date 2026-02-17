import React, { useState } from 'react';
import { User, Lock, Mail, Mountain, ArrowRight, ShieldAlert, Loader2, Languages, CheckCircle2, KeyRound } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';

interface RegisterPageProps {
    onSwitchToLogin: () => void;
    onBack: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin, onBack }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { language, setLanguage, t } = useLanguage();

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            setReferralCode(ref);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('auth.passwords_not_match'));
            return;
        }

        setLoading(true);

        try {
            await api.register(username.trim(), email.trim(), password, undefined, referralCode.trim());
            setIsSuccess(true);
        } catch (err: any) {
            console.error('[REGISTER ERROR]', err);
            const msg = err.response?.data?.message || t('auth.registration_failed');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-stone-950 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse"></div>
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-stone-900 border border-emerald-500/20 rounded-3xl p-10 backdrop-blur-xl shadow-2xl text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-8 border-2 border-emerald-500/30">
                            <CheckCircle2 size={40} className="text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">{t('auth.registration_success_title')}</h2>
                        <div className="space-y-4 mb-8">
                            <p className="text-stone-400 text-sm leading-relaxed">
                                {t('auth.registration_success_msg', { email })}
                            </p>
                            <p className="text-stone-500 text-[10px] uppercase font-bold tracking-widest">
                                {t('auth.registration_success_hint')}
                            </p>
                        </div>
                        <button
                            onClick={onSwitchToLogin}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 text-xs"
                        >
                            {t('auth.back_to_terminal')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-stone-950 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full animate-pulse"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg">
                {/* Top Actions */}
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/20 bg-stone-900/50 hover:bg-stone-800 text-[10px] font-black tracking-widest text-yellow-500 transition-all backdrop-blur-sm group"
                    >
                        <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                        {language === 'th' ? 'หน้าหลัก' : 'BACK TO HOME'}
                    </button>
                    <button
                        onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/20 bg-stone-900/50 hover:bg-stone-800 text-[10px] font-black tracking-widest text-yellow-500 transition-all backdrop-blur-sm"
                    >
                        <Languages size={14} />
                        {language === 'th' ? 'ENGLISH' : 'ภาษาไทย'}
                    </button>
                </div>

                <div className="bg-stone-900/80 border border-yellow-500/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                    <div className="flex flex-col items-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-950 rounded-2xl mb-4 border border-yellow-500/20">
                            <Mountain size={28} className="text-yellow-500" />
                        </div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">{t('auth.register_title')}</h1>
                        <p className="text-stone-500 text-[10px] font-black tracking-[0.3em] uppercase mt-1">{t('auth.register_subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {error && (
                            <div className="col-span-1 md:col-span-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                <ShieldAlert size={18} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest ml-1">{t('auth.username_label')}</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-white transition-colors" size={16} />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-yellow-500/50 outline-none transition-all font-mono text-sm"
                                    placeholder={t('auth.username_placeholder')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest ml-1">{t('auth.email_label')}</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-white transition-colors" size={16} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-yellow-500/50 outline-none transition-all font-mono text-sm"
                                    placeholder={t('auth.email_placeholder')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest ml-1">{t('auth.password_label')}</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-white transition-colors" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-yellow-500/50 outline-none transition-all font-mono text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest ml-1">{t('auth.confirm_password_label')}</label>
                            <div className="relative group">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-white transition-colors" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-yellow-500/50 outline-none transition-all font-mono text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-stone-600 uppercase tracking-widest ml-1">{t('auth.referral_label')}</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-800 group-focus-within:text-stone-400 transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={referralCode}
                                    onChange={e => setReferralCode(e.target.value)}
                                    className="w-full bg-stone-950/50 border border-stone-800 rounded-xl py-3 pl-10 pr-4 text-stone-300 focus:border-stone-700 outline-none transition-all font-mono text-xs"
                                    placeholder={t('auth.referral_placeholder')}
                                />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-yellow-500 hover:bg-yellow-400 text-stone-950 font-black uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-yellow-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>{t('auth.register_btn')}</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-stone-800/50">
                        <button
                            onClick={onSwitchToLogin}
                            className="text-stone-500 hover:text-yellow-500 text-[10px] font-black uppercase tracking-widest transition-colors"
                        >
                            {t('auth.return_login')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
