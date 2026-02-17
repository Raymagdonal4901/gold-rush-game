import React, { useState } from 'react';
import { X, Lock, KeyRound, Save, Shield } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../services/types';
import { useTranslation } from '../contexts/LanguageContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSuccess?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'PASSWORD' | 'PIN' | 'BANK' | 'PROFILE'>('PASSWORD');

    // Form State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPin, setNewPin] = useState('');
    const [qrImage, setQrImage] = useState<string | null>(user.bankQrCode || null);
    const [avatarImage, setAvatarImage] = useState<string | null>(user.avatarUrl || null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [status, setStatus] = useState<{ type: 'SUCCESS' | 'ERROR', msg: string } | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            setQrImage(user.bankQrCode || null);
            setAvatarImage(user.avatarUrl || null);
            setStatus(null);
        }
    }, [isOpen, user.bankQrCode, user.avatarUrl]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        try {
            if (activeTab === 'PASSWORD') {
                if (newPassword.length < 4) throw new Error(t('settings.error_password_length'));
                await api.user.updatePassword(currentPassword, newPassword);
                setStatus({ type: 'SUCCESS', msg: t('settings.success_password') });
            } else if (activeTab === 'PIN') {
                if (!/^\d{4}$/.test(newPin)) throw new Error(t('settings.error_pin_format'));
                await api.user.updatePin(currentPassword, newPin);
                setStatus({ type: 'SUCCESS', msg: t('settings.success_pin') });
            } else if (activeTab === 'BANK') {
                if (!qrImage) throw new Error(t('settings.error_qr_missing'));
                await api.user.updateBankQr(qrImage);
                setStatus({ type: 'SUCCESS', msg: t('settings.success_bank') });
            } else if (activeTab === 'PROFILE') {
                await api.user.updateProfile({ avatarUrl: avatarImage || '' });
                setStatus({ type: 'SUCCESS', msg: t('settings.success_profile') || 'Profile updated successfully' });
            }
            if (onSuccess) onSuccess();
            // Clear inputs except QR
            setCurrentPassword('');
            setNewPassword('');
            setNewPin('');
        } catch (err: any) {
            console.error("Security update failed:", err);
            setStatus({ type: 'ERROR', msg: err.response?.data?.message || err.message });
        }
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check: 1MB limit for Base64 (approx 750KB original)
        if (file.size > 1024 * 1024) {
            setStatus({ type: 'ERROR', msg: t('settings.error_file_size') || 'Image too large (Max 1MB)' });
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarImage(reader.result as string);
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setQrImage(base64String);
            setIsUploading(false);
            setStatus({ type: 'SUCCESS', msg: t('settings.upload_notice') || 'QR Uploaded' });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-stone-800 p-2 rounded text-stone-300">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">{t('settings.title')}</h2>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">{t('settings.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-800">
                    <button
                        onClick={() => { setActiveTab('PASSWORD'); setStatus(null); }}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2
                ${activeTab === 'PASSWORD' ? 'bg-stone-900 text-yellow-500 border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        <Lock size={16} /> {t('settings.password_tab')}
                    </button>
                    <button
                        onClick={() => { setActiveTab('PIN'); setStatus(null); }}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2
                ${activeTab === 'PIN' ? 'bg-stone-900 text-yellow-500 border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        <KeyRound size={16} /> {t('settings.pin_tab')}
                    </button>
                    <button
                        onClick={() => { setActiveTab('PROFILE'); setStatus(null); }}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2
                ${activeTab === 'PROFILE' ? 'bg-stone-900 text-yellow-500 border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        <Save size={16} /> {t('settings.profile_tab')}
                    </button>
                    <button
                        onClick={() => { setActiveTab('BANK'); setStatus(null); }}
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2
                ${activeTab === 'BANK' ? 'bg-stone-900 text-yellow-500 border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300'}`}
                    >
                        <Save size={16} /> {t('settings.bank_tab')}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-stone-950/50">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {status && (
                            <div className={`p-3 rounded text-sm text-center font-bold ${status.type === 'SUCCESS' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                                {status.msg}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-500 uppercase">{t('settings.current_password')}</label>
                            <input
                                type="password"
                                required={activeTab !== 'PROFILE'}
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                className="w-full bg-stone-900 border border-stone-700 rounded p-3 text-white focus:border-yellow-500 outline-none transition-colors"
                                placeholder={t('settings.password_placeholder')}
                            />
                        </div>

                        {activeTab === 'PASSWORD' ? (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-500 uppercase">{t('settings.new_password')}</label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full bg-stone-900 border border-stone-700 rounded p-3 text-white focus:border-yellow-500 outline-none transition-colors"
                                    placeholder={t('settings.new_password_placeholder')}
                                    minLength={4}
                                />
                            </div>
                        ) : activeTab === 'PIN' ? (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-500 uppercase">{t('settings.new_pin')}</label>
                                <input
                                    type="password"
                                    required
                                    maxLength={4}
                                    pattern="\d{4}"
                                    value={newPin}
                                    onChange={e => {
                                        if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                                            setNewPin(e.target.value);
                                        }
                                    }}
                                    className="w-full bg-stone-900 border border-stone-700 rounded p-3 text-white focus:border-yellow-500 outline-none transition-colors text-center tracking-[0.5em] font-mono"
                                    placeholder={t('settings.pin_placeholder')}
                                />
                            </div>
                        ) : activeTab === 'PROFILE' ? (
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-stone-500 uppercase">{t('settings.avatar_label')}</label>
                                <div className="flex flex-col items-center gap-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-32 h-32 bg-stone-900 border-2 border-stone-800 border-dashed rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500/50 hover:bg-stone-800/50 transition-all overflow-hidden relative group"
                                    >
                                        {avatarImage ? (
                                            <>
                                                <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <span className="text-white text-[10px] font-bold uppercase">{t('settings.avatar_upload_hint')}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-500 mb-1">
                                                    <Save size={20} />
                                                </div>
                                                <span className="text-[10px] text-stone-500 font-bold uppercase">{t('settings.avatar_empty_hint')}</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                        />
                                    </div>
                                    <p className="text-[10px] text-stone-500 text-center px-4 uppercase">
                                        {t('settings.avatar_desc')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-stone-500 uppercase">{t('settings.qr_label')}</label>
                                <div className="flex flex-col items-center gap-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-48 h-48 bg-stone-900 border-2 border-stone-800 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500/50 hover:bg-stone-800/50 transition-all overflow-hidden relative group"
                                    >
                                        {qrImage ? (
                                            <>
                                                <img src={qrImage} alt="Bank QR" className="w-full h-full object-contain p-2" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <span className="text-white text-xs font-bold uppercase">{t('settings.qr_upload_hint')}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-stone-500 mb-2">
                                                    <Save size={24} />
                                                </div>
                                                <span className="text-xs text-stone-500 font-bold uppercase">{t('settings.qr_empty_hint')}</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleQrUpload}
                                        />
                                    </div>
                                    <p className="text-[10px] text-stone-500 text-center px-4 uppercase">
                                        {t('settings.qr_desc')}
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-yellow-600 hover:bg-yellow-500 text-stone-900 font-bold py-3 rounded shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            <Save size={18} /> {t('settings.save_changes')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};