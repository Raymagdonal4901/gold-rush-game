import React, { useEffect, useState } from 'react';
import { X, History, ArrowUpRight, ArrowDownLeft, ShoppingCart, RefreshCw, AlertCircle, Coins, Factory, Wrench, Gift, Target, Trophy, Sparkles } from 'lucide-react';
import { Transaction } from '../services/types';
import { api } from '../services/api';
import { CURRENCY } from '../constants';
import { useTranslation } from '../contexts/LanguageContext';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, userId }) => {
  const { t, getLocalized, formatCurrency } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Legacy translations for old records
  const LEGACY_TRANSLATIONS: Record<string, string> = {
    "ฝากเงินผ่านระบบ": "Deposit via System",
    "ซื้อเครื่องจักร: เครื่องขุดถ่านหิน": "Purchase Rig: Coal Miner",
    "เร่งพลังการผลิต (Overclock 48 ชม.)": "Overclock (48 Hours)",
    "เติมพลังงาน": "Energy Refill",
    "ซ่อมแซมเครื่องขุด": "Repair Rig",
    "ขายไอเทม": "Sell Item",
    "อัพเกรดไอเทม": "Upgrade Item",
    "สร้างไอเทม": "Craft Item",
    "รางวัลภารกิจ": "Mission Reward",
    "รางวัลจัดอันดับ": "Rank Reward",
    "สุ่มกาชา": "Lucky Draw",
    "เข้าดันเจี้ยน": "Dungeon Entry",
    "รางวัลจากดันเจี้ยน": "Dungeon Reward",
    "รับของขวัญ": "Claim Gift",
    "เก็บแร่": "Collect Material",
    "ภาษีตลาด": "Market Tax"
  };

  const getLocalizedDescription = (desc: string) => {
    try {
      // 1. Try parsing dictionary JSON (New format)
      if (desc.trim().startsWith('{') && desc.includes('"th":') && desc.includes('"en":')) {
        const obj = JSON.parse(desc);
        return getLocalized(obj);
      }
    } catch (e) {
      // Ignore parse error
    }

    // 2. Fallback to Legacy Mapping (If English is selected but desc is Thai)
    if (getLocalized({ th: 'th', en: 'en' }) === 'en') {
      // Check exact match
      if (LEGACY_TRANSLATIONS[desc]) return LEGACY_TRANSLATIONS[desc];

      // Check prefix match (e.g. "ซื้อเครื่องจักร: ...")
      for (const [key, val] of Object.entries(LEGACY_TRANSLATIONS)) {
        if (desc.includes(key)) {
          return desc.replace(key, val);
        }
      }
    }

    // 3. Return original
    return desc;
  };

  useEffect(() => {
    if (isOpen) {
      const fetchHistory = async () => {
        try {
          const remoteData = await api.getMyHistory();

          // remove potential duplicates by ID
          const seenIds = new Set();
          const unique = remoteData
            .filter(tx => {
              if (seenIds.has(tx.id)) return false;
              seenIds.add(tx.id);
              return true;
            })
            .sort((a, b) => b.timestamp - a.timestamp);

          // Group identical consecutive transactions
          const grouped: (Transaction & { count?: number })[] = [];
          for (const tx of unique) {
            const last = grouped[grouped.length - 1];
            // Match same description, amount, type, and status
            // Also ensure they are relatively close in time (within 1 minute)
            const isMatch = last &&
              last.description === tx.description &&
              last.amount === tx.amount &&
              last.type === tx.type &&
              last.status === tx.status &&
              Math.abs(last.timestamp - tx.timestamp) < 60000;

            if (isMatch) {
              last.count = (last.count || 1) + 1;
              // Keep the latest timestamp for the group
            } else {
              grouped.push({ ...tx });
            }
          }

          setTransactions(grouped);
        } catch (err) {
          console.error("Failed to fetch history:", err);
          setTransactions([]);
        }
      };

      fetchHistory();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
      case 'REFUND':
      case 'MINING_CLAIM':
      case 'MINING_REVENUE':
      case 'DAILY_BONUS':
      case 'REFERRAL_BONUS':
      case 'COMPENSATION':
        return <ArrowDownLeft className="text-emerald-500" size={18} />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="text-red-500" size={18} />;
      case 'ASSET_PURCHASE':
      case 'ACCESSORY_PURCHASE':
      case 'SLOT_EXPANSION':
      case 'MATERIAL_BUY':
        return <ShoppingCart className="text-yellow-500" size={18} />;
      case 'MATERIAL_SELL':
      case 'ACCESSORY_SELL':
        return <Coins className="text-emerald-400" size={18} />;
      case 'MATERIAL_CRAFT':
      case 'ACCESSORY_CRAFT':
      case 'ACCESSORY_UPGRADE':
        return <Factory className="text-purple-400" size={18} />;
      case 'REPAIR':
      case 'ENERGY_REFILL':
        return <Wrench className="text-orange-500" size={18} />;
      case 'QUEST_REWARD':
        return <Target className="text-blue-500" size={18} />;
      case 'RANK_REWARD':
        return <Trophy className="text-yellow-400" size={18} />;
      case 'LUCKY_DRAW':
        return <Sparkles className="text-purple-400" size={18} />;
      case 'DUNGEON_ENTRY':
        return <ArrowUpRight className="text-stone-400" size={18} />;
      case 'DUNGEON_REWARD':
        return <Trophy className="text-emerald-400" size={18} />;
      case 'GIFT_CLAIM':
        return <Gift className="text-pink-400" size={18} />;
      case 'MATERIAL_MINED':
        return <ArrowDownLeft className="text-stone-400" size={18} />;
      case 'MARKET_TAX':
        return <ArrowUpRight className="text-red-400" size={18} />;
      default:
        return <RefreshCw className="text-stone-500" size={18} />;
    }
  };

  const getAmountColor = (tx: Transaction) => {
    if (tx.amount > 0) return 'text-emerald-400';
    if (tx.amount < 0) return 'text-red-400';
    return 'text-stone-400'; // For 0 amount (like crafting)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50';
      case 'PENDING': return 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50';
      case 'REJECTED': return 'bg-red-900/30 text-red-400 border-red-900/50';
      default: return 'bg-stone-800 text-stone-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-stone-950 border border-stone-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] landscape:max-h-[60vh]">

        {/* Header */}
        <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-stone-800 p-2 rounded text-stone-300">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white">{t('history.title')}</h2>
              <p className="text-xs text-stone-500 uppercase tracking-wider">{t('history.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-500 gap-4">
              <AlertCircle size={48} opacity={0.5} />
              <p>{t('history.no_data')}</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-800">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 hover:bg-stone-900/50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-stone-900 border border-stone-800 group-hover:border-stone-700`}>
                      {getIcon(tx.type)}
                    </div>
                    <div>
                      <div className="text-stone-200 font-bold text-sm">
                        {getLocalizedDescription(tx.description)}
                        {(tx as any).count > 1 && (
                          <span className="text-yellow-500 ml-2">x{(tx as any).count}</span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 font-mono">{new Date(tx.timestamp).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className={`font-mono font-bold ${getAmountColor(tx)}`}>
                      {tx.amount !== 0 ? (
                        <>
                          {tx.amount > 0 ? '+' : ''}
                          {formatCurrency((tx.amount) * ((tx as any).count || 1))}
                        </>
                      ) : (
                        <span className="text-stone-500 italic text-[10px]">{t('history.log_activity')}</span>
                      )}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold ${getStatusColor(tx.status)}`}>
                      {tx.status === 'COMPLETED' ? t('history.status_completed') :
                        tx.status === 'PENDING' ? t('history.status_pending') :
                          tx.status === 'REJECTED' ? t('history.status_rejected') :
                            tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};