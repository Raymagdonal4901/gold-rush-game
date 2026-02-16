import React, { useState } from 'react';
import {
    X, BookOpen, Pickaxe, TrendingUp, Hammer, Map, Crown, Bot,
    Shield, ChevronRight, Zap, Battery, Wrench, Coins, Factory,
    Gamepad2, Gift, Users, Truck, AlertTriangle, Gem, Search
} from 'lucide-react';

interface UserGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabId = 'start' | 'mining' | 'economy' | 'workshop' | 'adventure' | 'vip' | 'support';

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<TabId>('start');

    if (!isOpen) return null;

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: 'start', label: 'เริ่มต้นใช้งาน', icon: <BookOpen size={18} /> },
        { id: 'mining', label: 'ระบบขุดเหมือง', icon: <Pickaxe size={18} /> },
        { id: 'economy', label: 'เศรษฐกิจ & ตลาด', icon: <TrendingUp size={18} /> },
        { id: 'workshop', label: 'โรงงาน & การคราฟต์', icon: <Hammer size={18} /> },
        { id: 'adventure', label: 'ผจญภัย & มินิเกม', icon: <Gamepad2 size={18} /> },
        { id: 'vip', label: 'VIP & สังคม', icon: <Crown size={18} /> },
        { id: 'support', label: 'AI & ช่วยเหลือ', icon: <Bot size={18} /> },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-stone-950 border border-yellow-900/40 rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200 relative">

                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 bg-stone-900 border-r border-white/5 flex flex-col h-full shrink-0">
                    <div className="p-6 border-b border-white/5 flex items-center gap-3 shrink-0">
                        <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg leading-tight">คู่มือการเล่น</h2>
                            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Gold Rush Wiki</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold shadow-lg shadow-yellow-500/20 translate-x-1'
                                    : 'text-stone-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                    }`}
                            >
                                <div className={`relative z-10 p-1 rounded-md ${activeTab === tab.id ? 'bg-black/10' : 'bg-transparent'}`}>
                                    {tab.icon}
                                </div>
                                <span className="text-sm relative z-10">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/5 bg-stone-900/50 shrink-0">
                        <button
                            onClick={onClose}
                            className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <X size={16} /> ปิดคู่มือ
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-950/[0.95] relative">
                    {/* Header */}
                    <div className="p-4 md:px-8 border-b border-white/5 flex justify-between items-center bg-stone-900/80 backdrop-blur-xl absolute top-0 left-0 right-0 z-10 shadow-lg">
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-500 border border-yellow-500/20">
                                {tabs.find(t => t.id === activeTab)?.icon}
                            </div>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-stone-400">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </span>
                        </h3>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10 pt-24 custom-scrollbar">
                        <div className="max-w-4xl mx-auto pb-20 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                            {activeTab === 'start' && <GettingStartedContent />}
                            {activeTab === 'mining' && <MiningSystemContent />}
                            {activeTab === 'economy' && <EconomyContent />}
                            {activeTab === 'workshop' && <WorkshopContent />}
                            {activeTab === 'adventure' && <AdventureContent />}
                            {activeTab === 'vip' && <VipContent />}
                            {activeTab === 'support' && <SupportContent />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// CONTENT COMPONENTS
// ==========================================

const GettingStartedContent = () => (
    <div className="space-y-8">
        <div className="bg-gradient-to-br from-yellow-500/10 to-transparent p-6 rounded-2xl border border-yellow-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                <Pickaxe size={120} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 relative z-10">ยินดีต้อนรับนักขุดหน้าใหม่!</h2>
            <p className="text-stone-300 leading-relaxed max-w-2xl relative z-10">
                Gold Rush คือเกมจำลองสถานการณ์ที่คุณจะได้สร้างอาณาจักรเหมืองแร่ เป้าหมายของคุณเรียบง่ายมาก: ขุดหาทรัพยากร, แปรรูปเป็นวัสดุล้ำค่า, และก้าวสู่การเป็นมหาเศรษฐีที่ร่ำรวยที่สุดในโลก
            </p>
        </div>

        <Section title="วงจรการเล่นพื้นฐาน (The Core Loop)" icon={<Zap size={20} />}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <StepCard step="1" title="ซื้อเครื่องขุด" desc="เลือกซื้อเครื่องจักรขุดแร่จากร้านค้า" icon={<Pickaxe />} />
                <StepCard step="2" title="ขุดแร่" desc="รอเวลาให้เครื่องทำงานและเก็บผลผลิต" icon={<TrendingUp />} />
                <StepCard step="3" title="แปรรูป" desc="นำแร่ดิบเข้าโรงงานเพื่อเพิ่มมูลค่า" icon={<Factory />} />
                <StepCard step="4" title="ทำกำไร" desc="ขายในตลาดกลางหรือลงทุนต่อ" icon={<Coins />} />
            </div>
        </Section>

        <Section title="ภาพรวมหน้าจอใช้งาน" icon={<Map size={20} />}>
            <ul className="space-y-3 bg-stone-900/50 p-4 rounded-xl border border-white/5 text-sm text-stone-400">
                <li className="flex items-start gap-3">
                    <span className="bg-stone-800 p-1 rounded text-white font-bold text-xs shrink-0 mt-0.5">DASHBOARD</span>
                    <span>ศูนย์บัญชาการหลัก ดูสถานะเครื่องขุดทั้งหมด กำลังขุดรวม และกดรับรายได้ที่นี่</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="bg-stone-800 p-1 rounded text-white font-bold text-xs shrink-0 mt-0.5">WAREHOUSE</span>
                    <span>โกดังเก็บของ จัดการทรัพยากรที่ขุดได้ อุปกรณ์สวมใส่ และไอเทมต่างๆ</span>
                </li>
                <li className="flex items-start gap-3">
                    <span className="bg-stone-800 p-1 rounded text-white font-bold text-xs shrink-0 mt-0.5">MARKET</span>
                    <span>ตลาดกลาแลกเปลี่ยนสินค้า ซื้อถูก-ขายแพง ราคาจะขึ้นลงตามความต้องการของผู้เล่นจริง</span>
                </li>
            </ul>
        </Section>
    </div>
);

const MiningSystemContent = () => (
    <div className="space-y-8">
        <Section title="เครื่องจักรขุดเหมือง (Mining Rigs)" icon={<Pickaxe size={20} />}>
            <p className="text-stone-400 mb-6 leading-relaxed">
                เครื่องขุดคือหัวใจสำคัญในการสร้างรายได้ แต่ละเครื่องจะมีระดับ (Tier 1-9) ซึ่งกำหนดอัตราการผลิตและชนิดของแร่ที่จะได้
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoBox title="ระบบระดับ (Tier)" color="blue">
                    ระดับยิ่งสูง ยิ่งขุดได้แร่หายาก เช่น Tier 1 จะได้แค่ดิน/ถ่านหิน แต่ Tier 8 สามารถขุดยูเรเนียม/ไวเบรเนียมได้
                </InfoBox>
                <InfoBox title="ความทนทาน (HP)" color="red">
                    เครื่องจักรมีการสึกหรอตามกาลเวลา หาก HP เหลือ 0 เครื่องจะหยุดทำงาน คุณต้องซ่อมแซมโดยใช้วัตถุดิบหรือชุดซ่อม
                </InfoBox>
            </div>
        </Section>

        <Section title="พลังงาน & เชื้อเพลิง (Energy)" icon={<Battery size={20} />}>
            <div className="flex flex-col md:flex-row gap-6 items-center bg-stone-900/50 p-6 rounded-2xl border border-stone-800">
                <div className="flex-1">
                    <h4 className="text-white font-bold mb-2">การใช้พลังงาน</h4>
                    <p className="text-stone-400 text-sm mb-4">
                        เครื่องขุดทุกเครื่องต้องใช้พลังงานในการทำงาน คุณต้องคอยเติมพลังงานเพื่อให้ประสิทธิภาพคงอยู่ที่ 100%
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-stone-300">
                            <Zap size={14} className="text-yellow-500" />
                            <span>โหมดปกติ: ประสิทธิภาพ 100%</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-stone-300">
                            <Zap size={14} className="text-purple-500" />
                            <span className="text-purple-400 font-bold">โหมด Overclock: ประสิทธิภาพ 150% (ใช้ไฟ 2 เท่า)</span>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/3 bg-black/40 p-4 rounded-xl border border-stone-800 flex flex-col items-center">
                    <div className="text-xs text-stone-500 uppercase font-bold mb-2">สถานะพลังงาน</div>
                    <div className="w-full h-4 bg-stone-800 rounded-full overflow-hidden mb-2 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 w-[80%]"></div>
                    </div>
                    <div className="flex justify-between w-full text-xs font-mono text-stone-400">
                        <span>80% Charged</span>
                        <span>-4.2%/ชม.</span>
                    </div>
                </div>
            </div>
        </Section>

        <Section title="การซ่อมบำรุง (Maintenance)" icon={<Wrench size={20} />}>
            <p className="text-stone-400 text-sm mb-4">
                ค่าซ่อมแซมจะขึ้นอยู่กับระดับของเครื่องขุด ยิ่งเครื่องระดับสูง ยิ่งต้องใช้วัตถุดิบหายากในการซ่อม
            </p>
            <div className="bg-stone-900/80 border border-stone-800 p-4 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
                    <AlertTriangle className="text-red-500" />
                </div>
                <div>
                    <div className="text-white font-bold text-sm">เครื่องเสีย (Broken)</div>
                    <div className="text-stone-500 text-xs">หากเครื่องเสีย รายได้จะหยุดทันทีจนกว่าจะได้รับการซ่อมแซม</div>
                </div>
            </div>
        </Section>

        <Section title="การอัพเกรดดาว (Ascension)" icon={<Gem size={20} />}>
            <div className="bg-gradient-to-r from-purple-900/20 to-stone-900/50 p-5 rounded-2xl border border-purple-500/20">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <Zap className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-1">ปลดล็อกดาวสีม่วง (Prestige Star)</h4>
                        <p className="text-stone-400 text-xs leading-relaxed">
                            เมื่อนำเครื่องขุด 2 เครื่องมารวมร่างกัน (Merge) นอกจากจะได้เครื่องใหม่ที่สเปคแรงขึ้นแล้ว
                            ยังจะได้รับดาวสีม่วงใน <span className="text-purple-400 font-bold">ช่องที่ 5</span> ซึ่งเป็นสัญลักษณ์ของเครื่องระดับสูง
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/30 p-3 rounded-lg border border-stone-800 flex flex-col items-center justify-center gap-2">
                        <div className="text-[10px] text-stone-500 uppercase font-bold">Before Merge</div>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>)}
                            <div className="w-1.5 h-1.5 bg-stone-700 rounded-full"></div>
                        </div>
                    </div>
                    <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/30 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-purple-500/5 animate-pulse"></div>
                        <div className="text-[10px] text-purple-300 uppercase font-bold relative z-10">After Merge</div>
                        <div className="flex gap-0.5 relative z-10">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>)}
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.8)]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    </div>
);

const EconomyContent = () => (
    <div className="space-y-8">
        <div className="flex items-center gap-6 bg-gradient-to-r from-green-900/20 to-stone-900/50 p-6 rounded-2xl border border-green-500/20">
            <div className="p-4 bg-green-500/10 rounded-full border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <TrendingUp size={32} className="text-green-500" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">ระบบเศรษฐกิจโดยผู้เล่น</h2>
                <p className="text-green-400/80 text-sm uppercase tracking-wider font-bold">Demand & Supply คือกฎเพียงหนึ่งเดียว</p>
            </div>
        </div>

        <Section title="ตลาดกลาง (Marketplace)" icon={<Coins size={20} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <p className="text-stone-300 leading-relaxed text-sm">
                        ราคาสินค้าในเกมไม่ได้ถูกกำหนดตายตัว แต่จะผันผวนตามการซื้อขายจริงของผู้เล่นทุกคนในเซิร์ฟเวอร์
                    </p>
                    <ul className="space-y-2 text-sm text-stone-400">
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> คนซื้อเยอะ → ราคาขึ้น 📈</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> คนแห่ขาย → ราคาลง 📉</li>
                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-stone-500 rounded-full" /> ภาษีการขาย 15% (เพื่อลดเงินเฟ้อในระบบ)</li>
                    </ul>
                </div>
                <div className="bg-stone-900 p-4 rounded-xl border border-white/5">
                    {/* Fake Chart Visualization */}
                    <div className="flex justify-between items-end h-24 gap-1 pb-2 border-b border-white/10">
                        {[40, 60, 45, 70, 85, 60, 90, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-green-500/20 hover:bg-green-500/40 transition-colors rounded-t-sm relative group" style={{ height: `${h}%` }}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {h}.00 ฿
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center text-[10px] text-stone-500 mt-2 uppercase">ตัวอย่างกราฟราคา Real-time</div>
                </div>
            </div>
        </Section>

        <Section title="ระบบเงินตรา (Currency)" icon={<Coins size={20} />}>
            <div className="bg-stone-900/50 p-5 rounded-xl border border-stone-800 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black text-xl">฿</div>
                    <div>
                        <div className="text-white font-bold">THB Token</div>
                        <div className="text-xs text-stone-500">สกุลเงินหลักในเกม 1 Token = 1 บาท (Pegged)</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="text-center">
                        <div className="text-xs text-stone-500 mb-1">ฝากเงิน (Deposit)</div>
                        <div className="text-green-400 font-bold text-sm">สแกน QR / Crypto</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-stone-500 mb-1">ถอนเงิน (Withdraw)</div>
                        <div className="text-red-400 font-bold text-sm">โอนเข้าธนาคารทันที</div>
                    </div>
                </div>
            </div>
        </Section>
    </div>
);

const WorkshopContent = () => (
    <div className="space-y-8">
        <Section title="การแปรรูปวัตถุดิบ (Refining)" icon={<Factory size={20} />}>
            <p className="text-stone-400 mb-6 text-sm">
                อย่าขายแร่ดิบทิ้ง! นำพวกมันเข้าโรงงานเพื่อแปรรูปเป็นวัสดุที่มูลค่าสูงกว่า หรือใช้เป็นส่วนประกอบในการคราฟต์
            </p>

            <div className="flex flex-col md:flex-row items-center gap-4 bg-stone-900/50 p-6 rounded-xl border border-stone-800">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-stone-800 rounded-lg flex items-center justify-center border border-stone-700">
                        <span className="text-2xl">🪨</span>
                    </div>
                    <span className="text-xs text-stone-500">เศษหิน x5</span>
                </div>
                <div className="text-stone-600">
                    <ChevronRight />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-stone-800 rounded-lg flex items-center justify-center border border-stone-700 animate-pulse">
                        <span className="text-2xl">🔥</span>
                    </div>
                    <span className="text-xs text-yellow-500 font-bold">กำลังหลอม</span>
                </div>
                <div className="text-stone-600">
                    <ChevronRight />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-stone-800 rounded-lg flex items-center justify-center border border-stone-700 shadow-lg shadow-black">
                        <span className="text-2xl">⚫</span>
                    </div>
                    <span className="text-xs text-stone-300 font-bold">ถ่านหิน x1</span>
                </div>
            </div>
        </Section>

        <Section title="การคราฟต์อุปกรณ์ (Equipment Crafting)" icon={<Hammer size={20} />}>
            <p className="text-stone-400 text-sm mb-4">
                สร้างอุปกรณ์สวมใส่เพื่อเพิ่มประสิทธิภาพการขุดให้สูงขึ้น
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { name: 'หมวกนิรภัย', buff: 'ลดค่าซ่อม 5%', icon: '⛑️' },
                    { name: 'ชุดปฏิบัติงาน', buff: 'เพิ่มอายุสัญญา +5 วัน', icon: '🦺' },
                    { name: 'กระเป๋าเก็บของ', buff: 'ราคาขาย +2%', icon: '🎒' },
                    { name: 'แว่นตาอัจฉริยะ', buff: 'โบนัสโชคดี +5%', icon: '👓' }
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-stone-900/50 p-3 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                        <div className="text-2xl">{item.icon}</div>
                        <div>
                            <div className="text-white font-bold text-sm">{item.name}</div>
                            <div className="text-xs text-green-400">{item.buff}</div>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    </div>
);

const AdventureContent = () => (
    <div className="space-y-8">
        <Section title="การสำรวจและดันเจี้ยน (Dungeons)" icon={<Map size={20} />}>
            <p className="text-stone-400 mb-6 text-sm">
                ส่งทีมสำรวจไปยังพื้นที่อันตรายเพื่อค้นหาขุมทรัพย์ พิมพ์เขียว และแร่ในตำนาน
            </p>

            <div className="space-y-3">
                <div className="bg-stone-900/50 p-4 rounded-xl border border-green-500/20 flex justify-between items-center">
                    <div>
                        <div className="text-green-400 font-bold text-sm">สำรวจระยะสั้น (2 ชม.)</div>
                        <div className="text-xs text-stone-500">ความเสี่ยงต่ำ • ได้วัตถุดิบพื้นฐาน</div>
                    </div>
                    <div className="text-xs font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded">ปลอดภัย</div>
                </div>
                <div className="bg-stone-900/50 p-4 rounded-xl border border-yellow-500/20 flex justify-between items-center">
                    <div>
                        <div className="text-yellow-400 font-bold text-sm">เหมืองลึก (6 ชม.)</div>
                        <div className="text-xs text-stone-500">ความเสี่ยงปานกลาง • ลุ้นทองคำ/เหล็ก</div>
                    </div>
                    <div className="text-xs font-bold bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">ทั่วไป</div>
                </div>
                <div className="bg-stone-900/50 p-4 rounded-xl border border-red-500/20 flex justify-between items-center">
                    <div>
                        <div className="text-red-400 font-bold text-sm">พื้นที่ต้องห้าม (12 ชม.)</div>
                        <div className="text-xs text-stone-500">ความเสี่ยงสูง • ลุ้นไอเทมระดับตำนาน</div>
                    </div>
                    <div className="text-xs font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded">อันตราย</div>
                </div>
            </div>
        </Section>

        <Section title="ระบบเสี่ยงโชค (Lucky Draw)" icon={<Gift size={20} />}>
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-6 rounded-2xl border border-purple-500/20 flex items-center gap-6">
                <div className="text-4xl animate-bounce">🎁</div>
                <div>
                    <h3 className="text-lg font-bold text-white">กาชาฟรีประจำวัน</h3>
                    <p className="text-sm text-stone-400">
                        ล็อกอินทุกวันเพื่อหมุนวงล้อฟรี ลุ้นรับกุญแจ, เงินรางวัล หรือแม้แต่เครื่องขุดฟรี!
                    </p>
                    <div className="mt-2 text-xs text-purple-400 font-bold uppercase tracking-wider">รีเซ็ตทุก 07:00 น.</div>
                </div>
            </div>
        </Section>

        <div className="bg-stone-900 p-6 rounded-xl border border-stone-800 text-center">
            <h3 className="text-white font-bold mb-2 flex items-center justify-center gap-2"><Gamepad2 size={18} /> Mini Games</h3>
            <p className="text-stone-500 text-sm">เล่นเกม "กู้ระเบิด" (Mines) หรือ "สล็อต" เพื่อเพิ่มผลกำไรระหว่างรอเครื่องขุดทำงาน</p>
        </div>
    </div>
);

const VipContent = () => (
    <div className="space-y-8">
        <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-900/20 p-8 rounded-2xl border border-yellow-500/30 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            <Crown size={48} className="mx-auto text-yellow-500 mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">VIP Club</h2>
            <p className="text-yellow-200/60 text-sm">ปลดล็อกสิทธิพิเศษระดับสูงโดยการสะสมยอดเล่น</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoBox title="ลดค่าธรรมเนียม" color="green">
                ระดับ VIP สูง จะเสียค่าภาษีตลาดและค่าธรรมเนียมถอนเงินถูกลงอย่างมาก
            </InfoBox>
            <InfoBox title="เพิ่มอัตราดรอป" color="purple">
                เพิ่มโอกาสในการค้นหาไอเทมระดับตำนานในดันเจี้ยนสูงถึง +30%
            </InfoBox>
            <InfoBox title="ส่วนลดร้านค้า" color="yellow">
                รับส่วนลดในการซื้อเครื่องจักรและไอเทมสูงสุด 15%
            </InfoBox>
            <InfoBox title="อวาตาร์พิเศษ" color="blue">
                ปลดล็อกกรอบโปรไฟล์สีทองและฉายาพิเศษในช่องแชท
            </InfoBox>
        </div>

        <Section title="ระบบแนะนำเพื่อน (Referral)" icon={<Users size={20} />}>
            <p className="text-stone-400 text-sm mb-4">
                ชวนเพื่อนมาเล่นและรับค่าคอมมิชชั่นตลอดชีพจากยอดของเพื่อน
            </p>
            <div className="flex items-center gap-4 bg-stone-900/50 p-4 rounded-xl border border-white/5">
                <div className="text-2xl">🤝</div>
                <div className="flex-1">
                    <div className="text-white font-bold text-sm">รับส่วนแบ่ง 5%</div>
                    <div className="text-xs text-stone-500">ทุกครั้งที่เพื่อนทำการฝากเงิน หรือซื้อเครื่องขุด</div>
                </div>
            </div>
        </Section>
    </div>
);

const SupportContent = () => (
    <div className="space-y-8">
        <Section title="Goldy: ผู้ช่วย AI อัจฉริยะ" icon={<Bot size={20} />}>
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-stone-800 rounded-xl flex items-center justify-center shrink-0 border border-stone-700">
                    <Bot size={32} className="text-stone-400" />
                </div>
                <div>
                    <p className="text-stone-300 text-sm leading-relaxed mb-3">
                        พบกับ "Goldy" ผู้ช่วยส่วนตัวของคุณ Goldy จะคอยเฝ้าเครื่องขุดให้คุณตลอด 24 ชม. และแจ้งเตือนผ่าน Telegram/Email เมื่อ:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-stone-400">
                        <li className="flex items-center gap-2">✅ เครื่องขุดหยุดทำงาน (0 HP)</li>
                        <li className="flex items-center gap-2">✅ พลังงานใกล้หมด</li>
                        <li className="flex items-center gap-2">✅ ราคาตลาดพุ่งสูง</li>
                        <li className="flex items-center gap-2">✅ ทีมสำรวจกลับมาถึง</li>
                    </ul>
                </div>
            </div>
        </Section>

        <Section title="ความยุติธรรม & ความปลอดภัย" icon={<Shield size={20} />}>
            <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-xl">
                <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} /> กฎเหล็ก (Zero Tolerance)
                </h4>
                <p className="text-stone-400 text-xs leading-relaxed">
                    เราใช้ระบบป้องกันการโกงขั้นสูง การใช้มาโคร, บอท (ที่ไม่ใช่ Goldy), หรือการปั๊มไอดีหลายบัญชี จะส่งผลให้ถูก <strong>ระงับบัญชีถาวร (Ban)</strong> ทันที
                    โปรดช่วยกันรักษาเศรษฐกิจของเกมให้ยุติธรรมสำหรับทุกคน
                </p>
            </div>
        </Section>
    </div>
);

// ==========================================
// UTILITY COMPONENTS
// ==========================================

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
            <span className="text-yellow-500">{icon}</span>
            {title}
        </h3>
        {children}
    </div>
);

const StepCard: React.FC<{ step: string; title: string; desc: string; icon: React.ReactNode }> = ({ step, title, desc, icon }) => (
    <div className="bg-stone-900/50 p-4 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[40px] font-black text-white/5 group-hover:text-yellow-500/10 transition-colors leading-none -mr-2 -mt-2">
            {step}
        </div>
        <div className="text-yellow-500 mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
        <p className="text-xs text-stone-500 group-hover:text-stone-400 transition-colors">{desc}</p>
    </div>
);

const InfoBox: React.FC<{ title: string; color: 'blue' | 'red' | 'green' | 'yellow' | 'purple'; children: React.ReactNode }> = ({ title, color, children }) => {
    const colors = {
        blue: 'bg-blue-500/5 border-blue-500/20 text-blue-400',
        red: 'bg-red-500/5 border-red-500/20 text-red-400',
        green: 'bg-green-500/5 border-green-500/20 text-green-400',
        yellow: 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400',
        purple: 'bg-purple-500/5 border-purple-500/20 text-purple-400',
    };

    return (
        <div className={`p-5 rounded-xl border ${colors[color]}`}>
            <h5 className="font-bold text-sm uppercase tracking-wider mb-2 opacity-90">{title}</h5>
            <p className="text-stone-300 text-sm leading-relaxed opacity-80">{children}</p>
        </div>
    );
};
