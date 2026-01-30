
import React, { useState } from 'react';
import { X, TestTube2, CheckCircle2, Zap, Gift, Wrench, RefreshCw, Factory, Bot, Play } from 'lucide-react';
import { MockDB } from '../services/db';
import { User } from '../types';

interface DevToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onRefresh: () => void;
}

export const DevToolsModal: React.FC<DevToolsModalProps> = ({ isOpen, onClose, user, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleMasterSetup = () => {
    setLoading(true);
    setTimeout(() => {
        MockDB.devTools.masterSetup(user.id);
        setSuccessMsg("ดำเนินการจำลองสถานการณ์เรียบร้อย!");
        onRefresh();
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-stone-950 border-2 border-red-900/50 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-red-950/20 p-5 border-b border-red-900/30 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-red-900/20 p-2 rounded text-red-500">
                    <TestTube2 size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-white">ระบบทดสอบ (DevTools)</h2>
                    <p className="text-xs text-red-400 uppercase tracking-wider">สำหรับนักพัฒนา / ทดสอบระบบ</p>
                </div>
            </div>
            <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="p-6">
            
            {successMsg ? (
                <div className="bg-emerald-900/20 border border-emerald-900/50 p-6 rounded-xl text-center animate-in zoom-in">
                    <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">เสร็จสิ้น!</h3>
                    <p className="text-stone-400 mb-6">{successMsg}</p>
                    <button 
                        onClick={() => { setSuccessMsg(''); onClose(); }}
                        className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-lg font-bold"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-stone-900 p-4 rounded-xl border border-stone-800">
                        <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">สถานะที่จะได้รับ:</h3>
                        <ul className="grid grid-cols-2 gap-3 text-xs text-stone-400">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div> เงิน 1,000,000 บาท</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div> พลังงานเหลือ 5% (รอจ่ายค่าไฟ)</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> เครื่องขุดพัง 1 เครื่อง (รอซ่อม)</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> เครื่องขุดใกล้หมดอายุ (รอต่อสัญญา)</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> เครื่องขุดพร้อมรับของขวัญ 30 วัน</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div> ได้รับเครื่องผสม + ถ่านหิน 10</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div> ได้รับกุญแจไขหีบ</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div> เครื่องขุดมีวัตถุดิบดรอปรอเก็บ</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleMasterSetup}
                        disabled={loading}
                        className="w-full py-6 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-900/20 transform transition-all active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                        {loading ? (
                            <span className="animate-pulse">กำลังประมวลผล...</span>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                <Play size={24} className="fill-white" />
                                <span>เริ่มการจำลองระบบ (One-Click Setup)</span>
                            </>
                        )}
                    </button>

                    <p className="text-[10px] text-stone-600 text-center">
                        หมายเหตุ: การกดปุ่มนี้จะล้างเครื่องขุดเดิมที่มีอยู่ และแทนที่ด้วยเครื่องขุดสำหรับทดสอบ
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
