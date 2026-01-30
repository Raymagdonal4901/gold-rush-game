
import React from 'react';
import { X, AlertCircle, CheckCircle2, Pickaxe, Sparkles, Gem, Hammer, HelpCircle, Coins, Lock, Hexagon, Cable, TowerControl } from 'lucide-react';
import { CURRENCY, RIG_PRESETS, RigPreset, MATERIAL_CONFIG, SHOP_ITEMS } from '../constants';
import { AccessoryItem, OilRig } from '../types';

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
  rigs
}) => {
  if (!isOpen) return null;

  const isSlotLimitReached = currentRigCount >= maxRigs;

  const handleBuy = (preset: RigPreset) => {
    // 1. Check Max Allowed
    if (preset.specialProperties?.maxAllowed) {
      const existingCount = rigs.filter(r => r.name === preset.name).length;
      if (existingCount >= preset.specialProperties.maxAllowed) {
        alert(`จำกัดการครอบครองเพียง ${preset.specialProperties.maxAllowed} เครื่องต่อไอดี`);
        return;
      }
    }

    // 2. Check Slot Limit
    if (isSlotLimitReached) {
      alert("คุณมีเครื่องจักรครบตามจำนวนที่ปลดล็อกแล้ว กรุณาปลดล็อกพื้นที่เพิ่ม");
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

  // Helper to render premium icons based on tier ID (Materials) - COMPACT SIZE
  const renderTierIcon = (id: number) => {
    // Reduced sizes from w-16/20/24 to w-10/12/14
    const baseClass = "relative flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shrink-0";

    switch (id) {
      case 1: // Tier 1: Coal
        return (
          <div className={`${baseClass} w-10 h-10 rounded-full border-2 bg-gradient-to-br from-stone-800 to-black border-stone-600 text-stone-400 shadow-lg shadow-black/50`}>
            <Pickaxe size={20} strokeWidth={1.5} />
          </div>
        );
      case 2: // Tier 2: Copper
        return (
          <div className={`${baseClass} w-10 h-10 rounded-full border-2 bg-gradient-to-br from-orange-900 to-stone-900 border-orange-600 text-orange-500 shadow-lg shadow-orange-900/40`}>
            <Cable size={20} strokeWidth={2} />
          </div>
        );
      case 3: // Tier 3: Iron
        return (
          <div className={`${baseClass} w-12 h-12 rounded-full border-2 bg-gradient-to-br from-slate-600 to-slate-900 border-slate-400 text-slate-200 shadow-lg shadow-slate-500/40`}>
            <Hammer size={24} strokeWidth={1.5} />
          </div>
        );
      case 4: // Tier 4: Gold
        return (
          <div className={`${baseClass} w-12 h-12 rounded-full border-2 bg-gradient-to-br from-yellow-700 via-yellow-900 to-stone-900 border-yellow-500 text-yellow-400 shadow-lg shadow-yellow-600/40`}>
            <Coins size={24} strokeWidth={1.5} />
          </div>
        );
      case 5: // Tier 5: Diamond
        return (
          <div className={`${baseClass} w-14 h-14 rounded-full border-2 bg-gradient-to-br from-cyan-900 via-blue-900 to-stone-900 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/50`}>
            <TowerControl size={28} strokeWidth={1.5} />
            <Sparkles className="absolute top-0 right-0 text-white animate-spin" size={10} />
          </div>
        );
      default:
        return null;
    }
  };

  const getTierStyles = (id: number) => {
    switch (id) {
      case 1: return { border: "border-stone-600", text: "text-stone-400", bg: "from-stone-800/50 to-stone-950/80" };
      case 2: return { border: "border-orange-600", text: "text-orange-500", bg: "from-orange-900/20 to-stone-950/80" };
      case 3: return { border: "border-slate-400", text: "text-slate-300", bg: "from-slate-800/50 to-stone-950/80" };
      case 4: return { border: "border-yellow-500", text: "text-yellow-400", bg: "from-yellow-900/20 to-stone-950/80" };
      case 5: return { border: "border-cyan-400", text: "text-cyan-300", bg: "from-cyan-900/20 to-stone-950/80" };
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
              const netProfit = (preset.dailyProfit * 30 * preset.durationMonths) - preset.price;
              const styles = getTierStyles(preset.id);
              const isCrafting = !!preset.craftingRecipe;

              return (
                <div key={preset.id} className={`bg-stone-900/60 backdrop-blur border rounded-lg overflow-hidden flex flex-col transition-all duration-300 group relative shadow-lg hover:shadow-xl hover:bg-stone-900 ${styles.border}`}>

                  {/* Compact Header */}
                  <div className={`p-3 flex items-center gap-3 bg-gradient-to-r ${styles.bg} border-b border-stone-800/50`}>
                    {renderTierIcon(preset.id)}
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-0.5">LVL {preset.id}</div>
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
                        {preset.specialProperties?.infiniteDurability ? 'ถาวร (∞)' : `${preset.durationMonths} เดือน`}
                      </span>
                    </div>

                    {isCrafting ? (
                      <div className="mt-auto pt-2 border-t border-dashed border-stone-800">
                        <div className="text-[10px] text-stone-400 mb-1">วัตถุดิบที่ต้องใช้:</div>
                        <div className="flex flex-wrap gap-1">
                          {preset.craftingRecipe?.materials && Object.entries(preset.craftingRecipe.materials).map(([tierStr, amt]) => {
                            const tier = parseInt(tierStr);
                            const has = materials[tier] || 0;
                            return (
                              <span key={`mat-${tier}`} className={`text-[10px] px-1.5 py-0.5 rounded border ${has >= amt ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
                                {MATERIAL_CONFIG.NAMES[tier as keyof typeof MATERIAL_CONFIG.NAMES]}: {has}/{amt}
                              </span>
                            )
                          })}
                          {preset.craftingRecipe?.items && Object.entries(preset.craftingRecipe.items).map(([id, amt]) => {
                            const has = inventory.filter(i => i.typeId === id).length;
                            const label = SHOP_ITEMS.find(i => i.id === id)?.name || id;
                            return (
                              <span key={`item-${id}`} className={`text-[10px] px-1.5 py-0.5 rounded border ${has >= amt ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' : 'bg-red-900/30 border-red-800 text-red-400'}`}>
                                {label}: {has}/{amt}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-stone-950/30 px-2 py-1 rounded border border-emerald-900/10">
                        <span className="text-stone-500">กำไรสุทธิ</span>
                        <span className="text-emerald-400 font-bold font-mono">+{netProfit.toLocaleString()}</span>
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
                          {isAffordable ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {isCrafting ? (
                            <span>ผลิตเครื่องจักร</span>
                          ) : (
                            <span className="font-mono">{preset.price.toLocaleString()}</span>
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
