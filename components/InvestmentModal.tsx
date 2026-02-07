import React from 'react';
import { X, AlertCircle, CheckCircle2, Pickaxe, Sparkles, Gem, Hammer, HelpCircle, Coins, Lock, Hexagon, Cable, TowerControl, Cpu } from 'lucide-react';
import { CURRENCY, RIG_PRESETS, RigPreset, MATERIAL_CONFIG, SHOP_ITEMS } from '../constants';
import { AccessoryItem, OilRig } from '../services/types';
import { MaterialIcon } from './MaterialIcon';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (preset: RigPreset) => void;
  onOpenRates: () => void;
  walletBalance: number;
  currentRigCount: number;
  maxRigs: number;
  materials: Record<number, number>;
  inventory: AccessoryItem[];
  rigs: OilRig[];
  addNotification?: (n: any) => void;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onOpenRates,
  walletBalance,
  currentRigCount,
  maxRigs,
  materials,
  inventory,
  rigs,
  addNotification
}) => {
  if (!isOpen) return null;

  const isSlotLimitReached = currentRigCount >= maxRigs;

  const handleBuy = (preset: RigPreset) => {
    // 1. Check Max Allowed
    if (preset.specialProperties?.maxAllowed) {
      const existingCount = rigs.filter(r => r.name === preset.name).length;
      if (existingCount >= preset.specialProperties.maxAllowed) {
        if (addNotification) addNotification({
          id: Date.now().toString(),
          userId: '', // Will be handled by notification system
          message: `จำกัดการครอบครองเพียง ${preset.specialProperties.maxAllowed} เครื่องต่อไอดี`,
          type: 'ERROR',
          read: false,
          timestamp: Date.now()
        });
        return;
      }
    }

    // 2. Check Slot Limit
    if (isSlotLimitReached) {
      if (addNotification) addNotification({
        id: Date.now().toString(),
        userId: '',
        message: "คุณมีเครื่องจักรครบตามจำนวนที่ปลดล็อกแล้ว กรุณาปลดล็อกพื้นที่เพิ่ม",
        type: 'ERROR',
        read: false,
        timestamp: Date.now()
      });
      return;
    }

    // 3. Check Crafting Requirements or Price
    if (preset.craftingRecipe) {
      // Validation handled in Dashboard (or here if we want double check, but UI button disabled logic handles UX)
      onConfirm(preset);
      onClose();
    } else {
      if (walletBalance >= preset.price) {
        onConfirm(preset);
        onClose();
      }
    }
  };

  // Helper to render premium icons based on tier ID - Using custom images
  const renderTierIcon = (id: number) => {
    const baseClass = "relative flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shrink-0 bg-white border-2";
    const tierColors = {
      1: 'border-stone-400',
      2: 'border-blue-500',
      3: 'border-stone-600',
      4: 'border-orange-500',
      5: 'border-slate-500',
      6: 'border-yellow-500',
      7: 'border-cyan-400',
      8: 'border-purple-500'
    };
    const colorClass = tierColors[id as keyof typeof tierColors] || 'border-stone-200';

    // Size based on tier level for premium feel
    const sizeClass = id <= 2 ? "w-10 h-10" : id <= 5 ? "w-12 h-12" : "w-14 h-14";

    return (
      <div className={`${baseClass} ${sizeClass} ${colorClass} rounded-lg overflow-hidden`}>
        <img
          src={`/assets/rigs/rig_${id}.png`}
          alt={`Rig Tier ${id}`}
          className="w-full h-full object-contain p-1"
        />
      </div>
    );
  };

  const getTierStyles = (id: number) => {
    switch (id) {
      case 1: return { border: "border-stone-600", text: "text-stone-400", bg: "from-stone-800/50 to-stone-950/80" };
      case 2: return { border: "border-blue-600", text: "text-blue-400", bg: "from-blue-900/20 to-stone-950/80" };
      case 3: return { border: "border-stone-500", text: "text-stone-300", bg: "from-stone-800/50 to-stone-950/80" };
      case 4: return { border: "border-orange-500", text: "text-orange-400", bg: "from-orange-900/20 to-stone-950/80" };
      case 5: return { border: "border-slate-400", text: "text-slate-300", bg: "from-slate-800/50 to-stone-950/80" };
      case 6: return { border: "border-yellow-500", text: "text-yellow-400", bg: "from-yellow-900/20 to-stone-950/80" };
      case 7: return { border: "border-cyan-400", text: "text-cyan-300", bg: "from-cyan-900/20 to-stone-950/80" };
      case 8: return { border: "border-purple-500", text: "text-purple-400", bg: "from-purple-900/30 to-stone-950/80" };
      default: return { border: "border-stone-800", text: "text-stone-400", bg: "bg-stone-900" };
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-950 border border-stone-800 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header - Compact */}
        <div className="p-3 border-b border-stone-800 flex justify-between items-center bg-stone-900 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600">
              ร้านค้าเครื่องจักร
            </h2>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-mono text-xs font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/50 flex items-center gap-1">
                <Coins size={12} /> ทุน: {walletBalance.toLocaleString()}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${isSlotLimitReached ? 'bg-red-950/30 text-red-400 border-red-900/50' : 'bg-stone-800 text-stone-400 border-stone-700'}`}>
                <Lock size={12} /> พื้นที่: {currentRigCount}/{maxRigs}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onOpenRates} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-900/20 px-2 py-1 rounded border border-purple-900/50">
              <HelpCircle size={12} /> โอกาสโบนัส
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-800 text-stone-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Grid - Compact */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {RIG_PRESETS.map((preset) => {
              // Check Max Limit
              let isMaxReached = false;
              if (preset.specialProperties?.maxAllowed) {
                const existingCount = rigs.filter(r => r.name === preset.name).length;
                if (existingCount >= preset.specialProperties.maxAllowed) isMaxReached = true;
              }

              // Check Affordability (Price OR Crafting)
              let isAffordable = true;
              if (preset.craftingRecipe) {
                if (preset.craftingRecipe.materials) {
                  for (const [tier, amount] of Object.entries(preset.craftingRecipe.materials)) {
                    if ((materials[parseInt(tier)] || 0) < amount) isAffordable = false;
                  }
                }
                if (preset.craftingRecipe.items) {
                  for (const [imgId, amount] of Object.entries(preset.craftingRecipe.items)) {
                    const count = inventory.filter(i => i.typeId === imgId).length;
                    if (count < amount) isAffordable = false;
                  }
                }
              } else {
                isAffordable = walletBalance >= preset.price;
              }

              const canBuy = isAffordable && !isSlotLimitReached && !isMaxReached;
              // Use bonusProfit for Tier 1-2, calculate for others
              const netProfit = preset.bonusProfit !== undefined ? preset.bonusProfit : (preset.dailyProfit * 30 * (preset.durationMonths || 1)) - preset.price;
              const styles = getTierStyles(preset.id);
              const isCrafting = !!preset.craftingRecipe;

              return (
                <div key={preset.id} className={`bg-stone-900/60 backdrop-blur border rounded-lg overflow-hidden flex flex-col transition-all duration-300 group relative hover:bg-stone-900 ${styles.border}`}>

                  {/* Compact Header */}
                  <div className={`p-3 flex items-center gap-3 bg-gradient-to-r ${styles.bg} border-b border-stone-800/50`}>
                    {renderTierIcon(preset.id)}
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white uppercase tracking-widest mb-0.5">Tier {preset.id}</div>
                      <h3 className={`font-display font-bold text-sm leading-tight truncate ${styles.text}`}>
                        {preset.name}
                      </h3>
                    </div>
                  </div>

                  {/* Compact Stats */}
                  <div className="p-2.5 flex-1 flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between items-center bg-stone-950/30 px-2 py-1 rounded">
                      <span className="text-stone-500">ผลผลิต</span>
                      <span className="text-yellow-500 font-bold font-mono">+{preset.dailyProfit}/วัน</span>
                    </div>
                    <div className="flex justify-between items-center bg-stone-950/30 px-2 py-1 rounded">
                      <span className="text-stone-500">สัญญา</span>
                      <span className="text-stone-300 font-mono">
                        {preset.specialProperties?.infiniteDurability ? 'ถาวร (∞)' : preset.durationDays ? `${preset.durationDays} วัน` : `${preset.durationMonths} เดือน`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-stone-950/30 px-2 py-1 rounded">
                      <span className="text-stone-500">ค่าพลังงาน</span>
                      <span className="text-orange-400 font-mono">-{preset.energyCostPerDay}/{CURRENCY} 24h</span>
                    </div>
                    <div className="flex justify-between items-center bg-stone-950/30 px-2 py-1 rounded">
                      <span className="text-stone-500">ค่าซ่อม</span>
                      <span className="text-red-400 font-mono">{preset.id === 8 ? '-' : `-${preset.repairCost} ${CURRENCY} (15 วัน)`}</span>
                    </div>

                    {isCrafting ? (
                      <div className="mt-auto pt-2 border-t border-dashed border-stone-800">
                        <div className="text-[10px] text-stone-400 mb-1">วัตถุดิบที่ต้องใช้:</div>
                        <div className="flex flex-wrap gap-2">
                          {preset.craftingRecipe?.materials && Object.entries(preset.craftingRecipe.materials).map(([tierStr, amt]) => {
                            const tier = parseInt(tierStr);
                            const has = materials[tier] || 0;
                            const enough = has >= amt;
                            return (
                              <div key={`mat-${tier}`} className={`flex items-center gap-1.5 px-2 py-1 rounded border ${enough ? 'bg-emerald-900/30 border-emerald-800' : 'bg-red-900/30 border-red-800'}`}>
                                <div className="w-10 h-10 flex items-center justify-center bg-stone-900/50 rounded-lg">
                                  <MaterialIcon id={tier} size="w-8 h-8" iconSize={16} />
                                </div>
                                <span className={`text-[10px] font-mono ${enough ? 'text-emerald-400' : 'text-red-400'}`}>{has}/{amt}</span>
                              </div>
                            )
                          })}
                          {preset.craftingRecipe?.items && Object.entries(preset.craftingRecipe.items).map(([id, amt]) => {
                            const has = inventory.filter(i => i.typeId === id).length;
                            const enough = has >= amt;
                            return (
                              <div key={`item-${id}`} className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${enough ? 'bg-emerald-900/30 border-emerald-800' : 'bg-red-900/30 border-red-800'}`}>
                                <Cpu size={14} className={enough ? 'text-emerald-400' : 'text-red-400'} />
                                <span className={`text-[10px] font-mono ${enough ? 'text-emerald-400' : 'text-red-400'}`}>{has}/{amt}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-stone-950/30 px-2 py-1 rounded border border-emerald-900/10">
                        <span className="text-stone-500">กำไรสุทธิ</span>
                        <span className="text-emerald-400 font-bold font-mono">+{(netProfit || 0).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="p-2.5 pt-0 mt-auto">
                    <button
                      onClick={() => handleBuy(preset)}
                      disabled={!canBuy}
                      className={`w-full py-2 rounded font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all text-xs
                                            ${!isSlotLimitReached && !isMaxReached
                          ? isAffordable
                            ? 'bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-white shadow-lg'
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                          : 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-700'
                        }
                                        `}
                    >
                      {isSlotLimitReached ? (
                        <span>พื้นที่เต็ม</span>
                      ) : isMaxReached ? (
                        <span>ครบจำกัด ({preset.specialProperties?.maxAllowed})</span>
                      ) : (
                        <>
                          {isAffordable ? null : <AlertCircle size={12} />}
                          {isCrafting ? (
                            <span>ผลิตเครื่องจักร</span>
                          ) : (
                            <span className="font-mono">฿ {preset.price.toLocaleString()}</span>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
