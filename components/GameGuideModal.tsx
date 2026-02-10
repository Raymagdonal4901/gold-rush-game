import React, { useState } from 'react';
import { X, Building2, Home, Coins, Wrench, Hammer, Map, ArrowRight, Zap, RefreshCw, Skull, Hand, Trophy, BookOpen, Crown, Target, Users, HelpCircle, AlertTriangle } from 'lucide-react';
import { DUNGEON_CONFIG, MATERIAL_RECIPES, MATERIAL_CONFIG, VIP_TIERS } from '../constants';
import { OilRigAnimation } from './OilRigAnimation';
import { MaterialIcon } from './MaterialIcon';
import { useTranslation } from './LanguageContext';

interface GameGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({ isOpen, onClose }) => {
    const { getLocalized } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');

    if (!isOpen) return null;

    const tabs = [
        { id: 'overview', label: 'ภาพรวม (Overview)', icon: <RefreshCw size={18} /> },
        { id: 'mining', label: 'แท่นขุด & การดูแล', icon: <Home size={18} /> },
        { id: 'equipment', label: 'อุปกรณ์ & หุ่นยนต์', icon: <Hand size={18} /> },
        { id: 'dungeon', label: 'สำรวจเหมือง (Exploration)', icon: <Skull size={18} /> },
        { id: 'crafting', label: 'โรงงาน & สกัดแร่', icon: <Hammer size={18} /> },
        { id: 'economy', label: 'ตลาด & การเงิน', icon: <Coins size={18} /> },
        { id: 'systems', label: 'VIP & ภารกิจ', icon: <Crown size={18} /> },
    ];

    const renderOverview = () => {
        const steps = [
            { id: 1, title: "ขุดแร่ (Mine)", desc: "จัดการแท่นขุดเพื่อผลิตเงินและแร่", icon: <Coins size={32} className="text-white" />, color: "bg-blue-600", borderColor: "border-blue-400" },
            { id: 2, title: "ค้าขาย (Trade)", desc: "ขายวัสดุในตลาด (ระวังภาษี) หรือเก็บไว้สร้างของ", icon: <Coins size={32} className="text-yellow-400" />, color: "bg-yellow-600", borderColor: "border-yellow-400" },
            { id: 3, title: "ติดตั้ง (Equip)", desc: "ติดตั้งอุปกรณ์เครื่องจักรและหุ่นยนต์ เพื่อเพิ่มกำไร", icon: <Zap size={32} className="text-orange-400" />, color: "bg-orange-600", borderColor: "border-orange-400" },
            { id: 4, title: "สกัดแร่ (Extract)", desc: "สกัดวัสดุระดับสูง ปลดล็อกพื้นที่เพิ่ม", icon: <Hammer size={32} className="text-white" />, color: "bg-purple-600", borderColor: "border-purple-400" },
            { id: 5, title: "สำรวจ (Explore)", desc: "ลงพื้นที่สำรวจแหล่งแร่หายากและไอเทมพิเศษ", icon: <Skull size={32} className="text-red-400" />, color: "bg-red-600", borderColor: "border-red-400" }
        ];

        return (
            <div className="relative pb-10">
                <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">ยินดีต้อนรับสู่ Gold Rush</h3>
                    <p className="text-stone-400 mt-2">เส้นทางสู่นักล่าทองคำผู้มั่งคั่งเริ่มที่นี่!</p>
                </div>

                <div className="hidden lg:block absolute top-[180px] left-12 right-12 h-2 bg-stone-800 rounded-full z-0"></div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center group relative hover:-translate-y-2 transition-transform duration-300">
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-[40px] -right-5 -translate-y-1/2 text-stone-600 z-20 bg-stone-950 rounded-full p-1 border border-stone-800">
                                    <ArrowRight size={16} />
                                </div>
                            )}
                            <div className={`relative w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 ${step.borderColor} mb-4 z-10`}>
                                {step.icon}
                                <div className="absolute -bottom-3 px-3 py-1 bg-stone-950 border border-stone-800 rounded-full text-[10px] font-black uppercase text-white shadow-xl">Step {step.id}</div>
                            </div>
                            <div className="bg-stone-900/80 backdrop-blur border border-stone-800 p-4 rounded-2xl w-full flex-1 text-center shadow-lg group-hover:border-stone-600 transition-colors">
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
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-stone-800 pb-2 flex items-center gap-2">
                <Building2 className="text-blue-500" /> ระบบแท่นขุดและการดูแล
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rig Showcase */}
                <div className="space-y-4">
                    <h4 className="text-lg font-bold text-yellow-400 flex items-center gap-2"><Crown size={18} /> ประเภทห้องพัก</h4>
                    <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 flex flex-col gap-6">

                        {/* Basic Rig */}
                        <div className="flex items-center gap-4 bg-stone-900/50 p-4 rounded-xl border border-stone-700/50 overflow-hidden">
                            <div className="w-24 h-24 relative shrink-0">
                                <div className="absolute inset-0 bg-blue-900/20 rounded-full blur-md"></div>
                                <OilRigAnimation tier={1} isActive={true} />
                            </div>
                            <div>
                                <h5 className="font-bold text-blue-400">Basic Shovel (Tier 1)</h5>
                                <p className="text-xs text-stone-400 mt-1">เครื่องมือขุดเริ่มต้นสำหรับมือใหม่</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-300">ขุดได้เรื่อยๆ</span>
                                    <span className="text-[10px] bg-stone-800 px-2 py-0.5 rounded text-stone-300">ดูแลต่ำ</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center"><ArrowRight className="text-stone-600 rotate-90" /></div>

                        {/* Grand Reactor */}
                        <div className="flex items-center gap-4 bg-purple-950/20 p-4 rounded-xl border border-purple-500/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 px-2 py-1 bg-purple-600 text-[10px] font-bold text-white rounded-bl-lg z-10">ULTIMATE</div>
                            <div className="w-32 h-32 relative shrink-0 -ml-2">
                                <div className="absolute inset-0 bg-purple-900/40 rounded-full blur-xl animate-pulse"></div>
                                <div className="scale-125 translate-y-2">
                                    <OilRigAnimation tier={6} isActive={true} />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h5 className="font-bold text-purple-300 text-lg">Legendary Mining Complex</h5>
                                <p className="text-xs text-purple-200/70 mt-1">ที่สุดแห่งเทคโนโลยีการขุด</p>
                                <ul className="text-[10px] text-stone-400 mt-2 space-y-1">
                                    <li className="flex items-center gap-1"><span className="text-green-400">●</span> อัตราขุดสูงที่สุดในเหมือง</li>
                                    <li className="flex items-center gap-1"><span className="text-green-400">●</span> <span className="text-yellow-400 font-bold">Vabrenium Yield</span> (แร่แชมเปี้ยน)</li>
                                    <li className="flex items-center gap-1"><span className="text-green-400">●</span> เหมาะสำหรับเจ้าสัวเหมือง</li>
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Mechanics */}
                <div className="space-y-6">
                    <div className="bg-stone-900 p-5 rounded-xl border border-stone-800">
                        <h4 className="font-bold text-orange-400 mb-2 flex items-center gap-2"><Zap size={18} /> สภาพเครื่องจักร (Condition)</h4>
                        <p className="text-sm text-stone-300 mb-3">
                            เครื่องจักรต้องได้รับการดูแล! หากสภาพแย่ (0%) เครื่องจะหยุดทำงานทันที
                        </p>
                        <div className="bg-stone-950 p-3 rounded border border-stone-700 flex items-center justify-between gap-4 mb-4">
                            <div className="flex flex-col items-center">
                                <Zap className="text-red-500 animate-pulse" />
                                <span className="text-[10px] text-red-400">0% = STOP</span>
                            </div>
                            <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 w-full opacity-50"></div>
                            </div>
                            <div className="text-xs text-green-400">ซ่อมบำรุงประจำการ์ด</div>
                        </div>

                        {/* Energy Reactor Refill */}
                        <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-500/30 mb-3">
                            <h5 className="text-orange-300 font-bold text-xs mb-2">⚡ Maintenance Service</h5>
                            <ul className="text-[10px] text-stone-400 space-y-1">
                                <li>• สภาพเครื่องเก่าลงตามเวลาใช้งาน</li>
                                <li>• กดปุ่ม <span className="text-yellow-400">⚡ ซ่อมบำรุง</span> บน Rig Card</li>
                                <li>• ค่าใช้จ่าย: <span className="text-green-400">0.05฿ / 1%</span> (ขั้นต่ำ 1฿)</li>
                                <li>• ซ่อมได้ทั้งบางส่วนหรือเต็ม 100%</li>
                            </ul>
                        </div>

                        {/* Battery System */}
                        <div className="bg-cyan-900/20 p-3 rounded-lg border border-cyan-500/30">
                            <h5 className="text-cyan-300 font-bold text-xs mb-2">🔋 Rig Status System</h5>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="flex-1 h-3 bg-stone-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style={{ width: '60%' }}></div>
                                </div>
                                <span className="text-xs text-stone-400">60%</span>
                            </div>
                            <ul className="text-[10px] text-stone-400 space-y-1">
                                <li>• <span className="text-red-400">0-20%</span> = พัง (ต้องซ่อมด่วน!)</li>
                                <li>• <span className="text-yellow-400">21-40%</span> = เก่า (เริ่มลดประสิทธิภาพ)</li>
                                <li>• <span className="text-green-400">41-100%</span> = สมบูรณ์/ปกติ</li>
                                <li>• เครื่องจักรแต่ละแบบค่าดูแลต่างกัน</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-stone-900 p-5 rounded-xl border border-stone-800">
                        <h4 className="font-bold text-yellow-400 mb-2 flex items-center gap-2"><Target size={18} /> รายได้ & ของแถม</h4>
                        <ul className="space-y-3 text-sm text-stone-300">
                            <li className="flex items-start gap-2">
                                <div className="bg-yellow-900/30 p-1 rounded text-yellow-500 mt-0.5"><Coins size={14} /></div>
                                <div>
                                    <strong className="text-white">รายได้หลัก (Profit):</strong> รับเป็นเงินบาท (THB) สะสมได้เรื่อยๆ กดเก็บเมื่อไหร่ก็ได้
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="bg-purple-900/30 p-1 rounded text-purple-500 mt-0.5"><Users size={14} /></div>
                                <div>
                                    <strong className="text-white">Material Found:</strong> ทุกๆ <span className="text-yellow-400 font-bold">20 ชั่วโมง</span> เครื่องจักรจะสุ่มขุดพบ <span className="text-purple-300">กุญแจเข้าเหมือง (Key)</span> หรือวัสดุมีค่า
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEquipment = () => (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-stone-800 pb-2 flex items-center gap-2">
                <Hand className="text-emerald-500" /> อุปกรณ์ & หุ่นยนต์
            </h3>

            <p className="text-stone-400 text-sm">ติดตั้งอุปกรณ์เครื่องจักรและจ้างหุ่นยนต์เพื่อเพิ่มประสิทธิภาพการขุด</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {/* Equipment Type Cards */}
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 hover:border-emerald-500 transition-colors group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform"><Hand /></div>
                        <div className="font-bold text-white">Robot</div>
                    </div>
                    <p className="text-xs text-stone-400">เพิ่มค่า <span className="text-emerald-300">Luck Chance</span> โอกาสพบไอเทมหายาก</p>
                </div>
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 hover:border-blue-500 transition-colors group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"><Target /></div>
                        <div className="font-bold text-white">Sensors</div>
                    </div>
                    <p className="text-xs text-stone-400">เพิ่ม <span className="text-blue-300">Drop Rate</span> แร่ดิบระดับสูง</p>
                </div>
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 hover:border-yellow-500 transition-colors group">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-yellow-900/20 rounded-lg flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform"><Users /></div>
                        <div className="font-bold text-white">Machinery</div>
                    </div>
                    <p className="text-xs text-stone-400">เพิ่มความทนทาน <span className="text-yellow-300">(Durability)</span> ลดค่าเสื่อมสภาพ</p>
                </div>
            </div>

            <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 mt-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Hand size={120} /></div>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative">
                        {/* Visual Upgrade */}
                        <div className="w-32 h-32 bg-stone-900 rounded-2xl border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <Hand size={60} className="text-emerald-400 drop-shadow-lg" />
                            <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg border-2 border-stone-900">+5</div>
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-stone-800 text-[10px] px-3 py-1 rounded-full border border-stone-600 whitespace-nowrap">หุ่นยนต์ AI (Lv.5)</div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <h4 className="text-lg font-bold text-white">ระบบอัปเกรด (Enhancement)</h4>
                        <p className="text-sm text-stone-400">
                            ใช้วัสดุและ <strong>Upgrade Chip</strong> เพื่ออัปเกรดหุ่นยนต์ ยิ่งเลเวลสูง ยิ่งช่วยขุดเก่ง!
                        </p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-stone-900 p-2 rounded border border-stone-800">
                                <div className="text-xs text-stone-500">Tier 1</div>
                                <div className="text-emerald-400 font-bold">+10% Stats</div>
                            </div>
                            <div className="bg-stone-900 p-2 rounded border border-stone-800">
                                <div className="text-xs text-stone-500">Tier 3</div>
                                <div className="text-emerald-400 font-bold">+50% Stats</div>
                            </div>
                            <div className="bg-stone-900 p-2 rounded border border-stone-800 border-dashed border-red-500/50">
                                <div className="text-xs text-red-400">Failure</div>
                                <div className="text-stone-400 text-[10px]">Level Drop*</div>
                            </div>
                        </div>
                        <div className="text-[10px] text-stone-500">* ใช้ใบประกันความเสี่ยง (Insurance Card) เพื่อป้องกันเลเวลลดเมื่อเลื่อนขั้นพลาด</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDungeon = () => (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-stone-800 pb-2 flex items-center gap-2">
                <Skull className="text-red-500" /> สำรวจแหล่งแร่ (Exploration)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DUNGEON_CONFIG.map(d => (
                    <div key={d.id} className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden hover:border-red-500/50 transition-colors group">
                        <div className="h-24 bg-stone-950 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <Skull size={40} className={`transform group-hover:scale-110 transition-transform ${d.id === 3 ? 'text-purple-500' : d.id === 2 ? 'text-blue-400' : 'text-stone-500'}`} />
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-white text-sm mb-1">{d.name}</h4>
                            <div className="text-[10px] text-stone-500 mb-3">{d.description}</div>

                            <div className="flex justify-between items-center text-xs text-stone-300 bg-stone-950 p-2 rounded mb-2">
                                <span>เวลาดำเนินงาน:</span>
                                <span className="text-yellow-400">{d.durationHours} ชม.</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-stone-300 bg-stone-950 p-2 rounded">
                                <span>ค่าบริการ:</span>
                                <div className="flex gap-2">
                                    <span className="text-yellow-400">{d.cost}฿</span>
                                    {d.keyCost && <span className="text-purple-400">+{d.keyCost} Keys</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-red-950/20 p-4 rounded-xl border border-red-500/20 flex gap-4 items-start">
                <AlertTriangle className="text-red-500 shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold text-red-400 text-sm">ข้อควรระวัง!</h4>
                    <p className="text-xs text-stone-400 mt-1">
                        เมื่อส่งเครื่องขุดไปสำรวจในแหล่งแร่ <strong>การผลิตเงินจะหยุดลง</strong> ชั่วคราว จนกว่าจะกลับมา <br />
                        แต่คุณจะได้รับแร่หายาก (Rare Minerals) และกุญแจเข้าเหมืองที่หาไม่ได้จากการขุดปกติ
                    </p>
                </div>
            </div>
        </div>
    );

    const renderCrafting = () => (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-stone-800 pb-2 flex items-center gap-2">
                <Hammer className="text-purple-500" /> โรงงานสกัดแร่ (Workshop)
            </h3>

            {/* Fusion Tree Visual */}
            <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 bg-stone-950 rounded-bl-2xl text-[10px] text-stone-500 border-b border-l border-stone-800">
                    Material Processing System
                </div>

                <div className="flex flex-col items-center w-full max-w-lg">
                    {/* Base Materials */}
                    <div className="flex justify-center gap-8 mb-4 w-full">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-stone-800/50 rounded-2xl flex items-center justify-center border border-stone-600 mb-2 relative shadow-xl">
                                <MaterialIcon id={1} size="w-12 h-12" />
                                <span className="absolute -bottom-1 -right-1 bg-stone-900 text-[10px] px-2 py-0.5 rounded-lg border border-stone-700 font-bold text-white">x2</span>
                            </div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{getLocalized(MATERIAL_CONFIG.NAMES[1 as keyof typeof MATERIAL_CONFIG.NAMES])}</span>
                        </div>
                    </div>

                    {/* Lines */}
                    <div className="relative h-12 w-1/2 border-t-2 border-r-2 border-l-2 border-stone-600 rounded-t-xl rotate-180 -mt-2 mb-2"></div>
                    <div className="absolute top-[130px] bg-stone-900 border border-stone-600 rounded-full p-2 z-10">
                        <RefreshCw size={16} className="text-yellow-500 animate-spin-slow" />
                    </div>

                    {/* Result */}
                    <div className="flex flex-col items-center pt-6">
                        <div className="w-20 h-20 bg-orange-900/20 rounded-3xl flex items-center justify-center border-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.3)] animate-pulse overflow-hidden">
                            <MaterialIcon id={2} size="w-16 h-16" />
                        </div>
                        <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600 mt-2">{getLocalized(MATERIAL_CONFIG.NAMES[2 as keyof typeof MATERIAL_CONFIG.NAMES])} (Tier 2)</span>
                    </div>
                </div>

                <p className="text-center text-xs text-stone-400 mt-8 max-w-sm">
                    <strong>การสกัดแร่ (Extraction):</strong> รวมวัสดุระดับต่ำ 2 ชิ้น + เงินค่าธรรมเนียม เพื่อให้ได้วัสดุระดับสูงขึ้น 1 ชิ้น <br />
                    (ใช้ <strong>โต๊ะช่างสกัดแร่</strong> ในการดำเนินการ)
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
                    <h4 className="font-bold text-white mb-2">🏭 คราฟต์เครื่องจักร</h4>
                    <p className="text-xs text-stone-400">
                        เก็บสะสมวัสดุเพื่อผลิตเครื่องจักรระดับสูงโดยไม่ต้องใช้เงินซื้อ <br />
                        ยิ่งเครื่องระดับสูง ยิ่งต้องใช้แร่หายากจากกิจกรรมสำรวจ
                    </p>
                </div>
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
                    <h4 className="font-bold text-white mb-2">🧪 คราฟต์ไอเทม</h4>
                    <p className="text-xs text-stone-400">
                        สร้าง `Sensors` หรือ `Automation` จากวัสดุ <br />
                        อุปกรณ์ที่สร้างจะมีค่า Stat สุ่ม (ระดับ Common - Legendary)
                    </p>
                </div>
            </div>
        </div>
    );

    const renderEconomy = () => (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-stone-800 pb-2 flex items-center gap-2">
                <Coins className="text-yellow-500" /> ตลาด & การเงิน (Economy)
            </h3>

            {/* Tax Flow */}
            <div className="bg-stone-900 p-6 rounded-xl border border-stone-800 flex flex-col items-center">
                <h4 className="text-sm font-bold text-stone-300 mb-6">กลไกตลาดและภาษี (Market Mechanism)</h4>

                <div className="flex items-center gap-2 sm:gap-6 w-full justify-center overflow-x-auto pb-2">
                    {/* Sell Price */}
                    <div className="flex flex-col items-center bg-stone-950 p-4 rounded-lg border border-stone-700 min-w-[100px]">
                        <div className="text-xs text-stone-500 mb-1">ราคาขาย</div>
                        <div className="text-xl font-mono text-white">100 ฿</div>
                    </div>

                    <ArrowRight className="text-stone-600" />

                    {/* Tax Logic */}
                    <div className="flex flex-col items-center bg-red-950/30 p-4 rounded-lg border border-red-500/30 min-w-[120px] relative">
                        <div className="absolute -top-3 bg-red-600 text-[10px] text-white px-2 rounded-full">TAX 5%</div>
                        <div className="text-xs text-red-400 mb-1">หักภาษี</div>
                        <div className="text-xl font-mono text-red-300">-5 ฿</div>
                        <div className="text-[10px] text-stone-500 mt-1">*ลดได้ด้วย VIP</div>
                    </div>

                    <ArrowRight className="text-stone-600" />

                    {/* Net */}
                    <div className="flex flex-col items-center bg-green-950/30 p-4 rounded-lg border border-green-500/50 min-w-[120px] scale-110 shadow-lg shadow-green-900/20">
                        <div className="text-xs text-green-400 mb-1">ได้รับสุทธิ</div>
                        <div className="text-2xl font-mono text-green-400 font-bold">95 ฿</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
                    <h4 className="font-bold text-emerald-400 mb-2">📥 การฝากเงิน (Deposit)</h4>
                    <ol className="text-xs text-stone-300 list-decimal list-inside space-y-2">
                        <li>ไปที่หน้า Dashboard {'>'} เลือกเมนูฝากเงิน</li>
                        <li>ระบุจำนวนเงินที่ต้องการ</li>
                        <li>สแกน QR Code เพื่อโอนเงิน</li>
                        <li><strong>สำคัญ:</strong> อัปโหลดสลิปเพื่อยืนยัน</li>
                        <li>ระบบตรวจสอบอัตโนมัติ เงินเข้าทันที!</li>
                    </ol>
                </div>
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
                    <h4 className="font-bold text-red-400 mb-2">📤 การถอนเงิน (Withdraw)</h4>
                    <ol className="text-xs text-stone-300 list-decimal list-inside space-y-2">
                        <li>ไปที่หน้า Dashboard {'>'} เลือกเมนูถอนเงิน</li>
                        <li>อัปโหลด QR รับเงินของคุณ (ครั้งแรก)</li>
                        <li>ระบุจำนวนเงินถอน (มีค่าธรรมเนียม 5%)</li>
                        <li>รอแอดมินอนุมัติและโอนเงินเข้าบัญชี</li>
                    </ol>
                </div>
            </div>
        </div>
    );

    const renderSystems = () => (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-stone-800 pb-2 flex items-center gap-2">
                <Target className="text-pink-500" /> ระบบเสริม (Systems)
            </h3>

            {/* VIP Table */}
            <div className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-700 to-yellow-900 p-4 flex items-center gap-3">
                    <Crown className="text-white" />
                    <h4 className="font-bold text-white">VIP Privileges</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-stone-400">
                        <thead className="bg-stone-950 text-stone-200 uppercase text-xs">
                            <tr>
                                <th className="p-3">Level</th>
                                <th className="p-3">ยอดเติมสะสม</th>
                                <th className="p-3">สิทธิพิเศษ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800">
                            {VIP_TIERS.map((tier) => (
                                <tr key={tier.level} className="hover:bg-stone-800/50">
                                    <td className="p-3 font-bold text-yellow-500">VIP {tier.level}</td>
                                    <td className="p-3">{tier.minExp.toLocaleString()} ฿</td>
                                    <td className="p-3 text-white">{tier.perk}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 hover:border-pink-500 transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-pink-400 font-bold">
                        <Target size={18} /> ภารกิจ (Missions)
                    </div>
                    <p className="text-xs text-stone-400">
                        ทำภารกิจรายวันให้สำเร็จเพื่อรับแต้มสะสม <br />
                        แต้มสามารถแลกเป็นกล่องสุ่มหรือเงินรางวัลได้
                    </p>
                </div>
                <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 hover:border-purple-500 transition-colors">
                    <div className="flex items-center gap-2 mb-2 text-purple-400 font-bold">
                        <Trophy size={18} /> อันดับ (Leaderboard)
                    </div>
                    <p className="text-xs text-stone-400">
                        แข่งกันรวย! ผู้ที่มียอด Net Worth สูงสุดประจำซีซั่น <br />
                        จะได้รับรางวัลพิเศษและบัฟถาวร
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4">
            <div className="bg-stone-950 border border-stone-800 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">

                {/* Header */}
                <div className="bg-stone-900 p-4 border-b border-stone-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-2.5 rounded-xl text-white shadow-lg shadow-yellow-900/20">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white">คู่มือเกม (Game Guide)</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded">v2.0</span>
                                <p className="text-xs text-stone-500">ข้อมูลครบถ้วนทุกระบบ</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-800 text-stone-400 hover:bg-red-600 hover:text-white transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-16 lg:w-64 bg-stone-900/30 border-r border-stone-800 flex flex-col overflow-y-auto custom-scrollbar shrink-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`p-4 flex items-center gap-3 transition-all border-l-4 group relative ${activeTab === tab.id ? 'bg-stone-800 border-yellow-500 text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]' : 'border-transparent text-stone-500 hover:bg-stone-900 hover:text-stone-300'}`}
                            >
                                <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110 text-yellow-500' : 'group-hover:scale-110'}`}>{tab.icon}</span>
                                <span className={`hidden lg:block text-sm font-bold text-left ${activeTab === tab.id ? 'text-white' : ''}`}>{tab.label}</span>
                                {activeTab === tab.id && <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none"></div>}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed">
                        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'mining' && renderMining()}
                            {activeTab === 'equipment' && renderEquipment()}
                            {activeTab === 'dungeon' && renderDungeon()}
                            {activeTab === 'crafting' && renderCrafting()}
                            {activeTab === 'economy' && renderEconomy()}
                            {activeTab === 'systems' && renderSystems()}
                        </div>

                        {/* Footer Hint */}
                        <div className="mt-8 pt-6 border-t border-stone-800/50 text-center">
                            <p className="text-[10px] text-stone-600 flex items-center justify-center gap-1">
                                <HelpCircle size={10} /> มีคำถามเพิ่มเติม? ติดต่อ Admin ได้ตลอด 24 ชม.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
