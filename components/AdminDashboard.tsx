import React, { useEffect, useState, useRef } from 'react';
import { Users, LayoutDashboard, Hammer, Coins, LogOut, Search, ShieldCheck, Bell, CheckCircle, XCircle, FileText, ChevronRight, X, ArrowUpRight, ArrowDownLeft, AlertTriangle, QrCode, Upload, Save, CheckCircle2, AlertCircle as AlertCircleIcon, Download, Wallet, Trash2 } from 'lucide-react';
import { MockDB } from '../services/db';
import { User, OilRig, ClaimRequest, WithdrawalRequest, DepositRequest, Notification } from '../services/types';
import { CURRENCY, SHOP_ITEMS, MATERIAL_CONFIG } from '../constants';

interface AdminDashboardProps {
    currentUser: User;
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onLogout }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [rigs, setRigs] = useState<OilRig[]>([]);
    const [pendingClaims, setPendingClaims] = useState<ClaimRequest[]>([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [pendingDeposits, setPendingDeposits] = useState<DepositRequest[]>([]); // New Phase 1
    const [search, setSearch] = useState('');

    // Notifications
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // System Config State
    const [systemQr, setSystemQr] = useState<string | null>(null);
    const [isMaintenance, setIsMaintenance] = useState(false); // New
    const fileInputRef = useRef<HTMLInputElement>(null);

    // User Details Modal State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Confirmation Modal State
    const [confirmAction, setConfirmAction] = useState<{
        type: 'CLAIM' | 'WITHDRAWAL' | 'DEPOSIT';
        id: string;
        action: 'APPROVED' | 'REJECTED';
        details: string;
        amount: number;
    } | null>(null);

    // Initial Load
    useEffect(() => {
        refreshData();
    }, []);

    // Polling
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();

            const msgs = MockDB.getUserNotifications(currentUser.id);
            if (msgs.length > 0) {
                msgs.forEach(n => {
                    MockDB.markNotificationRead(n.id);
                    setNotifications(prev => [...prev, n]);
                    setTimeout(() => {
                        setNotifications(prev => prev.filter(x => x.id !== n.id));
                    }, 8000);
                });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [currentUser.id]);

    const refreshData = () => {
        setUsers(MockDB.getAllUsers());
        setRigs(MockDB.getAllRigs());
        setPendingClaims(MockDB.getPendingClaims());
        setPendingWithdrawals(MockDB.getPendingWithdrawals());
        setPendingDeposits(MockDB.getPendingDeposits()); // New

        const sysConfig = MockDB.getSystemConfig();
        setSystemQr(sysConfig.receivingQrCode || null);
        setIsMaintenance(sysConfig.isMaintenanceMode || false);
    };

    const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setSystemQr(base64);
                MockDB.updateSystemQr(base64);
                alert("อัปเดต QR Code ระบบเรียบร้อยแล้ว");
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleMaintenance = () => {
        const newState = !isMaintenance;
        setIsMaintenance(newState);
        MockDB.setMaintenanceMode(newState);
        MockDB.sendNotification('ALL', newState ? 'ระบบกำลังเข้าสู้ช่วงปิดปรับปรุง' : 'ระบบเปิดให้บริการตามปกติแล้ว', 'INFO');
    };

    const handleBanUser = (userId: string) => {
        if (confirm('Are you sure you want to BAN this user?')) {
            MockDB.banUser(userId);
            refreshData();
            if (selectedUser?.id === userId) setSelectedUser(prev => prev ? ({ ...prev, isBanned: true }) : null);
        }
    };

    const handleUnbanUser = (userId: string) => {
        if (confirm('Unban this user?')) {
            MockDB.unbanUser(userId);
            refreshData();
            if (selectedUser?.id === userId) setSelectedUser(prev => prev ? ({ ...prev, isBanned: false }) : null);
        }
    };

    const handleDeleteUser = (userId: string) => {
        if (confirm('DANGER: Are you sure you want to PERMANENTLY DELETE this user? This action cannot be undone.')) {
            MockDB.deleteUser(userId);
            refreshData();
            setSelectedUser(null);
            alert('User deleted successfully');
        }
    };

    const initiateProcessClaim = (claim: ClaimRequest, status: 'APPROVED' | 'REJECTED') => {
        setConfirmAction({
            type: 'CLAIM',
            id: claim.id,
            action: status,
            details: `เก็บผลผลิตจาก ${claim.rigName} โดย ${claim.username}`,
            amount: claim.amount
        });
    };

    const initiateProcessWithdrawal = (w: WithdrawalRequest, status: 'APPROVED' | 'REJECTED') => {
        setConfirmAction({
            type: 'WITHDRAWAL',
            id: w.id,
            action: status,
            details: `คำร้องถอนเงินโดย ${w.username}`,
            amount: w.amount
        });
    };

    const initiateProcessDeposit = (d: DepositRequest, status: 'APPROVED' | 'REJECTED') => {
        setConfirmAction({
            type: 'DEPOSIT',
            id: d.id,
            action: status,
            details: `คำร้องฝากเงินโดย ${d.username}`,
            amount: d.amount
        });
    };

    const handleConfirmAction = () => {
        if (!confirmAction) return;

        if (confirmAction.type === 'CLAIM') {
            MockDB.processClaim(confirmAction.id, confirmAction.action);
        } else if (confirmAction.type === 'WITHDRAWAL') {
            MockDB.processWithdrawal(confirmAction.id, confirmAction.action);
        } else if (confirmAction.type === 'DEPOSIT') {
            MockDB.processDepositRequest(confirmAction.id, confirmAction.action);
        }

        setConfirmAction(null);
        refreshData();
    };

    const downloadQr = (base64: string, username: string) => {
        const link = document.createElement('a');
        link.href = base64;
        link.download = `QR_${username}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalInvestment = rigs.reduce((acc, r) => acc + r.investment, 0);
    const totalDailyProduction = rigs.reduce((acc, r) => acc + r.dailyProfit + (r.bonusProfit || 0), 0);

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    const getRigsForUser = (userId: string) => rigs.filter(r => r.ownerId === userId);
    const getDailyProfitForUser = (userId: string) =>
        getRigsForUser(userId).reduce((acc, r) => acc + r.dailyProfit + (r.bonusProfit || 0), 0);

    // --- View Slips Modal (Optional implementation, reusing confirmation modal for now) ---
    // We'll show the slip in the pending list directly for simplicity in Phase 1

    return (
        <div className="min-h-screen bg-stone-950 text-stone-200 font-sans relative">

            {/* Toast Notifications */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className="pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-2xl border backdrop-blur-md animate-in slide-in-from-right duration-500 fade-in w-80 bg-stone-900/90 border-yellow-600/50">
                        <div className="p-1 rounded-full bg-yellow-500/20 text-yellow-400">
                            <Bell size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-yellow-400">แจ้งเตือนใหม่</h4>
                            <p className="text-xs text-stone-300 mt-1">{n.message}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal Overlay */}
            {confirmAction && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-stone-900 border border-stone-700 w-full max-w-sm rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100">
                        <div className="p-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 
                          ${confirmAction.action === 'APPROVED' ? 'bg-emerald-900/30 border-emerald-500/20 text-emerald-500' : 'bg-red-900/30 border-red-500/20 text-red-500'}`}>
                                {confirmAction.action === 'APPROVED' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">
                                ยืนยันการ {confirmAction.action === 'APPROVED' ? 'อนุมัติ' : 'ปฏิเสธ'}?
                            </h3>
                            <p className="text-stone-400 text-sm mb-4">
                                {confirmAction.details}
                            </p>

                            <div className="bg-stone-950 p-3 rounded border border-stone-800 mb-6">
                                <div className="text-xs text-stone-500 uppercase tracking-wider">จำนวนเงิน</div>
                                <div className="text-2xl font-mono font-bold text-white">
                                    {confirmAction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {CURRENCY}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    className="py-3 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    className={`py-3 rounded font-bold text-white shadow-lg transition-transform hover:scale-[1.02]
                                ${confirmAction.action === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}
                                >
                                    ยืนยัน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur p-4 animate-in fade-in duration-200">
                    <div className="bg-stone-900 border border-stone-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-stone-950">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${selectedUser.role.includes('ADMIN') ? 'bg-red-900/40 text-red-500' : 'bg-stone-800 text-stone-400'}`}>
                                    {selectedUser.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        {selectedUser.username}
                                        {selectedUser.isBanned && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase">BANNED</span>}
                                    </h2>
                                    <div className="text-stone-500 text-xs font-mono">{selectedUser.id}</div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="text-stone-500 hover:text-white p-2 hover:bg-stone-800 rounded">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-stone-950 p-3 rounded border border-stone-800">
                                    <div className="text-xs text-stone-500 uppercase">Balance</div>
                                    <div className="text-lg font-bold text-emerald-400">{selectedUser.balance.toLocaleString()}</div>
                                </div>
                                <div className="bg-stone-900 p-3 rounded border border-stone-800">
                                    <div className="text-xs text-stone-500 uppercase">Rigs</div>
                                    <div className="text-lg font-bold text-yellow-500">{getRigsForUser(selectedUser.id).length}</div>
                                </div>
                                <div className="bg-stone-900 p-3 rounded border border-stone-800">
                                    <div className="text-xs text-stone-500 uppercase">Energy</div>
                                    <div className="text-lg font-bold text-orange-500">{selectedUser.energy}/100</div>
                                </div>
                                <div className="bg-stone-900 p-3 rounded border border-stone-800">
                                    <div className="text-xs text-stone-500 uppercase">Role</div>
                                    <div className="text-sm font-bold text-white">{selectedUser.role}</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 border-t border-stone-800">
                                {selectedUser.isBanned ? (
                                    <button
                                        onClick={() => handleUnbanUser(selectedUser.id)}
                                        className="flex-1 bg-emerald-900/40 hover:bg-emerald-800 text-emerald-400 border border-emerald-900 py-3 rounded font-bold transition-colors"
                                    >
                                        ปลดแบน (UNBAN)
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleBanUser(selectedUser.id)}
                                        className="flex-1 bg-red-900/40 hover:bg-red-800 text-red-500 border border-red-900 py-3 rounded font-bold transition-colors"
                                    >
                                        ระงับการใช้งาน (BAN)
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteUser(selectedUser.id)}
                                    className="px-4 bg-stone-950 hover:bg-red-950 text-stone-600 hover:text-red-600 border border-stone-800 hover:border-red-900 py-3 rounded font-bold transition-colors"
                                    title="Delete User Permanently"
                                >
                                    <Trash2 size={24} />
                                </button>
                                <button className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 py-3 rounded font-bold transition-colors">
                                    รีเซ็ตรหัสผ่าน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Navbar */}
            <nav className="bg-stone-900 border-b border-yellow-900/20 p-4 sticky top-0 z-30">
                <div className="w-full px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-900/20 p-2 rounded text-red-500">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold text-white">แผงควบคุมผู้บริหาร</h1>
                            <span className="text-[10px] text-stone-500 uppercase tracking-widest">ระบบจัดการหลังบ้าน</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-stone-400 font-mono">{currentUser.username}</span>
                        <button
                            onClick={onLogout}
                            className="bg-stone-800 hover:bg-stone-700 p-2 rounded transition-colors text-red-400"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="w-full px-6 py-6 space-y-8 max-w-[1920px] mx-auto">

                {/* === Notification / Approval Center === */}
                {(pendingWithdrawals.length > 0 || pendingDeposits.length > 0) && (
                    <div className="bg-stone-900 border-l-4 border-yellow-500 shadow-2xl overflow-hidden rounded-r-lg animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-yellow-900/20 p-3 flex items-center justify-between border-b border-yellow-900/30">
                            <div className="flex items-center gap-2 text-yellow-500 font-bold uppercase tracking-wider text-sm">
                                <Bell className="animate-pulse" size={16} /> คำร้องที่เข้ามาใหม่ ({pendingWithdrawals.length + pendingDeposits.length})
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto custom-scrollbar">

                            {/* Deposits First */}
                            {pendingDeposits.map(d => (
                                <div key={d.id} className="p-4 border-b border-stone-800 flex flex-col sm:flex-row items-center justify-between hover:bg-emerald-950/10 transition-colors bg-emerald-950/5 gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="p-2 bg-emerald-900/20 rounded border border-emerald-900/50 text-emerald-500">
                                            <Wallet size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-white text-sm flex items-center gap-2">
                                                <span className="text-yellow-500">{d.username}</span>
                                                <span className="text-xs bg-emerald-900/40 text-emerald-300 px-1.5 rounded">ฝากเงิน</span>
                                            </div>
                                            <div className="text-xs text-stone-500 font-mono mt-0.5">{new Date(d.timestamp).toLocaleString()}</div>
                                        </div>
                                        {/* Slip Preview */}
                                        <div className="w-12 h-16 bg-stone-950 border border-stone-700 rounded overflow-hidden cursor-pointer hover:scale-150 transition-transform origin-center shadow-lg" onClick={() => downloadQr(d.slipImage, d.username + "_slip")}>
                                            <img src={d.slipImage} className="w-full h-full object-cover" alt="Slip" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                        <span className="font-mono font-bold text-lg text-emerald-400">+{d.amount.toLocaleString()} <span className="text-stone-500 text-xs">{CURRENCY}</span></span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => initiateProcessDeposit(d, 'REJECTED')}
                                                className="px-3 py-1.5 rounded border border-red-900/50 bg-stone-900 text-stone-400 text-xs font-bold uppercase hover:bg-red-900/20 hover:text-red-400 flex items-center gap-1 transition-colors"
                                            >
                                                <XCircle size={14} /> ปฏิเสธ
                                            </button>
                                            <button
                                                onClick={() => initiateProcessDeposit(d, 'APPROVED')}
                                                className="px-3 py-1.5 rounded border border-emerald-500 bg-emerald-600 text-white text-xs font-bold uppercase hover:bg-emerald-500 flex items-center gap-1 transition-colors shadow-lg shadow-emerald-900/20"
                                            >
                                                <CheckCircle size={14} /> อนุมัติ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Withdrawals */}
                            {pendingWithdrawals.map(w => (
                                <div key={w.id} className="p-4 border-b border-stone-800 flex items-center justify-between hover:bg-red-950/10 transition-colors bg-red-950/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-red-900/20 rounded border border-red-900/50 text-red-500">
                                            <ArrowUpRight size={16} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm flex items-center gap-2">
                                                <span className="text-yellow-500">{w.username}</span>
                                                <span className="text-xs bg-red-900/40 text-red-300 px-1.5 rounded">ถอนเงิน</span>
                                            </div>
                                            <div className="text-xs text-stone-500 font-mono mt-0.5">{new Date(w.timestamp).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="font-mono font-bold text-lg text-white">{w.amount.toLocaleString()} <span className="text-stone-500 text-xs">{CURRENCY}</span></span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => initiateProcessWithdrawal(w, 'REJECTED')}
                                                className="px-3 py-1.5 rounded border border-red-900/50 bg-stone-900 text-stone-400 text-xs font-bold uppercase hover:bg-red-900/20 hover:text-red-400 flex items-center gap-1 transition-colors"
                                            >
                                                <XCircle size={14} /> ปฏิเสธ
                                            </button>
                                            <button
                                                onClick={() => initiateProcessWithdrawal(w, 'APPROVED')}
                                                className="px-3 py-1.5 rounded border border-red-500 bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-500 flex items-center gap-1 transition-colors shadow-lg shadow-red-900/20"
                                            >
                                                <CheckCircle size={14} /> อนุมัติ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}


                        </div>
                    </div>
                )}

                {/* System Settings: QR Code */}
                <div className="bg-stone-900 border border-stone-800 shadow-xl rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/50 text-blue-400">
                            <QrCode size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">ตั้งค่าบัญชีรับเงิน (QR)</h3>
                            <p className="text-sm text-stone-400">ตั้งค่า QR Code และสถานะเซิร์ฟเวอร์</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        {/* Maintenance Toggle */}
                        <div className="flex items-center gap-3 pr-6 border-r border-stone-800">
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-stone-500 uppercase font-bold">Server Status</span>
                                <span className={`text-sm font-bold ${isMaintenance ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {isMaintenance ? 'MAINTENANCE' : 'ONLINE'}
                                </span>
                            </div>
                            <button
                                onClick={toggleMaintenance}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-stone-950 ${isMaintenance ? 'bg-red-600' : 'bg-stone-700'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMaintenance ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        {systemQr && (
                            <div className="w-16 h-16 bg-white rounded p-1">
                                <img src={systemQr} alt="System QR" className="w-full h-full object-contain" />
                            </div>
                        )}

                        <div
                            className="relative cursor-pointer bg-stone-950 hover:bg-stone-800 border border-stone-700 border-dashed rounded-lg px-6 py-3 flex items-center gap-3 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleQrUpload}
                            />
                            <Upload size={18} className="text-stone-400" />
                            <span className="text-sm font-bold text-stone-300">อัปโหลด QR ใหม่</span>
                        </div>
                    </div>
                </div>

                {/* System Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-stone-900 p-5 border border-stone-800 shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-stone-500 text-xs uppercase tracking-widest">ผู้ใช้งานทั้งหมด</span>
                            <Users size={16} className="text-blue-400" />
                        </div>
                        <div className="text-3xl font-display font-bold text-white">{users.length}</div>
                    </div>

                    <div className="bg-stone-900 p-5 border border-stone-800 shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-stone-500 text-xs uppercase tracking-widest">เหมืองทั้งหมด</span>
                            <Hammer size={16} className="text-yellow-500" />
                        </div>
                        <div className="text-3xl font-display font-bold text-white">{rigs.length}</div>
                    </div>

                    <div className="bg-stone-900 p-5 border border-stone-800 shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-stone-500 text-xs uppercase tracking-widest">ยอดเงินลงทุนรวม</span>
                            <Coins size={16} className="text-emerald-500" />
                        </div>
                        <div className="text-3xl font-display font-bold text-white tracking-tight">{totalInvestment.toLocaleString()} <span className="text-sm font-sans font-normal text-stone-600">{CURRENCY}</span></div>
                    </div>

                    <div className="bg-stone-900 p-5 border border-stone-800 shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-stone-500 text-xs uppercase tracking-widest">ผลผลิตรายวันรวม</span>
                            <LayoutDashboard size={16} className="text-purple-400" />
                        </div>
                        <div className="text-3xl font-display font-bold text-white">+{totalDailyProduction.toFixed(1)}</div>
                    </div>
                </div>

                {/* === USERS MANAGEMENT === */}
                <div className="bg-stone-900 border border-stone-800 shadow-xl rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950">
                        <div className="flex items-center gap-2">
                            <Users size={20} className="text-blue-400" />
                            <h3 className="font-bold text-white">จัดการผู้ใช้งาน ({users.length})</h3>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={14} />
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อผู้ใช้..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-stone-900 border border-stone-700 rounded-full pl-9 pr-4 py-1.5 text-sm text-stone-200 focus:outline-none focus:border-yellow-600 w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-900/50 text-stone-500 text-xs uppercase tracking-wider border-b border-stone-800">
                                    <th className="p-4 font-bold">User info</th>
                                    <th className="p-4 font-bold text-right">Balance</th>
                                    <th className="p-4 font-bold text-center">Rigs</th>
                                    <th className="p-4 font-bold text-right text-emerald-400">Daily Profit</th>
                                    <th className="p-4 font-bold text-center">Status</th>
                                    <th className="p-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-800">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-stone-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.role?.includes('ADMIN') ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-stone-800 text-stone-400'}`}>
                                                    {u.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm flex items-center gap-2">
                                                        {u.username}
                                                        {u.role?.includes('ADMIN') && <span className="text-[10px] bg-red-900/40 text-red-400 px-1 rounded border border-red-900/50">ADMIN</span>}
                                                    </div>
                                                    <div className="text-xs text-stone-500 font-mono">ID: {u.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="font-mono font-bold text-emerald-400 text-sm">{u.balance.toLocaleString()}</div>
                                            <div className="text-[10px] text-stone-600">THB</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center gap-1 bg-stone-900 px-2 py-1 rounded border border-stone-800">
                                                <Hammer size={10} className="text-yellow-500" />
                                                <span className="text-xs font-bold text-stone-300">{getRigsForUser(u.id).length}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="font-mono font-bold text-emerald-400 text-sm">+{getDailyProfitForUser(u.id).toLocaleString()}</div>
                                            <div className="text-[10px] text-stone-600">THB/Day</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${u.isBanned ? 'bg-red-900/20 text-red-500 border-red-900/30' : 'bg-emerald-900/20 text-emerald-500 border-emerald-900/30'}`}>
                                                {u.isBanned ? 'BANNED' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                className="text-stone-500 hover:text-white p-2 rounded hover:bg-stone-800 transition-colors"
                                                title="View Details"
                                                onClick={() => setSelectedUser(u)}
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-stone-500 text-sm">
                            ไม่พบข้อมูลผู้ใช้งาน
                        </div>
                    )}
                </div>


                {/* === ECONOMY CONTROL === */}
                <div className="bg-stone-900 border border-stone-800 shadow-xl rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-stone-800 pb-4">
                        <Coins size={24} className="text-yellow-500" />
                        <h3 className="text-xl font-bold text-white">ควบคุมระบบเศรษฐกิจ (Economy Control)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Add Item Form */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest">เพิ่มไอเทมให้ผู้เล่น</h4>
                            <div className="space-y-3">
                                <input type="text" placeholder="User ID / Username" className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none" />
                                <select className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none">
                                    <option value="">เลือกไอเทม...</option>
                                    <optgroup label="Items & Equipment">
                                        {SHOP_ITEMS.map(item => (
                                            <option key={item.id} value={item.id}>{item.name} ({item.id})</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Materials">
                                        {Object.entries(MATERIAL_CONFIG.NAMES).map(([id, name]) => (
                                            <option key={`mat-${id}`} value={`material_${id}`}>{name} (Tier {id})</option>
                                        ))}
                                    </optgroup>
                                </select>
                                <input type="number" placeholder="จำนวน" className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none" />
                                <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-stone-900 font-bold py-3 rounded transition-colors" onClick={() => alert('Feature coming soon')}>
                                    ส่งไอเทม
                                </button>
                            </div>
                        </div>

                        {/* Adjust Balance Form */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest">ปรับยอดเงิน (Emergency Only)</h4>
                            <div className="space-y-3">
                                <input type="text" placeholder="User ID / Username" className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none" />
                                <div className="flex gap-2">
                                    <select className="w-1/3 bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none">
                                        <option value="ADD">เพิ่ม (+)</option>
                                        <option value="REMOVE">ลด (-)</option>
                                    </select>
                                    <input type="number" placeholder="จำนวนเงิน (THB)" className="flex-1 bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none" />
                                </div>
                                <input type="text" placeholder="เหตุผลการปรับยอด..." className="w-full bg-stone-950 border border-stone-700 rounded p-3 text-white focus:border-yellow-600 outline-none" />
                                <button className="w-full bg-red-900/50 hover:bg-red-900 text-red-400 font-bold py-3 rounded border border-red-800 transition-colors" onClick={() => alert('Feature coming soon')}>
                                    ยืนยันการปรับยอด
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === GAME CONFIG === */}
                <div className="bg-stone-900 border border-stone-800 shadow-xl rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-stone-800 pb-4">
                        <LayoutDashboard size={24} className="text-purple-400" />
                        <h3 className="text-xl font-bold text-white">ตั้งค่าระบบเกม (Game Configuration)</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-stone-950 p-4 rounded border border-stone-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-stone-400 font-bold">อัตราดรอป (Drop Rate)</span>
                                <span className="text-emerald-400 font-mono">5%</span>
                            </div>
                            <input type="range" className="w-full accent-emerald-500" />
                        </div>
                        <div className="bg-stone-950 p-4 rounded border border-stone-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-stone-400 font-bold">ภาษีตลาดกลาง (Tax)</span>
                                <span className="text-red-400 font-mono">15%</span>
                            </div>
                            <input type="range" className="w-full accent-red-500" />
                        </div>
                        <div className="bg-stone-950 p-4 rounded border border-stone-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-stone-400 font-bold">ค่าซ่อมเครื่องจักร</span>
                                <span className="text-yellow-400 font-mono">x1.0</span>
                            </div>
                            <input type="range" className="w-full accent-yellow-500" />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-6 py-2 rounded font-bold transition-colors" onClick={() => alert('Config saved!')}>
                            บันทึกการตั้งค่า
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};