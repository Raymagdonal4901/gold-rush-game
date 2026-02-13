
import React, { useState, useEffect } from 'react';
import { Sparkles, HardHat, Glasses, Shirt, Backpack, Footprints, Smartphone, Monitor, Bot, Hand, Lock, Truck, Cpu, Hourglass, Key, Factory, Search, FileText, Briefcase, Settings, Hammer, Wrench } from 'lucide-react';
import { Rarity } from '../services/types';
import { RARITY_SETTINGS, CURRENCY } from '../constants';
import { InfinityGlove } from './InfinityGlove';
import { MaterialIcon } from './MaterialIcon';
import { useTranslation } from '../contexts/LanguageContext';

interface LootBoxModalProps {
    isOpen: boolean;
    onClose: () => void;
    rarity: Rarity;
    bonus: number;
    itemTypeId?: string;
    itemName?: string;
    materialId?: number;
}

// Icon renderer based on Item ID with Name Fallback
const ItemIcon: React.FC<{ typeId?: string, name?: string, materialId?: number, rarity: Rarity, className?: string }> = ({ typeId, name, materialId, rarity, className }) => {
    // If we have a material ID, show the Material Icon
    if (materialId) {
        return <MaterialIcon id={materialId} size="w-32 h-32" iconSize={80} />;
    }

    const itemNameInput = name || '';
    const itemName = typeof itemNameInput === 'object' ? (itemNameInput as any).en || (itemNameInput as any).th || '' : String(itemNameInput);

    // Name-Based Overrides (Robust Fallback)
    if (itemName.includes('ชิป') || itemName.includes('Chip')) return <Cpu className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('กุญแจ') || itemName.includes('Key')) return <Key className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('เครื่องผสม') || itemName.includes('Mixer')) return <Factory className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('แว่นขยาย') || itemName.includes('Magnifying')) return <Search className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('ใบประกัน') || itemName.includes('Insurance')) return <FileText className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />; // Import FileText if needed
    if (itemName.includes('นาฬิกาทราย') || itemName.includes('Hourglass')) return <Hourglass className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('Repair Kit') || itemName.includes('ชุดซ่อม')) {
        if (itemName.includes('Basic') || itemName.includes('พื้นฐาน')) return <Hammer className={className} />;
        if (itemName.includes('Standard') || itemName.includes('มาตรฐาน')) return <Briefcase className={className} />;
        if (itemName.includes('Electronic') || itemName.includes('อิเล็กทรอนิกส์')) return <Cpu className={className} />;
        if (itemName.includes('Mechanic') || itemName.includes('เครื่องจักร')) return <Settings className={className} />;
        return <Wrench className={className} />;
    }

    if (itemName.includes('หมวก') || itemName.includes('Helmet')) return <HardHat className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('แว่น') || itemName.includes('Glasses')) return <Glasses className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('ชุด') || itemName.includes('Uniform') || itemName.includes('Suit')) return <Shirt className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('กระเป๋า') || itemName.includes('Bag') || itemName.includes('Backpack')) return <Backpack className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('รองเท้า') || itemName.includes('Boots')) return <Footprints className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('มือถือ') || itemName.includes('Mobile') || itemName.includes('Phone')) return <Smartphone className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('คอม') || itemName.includes('PC') || itemName.includes('Computer')) return <Monitor className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('หุ่นยนต์') || itemName.includes('Robot')) return <Bot className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
    if (itemName.includes('ระบบล็อค') || itemName.includes('Lock')) return <Truck className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;

    // If it's a "glove" or undefined type (default loot), show the Infinity Glove
    // But verify it's not one of the above first (implicit else)
    if (!typeId || typeId === 'glove') {
        return <InfinityGlove rarity={rarity} className={className} size={100} />;
    }

    let IconComp = Hand;
    if (typeId.startsWith('hat')) IconComp = HardHat;
    else if (typeId.startsWith('glasses')) IconComp = Glasses;
    else if (typeId.startsWith('uniform')) IconComp = Shirt;
    else if (typeId.startsWith('bag')) IconComp = Backpack;
    else if (typeId.startsWith('boots')) IconComp = Footprints;
    else if (typeId.startsWith('mobile')) IconComp = Smartphone;
    else if (typeId.startsWith('pc')) IconComp = Monitor;
    else if (typeId.startsWith('robot')) IconComp = Bot;
    else if (typeId === 'auto_excavator') IconComp = Truck;
    else if (typeId === 'upgrade_chip') IconComp = Cpu;
    else if (typeId.startsWith('hourglass')) IconComp = Hourglass;
    else if (typeId.startsWith('repair_kit')) {
        if (typeId === 'repair_kit_1') IconComp = Hammer;
        else if (typeId === 'repair_kit_2') IconComp = Briefcase;
        else if (typeId === 'repair_kit_3') IconComp = Cpu;
        else if (typeId === 'repair_kit_4') IconComp = Settings;
        else IconComp = Wrench;
    }
    else return <InfinityGlove rarity={rarity} className={className} size={100} />;

    return <IconComp className={className} style={{ color: rarity === 'LEGENDARY' ? '#facc15' : undefined }} />;
};

export const LootBoxModal: React.FC<LootBoxModalProps> = ({ isOpen, onClose, rarity, bonus, itemTypeId, itemName, materialId }) => {
    const { t, language, getLocalized } = useTranslation();
    const localizedItemName = getLocalized(itemName);
    // Stages: idle -> shaking -> unlocking (chains break) -> opening (lid lifts) -> flash -> revealed
    const [stage, setStage] = useState<'idle' | 'shaking' | 'unlocking' | 'opening' | 'flash' | 'revealed'>('idle');

    useEffect(() => {
        if (isOpen) {
            setStage('idle');
        }
    }, [isOpen]);

    const handleBoxClick = () => {
        if (stage !== 'idle') return;

        setStage('shaking');

        // Animation Sequence
        setTimeout(() => setStage('unlocking'), 800);   // Chains break
        setTimeout(() => setStage('opening'), 1500);    // Lid Opens
        setTimeout(() => setStage('flash'), 2000);      // Flash Bang
        setTimeout(() => setStage('revealed'), 2200);   // Show Item
    };

    if (!isOpen) return null;

    const config = RARITY_SETTINGS[rarity];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl perspective-1000 overflow-hidden">

            {/* 1. Global Ambient Rays (Always rotating slowly in background) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(234,179,8,0.3)_30deg,transparent_60deg,rgba(234,179,8,0.3)_90deg,transparent_120deg,rgba(234,179,8,0.3)_150deg,transparent_180deg,rgba(234,179,8,0.3)_210deg,transparent_240deg,rgba(234,179,8,0.3)_270deg,transparent_300deg,rgba(234,179,8,0.3)_330deg,transparent_360deg)] animate-[spin_20s_linear_infinite]"></div>
            </div>

            {/* 2. Flash Bang Effect */}
            <div className={`absolute inset-0 z-[70] bg-white pointer-events-none transition-opacity duration-700 ease-out ${stage === 'flash' || stage === 'revealed' ? (stage === 'flash' ? 'opacity-100' : 'opacity-0') : 'opacity-0'}`}></div>

            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md p-8">

                {/* Title */}
                <div className={`transition-all duration-700 transform ${stage === 'revealed' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'} absolute top-10 w-full text-center z-20`}>
                    <h2 className={`text-4xl font-display font-black uppercase tracking-widest ${config.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]`}>
                        {config.label}
                    </h2>
                    <div className={`text-2xl font-bold text-white mt-1 drop-shadow-md`}>{localizedItemName || t('lootbox.unknown')}</div>
                </div>

                {/* The Treasure Chest Container */}
                <div className="relative h-96 w-full flex flex-col items-center justify-center">
                    {stage !== 'revealed' && stage !== 'flash' ? (
                        <div
                            onClick={handleBoxClick}
                            className={`
                      cursor-pointer transition-all duration-100 flex flex-col items-center justify-center relative select-none
                      ${stage === 'idle' ? 'hover:scale-105 animate-[float-gold_3s_ease-in-out_infinite]' : ''}
                      ${stage === 'shaking' ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''}
                      ${stage === 'opening' ? 'scale-110 duration-500' : ''}
                  `}
                        >
                            {/* TREASURE CHEST SVG */}
                            <svg width="280" height="260" viewBox="0 0 280 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_25px_50px_rgba(234,179,8,0.2)]">
                                <defs>
                                    <linearGradient id="gold-gradient" x1="0" y1="0" x2="280" y2="260" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#fef08a" /> {/* Yellow-200 */}
                                        <stop offset="0.3" stopColor="#eab308" /> {/* Yellow-500 */}
                                        <stop offset="0.6" stopColor="#a16207" /> {/* Yellow-800 */}
                                        <stop offset="1" stopColor="#713f12" /> {/* Yellow-900 */}
                                    </linearGradient>
                                    <linearGradient id="diamond-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                                        <stop offset="0" stopColor="#cffafe" />
                                        <stop offset="1" stopColor="#06b6d4" />
                                    </linearGradient>
                                    <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="5" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>

                                {/* --- CHEST BACK (Inside) --- */}
                                <path d="M40 120 L240 120 L230 220 L50 220 Z" fill="#292524" />
                                <rect x="50" y="120" width="180" height="100" fill="#000" opacity="0.3" />

                                {/* --- GLOW FROM INSIDE (When Opening) --- */}
                                <g className={`transition-opacity duration-500 ${stage === 'opening' ? 'opacity-100' : 'opacity-0'}`}>
                                    <path d="M60 120 L140 20 L220 120 Z" fill="url(#gold-gradient)" opacity="0.6" filter="url(#glow-gold)" />
                                    <circle cx="140" cy="120" r="40" fill="white" filter="url(#glow-gold)" opacity="0.8" />
                                </g>

                                {/* --- CHEST LID --- */}
                                <g className={`origin-[140px_120px] transition-transform duration-700 ease-in-out ${stage === 'opening' ? '-translate-y-16 -rotate-12 opacity-0' : ''}`}>
                                    {/* Lid Shape */}
                                    <path d="M30 120 Q140 60 250 120 L250 140 L30 140 Z" fill="url(#gold-gradient)" stroke="#713f12" strokeWidth="2" />
                                    <path d="M30 120 Q140 60 250 120" stroke="#fef08a" strokeWidth="2" opacity="0.5" />
                                    {/* Lid Trim */}
                                    <path d="M30 135 L250 135 L250 145 L30 145 Z" fill="#854d0e" />
                                </g>

                                {/* --- CHEST BODY --- */}
                                <g>
                                    {/* Main Body */}
                                    <path d="M35 140 L245 140 L235 230 L45 230 Z" fill="url(#gold-gradient)" stroke="#713f12" strokeWidth="2" />

                                    {/* Corner Reinforcements (Diamond/Platinum) */}
                                    <path d="M35 140 L55 140 L50 230 L45 230 Z" fill="#e2e8f0" stroke="#94a3b8" />
                                    <path d="M225 140 L245 140 L235 230 L230 230 Z" fill="#e2e8f0" stroke="#94a3b8" />

                                    {/* Diamond Decor */}
                                    <path d="M140 180 L150 195 L140 210 L130 195 Z" fill="url(#diamond-gradient)" stroke="#22d3ee" strokeWidth="1" filter="url(#glow-gold)" />
                                </g>

                                {/* --- CHAINS & LOCK (Disappear when unlocking) --- */}
                                <g className={`transition-all duration-500 ease-in ${stage === 'unlocking' || stage === 'opening' ? 'translate-y-20 opacity-0' : ''}`}>
                                    {/* Vertical Chain Left */}
                                    <rect x="90" y="80" width="15" height="160" fill="#334155" stroke="#0f172a" strokeWidth="2" />
                                    {/* Vertical Chain Right */}
                                    <rect x="175" y="80" width="15" height="160" fill="#334155" stroke="#0f172a" strokeWidth="2" />

                                    {/* Padlock Shackle */}
                                    <path d="M125 150 Q125 120 140 120 Q155 120 155 150" fill="none" stroke="#94a3b8" strokeWidth="8" />

                                    {/* Padlock Body */}
                                    <rect x="115" y="150" width="50" height="40" rx="5" fill="#eab308" stroke="#713f12" strokeWidth="2" />
                                    <circle cx="140" cy="170" r="5" fill="#000" />
                                    <path d="M140 170 L140 180" stroke="#000" strokeWidth="3" />
                                </g>
                            </svg>

                            {/* Glow behind Box */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-500/20 rounded-full blur-[60px] -z-10 animate-pulse"></div>

                            {stage === 'idle' && (
                                <div className="absolute -bottom-16 flex flex-col items-center gap-2 animate-pulse pointer-events-none">
                                    <span className="text-base font-bold text-yellow-100 uppercase tracking-widest bg-black/50 px-6 py-2 rounded-full border border-yellow-500/50 backdrop-blur-md shadow-xl flex items-center gap-2">
                                        <Lock size={14} /> {t('lootbox.tap_to_open')}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={`relative flex items-center justify-center w-full h-full transition-all duration-1000 ${stage === 'revealed' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>

                            {/* Rotating Sunburst behind Item */}
                            <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
                                <svg viewBox="0 0 200 200" className="w-full h-full opacity-50">
                                    <g transform="translate(100,100)">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <path key={i} d="M0 0 L-20 -150 L20 -150 Z" fill={rarity === 'LEGENDARY' ? '#facc15' : 'white'} opacity="0.1" transform={`rotate(${i * 30})`} />
                                        ))}
                                    </g>
                                </svg>
                            </div>

                            {/* Card Container */}
                            <div className={`w-72 h-80 rounded-[2rem] border-4 ${config.border} bg-stone-900/90 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(0,0,0,0.8)] ${config.shadow} relative overflow-hidden z-20`}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-20`}></div>

                                {/* Inner Sparkles */}
                                <div className="absolute inset-0 z-0 pointer-events-none">
                                    <Sparkles className="absolute top-6 right-6 text-white animate-[pulse_1s_infinite]" size={24} />
                                    <Sparkles className="absolute bottom-10 left-8 text-white animate-[pulse_1.5s_infinite] delay-75" size={18} />
                                    <Sparkles className="absolute top-1/2 left-4 text-white animate-[spin_3s_linear_infinite] opacity-50" size={12} />
                                </div>

                                {/* Actual Item Icon */}
                                <div className="w-48 h-48 relative z-10 flex items-center justify-center drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] animate-[float-gold_4s_ease-in-out_infinite]">
                                    <ItemIcon typeId={itemTypeId} name={localizedItemName} materialId={materialId} rarity={rarity} className="w-full h-full" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info & Button */}
                <div className={`absolute bottom-10 w-full transition-all duration-700 delay-300 transform ${stage === 'revealed' ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} z-30 px-6`}>
                    {!materialId && (
                        <div className="bg-black/60 border border-stone-600 p-4 rounded-2xl backdrop-blur-md mb-6 mx-auto max-w-sm shadow-2xl">
                            <p className="text-stone-400 text-xs uppercase tracking-widest mb-1 text-center">{t('lootbox.bonus_income')}</p>
                            <div className="flex items-center justify-center gap-2">
                                <p className={`text-4xl font-mono font-black ${config.color} drop-shadow-md`}>
                                    +{bonus.toFixed(2)}
                                </p>
                                <span className="text-sm text-stone-300 font-bold mt-2">{CURRENCY}{t('lootbox.per_day')}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black py-4 rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(234,179,8,0.6)] font-display text-xl uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        <Sparkles size={24} /> {t('lootbox.collect')} <Sparkles size={24} />
                    </button>
                </div>

            </div>

            <style>{`
        @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .perspective-1000 {
            perspective: 1000px;
        }
      `}</style>
        </div>
    );
};
