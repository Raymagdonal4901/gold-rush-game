import React from 'react';
import {
    Briefcase, HardHat, Glasses, Shirt, Backpack, Footprints, Smartphone, Monitor,
    Bot, Cpu, Key, Factory, Search, FileText, Hourglass, Sparkles, Gem, Timer,
    Ticket, Zap, Wrench, Settings, Hammer, TrainFront, CreditCard, Shield, AlertTriangle, XCircle
} from 'lucide-react';
import { AccessoryItem } from '../services/types';
import { RARITY_SETTINGS } from '../constants';

interface AccessoryIconProps {
    item: AccessoryItem | null | any;
    size?: number;
    className?: string;
    showGlow?: boolean;
}

export const AccessoryIcon: React.FC<AccessoryIconProps> = ({ item, size = 24, className = '', showGlow = true }) => {
    if (!item) return <HardHat size={size} className={className} />;

    // --- TYPE DETECTION ---
    let typeId = item.typeId || item.id || '';
    const nameRaw = item.name;
    const enName = typeof nameRaw === 'object' ? (nameRaw as any)?.en || '' : String(nameRaw || '');
    const thName = typeof nameRaw === 'object' ? (nameRaw as any)?.th || '' : String(nameRaw || '');
    const nameStr = (enName + ' ' + thName).toLowerCase();

    // Map names to typeIds for robust detection — only if typeId is not already known
    if (!typeId) {
        if (nameStr.includes('chip') || nameStr.includes('ชิป')) typeId = 'upgrade_chip';
        else if (nameStr.includes('key') || nameStr.includes('กุญแจ')) typeId = 'chest_key';
        else if (nameStr.includes('mixer') || nameStr.includes('โต๊ะช่างสกัดแร่') || nameStr.includes('เครื่องผสม')) typeId = 'mixer';
        else if (nameStr.includes('magnifying') || nameStr.includes('แว่นขยาย')) typeId = 'magnifying_glass';
        else if (nameStr.includes('blueprint') || nameStr.includes('พิมพ์เขียว')) typeId = 'slot_blueprint';
        else if (nameStr.includes('insurance') || nameStr.includes('ใบประกัน')) typeId = 'insurance_card';
        else if (nameStr.includes('hourglass') || nameStr.includes('นาฬิกาทราย')) typeId = 'hourglass_small';
        else if (nameStr.includes('mystery ore') || nameStr.includes('แร่ปริศนา') || nameStr.includes('วัสดุปริศนา')) typeId = 'mystery_ore';
        else if (nameStr.includes('legendary ore') || nameStr.includes('แร่ในตำนาน') || nameStr.includes('วัสดุในตำนาน')) typeId = 'legendary_ore';
        else if (nameStr.includes('excavator') || nameStr.includes('รถขุด') || nameStr.includes('รถไฟฟ้า') || nameStr.includes('electric vehicle') || nameStr.includes('truck') || nameStr.includes('รถบรรทุก')) typeId = 'auto_excavator';
        else if (nameStr.includes('robot') || nameStr.includes('หุ่นยนต์')) typeId = 'ai_robot';
        else if (nameStr.includes('helmet') || nameStr.includes('หมวก')) typeId = 'hat';
        else if (nameStr.includes('glasses') || nameStr.includes('แว่น')) typeId = 'glasses';
        else if (nameStr.includes('bag') || nameStr.includes('backpack') || nameStr.includes('เป้')) typeId = 'bag';
        else if (nameStr.includes('phone') || nameStr.includes('mobile') || nameStr.includes('smartphone') || nameStr.includes('สมาทโฟน') || nameStr.includes('สมาร์ทโฟน')) typeId = 'mobile';
        else if (nameStr.includes('pc') || nameStr.includes('computer') || nameStr.includes('laptop') || nameStr.includes('notebook') || nameStr.includes('โน้ตบุ๊ก') || nameStr.includes('โน๊ตบุ๊ค')) typeId = 'pc';
        else if (nameStr.includes('boots') || nameStr.includes('รองเท้า')) typeId = 'boots';
        else if (nameStr.includes('repair kit') || nameStr.includes('ชุดซ่อม')) {
            if (nameStr.includes('basic') || nameStr.includes('พื้นฐาน')) typeId = 'repair_kit_1';
            else if (nameStr.includes('standard') || nameStr.includes('มาตรฐาน')) typeId = 'repair_kit_2';
            else if (nameStr.includes('electronic') || nameStr.includes('อิเล็กทรอนิกส์')) typeId = 'repair_kit_3';
            else if (nameStr.includes('mechanic') || nameStr.includes('เครื่องจักร')) typeId = 'repair_kit_4';
            else typeId = 'repair_kit_1';
        }
        else if (nameStr.includes('uniform') || nameStr.includes('suit') || nameStr.includes('shirt') || nameStr.includes('ชุด')) typeId = 'uniform';
    }

    // --- RARITY STYLING ---
    const rarity = item.rarity || 'COMMON';
    const rarityStyle = RARITY_SETTINGS[rarity] || RARITY_SETTINGS.COMMON;
    const props = { size, className: `relative z-10 ${className}` };

    // --- VIP CARD RENDERING ---
    if (typeId === 'vip_withdrawal_card') {
        return (
            <div className={`relative ${className.includes('w-') ? className : 'w-full h-full'} aspect-[1.58/1] bg-gradient-to-br from-yellow-100 via-yellow-500 to-yellow-800 rounded-[4px] border border-yellow-200/50 shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-[20%] left-0 w-full h-[15%] bg-stone-900/40"></div>
                <div className="absolute top-[45%] left-[10%] w-[15%] h-[20%] bg-gradient-to-br from-yellow-200 to-yellow-600 rounded-sm border border-yellow-100/30"></div>
                <div className="absolute bottom-[10%] right-[10%] text-[8px] font-black italic text-black/40 tracking-tighter">VIP</div>
                <CreditCard size={size * 0.6} className="text-yellow-950 opacity-60" />
            </div>
        );
    }

    // --- NEON/EQUIPMENT RENDERING ---
    const renderIcon = () => {
        const tid = typeId.toLowerCase();

        if (tid.startsWith('hat')) return <HardHat {...props} className={`${props.className} text-stone-300 ${showGlow ? 'drop-shadow-[0_0_8px_rgba(214,211,209,0.5)]' : ''}`} />;
        if (tid.startsWith('glasses')) return <Glasses {...props} className={`${props.className} text-blue-400 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(96,165,250,0.8)]' : ''}`} />;
        if (tid.startsWith('uniform') || tid.startsWith('shirt')) return <Shirt {...props} className={`${props.className} text-orange-400 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(251,146,60,0.8)]' : ''}`} />;
        if (tid.startsWith('bag') || tid.startsWith('backpack')) return <Backpack {...props} className={`${props.className} text-purple-400 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]' : ''}`} />;
        if (tid.startsWith('boots')) return <Footprints {...props} className={`${props.className} text-yellow-400 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]' : ''}`} />;
        if (tid.startsWith('mobile') || tid.startsWith('phone')) return <Smartphone {...props} className={`${props.className} text-cyan-400 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]' : ''}`} />;
        if (tid.startsWith('pc') || tid.startsWith('computer')) return <Monitor {...props} className={`${props.className} text-rose-400 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(251,113,133,0.8)]' : ''}`} />;
        if (tid.startsWith('auto_excavator') || tid.startsWith('truck')) return <TrainFront {...props} className={`${props.className} text-amber-500 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]' : ''}`} />;

        if (tid.startsWith('slot_blueprint')) return <FileText {...props} className={`${props.className} text-blue-400 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(96,165,250,0.8)]' : ''}`} />;
        if (tid.startsWith('upgrade_chip') || tid.startsWith('chip')) return <Cpu {...props} className={`${props.className} text-blue-500 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]' : ''}`} />;
        if (tid.startsWith('chest_key') || tid.startsWith('key')) return <Key {...props} className={`${props.className} text-yellow-400 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]' : ''}`} />;
        if (tid.startsWith('mixer')) return <Factory {...props} className={`${props.className} text-pink-500 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(236,72,153,0.8)]' : ''}`} />;
        if (tid.startsWith('magnifying_glass') || tid.startsWith('search')) return <Search {...props} className={`${props.className} text-cyan-300 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(103,232,249,0.8)]' : ''}`} />;
        if (tid.startsWith('insurance_card') || tid.includes('insurance')) return <FileText {...props} className={`${props.className} text-emerald-300 ${showGlow ? 'drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]' : ''}`} />;
        if (tid.startsWith('hourglass')) return <Hourglass {...props} className={`${props.className} text-yellow-300 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(253,224,71,0.8)]' : ''}`} />;
        if (tid.startsWith('mystery_ore')) return <Sparkles {...props} className={`${props.className} text-purple-300 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(216,180,254,0.8)] animate-pulse' : ''}`} />;
        if (tid.startsWith('legendary_ore')) return <Gem {...props} className={`${props.className} text-red-400 ${showGlow ? 'drop-shadow-[0_0_12px_rgba(248,113,113,0.8)] animate-pulse' : ''}`} />;

        if (tid.startsWith('time_skip_ticket')) {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-lg scale-125 blur-md animate-pulse"></div>
                    <div className="absolute -top-3 -right-3">
                        <Timer size={size * 0.4} className="text-blue-300 animate-[spin_3s_linear_infinite]" />
                    </div>
                    <Ticket {...props} className={`${props.className} text-blue-400 -rotate-12 relative z-10`} />
                </div>
            );
        }

        if (tid.startsWith('construction_nanobot')) {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-cyan-500/30 rounded-full scale-[1.5] blur-xl animate-pulse"></div>
                    <Bot {...props} className={`${props.className} text-cyan-300 relative z-10`} />
                </div>
            );
        }

        if (tid.startsWith('ai_robot') || tid.includes('robot')) {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full scale-125 blur-md animate-pulse"></div>
                    <Bot {...props} className={`${props.className} text-purple-400 relative z-10`} />
                </div>
            );
        }

        if (tid.includes('repair_kit')) {
            let glowColor = 'bg-emerald-500';
            let IconComp: any = Wrench;
            if (tid.includes('_1')) { glowColor = 'bg-emerald-500'; IconComp = Hammer; }
            else if (tid.includes('_2')) { glowColor = 'bg-purple-500'; IconComp = Briefcase; }
            else if (tid.includes('_3')) { glowColor = 'bg-yellow-500'; IconComp = Cpu; }
            else if (tid.includes('_4')) { glowColor = 'bg-red-600'; IconComp = Settings; }

            return (
                <div className="relative flex items-center justify-center">
                    <div className={`absolute inset-0 ${glowColor} rounded-full scale-125 blur-md opacity-20 animate-pulse`}></div>
                    <IconComp {...props} className={`${props.className} relative z-10`} />
                </div>
            );
        }

        // Default fallback handling
        return <HardHat {...props} className={`${props.className} text-stone-500`} />;
    };

    return (
        <div className="flex items-center justify-center relative">
            {renderIcon()}
            {rarity !== 'COMMON' && showGlow && (
                <div className={`absolute inset-0 blur-xl opacity-20 bg-current transition-opacity animate-pulse`} />
            )}
        </div>
    );
};
