
import React, { useState } from 'react';
import { X, Shield, ArrowUpCircle, Cpu, CheckCircle2, AlertTriangle, Plus, Sparkles, XCircle, Hammer } from 'lucide-react';
import { AccessoryItem, OilRig } from '../services/types';
import { InfinityGlove } from './InfinityGlove';
import { CURRENCY, RARITY_SETTINGS, UPGRADE_REQUIREMENTS, MATERIAL_CONFIG } from '../constants';
import { api } from '../services/api';
import { MaterialIcon } from './MaterialIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface GloveManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    rig: OilRig;
    equippedGlove: AccessoryItem | null;
    inventory: AccessoryItem[];
    userId: string;
    onEquip: (itemId: string) => void;
    onUnequip: () => void;
    onRefresh: () => void;
}

export const GloveManagementModal: React.FC<GloveManagementModalProps> = ({
    isOpen, onClose, rig, equippedGlove, inventory, userId, onEquip, onUnequip, onRefresh
}) => {
    const { getLocalized, t, formatCurrency, language } = useTranslation();
    const [view, setView] = useState<'MANAGE' | 'SELECT'>('MANAGE');
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [upgradeMsg, setUpgradeMsg] = useState<{ type: 'SUCCESS' | 'ERROR', text: string, level?: number, subtext?: string } | null>(null);

    if (!isOpen) return null;

    const availableGloves = inventory.filter(item =>
        item.typeId.includes('glove') &&
        (!item.expireAt || item.expireAt > Date.now())
    );

    const handleUpgrade = async () => {
        if (!equippedGlove) return;
        setIsUpgrading(true);
        setUpgradeMsg(null);

        try {
            const res = await api.inventory.upgrade(equippedGlove.id, false);
            if (res.success) {
                setUpgradeMsg({
                    type: 'SUCCESS',
                    text: t('glove_management.upgrade_success'),
                    level: res.item?.level,
                    subtext: t('glove_management.upgrade_success_desc')
                });
                onRefresh();
            } else {
                setUpgradeMsg({ type: 'ERROR', text: t('glove_management.upgrade_failed'), subtext: res.message || t('glove_management.upgrade_failed_desc') });
            }
        } catch (e: any) {
            setUpgradeMsg({ type: 'ERROR', text: t('glove_management.upgrade_failed'), subtext: e.response?.data?.message || e.message });
        } finally {
            setIsUpgrading(false);
        }
    };

    const renderResultPopup = () => {
        if (!upgradeMsg) return null;

        const isSuccess = upgradeMsg.type === 'SUCCESS';

        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
                {/* Background Effects */}
                <div className={`absolute inset-0 opacity-20 pointer-events-none ${isSuccess ? 'bg-[radial-gradient(circle,rgba(16,185,129,0.4)_0%,transparent_70%)]' : 'bg-[radial-gradient(circle,rgba(220,38,38,0.4)_0%,transparent_70%)]'}`}></div>

                <div className={`relative bg-stone-900 border-4 w-full max-w-sm rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center gap-6 transform transition-all
                  ${isSuccess ? 'border-emerald-500 shadow-emerald-900/50 scale-100' : 'border-red-600 shadow-red-900/50 animate-[shake_0.5s_ease-in-out]'}
              `}>
                    {/* Icon */}
                    <div className="relative">
                        <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 ${isSuccess ? 'bg-emerald-950 border-emerald-500' : 'bg-red-950 border-red-500'}`}>
                            {isSuccess ? (
                                <CheckCircle2 size={64} className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                            ) : (
                                <XCircle size={64} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                            )}
                        </div>
                        {isSuccess && (
                            <>
                                <Sparkles className="absolute -top-4 -right-4 text-yellow-400 animate-spin-slow" size={32} />
                                <Sparkles className="absolute bottom-0 -left-4 text-yellow-400 animate-pulse" size={24} />
                            </>
                        )}
                    </div>

                    {/* Text */}
                    <div>
                        <h2 className={`text-3xl font-display font-black uppercase tracking-wider mb-2 ${isSuccess ? 'text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-600' : 'text-red-500'}`}>
                            {upgradeMsg.text}
                        </h2>
                        <p className="text-stone-400 text-sm font-medium">
                            {upgradeMsg.subtext}
                        </p>
                        {isSuccess && upgradeMsg.level && (
                            <div className="mt-4 inline-block bg-yellow-600/20 border border-yellow-500/50 px-4 py-1 rounded-full">
                                <span className="text-yellow-500 font-bold text-lg">LEVEL {upgradeMsg.level}</span>
                            </div>
                        )}
                    </div>

                    {/* Button */}
                    <button
                        onClick={() => setUpgradeMsg(null)}
                        className={`w-full py-3.5 rounded-xl font-bold text-white text-lg transition-all transform active:scale-95 shadow-lg
                          ${isSuccess ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30' : 'bg-stone-800 hover:bg-stone-700 border border-stone-600'}
                      `}
                    >
                        {isSuccess ? t('glove_management.great') : t('glove_management.close')}
                    </button>
                </div>
            </div>
        );
    };

    const renderManageView = () => {
        const safeRarity = equippedGlove?.rarity && RARITY_SETTINGS[equippedGlove.rarity] ? equippedGlove.rarity : 'COMMON';
        const rarityConfig = RARITY_SETTINGS[safeRarity];
        const currentLevel = equippedGlove?.level || 1;
        const nextLevel = currentLevel + 1;
        const upgradeReq = UPGRADE_REQUIREMENTS[currentLevel];

        const matName = upgradeReq ? MATERIAL_CONFIG.NAMES[upgradeReq.matTier as keyof typeof MATERIAL_CONFIG.NAMES] : '';
        const increment = equippedGlove ? RARITY_SETTINGS[safeRarity].upgradeIncrement : 0;

        return (
            <div className="flex flex-col">
                {/* Card Display */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">

                    {equippedGlove ? (
                        <div className={`relative w-48 h-64 rounded-2xl border-2 ${rarityConfig.border} bg-stone-900/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center overflow-hidden animate-in zoom-in duration-300`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${rarityConfig.bgGradient} opacity-20`}></div>

                            <div className="relative z-10 mb-4 scale-125">
                                <InfinityGlove rarity={equippedGlove.rarity} size={80} />
                                {equippedGlove.isStarter && (
                                    <div className="absolute -bottom-2 -right-2 bg-red-900 border border-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        LOCKED
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10 text-center px-4">
                                <h3 className={`font-bold text-lg leading-tight ${rarityConfig.color}`}>{getLocalized(equippedGlove.name)}</h3>
                                <div className="text-xs text-stone-400 mt-1">{rarityConfig.label}</div>
                                {equippedGlove.level && equippedGlove.level > 1 && (
                                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-yellow-600 text-white text-xs font-bold shadow-lg">
                                        Lv.{equippedGlove.level}
                                    </span>
                                )}
                            </div>

                            <div className="absolute bottom-0 w-full bg-stone-950/80 backdrop-blur-sm py-2 text-center border-t border-stone-800">
                                <div className="text-stone-400 text-[10px] uppercase tracking-wider">{t('glove_management.daily_bonus')}</div>
                                <div className="text-emerald-400 font-mono font-bold text-lg">+{formatCurrency(equippedGlove.dailyBonus || 0, { showDecimals: true })}</div>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => setView('SELECT')}
                            className="w-48 h-64 rounded-2xl border-2 border-dashed border-stone-700 bg-stone-900/50 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 hover:bg-stone-800/80 transition-all group"
                        >
                            <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="text-stone-500 group-hover:text-yellow-500" size={32} />
                            </div>
                            <span className="text-stone-500 font-bold group-hover:text-yellow-500">{t('glove_management.select_manager')}</span>
                            <span className="text-xs text-stone-600 mt-1">{t('glove_management.click_to_assign')}</span>
                        </div>
                    )}
                </div>

                {/* Action Area */}
                <div className="bg-stone-900 p-6 border-t border-stone-800">
                    {equippedGlove ? (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                {/* Starter Glove Restriction */}
                                {equippedGlove.isStarter ? (
                                    <div className="w-full py-3 bg-stone-800/50 border border-stone-700/50 rounded-lg text-stone-500 font-bold text-sm text-center flex items-center justify-center gap-2 cursor-not-allowed">
                                        <Shield size={16} />
                                        {language === 'th' ? 'ผู้จัดการประจำเครื่อง (ไม่สามารถถอดได้)' : 'Permanent Manager (Locked)'}
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setView('SELECT')}
                                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold text-sm shadow-lg transition-colors"
                                        >
                                            {t('glove_management.change_manager')}
                                        </button>
                                        <button
                                            onClick={onUnequip}
                                            className="px-4 py-3 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded-lg text-red-400 font-bold text-sm transition-colors"
                                        >
                                            {t('glove_management.unequip')}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Upgrade Section */}
                            <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 relative overflow-hidden">
                                {upgradeReq ? (
                                    <>
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-sm font-bold text-stone-300">
                                                {t('glove_management.upgrade_title')} Lv.{currentLevel} <span className="text-stone-500">➜</span> <span className="text-yellow-500">Lv.{nextLevel}</span>
                                            </div>
                                            <div className="text-xs text-emerald-400 font-mono">+{increment.toFixed(1)}{t('common.per_day')}</div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4 bg-stone-900 p-2 rounded border border-stone-800">
                                            <div className="flex-1 flex items-center justify-center gap-2 text-xs text-stone-300 border-r border-stone-800 pr-2">
                                                <div className="bg-stone-800 p-1 rounded"><Cpu size={14} className="text-purple-400" /></div>
                                                <span>{t('glove_management.chip')} x1</span>
                                            </div>
                                            <div className="flex-1 flex items-center justify-center gap-2 text-xs text-stone-300">
                                                <div className="bg-stone-800 p-1 rounded"><MaterialIcon id={upgradeReq.matTier} size="w-4 h-4" iconSize={12} /></div>
                                                <span>{getLocalized(matName)} x{upgradeReq.matAmount}</span>
                                            </div>
                                            {upgradeReq.cost && upgradeReq.cost > 0 && (
                                                <div className="flex-1 flex items-center justify-center gap-2 text-xs text-stone-300 border-l border-stone-800 pl-2">
                                                    <div className="bg-stone-800 p-1 rounded text-yellow-500 font-bold">฿</div>
                                                    <span>{upgradeReq.cost} {t('glove_management.baht')}</span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleUpgrade}
                                            disabled={isUpgrading}
                                            className="w-full py-3 bg-gradient-to-r from-stone-800 to-stone-700 hover:from-yellow-700 hover:to-yellow-600 border border-stone-600 hover:border-yellow-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isUpgrading ? (
                                                <span className="animate-pulse flex items-center gap-2"><Hammer className="animate-bounce" size={16} /> {t('glove_management.upgrading')}</span>
                                            ) : (
                                                <>
                                                    <ArrowUpCircle size={16} className="text-emerald-400 group-hover:text-white" />
                                                    {t('glove_management.upgrade_action').replace('{chance}', (upgradeReq.chance * 100).toFixed(0))}
                                                </>
                                            )}
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 h-48 animate-in zoom-in duration-300">
                                        <div className="relative">
                                            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_25px_rgba(234,179,8,0.4)] tracking-tighter">MAX</h1>
                                            <div className="absolute inset-0 bg-yellow-500/10 blur-xl rounded-full"></div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 text-yellow-500 font-bold tracking-[0.2em] text-xs uppercase opacity-80">
                                            <span className="w-8 h-px bg-gradient-to-r from-transparent to-yellow-500"></span>
                                            Level Maximum
                                            <span className="w-8 h-px bg-gradient-to-l from-transparent to-yellow-500"></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-stone-500 text-sm py-4">
                            {t('glove_management.no_manager_equipped')}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSelectView = () => {
        return (
            <div className="flex flex-col h-full bg-stone-950">
                <div className="p-4 border-b border-stone-800 bg-stone-900 flex items-center gap-2">
                    <button onClick={() => setView('MANAGE')} className="p-1 hover:bg-stone-800 rounded"><ArrowUpCircle className="-rotate-90" size={20} /></button>
                    <span className="font-bold text-white">{t('glove_management.select_manager')}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 grid grid-cols-2 gap-3">
                    {availableGloves.length === 0 ? (
                        <div className="col-span-2 text-center text-stone-500 py-10">{t('glove_management.no_managers_in_inv')}</div>
                    ) : (
                        availableGloves.map(item => (
                            <div
                                key={item.id}
                                onClick={() => { onEquip(item.id); setView('MANAGE'); }}
                                className="bg-stone-900 border border-stone-800 hover:border-yellow-500 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center text-center gap-2 group"
                            >
                                <div className="relative">
                                    <InfinityGlove rarity={item.rarity} size={40} className="group-hover:scale-110 transition-transform" />
                                    {item.level && item.level > 1 && <div className="absolute -bottom-1 -right-2 bg-yellow-600 text-white text-[9px] px-1 rounded">+{item.level}</div>}
                                </div>
                                <div>
                                    {(() => {
                                        const safeItemRarity = item.rarity && RARITY_SETTINGS[item.rarity] ? item.rarity : 'COMMON';
                                        return (
                                            <>
                                                <div className={`text-xs font-bold ${RARITY_SETTINGS[safeItemRarity].color}`}>{getLocalized(item.name)}</div>
                                                <div className="text-[10px] text-emerald-400 mt-1">+{formatCurrency(item.dailyBonus || 0, { showDecimals: true })}</div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            {renderResultPopup()}

            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                <div className={`bg-stone-950 border border-stone-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${view === 'SELECT' ? 'h-[600px]' : 'h-auto max-h-[90vh] overflow-y-auto custom-scrollbar'}`}>
                    {/* Header */}
                    <div className="bg-stone-900 p-4 border-b border-stone-800 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-900/20 p-2 rounded text-blue-500">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-display font-bold text-white">{t('glove_management.title')}</h2>
                                <p className="text-[10px] text-stone-500 uppercase tracking-wider">{t('glove_management.assign_to')} {getLocalized(rig.name)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {view === 'MANAGE' ? renderManageView() : renderSelectView()}
                </div>
            </div>
        </>
    );
};
