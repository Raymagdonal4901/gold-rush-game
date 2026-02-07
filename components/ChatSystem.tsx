import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Lock, X, Crown, ShieldAlert } from 'lucide-react';
import { MockDB } from '../services/db';
import { User, ChatMessage } from '../services/types';

interface ChatSystemProps {
    currentUser: User;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isButtonVisible, setIsButtonVisible] = useState(() => {
        const saved = localStorage.getItem('chatButtonVisible');
        return saved !== 'false'; // Default to true if not set
    });
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Level Gate Check
    // Level Gate Check - UNLOCKED FOR EVERYONE
    const canChat = true;

    useEffect(() => {
        if (!isOpen) return;

        // Initial load
        setMessages(MockDB.getChatMessages());
        scrollToBottom();

        // Polling loop
        const interval = setInterval(() => {
            const latest = MockDB.getChatMessages();
            setMessages(prev => {
                if (prev.length !== latest.length) return latest;
                if (latest.length > 0 && prev.length > 0 && latest[latest.length - 1].timestamp !== prev[prev.length - 1].timestamp) return latest;
                return prev;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;
        if (!canChat) return;

        try {
            MockDB.sendChatMessage(currentUser.id, input.trim(), currentUser);
            setInput('');
            setError(null);
            // Immediate update
            setMessages(MockDB.getChatMessages());
        } catch (err: any) {
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    const toggleButtonVisibility = () => {
        const newState = !isButtonVisible;
        setIsButtonVisible(newState);
        localStorage.setItem('chatButtonVisible', String(newState));
    };

    // Show small toggle button when chat button is hidden
    if (!isButtonVisible) {
        return (
            <button
                onClick={toggleButtonVisibility}
                className="fixed bottom-24 right-6 z-40 bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white p-2 rounded-full shadow-lg border border-stone-700/50 backdrop-blur-sm transition-all hover:scale-110"
                title="แสดงปุ่มแชท"
            >
                <MessageSquare size={16} />
            </button>
        );
    }

    if (!isOpen) {
        return (
            <div className="fixed bottom-24 right-6 z-40 flex items-center gap-2">
                {/* Hide Button */}
                <button
                    onClick={toggleButtonVisibility}
                    className="bg-stone-800/80 hover:bg-stone-700 text-stone-500 hover:text-white p-2 rounded-full shadow-lg border border-stone-700/50 backdrop-blur-sm transition-all hover:scale-110"
                    title="ซ่อนปุ่มแชท"
                >
                    <X size={14} />
                </button>

                {/* Chat Button */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-900/80 hover:bg-indigo-800 text-white p-4 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/50 backdrop-blur-sm transition-all hover:scale-110 group"
                >
                    <MessageSquare size={24} className="group-hover:animate-bounce" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-stone-950/95 backdrop-blur-xl border border-indigo-900/50 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 h-[500px]">
            {/* Header */}
            <div className="bg-indigo-950/50 p-3 flex justify-between items-center border-b border-indigo-900/30">
                <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-indigo-400" />
                    <h3 className="font-bold text-white text-sm">Global Chat</h3>
                    <span className="text-[10px] text-stone-500 px-1.5 py-0.5 bg-stone-900 rounded border border-stone-800">
                        {messages.length} msgs
                    </span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-stone-400 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/20">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-stone-600 space-y-2 opacity-50">
                        <MessageSquare size={32} />
                        <span className="text-xs">No messages yet</span>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isAdmin = msg.role.includes('ADMIN');
                    const isMe = msg.userId === currentUser.id;

                    return (
                        <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-1.5 mb-1 transition-opacity opacity-80 hover:opacity-100">
                                {isAdmin && <ShieldAlert size={12} className="text-red-500" />}
                                {msg.isVip && !isAdmin && <Crown size={12} className="text-yellow-500" />}
                                <span className={`text-[10px] font-bold ${isAdmin ? 'text-red-400' : isMe ? 'text-emerald-400' : 'text-stone-400'}`}>
                                    {msg.username}
                                </span>
                                <span className="text-[9px] text-stone-600">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className={`
                                max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed break-words shadow-sm
                                ${isMe
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : isAdmin
                                        ? 'bg-red-900/30 border border-red-900/50 text-red-200 rounded-tl-none'
                                        : 'bg-stone-800 text-stone-300 rounded-tl-none border border-stone-700'}
                            `}>
                                {msg.message}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-stone-900/50 border-t border-indigo-900/30">
                {error && (
                    <div className="text-red-400 text-[10px] mb-2 text-center animate-pulse flex justify-center items-center gap-1">
                        <Lock size={10} /> {error}
                    </div>
                )}

                {canChat ? (
                    <form onSubmit={handleSend} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            maxLength={100}
                            className="w-full bg-stone-950 border border-stone-700 rounded-full pl-4 pr-10 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-900 transition-all placeholder:text-stone-600"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="absolute right-1.5 top-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={14} />
                        </button>
                    </form>
                ) : (
                    <div className="bg-red-950/30 border border-red-900/30 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-red-400 mb-1">
                            <Lock size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wide">Locked</span>
                        </div>
                        <p className="text-[9px] text-stone-500">
                            ต้องเติมเงินครั้งแรกเพื่อปลดล็อกแชท
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
