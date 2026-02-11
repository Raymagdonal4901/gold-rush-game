import React, { useState, useEffect } from 'react';
import { Bot, X, ArrowRight, MessageCircle, ChevronRight, Zap, Map, Hammer, BarChart2, ShoppingBag } from 'lucide-react';
import { useTranslation } from './LanguageContext';

interface AIHelpBotProps {
    tutorialStep: number;
    onTutorialNext: () => void;
    onTutorialClose: () => void;
    language: 'th' | 'en';
    user: any;
    onOpenShop?: () => void;
    onOpenWarehouse?: () => void;
    onOpenMarket?: () => void;
    onOpenDungeon?: () => void;
}

type GuideTopic = {
    id: string;
    question: { th: string; en: string };
    answer: { th: string; en: string };
    action: { type: 'FOCUS' | 'SHOW_IMAGE'; target: string };
    icon: React.ReactNode;
};

const GUIDE_TOPICS: GuideTopic[] = [
    {
        id: 'buy_rigs',
        question: { th: 'ซื้อเครื่องขุดยังไง / เริ่มตรงไหน', en: 'How to buy rigs / Start where?' },
        answer: { th: 'อยากรวยต้องลงทุน! 🏗️ ไปที่ ร้านค้า (Shop) แล้วเลือกเครื่องขุดเครื่องแรกของคุณเลย', en: 'To get rich, you must invest! 🏗️ Go to Shop and pick your first rig!' },
        action: { type: 'FOCUS', target: 'guide-shop-btn' },
        icon: <ShoppingBag size={16} className="text-yellow-400" />
    },
    {
        id: 'maintenance',
        question: { th: 'เครื่องเสีย / ทำไมเงินไม่เดิน', en: 'Rig broken / Why no money?' },
        answer: { th: 'เครื่องจักรก็เหนื่อยเป็น! 🔧 ถ้าหลอดสุขภาพลดเหลือ 0% เงินจะหยุดเดินทันที รีบกด ซ่อมบำรุง ด่วน!', en: 'Machines get tired too! 🔧 If health hits 0%, income stops. Fix it ASAP!' },
        action: { type: 'FOCUS', target: '.guide-repair-btn' }, // Targets class
        icon: <Zap size={16} className="text-red-400" />
    },
    {
        id: 'crafting',
        question: { th: 'ได้แร่มาทำอะไร / อยากได้บัฟ', en: 'Got ore, now what / Want buffs?' },
        answer: { th: 'แร่ดิบมีค่ามากกว่าที่คิด! 💎 นำมาประกอบที่ โกดัง (Warehouse) เพื่อสร้างไอเทมเทพๆ กันเถอะ', en: 'Raw ore is precious! 💎 Craft god-tier items at the Warehouse!' },
        action: { type: 'FOCUS', target: 'guide-warehouse-btn' },
        icon: <Hammer size={16} className="text-blue-400" />
    },
    {
        id: 'exploration',
        question: { th: 'หาของฟรี / ลุ้นโชค', en: 'Free items / Lucky draw?' },
        answer: { th: 'ชอบวัดดวงไหม? 🎲 กดส่งเครื่องขุดออกไป สำรวจ (Secret Mine) ยิ่งรอนาน ยิ่งมีสิทธิ์ลุ้น Jackpot แตก!', en: 'Feeling lucky? 🎲 Send rigs to Secret Mine. Longer waits = Bigger Jackpots!' },
        action: { type: 'FOCUS', target: 'guide-dungeon-btn' },
        icon: <Map size={16} className="text-purple-400" />
    },
    {
        id: 'market',
        question: { th: 'ขายของที่ไหน / ดูกราฟยังไง', en: 'Where to sell / How to see graph?' },
        answer: { th: 'ซื้อถูก-ขายแพง คือคติพจน์ของเรา! 📉 จับตาดู กราฟ (Market) ให้ดี สีเขียวเมื่อไหร่เทขายให้หมดหน้าตัก!', en: 'Buy low, sell high! 📉 Watch the Market graph. Green means SELL ALL!' },
        action: { type: 'FOCUS', target: 'guide-market-btn' },
        icon: <BarChart2 size={16} className="text-emerald-400" />
    }
];

export const AIHelpBot: React.FC<AIHelpBotProps> = ({
    tutorialStep,
    onTutorialNext,
    onTutorialClose,
    language,
    user,
    onOpenShop,
    onOpenWarehouse,
    onOpenMarket,
    onOpenDungeon
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<{ type: 'USER' | 'BOT'; text: string; image?: string }[]>([
        { type: 'BOT', text: language === 'th' ? 'สวัสดี! ผมคือ "Gold Rush Guide" มีอะไรให้ช่วยไหม? 👋' : 'Hello! I am "Gold Rush Guide". Need help? 👋' }
    ]);
    const [isBotHidden, setIsBotHidden] = useState(() => localStorage.getItem('ai_bot_hidden') === 'true');
    const [highlightEl, setHighlightEl] = useState<Element | null>(null);

    const toggleHide = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newState = !isBotHidden;
        setIsBotHidden(newState);
        localStorage.setItem('ai_bot_hidden', String(newState));
    };

    // Auto-open if tutorial is active
    useEffect(() => {
        if (tutorialStep > 0) {
            setIsOpen(true);
            setIsBotHidden(false);
        }
    }, [tutorialStep]);

    const handleTopicClick = (topic: GuideTopic) => {
        // Add User Question
        const questionText = language === 'th' ? topic.question.th : topic.question.en;
        const answerText = language === 'th' ? topic.answer.th : topic.answer.en;

        setHistory(prev => [
            ...prev,
            { type: 'USER', text: questionText },
            { type: 'BOT', text: answerText, image: topic.action.type === 'SHOW_IMAGE' ? topic.action.target : undefined }
        ]);

        // Execute Action
        if (topic.action.type === 'FOCUS') {
            const el = document.getElementById(topic.action.target) || document.querySelector(topic.action.target);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('ring-4', 'ring-yellow-500', 'ring-offset-2', 'ring-offset-black', 'animate-pulse');
                setHighlightEl(el);

                // --- NEW: Trigger Modal Opening based on target ---
                if (topic.action.target === 'guide-shop-btn' && onOpenShop) onOpenShop();
                if (topic.action.target === 'guide-warehouse-btn' && onOpenWarehouse) onOpenWarehouse();
                if (topic.action.target === 'guide-market-btn' && onOpenMarket) onOpenMarket();
                if (topic.action.target === 'guide-dungeon-btn' && onOpenDungeon) onOpenDungeon();
                // --------------------------------------------------

                // Remove highlight after 3 seconds
                setTimeout(() => {
                    el.classList.remove('ring-4', 'ring-yellow-500', 'ring-offset-2', 'ring-offset-black', 'animate-pulse');
                    setHighlightEl(null);
                }, 3000);
            }
        }

        // Auto scroll to bottom
        setTimeout(() => {
            const chatContainer = document.getElementById('guide-chat-container');
            if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
    };

    if (isBotHidden && tutorialStep === 0) {
        return (
            <button
                onClick={toggleHide}
                className="fixed bottom-24 lg:bottom-4 right-0 z-[190] bg-yellow-600 hover:bg-yellow-500 text-stone-900 font-bold p-2 pl-3 rounded-l-full shadow-lg border border-yellow-400 transition-all hover:translate-x-0 translate-x-1 pointer-events-auto group"
                title="Gold Rush Guide"
            >
                <Bot size={20} className="group-hover:scale-110 transition-transform" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-24 lg:bottom-4 right-6 z-[200] flex flex-col items-end pointer-events-none">
            {/* Main Robot Icon */}
            {!isOpen && (
                <div
                    className="relative pointer-events-auto cursor-pointer group"
                    onClick={() => setIsOpen(true)}
                >
                    <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full scale-150 animate-pulse"></div>
                    <div className="relative animate-bounce-slow">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)] overflow-hidden hover:scale-110 active:scale-95 transition-all border-2 border-white/20">
                            <Bot size={40} className="text-stone-900 relative z-10" />
                        </div>
                        <button
                            onClick={toggleHide}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-stone-900 border border-stone-700 rounded-full flex items-center justify-center text-stone-500 hover:text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100 shadow-lg z-30 pointer-events-auto"
                        >
                            <X size={12} />
                        </button>
                    </div>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-stone-950/95 border-2 border-yellow-500 rounded-2xl shadow-2xl backdrop-blur-xl pointer-events-auto animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[60vh] sm:max-h-[70vh]">
                    {/* Header */}
                    <div className="p-3 bg-gradient-to-r from-yellow-600 to-yellow-700 flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2 text-stone-900">
                            <Bot size={20} className="fill-stone-900" />
                            <span className="text-sm font-black uppercase tracking-tight">Gold Rush Guide</span>
                        </div>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                if (tutorialStep > 0 && onTutorialClose) onTutorialClose();
                            }}
                            className="p-1 hover:bg-black/20 rounded text-stone-900 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div id="guide-chat-container" className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-stone-900/50">
                        {history.map((msg, idx) => (
                            <div key={idx} className={`flex items-start gap-2 ${msg.type === 'USER' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'BOT' ? 'bg-yellow-600 text-stone-900' : 'bg-stone-700 text-stone-300'}`}>
                                    {msg.type === 'BOT' ? <Bot size={16} /> : <div className="text-[10px] font-bold">YOU</div>}
                                </div>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${msg.type === 'BOT'
                                    ? 'bg-stone-800 text-stone-200 rounded-tl-none border border-stone-700'
                                    : 'bg-yellow-600/20 text-yellow-100 rounded-tr-none border border-yellow-600/30'
                                    }`}>
                                    {msg.text}
                                    {msg.image && (
                                        <div className="mt-2 rounded-lg overflow-hidden border border-stone-600 bg-black">
                                            {/* Placeholder for image if we had one, for now text description is mostly enough unless we use generic assets */}
                                            <div className="p-4 text-center text-stone-500 italic text-[10px]">[Displaying: {msg.image}]</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions (Input Area) */}
                    <div className="p-3 bg-stone-900 border-t border-stone-800 relative">
                        <div className="flex items-center gap-2 mb-2">
                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">{language === 'th' ? 'เลือกหัวข้อที่สงสัย:' : 'Quick Questions:'}</p>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {GUIDE_TOPICS.map(topic => (
                                <button
                                    key={topic.id}
                                    onClick={() => handleTopicClick(topic)}
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-yellow-600/20 hover:border-yellow-500 border border-stone-700 transition-all active:scale-95 group"
                                >
                                    <div className="group-hover:scale-110 transition-transform">{topic.icon}</div>
                                    <span className="text-[10px] font-bold text-stone-300 group-hover:text-yellow-400 whitespace-nowrap">
                                        {language === 'th' ? topic.question.th.split('/')[0] : topic.question.en.split('/')[0]}
                                    </span>
                                </button>
                            ))}
                        </div>
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
            `}</style>
        </div>
    );
};
