import React from 'react';
import { X, AlertTriangle, Gift, Wallet, RefreshCw } from 'lucide-react';

interface ServerResetAnnouncementProps {
    onClose: () => void;
}

export const ServerResetAnnouncement: React.FC<ServerResetAnnouncementProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-stone-900 border-2 border-yellow-600/50 w-full max-w-lg rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.2)] overflow-hidden relative flex flex-col max-h-[90vh]">

                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-yellow-900/40 via-yellow-800/40 to-yellow-900/40 p-6 text-center border-b border-yellow-600/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-500/50 shadow-lg shadow-yellow-500/20 animate-bounce-slow">
                            <AlertTriangle size={32} className="text-yellow-400" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm uppercase tracking-wider">
                            ประกาศ Reset Server
                        </h2>
                        <p className="text-yellow-500/80 text-sm font-bold mt-1">พร้อมชดเชยรางวัล!</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-stone-950/50">

                    <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800 text-center">
                        <p className="text-stone-300 leading-relaxed text-sm">
                            ต้องขออภัยเพื่อนๆ นักขุดทุกท่านด้วยนะครับ ตอนนี้ผมได้ทำการ <span className="text-red-400 font-bold">รีเซ็ตเซิร์ฟเวอร์ใหม่</span> เพื่อแก้ปัญหาต่างๆ ข้อมูลเก่าจะหายหมดนะครับ แต่ไม่ต้องห่วง!
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4 items-start bg-blue-900/10 p-4 rounded-xl border border-blue-900/30">
                            <div className="bg-blue-900/20 p-2 rounded-lg text-blue-400 shrink-0">
                                <RefreshCw size={24} />
                            </div>
                            <div>
                                <h3 className="text-blue-400 font-bold mb-1">👉 สิ่งที่ต้องทำ</h3>
                                <p className="text-stone-400 text-sm">สมัคร ID ใหม่ได้เลย (ใช้ชื่อเดิมก็ได้ครับ)</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start bg-emerald-900/10 p-4 rounded-xl border border-emerald-900/30 relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 bg-emerald-500/10 w-24 h-24 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors"></div>

                            <div className="bg-emerald-900/20 p-2 rounded-lg text-emerald-400 shrink-0 relative z-10">
                                <Gift size={24} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-emerald-400 font-bold mb-2">💰 การชดเชย</h3>
                                <ul className="space-y-2 text-sm text-stone-300">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                        ทุกคนรับ <span className="text-yellow-400 font-bold">เครื่องขุดฟรี 3 วัน!</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5"></span>
                                        <span>
                                            ใครที่เคยซื้อเครื่องขุดไปแล้ว ผม <span className="text-emerald-400 font-bold decoration-emerald-500/50 underline">คืนเงินให้เต็มจำนวน</span> + แถมค่าทำขวัญให้อีก <span className="text-yellow-400 font-bold">100 บาท</span> ครับ
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-stone-900 to-stone-800 p-4 rounded-xl border border-stone-700 flex items-center gap-3 shadow-lg">
                        <div className="bg-stone-950 p-2 rounded-full border border-stone-700 shadow-inner">
                            <Wallet size={20} className="text-stone-400" />
                        </div>
                        <p className="text-stone-400 text-xs leading-relaxed italic">
                            ตอนนี้ระบบฝาก-ถอนกลับมาปกติแล้ว แถมเพิ่มช่องทาง <span className="text-emerald-400 font-bold not-italic">USDT (BSC)</span> ให้ด้วย ขอให้สนุกกับการขุดนะครับ! 🚀
                        </p>
                    </div>

                </div>

                {/* Footer Action */}
                <div className="p-4 bg-stone-900 border-t border-stone-800">
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-stone-900 font-bold py-3.5 rounded-xl shadow-lg shadow-yellow-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 font-display tracking-wide text-lg"
                    >
                        <span>รับทราบ (ACKNOWLEDGE)</span>
                        <ArrowRight size={20} />
                    </button>
                </div>

            </div>
        </div>
    );
};

// Internal Import for ArrowRight (fixing missing import)
import { ArrowRight } from 'lucide-react';
