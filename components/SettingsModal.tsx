import React, { useState } from 'react';
import { X, Lock, KeyRound, Save, Shield } from 'lucide-react';
import { MockDB } from '../services/db';
import { User } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user }) => {
  const [activeTab, setActiveTab] = useState<'PASSWORD' | 'PIN'>('PASSWORD');
  
  // Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  
  const [status, setStatus] = useState<{ type: 'SUCCESS' | 'ERROR', msg: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setStatus(null);

      try {
          if (activeTab === 'PASSWORD') {
              MockDB.changePassword(user.id, currentPassword, newPassword);
              setStatus({ type: 'SUCCESS', msg: 'เปลี่ยนรหัสผ่านสำเร็จ' });
          } else {
              MockDB.changePin(user.id, currentPassword, newPin);
              setStatus({ type: 'SUCCESS', msg: 'เปลี่ยนรหัส PIN สำเร็จ' });
          }
          // Clear inputs
          setCurrentPassword('');
          setNewPassword('');
          setNewPin('');
      } catch (err: any) {
          setStatus({ type: 'ERROR', msg: err.message });
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-stone-950 border border-stone-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-stone-900 p-5 border-b border-stone-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-stone-800 p-2 rounded text-stone-300">
                    <Shield size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-white">ตั้งค่าความปลอดภัย</h2>
                    <p className="text-xs text-stone-500 uppercase tracking-wider">จัดการบัญชีผู้ใช้</p>
                </div>
            </div>
            <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-800">
            <button 
                onClick={() => { setActiveTab('PASSWORD'); setStatus(null); }}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2
                ${activeTab === 'PASSWORD' ? 'bg-stone-900 text-yellow-500 border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300'}`}
            >
                <Lock size={16} /> รหัสผ่าน
            </button>
            <button 
                onClick={() => { setActiveTab('PIN'); setStatus(null); }}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2
                ${activeTab === 'PIN' ? 'bg-stone-900 text-yellow-500 border-b-2 border-yellow-500' : 'text-stone-500 hover:text-stone-300'}`}
            >
                <KeyRound size={16} /> รหัส PIN
            </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-stone-950/50">
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {status && (
                    <div className={`p-3 rounded text-sm text-center font-bold ${status.type === 'SUCCESS' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                        {status.msg}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase">ยืนยันรหัสผ่านปัจจุบัน</label>
                    <input 
                        type="password" 
                        required
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded p-3 text-white focus:border-yellow-500 outline-none transition-colors"
                        placeholder="กรอกรหัสผ่านเดิม"
                    />
                </div>

                {activeTab === 'PASSWORD' ? (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase">รหัสผ่านใหม่</label>
                        <input 
                            type="password" 
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full bg-stone-900 border border-stone-700 rounded p-3 text-white focus:border-yellow-500 outline-none transition-colors"
                            placeholder="กำหนดรหัสผ่านใหม่ (ขั้นต่ำ 4 ตัวอักษร)"
                            minLength={4}
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase">รหัส PIN ใหม่ (4 หลัก)</label>
                        <input 
                            type="password" 
                            required
                            maxLength={4}
                            pattern="\d{4}"
                            value={newPin}
                            onChange={e => {
                                if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
                                    setNewPin(e.target.value);
                                }
                            }}
                            className="w-full bg-stone-900 border border-stone-700 rounded p-3 text-white focus:border-yellow-500 outline-none transition-colors text-center tracking-[0.5em] font-mono"
                            placeholder="----"
                        />
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-stone-900 font-bold py-3 rounded shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                >
                    <Save size={18} /> บันทึกการเปลี่ยนแปลง
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};