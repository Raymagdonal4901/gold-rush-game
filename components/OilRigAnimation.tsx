
import React from 'react';
import { Rarity } from '../types';

interface OilRigAnimationProps {
  isActive?: boolean;
  rarity?: Rarity;
  tier?: number; // 1 to 5 based on investment
}

export const OilRigAnimation: React.FC<OilRigAnimationProps> = ({ isActive = true, rarity = 'COMMON', tier = 1 }) => {

  // Rarity colors for particles
  const getParticleColor = () => {
    switch (rarity) {
      case 'LEGENDARY': return '#facc15';
      case 'EPIC': return '#fb923c';
      case 'SUPER_RARE': return '#c084fc';
      case 'RARE': return '#60a5fa';
      default: return '#fef08a';
    }
  };

  const particleColor = getParticleColor();

  // --- TIER 1: Coal Shovel (Digging Animation) ---
  const renderTier1 = () => (
    <g transform="translate(100, 80)">
      {/* Coal Pile */}
      <path d="M-40 40 Q0 -10 40 40 Z" fill="#1c1917" stroke="#0c0a09" strokeWidth="2" />
      <circle cx="-10" cy="30" r="4" fill="#292524" />
      <circle cx="15" cy="25" r="5" fill="#292524" />
      <circle cx="5" cy="35" r="3" fill="#292524" />

      {/* Digging Shovel Group */}
      <g className={isActive ? "animate-[swing_1.5s_ease-in-out_infinite]" : ""} style={{ transformOrigin: '20px -20px' }}>
        {/* Handle */}
        <path d="M20 -40 L0 10" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
        <circle cx="20" cy="-40" r="4" fill="#92400e" />

        {/* Spade Head */}
        <path d="M-5 10 L5 10 L5 25 Q0 35 -5 25 Z" fill="#57534e" stroke="#292524" strokeWidth="1" />
      </g>

      {/* Flying Debris Particles */}
      {isActive && (
        <g>
          <circle cx="-10" cy="20" r="2" fill="#44403c" className="animate-[float-gold_1s_infinite]" style={{ animationDelay: '0.2s' }} />
          <circle cx="10" cy="20" r="1.5" fill="#292524" className="animate-[float-gold_1s_infinite]" style={{ animationDelay: '0.7s' }} />
        </g>
      )}
    </g>
  );

  // --- TIER 2: Copper Sifting Device (Sluice Box) ---
  const renderTier2 = () => (
    <g transform="translate(100, 75)">
      {/* Legs */}
      <path d="M-40 40 L-40 60" stroke="#44403c" strokeWidth="4" />
      <path d="M40 30 L40 60" stroke="#44403c" strokeWidth="4" />

      {/* The Box */}
      <g className={isActive ? "animate-[shake_0.2s_linear_infinite]" : ""}>
        <rect x="-60" y="10" width="120" height="30" fill="#78350f" stroke="#451a03" strokeWidth="2" transform="rotate(5)" />

        {/* Water flowing */}
        <path d="M-55 12 L55 22" stroke="#38bdf8" strokeWidth="20" strokeOpacity="0.5" strokeLinecap="round" transform="rotate(5)" className={isActive ? "animate-pulse" : ""} />

        {/* Riffles */}
        <path d="M-30 15 L-30 35" stroke="#451a03" strokeWidth="3" transform="rotate(5)" />
        <path d="M0 18 L0 38" stroke="#451a03" strokeWidth="3" transform="rotate(5)" />
        <path d="M30 21 L30 41" stroke="#451a03" strokeWidth="3" transform="rotate(5)" />

        {/* Nuggets */}
        {isActive && (
          <g transform="rotate(5)">
            <circle cx="-25" cy="25" r="3" fill="#f97316" className="animate-[bounce_0.5s_infinite]" />
            <circle cx="5" cy="28" r="4" fill="#fb923c" className="animate-[bounce_0.6s_infinite]" />
            <circle cx="35" cy="31" r="2.5" fill="#fdba74" className="animate-[bounce_0.7s_infinite]" />
          </g>
        )}
      </g>

      {/* Style for Shake */}
      <style>{`
            @keyframes shake {
                0% { transform: translate(0,0); }
                25% { transform: translate(1px, 1px); }
                50% { transform: translate(0,0); }
                75% { transform: translate(-1px, -1px); }
                100% { transform: translate(0,0); }
            }
        `}</style>
    </g>
  );

  // --- TIER 3: Iron Mill (Crusher/Spinning Animation) ---
  const renderTier3 = () => (
    <g transform="translate(100, 80)">
      {/* Structure Base */}
      <path d="M-30 40 L-40 50 L40 50 L30 40 Z" fill="#3f3f46" />
      <rect x="-30" y="-10" width="60" height="50" fill="#52525b" stroke="#27272a" strokeWidth="2" />

      {/* Hopper Top */}
      <path d="M-30 -10 L-40 -30 L40 -30 L30 -10 Z" fill="#71717a" stroke="#27272a" strokeWidth="1" />

      {/* Spinning Grinder Wheel (Center) */}
      <circle cx="0" cy="15" r="18" fill="#27272a" />
      <g className={isActive ? "animate-[spin_2s_linear_infinite]" : ""}>
        <circle cx="0" cy="15" r="15" stroke="#d4d4d8" strokeWidth="2" strokeDasharray="6 4" fill="none" />
        <line x1="0" y1="0" x2="0" y2="30" stroke="#71717a" strokeWidth="2" />
        <line x1="-15" y1="15" x2="15" y2="15" stroke="#71717a" strokeWidth="2" />
      </g>

      {/* Output Chute */}
      <path d="M30 20 L50 30" stroke="#52525b" strokeWidth="6" />

      {/* Crushed Iron/Dust */}
      {isActive && (
        <g transform="translate(50, 30)">
          <circle r="1.5" fill="#9ca3af" className="animate-[float-gold_0.8s_infinite]" />
          <circle r="1" fill="#cbd5e1" className="animate-[float-gold_0.6s_infinite]" style={{ animationDelay: '0.2s' }} />
        </g>
      )}
    </g>
  );

  // --- TIER 4: Gold Furnace (Melting Animation) ---
  const renderTier4 = () => (
    <g transform="translate(100, 80)">
      {/* Furnace Base */}
      <path d="M-30 50 L-35 0 L35 0 L30 50 Z" fill="#27272a" stroke="#57534e" strokeWidth="2" />
      <rect x="-35" y="50" width="70" height="10" fill="#18181b" />

      {/* Molten Gold Top Surface */}
      <ellipse cx="0" cy="0" rx="35" ry="8" fill="#ca8a04" stroke="#eab308" strokeWidth="2" />
      <ellipse cx="0" cy="0" rx="28" ry="5" fill="#facc15" className={isActive ? "animate-pulse" : ""} />

      {/* Heat/Smoke */}
      {isActive && (
        <g opacity="0.6">
          <circle cx="-10" cy="-20" r="5" fill="#fbbf24" className="animate-[float-gold_1.5s_infinite]" />
          <circle cx="10" cy="-30" r="3" fill="#f59e0b" className="animate-[float-gold_2s_infinite]" />
          <path d="M-20 -10 Q-30 -30 -20 -50" stroke="#ef4444" strokeWidth="2" fill="none" className="animate-[pulse_1s_infinite]" />
          <path d="M20 -10 Q30 -30 20 -50" stroke="#ef4444" strokeWidth="2" fill="none" className="animate-[pulse_1.2s_infinite]" />
        </g>
      )}

      {/* Window/Grate */}
      <rect x="-15" y="15" width="30" height="20" rx="2" fill="#451a03" />
      <path d="M-15 25 L15 25" stroke="#78350f" />
      <path d="M0 15 L0 35" stroke="#78350f" />
      {isActive && <circle cx="0" cy="25" r="8" fill="#ef4444" className="animate-pulse blur-sm" />}
    </g>
  );

  // --- TIER 5: Diamond Laser Drill (High Tech Animation) ---
  const renderTier5 = () => (
    <g transform="translate(100, 70)">
      {/* Ground */}
      <path d="M-60 70 L60 70" stroke="#06b6d4" strokeWidth="2" opacity="0.5" />

      {/* Drill Tower Structure */}
      <path d="M-20 -50 L-30 70" stroke="#1e293b" strokeWidth="4" />
      <path d="M20 -50 L30 70" stroke="#1e293b" strokeWidth="4" />
      <rect x="-25" y="-60" width="50" height="20" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />

      {/* Main Laser Core */}
      <g className={isActive ? "animate-[pulse_0.2s_infinite]" : ""}>
        {/* The Beam */}
        <path d="M0 -40 L0 70" stroke="#22d3ee" strokeWidth={isActive ? "6" : "2"} strokeOpacity="0.8" style={{ filter: 'url(#glow)' }} />
        <path d="M0 -40 L0 70" stroke="white" strokeWidth="2" />
      </g>

      {/* Impact Point */}
      {isActive && (
        <g transform="translate(0, 70)">
          <ellipse cx="0" cy="0" rx="15" ry="5" fill="#06b6d4" opacity="0.5" className="animate-pulse" />
          <path d="M0 0 L-10 -15" stroke="#22d3ee" strokeWidth="2" className="animate-[spin_0.5s_linear_infinite]" />
          <path d="M0 0 L10 -20" stroke="#22d3ee" strokeWidth="2" className="animate-[spin_0.7s_linear_infinite]" />
        </g>
      )}

      {/* Floating Diamonds (Sparkles) */}
      {isActive && (
        <g>
          <path d="M-40 60 L-35 55 L-30 60 L-35 65 Z" fill="#cffafe" className="animate-[float-gold_2s_infinite]" opacity="0.8" />
          <path d="M40 50 L45 45 L50 50 L45 55 Z" fill="#cffafe" className="animate-[float-gold_2.5s_infinite]" opacity="0.6" />
        </g>
      )}

      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </g>
  );

  // --- TIER 6: Vibranium Reactor (Spectacular Animation) ---
  const renderTier6 = () => (
    <g transform="translate(100, 75)">
      {/* Anti-Gravity Base Platform */}
      <ellipse cx="0" cy="50" rx="40" ry="10" fill="#2e1065" stroke="#7e22ce" strokeWidth="2" className={isActive ? "animate-pulse" : ""} />
      <path d="M-30 50 L-40 75 L-50 75" stroke="#7e22ce" strokeWidth="2" opacity="0.6" />
      <path d="M30 50 L40 75 L50 75" stroke="#7e22ce" strokeWidth="2" opacity="0.6" />

      {/* Floating Rings System */}
      <g className={isActive ? "animate-[spin_10s_linear_infinite]" : ""}>
        <ellipse cx="0" cy="0" rx="55" ry="15" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="10 5" transform="rotate(-15)" />
        <ellipse cx="0" cy="0" rx="55" ry="15" fill="none" stroke="#d8b4fe" strokeWidth="1" strokeDasharray="5 10" transform="rotate(15)" />
      </g>

      <g className={isActive ? "animate-[spin_6s_linear_infinite_reverse]" : ""}>
        <ellipse cx="0" cy="0" rx="45" ry="35" fill="none" stroke="#6b21a8" strokeWidth="2" strokeDasharray="20 10" transform="rotate(45)" />
      </g>

      {/* Core Containment Field */}
      <circle cx="0" cy="0" r="20" fill="#000000" stroke="#7e22ce" strokeWidth="2" />

      {/* The Vibranium Core */}
      {isActive ? (
        <g>
          <circle cx="0" cy="0" r="12" fill="#d8b4fe" className="animate-[pulse_0.5s_infinite]">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="8" fill="#ffffff" className="animate-[ping_1.5s_infinite]" opacity="0.5" />

          {/* Energy Arcs */}
          <path d="M-10 -10 Q0 -25 10 -10" stroke="#f0abfc" strokeWidth="2" fill="none" className="animate-[pulse_0.2s_infinite]" />
          <path d="M-10 10 Q0 25 10 10" stroke="#f0abfc" strokeWidth="2" fill="none" className="animate-[pulse_0.3s_infinite]" />
        </g>
      ) : (
        <circle cx="0" cy="0" r="12" fill="#581c87" />
      )}

      {/* Particle Emission */}
      {isActive && (
        <g>
          <circle cx="0" cy="0" r="2" fill="#f0abfc" className="animate-[float-gold_1s_infinite]" style={{ '--tx': '30px', '--ty': '-40px' } as any} />
          <circle cx="0" cy="0" r="2" fill="#c084fc" className="animate-[float-gold_1.5s_infinite]" style={{ '--tx': '-30px', '--ty': '-30px' } as any} />
          <circle cx="0" cy="0" r="1.5" fill="#e879f9" className="animate-[float-gold_1.2s_infinite]" style={{ '--tx': '0px', '--ty': '-50px' } as any} />
        </g>
      )}

      <defs>
        <filter id="neon-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </g>
  );

  const renderVisuals = () => {
    if (tier === 6) return renderTier6();
    if (tier === 5) return renderTier5();
    if (tier === 4) return renderTier4();
    if (tier === 3) return renderTier3();
    if (tier === 2) return renderTier2();
    return renderTier1();
  };

  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden bg-stone-950/50 rounded-lg border border-stone-800/50">

      {/* Dynamic Background based on Tier */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: tier === 6
            ? 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.25) 0%, rgba(59, 7, 100, 0.4) 100%)' // Vibranium/Purple
            : tier === 5
              ? 'radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15) 0%, transparent 70%)' // Diamond/Cyan
              : tier === 4
                ? 'radial-gradient(circle at 50% 100%, rgba(234, 179, 8, 0.15) 0%, transparent 60%)' // Gold/Yellow
                : tier === 3
                  ? 'radial-gradient(circle at 50% 100%, rgba(161, 161, 170, 0.1) 0%, transparent 60%)' // Iron/Grey
                  : tier === 2
                    ? 'radial-gradient(circle at 50% 100%, rgba(249, 115, 22, 0.1) 0%, transparent 60%)' // Copper/Orange
                    : 'radial-gradient(circle at 50% 100%, rgba(28, 25, 23, 0.3) 0%, transparent 60%)' // Coal/Dark
        }}
      ></div>

      <svg
        viewBox="0 0 200 150"
        className="w-full h-full drop-shadow-2xl relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderVisuals()}

        {/* Extra Rarity Sparkles (Overlay on any tier) */}
        {isActive && (rarity !== 'COMMON') && (
          <g transform="translate(160, 20)">
            <path d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z" fill={particleColor} className="animate-sparkle-1" />
            <path d="M10 10 L11 12 L13 13 L11 14 L10 16 L9 14 L7 13 L9 12 Z" fill={particleColor} className="animate-sparkle-2" opacity="0.7" />
          </g>
        )}

      </svg>
    </div>
  );
};