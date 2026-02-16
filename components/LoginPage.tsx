import React, { useState } from 'react';
import { Lock, Mail, Mountain, ArrowRight, ShieldAlert, Loader2, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { User } from '../services/types';

interface LoginPageProps {
    onLogin: (user: User) => void;
    onSwitchToRegister: () => void;
    onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToRegister, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { language, setLanguage, t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await api.login(email.trim(), password);
            onLogin(user);
        } catch (err: any) {
            console.error('[LOGIN ERROR]', err);
            const backendMsg = err.response?.data?.message || '';
            let msg = t('auth.login_failed');

            if (backendMsg === 'Please verify email') msg = t('auth.please_verify_email');
            else if (backendMsg === 'Invalid credentials') msg = t('auth.login_failed'); // Already localized key for failed
            else if (backendMsg) msg = backendMsg;

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-stone-950 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-yellow-500/5 blur-[120px] rounded-full animate-pulse"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
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

                <div className="bg-stone-900/80 border border-yellow-500/20 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)] border-2 border-yellow-400/50 transform rotate-3">
                            <Mountain size={40} className="text-stone-950 -rotate-3" />
                        </div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-700 uppercase tracking-tighter italic">
                            {t('auth.login_title')}
                        </h1>
                        <p className="text-yellow-600/60 text-xs font-black tracking-[0.3em] uppercase mt-2">
                            {t('auth.login_subtitle')}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                <ShieldAlert size={18} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest ml-1">{t('auth.email_label')}</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-yellow-500 outline-none transition-all shadow-inner font-mono text-sm"
                                    placeholder={t('auth.login_placeholder')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest ml-1">{t('auth.password_label')}</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-yellow-500 outline-none transition-all shadow-inner font-mono text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 p-px rounded-2xl transition-all shadow-[0_0_30px_rgba(234,179,8,0.2)] active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                            <div className="bg-stone-950 group-hover:bg-transparent py-4 rounded-[15px] flex items-center justify-center gap-2 transition-all">
                                {loading ? (
                                    <Loader2 className="animate-spin text-yellow-500" size={20} />
                                ) : (
                                    <>
                                        <span className="text-sm font-black text-yellow-500 group-hover:text-stone-950 uppercase tracking-[0.2em] transition-colors">
                                            {t('auth.login_btn')}
                                        </span>
                                        <ArrowRight size={18} className="text-yellow-500 group-hover:text-stone-950 transition-colors" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center pt-6 border-t border-stone-800/50">
                        <button
                            onClick={onSwitchToRegister}
                            className="text-stone-500 hover:text-yellow-500 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            {t('auth.need_permit')} <span className="text-yellow-400">{t('auth.request_access')}</span>
                        </button>
                    </div>
                </div>

                {/* System Stats (Optional Flair) */}
                <div className="mt-6 flex justify-between px-4 text-[9px] font-black text-stone-700 uppercase tracking-widest">
                    <span>System v1.4.2</span>
                    <span>Lat: 13.7563° N, Lon: 100.5018° E</span>
                </div>
            </div>
        </div>
    );
};
