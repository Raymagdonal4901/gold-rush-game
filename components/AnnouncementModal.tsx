import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldCheck, Gem, Pickaxe } from 'lucide-react';

export const AnnouncementModal: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show immediately on mount
        setIsVisible(true);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-stone-900 border-2 border-yellow-500/50 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.2)] overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header Pattern */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>

                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors z-20"
                >
                    <X size={24} />
                </button>

                <div className="p-6 md:p-8 relative">
                    {/* Title Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 text-xs font-bold uppercase tracking-widest mb-4">
                            <AlertTriangle size={12} />
                            Critical Update
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">
                            🚧 ประกาศปิดปรับปรุงระบบ <br />
                            <span className="text-stone-400 text-lg md:text-xl">ส่งท้าย CBT ต้อนรับ OBT! 🚧</span>
                        </h2>
                        <div className="w-24 h-1 bg-stone-800 mx-auto rounded-full mt-4"></div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6 text-stone-300">
                        <p className="leading-relaxed text-center">
                            สวัสดีครับนักขุด! เนื่องจากเราเจอ Bug บางส่วนที่ต้องรีบแก้ด่วน เพื่อความเสถียรของเกม
                            <span className="text-red-400 font-bold block mt-1">ทางทีมงานขออนุญาตปิดระบบ Close Beta ณ ตอนนี้ครับ</span>
                        </p>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                            <p className="font-bold text-yellow-400 uppercase tracking-wide text-sm mb-1">✨ เตรียมพบกับ Open Beta เวอร์ชันสมบูรณ์ ✨</p>
                            <p className="text-2xl font-black text-white">วันนี้ 13.00 น.!</p>
                        </div>

                        {/* Feature Highlight: Permanent Items */}
                        <div className="relative bg-gradient-to-br from-stone-800 to-black border border-stone-700 p-4 rounded-xl overflow-hidden group">
                            {/* Decorative Glow */}
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/20 blur-2xl rounded-full group-hover:bg-green-500/30 transition-all"></div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-16 h-16 bg-stone-900 rounded-lg flex items-center justify-center border border-stone-600 shadow-inner shrink-0 relative">
                                    <Gem size={32} className="text-green-400" />
                                    <div className="absolute -bottom-2 inset-x-0 bg-green-600 text-white text-[8px] font-black uppercase text-center py-0.5 tracking-widest">
                                        Permanent
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white">🔥 อัปเดตใหญ่ที่รอคอย</h3>
                                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase">New</span>
                                    </div>
                                    <p className="text-sm text-stone-400">
                                        ยกเลิกระบบ <span className="text-red-400 line-through decoration-red-500">ไอเทมมีวันหมดอายุ</span> ❌ <br />
                                        เปลี่ยนเป็น <span className="text-green-400 font-bold">"ไอเทมถาวร"</span> ✅ <br />
                                        <span className="text-xs text-stone-500">ซื้อครั้งเดียวใช้ยาวๆ ตลอดชีพ!</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Refund Note */}
                        <div className="text-sm bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                            <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                                <ShieldCheck size={16} />
                                แจ้งเรื่องการชดเชย (Refund)
                            </h4>
                            <p className="text-stone-400 leading-relaxed mb-3">
                                ใครที่เติมเงินเข้ามาแล้ว ทักแชท Line Official ด่วน! พิมพ์แจ้งชื่อ ID มาได้เลยครับ
                                เดฟจะ <span className="text-white font-bold">คืนเงินเติมให้ครบ 100%</span> + <span className="text-yellow-400 font-bold">โบนัสค่าเสียเวลา</span> ให้ด้วยครับ รับรองว่าคุ้มแน่นอน!
                            </p>
                            <a
                                href="https://line.me/ti/g2/d_jd00pEBf2EKWFyQdkrc2B3FgpwUpZv_ghT0w"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-center py-2 rounded-lg transition-colors shadow-lg shadow-green-500/20"
                            >
                                ติดต่อ Line Official
                            </a>
                        </div>

                        <p className="text-xs text-center text-stone-500 italic">
                            ขออภัยที่ทำให้ขัดจังหวะการขุดครับ แต่รับรองว่าเวอร์ชันใหม่ ไฉไลกว่าเดิมแน่นอน ขอบคุณครับ! 🙏⛏️
                        </p>
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="w-full mt-6 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-300 font-bold py-3 rounded-xl transition-all"
                    >
                        รับทราบ (Acknowledge)
                    </button>
                </div>
            </div>
        </div>
    );
};
