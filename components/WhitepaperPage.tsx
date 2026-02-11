import React from 'react';
import {
    ArrowLeft,
    Pickaxe,
    Globe,
    TrendingUp,
    Shield,
    Gem,
    Zap,
    Cpu,
    Truck,
    Gift,
    ChevronRight,
} from 'lucide-react';

interface WhitepaperPageProps {
    onBack: () => void;
    onPlayNow: () => void;
}

export const WhitepaperPage: React.FC<WhitepaperPageProps> = ({ onBack, onPlayNow }) => {

    return (
        <div className="min-h-screen bg-stone-950 text-stone-300 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-yellow-500/3 blur-[200px] rounded-full"></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/3 blur-[200px] rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/2 blur-[250px] rounded-full"></div>
            </div>

            {/* Floating Nav Bar */}
            <nav className="sticky top-0 z-50 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/50">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-stone-400 hover:text-yellow-500 transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm uppercase tracking-wider">กลับหน้าหลัก</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-stone-600 uppercase tracking-widest hidden sm:block">Ver 1.0</span>
                        <button
                            onClick={onPlayNow}
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black text-sm font-black py-2 px-6 rounded-lg shadow-lg hover:shadow-yellow-500/30 transition-all"
                        >
                            เล่นเลย
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">

                {/* ============ HERO ============ */}
                <header className="text-center mb-20">
                    <div className="inline-block mb-6">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_60px_rgba(234,179,8,0.3)] mb-6">
                            <Gem size={36} className="text-black -rotate-45" />
                        </div>
                    </div>
                    <div className="text-yellow-500/60 text-sm font-bold uppercase tracking-[0.3em] mb-4">📜 Official Whitepaper</div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
                        GOLD <span className="text-yellow-500">RUSH</span>
                    </h1>
                    <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto mb-3 italic">
                        "Build Your Empire. Control The Economy. Rule The World."
                    </p>
                    <p className="text-sm text-stone-500">
                        สร้างอาณาจักร กำหนดเศรษฐกิจ ครองโลก
                    </p>
                    <div className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto mt-8"></div>
                </header>


                {/* ============ SECTION 1: Introduction ============ */}
                <Section id="intro" number="01" title="บทนำ" subtitle="Introduction" icon={<Pickaxe size={24} />} accent="yellow">
                    <p className="text-stone-300 leading-relaxed text-lg mb-6">
                        Gold Rush คือเกมแนว <Highlight>Mining Simulation Tycoon</Highlight> บนเว็บเบราว์เซอร์ (Web-based)
                        ที่ผสมผสานระบบเศรษฐกิจเสมือนจริง (Virtual Economy) เข้ากับความสนุกในการบริหารจัดการทรัพยากร
                    </p>
                    <p className="text-stone-400 leading-relaxed mb-8">
                        ผู้เล่นจะได้รับบทเป็นเจ้าของเหมืองที่เริ่มต้นจากศูนย์ มุ่งสู่การเป็นมหาเศรษฐีด้วยการขุดแร่, แปรรูปวัตถุดิบ,
                        ค้าขายในตลาดโลก และสร้างอาณาจักรโลจิสติกส์
                    </p>

                    <div className="bg-gradient-to-br from-yellow-500/5 to-yellow-900/10 border border-yellow-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-yellow-500 text-lg">🎯</span>
                            <h4 className="text-yellow-500 font-black text-sm uppercase tracking-wider">วิสัยทัศน์ (Vision)</h4>
                        </div>
                        <p className="text-stone-300 leading-relaxed">
                            เราต้องการสร้างเกมที่ระบบเศรษฐกิจ <Highlight>"ถูกขับเคลื่อนโดยผู้เล่น 100%"</Highlight> (Player-Driven Economy)
                            ราคาของแร่ทุกชิ้น การขึ้นลงของกราฟตลาด เกิดจาก Demand และ Supply จริง — ไม่มีการแทรกแซง
                        </p>
                    </div>
                </Section>


                {/* ============ SECTION 2: Core Gameplay ============ */}
                <Section id="core" number="02" title="ระบบการเล่นหลัก" subtitle="Core Gameplay" icon={<Zap size={24} />} accent="blue">

                    {/* 2.1 Mining */}
                    <SubSection emoji="⛏️" title="2.1 ระบบเครื่องขุด" subtitle="Mining Infrastructure">
                        <p className="text-stone-400 leading-relaxed mb-6">
                            หัวใจหลักของรายได้ เครื่องขุดมีอายุสัญญา (Contract) และต้องการการซ่อมบำรุง (Maintenance)
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InfoCard title="Tier System" color="yellow">
                                มีตั้งแต่ Tier 1 (พลั่วสนิม) สำหรับผู้เริ่มต้น ไปจนถึง Tier 8 (เครื่องปฏิกรณ์นิวเคลียร์) ที่ให้ผลตอบแทนสูงสุด
                            </InfoCard>
                            <InfoCard title="Maintenance" color="red">
                                เครื่องจักรมีค่าความทนทาน (HP) หากไม่ซ่อมแซม รายได้จะหยุดชะงัก
                            </InfoCard>
                            <InfoCard title="Overclock" color="purple">
                                เร่งกำลังขุดได้ชั่วคราว (แลกกับการกินพลังงานที่มากขึ้น)
                            </InfoCard>
                        </div>
                    </SubSection>

                    {/* 2.2 Exploration */}
                    <SubSection emoji="💀" title="2.2 การสำรวจและดันเจี้ยน" subtitle="Exploration & Expedition">
                        <p className="text-stone-400 leading-relaxed mb-6">
                            ระบบส่งเครื่องขุดไปเสี่ยงโชคเพื่อค้นหาแร่หายากและไอเทมพิเศษ
                        </p>
                        <div className="space-y-3">
                            <ExpeditionRow name="Short Haul" time="2 ชม." risk="ต่ำ" riskColor="green" desc="ได้แร่พื้นฐาน" />
                            <ExpeditionRow name="Expedition" time="6 ชม." risk="ปานกลาง" riskColor="yellow" desc="มีโอกาสพบ Jackpot" />
                            <ExpeditionRow name="World Mining Expo" time="12 ชม." risk="สูง" riskColor="red" desc="ลุ้นรับพิมพ์เขียว (Blueprint) และแร่ระดับตำนาน" />
                        </div>
                    </SubSection>

                    {/* 2.3 Crafting */}
                    <SubSection emoji="🛠️" title="2.3 โรงงานและการคราฟต์" subtitle="Refinery & Crafting">
                        <p className="text-stone-400 leading-relaxed mb-6">
                            เพิ่มมูลค่าให้ทรัพยากร ไม่ใช่แค่ขายทิ้ง
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <InfoCard title="Refining (การสกัด)" color="blue">
                                เปลี่ยนเศษดิน (Dirt) ให้เป็นถ่านหิน (Coal) ในอัตราส่วน 5:1
                            </InfoCard>
                            <InfoCard title="Equipment Crafting" color="purple">
                                สร้างอุปกรณ์สวมใส่ (หมวกนิรภัย, ชุดกันความร้อน) เพื่อเพิ่มบัฟ
                            </InfoCard>
                        </div>
                        <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-5">
                            <h5 className="text-white font-bold text-sm mb-3">🎲 ค่าสถานะจากอุปกรณ์คราฟต์:</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { stat: 'Efficiency', desc: 'เพิ่มกำไรต่อวัน', color: 'text-green-400' },
                                    { stat: 'Durability', desc: 'ลดค่าซ่อมแซม', color: 'text-blue-400' },
                                    { stat: 'Luck', desc: 'เพิ่มโอกาสเจอแร่หายาก', color: 'text-purple-400' },
                                    { stat: 'Great Success', desc: '10% ค่าสถานะระดับเทพ', color: 'text-yellow-400' },
                                ].map((s, i) => (
                                    <div key={i} className="text-center">
                                        <div className={`${s.color} font-black text-xs uppercase`}>{s.stat}</div>
                                        <div className="text-stone-500 text-[10px] mt-1">{s.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SubSection>
                </Section>


                {/* ============ SECTION 3: Economy ============ */}
                <Section id="economy" number="03" title="ระบบเศรษฐกิจ" subtitle="Game Economy" icon={<TrendingUp size={24} />} accent="green">

                    {/* 3.1 Marketplace */}
                    <SubSection emoji="📈" title="3.1 ตลาดกลาง" subtitle="Global Marketplace">
                        <p className="text-stone-400 leading-relaxed mb-6">
                            ตลาดซื้อขายแบบ Real-time ที่ผู้เล่นตั้งราคาเอง
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InfoCard title="Commodities" color="green">
                                ซื้อขายแร่ 8 ชนิด: Dirt, Coal, Copper, Iron, Gold, Diamond, Oil, Vibranium
                            </InfoCard>
                            <InfoCard title="Trading Mechanics" color="blue">
                                ดูกราฟราคาขึ้น-ลง, ตั้ง Buy Order / Sell Order
                            </InfoCard>
                            <InfoCard title="Burning Mechanism" color="red">
                                หักภาษีการขาย 15% เพื่อนำเงินออกจากระบบ ป้องกันเงินเฟ้อ
                            </InfoCard>
                        </div>
                    </SubSection>

                    {/* 3.2 Financial */}
                    <SubSection emoji="💳" title="3.2 ระบบการเงิน" subtitle="Financial System">
                        <p className="text-stone-400 leading-relaxed mb-6">
                            รองรับทั้งผู้เล่นทั่วไปและสาย Crypto
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-5 flex items-start gap-4">
                                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg">🏦</span>
                                </div>
                                <div>
                                    <h5 className="text-white font-bold text-sm mb-1">Fiat / Local</h5>
                                    <p className="text-stone-500 text-xs">รองรับการเติม-ถอนผ่านธนาคารและ TrueMoney (Scan QR)</p>
                                </div>
                            </div>
                            <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-5 flex items-start gap-4">
                                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg">🪙</span>
                                </div>
                                <div>
                                    <h5 className="text-white font-bold text-sm mb-1">Crypto Integration</h5>
                                    <p className="text-stone-500 text-xs">รองรับ USDT (BEP-20 / TRC-20) เพื่อความสะดวกระดับโลก</p>
                                </div>
                            </div>
                        </div>
                    </SubSection>
                </Section>


                {/* ============ SECTION 4: Logistics ============ */}
                <Section id="logistics" number="04" title="ระบบใหม่: โลจิสติกส์" subtitle="Logistics & Vehicles" icon={<Truck size={24} />} accent="purple" isNew>

                    <p className="text-stone-400 leading-relaxed mb-8">
                        <span className="text-purple-400 font-bold">(ฟีเจอร์ไฮไลท์ของ Phase 2)</span> ผู้เล่นสามารถนำแร่ที่ขุดได้
                        มาสร้างยานพาหนะเพื่อรับภารกิจส่งของ (Delivery Quests)
                    </p>

                    {/* Vehicle Tiers */}
                    <div className="space-y-4 mb-8">
                        <VehicleTier
                            emoji="🚲"
                            name="จักรยาน / มอไซค์"
                            materials="เหล็ก + เศษดิน"
                            desc="ส่งระยะใกล้"
                            tier={1}
                        />
                        <VehicleTier
                            emoji="🚛"
                            name="รถบรรทุก / สิบล้อ"
                            materials="เหล็ก + ทองคำ + น้ำมัน"
                            desc="ส่งสินค้าล็อตใหญ่"
                            tier={2}
                        />
                        <VehicleTier
                            emoji="✈️"
                            name="เครื่องบินเจ็ท / เรือ"
                            materials="ไวเบรเนียม + เพชร"
                            desc="ส่งสินค้าข้ามทวีป รวดเร็วที่สุด"
                            tier={3}
                        />
                    </div>

                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-5">
                        <h5 className="text-purple-400 font-bold text-sm mb-2">🔧 Utility</h5>
                        <p className="text-stone-400 text-sm leading-relaxed">
                            ใช้ทำภารกิจรับเงินรางวัลก้อนโต และใช้ขนย้ายทรัพยากรระหว่างเมือง
                        </p>
                    </div>
                </Section>


                {/* ============ SECTION 5: Retention ============ */}
                <Section id="retention" number="05" title="สิทธิประโยชน์และการรักษาผู้เล่น" subtitle="Retention & VIP" icon={<Gift size={24} />} accent="pink">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoCard title="Daily Login" color="yellow">
                            รีเซ็ตทุก 07:00 น. สุ่มแจกแร่ตามระดับเครื่องขุด (เครื่องแพงมีโอกาสได้เพชร/ทอง)
                        </InfoCard>
                        <InfoCard title="Referral System" color="green">
                            ชวนเพื่อนมาขุด รับกุญแจไขกาชาและส่วนแบ่งทรัพยากร
                        </InfoCard>
                        <InfoCard title="VIP Club" color="purple">
                            ผู้เล่นระดับสูงจะได้รับสิทธิ์ลดค่าธรรมเนียมตลาด และเข้าดันเจี้ยนพิเศษ
                        </InfoCard>
                    </div>
                </Section>


                {/* ============ SECTION 6: Roadmap ============ */}
                <Section id="roadmap-wp" number="06" title="แผนงานในอนาคต" subtitle="Roadmap" icon={<Globe size={24} />} accent="yellow">
                    <div className="space-y-8">
                        <RoadmapPhase
                            phase="Phase 1"
                            title="The Beginning (เปิดตัว)"
                            status="completed"
                            items={[
                                { text: 'เปิดตัวเว็บไซต์และระบบขุดเหมือง (Mining)', done: true },
                                { text: 'เปิดระบบตลาดซื้อขาย (Marketplace)', done: true },
                                { text: 'เปิดระบบคราฟต์และโรงงาน (Crafting)', done: true },
                            ]}
                        />
                        <RoadmapPhase
                            phase="Phase 2"
                            title="The Expansion (การขยายตัว)"
                            status="current"
                            items={[
                                { text: 'ระบบยานพาหนะและขนส่ง (Logistics System)', done: false, inProgress: true },
                                { text: 'ระบบกิลด์ (Mining Corp)', done: false, inProgress: true },
                            ]}
                        />
                        <RoadmapPhase
                            phase="Phase 3"
                            title="The Domination (ครองโลก)"
                            status="future"
                            items={[
                                { text: 'สงครามตลาด (Market Wars)', done: false },
                                { text: 'Metaverse Land (ซื้อที่ดินในเกม)', done: false },
                                { text: 'Global Tournament', done: false },
                            ]}
                        />
                    </div>
                </Section>


                {/* ============ SECTION 7: Technical ============ */}
                <Section id="tech" number="07" title="ข้อมูลทางเทคนิค" subtitle="Technical Specs" icon={<Cpu size={24} />} accent="cyan">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'Frontend', value: 'Next.js (React), Tailwind CSS', desc: 'เพื่อความลื่นไหลและสวยงาม' },
                            { label: 'Backend', value: 'Node.js, Express', desc: 'รองรับ Transaction จำนวนมาก' },
                            { label: 'Database', value: 'MongoDB Atlas', desc: 'เก็บข้อมูลแบบ Real-time' },
                            { label: 'Security', value: 'JWT, Cloudflare, Server-side Validation', desc: 'ปกป้องทุกชั้น' },
                        ].map((tech, i) => (
                            <div key={i} className="bg-stone-900/50 border border-stone-800 rounded-xl p-5">
                                <div className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-1">{tech.label}</div>
                                <div className="text-white font-bold text-sm mb-1">{tech.value}</div>
                                <div className="text-stone-500 text-xs">{tech.desc}</div>
                            </div>
                        ))}
                    </div>
                </Section>


                {/* ============ Disclaimer ============ */}
                <div className="mt-20 mb-12 bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={20} className="text-red-400" />
                        <h3 className="text-red-400 font-black text-sm uppercase tracking-wider">⚠️ Disclaimer (ข้อควรระวัง)</h3>
                    </div>
                    <p className="text-stone-400 text-sm leading-relaxed">
                        Gold Rush เป็นเกมจำลองสถานการณ์เพื่อความบันเทิง การลงทุนในสินทรัพย์ดิจิทัลมีความเสี่ยง
                        ผู้เล่นควรศึกษาระบบเกมและบริหารจัดการความเสี่ยงด้วยตนเอง
                    </p>
                </div>


                {/* ============ Footer ============ */}
                <footer className="text-center pb-12 border-t border-stone-800 pt-8">
                    <div className="text-stone-600 text-sm">© 2026 Gold Rush Studio. All Rights Reserved.</div>
                    <button
                        onClick={onPlayNow}
                        className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black py-3 px-8 rounded-lg shadow-xl hover:shadow-yellow-500/30 transition-all"
                    >
                        เริ่มขุดเลย! <ChevronRight size={18} />
                    </button>
                </footer>
            </div>
        </div>
    );
};


// =============================================
// SUB-COMPONENTS
// =============================================

const Highlight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-yellow-400 font-bold">{children}</span>
);

interface SectionProps {
    id: string;
    number: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    accent: string;
    isNew?: boolean;
    children: React.ReactNode;
}

const accentColors: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    yellow: { border: 'border-yellow-500/20', bg: 'bg-yellow-500/5', text: 'text-yellow-500', glow: 'shadow-yellow-500/10' },
    blue: { border: 'border-blue-500/20', bg: 'bg-blue-500/5', text: 'text-blue-500', glow: 'shadow-blue-500/10' },
    green: { border: 'border-green-500/20', bg: 'bg-green-500/5', text: 'text-green-500', glow: 'shadow-green-500/10' },
    purple: { border: 'border-purple-500/20', bg: 'bg-purple-500/5', text: 'text-purple-500', glow: 'shadow-purple-500/10' },
    pink: { border: 'border-pink-500/20', bg: 'bg-pink-500/5', text: 'text-pink-500', glow: 'shadow-pink-500/10' },
    cyan: { border: 'border-cyan-500/20', bg: 'bg-cyan-500/5', text: 'text-cyan-500', glow: 'shadow-cyan-500/10' },
    red: { border: 'border-red-500/20', bg: 'bg-red-500/5', text: 'text-red-500', glow: 'shadow-red-500/10' },
};

const Section: React.FC<SectionProps> = ({ id, number, title, subtitle, icon, accent, isNew, children }) => {
    const a = accentColors[accent] || accentColors.yellow;
    return (
        <section id={id} className="mb-20">
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 ${a.bg} border ${a.border} rounded-xl flex items-center justify-center ${a.text}`}>
                    {icon}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-stone-600 text-xs font-bold tracking-widest">{number}</span>
                        {isNew && (
                            <span className="bg-purple-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">New!</span>
                        )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white">{title}</h2>
                    <p className="text-stone-500 text-sm">{subtitle}</p>
                </div>
            </div>
            {children}
        </section>
    );
};

interface SubSectionProps {
    emoji: string;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

const SubSection: React.FC<SubSectionProps> = ({ emoji, title, subtitle, children }) => (
    <div className="mb-10 ml-0 md:ml-4 pl-4 border-l-2 border-stone-800">
        <h3 className="text-lg font-bold text-white mb-1">
            <span className="mr-2">{emoji}</span>{title}
        </h3>
        <p className="text-stone-500 text-xs mb-4 uppercase tracking-wider">{subtitle}</p>
        {children}
    </div>
);

interface InfoCardProps {
    title: string;
    color: string;
    children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, color, children }) => {
    const a = accentColors[color] || accentColors.yellow;
    return (
        <div className={`${a.bg} border ${a.border} rounded-xl p-5`}>
            <h5 className={`${a.text} font-bold text-xs uppercase tracking-wider mb-2`}>{title}</h5>
            <p className="text-stone-400 text-sm leading-relaxed">{children}</p>
        </div>
    );
};

interface ExpeditionRowProps {
    name: string;
    time: string;
    risk: string;
    riskColor: string;
    desc: string;
}

const ExpeditionRow: React.FC<ExpeditionRowProps> = ({ name, time, risk, riskColor, desc }) => {
    const riskColors: Record<string, string> = {
        green: 'text-green-400 bg-green-500/10',
        yellow: 'text-yellow-400 bg-yellow-500/10',
        red: 'text-red-400 bg-red-500/10',
    };
    const rc = riskColors[riskColor] || riskColors.green;
    return (
        <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
                <div className="text-white font-bold text-sm">{name}</div>
                <div className="text-stone-500 text-xs">{desc}</div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-stone-500 text-xs bg-stone-800 px-2 py-1 rounded">⏱ {time}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${rc}`}>⚠ ความเสี่ยง{risk}</span>
            </div>
        </div>
    );
};

interface VehicleTierProps {
    emoji: string;
    name: string;
    materials: string;
    desc: string;
    tier: number;
}

const VehicleTier: React.FC<VehicleTierProps> = ({ emoji, name, materials, desc, tier }) => {
    const tierColors = ['border-green-500/20 bg-green-500/5', 'border-yellow-500/20 bg-yellow-500/5', 'border-purple-500/20 bg-purple-500/5'];
    return (
        <div className={`${tierColors[tier - 1]} border rounded-xl p-5 flex items-start gap-4`}>
            <div className="text-3xl">{emoji}</div>
            <div className="flex-1">
                <div className="text-white font-bold mb-1">{name}</div>
                <div className="text-stone-500 text-xs mb-2">วัตถุดิบ: <span className="text-stone-300">{materials}</span></div>
                <div className="text-stone-400 text-sm">{desc}</div>
            </div>
        </div>
    );
};

interface RoadmapPhaseProps {
    phase: string;
    title: string;
    status: 'completed' | 'current' | 'future';
    items: { text: string; done: boolean; inProgress?: boolean }[];
}

const RoadmapPhase: React.FC<RoadmapPhaseProps> = ({ phase, title, status, items }) => {
    const statusStyles = {
        completed: 'border-yellow-500/30 bg-yellow-500/5',
        current: 'border-purple-500/30 bg-purple-500/5',
        future: 'border-stone-700 bg-stone-900/30',
    };
    const phaseColors = {
        completed: 'text-yellow-500',
        current: 'text-purple-400',
        future: 'text-stone-500',
    };
    return (
        <div className={`border ${statusStyles[status]} rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`${phaseColors[status]} font-black text-sm uppercase tracking-wider`}>{phase}</div>
                <div className="text-white font-bold">{title}</div>
                {status === 'current' && (
                    <span className="bg-purple-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full animate-pulse">กำลังพัฒนา</span>
                )}
            </div>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                        <span className={item.done ? 'text-green-400' : item.inProgress ? 'text-yellow-400' : 'text-stone-600'}>
                            {item.done ? '✅' : item.inProgress ? '🔄' : '🔜'}
                        </span>
                        <span className={item.done ? 'text-stone-300' : item.inProgress ? 'text-stone-400' : 'text-stone-500'}>
                            {item.text}
                        </span>
                        {item.inProgress && <span className="text-[8px] text-yellow-600 font-bold">กำลังพัฒนา</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};
