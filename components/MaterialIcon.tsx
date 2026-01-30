
import React from 'react';
import { BoxSelect, Coins, Gem, FlaskConical, Eye, Sparkles, Hexagon, Mountain } from 'lucide-react';

interface MaterialIconProps {
  id: number;
  size?: string; // Tailwind class like "w-12 h-12"
  className?: string;
  iconSize?: number; // Size for fallback Lucide icons
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({ id, size = "w-12 h-12", className = "", iconSize = 24 }) => {

  const renderRealisticStone = () => (
    <svg viewBox="0 0 64 64" className={`${size} drop-shadow-lg`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 40 L10 25 L30 10 L55 20 L50 45 L35 55 Z" fill="#57534e" stroke="#292524" strokeWidth="2" strokeLinejoin="round" />
      <path d="M30 10 L35 55" stroke="#78716c" strokeWidth="1" opacity="0.3" />
      <path d="M10 25 L50 45" stroke="#78716c" strokeWidth="1" opacity="0.3" />
    </svg>
  );

  const renderRealisticCopper = () => (
    <svg viewBox="0 0 64 64" className={`${size} drop-shadow-lg`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="22" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
      <path d="M20 20 Q32 40 44 20" stroke="#fdba74" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </svg>
  );

  const renderRealisticIron = () => (
    <svg viewBox="0 0 64 64" className={`${size} drop-shadow-lg`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="20" width="34" height="24" fill="#64748b" stroke="#334155" strokeWidth="2" />
      <path d="M15 20 L25 10 L59 10 L49 20" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
      <path d="M49 20 L59 10 L59 34 L49 44" fill="#475569" stroke="#334155" strokeWidth="1" />
    </svg>
  );

  const renderGoldCoin = () => (
    <div className={`relative flex items-center justify-center ${size} ${className}`}>
      {/* Glow behind the coin */}
      <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>

      <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="coin-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
          <linearGradient id="coin-rim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>
          <filter id="inner-shadow">
            <feOffset dx="0" dy="1" />
            <feGaussianBlur stdDeviation="1" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="black" floodOpacity="0.5" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>

        {/* Coin Outer Edge/Rim */}
        <circle cx="32" cy="32" r="28" fill="url(#coin-rim)" />

        {/* Coin Face */}
        <circle cx="32" cy="32" r="24" fill="url(#coin-gold)" stroke="#713f12" strokeWidth="0.5" filter="url(#inner-shadow)" />

        {/* Center Symbol (Mining Pickaxe Icon) */}
        <g transform="translate(18, 18) scale(0.6)">
          <path d="M43.25 15.25L48.5 10L38.5 0L33.25 5.25C26 3.5 18 6 12.5 11.5L25 24L0 49L15 64L40 39L52.5 51.5C58 46 60.5 38 58.75 30.75L53.5 36L43.25 15.25Z"
            fill="#713f12" opacity="0.8" />
        </g>

        {/* Shine Effects */}
        <path d="M12 20 Q32 8 52 20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <circle cx="20" cy="18" r="2" fill="white" opacity="0.5" />

        {/* Embossed Text Style */}
        <text x="32" y="52" fontSize="6" fill="#713f12" textAnchor="middle" fontWeight="black" opacity="0.7">GOLD 99.9</text>
      </svg>
    </div>
  );

  const renderRealisticVibranium = () => (
    <div className={`relative flex items-center justify-center ${size} ${className}`}>
      <div className="absolute inset-0 bg-purple-200/20 blur-xl rounded-full animate-pulse"></div>
      <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 2 L52 22 L42 62 L22 62 L12 22 Z" fill="#0c0a09" stroke="#52525b" strokeWidth="1.5" />
        <path d="M32 2 L32 30" stroke="#52525b" strokeWidth="1" opacity="0.5" />
        <path d="M32 30 L52 22" stroke="#52525b" strokeWidth="1" opacity="0.5" />
        <path d="M32 30 L12 22" stroke="#52525b" strokeWidth="1" opacity="0.5" />
        <path d="M32 30 L42 62" stroke="#52525b" strokeWidth="1" opacity="0.5" />
        <path d="M32 30 L22 62" stroke="#52525b" strokeWidth="1" opacity="0.5" />
        <path d="M25 15 L32 25 L39 15" fill="white" fillOpacity="0.1" />
      </svg>
    </div>
  );

  switch (id) {
    case 0: // Mystery Ore
      return <div className={`${size} rounded-full bg-stone-950 border-2 border-stone-600 flex items-center justify-center text-stone-500 animate-pulse shadow-[0_0_15px_rgba(0,0,0,0.8)] ${className}`}><Eye size={iconSize} className="text-stone-400" /></div>;
    case 1: // Stone
      return renderRealisticStone();
    case 2: // Copper
      return renderRealisticCopper();
    case 3: // Iron
      return renderRealisticIron();
    case 4: // Gold
      return renderGoldCoin();
    case 5: // Diamond
      return <div className={`${size} rounded-full bg-cyan-900/40 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_cyan] ${className}`}><Gem size={iconSize} fill="currentColor" /></div>;
    case 6: // Oil
      return <div className={`${size} rounded-lg bg-black border border-purple-500 flex items-center justify-center text-purple-400 shadow-[0_0_15px_purple] ${className}`}><FlaskConical size={iconSize} fill="currentColor" /></div>;
    case 7: // Vibranium
      return renderRealisticVibranium();
    case 8: // Mystery Ore (Rainbow)
      return (
        <div className={`relative flex items-center justify-center ${size} ${className}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 rounded-full blur opacity-75 animate-pulse"></div>
          <div className="relative z-10 bg-stone-900 rounded-full p-2 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <Sparkles size={iconSize} className="text-white animate-[spin_3s_linear_infinite]" />
          </div>
        </div>
      );
    case 9: // Legendary Ore (Gold Sparkle)
      return (
        <div className={`relative flex items-center justify-center ${size} ${className}`}>
          <div className="absolute inset-0 bg-yellow-400 rounded-full blur opacity-60 animate-pulse"></div>
          <div className="relative z-10 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full p-2 border-2 border-yellow-100 shadow-[0_0_20px_rgba(250,204,21,0.8)]">
            <Gem size={iconSize} className="text-white drop-shadow-md" />
          </div>
        </div>
      );
    default:
      return <div className={`${size} rounded bg-stone-800 border border-stone-600 flex items-center justify-center text-stone-400 ${className}`}><Hexagon size={iconSize} fill="currentColor" /></div>;
  }
};
