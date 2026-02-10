import React, { useState, useEffect } from 'react';
import {
    Bot, X, ArrowRight, ShoppingBag, CheckCircle2, ChevronLeft,
    Home, Coins, Wrench, Hammer, Map, Zap, RefreshCw, Skull,
    Hand, Trophy, BookOpen, Crown, Target, Users, HelpCircle,
    AlertTriangle, FileText, Search, Cpu, Factory
} from 'lucide-react';
import { useTranslation } from './LanguageContext';
import { VIP_TIERS, DUNGEON_CONFIG } from '../constants';

interface AIHelpBotProps {
    tutorialStep: number;
    onTutorialNext: () => void;
    onTutorialClose: () => void;
    language: 'th' | 'en';
    user: any;
}

type HelpCategory = 'overview' | 'mining' | 'equipment' | 'dungeon' | 'crafting' | 'economy' | 'systems';

export const AIHelpBot: React.FC<AIHelpBotProps> = ({
    tutorialStep,
    onTutorialNext,
    onTutorialClose,
    language,
    user
}) => {
    const { t, getLocalized, formatCurrency } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'TUTORIAL' | 'HELP_MENU' | 'HELP_CONTENT'>('TUTORIAL');
    const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);

    // Auto-open if tutorial is active
    useEffect(() => {
        if (tutorialStep > 0) {
            setIsOpen(true);
            setMode('TUTORIAL');
        }
    }, [tutorialStep]);

    const categories = [
        { id: 'overview', label: language === 'th' ? 'ภาพรวม (Overview)' : 'Overview', icon: <RefreshCw size={18} />, color: 'text-blue-400' },
        { id: 'mining', label: language === 'th' ? 'แท่นขุด & การดูแล' : 'Mining & Care', icon: <Home size={18} />, color: 'text-yellow-400' },
        { id: 'equipment', label: language === 'th' ? 'อุปกรณ์ & หุ่นยนต์' : 'Equipment & Bot', icon: <Hand size={18} />, color: 'text-emerald-400' },
        { id: 'dungeon', label: language === 'th' ? 'สำรวจเหมือง' : 'Exploration', icon: <Skull size={18} />, color: 'text-red-400' },
        { id: 'crafting', label: language === 'th' ? 'โรงงาน & สกัดแร่' : 'Workshop & Crafting', icon: <Hammer size={18} />, color: 'text-purple-400' },
        { id: 'economy', label: language === 'th' ? 'ตลาด & การเงิน' : 'Market & Economy', icon: <Coins size={18} />, color: 'text-amber-400' },
        { id: 'systems', label: language === 'th' ? 'VIP & ภารกิจ' : 'VIP & Missions', icon: <Crown size={18} />, color: 'text-pink-400' },
    ];

    const getTutorialContent = () => {
        switch (tutorialStep) {
            case 1:
                return {
                    title: language === 'th' ? "สวัสดีครับกัปตัน!" : "Hello Captain!",
                    desc: language === 'th'
                        ? "ผมคือหุ่นยนต์ผู้ช่วยของคุณ เริ่มต้นเส้นทางเศรษฐีด้วยการกดปุ่ม 'เปิดร้านค้า' เพื่อรับถุงมือขุดฟรีใบแรกกันเลยครับ!"
                        : "I am your AI assistant. Start your journey by clicking 'Open Shop' to get your first free digging glove!",
                    icon: <Bot className="text-yellow-400" size={32} />,
                    action: language === 'th' ? "ตกลง!" : "Got it!"
                };
            case 2:
                return {
                    title: language === 'th' ? "เลือกถุงมือฟรี" : "Pick Your Free Glove",
                    desc: language === 'th'
                        ? "เลื่อนลงไปที่การ์ดใบสุดท้าย คุณจะพบ 'ถุงมือเน่า' ราคา 0 บาท กดซื้อเพื่อเริ่มขุดได้ทันทีครับ!"
                        : "Scroll down to the last card. You'll find the 'Rotten Glove' for 0 Baht. Click buy to start mining!",
                    icon: <ShoppingBag className="text-emerald-400" size={32} />,
                    action: language === 'th' ? "เข้าใจแล้ว" : "Understood"
                };
            case 3:
                return {
                    title: language === 'th' ? "ยอดเยี่ยมมาก!" : "Great Job!",
                    desc: language === 'th'
                        ? "ตอนนี้คุณมีเครื่องมือพร้อมแล้ว! อย่าลืมกลับมาเก็บผลผลิตบ่อยๆ นะครับ ขอให้สนุกกับการขุดทองครับ!"
                        : "You're all set! Don't forget to collect your harvest regularly. Have fun gold rushing!",
                    icon: <CheckCircle2 className="text-yellow-500" size={32} />,
                    action: language === 'th' ? "สิ้นสุดการแนะนำ" : "End Tutorial"
                };
            default: return null;
        }
    };

    const toggleHelp = () => {
        if (tutorialStep > 0) return; // Can't toggle help during mandatory tutorial
        setIsOpen(!isOpen);
        setMode('HELP_MENU');
    };

    const renderCategoryContent = () => {
        if (!selectedCategory) return null;

        const content = {
            overview: (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { step: 1, title: language === 'th' ? "ขุดแร่ (Mine)" : "Mine", desc: language === 'th' ? "จัดการแท่นขุดเพื่อผลิตเงินและแร่" : "Manage rigs to produce gold and minerals." },
                            { step: 2, title: language === 'th' ? "ค้าขาย (Trade)" : "Trade", desc: language === 'th' ? "ขายวัสดุในตลาด หรือเก็บไว้สร้างของ" : "Sell materials or keep for crafting." },
                            { step: 3, title: language === 'th' ? "ติดตั้ง (Equip)" : "Equip", desc: language === 'th' ? "ติดตั้งอุปกรณ์เสริมเพื่อเพิ่มกำไร" : "Equip accessories to boost profit." },
                        ].map(s => (
                            <div key={s.step} className="bg-stone-800/50 p-3 rounded-xl border border-stone-700">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-5 h-5 bg-yellow-600 rounded-full flex items-center justify-center text-[10px] font-bold text-black">{s.step}</span>
                                    <span className="font-bold text-white text-sm">{s.title}</span>
                                </div>
                                <p className="text-[11px] text-stone-400 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ),
            mining: (
                <div className="space-y-4">
                    <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-500/30">
                        <h5 className="text-orange-300 font-bold text-xs mb-2 flex items-center gap-1"><Zap size={14} /> {language === 'th' ? 'สภาพเครื่อง (Condition)' : 'Rig Condition'}</h5>
                        <p className="text-[11px] text-stone-400 leading-relaxed">
                            {language === 'th'
                                ? 'หากสภาพแย่ (0%) เครื่องจะหยุดทำงาน! ค่าซ่อม 0.05฿ / 1% กดปุ่ม ⚡ ซ่อมบำรุง บน Rig Card เพื่อซ่อมครับ'
                                : 'If condition is 0%, the rig stops! Repair cost is 0.05฿ per 1%. Click ⚡ Repair on the Rig Card to fix it.'}
                        </p>
                    </div>
                    <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                        <h5 className="text-purple-300 font-bold text-xs mb-2 flex items-center gap-1"><GiftIcon size={14} /> {language === 'th' ? 'รายได้ & ของแถม' : 'Income & Gifts'}</h5>
                        <p className="text-[11px] text-stone-400 leading-relaxed">
                            {language === 'th'
                                ? 'ทุกๆ 20 ชม. เครื่องมีโอกาสขุดพบ "กุญแจ" หรือวัสดุมีค่า รายได้จะสะสมแผ่นดิสก์ให้คุณกดเก็บเกี่ยวได้ตลอด'
                                : 'Every 20 hours, rigs may find "Keys" or rare materials. Income accumulates as discs for you to harvest anytime.'}
                        </p>
                    </div>
                </div>
            ),
            equipment: (
                <div className="space-y-4">
                    <p className="text-[11px] text-stone-400 leading-relaxed px-1">
                        {language === 'th'
                            ? 'ใช้วัสดุและ Upgrade Chip เพื่ออัปเกรดหุ่นยนต์ ยิ่งเลเวลสูง ยิ่งช่วยขุดเก่ง!'
                            : 'Use materials and Upgrade Chips to enhance robots. Higher levels mean better stats!'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-stone-800 p-2 rounded-xl border border-stone-700 text-center">
                            <Bot size={20} className="mx-auto text-emerald-400 mb-1" />
                            <div className="text-[10px] text-white font-bold">Luck Chance</div>
                            <div className="text-[9px] text-stone-500">พบไอเทมหายาก</div>
                        </div>
                        <div className="bg-stone-800 p-2 rounded-xl border border-stone-700 text-center">
                            <Target size={20} className="mx-auto text-blue-400 mb-1" />
                            <div className="text-[10px] text-white font-bold">Drop Rate</div>
                            <div className="text-[9px] text-stone-500">แร่ระดับสูง</div>
                        </div>
                    </div>
                </div>
            ),
            dungeon: (
                <div className="space-y-4">
                    <div className="bg-red-950/20 p-3 rounded-xl border border-red-500/20">
                        <h5 className="text-red-400 font-bold text-xs mb-1 flex items-center gap-1"><AlertTriangle size={14} /> {language === 'th' ? 'ข้อควรระวัง' : 'Warning'}</h5>
                        <p className="text-[11px] text-stone-400 leading-relaxed">
                            {language === 'th'
                                ? 'ขณะสำรวจ การผลิตเงินจะหยุดลงชั่วคราว แต่จะได้รับแร่หายากเป็นการตอบแทนครับ'
                                : 'While exploring, gold production stops temporarily, but you will receive rare minerals instead.'}
                        </p>
                    </div>
                    <ul className="space-y-2">
                        {DUNGEON_CONFIG.slice(0, 3).map(d => (
                            <li key={d.id} className="text-[11px] flex justify-between items-center bg-stone-900 px-3 py-2 rounded-lg border border-stone-800">
                                <span className="text-stone-300 font-bold">{getLocalized(d.name)}</span>
                                <span className="text-yellow-500 font-mono">{d.durationHours}h</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ),
            crafting: (
                <div className="space-y-3">
                    <div className="bg-stone-800 p-3 rounded-xl border border-stone-700 flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-400"><RefreshCw size={24} /></div>
                        <div className="flex-1">
                            <h6 className="text-xs font-bold text-white mb-1">{language === 'th' ? 'การสกัดแร่' : 'Extraction'}</h6>
                            <p className="text-[10px] text-stone-500 leading-tight">รวมวัสดุระดับต่ำ 2 ชิ้น เป็นระดับสูง 1 ชิ้น</p>
                        </div>
                    </div>
                    <div className="bg-stone-800 p-3 rounded-xl border border-stone-700 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-400"><Hammer size={24} /></div>
                        <div className="flex-1">
                            <h6 className="text-xs font-bold text-white mb-1">{language === 'th' ? 'คราฟต์เครื่องจักร' : 'Rig Crafting'}</h6>
                            <p className="text-[10px] text-stone-500 leading-tight">ใช้แร่ผลิตเครื่องขุดระดับสูงโดยไม่เสียเงิน</p>
                        </div>
                    </div>
                </div>
            ),
            economy: (
                <div className="space-y-4">
                    <div className="bg-stone-800 p-3 rounded-xl border border-stone-700">
                        <h6 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1"><Coins size={14} /> {language === 'th' ? 'ตลาดและภาษี' : 'Market & Tax'}</h6>
                        <ul className="text-[11px] text-stone-400 space-y-1">
                            <li>• {language === 'th' ? 'ภาษีขายพื้นฐาน: 5%' : 'Sales Tax: 5%'}</li>
                            <li>• {language === 'th' ? 'สามารถลดภาษีได้ด้วยระดับ VIP' : 'Tax can be reduced with VIP rank'}</li>
                            <li>• {language === 'th' ? 'เงินบาทถอนออกได้ แอดมินอนุมัติ 24 ชม.' : 'Withdraw THB, 24h Admin Approval'}</li>
                        </ul>
                    </div>
                </div>
            ),
            systems: (
                <div className="space-y-4">
                    <div className="bg-pink-900/20 p-3 rounded-xl border border-pink-500/30">
                        <h6 className="text-xs font-bold text-pink-400 mb-2 flex items-center gap-1"><Crown size={14} /> VIP Privileges</h6>
                        <div className="text-[10px] text-stone-500">
                            {VIP_TIERS.slice(1, 4).map(v => (
                                <div key={v.level} className="flex justify-between border-b border-stone-800 py-1 last:border-0">
                                    <span className="text-yellow-500 font-bold">VIP {v.level}</span>
                                    <span className="text-stone-300">{getLocalized(v.perk).slice(0, 20)}...</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ),
        };

        return content[selectedCategory];
    };

    const tutorialContent = getTutorialContent();

    return (
        <div className="fixed bottom-24 right-6 z-[200] flex flex-col items-end pointer-events-none">
            {/* Main Robot Icon (Always Visible if not open) */}
            {!isOpen && (
                <div
                    className="relative pointer-events-auto cursor-pointer group"
                    onClick={toggleHelp}
                >
                    <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                    <div className="relative animate-bounce-slow">
                        <div className="w-16 h-16 bg-stone-800 border-2 border-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden hover:scale-110 active:scale-95 transition-all">
                            <div className="absolute inset-0 bg-stone-900/40"></div>
                            <Bot size={40} className="text-yellow-500 relative z-10 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3 z-20">
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_4px_#22d3ee]"></div>
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_4px_#22d3ee]"></div>
                            </div>
                        </div>
                        <div className="mt-2 w-12 h-1.5 bg-yellow-600/40 blur-sm rounded-full mx-auto animate-pulse"></div>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute top-0 right-20 bg-stone-900 border border-stone-700 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                        {language === 'th' ? 'ถามผู้ช่วย AI' : 'Ask AI Assistant'}
                    </div>
                </div>
            )}

            {/* Speech Bubble / Window */}
            {isOpen && (
                <div className="mb-4 w-72 bg-stone-950/95 border-2 border-yellow-600/50 rounded-2xl shadow-2xl backdrop-blur-xl pointer-events-auto animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[70vh]">

                    {/* Header */}
                    <div className="p-3 bg-stone-900 border-b border-stone-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot size={18} className="text-yellow-500" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-stone-400">AI Assistant</span>
                        </div>
                        <button
                            onClick={() => {
                                if (tutorialStep > 0) onTutorialClose();
                                else setIsOpen(false);
                            }}
                            className="p-1 hover:bg-stone-800 rounded-lg text-stone-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto custom-scrollbar flex-1 p-4">
                        {mode === 'TUTORIAL' && tutorialContent && (
                            <div className="animate-in fade-in duration-500">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-yellow-900/20 rounded-xl border border-yellow-500/30">
                                        {tutorialContent.icon}
                                    </div>
                                    <h4 className="font-bold text-yellow-500 text-sm uppercase tracking-wide">{tutorialContent.title}</h4>
                                </div>
                                <p className="text-[12px] text-stone-300 leading-relaxed mb-6">
                                    {tutorialContent.desc}
                                </p>
                                <button
                                    onClick={onTutorialNext}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-600 hover:bg-yellow-500 text-stone-950 text-xs font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-yellow-900/20"
                                >
                                    {tutorialContent.action} <ArrowRight size={14} />
                                </button>
                            </div>
                        )}

                        {mode === 'HELP_MENU' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-3 px-1">{language === 'th' ? 'เลือกหัวข้อที่สงสัยครับ' : 'Choose a category'}</p>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCategory(cat.id as HelpCategory);
                                            setMode('HELP_CONTENT');
                                        }}
                                        className="w-full p-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 rounded-xl flex items-center gap-3 transition-all group"
                                    >
                                        <div className={`${cat.color} group-hover:scale-110 transition-transform`}>{cat.icon}</div>
                                        <span className="text-xs font-bold text-stone-300 group-hover:text-white">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {mode === 'HELP_CONTENT' && selectedCategory && (
                            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                                <button
                                    onClick={() => setMode('HELP_MENU')}
                                    className="flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-300 mb-3 group"
                                >
                                    <ChevronLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" /> {language === 'th' ? 'กลับไปที่เมนู' : 'Back to Menu'}
                                </button>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={categories.find(c => c.id === selectedCategory)?.color}>
                                        {categories.find(c => c.id === selectedCategory)?.icon}
                                    </div>
                                    <h4 className="text-sm font-bold text-white">{categories.find(c => c.id === selectedCategory)?.label}</h4>
                                </div>
                                {renderCategoryContent()}
                            </div>
                        )}
                    </div>

                    {/* Info Bar */}
                    <div className="p-2.5 bg-stone-900/50 text-center border-t border-stone-800/40">
                        <span className="text-[9px] text-stone-600 flex items-center justify-center gap-1">
                            {language === 'th' ? 'มีคำถามอื่น? ถาม Admin ได้ตลอด 24 ชม.' : 'Other questions? Ask Admin 24h.'}
                        </span>
                    </div>
                </div>
            )}

            {isOpen && !tutorialStep && (
                <div
                    className="relative pointer-events-auto cursor-pointer group mt-2"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="w-12 h-12 bg-stone-900 border border-yellow-600/30 rounded-xl flex items-center justify-center shadow-lg animate-bounce-slow">
                        <Bot size={24} className="text-yellow-600/80" />
                    </div>
                </div>
            )}

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 4s ease-in-out infinite;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }
            `}</style>
        </div>
    );
};

const GiftIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
);
