import React, { useEffect, useState } from 'react';
import { X, History, ArrowUpRight, ArrowDownLeft, ShoppingCart, RefreshCw, AlertCircle, Coins, Factory, Wrench } from 'lucide-react';
import { Transaction } from '../types';
import { MockDB } from '../services/db';
import { CURRENCY } from '../constants';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, userId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (isOpen && userId) {
      setTransactions(MockDB.getTransactions(userId));
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
      case 'REFUND':
      case 'MINING_CLAIM':
        return <ArrowDownLeft className="text-emerald-500" size={18} />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="text-red-500" size={18} />;
      case 'ASSET_PURCHASE':
      case 'ACCESSORY_PURCHASE':
        return <ShoppingCart className="text-yellow-500" size={18} />;
      case 'MATERIAL_SELL':
        return <Coins className="text-emerald-400" size={18} />; // Changed to Money Icon
      case 'MATERIAL_CRAFT':
        return <Factory className="text-purple-400" size={18} />; // Changed to Factory Icon
      case 'REPAIR':
        return <Wrench className="text-orange-500" size={18} />;
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
              <h2 className="text-xl font-display font-bold text-white">ประวัติธุรกรรม</h2>
              <p className="text-xs text-stone-500 uppercase tracking-wider">บัญชีการเงิน</p>
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
              <p>ไม่พบประวัติธุรกรรม</p>
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
                      <div className="text-stone-200 font-bold text-sm">{tx.description}</div>
                      <div className="text-xs text-stone-500 font-mono">{new Date(tx.timestamp).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className={`font-mono font-bold ${getAmountColor(tx)}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {CURRENCY}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-bold ${getStatusColor(tx.status)}`}>
                      {tx.status}
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