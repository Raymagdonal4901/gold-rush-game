import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Rocket, ShieldCheck, Users, Mail, Zap, ChevronRight } from 'lucide-react';

const EXPIRATION_DATE = new Date('2026-02-18T03:03:58+07:00').getTime();

export const AnnouncementModal: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const now = Date.now();
        // Only show if haven't acknowledged it yet AND within the 48h window
        const hasSeen = localStorage.getItem('announcement_gold_rush_2_0_seen');
        if (now < EXPIRATION_DATE && !hasSeen) {
            setIsVisible(true);
        }
    }, []);

    const handleAcknowledge = () => {
        localStorage.setItem('announcement_gold_rush_2_0_seen', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
            <div className="relative w-full max-w-2xl bg-stone-900 border-2 border-yellow-500/50 rounded-2xl shadow-[0_0_80px_rgba(234,179,8,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                {/* Header Pattern */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 z-30"></div>

                {/* Close Button */}
                <button
                    onClick={handleAcknowledge}
                    className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors z-30 bg-black/50 p-1 rounded-full"
                >
                    <X size={20} />
                </button>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
                    {/* Title Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 text-xs font-black uppercase tracking-widest mb-4 animate-pulse">
                            <Rocket size={14} />
                            Major Update
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                            ⚠️ ประกาศสำคัญ <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                                Gold Rush 2.0: The New Era 🚀
                            </span>
                        </h2>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 text-stone-200">
                        <div className="text-center space-y-2">
                            <p className="text-lg font-bold text-white">ถึง เหล่านักขุดทุกท่าน,</p>
                            <p className="text-stone-400 leading-relaxed">
                                ทีมงานขอแจ้งปิดปรับปรุงเซิร์ฟเวอร์ชั่วคราว เพื่อทำการอัปเกรดระบบครั้งใหญ่ที่สุด (Major Update)
                                โดยมีเป้าหมายเพื่อยกระดับเกมให้มีความเป็นมืออาชีพ มั่นคง และรองรับการสร้างรายได้ในระยะยาวอย่างยั่งยืน
                            </p>
                        </div>

                        {/* Patch Notes Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-stone-800/50 border border-stone-700 p-4 rounded-xl">
                                <h3 className="flex items-center gap-2 font-black text-yellow-500 mb-2 uppercase text-sm">
                                    <Zap size={16} /> ระบบรายได้แบบใหม่
                                </h3>
                                <p className="text-xs text-stone-400 leading-relaxed">
                                    ยกเลิกรายได้แบบตายตัวที่น่าเบื่อ! เปลี่ยนเป็นระบบ <span className="text-white font-bold">"สุ่ม Hashrate"</span>
                                    ให้คุณลุ้นรับ Jackpot และรายได้ที่ผันผวนตามค่าความยากจริง
                                </p>
                            </div>
                            <div className="bg-stone-800/50 border border-stone-700 p-4 rounded-xl">
                                <h3 className="flex items-center gap-2 font-black text-blue-500 mb-2 uppercase text-sm">
                                    <ShieldCheck size={16} /> ความปลอดภัยขั้นสูง
                                </h3>
                                <p className="text-xs text-stone-400 leading-relaxed">
                                    เปลี่ยนระบบล็อกอินเป็น <span className="text-white font-bold">Email & Password</span> เต็มรูปแบบ
                                    ป้องกันการสวมรอยและเตรียมพร้อมสำหรับฟีเจอร์ 2FA
                                </p>
                            </div>
                            <div className="bg-stone-800/50 border border-stone-700 p-4 rounded-xl md:col-span-2">
                                <h3 className="flex items-center gap-2 font-black text-emerald-500 mb-2 uppercase text-sm">
                                    <Users size={16} /> ระบบพันธมิตรเต็มรูปแบบ (Affiliate)
                                </h3>
                                <p className="text-xs text-stone-400 leading-relaxed">
                                    เปิดโอกาสให้คุณสร้าง Passive Income อย่างแท้จริง! <br />
                                    • รับทันที <span className="text-emerald-400 font-bold">3%</span> จากยอดซื้อเครื่องขุดของเพื่อน <br />
                                    • รับต่อเนื่อง <span className="text-emerald-400 font-bold">1%</span> จากยอดการ "เก็บผลผลิต (Claim)" ของเพื่อน ตลอดชีพ!
                                </p>
                            </div>
                        </div>

                        {/* Server Wipe Alert */}
                        <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-xl flex gap-4 items-start">
                            <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
                            <div>
                                <h4 className="font-black text-red-500 uppercase text-sm mb-1">⚠️ ประกาศเรื่องการ Reset ข้อมูล (Server Wipe)</h4>
                                <p className="text-xs text-stone-400 leading-relaxed">
                                    เนื่องจากการเปลี่ยนโครงสร้างฐานข้อมูล ทีมงานจำเป็นต้องทำการรีเซ็ตข้อมูลผู้เล่นทั้งหมด
                                    <span className="text-white font-bold"> (Hard Reset) </span> เพื่อเริ่มระบบใหม่พร้อมกันเพื่อความปลอดภัยสูงสุด
                                </p>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-stone-800/30 border border-stone-700 p-5 rounded-xl">
                            <h4 className="font-bold text-white mb-3">📌 สิ่งที่ต้องทำเมื่อเปิดเซิร์ฟ:</h4>
                            <ul className="space-y-2 text-xs text-stone-300">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                    ทำการสมัครสมาชิกใหม่ (Register) ด้วยอีเมล
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                    หา "Referral Code" จากเพื่อนมาใส่ตอนสมัคร เพื่อรับสิทธิพิเศษ!
                                </li>
                            </ul>
                        </div>

                        <div className="text-center space-y-1">
                            <p className="text-stone-400 text-sm italic">"ทีมงานขออภัยในความไม่สะดวก แต่รากฐานใหม่นี้จะทำให้เกมเติบโตไปได้อีกไกล"</p>
                            <p className="text-white font-black uppercase tracking-widest text-sm pt-4">ทีมงาน Gold Rush</p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-stone-800/50 border-t border-stone-800">
                    <button
                        onClick={handleAcknowledge}
                        className="group w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        รับทราบและเตรียมตัวสู่ยุคใหม่
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-[10px] text-center text-stone-600 mt-4 uppercase font-bold tracking-widest">
                        ประกาศนี้จะแสดงจนถึงวันที่ 18 ก.พ. 03:03 น.
                    </p>
                </div>
            </div>
        </div>
    );
};
