
import React from 'react';
import { X, Pickaxe, Hammer, ShoppingBag, Gem, RefreshCw, Wrench, Coins, TowerControl, Package, Zap, Bot, ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { CURRENCY } from '../constants';
import { MaterialIcon } from './MaterialIcon';

interface GiftSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GiftSystemModal: React.FC<GiftSystemModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Render Helpers
  const renderRigIcon = (id: number) => {
    switch (id) {
      case 1: return (
          <div className="w-16 h-16 rounded-full border-2 bg-gradient-to-br from-stone-800 to-black border-stone-600 text-stone-400 shadow-lg flex items-center justify-center"><Pickaxe size={32} /></div>
        );
      case 2: return (
          <div className="w-16 h-16 rounded-full border-2 bg-gradient-to-br from-orange-900 to-stone-900 border-orange-600 text-orange-500 shadow-lg flex items-center justify-center"><Zap size={32} /></div> // Changed from Cable to Zap for consistency
        );
      case 3: return (
          <div className="w-16 h-16 rounded-full border-2 bg-gradient-to-br from-slate-600 to-slate-900 border-slate-400 text-slate-200 shadow-lg flex items-center justify-center"><Hammer size={32} /></div>
        );
      case 4: return (
          <div className="w-16 h-16 rounded-full border-2 bg-gradient-to-br from-yellow-700 via-yellow-900 to-stone-900 border-yellow-500 text-yellow-400 shadow-lg flex items-center justify-center"><Coins size={32} /></div>
        );
      case 5: return (
          <div className="w-16 h-16 rounded-full border-2 bg-gradient-to-br from-cyan-900 via-blue-900 to-stone-900 border-cyan-400 text-cyan-300 shadow-lg flex items-center justify-center"><TowerControl size={32} /></div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-stone-950 border border-yellow-600/30 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-800 bg-stone-900 flex justify-between items-center shrink-0">
            <div>
                <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
                    คู่มือระบบเกม (Game Guide)
                </h2>
                <p className="text-stone-400 text-sm">รายละเอียดระบบการเล่นทั้งหมด</p>
            </div>
            <button 
                onClick={onClose} 
                className="text-stone-500 hover:text-white transition-colors bg-stone-800 p-2 rounded-full"
            >
                <X size={24} />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            
            {/* 1. MINING RIGS */}
            <section className="bg-stone-900/50 border border-stone-800 rounded-xl p-6 relative overflow-hidden group hover:border-yellow-600/30 transition-colors">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-yellow-600 flex items-center justify-center text-stone-950 shadow-lg shadow-yellow-600/20"><Pickaxe size={24} /></span>
                    1. ระบบเครื่องจักร (MINING RIGS)
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                         <p className="text-stone-300 text-sm leading-relaxed font-medium">
                            หัวใจหลักของเกมคือการลงทุนซื้อเครื่องจักรเพื่อขุดแร่และสร้างรายได้
                         </p>
                         <ul className="space-y-4 text-sm text-stone-400">
                             <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-stone-500 mt-2 shrink-0"></span><span><strong className="text-white">รายได้รายวัน:</strong> เครื่องจักรจะผลิตเงินบาทให้คุณทุกวินาที</span></li>
                             <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-stone-500 mt-2 shrink-0"></span><span><strong className="text-white">อายุสัญญา:</strong> เครื่องจักรมีอายุการใช้งานจำกัด (1-6 เดือน) เมื่อหมดอายุต้องต่อสัญญา</span></li>
                             <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-stone-500 mt-2 shrink-0"></span><span><strong className="text-white">การซ่อมแซม:</strong> ทุกๆ 15 วัน เครื่องจักรจะชำรุด ต้องจ่ายค่าซ่อมเพื่อใช้งานต่อ</span></li>
                         </ul>
                    </div>
                    <div className="bg-stone-950 rounded-xl border border-stone-800 p-8 flex items-center justify-center relative overflow-hidden shadow-inner">
                         <div className="absolute right-[-20px] top-[-20px] text-stone-800 opacity-20 pointer-events-none transform rotate-12"><Hammer size={180} /></div>
                         <div className="relative z-10 flex items-center justify-center gap-2 w-full max-w-sm">
                             <div className="flex flex-col items-center gap-3 relative group/step"><div className="w-16 h-16 rounded-full border-2 border-yellow-600/30 bg-stone-900 flex items-center justify-center text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)] group-hover/step:border-yellow-500 transition-colors"><Coins size={28} /></div><span className="text-xs text-stone-500 font-bold uppercase tracking-wider group-hover/step:text-yellow-500 transition-colors">ลงทุนซื้อ</span></div>
                             <div className="h-px bg-stone-800 flex-1 mb-7"></div>
                             <div className="flex flex-col items-center gap-3 relative group/step"><div className="w-16 h-16 rounded-full border-2 border-blue-600/30 bg-stone-900 flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover/step:border-blue-500 transition-colors"><RefreshCw size={28} /></div><span className="text-xs text-stone-500 font-bold uppercase tracking-wider group-hover/step:text-blue-500 transition-colors">ผลิตเงิน</span></div>
                             <div className="h-px bg-stone-800 flex-1 mb-7"></div>
                             <div className="flex flex-col items-center gap-3 relative group/step"><div className="w-16 h-16 rounded-full border-2 border-orange-600/30 bg-stone-900 flex items-center justify-center text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)] group-hover/step:border-orange-500 transition-colors"><Wrench size={28} /></div><span className="text-xs text-stone-500 font-bold uppercase tracking-wider group-hover/step:text-orange-500 transition-colors">ซ่อมบำรุง</span></div>
                         </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[1,2,3,4,5].map(id => (
                        <div key={id} className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col items-center text-center gap-2 hover:bg-stone-900 transition-colors">
                            {renderRigIcon(id)}
                            <div className="text-xs font-bold text-stone-300 uppercase tracking-wider mt-1">Lvl {id}</div>
                            <div className="text-[10px] text-stone-500">{id === 1 ? 'ถ่านหิน' : id === 2 ? 'ทองแดง' : id === 3 ? 'เหล็ก' : id === 4 ? 'ทองคำ' : 'เพชร'}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. MATERIAL DROPS */}
            <section className="bg-stone-900/50 border border-stone-800 rounded-xl p-6 relative overflow-hidden group hover:border-emerald-600/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Gem size={120} /></div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white"><Gem size={18} /></span>2. ระบบวัตถุดิบ (Material Drops)</h3>
                <p className="text-stone-300 text-sm mb-6">เครื่องจักรมีโอกาส <strong className="text-yellow-500 bg-yellow-900/20 px-1 rounded">1%</strong> ที่จะดรอปแร่ดิบทุกวัน สะสมให้ครบเพื่อผสมหรือขาย</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center hover:border-stone-600 transition-colors"><div className="flex justify-center mb-3"><MaterialIcon id={1} size="w-10 h-10" iconSize={20} /></div><div className="text-sm font-bold text-stone-300">ถ่านหิน</div><div className="text-xs text-emerald-500 font-mono mt-1">1.0 {CURRENCY}</div></div>
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center hover:border-orange-900 transition-colors"><div className="flex justify-center mb-3"><MaterialIcon id={2} size="w-10 h-10" iconSize={20} /></div><div className="text-sm font-bold text-orange-400">ทองแดง</div><div className="text-xs text-emerald-500 font-mono mt-1">2.0 {CURRENCY}</div></div>
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center hover:border-slate-600 transition-colors"><div className="flex justify-center mb-3"><MaterialIcon id={3} size="w-10 h-10" iconSize={20} /></div><div className="text-sm font-bold text-slate-300">เหล็ก</div><div className="text-xs text-emerald-500 font-mono mt-1">3.0 {CURRENCY}</div></div>
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center hover:border-yellow-900 transition-colors"><div className="flex justify-center mb-3"><MaterialIcon id={4} size="w-10 h-10" iconSize={20} /></div><div className="text-sm font-bold text-yellow-400">ทองคำ</div><div className="text-xs text-emerald-500 font-mono mt-1">4.0 {CURRENCY}</div></div>
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center hover:border-cyan-900 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.05)]"><div className="flex justify-center mb-3"><MaterialIcon id={5} size="w-10 h-10" iconSize={20} /></div><div className="text-sm font-bold text-cyan-300">เพชร</div><div className="text-xs text-emerald-500 font-mono mt-1">5.0 {CURRENCY}</div></div>
                </div>
            </section>

            {/* 3. ENERGY SYSTEM (NEW) */}
            <section className="bg-stone-900/50 border border-stone-800 rounded-xl p-6 relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={120} /></div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center text-white"><Zap size={18} /></span>3. ระบบพลังงาน (Energy System)</h3>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                        <p className="text-stone-300 text-sm">การขุดเหมืองต้องใช้พลังงานไฟฟ้า หากพลังงานหมด (0%) เครื่องจักรทั้งหมดจะหยุดทำงานทันที</p>
                        <div className="bg-stone-950 p-4 rounded-lg border border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-red-900/20 text-red-500 flex items-center justify-center font-bold">-2%</div><span>ลดลง 2% ต่อชั่วโมง (ต่อเครื่อง)</span></div>
                            <div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-orange-900/20 text-orange-500 flex items-center justify-center font-bold"><Zap size={16} /></div><span>เติมพลังงานได้ที่หน้าแดชบอร์ด</span></div>
                        </div>
                    </div>
                    <div className="w-full md:w-64 bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col items-center text-center gap-2">
                        <span className="text-stone-500 text-xs font-bold uppercase">ค่าไฟ (Electric Bill)</span>
                        <div className="text-2xl font-mono font-bold text-orange-400">0.02 {CURRENCY}</div>
                        <span className="text-[10px] text-stone-600">ต่อพลังงาน 1%</span>
                    </div>
                </div>
            </section>

            {/* 4. AI ROBOT & AUTOMATION (NEW) */}
            <section className="bg-stone-900/50 border border-stone-800 rounded-xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Bot size={120} /></div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center text-white"><Bot size={18} /></span>4. หุ่นยนต์ AI & ระบบอัตโนมัติ</h3>
                <div className="flex gap-6 items-center">
                    <div className="hidden sm:block w-32 h-32 relative shrink-0">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative z-10 w-full h-full flex items-center justify-center bg-stone-950 rounded-full border-2 border-purple-500 text-purple-400"><Bot size={64} /></div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <p className="text-stone-300 text-sm">ผู้ช่วยอัจฉริยะที่จะทำงานแทนคุณตลอด 24 ชั่วโมง โดยมีหน้าที่หลักดังนี้:</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <li className="bg-stone-950 p-3 rounded border border-stone-800 flex flex-col gap-2 text-center items-center"><Package size={20} className="text-emerald-500" /><span className="text-xs font-bold text-stone-300">เก็บวัตถุดิบอัตโนมัติ</span></li>
                            <li className="bg-stone-950 p-3 rounded border border-stone-800 flex flex-col gap-2 text-center items-center"><Wrench size={20} className="text-orange-500" /><span className="text-xs font-bold text-stone-300">ซ่อมเครื่องจักรอัตโนมัติ</span></li>
                            <li className="bg-stone-950 p-3 rounded border border-stone-800 flex flex-col gap-2 text-center items-center"><Zap size={20} className="text-yellow-500" /><span className="text-xs font-bold text-stone-300">จ่ายค่าไฟอัตโนมัติ</span></li>
                        </ul>
                        <div className="text-[10px] text-stone-500 text-right">*หุ่นยนต์มีอายุการใช้งาน 30 วัน สามารถซื้อได้ที่ร้านค้าอุปกรณ์</div>
                    </div>
                </div>
            </section>

            {/* 5. GIFT BOXES & ACCESSORIES */}
            <section className="bg-stone-900/50 border border-stone-800 rounded-xl p-6 relative overflow-hidden group hover:border-blue-600/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShoppingBag size={120} /></div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white"><ShoppingBag size={18} /></span>5. อุปกรณ์เสริม & กล่องของขวัญ</h3>
                <div className="flex flex-col gap-4 text-sm text-stone-300">
                    <p>
                        <strong>กล่องของขวัญ:</strong> ได้รับเมื่อซื้อเครื่องจักรใหม่ หรือครบกำหนด 30 วัน ภายในบรรจุอุปกรณ์สวมใส่แบบสุ่ม
                    </p>
                    <p>
                        <strong>กุญแจไขหีบ (Key):</strong> จำเป็นต้องใช้กุญแจในการเปิดกล่อง หาซื้อได้ในร้านค้า (ราคา 5 บาท)
                    </p>
                    <p>
                        <strong>อุปกรณ์เสริม:</strong> ช่วยเพิ่มโบนัสรายได้ให้กับเหมืองทุกเครื่อง มีระดับความหายากตั้งแต่ Common ถึง Legendary
                    </p>
                </div>
            </section>

            {/* 6. FINANCIAL */}
            <section className="bg-stone-900/50 border border-stone-800 rounded-xl p-6 relative overflow-hidden group hover:border-emerald-600/30 transition-colors">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white"><Wallet size={18} /></span>6. ธุรกรรมการเงิน</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-stone-950 p-4 rounded-lg border border-stone-800 flex items-start gap-3">
                        <ArrowDownLeft className="text-emerald-500 shrink-0" />
                        <div><h4 className="font-bold text-emerald-400 text-sm">การฝากเงิน</h4><p className="text-xs text-stone-500 mt-1">โอนผ่าน QR Code และแนบสลิป รอตรวจสอบโดยผู้ดูแลระบบ</p></div>
                    </div>
                    <div className="bg-stone-950 p-4 rounded-lg border border-stone-800 flex items-start gap-3">
                        <ArrowUpRight className="text-red-500 shrink-0" />
                        <div><h4 className="font-bold text-red-400 text-sm">การถอนเงิน</h4><p className="text-xs text-stone-500 mt-1">ถอนเข้าบัญชีที่ผูกไว้ (QR) มีค่าธรรมเนียม 5% เงินเข้าช่วง 22.00-00.00 น.</p></div>
                    </div>
                </div>
            </section>

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-900 border-t border-stone-800">
            <button 
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-stone-950 font-bold text-lg rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] font-display uppercase tracking-widest"
            >
                ปิดหน้าต่าง
            </button>
        </div>
      </div>
    </div>
  );
};
