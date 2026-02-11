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
    Languages
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { MATERIAL_CONFIG } from '../constants';
import { OilRigAnimation } from './OilRigAnimation';

interface LandingPageProps {
    onPlayNow: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onPlayNow }) => {
    const { language, setLanguage, t, formatCurrency } = useLanguage();
    const [marketItems, setMarketItems] = React.useState<any[]>([]);

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

            {/* --- Hero Section --- */}
            <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-[#1a1a1a] to-[#1a1a1a]"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1623228723236-40742d44933a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>

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

                    <p className="text-stone-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        {t('landing.hero.subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <button
                            onClick={onPlayNow}
                            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black text-lg font-black py-4 px-10 rounded-lg shadow-[0_0_40px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] transform hover:-translate-y-1 transition-all"
                        >
                            {t('landing.hero.startMining')}
                        </button>
                        <button className="w-full sm:w-auto bg-[#2a2a2a] hover:bg-[#333] border border-stone-700 text-white text-lg font-bold py-4 px-10 rounded-lg transition-all flex items-center justify-center gap-2 group">
                            <span className="group-hover:text-yellow-400 transition-colors uppercase">{t('landing.hero.whitepaper')}</span>
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-stone-800 pt-8 animate-in fade-in zoom-in duration-1000 delay-500">
                        {[
                            { label: t('landing.stats.totalPlayers'), value: '28' },
                            { label: t('landing.stats.totalInvestment'), value: '฿582,857' },
                            { label: t('landing.stats.activeRigs'), value: '52' },
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
            <section id="systems" className="py-24 bg-[#1a1a1a] relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase">{t('landing.systems.title')}</h2>
                        <div className="w-24 h-1 bg-yellow-500 mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Mining Rigs */}
                        <div className="group relative bg-stone-900 border border-stone-800 p-8 rounded-2xl hover:border-yellow-500/50 transition-all hover:-translate-y-1">
                            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                            <div className="w-full h-48 mb-6 relative">
                                <OilRigAnimation rigName="Vibranium Reactor" isActive={true} tier={6} />
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
                        <div className="group relative bg-stone-900 border border-stone-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all hover:-translate-y-1">
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                            <Factory className="text-blue-500 mb-6" size={48} />
                            <h3 className="text-2xl font-bold mb-4 text-white">{t('landing.systems.crafting.title')}</h3>
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
                        <div className="group relative bg-stone-900 border border-stone-800 p-8 rounded-2xl hover:border-green-500/50 transition-all hover:-translate-y-1">
                            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                            <Globe className="text-green-500 mb-6" size={48} />
                            <h3 className="text-2xl font-bold mb-4 text-white">{t('landing.systems.market.title')}</h3>
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
                        <div className="group relative bg-stone-900 border border-stone-800 p-8 rounded-2xl hover:border-purple-500/50 transition-all hover:-translate-y-1">
                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                            <Map className="text-purple-500 mb-6" size={48} />
                            <h3 className="text-2xl font-bold mb-4 text-white">{t('landing.systems.exploration.title')}</h3>
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
                        <p className="text-stone-400 max-w-2xl mx-auto">{t('landing.rigShowcase.subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Highlighted Free Rig (T1) */}
                        <div className="lg:col-span-2 lg:row-span-2 group relative bg-gradient-to-br from-stone-900 to-black border-2 border-yellow-500/50 p-8 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.15)] overflow-hidden flex flex-col justify-between h-full">
                            <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest animate-pulse">
                                {t('landing.rigShowcase.freeTag')}
                            </div>

                            <div>
                                <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold uppercase">
                                    <Zap size={14} className="fill-yellow-500" />
                                    {t('landing.rigShowcase.freeLabel')}
                                </div>
                                <h3 className="text-4xl font-black text-white mb-4 group-hover:text-yellow-400 transition-colors uppercase">
                                    {t('landing.rigShowcase.t1.name')}
                                </h3>
                                <p className="text-stone-400 text-lg mb-8 max-w-md">
                                    {t('landing.rigShowcase.t1.desc')}
                                </p>
                            </div>

                            <div className="relative h-64 w-full flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent blur-3xl rounded-full"></div>
                                <Pickaxe className="text-yellow-500 relative z-10 w-48 h-48 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)] transform -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                            </div>

                            <button
                                onClick={onPlayNow}
                                className="mt-8 w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                {t('landing.rigShowcase.cta')}
                                <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
                            </button>
                        </div>

                        {/* Other Rigs Grid */}
                        {[
                            { id: 2, key: 't2', color: 'blue', icon: Zap },
                            { id: 3, key: 't3', color: 'stone', icon: Factory },
                            { id: 4, key: 't4', color: 'orange', icon: Cpu },
                            { id: 5, key: 't5', color: 'stone', icon: Shield },
                            { id: 6, key: 't6', color: 'yellow', icon: Zap },
                            { id: 7, key: 't7', color: 'cyan', icon: Gem },
                        ].map((rig) => (
                            <div key={rig.id} className="group bg-stone-900 border border-stone-800 p-6 rounded-2xl hover:border-white/20 transition-all flex flex-col justify-between">
                                <div>
                                    <div className={`mb-4 w-12 h-12 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center group-hover:border-yellow-500/50 transition-colors`}>
                                        <rig.icon className="text-stone-400 group-hover:text-yellow-500 transition-colors" size={24} />
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                                        {t(`landing.rigShowcase.${rig.key}.name`)}
                                    </h4>
                                    <p className="text-stone-500 text-xs leading-relaxed">
                                        {t(`landing.rigShowcase.${rig.key}.desc`)}
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-stone-600">
                                    <span>Asset TIER {rig.id}</span>
                                </div>
                            </div>
                        ))}

                        {/* T8 Special Reactor */}
                        <div className="group bg-[#0a0a0a] border border-purple-500/30 p-6 rounded-2xl hover:border-purple-500 transition-all shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                            <div className="mb-4 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center animate-pulse">
                                <Zap className="text-purple-500 fill-purple-500/30" size={24} />
                            </div>
                            <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
                                {t('landing.rigShowcase.t8.name')}
                            </h4>
                            <p className="text-stone-500 text-xs leading-relaxed">
                                {t('landing.rigShowcase.t8.desc')}
                            </p>
                            <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-purple-900">
                                <span>Legendary Asset</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Roadmap --- */}

            <section id="roadmap" className="py-24 bg-stone-950 border-t border-stone-900">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase">{t('landing.roadmap.title')}</h2>
                        <div className="w-24 h-1 bg-yellow-500 mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-stone-800 z-0"></div>

                        {[
                            { phase: 'Phase 1', status: 'completed', data: t('landing.roadmap.phase1') },
                            { phase: 'Phase 2', status: 'current', data: t('landing.roadmap.phase2') },
                            { phase: 'Phase 3', status: 'future', data: t('landing.roadmap.phase3') },
                        ].map((p, i) => (
                            <div key={i} className="relative z-10">
                                <div className={`w-16 h-16 mx-auto md:mx-0 rounded-full flex items-center justify-center text-xl font-bold mb-6 border-4 ${p.status === 'completed' ? 'bg-yellow-500 border-yellow-500 text-black' :
                                    p.status === 'current' ? 'bg-stone-900 border-yellow-500 text-yellow-500 animate-pulse' :
                                        'bg-stone-900 border-stone-700 text-stone-700'
                                    }`}>
                                    {i + 1}
                                </div>
                                <h3 className={`text-xl font-bold mb-2 uppercase ${p.status === 'future' ? 'text-stone-500' : 'text-white'}`}>{p.phase}: {p.data.title}</h3>
                                <ul className="space-y-2">
                                    {p.data.items.map((item: string, j: number) => (
                                        <li key={j} className={`flex items-center text-sm ${p.status === 'future' ? 'text-stone-600' : 'text-stone-400'}`}>• {item}</li>
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
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Discord Server</a></li>
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Facebook Group</a></li>
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Twitter / X</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider mb-4">{t('landing.footer.legal')}</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-yellow-500 transition-colors">Whitepaper</a></li>
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
        </div>
    );
};
