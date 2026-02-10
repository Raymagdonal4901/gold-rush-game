import React, { useState } from 'react';
import { X, BookOpen, Wallet, Download, CheckCircle, ArrowRight, Package } from 'lucide-react';
import { CURRENCY } from '../constants';

interface UserGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import { useTranslation } from './LanguageContext';

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-900/20 p-2 rounded text-yellow-500">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">{t('user_guide.title')}</h2>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">{t('user_guide.subtitle')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 bg-stone-900/50 border-r border-stone-800 p-4 space-y-2 shrink-0 overflow-y-auto">
                        <button
                            onClick={() => setActiveTab('DEPOSIT')}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'DEPOSIT' ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-900/50' : 'text-stone-400 hover:bg-stone-800'}`}
                        >
                            <Wallet size={18} />
                            <span className="font-bold text-sm">{t('user_guide.deposit_tab')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('WITHDRAWAL')}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'WITHDRAWAL' ? 'bg-red-900/20 text-red-400 border border-red-900/50' : 'text-stone-400 hover:bg-stone-800'}`}
                        >
                            <Download size={18} />
                            <span className="font-bold text-sm">{t('user_guide.withdraw_tab')}</span>
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-stone-950/80">

                        {activeTab === 'DEPOSIT' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="border-b border-stone-800 pb-4">
                                    <h3 className="text-2xl font-bold text-emerald-400 mb-2">{t('user_guide.deposit_title')}</h3>
                                    <p className="text-stone-400">{t('user_guide.deposit_subtitle')}</p>
                                </div>

                                {/* Step 1 */}
                                <div className="flex gap-6 items-start">
                                    <div className="w-8 h-8 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-500/30">1</div>
                                    <div className="space-y-3 w-full">
                                        <h4 className="font-bold text-white">{t('user_guide.deposit_step1')}</h4>
                                        <div className="bg-stone-900 p-4 rounded-lg border border-stone-800 flex items-center justify-center">
                                            {/* Mock UI */}
                                            <div className="w-64 bg-stone-950 border border-stone-700 rounded-lg p-3 text-center">
                                                <div className="text-stone-500 text-xs mb-1">{t('user_guide.deposit_amount')}</div>
                                                <div className="text-xl text-white font-mono font-bold">1,000 {CURRENCY}</div>
                                                <div className="mt-2 bg-emerald-600 h-6 rounded w-3/4 mx-auto"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex gap-6 items-start">
                                    <div className="w-8 h-8 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-500/30">2</div>
                                    <div className="space-y-3 w-full">
                                        <h4 className="font-bold text-white">{t('user_guide.deposit_step2')}</h4>
                                        <p className="text-sm text-stone-500">{t('user_guide.deposit_step2_desc')}</p>
                                        <div className="bg-stone-900 p-4 rounded-lg border border-stone-800 flex flex-col items-center gap-3">
                                            <div className="flex gap-4 items-center opacity-70">
                                                <div className="w-16 h-16 bg-white rounded p-1"></div>
                                                <ArrowRight className="text-stone-600" />
                                                <div className="w-16 h-20 bg-stone-800 rounded border border-stone-600 flex items-center justify-center">
                                                    <div className="text-[8px] text-stone-500">SLIP</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded">{t('user_guide.deposit_step2_note')}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex gap-6 items-start">
                                    <div className="w-8 h-8 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-500/30">3</div>
                                    <div className="space-y-3 w-full">
                                        <h4 className="font-bold text-white">{t('user_guide.deposit_step3')}</h4>
                                        <p className="text-sm text-stone-500">{t('user_guide.deposit_step3_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'WITHDRAWAL' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="border-b border-stone-800 pb-4">
                                    <h3 className="text-2xl font-bold text-red-400 mb-2">{t('user_guide.withdraw_title')}</h3>
                                    <p className="text-stone-400">{t('user_guide.withdraw_subtitle')}</p>
                                </div>

                                {/* Step 1 */}
                                <div className="flex gap-6 items-start">
                                    <div className="w-8 h-8 rounded-full bg-red-900/50 text-red-400 flex items-center justify-center font-bold shrink-0 border border-red-500/30">1</div>
                                    <div className="space-y-3 w-full">
                                        <h4 className="font-bold text-white">{t('user_guide.withdraw_step1')}</h4>
                                        <p className="text-sm text-stone-500">{t('user_guide.withdraw_step1_desc')}</p>
                                        <div className="bg-stone-900 p-4 rounded-lg border border-stone-800 flex justify-center">
                                            <div className="w-40 p-4 border border-dashed border-stone-600 rounded bg-stone-950 text-center">
                                                <div className="w-8 h-8 bg-stone-800 rounded-full mx-auto mb-2"></div>
                                                <div className="text-[10px] text-stone-400">{t('user_guide.withdraw_step1_action')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="flex gap-6 items-start">
                                    <div className="w-8 h-8 rounded-full bg-red-900/50 text-red-400 flex items-center justify-center font-bold shrink-0 border border-red-500/30">2</div>
                                    <div className="space-y-3 w-full">
                                        <h4 className="font-bold text-white">{t('user_guide.withdraw_step2')}</h4>
                                        <p className="text-sm text-stone-500">{t('user_guide.withdraw_step2_desc')}</p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="flex gap-6 items-start">
                                    <div className="w-8 h-8 rounded-full bg-red-900/50 text-red-400 flex items-center justify-center font-bold shrink-0 border border-red-500/30">3</div>
                                    <div className="space-y-3 w-full">
                                        <h4 className="font-bold text-white">{t('user_guide.withdraw_step3')}</h4>
                                        <p className="text-sm text-stone-500">{t('user_guide.withdraw_step3_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};