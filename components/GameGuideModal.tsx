import React, { useState } from 'react';
import { X, Pickaxe, Coins, Wrench, Hammer, Map, ArrowRight, Zap, RefreshCw, Skull, Hand, Trophy, BookOpen, Crown, Target, Users } from 'lucide-react';
import { DUNGEON_CONFIG, MATERIAL_RECIPES, MATERIAL_CONFIG } from '../constants';

interface GameGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!isOpen) return null;

    const tabs = [
        { id: 'overview', label: 'ภาพรวม (Overview)', icon: <RefreshCw size={18} /> },
        { id: 'mining', label: 'การขุดเจาะ (Mining)', icon: <Pickaxe size={18} /> },
        { id: 'market', label: 'ตลาดซื้อขาย (Market)', icon: <Coins size={18} /> },
        { id: 'warehouse', label: 'คลัง & คราฟต์', icon: <Hammer size={18} /> },
        { id: 'dungeon', label: 'ดันเจี้ยน (Dungeon)', icon: <Skull size={18} /> },
        { id: 'gloves', label: 'ระบบถุงมือ (Gloves)', icon: <Hand size={18} /> },
        { id: 'systems', label: 'ระบบอื่นๆ', icon: <Target size={18} /> },
    ];

    const renderOverview = () => {
        const steps = [
            { id: 1, title: "ขุด (Mine)", desc: "ใช้เครื่องจักรขุดแร่ แล้วกดรับรายได้ทุกวัน", icon: <Pickaxe size={32} className="text-white" />, color: "bg-blue-600", borderColor: "border-blue-400" },
            { id: 2, title: "ขาย (Trade)", desc: "เอาแร่ไปขายในตลาดกลาง (ระวังภาษี 15%) หรือเก็บไว้แปรรูป", icon: <Coins size={32} className="text-yellow-400" />, color: "bg-yellow-600", borderColor: "border-yellow-400" },
            { id: 3, title: "ซ่อม & เติม (Maintain)", desc: "อย่าลืม! ซ่อมเครื่องและเติมพลังงาน ไม่งั้นเครื่องหยุดทำงาน", icon: <Zap size={32} className="text-orange-400" />, color: "bg-orange-600", borderColor: "border-orange-400" },
            { id: 4, title: "คราฟต์ (Craft)", desc: "สะสมวัตถุดิบ -> สร้างเครื่องจักรใหม่ที่โรงงาน (คุ้มกว่าซื้อสด)", icon: <Hammer size={32} className="text-purple-400" />, color: "bg-purple-600", borderColor: "border-purple-400" },
            { id: 5, title: "ขยาย (Expand)", desc: "ปลดล็อกพื้นที่ (Slot) -> วางเครื่องเพิ่ม -> วนกลับไปข้อ 1", icon: <Map size={32} className="text-emerald-400" />, color: "bg-emerald-600", borderColor: "border-emerald-400" }
        ];

        return (
            <div className="relative">
                <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-2 bg-stone-800 -translate-y-[60px] rounded-full z-0"></div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 relative z-10 mt-10">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center group relative">
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-[40px] -right-4 -translate-y-1/2 text-stone-600 z-20 bg-stone-950 rounded-full p-1 border border-stone-800">
                                    <ArrowRight size={16} />
                                </div>
                            )}
                            <div className={`relative w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 ${step.borderColor} mb-4 transform group-hover:scale-110 transition-transform duration-300 z-10`}>
                                {step.icon}
                                <div className="absolute -bottom-3 px-3 py-1 bg-stone-950 border border-stone-800 rounded-full text-[10px] font-black uppercase text-white shadow-xl">Step {step.id}</div>
                            </div>
                            <div className="bg-stone-900/80 backdrop-blur border border-stone-800 p-4 rounded-2xl w-full flex-1 text-center shadow-lg">
                                <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-xs text-stone-400">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderMining = () => (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4 border-b border-stone-800 pb-2 flex items-center gap-2"><Pickaxe className="text-blue-500" /> ระบบการขุด (Mining)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-stone-900 p-5 rounded-xl border border-stone-800">
                    <h4 className="text-lg font-bold text-blue-400 mb-4">1. เครื่องขุด (Rigs)</h4>

                    {/* Visual Rig Card */}
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 mb-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Pickaxe size={64} /></div>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                                <Pickaxe size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">Basic Rig (Lv.1)</div>
                                <div className="text-xs text-stone-500">ROI: 0.5 THB/h</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-[10px] text-stone-400 mb-1"><span>Durability</span> <span>85%</span></div>
                                <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[85%]"></div></div>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-stone-400 leading-relaxed">
                        เครื่องขุดแต่ละรุ่นมีกำลังการผลิต (ROI) และอายุการใช้งานต่างกัน <br />
                        - <strong>Slot 1</strong>: ฟรีตลอดชีพ (รุ่นเริ่มต้น)<br />
                        - <strong>Slot 2-6</strong>: ต้องปลดล็อกด้วยแร่หรือเงิน<br />
                    </p>
                </div>
                <div className="bg-stone-900 p-5 rounded-xl border border-stone-800">
                    <h4 className="text-lg font-bold text-orange-400 mb-4">2. พลังงาน (Energy)</h4>

                    {/* Visual Energy */}
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 mb-4 text-center">
                        <div className="inline-block relative">
                            <Zap size={40} className="text-orange-500 mx-auto mb-2 animate-pulse" />
                            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                        </div>
                        <div className="text-xs text-stone-400 mb-2">Energy Level</div>
                        <div className="h-2 bg-stone-800 rounded-full overflow-hidden max-w-[150px] mx-auto mb-2">
                            <div className="h-full bg-gradient-to-r from-orange-600 to-yellow-400 w-[40%] animate-[pulse_2s_infinite]"></div>
                        </div>
                        <div className="text-[10px] text-red-400">Low Energy Warning!</div>
                    </div>

                    <p className="text-sm text-stone-400 leading-relaxed">
                        เครื่องขุดต้องใช้ไฟ! ถ้าพลังงานเหลือ 0% เครื่องจะ <strong>หยุดทำงาน</strong><br />
                        เติมไฟได้ที่หน้า Dashboard (เสียค่าไฟตามจริง)
                    </p>
                </div>
            </div>
        </div>
    );

    const renderMarket = () => (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4 border-b border-stone-800 pb-2 flex items-center gap-2"><Coins className="text-yellow-500" /> ตลาดซื้อขาย (Market)</h3>

            {/* Visual Tax Flow */}
            <div className="bg-stone-900 p-6 rounded-xl border border-stone-800 mb-6 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-stone-300 text-sm">Flow การขายแร่</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 w-full justify-center">
                    <div className="flex flex-col items-center px-4 py-3 bg-stone-950 rounded-lg border border-stone-700 min-w-[80px]">
                        <div className="text-xs text-stone-500 mb-1">ราคาขาย</div>
                        <div className="font-bold text-white">100</div>
                    </div>
                    <div className="text-stone-600"><ArrowRight size={20} /></div>
                    <div className="flex flex-col items-center px-4 py-3 bg-red-900/20 rounded-lg border border-red-900/50 min-w-[80px]">
                        <div className="text-xs text-red-400 mb-1">ภาษี 15%</div>
                        <div className="font-bold text-red-300">-15</div>
                    </div>
                    <div className="text-stone-600"><ArrowRight size={20} /></div>
                    <div className="flex flex-col items-center px-4 py-3 bg-green-900/20 rounded-lg border border-green-900/50 min-w-[80px] scale-110 shadow-lg shadow-green-900/20">
                        <div className="text-xs text-green-400 mb-1">ได้รับจริง</div>
                        <div className="font-bold text-green-300">85</div>
                    </div>
                </div>
            </div>

            <div className="bg-stone-900 p-6 rounded-xl border border-stone-800">
                <ul className="space-y-4 text-stone-300 text-sm">
                    <li className="flex items-start gap-3">
                        <div className="bg-green-900/20 p-2 rounded text-green-400 shrink-0"><ArrowRight size={16} /></div>
                        <div>
                            <strong className="text-white block mb-1">ความผันผวนของราคา (Price Fluctuation)</strong>
                            ราคาแร่มีการเปลี่ยนแปลงทุกวันตาม Demand/Supply ควรเช็คราคาก่อนขาย!
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="bg-purple-900/20 p-2 rounded text-purple-400 shrink-0"><ArrowRight size={16} /></div>
                        <div>
                            <strong className="text-white block mb-1">การแปรรูป (Refining)</strong>
                            เก็บแร่ไว้คราฟต์เป็นเครื่องขุด จะให้มูลค่าสูงกว่าการขายแร่ดิบๆ
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );

    const renderWarehouse = () => (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4 border-b border-stone-800 pb-2 flex items-center gap-2"><Hammer className="text-purple-500" /> คลัง & คราฟต์ (Crafting)</h3>

            {/* Visual Crafting Tree */}
            <div className="bg-stone-900 p-6 rounded-xl border border-stone-800 mb-6 flex flex-col items-center">
                <h4 className="text-sm font-bold text-stone-300 mb-6">ตัวอย่างผังการผสมแร่ (Fusion Tree)</h4>
                <div className="flex flex-col items-center gap-4">
                    {/* Level 1 */}
                    <div className="flex gap-8">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center border border-stone-600 text-[10px] text-stone-400">Coal</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center border border-stone-600 text-[10px] text-stone-400">Coal</div>
                        </div>
                    </div>
                    {/* Connector */}
                    <div className="w-16 h-8 border-b-2 border-r-2 border-l-2 border-stone-600 rounded-b-lg -mt-4"></div>
                    {/* Result */}
                    <div className="flex flex-col items-center -mt-1">
                        <div className="w-12 h-12 bg-orange-900/30 rounded-full flex items-center justify-center border border-orange-500 text-xs font-bold text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]">Copper</div>
                        <div className="text-[10px] text-stone-500 mt-1">Tier 1 Material</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
                    <h4 className="font-bold text-white mb-2">🏭 โรงงานประกอบ (Assembly Factory)</h4>
                    <p className="text-xs text-stone-400 mb-4">
                        คุณสามารถนำทรัพยากรมาประกอบเป็นเครื่องขุดรุ่นใหม่ได้ที่นี่ ประหยัดกว่าการซื้อด้วยเงินสดมาก!
                    </p>
                    <div className="text-xs bg-black/30 p-2 rounded">
                        <div className="flex justify-between mb-1"><span>• ขยะอวกาศ</span> <span className="text-stone-500"><ArrowRight size={12} className="inline" /></span> <span>เครื่องขั้นต้น</span></div>
                        <div className="flex justify-between mb-1"><span>• ทองแดง/เหล็ก</span> <span className="text-stone-500"><ArrowRight size={12} className="inline" /></span> <span>เครื่องระดับกลาง</span></div>
                        <div className="flex justify-between"><span>• ทองคำ/เพชร</span> <span className="text-stone-500"><ArrowRight size={12} className="inline" /></span> <span>เครื่องระดับสูง</span></div>
                    </div>
                </div>
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
                    <h4 className="font-bold text-white mb-2">🧪 การผสมแร่ (Material Fusion)</h4>
                    <p className="text-xs text-stone-400 mb-4">
                        แร่บางชนิดหาไม่ได้จากการขุด แต่ต้องเกิดจากการนำแร่ดิบมาผสมกัน
                    </p>
                    <div className="text-xs bg-black/30 p-2 rounded">
                        <div className="flex justify-between mb-1 text-slate-300"><span>• ถ่านหิน x2</span> <span className="text-yellow-500"><ArrowRight size={12} className="inline" /></span> <span>ทองแดง x1</span></div>
                        <div className="flex justify-between mb-1 text-orange-300"><span>• ทองแดง x3</span> <span className="text-yellow-500"><ArrowRight size={12} className="inline" /></span> <span>เหล็ก x1</span></div>
                        <div className="flex justify-between text-yellow-300"><span>• เหล็ก x4</span> <span className="text-yellow-500"><ArrowRight size={12} className="inline" /></span> <span>ทองคำ x1</span></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDungeon = () => (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4 border-b border-stone-800 pb-2 flex items-center gap-2"><Skull className="text-red-500" /> ดันเจี้ยน (Dungeon)</h3>

            {/* Visual Dungeon Cards */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {DUNGEON_CONFIG.map(d => (
                    <div key={d.id} className="min-w-[140px] bg-stone-950 p-3 rounded-xl border border-stone-800 flex flex-col items-center text-center group hover:border-red-500/50 transition-colors">
                        <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center mb-2 group-hover:bg-red-900/20 transition-colors">
                            <Skull size={20} className="text-stone-500 group-hover:text-red-500" />
                        </div>
                        <div className="text-xs font-bold text-white mb-1 truncate w-full">{d.name}</div>
                        <div className="text-[10px] text-stone-500 mb-2">{d.durationHours} ชม.</div>
                        <div className="mt-auto px-2 py-1 bg-stone-900 rounded text-[10px] text-yellow-500 w-full">
                            Cost: {d.cost}
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-stone-400 text-sm mb-4">ส่งเครื่องขุดไปสำรวจพื้นที่ลึกลับเพื่อรับรางวัลมหาศาล (แต่มีความเสี่ยง! เครื่องขุดจะหยุดทำงานระหว่างสำรวจ)</p>
        </div>
    );

    const renderGloves = () => (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4 border-b border-stone-800 pb-2 flex items-center gap-2"><Hand className="text-emerald-500" /> ระบบถุงมือ (Gloves)</h3>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
                        <h4 className="font-bold text-white mb-2">🧤 คุณสมบัติ </h4>
                        <p className="text-xs text-stone-400">
                            ถุงมือช่วยเพิ่ม <strong>Luck Chance</strong> ให้กับเครื่องขุด ทำให้มีโอกาสดรอปไอเทมตอนเก็บเงินรายชั่วโมงมากขึ้น
                        </p>
                    </div>
                    <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
                        <h4 className="font-bold text-white mb-2">⚒️ การตีบวก (Enhancement)</h4>
                        <p className="text-xs text-stone-400">
                            ใช้ <strong>Upgrade Chip</strong> เพื่อตีบวกถุงมือ เพิ่มค่า Luck แต่ระวัง! หากล้มเหลวถุงมืออาจจะหายไป
                        </p>
                    </div>
                </div>

                {/* Visual Glove Slot */}
                <div className="w-full md:w-1/3 bg-black/40 p-6 rounded-xl flex flex-col items-center justify-center border border-stone-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/5 blur-xl"></div>
                    <div className="relative group">
                        <div className="w-24 h-24 mx-auto bg-stone-900 rounded-xl border-2 border-emerald-500/50 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <Hand size={40} className="text-emerald-400" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-stone-900">
                            +5
                        </div>
                    </div>
                    <div className="text-sm font-bold text-white">Luck Glove (+5)</div>
                    <div className="text-xs text-emerald-400 mt-1">Luck Rate +2.5%</div>
                </div>
            </div>
        </div>
    );

    const renderSystems = () => (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4 border-b border-stone-800 pb-2 flex items-center gap-2"><Target className="text-pink-500" /> ระบบอื่นๆ</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 hover:border-yellow-500 transition-colors">
                    <Crown className="text-yellow-500 mb-2" />
                    <h4 className="font-bold text-white">VIP System</h4>
                    <p className="text-xs text-stone-400 mt-1">สมัคร VIP เพื่อรับโบนัสรายวัน x2, ลดค่าซ่อม, และสิทธิพิเศษอื่นๆ</p>
                </div>
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 hover:border-blue-500 transition-colors">
                    <Target className="text-blue-500 mb-2" />
                    <h4 className="font-bold text-white">Missions</h4>
                    <p className="text-xs text-stone-400 mt-1">ทำภารกิจรายวัน/สัปดาห์ เพื่อรับกล่องสุ่มแหละเงินรางวัล</p>
                </div>

                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 hover:border-purple-500 transition-colors">
                    <Trophy className="text-purple-500 mb-2" />
                    <h4 className="font-bold text-white">Leaderboard</h4>
                    <p className="text-xs text-stone-400 mt-1">จัดอันดับความรวยชิงรางวัลใหญ่ประจำฤดูกาล</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">

                {/* Header */}
                <div className="bg-stone-900 p-4 border-b border-stone-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-900/20 p-2 rounded-lg text-blue-400">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">คู่มือเกม (Game Guide)</h2>
                            <p className="text-xs text-stone-500">ข้อมูลและวิธีการเล่นฉบับสมบูรณ์</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-20 lg:w-64 bg-stone-900/50 border-r border-stone-800 flex flex-col overflow-y-auto custom-scrollbar shrink-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`p-4 flex items-center gap-3 transition-all border-l-4 ${activeTab === tab.id ? 'bg-stone-800 border-yellow-500 text-white' : 'border-transparent text-stone-400 hover:bg-stone-900 hover:text-stone-200'}`}
                            >
                                <span className={activeTab === tab.id ? 'text-yellow-500' : ''}>{tab.icon}</span>
                                <span className="hidden lg:block text-sm font-bold text-left">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'mining' && renderMining()}
                            {activeTab === 'market' && renderMarket()}
                            {activeTab === 'warehouse' && renderWarehouse()}
                            {activeTab === 'dungeon' && renderDungeon()}
                            {activeTab === 'gloves' && renderGloves()}
                            {activeTab === 'systems' && renderSystems()}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
