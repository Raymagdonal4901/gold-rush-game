function ReferralNetworkView({ data, isLoading }: { data: any, isLoading: boolean }) {
    if (isLoading) return (
        <div className="p-12 flex flex-col items-center justify-center gap-4 text-stone-500 animate-pulse">
            <div className="w-10 h-10 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            <div className="font-mono tracking-widest uppercase text-xs">FETCHING NETWORK DATA...</div>
        </div>
    );

    if (!data) return (
        <div className="p-12 text-center text-stone-500 border-2 border-dashed border-stone-800 rounded-xl">
            No network data available for this user.
        </div>
    );

    const { network, actualCounts } = data;

    return (
        <div className="space-y-4 animate-in fade-in duration-500 mt-4">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-stone-900 border border-stone-800 p-3 rounded-lg">
                    <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">Total Network</div>
                    <div className="text-xl font-bold text-white">{data.totalCount || 0}</div>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-lg">
                    <div className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Level 1</div>
                    <div className="text-xl font-bold text-emerald-400">{actualCounts?.l1 || 0}</div>
                </div>
                <div className="bg-blue-950/20 border border-blue-900/30 p-3 rounded-lg">
                    <div className="text-[10px] text-blue-500 uppercase font-bold mb-1">Level 2</div>
                    <div className="text-xl font-bold text-blue-400">{actualCounts?.l2 || 0}</div>
                </div>
                <div className="bg-purple-950/20 border border-purple-900/30 p-3 rounded-lg">
                    <div className="text-[10px] text-purple-500 uppercase font-bold mb-1">Level 3</div>
                    <div className="text-xl font-bold text-purple-400">{actualCounts?.l3 || 0}</div>
                </div>
            </div>

            {/* Level 1 Members */}
            {network.l1.length > 0 && (
                <div className="space-y-2">
                    <div className="text-[10px] font-bold text-emerald-500 bg-emerald-900/20 px-3 py-1 rounded w-fit">LEVEL 1 MEMBERS</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {network.l1.map((u: any) => (
                            <div key={u.id} className="bg-stone-900 border border-stone-800 p-2 rounded flex justify-between items-center">
                                <div className="text-xs font-bold text-stone-200">{u.username}</div>
                                <div className="text-[10px] text-emerald-500">{u.invitedCount}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Level 2 Members */}
            {network.l2.length > 0 && (
                <div className="space-y-2">
                    <div className="text-[10px] font-bold text-blue-500 bg-blue-900/20 px-3 py-1 rounded w-fit">LEVEL 2 MEMBERS</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {network.l2.map((u: any) => (
                            <div key={u.id} className="bg-stone-900 border border-stone-800 p-2 rounded flex justify-between items-center opacity-80">
                                <div className="text-xs font-bold text-stone-300">{u.username}</div>
                                <div className="text-[10px] text-blue-500">{u.invitedCount}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Level 3 Members */}
            {network.l3.length > 0 && (
                <div className="space-y-2">
                    <div className="text-[10px] font-bold text-purple-500 bg-purple-900/20 px-3 py-1 rounded w-fit">LEVEL 3 MEMBERS</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {network.l3.map((u: any) => (
                            <div key={u.id} className="bg-stone-900 border border-stone-800 p-2 rounded flex justify-between items-center opacity-70">
                                <div className="text-xs font-bold text-stone-400">{u.username}</div>
                                <div className="text-[10px] text-purple-500">{u.invitedCount}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
