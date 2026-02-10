import React from 'react';
import { X, Mail, Gift, CheckCircle2, MessageSquare, Trash2 } from 'lucide-react';
import { User, Notification } from '../services/types';
import { useTranslation } from './LanguageContext';

interface MailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onClaimReward: (notificationId: string) => void;
    onDeleteNotification: (notificationId: string) => void;
}

export const MailModal: React.FC<MailModalProps> = ({ isOpen, onClose, user, onClaimReward, onDeleteNotification }) => {
    const { t, language } = useTranslation();

    if (!isOpen) return null;

    // Sort notifications by date (newest first)
    const sortedNotifications = [...(user.notifications || [])].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-stone-900 to-stone-950 p-4 shrink-0 flex justify-between items-center border-b border-stone-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-stone-800 rounded-lg border border-stone-700">
                            <Mail className="text-stone-400" size={20} />
                        </div>
                        <h3 className="text-xl font-bold font-display text-white">
                            {language === 'th' ? 'กล่องจดหมาย' : 'Mailbox'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-800 text-stone-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                    {sortedNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-stone-500 opacity-50 h-full">
                            <Mail size={48} className="mb-4" />
                            <p className="text-sm">{language === 'th' ? 'ไม่มีจดหมายใหม่' : 'No new messages'}</p>
                        </div>
                    ) : (
                        sortedNotifications.map((notif: Notification) => (
                            <div
                                key={notif.id}
                                className={`p-4 rounded-xl border transition-all relative group ${notif.read ? 'bg-stone-950/50 border-stone-800 opacity-70' : 'bg-stone-800/80 border-stone-700 hover:border-yellow-500/30'}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`p-2 rounded-full border shrink-0 h-fit ${notif.type === 'REWARD' ? 'bg-yellow-900/20 border-yellow-700/50 text-yellow-500' :
                                            notif.type === 'SUCCESS' ? 'bg-emerald-900/20 border-emerald-700/50 text-emerald-500' :
                                                notif.type === 'ERROR' ? 'bg-red-900/20 border-red-700/50 text-red-500' :
                                                    'bg-blue-900/20 border-blue-700/50 text-blue-500'
                                        }`}>
                                        {notif.type === 'REWARD' ? <Gift size={18} /> :
                                            notif.type === 'SUCCESS' ? <CheckCircle2 size={18} /> :
                                                notif.type === 'ERROR' ? <MessageSquare size={18} /> :
                                                    <MessageSquare size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm font-bold truncate pr-6 ${notif.read ? 'text-stone-400' : 'text-white'}`}>
                                                {notif.title || (language === 'th' ? 'แจ้งเตือน' : 'Notification')}
                                            </h4>
                                            <span className="text-[10px] text-stone-600 font-mono whitespace-nowrap ml-2">
                                                {new Date(notif.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-stone-400 leading-relaxed break-words">
                                            {notif.message}
                                        </p>

                                        {notif.hasReward && !notif.isClaimed && (
                                            <button
                                                onClick={() => onClaimReward(notif.id)}
                                                className="mt-3 w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-stone-950 text-xs font-bold rounded flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-900/20 active:scale-95"
                                            >
                                                <Gift size={14} />
                                                <span>{language === 'th' ? 'รับรางวัล' : 'Claim Reward'}</span>
                                            </button>
                                        )}

                                        {notif.hasReward && notif.isClaimed && (
                                            <div className="mt-2 flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold bg-emerald-950/30 px-2 py-1 rounded w-fit border border-emerald-900/30">
                                                <CheckCircle2 size={12} />
                                                <span>{language === 'th' ? 'รับแล้ว' : 'Claimed'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteNotification(notif.id);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 text-stone-600 hover:text-red-400 transition-colors rounded hover:bg-stone-900 opacity-0 group-hover:opacity-100"
                                    title={language === 'th' ? 'ลบจดหมาย' : 'Delete'}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
