import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Pickaxe,
    Factory,
    Globe,
    Map,
    ChevronRight,
    ArrowRight,
    Shield,
    Zap,
    Cpu,
    Gem,
    Languages,
    Rocket
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { MATERIAL_CONFIG } from '../constants';
import { OilRigAnimation } from './OilRigAnimation';
import { TermsModal } from './TermsModal';

interface LandingPageProps {
    onPlayNow: () => void;
    onWhitepaper: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onPlayNow, onWhitepaper }) => {
    const { language, setLanguage, t, formatCurrency } = useLanguage();
    const [marketItems, setMarketItems] = React.useState<any[]>([]);
    const [activeIndex, setActiveIndex] = React.useState(0);

    const RIGS = [
        { id: 1, key: 't1', name: 'Rusty Shovel', theme: 'amber', tier: 1 },
        { id: 2, key: 't2', name: 'Portable Drill', theme: 'cyan', tier: 2 },
        { id: 3, key: 't3', name: 'Coal Excavator', theme: 'slate', tier: 3 },
        { id: 4, key: 't4', name: 'Copper Excavator', theme: 'orange', tier: 4 },
        { id: 5, key: 't5', name: 'Iron Excavator', theme: 'zinc', tier: 5 },
        { id: 6, key: 't6', name: 'Gold Excavator', theme: 'yellow', tier: 6 },
        { id: 7, key: 't7', name: 'Diamond Excavator', theme: 'blue', tier: 7 },
        { id: 8, key: 't8', name: 'Vibranium Reactor', theme: 'purple', tier: 8, special: true },
    ];

    const [stats, setStats] = React.useState({
        usersCount: 0,
        activeRigs: 0,
        marketCap: 0
    });
    const [showTerms, setShowTerms] = React.useState(false);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getLandingStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch landing stats", error);
            }
        };
        fetchStats();
    }, []);

    React.useEffect(() => {
        const fetchMarket = async () => {
            try {
                const marketState = await api.getMarketStatus();
                if (marketState && marketState.trends) {
                    const items = Object.entries(marketState.trends).map(([id, data]) => {
                        const materialId = Number(id);
                        const config = MATERIAL_CONFIG.NAMES[materialId as keyof typeof MATERIAL_CONFIG.NAMES];
                        if (!config) return null;

                        const change = (data.multiplier - 1) * 100;
                        return {
                            name: language === 'th' ? config.th : config.en,
                            price: formatCurrency(data.currentPrice, { showDecimals: true }),
                            change: parseFloat(change.toFixed(2)),
                            up: change >= 0
                        };
                    }).filter(Boolean);
                    setMarketItems(items);
                }
            } catch (error) {
                console.error("Failed to fetch market stats", error);
            }
        };

        fetchMarket();
        const interval = setInterval(fetchMarket, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [language, formatCurrency]);

    const displayData = marketItems.length > 0 ? marketItems : [
        { name: 'Coal', price: '$45', change: 2.5, up: true },
        { name: 'Gold', price: '$1,250', change: 1.8, up: true },
        { name: 'Diamond', price: '$5,400', change: -0.5, up: false },
        { name: 'Crude Oil', price: '$98', change: 3.2, up: true },
        { name: 'Iron', price: '$120', change: 0.8, up: true },
        { name: 'Vibranium', price: '$9,999', change: -1.2, up: false },
    ];

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white font-sans overflow-x-hidden selection:bg-yellow-500/30">
            {/* --- Navigation --- */}
            <nav className="fixed top-0 w-full z-50 bg-[#1a1a1a]/90 backdrop-blur-md border-b border-yellow-600/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <Pickaxe className="text-black" size={24} />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200">
                                GOLD RUSH
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-stone-400">
                            <a href="#home" className="hover:text-yellow-400 transition-colors">{t('landing.nav.home')}</a>
                            <a href="#systems" className="hover:text-yellow-400 transition-colors">{t('landing.nav.systems')}</a>
                            <a href="#market" className="hover:text-yellow-400 transition-colors">{t('landing.nav.market')}</a>
                            <a href="#roadmap" className="hover:text-yellow-400 transition-colors">{t('landing.nav.roadmap')}</a>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-700 bg-[#2a2a2a] hover:bg-[#333] transition-all text-xs font-bold text-yellow-500"
                            >
                                <Languages size={14} />
                                {language === 'en' ? 'THAI' : 'ENGLISH'}
                            </button>

                            <button
                                onClick={onPlayNow}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-8 rounded clip-path-polygon hover:scale-105 transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] flex items-center gap-2 whitespace-nowrap"
                            >
                                {t('landing.nav.playNow')}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- Background Texture & SVG Filters --- */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                {/* SVG Noise for Rocky Texture */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-overlay">
                    <filter id="noiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>

                {/* Cave Shadow Overlay - Lighter version */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-black/80"></div>

                {/* Large Background Watermarks (Mining Icons) */}
                <div className="absolute top-[20%] -left-20 opacity-[0.02] -rotate-12">
                    <Pickaxe size={600} className="text-white" />
                </div>
                <div className="absolute bottom-[10%] -right-20 opacity-[0.02] rotate-12">
                    <Factory size={600} className="text-white" />
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float-dust {
                    0% { transform: translateY(0) translateX(0) rotate(0); opacity: 0; }
                    20% { opacity: 0.4; }
                    80% { opacity: 0.4; }
                    100% { transform: translateY(-100px) translateX(20px) rotate(360deg); opacity: 0; }
                }
                .gold-dust {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: #eab308;
                    border-radius: 50%;
                    filter: blur(1px);
                    pointer-events: none;
                    animation: float-dust linear infinite;
                }
            `}} />

            {/* --- Hero Section --- */}
            <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Immersive Cave Background - Slightly lighter base */}
                <div className="absolute inset-0 bg-[#0f0f0f]">
                    {/* Glowing Ore Deposits (Gradients) - Increased intensity */}
                    <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[radial-gradient(circle_at_70%_20%,_rgba(234,179,8,0.3)_0%,_transparent_60%)]"></div>
                    <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-[radial-gradient(circle_at_20%_80%,_rgba(168,85,247,0.2)_0%,_transparent_60%)]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(30,30,30,0)_0%,_#0f0f0f_85%)]"></div>
                </div>

                {/* Floating Gold Dust */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="gold-dust"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDuration: `${5 + Math.random() * 10}s`,
                                animationDelay: `${-Math.random() * 10}s`,
                                scale: 0.5 + Math.random()
                            }}
                        />
                    ))}
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {t('landing.hero.season')}
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 uppercase">
                        {t('landing.hero.title')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-800 drop-shadow-2xl">
                            {t('landing.hero.titleAccent')}
                        </span>
                    </h1>

                    <p className="text-stone-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        {t('landing.hero.subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <button
                            onClick={onPlayNow}
                            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black text-lg font-black py-4 px-10 rounded-lg shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] transform hover:-translate-y-1 transition-all"
                        >
                            {t('landing.hero.startMining')}
                        </button>
                        <a
                            href="https://line.me/ti/g2/d_jd00pEBf2EKWFyQdkrc2B3FgpwUpZv_ghT0w?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto bg-[#06C755] hover:bg-[#05b34c] text-white text-lg font-bold py-4 px-10 rounded-lg transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(6,199,85,0.3)] hover:shadow-[0_0_40px_rgba(6,199,85,0.5)] transform hover:-translate-y-1"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M21.928 11.607c-.12-4.887-4.482-9.61-10.435-9.605-6.224.005-11.458 4.757-11.488 10.154-.02 3.32 1.954 6.273 5.05 8.163.636.388.932 1.34.73 2.193l-.332 1.765c-.1.527.28.918.73.616l4.636-3.11c.54-.36 1.155-.51 1.738-.458 5.673.504 10.49-3.235 9.37-9.718zm-11.77 2.112h-2.203c-.302 0-.547-.245-.547-.547V8.92c0-.302.245-.547.547-.547.302 0 .547.245.547.547v3.702h1.656c.302 0 .547.245.547.547 0 .302-.245.547-.547.547zm4.27 0h-.547c-.302 0-.547-.245-.547-.547V8.92c0-.302.245-.547.547-.547.302 0 .547.245.547.547v4.25c0 .302-.245.547-.547.547zm3.177 0h-.57c-.302 0-.547-.245-.547-.547V8.92c0-.302.245-.547.547-.547.302 0 .547.245.547.547v2.964l-2.004-2.82c-.114-.15-.29-.24-.48-.24h-.548c-.302 0-.547.245-.547.547v4.25c0 .302.245.547.547.547.302 0 .547-.245.547-.547V10.1l2.008 2.822c.11.154.29.24.48.24h.57c.302 0 .547-.245.547-.547V8.918c0-.302-.245-.547-.547-.547-.302 0-.547.245-.547.547v4.25c.002.302.247.55.55.55z" />
                            </svg>
                            <span>Line</span>
                        </a>
                        <button onClick={onWhitepaper} className="w-full sm:w-auto bg-[#2a2a2a] hover:bg-[#333] border border-stone-700 text-white text-lg font-bold py-4 px-10 rounded-lg transition-all flex items-center justify-center gap-2 group">
                            <span className="group-hover:text-yellow-400 transition-colors uppercase">{t('landing.hero.whitepaper')}</span>
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-stone-800 pt-8 animate-in fade-in zoom-in duration-1000 delay-500">
                        {[
                            { label: t('landing.stats.totalPlayers'), value: stats.usersCount.toLocaleString() },
                            { label: t('landing.stats.totalInvestment'), value: formatCurrency(stats.marketCap) },
                            { label: t('landing.stats.activeRigs'), value: stats.activeRigs.toLocaleString() },
                            { label: t('landing.stats.avgRoi'), value: '18-25%' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</div>
                                <div className="text-xs text-stone-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Live Market Ticker --- */}
            <div className="w-full bg-black/50 border-y border-stone-800 backdrop-blur-sm overflow-hidden py-3">
                <div className="flex whitespace-nowrap animate-marquee">
                    <div className="flex items-center gap-2 mx-8 text-sm font-bold text-yellow-500 uppercase tracking-tighter shrink-0 border-r border-stone-700 pr-8">
                        {t('landing.marketTicker.title')}
                    </div>
                    {[...displayData, ...displayData, ...displayData].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 mx-8 text-sm font-mono">
                            <span className="text-stone-400">{item.name}</span>
                            <span className="font-bold text-white">{item.price}</span>
                            <span className={`flex items-center text-xs ${item.up ? 'text-[#39FF14]' : 'text-red-500'}`}>
                                {item.up ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                                {Math.abs(item.change)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Core Systems --- */}
            <section id="systems" className="py-24 relative overflow-hidden backdrop-blur-xl bg-stone-950/40">
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">{t('landing.systems.title')}</h2>
                        <p className="text-stone-400 max-w-2xl mx-auto">{t('landing.systems.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Mining Rigs */}
                        <div className="group relative bg-stone-900/80 border border-stone-800 p-8 rounded-2xl hover:border-yellow-500/50 transition-all hover:-translate-y-1 backdrop-blur-md">
                            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                            <div className="w-full h-48 mb-6 relative">
                                <OilRigAnimation rigName="Vibranium Reactor" isActive={true} tier={8} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">{t('landing.systems.mining.title')}</h3>
                            <p className="text-stone-400 mb-6 leading-relaxed">
                                {t('landing.systems.mining.desc')}
                            </p>
                            <ul className="space-y-3 text-stone-500 text-sm border-t border-stone-800 pt-6">
                                {t('landing.systems.mining.features').map((f: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div> {f}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Crafting */}
                        <div className="group relative bg-stone-900/80 border border-stone-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all hover:-translate-y-1 backdrop-blur-md">
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

                            {/* High-Fidelity Extraction UI Visual */}
                            <div className="w-full h-56 mb-6 bg-[#0c0c0c] rounded-xl relative overflow-hidden border border-white/10 flex flex-col items-center justify-center p-4">
                                {/* Form Title */}
                                <div className="text-center mb-4 relative z-10 scale-[0.8]">
                                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                        <Gem size={14} className="text-yellow-500 fill-yellow-500/20" />
                                        <span className="text-[10px] font-black text-white whitespace-nowrap">ยืนยันการสกัด (EXTRACTION FORM)</span>
                                    </div>
                                    <div className="text-[7px] text-yellow-600 font-bold uppercase tracking-widest">กระบวนการสกัดและแปรรูปทรัพยากร (TIER 4)</div>
                                </div>

                                <div className="flex items-center gap-1.5 relative z-10 scale-[0.85] lg:scale-100">
                                    {/* Ingredients Grid */}
                                    <div className="flex items-start gap-1">
                                        {[
                                            { color: 'bg-orange-600', label: 'ทองแดง', qty: 'x1' },
                                            { color: 'bg-zinc-400', label: 'เหล็ก', qty: 'x1' },
                                            { color: 'bg-yellow-500', label: 'ทองคำ', qty: 'x1' },
                                            { color: 'bg-green-600', label: 'บาท', qty: 'x8.75' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 bg-black/60 border border-stone-800 rounded-lg flex items-center justify-center relative shadow-inner">
                                                    <div className={`w-5 h-4 ${item.color} rounded-sm shadow-lg`}></div>
                                                    <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-[6px] font-bold text-white px-1 rounded-sm border border-red-400 shadow-md">{item.qty}</div>
                                                </div>
                                                <span className="text-[6px] text-stone-500 truncate w-10 text-center">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-stone-700 mx-0.5">
                                        <ArrowRight size={14} className="group-hover:text-blue-500 transition-colors" />
                                    </div>

                                    {/* Result */}
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                                            <div className="w-14 h-14 bg-black/80 border-2 border-yellow-500/50 rounded-xl flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                                                <Gem size={24} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                                                <div className="absolute -bottom-1.5 -right-1.5 bg-yellow-600 text-[6px] font-bold text-white px-1 rounded-sm border border-yellow-400 shadow-md">x1</div>
                                            </div>
                                        </div>
                                        <span className="text-[6px] font-bold text-yellow-500">เพชร</span>
                                    </div>
                                </div>

                                {/* Background Glow */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.05)_0%,_transparent_70%)]"></div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">{t('landing.systems.crafting.title')}</h3>
                            <p className="text-stone-400 mb-6 leading-relaxed">
                                {t('landing.systems.crafting.desc')}
                            </p>
                            <ul className="space-y-3 text-stone-500 text-sm border-t border-stone-800 pt-6">
                                {t('landing.systems.crafting.features').map((f: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {f}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Global Market */}
                        <div className="group relative bg-stone-900/80 border border-stone-800 p-8 rounded-2xl hover:border-green-500/50 transition-all hover:-translate-y-1 backdrop-blur-md">
                            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

                            {/* Mini Market Dashboard Visual */}
                            <div className="w-full h-48 mb-6 bg-black/40 rounded-xl relative overflow-hidden border border-white/5 flex flex-col p-4">
                                <div className="flex justify-between items-center mb-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={16} className="text-green-500" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Live Market</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-8 h-3 bg-red-500/20 border border-red-500/30 rounded-sm text-[8px] flex items-center justify-center text-red-500">Sell</div>
                                        <div className="w-8 h-3 bg-green-500/20 border border-green-500/30 rounded-sm text-[8px] flex items-center justify-center text-green-500">Buy</div>
                                    </div>
                                </div>

                                <div className="flex flex-1 gap-4 relative z-10">
                                    {/* Ticker List */}
                                    <div className="flex-1 space-y-2">
                                        {[
                                            { name: 'Diamond', price: '106฿', up: true },
                                            { name: 'Gold', price: '51฿', up: false },
                                            { name: 'Iron', price: '34฿', up: true },
                                        ].map((m, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white/5 p-1 rounded-sm border border-white/5">
                                                <span className="text-[8px] text-stone-400">{m.name}</span>
                                                <span className={`text-[8px] font-mono ${m.up ? 'text-green-500' : 'text-red-500'}`}>{m.price}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Price Chart */}
                                    <div className="flex-1 relative">
                                        <svg className="w-full h-full" viewBox="0 0 100 50">
                                            <path
                                                d="M0,45 C10,40 20,40 30,30 S50,45 60,20 S80,10 100,5"
                                                fill="none"
                                                stroke="url(#chartGradient)"
                                                strokeWidth="2"
                                                className="animate-[shimmer_2s_infinite]"
                                            />
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                                                    <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
                                                </linearGradient>
                                            </defs>
                                            <circle cx="100" cy="5" r="3" fill="#22c55e" className="animate-pulse shadow-[0_0_10px_#22c55e]" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">{t('landing.systems.market.title')}</h3>
                            <p className="text-stone-400 mb-6 leading-relaxed">
                                {t('landing.systems.market.desc')}
                            </p>
                            <ul className="space-y-3 text-stone-500 text-sm border-t border-stone-800 pt-6">
                                {t('landing.systems.market.features').map((f: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> {f}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Exploration */}
                        <div className="group relative bg-stone-900/80 border border-stone-800 p-8 rounded-2xl hover:border-purple-500/50 transition-all hover:-translate-y-1 backdrop-blur-md">
                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

                            {/* Mini Mission Dashboard Visual */}
                            <div className="w-full h-48 mb-6 bg-black/40 rounded-xl relative overflow-hidden border border-white/5 flex flex-col p-4">
                                <div className="flex items-center gap-3 mb-3 relative z-10">
                                    <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Rocket size={20} className="text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-white uppercase tracking-tight">Crystal Caverns</div>
                                        <div className="flex gap-2">
                                            <span className="text-[8px] text-stone-500">12 Hours</span>
                                            <span className="text-[8px] text-green-500 font-bold">Lvl 1+</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 relative z-10">
                                    {/* Stats bars */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[8px] text-stone-400 mb-0.5">
                                            <span>Common Rewards</span>
                                            <span className="text-green-500">80%</span>
                                        </div>
                                        <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 w-[80%]"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[8px] text-stone-400 mb-0.5">
                                            <span>Jackpot Prize</span>
                                            <span className="text-yellow-500">20%</span>
                                        </div>
                                        <div className="h-1 bg-stone-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-500 w-[20%] animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex justify-center relative z-10">
                                    <div className="w-full py-1 bg-purple-500/20 border border-purple-500/40 rounded text-[8px] font-bold text-purple-300 flex items-center justify-center gap-1 group-hover:bg-purple-500/40 transition-colors">
                                        Select Mission <ArrowRight size={8} />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">{t('landing.systems.exploration.title')}</h3>
                            <p className="text-stone-400 mb-6 leading-relaxed">
                                {t('landing.systems.exploration.desc')}
                            </p>
                            <ul className="space-y-3 text-stone-500 text-sm border-t border-stone-800 pt-6">
                                {t('landing.systems.exploration.features').map((f: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div> {f}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Rig Showcase --- */}
            <section id="rigs" className="py-24 bg-stone-950/50 relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight">{t('landing.rigShowcase.title')}</h2>
                        <p className="text-stone-300 max-w-2xl mx-auto">{t('landing.rigShowcase.subtitle')}</p>
                    </div>

                    {/* Fanned Cards - Poker Hand Layout */}
                    <div className="relative flex flex-col items-center">
                        {/* Desktop: Fan Layout */}
                        <div className="hidden md:block relative w-full max-w-5xl h-[520px]" style={{ perspective: '1200px' }}>
                            {RIGS.map((rig, idx) => {
                                const isActive = activeIndex === idx;
                                const total = RIGS.length;
                                const mid = (total - 1) / 2;
                                const offset = idx - mid;

                                // Fan spread: rotation and position from bottom pivot
                                const rotateAngle = offset * 7; // degrees between cards
                                const translateY = Math.abs(offset) * Math.abs(offset) * 6; // parabolic rise at edges
                                const translateX = offset * 75; // horizontal spread

                                return (
                                    <div
                                        key={rig.id}
                                        onClick={() => setActiveIndex(idx)}
                                        className="absolute cursor-pointer transition-all duration-500 ease-out"
                                        style={{
                                            width: '200px',
                                            left: '50%',
                                            bottom: '20px',
                                            transformOrigin: 'center bottom',
                                            transform: `
                                                translateX(calc(-50% + ${translateX}px)) 
                                                translateY(${isActive ? -40 - translateY : -translateY}px)
                                                rotate(${isActive ? 0 : rotateAngle}deg) 
                                                ${isActive ? 'scale(1.15)' : 'scale(1)'}
                                            `,
                                            zIndex: isActive ? 50 : 10 + idx,
                                            filter: isActive ? 'none' : 'brightness(0.7)',
                                        }}
                                    >
                                        <div className={`
                                            relative bg-stone-900 border-2 rounded-2xl p-4 shadow-2xl h-[380px] flex flex-col justify-between overflow-hidden
                                            transition-all duration-500
                                            ${isActive ? `border-${rig.theme}-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]` : 'border-stone-800 hover:border-stone-600'}
                                            ${rig.special ? 'bg-gradient-to-br from-stone-900 to-black' : ''}
                                        `}>
                                            {/* Glow */}
                                            {isActive && (
                                                <div className={`absolute inset-0 bg-gradient-to-t from-${rig.theme}-500/15 to-transparent`}></div>
                                            )}

                                            {/* Top Label */}
                                            <div className="flex justify-between items-start relative z-10">
                                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                                                    ${isActive ? `bg-${rig.theme}-500/10 border-${rig.theme}-500/30 text-${rig.theme}-400` : 'bg-stone-800 border-stone-700 text-stone-400'}
                                                `}>
                                                    Tier {rig.tier}
                                                </div>
                                                {rig.tier === 1 && (
                                                    <div className="bg-yellow-500 text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase">Free</div>
                                                )}
                                            </div>

                                            {/* Rig Image */}
                                            <div className="flex-1 flex items-center justify-center py-2 relative">
                                                <div className={`absolute w-32 h-32 blur-3xl rounded-full bg-${rig.theme}-500/10`}></div>
                                                <div className="transform scale-90 relative z-10">
                                                    <OilRigAnimation rigName={rig.name} isActive={true} tier={rig.tier} />
                                                </div>
                                            </div>

                                            {/* Name */}
                                            <div className="text-center relative z-10">
                                                <h4 className={`text-sm font-black mb-1 ${rig.special ? `text-transparent bg-clip-text bg-gradient-to-r from-${rig.theme}-400 to-pink-500` : 'text-white'}`}>
                                                    {t(`landing.rigShowcase.${rig.key}.name`)}
                                                </h4>
                                                <div className={`w-6 h-0.5 mx-auto rounded-full bg-${rig.theme}-500`}></div>
                                                {isActive && (
                                                    <p className="text-stone-400 text-[10px] mt-2 leading-snug animate-in fade-in duration-300">
                                                        {t(`landing.rigShowcase.${rig.key}.desc`)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mobile: Horizontal Scroll */}
                        <div className="md:hidden w-full overflow-x-auto pb-4 -mx-4 px-4">
                            <div className="flex gap-4" style={{ width: `${RIGS.length * 200}px` }}>
                                {RIGS.map((rig, idx) => {
                                    const isActive = activeIndex === idx;
                                    return (
                                        <div
                                            key={rig.id}
                                            onClick={() => setActiveIndex(idx)}
                                            className={`
                                                flex-shrink-0 w-[180px] bg-stone-900 border-2 rounded-2xl p-4 shadow-xl cursor-pointer
                                                transition-all duration-300
                                                ${isActive ? `border-${rig.theme}-500 shadow-${rig.theme}-500/20 scale-105` : 'border-stone-800'}
                                            `}
                                        >
                                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit
                                                ${isActive ? `bg-${rig.theme}-500/10 border-${rig.theme}-500/30 text-${rig.theme}-400` : 'bg-stone-800 border-stone-700 text-stone-400'}
                                            `}>
                                                Tier {rig.tier}
                                            </div>
                                            <div className="flex items-center justify-center py-4">
                                                <div className="transform scale-75">
                                                    <OilRigAnimation rigName={rig.name} isActive={true} tier={rig.tier} />
                                                </div>
                                            </div>
                                            <h4 className="text-xs font-black text-white text-center">
                                                {t(`landing.rigShowcase.${rig.key}.name`)}
                                            </h4>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={onPlayNow}
                                className={`group bg-${RIGS[activeIndex].theme}-500 hover:brightness-110 text-black font-black px-12 py-4 rounded-xl shadow-xl transition-all flex items-center gap-2 mx-auto`}
                            >
                                {t('landing.rigShowcase.cta')}
                                <Zap size={18} className="fill-black group-hover:animate-pulse" />
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- Roadmap --- */}

            <section id="roadmap" className="py-24 bg-stone-950 border-t border-stone-900 relative overflow-hidden">
                {/* Background Mining Glow */}
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full -translate-y-1/2"></div>
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full -translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase">{t('landing.roadmap.title')}</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left relative">
                        {/* Seismic Vibration Line (Desktop) */}
                        <div className="hidden md:block absolute top-8 left-0 w-full z-0">
                            <svg className="w-full h-4" viewBox="0 0 1200 16" preserveAspectRatio="none">
                                <path
                                    d="M0,8 L50,8 L55,2 L60,14 L65,4 L70,12 L75,6 L80,10 L85,8 L200,8 L205,3 L210,13 L215,5 L220,11 L225,7 L230,9 L235,8 L400,8 L405,2 L410,14 L415,4 L420,12 L425,6 L430,10 L435,8 L600,8 L605,3 L610,13 L615,5 L620,11 L625,7 L630,9 L635,8 L800,8 L805,2 L810,14 L815,4 L820,12 L825,6 L830,10 L835,8 L1000,8 L1005,3 L1010,13 L1015,5 L1020,11 L1025,7 L1030,9 L1035,8 L1200,8"
                                    fill="none"
                                    stroke="url(#seismicGrad)"
                                    strokeWidth="1.5"
                                    className="animate-pulse"
                                />
                                <defs>
                                    <linearGradient id="seismicGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
                                        <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#6b7280" stopOpacity="0.3" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        {[
                            { phase: 'Phase 1', status: 'completed', data: t('landing.roadmap.phase1'), icon: '⛏️', accent: 'yellow' },
                            { phase: 'Phase 2', status: 'current', data: t('landing.roadmap.phase2'), icon: '💎', accent: 'purple' },
                            { phase: 'Phase 3', status: 'future', data: t('landing.roadmap.phase3'), icon: '🏔️', accent: 'stone' },
                        ].map((p, i) => (
                            <div key={i} className="relative z-10">
                                {/* Mining Icon Node */}
                                <div className={`w-16 h-16 mx-auto md:mx-0 rounded-xl flex items-center justify-center text-2xl font-bold mb-6 border-2 transform rotate-45 shadow-lg ${p.status === 'completed' ? 'bg-gradient-to-br from-yellow-500 to-yellow-700 border-yellow-400 shadow-yellow-500/30' :
                                    p.status === 'current' ? 'bg-gradient-to-br from-purple-900 to-purple-700 border-purple-500 shadow-purple-500/30 animate-pulse' :
                                        'bg-stone-900 border-stone-700 shadow-none'
                                    }`}>
                                    <span className="transform -rotate-45">{p.icon}</span>
                                </div>
                                <h3 className={`text-xl font-bold mb-3 uppercase ${p.status === 'completed' ? 'text-yellow-500' :
                                    p.status === 'current' ? 'text-purple-400' :
                                        'text-stone-500'
                                    }`}>{p.phase}: {p.data.title}</h3>
                                {p.data.tagline && (
                                    <p className={`text-xs mb-3 italic ${p.status === 'future' ? 'text-stone-600' : 'text-stone-400'}`}>"{p.data.tagline}"</p>
                                )}
                                <ul className="space-y-2">
                                    {p.data.items.map((item: string, j: number) => (
                                        <li key={j} className={`flex items-center text-sm gap-2 ${p.status === 'future' ? 'text-stone-600' : 'text-stone-400'}`}>
                                            <span className={`text-[8px] ${p.status === 'completed' ? 'text-yellow-500' :
                                                p.status === 'current' ? 'text-purple-500' :
                                                    'text-stone-700'
                                                }`}>◆</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA Section --- */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-yellow-600/10"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight uppercase">
                        {t('landing.cta.title')} <br />
                        <span className="text-yellow-500">{t('landing.cta.titleAccent')}</span>
                    </h2>
                    <button
                        onClick={onPlayNow}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black text-xl font-black py-5 px-12 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] transform hover:scale-110 transition-all uppercase"
                    >
                        {t('landing.cta.button')}
                    </button>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="bg-black py-12 border-t border-stone-900 text-stone-500 text-sm">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Pickaxe className="text-yellow-600" size={20} />
                            <span className="font-bold text-white tracking-widest uppercase">GOLD RUSH</span>
                        </div>
                        <p className="max-w-xs">{t('landing.footer.desc')}</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider mb-4">{t('landing.footer.community')}</h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="https://line.me/ti/g2/d_jd00pEBf2EKWFyQdkrc2B3FgpwUpZv_ghT0w?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-[#06C755] transition-colors flex items-center gap-2"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#06C755]">
                                        <path d="M21.928 11.607c-.12-4.887-4.482-9.61-10.435-9.605-6.224.005-11.458 4.757-11.488 10.154-.02 3.32 1.954 6.273 5.05 8.163.636.388.932 1.34.73 2.193l-.332 1.765c-.1.527.28.918.73.616l4.636-3.11c.54-.36 1.155-.51 1.738-.458 5.673.504 10.49-3.235 9.37-9.718zm-11.77 2.112h-2.203c-.302 0-.547-.245-.547-.547V8.92c0-.302.245-.547.547-.547.302 0 .547.245.547.547v3.702h1.656c.302 0 .547.245.547.547 0 .302-.245.547-.547.547zm4.27 0h-.547c-.302 0-.547-.245-.547-.547V8.92c0-.302.245-.547.547-.547.302 0 .547.245.547.547v4.25c0 .302-.245.547-.547.547zm3.177 0h-.57c-.302 0-.547-.245-.547-.547V8.92c0-.302.245-.547.547-.547.302 0 .547.245.547.547v2.964l-2.004-2.82c-.114-.15-.29-.24-.48-.24h-.548c-.302 0-.547.245-.547.547v4.25c0 .302.245.547.547.547.302 0 .547-.245.547-.547V10.1l2.008 2.822c.11.154.29.24.48.24h.57c.302 0 .547-.245.547-.547V8.918c0-.302-.245-.547-.547-.547-.302 0-.547.245-.547.547v4.25c.002.302.247.55.55.55z" />
                                    </svg>
                                    Line Community
                                </a>
                            </li>
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Facebook Group</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider mb-4">{t('landing.footer.legal')}</h4>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => setShowTerms(true)}
                                    className="hover:text-yellow-500 transition-colors"
                                >
                                    Terms of Service
                                </button>
                            </li>
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Privacy Policy</a></li>
                            <li><button onClick={onWhitepaper} className="hover:text-yellow-500 transition-colors">Whitepaper</button></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center bg-black">
                    <div>&copy; 2026 GOLD RUSH. {t('landing.footer.rights')}</div>
                    <div className="mt-4 md:mt-0 flex gap-4">
                        <Shield size={16} />
                        <span>{t('landing.footer.secure')}</span>
                    </div>
                </div>
            </footer>

            <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        </div>
    );
};
