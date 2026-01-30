

import React, { useState, useEffect } from 'react';
import { X, Backpack, DollarSign, ArrowUpCircle, Cpu, Hammer, HardHat, Glasses, Shirt, Footprints, Smartphone, Monitor, Bot, Truck, ShoppingBag, Sparkles, AlertTriangle, Hourglass } from 'lucide-react';
import { AccessoryItem } from '../types';
import { CURRENCY, RARITY_SETTINGS, UPGRADE_REQUIREMENTS, MATERIAL_CONFIG } from '../constants';
import { MockDB } from '../services/db';
import { InfinityGlove } from './InfinityGlove';
import { MaterialIcon } from './MaterialIcon';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: AccessoryItem[];
  userId: string;
  onRefresh: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, inventory, userId, onRefresh }) => {
  const [selectedItem, setSelectedItem] = useState<AccessoryItem | null>(null);
  const [action, setAction] = useState<'DETAILS' | 'UPGRADE' | 'SELL'>('DETAILS');
  const [msg, setMsg] = useState('');
  
  const [animationStep, setAnimationStep] = useState<'IDLE' | 'PREPARE' | 'HAMMER' | 'IMPACT' | 'RESULT'>('IDLE');
  const [upgradeResult, setUpgradeResult] = useState<{ success: boolean, newItem?: AccessoryItem } | null>(null);

  useEffect(() => {
      if (!isOpen) {
          setSelectedItem(null);
          setAction('DETAILS');
          setAnimationStep('IDLE');
          setUpgradeResult(null);
          setMsg('');
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const rigs = MockDB.getMyRigs(userId);
  const equippedIds = new Set<string>();
  rigs.forEach(r => r.slots?.forEach(s => { if(s) equippedIds.add(s); }));

  const getIcon = (typeId: string, className: string, rarity: any) => {
      switch(typeId) {
          case 'hat': return <HardHat className={className} />;
          case 'glasses': return <Glasses className={className} />;
          case 'uniform': return <Shirt className={className} />;
          case 'bag': return <Backpack className={className} />;
          case 'boots': return <Footprints className={className} />;
          case 'mobile': return <Smartphone className={className} />;
          case 'pc': return <Monitor className={className} />;
          case 'robot': return <Bot className={className} />;
          case 'auto_excavator': return <Truck className={className} />;
          case 'upgrade_chip': return <Cpu className={className} />;
          case 'chest_key': return <span className={`text-xl font-bold ${className}`}>KEY</span>;
          case 'mixer': return <span className={`text-xl font-bold ${className}`}>MIX</span>;
          case 'magnifying_glass': return <span className={`text-xl font-bold ${className}`}>INS</span>;
          case 'hourglass_small':
          case 'hourglass_medium':
          case 'hourglass_large': return <Hourglass className={className} />;
          default: return <InfinityGlove rarity={rarity} className={className} />;
      }
  };

  const handleSell = () => {
      if (!selectedItem) return;
      try {
          const refund = MockDB.sellAccessory(userId, selectedItem.id);
          setMsg(`ขายสำเร็จ! ได้รับ ${refund.toLocaleString()} ${CURRENCY}`);
          setTimeout(() => {
              setMsg('');
              setSelectedItem(null);
              setAction('DETAILS');
              onRefresh();
          }, 1500);
      } catch (e: any) {
          setMsg(e.message);
      }
  };

  const handleUpgrade = () => {
      if (!selectedItem) return;
      setAnimationStep('PREPARE');
      setTimeout(() => {
          try {
              const res = MockDB.upgradeAccessory(userId, selectedItem.id);
              setAnimationStep('HAMMER');
              setTimeout(() => {
                  setAnimationStep('IMPACT');
              }, 1200);
              setTimeout(() => {
                  setUpgradeResult({ success: res.success, newItem: res.newItem });
                  setAnimationStep('RESULT');
                  if (res.success) onRefresh();
              }, 2000);
          } catch (e: any) {
              setMsg(e.message);
              setAnimationStep('IDLE');
          }
      }, 500);
  };

  const resetAfterUpgrade = () => {
      setAnimationStep('IDLE');
      setUpgradeResult(null);
      setAction('DETAILS');
      if (upgradeResult?.success) {
          setSelectedItem(null); 
          onRefresh();
      }
  };

  // Determine upgrade requirements
  let matTier = 1;
  let matAmount = 1;
  let chance = 1.0;
  let isMaxLevel = false;

  if (selectedItem) {
      const currentLevel = selectedItem.level || 1;
      const req = UPGRADE_REQUIREMENTS[currentLevel];
      if (req) {
          matTier = req.matTier;
          matAmount = req.matAmount;
          chance = req.chance;
      } else {
          isMaxLevel = true;
      }
  }
  
  const matName = MATERIAL_CONFIG.NAMES[matTier as keyof typeof MATERIAL_CONFIG.NAMES];

  const renderDetailView = () => {
      if (!selectedItem) return <div className="text-stone-500 text-center mt-10">เลือกไอเทมเพื่อดูรายละเอียด</div>;

      const isEquipped = equippedIds.has(selectedItem.id);
      const isChip = selectedItem.typeId === 'upgrade_chip';
      const isSpecial = ['chest_key', 'mixer', 'magnifying_glass', 'robot', 'hourglass_small', 'hourglass_medium', 'hourglass_large'].includes(selectedItem.typeId);
      const isGlove = selectedItem.typeId === 'glove';
      
      return (
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`w-16 h-16 rounded-lg border-2 ${RARITY_SETTINGS[selectedItem.rarity].border} bg-stone-800 flex items-center justify-center`}>
                      {getIcon(selectedItem.typeId, `w-8 h-8 ${RARITY_SETTINGS[selectedItem.rarity].color}`, selectedItem.rarity)}
                  </div>
                  <div className="text-right">
                      <div className={`font-bold ${selectedItem.isHandmade ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]' : 'text-white'}`}>{selectedItem.name}</div>
                      <div className={`text-xs ${RARITY_SETTINGS[selectedItem.rarity].color}`}>{selectedItem.rarity}</div>
                      {selectedItem.level && selectedItem.level > 1 && <div className="text-xs text-yellow-500 font-bold">Lv. {selectedItem.level}</div>}
                  </div>
              </div>

              <div className="space-y-2 text-sm text-stone-400 mb-6 relative z-10">
                  <div className="flex justify-between">
                      <span>โบนัสรายวัน</span>
                      <span className="text-white font-mono">+{selectedItem.dailyBonus.toFixed(2)} {CURRENCY}</span>
                  </div>
                  {selectedItem.specialEffect && (
                      <div className="flex justify-between">
                          <span>คุณสมบัติพิเศษ</span>
                          <span className="text-emerald-400 font-bold">{selectedItem.specialEffect}</span>
                      </div>
                  )}
                  <div className="flex justify-between">
                      <span>สถานะ</span>
                      <span className={isEquipped ? 'text-green-400 font-bold' : 'text-stone-500'}>{isEquipped ? 'สวมใส่อยู่' : 'ว่าง'}</span>
                  </div>
                  <div className="flex justify-between">
                      <span>ราคาขายคืน</span>
                      <span className="text-emerald-400 font-mono">{(selectedItem.price * 0.5).toLocaleString()} {CURRENCY}</span>
                  </div>
              </div>

              {msg && <div className="mb-4 p-2 bg-blue-900/30 text-blue-200 text-xs text-center rounded relative z-10">{msg}</div>}

              {action === 'DETAILS' && (
                  <div className="grid grid-cols-2 gap-3 relative z-10">
                      <button 
                          onClick={() => setAction('SELL')}
                          disabled={isEquipped || isChip}
                          className="py-2 bg-red-900/20 border border-red-900/50 text-red-400 rounded hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          <DollarSign size={16} /> ขายคืน
                      </button>
                      <button 
                          onClick={() => setAction('UPGRADE')}
                          disabled={isEquipped || isChip || isSpecial || !isGlove} // Only gloves upgradeable
                          className="py-2 bg-yellow-900/20 border border-yellow-900/50 text-yellow-400 rounded hover:bg-yellow-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          <ArrowUpCircle size={16} /> ตีบวก
                      </button>
                  </div>
              )}

              {action === 'SELL' && (
                  <div className="text-center relative z-10">
                      <p className="text-red-400 text-sm mb-3">ยืนยันการขายคืนในราคา 50%?</p>
                      <div className="flex gap-2">
                          <button onClick={() => setAction('DETAILS')} className="flex-1 py-2 bg-stone-800 rounded text-stone-300">ยกเลิก</button>
                          <button onClick={handleSell} className="flex-1 py-2 bg-red-600 rounded text-white font-bold">ยืนยันขาย</button>
                      </div>
                  </div>
              )}

              {action === 'UPGRADE' && (
                  <div className="text-center relative z-10">
                      {isMaxLevel ? (
                          <div className="text-stone-500 py-4">อุปกรณ์ระดับสูงสุดแล้ว</div>
                      ) : (
                          <div className="bg-stone-950 p-2 rounded mb-3">
                              <div className="text-sm text-stone-300 mb-2 font-bold">ต้องใช้วัตถุดิบในการตีบวก</div>
                              <div className="flex justify-center items-center gap-2 mb-2">
                                  <div className="w-10 h-10 border border-stone-700 bg-stone-800 rounded flex items-center justify-center relative">
                                      {getIcon(selectedItem.typeId, `w-6 h-6 ${RARITY_SETTINGS[selectedItem.rarity].color}`, selectedItem.rarity)}
                                  </div>
                                  <span className="text-stone-500">+</span>
                                  <div className="w-10 h-10 border border-purple-500 bg-purple-900/20 rounded flex items-center justify-center" title="ชิปอัปเกรด">
                                      <Cpu size={20} className="text-purple-400" />
                                  </div>
                                  <span className="text-stone-500">+</span>
                                  <div className="w-10 h-10 border border-stone-600 bg-stone-700 rounded flex items-center justify-center relative" title={matName}>
                                      <MaterialIcon id={matTier} size="w-6 h-6" iconSize={12} />
                                      <span className="absolute -bottom-1 -right-1 text-[8px] bg-black text-white px-1 rounded">x{matAmount}</span>
                                  </div>
                              </div>
                              <ul className="text-xs text-stone-500 space-y-1">
                                  <li>• ใช้ชิป x1 และ {matName} x{matAmount}</li>
                                  <li>• โอกาสสำเร็จ {(chance * 100).toFixed(0)}%</li>
                                  <li>• <span className="text-red-400">ถ้าแตก: เสียวัตถุดิบ</span> (อุปกรณ์ไม่หาย)</li>
                              </ul>
                          </div>
                      )}
                      
                      <div className="flex gap-2">
                          <button onClick={() => setAction('DETAILS')} className="flex-1 py-2 bg-stone-800 rounded text-stone-300">ยกเลิก</button>
                          <button onClick={handleUpgrade} disabled={isMaxLevel} className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-black font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.3)] disabled:opacity-50"><Hammer size={14} /> ตีบวก</button>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-stone-950 border border-stone-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh] relative">
        
        {animationStep !== 'IDLE' && selectedItem && (
            <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center overflow-hidden">
                {(animationStep === 'PREPARE' || animationStep === 'HAMMER' || animationStep === 'IMPACT') && (
                    <div className="relative">
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-32 h-10 bg-stone-800 rounded-full blur-xl opacity-50"></div>
                        <div className={`relative z-10 transition-transform duration-100 ${animationStep === 'IMPACT' ? 'scale-90 translate-y-2' : 'scale-150 animate-[float-gold_2s_infinite]'}`}>
                             <div className={`w-32 h-32 rounded-xl border-4 ${RARITY_SETTINGS[selectedItem.rarity].border} bg-stone-900 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
                                {getIcon(selectedItem.typeId, `w-20 h-20 ${RARITY_SETTINGS[selectedItem.rarity].color}`, selectedItem.rarity)}
                             </div>
                        </div>
                        {animationStep === 'PREPARE' && (
                            <>
                                <div className="absolute top-0 -left-32 animate-[converge-right_0.5s_forwards]">
                                    <div className="w-12 h-12 rounded-full border border-purple-500 bg-purple-900/50 flex items-center justify-center text-purple-300 shadow-[0_0_20px_purple]">
                                        <Cpu size={24} />
                                    </div>
                                </div>
                                <div className="absolute top-0 -right-32 animate-[converge-left_0.5s_forwards]">
                                    <div className="w-12 h-12 rounded-full border border-stone-500 bg-stone-900/50 flex items-center justify-center shadow-[0_0_20px_white]">
                                        <div className={`flex items-center justify-center w-full h-full`}>
                                            <MaterialIcon id={matTier} size="w-8 h-8" iconSize={20} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        {(animationStep === 'HAMMER' || animationStep === 'IMPACT') && (
                            <div className={`absolute -top-32 -right-32 z-20 origin-bottom-left transition-transform duration-150 ${animationStep === 'IMPACT' ? '-rotate-45' : 'rotate-12'}`}>
                                <Hammer size={120} className="text-stone-300 drop-shadow-2xl" fill="#57534e" />
                            </div>
                        )}
                        {animationStep === 'IMPACT' && (
                            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                                <div className="w-full h-full animate-[ping_0.2s_ease-out]">
                                    <Sparkles size={100} className="text-yellow-200" />
                                </div>
                                <div className="absolute w-40 h-40 bg-white/50 rounded-full blur-xl animate-[pulse_0.1s_ease-out]"></div>
                            </div>
                        )}
                    </div>
                )}
                {animationStep === 'RESULT' && upgradeResult && (
                    <div className="text-center animate-in zoom-in duration-500">
                        {upgradeResult.success ? (
                            <>
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-yellow-500/30 blur-[60px] animate-pulse"></div>
                                    <div className="relative z-10 w-40 h-40 rounded-full border-4 border-yellow-400 bg-gradient-to-br from-yellow-900 to-black flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.6)] animate-[bounce_2s_infinite]">
                                        {getIcon(selectedItem.typeId, "w-24 h-24 text-yellow-300", selectedItem.rarity)}
                                        <div className="absolute -bottom-2 bg-yellow-600 text-white font-black px-4 py-1 rounded-full border-2 border-yellow-300 shadow-lg text-xl">
                                            Lv. {selectedItem.level ? selectedItem.level + 1 : 2}
                                        </div>
                                    </div>
                                    <Sparkles className="absolute -top-4 -right-4 text-yellow-200 animate-[spin_3s_linear_infinite]" size={40} />
                                    <Sparkles className="absolute -bottom-4 -left-4 text-yellow-200 animate-[spin_2s_linear_infinite]" size={30} />
                                </div>
                                <h3 className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 to-yellow-500 drop-shadow-lg mb-2">
                                    UPGRADE SUCCESS!
                                </h3>
                                <p className="text-yellow-200/80 mb-8 font-bold tracking-widest uppercase">เพิ่มประสิทธิภาพถาวร</p>
                            </>
                        ) : (
                            <>
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-red-500/20 blur-[50px]"></div>
                                    <div className="relative z-10 w-32 h-32 rounded-full border-4 border-red-900 bg-black flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] grayscale opacity-80 animate-[shake_0.5s_ease-in-out]">
                                        {getIcon(selectedItem.typeId, "w-16 h-16 text-stone-600", selectedItem.rarity)}
                                    </div>
                                    <AlertTriangle className="absolute -top-2 -right-2 text-red-500 animate-pulse" size={40} />
                                </div>
                                <h3 className="text-3xl font-display font-bold text-red-500 mb-2 tracking-widest">
                                    FAILED
                                </h3>
                                <p className="text-stone-500 mb-8">เสียวัตถุดิบ แต่ถุงมือยังอยู่ครบ</p>
                            </>
                        )}
                        <button onClick={resetAfterUpgrade} className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-lg font-bold border border-stone-600 transition-all hover:scale-105">ตกลง</button>
                    </div>
                )}
            </div>
        )}

        <div className="bg-stone-900 p-4 border-b border-stone-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-purple-900/20 p-2 rounded text-purple-500">
                    <Backpack size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-white">Inventory</h2>
                    <p className="text-xs text-stone-500 uppercase tracking-wider">จัดการ / ขาย / อัปเกรด</p>
                </div>
            </div>
            <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            <div className="w-1/2 sm:w-2/3 border-r border-stone-800 overflow-y-auto custom-scrollbar p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {/* Render Ungrouped Inventory */}
                    {inventory.map((item, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => { setSelectedItem(item); setAction('DETAILS'); setMsg(''); }}
                            className={`relative p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 text-center group
                                ${selectedItem?.id === item.id ? 'bg-stone-800 border-yellow-500' : 'bg-stone-900 border-stone-800 hover:bg-stone-800'}
                            `}
                        >
                            <div className="relative">
                                {getIcon(item.typeId, `w-8 h-8 ${RARITY_SETTINGS[item.rarity].color} group-hover:scale-110 transition-transform`, item.rarity)}
                                
                                {/* Equipped Indicator */}
                                {equippedIds.has(item.id) && <div className="absolute -top-1 -left-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                                
                                {/* Level Badge */}
                                {item.level && item.level > 1 && <span className="absolute -bottom-1 -right-2 text-[8px] bg-yellow-900 text-yellow-200 px-1 rounded">+{item.level}</span>}
                            </div>
                            <div className={`text-[10px] truncate w-full ${item.isHandmade ? 'text-yellow-400 font-bold' : 'text-stone-400'}`}>
                                {item.name}
                            </div>
                        </div>
                    ))}
                </div>
                {inventory.length === 0 && <div className="text-stone-600 text-center mt-10">กระเป๋าว่างเปล่า</div>}
            </div>
            <div className="w-1/2 sm:w-1/3 bg-stone-950 p-4 overflow-y-auto">
                {renderDetailView()}
            </div>
        </div>

        <style>{`
            @keyframes converge-right {
                0% { transform: translateX(0) scale(1); opacity: 1; }
                100% { transform: translateX(8rem) scale(0); opacity: 0; }
            }
            @keyframes converge-left {
                0% { transform: translateX(0) scale(1); opacity: 1; }
                100% { transform: translateX(-8rem) scale(0); opacity: 0; }
            }
        `}</style>
      </div>
    </div>
  );
};