import React, { useState } from 'react';
import { X, BookOpen, Wallet, Download, CheckCircle, ArrowRight, Package, RefreshCw, Zap, Hammer, Sparkles, AlertTriangle, Key, Cpu, ShieldCheck, Wrench, Pickaxe, ArrowUp, Info, Activity } from 'lucide-react';
import { CURRENCY } from '../constants';
import { MaterialIcon } from './MaterialIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface UserGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}


const RefinementSchematic = () => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-center gap-4 py-8 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-2xl border border-stone-700/50 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('/assets/grid.png')] opacity-10"></div>
            <div className="absolute inset-0 bg-orange-500/5 mix-blend-overlay"></div>

            {/* Input Slot */}
            <div className="relative flex flex-col items-center">
                <div className="w-20 h-20 bg-stone-950 border-2 border-dashed border-stone-700 rounded-xl flex items-center justify-center relative z-10 shadow-inner group-hover:border-orange-500/50 transition-colors">
                    <MaterialIcon id={0} size="w-12 h-12" />
                </div>
                <span className="text-[10px] font-bold text-stone-500 mt-2 uppercase tracking-wide">{t('user_guide.guide_schematics.raw_ore')}</span>
            </div>

            {/* Arrow Animation */}
            <div className="flex flex-col items-center relative gap-1">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-stone-700 via-orange-500 to-stone-700 opacity-50"></div>
                <ArrowRight className="text-orange-500 animate-pulse relative z-10" size={24} />
                <div className="px-2 py-0.5 bg-stone-900 border border-stone-700 rounded text-[10px] text-orange-400 font-mono">{t('user_guide.guide_schematics.mix_process')}</div>
            </div>

            {/* Mixer/Process Center */}
            <div className="relative flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-b from-stone-800 to-stone-950 border border-stone-600 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                    <RefreshCw className="text-orange-500 animate-[spin_3s_linear_infinite]" size={32} />
                </div>
                <span className="text-[10px] font-bold text-orange-400 mt-2 uppercase tracking-wide">{t('user_guide.guide_schematics.refining')}</span>
            </div>

            {/* Arrow Animation */}
            <div className="flex flex-col items-center relative gap-1">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-stone-700 via-orange-500 to-stone-700 opacity-50"></div>
                <ArrowRight className="text-orange-500 animate-pulse delay-75 relative z-10" size={24} />
            </div>

            {/* Output Slot */}
            <div className="relative flex flex-col items-center">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-orange-900/40 to-stone-900 border border-orange-500/50 rounded-xl flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    <MaterialIcon id={4} size="w-12 h-12" />
                    <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">{t('user_guide.guide_schematics.get_material')}</div>
                </div>
                <span className="text-[10px] font-bold text-orange-300 mt-2 uppercase tracking-wide">{t('user_guide.guide_schematics.material')}</span>
            </div>
        </div>
    );
};

const UpgradeSchematic = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-6 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-2xl border border-stone-700/50 shadow-xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 border-b border-stone-800 pb-2 w-full px-6">
                <Wrench className="text-stone-500" size={16} />
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{t('user_guide.guide_schematics.upgrade_station')}</span>
            </div>

            <div className="flex items-center gap-8">
                {/* Item Card */}
                <div className="relative group">
                    <div className="w-32 h-40 bg-stone-950 border border-stone-700 rounded-lg flex flex-col items-center p-3 relative z-10 transition-transform group-hover:scale-105 duration-300">
                        <div className="w-full flex justify-between text-[10px] text-stone-500 font-mono mb-2">
                            <span>LV.1</span>
                            <span className="text-yellow-500">★☆☆☆☆</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <Pickaxe size={48} className="text-stone-400" />
                        </div>
                        <div className="w-full bg-stone-900 rounded h-1.5 mt-2 overflow-hidden">
                            <div className="bg-yellow-600 h-full w-1/3"></div>
                        </div>
                    </div>
                    {/* Glow behind */}
                    <div className="absolute inset-0 bg-yellow-600/10 blur-xl -z-0"></div>
                </div>

                {/* Action Visual */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-stone-900 border border-yellow-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                        <Zap className="text-yellow-400 fill-yellow-400/20" size={20} />
                    </div>
                    <div className="text-[10px] font-mono text-yellow-500">{t('user_guide.guide_schematics.chip_cost')}</div>
                    <ArrowRight className="text-stone-600" size={16} />
                </div>

                {/* Result Preview (Ghost) */}
                <div className="relative opacity-80">
                    <div className="w-32 h-40 bg-stone-900/50 border border-yellow-500/50 border-dashed rounded-lg flex flex-col items-center p-3 relative z-10">
                        <div className="w-full flex justify-between text-[10px] text-yellow-200 font-mono mb-2">
                            <span className="text-yellow-400 font-bold">LV.2</span>
                            <span className="text-yellow-500">★☆☆☆☆</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <Pickaxe size={48} className="text-yellow-100 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                        </div>
                        <div className="absolute -bottom-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                            <ArrowUp size={8} /> {t('user_guide.guide_schematics.power_bonus')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CraftingSchematic = () => {
    const { t } = useTranslation();
    return (
        <div className="relative py-6 bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
            <div className="absolute top-0 left-0 p-3">
                <div className="flex items-center gap-2 text-purple-400">
                    <Hammer size={16} />
                    <span className="text-[10px] font-black uppercase tracking-wider">{t('user_guide.guide_schematics.blueprint')}</span>
                </div>
            </div>

            <div className="flex items-center justify-center mt-6 gap-2">
                {/* Mat A */}
                <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-stone-950 border border-stone-700 rounded-lg flex items-center justify-center">
                        <MaterialIcon id={2} size="w-8 h-8" />
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1">{t('user_guide.guide_schematics.raw_ore')}</span>
                </div>
                <span className="text-stone-600 font-bold">+</span>
                {/* Mat B */}
                <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-stone-950 border border-stone-700 rounded-lg flex items-center justify-center">
                        <MaterialIcon id={3} size="w-8 h-8" />
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1">{t('user_guide.guide_schematics.material')}</span>
                </div>

                <div className="flex items-center px-2 text-stone-600">
                    <ArrowRight size={20} />
                </div>

                {/* Result */}
                <div className="flex flex-col items-center relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-lg"></div>
                    <div className="w-20 h-20 bg-gradient-to-br from-stone-800 to-stone-900 border border-purple-500 rounded-xl flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                        <Wrench className="text-purple-400" size={32} />
                    </div>
                    <span className="text-[10px] font-bold text-purple-300 mt-2 uppercase tracking-wide">{t('user_guide.guide_schematics.repair_kit')}</span>
                </div>
            </div>
        </div>
    );
};

const DepositSchematic = () => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-center py-6 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 rounded-2xl border border-stone-700/50 shadow-xl overflow-hidden relative">
            <div className="flex gap-4 items-center">
                {/* App/Bank Mock */}
                <div className="w-24 h-40 bg-white rounded-xl border-4 border-stone-800 shadow-2xl overflow-hidden relative flex flex-col items-center pt-2">
                    <div className="w-8 h-1 bg-stone-200 rounded-full mb-2"></div>
                    <div className="w-full h-24 bg-blue-500 rounded-b-xl flex items-center justify-center text-white font-bold text-[10px]">BANK APP</div>
                    <div className="mt-2 text-[8px] text-stone-900 font-bold">{t('user_guide.guide_schematics.transfer')}</div>
                    <div className="text-[8px] text-stone-500">1,000 THB</div>
                </div>

                <ArrowRight className="text-emerald-500 animate-pulse" />

                {/* Game Wallet Mock */}
                <div className="w-24 h-40 bg-stone-900 rounded-xl border-2 border-yellow-500/50 shadow-2xl overflow-hidden relative flex flex-col items-center pt-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
                        <Wallet className="text-yellow-500" size={20} />
                    </div>
                    <div className="text-[8px] text-stone-400">{t('user_guide.guide_schematics.balance')}</div>
                    <div className="text-xs text-yellow-500 font-bold">+1,000</div>
                </div>
            </div>
        </div>
    );
};

const WithdrawSchematic = () => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-center py-6 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 rounded-2xl border border-stone-700/50 shadow-xl overflow-hidden relative">
            <div className="flex gap-4 items-center">
                {/* Game Wallet Mock */}
                <div className="w-24 h-40 bg-stone-900 rounded-xl border-2 border-red-500/50 shadow-2xl overflow-hidden relative flex flex-col items-center pt-4">
                    <div className="w-10 h-10 rounded-full bg-red-900/20 flex items-center justify-center mb-2">
                        <Wallet className="text-red-500" size={20} />
                    </div>
                    <div className="text-[8px] text-stone-400">{t('user_guide.guide_schematics.balance')}</div>
                    <div className="text-xs text-red-500 font-bold">-1,000</div>
                </div>

                <ArrowRight className="text-stone-500 animate-pulse" />

                {/* App/Bank Mock */}
                <div className="w-24 h-40 bg-white rounded-xl border-4 border-stone-800 shadow-2xl overflow-hidden relative flex flex-col items-center pt-2">
                    <div className="w-8 h-1 bg-stone-200 rounded-full mb-2"></div>
                    <div className="w-full h-24 bg-blue-500 rounded-b-xl flex items-center justify-center text-white font-bold text-[10px]">BANK APP</div>
                    <div className="mt-2 text-[8px] text-stone-900 font-bold">{t('user_guide.guide_schematics.received')}</div>
                    <div className="text-[8px] text-stone-500">1,000 THB</div>
                </div>
            </div>
        </div>
    );
};

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAWAL' | 'REFINEMENT' | 'UPGRADE' | 'CRAFTING' | 'ITEMS'>('DEPOSIT');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

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
                            onClick={() => setActiveTab('ITEMS')}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'ITEMS' ? 'bg-blue-900/20 text-blue-400 border border-blue-900/50' : 'text-stone-400 hover:bg-stone-800'}`}
                        >
                            <Package size={18} />
                            <span className="font-bold text-sm">{t('user_guide.items_tab')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('REFINEMENT')}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'REFINEMENT' ? 'bg-orange-900/20 text-orange-400 border border-orange-900/50' : 'text-stone-400 hover:bg-stone-800'}`}
                        >
                            <RefreshCw size={18} />
                            <span className="font-bold text-sm">{t('user_guide.refinement_tab')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('UPGRADE')}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'UPGRADE' ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-900/50' : 'text-stone-400 hover:bg-stone-800'}`}
                        >
                            <Zap size={18} />
                            <span className="font-bold text-sm">{t('user_guide.upgrade_tab')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('CRAFTING')}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'CRAFTING' ? 'bg-purple-900/20 text-purple-400 border border-purple-900/50' : 'text-stone-400 hover:bg-stone-800'}`}
                        >
                            <Hammer size={18} />
                            <span className="font-bold text-sm">{t('user_guide.equipment_tab')}</span>
                        </button>
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

                        {activeTab === 'REFINEMENT' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="border-b border-stone-800 pb-4">
                                    <h3 className="text-2xl font-bold text-orange-400 mb-2">{t('user_guide.refinement_title')}</h3>
                                    <p className="text-stone-400">{t('user_guide.refinement_desc')}</p>
                                </div>

                                <RefinementSchematic />

                                <div className="space-y-6">
                                    <div className="flex gap-6 items-start">
                                        <div className="w-8 h-8 rounded-full bg-orange-900/50 text-orange-400 flex items-center justify-center font-bold shrink-0 border border-orange-500/30">1</div>
                                        <div>
                                            <h4 className="font-bold text-white">{t('user_guide.refinement_step1')}</h4>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 items-start">
                                        <div className="w-8 h-8 rounded-full bg-orange-900/50 text-orange-400 flex items-center justify-center font-bold shrink-0 border border-orange-500/30">2</div>
                                        <div>
                                            <h4 className="font-bold text-white">{t('user_guide.refinement_step2')}</h4>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 items-start">
                                        <div className="w-8 h-8 rounded-full bg-orange-900/50 text-orange-400 flex items-center justify-center font-bold shrink-0 border border-orange-500/30">3</div>
                                        <div>
                                            <h4 className="font-bold text-white">{t('user_guide.refinement_step3')}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'UPGRADE' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="border-b border-stone-800 pb-4">
                                    <h3 className="text-2xl font-bold text-yellow-500 mb-2">{t('user_guide.upgrade_title')}</h3>
                                    <p className="text-stone-400">{t('user_guide.upgrade_desc')}</p>
                                </div>

                                <UpgradeSchematic />

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Zap className="text-yellow-500" size={20} />
                                            <h4 className="font-bold text-white">{t('user_guide.upgrade_smelting')}</h4>
                                        </div>
                                    </div>
                                    <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Sparkles className="text-blue-400" size={20} />
                                            <h4 className="font-bold text-white">{t('user_guide.upgrade_stars')}</h4>
                                        </div>
                                    </div>
                                    <div className="bg-red-900/20 p-4 rounded-xl border border-red-900/30">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="text-red-500" size={20} />
                                            <p className="text-sm font-bold text-red-500">{t('user_guide.upgrade_warning')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'CRAFTING' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="border-b border-stone-800 pb-4">
                                    <h3 className="text-2xl font-bold text-purple-400 mb-2">{t('user_guide.crafting_title')}</h3>
                                    <p className="text-stone-400">{t('user_guide.crafting_desc')}</p>
                                </div>

                                <CraftingSchematic />

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 bg-stone-900/30 p-4 rounded-lg">
                                        <div className="p-3 bg-purple-900/20 rounded shadow-inner"><Hammer size={24} className="text-purple-400" /></div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1">Equipment Crafting</h4>
                                            <p className="text-stone-500 text-sm">{t('user_guide.crafting_equip')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 bg-stone-900/30 p-4 rounded-lg">
                                        <div className="p-3 bg-red-900/20 rounded shadow-inner"><Wrench size={24} className="text-red-400" /></div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1">Repair Kits</h4>
                                            <p className="text-stone-500 text-sm">{t('user_guide.crafting_repair')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ITEMS' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="border-b border-stone-800 pb-4">
                                    <h3 className="text-2xl font-bold text-blue-400 mb-2">{t('user_guide.items_title')}</h3>
                                    <p className="text-stone-400">Essential items to help you grow your empire.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { title: t('user_guide.items_key'), icon: Key, color: 'text-yellow-500' },
                                        { title: t('user_guide.items_chip'), icon: Cpu, color: 'text-blue-400' },
                                        { title: t('user_guide.items_mixer'), icon: RefreshCw, color: 'text-orange-400' },
                                        { title: t('user_guide.items_insurance'), icon: ShieldCheck, color: 'text-emerald-400' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-stone-900/50 p-4 rounded-xl border border-stone-800/50">
                                            <item.icon className={item.color} size={24} />
                                            <p className="text-sm font-medium text-stone-300">{item.title}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'DEPOSIT' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="border-b border-stone-800 pb-4">
                                    <h3 className="text-2xl font-bold text-emerald-400 mb-2">{t('user_guide.deposit_title')}</h3>
                                    <p className="text-stone-400">{t('user_guide.deposit_subtitle')}</p>
                                </div>

                                <DepositSchematic />

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

                                <WithdrawSchematic />

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