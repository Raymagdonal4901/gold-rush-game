
import React from 'react';
import { Rarity } from '../services/types';

interface OilRigAnimationProps {
  isActive?: boolean;
  rarity?: Rarity;
  tier?: number; // 1 to 5 based on investment
  rigName?: string; // NEW: Rig name to determine animation style
  isOverclockActive?: boolean; // NEW: Overclock boost active
}

export const OilRigAnimation: React.FC<OilRigAnimationProps> = ({ isActive = true, rarity = 'COMMON', tier = 1, rigName = '', isOverclockActive = false }) => {
  const speedScale = isOverclockActive ? 0.5 : 1; // Double speed = half duration


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

  // --- NEW: Portable Drill Animation for "สว่านพกพา" ---
  const renderDrill = () => (
    <g transform="translate(100, 75)">
      {/* Ground/Rock */}
      <path d="M-50 50 Q0 35 50 50 L50 70 L-50 70 Z" fill="#292524" stroke="#1c1917" strokeWidth="2" />
      <circle cx="-20" cy="55" r="5" fill="#3f3f46" />
      <circle cx="15" cy="52" r="4" fill="#44403c" />
      <circle cx="0" cy="58" r="3" fill="#52525b" />

      {/* Drill Body (Angled) */}
      <g className={isActive ? "animate-[drill-shake_${0.1 * speedScale}s_linear_infinite]" : ""} style={{ transformOrigin: '0 -20px' }}>
        {/* Handle */}
        <rect x="-6" y="-60" width="12" height="25" rx="3" fill="#f97316" stroke="#ea580c" strokeWidth="1" />

        {/* Motor Housing */}
        <rect x="-10" y="-35" width="20" height="20" rx="2" fill="#57534e" stroke="#44403c" strokeWidth="1" />
        <circle cx="0" cy="-25" r="5" fill="#27272a" stroke="#3f3f46" strokeWidth="1" />

        {/* Drill Shaft */}
        <rect x="-4" y="-15" width="8" height="40" fill="#71717a" stroke="#52525b" strokeWidth="1" />

        {/* Drill Bit (Spiral) */}
        <g className={isActive ? "animate-[spin_${0.3 * speedScale}s_linear_infinite]" : ""} style={{ transformOrigin: '0 35px' }}>
          <path d="M0 25 L-8 35 L0 45 L8 35 Z" fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="1" />
          <circle cx="0" cy="35" r="3" fill="#e5e5e5" />
          {/* Spiral Lines */}
          <path d="M-4 30 Q-6 35 -4 40" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
          <path d="M4 30 Q6 35 4 40" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
        </g>
      </g>

      {/* Dust/Debris Particles */}
      {isActive && (
        <g>
          <circle cx="-15" cy="40" r="2" fill="#78716c" className="animate-[float-gold_${0.6 * speedScale}s_infinite]" />
          <circle cx="20" cy="42" r="1.5" fill="#a8a29e" className="animate-[float-gold_${0.8 * speedScale}s_infinite]" style={{ animationDelay: '0.2s' }} />
          <circle cx="5" cy="38" r="2.5" fill="#57534e" className="animate-[float-gold_${0.5 * speedScale}s_infinite]" style={{ animationDelay: '0.4s' }} />
          <circle cx="-25" cy="45" r="1" fill="#d6d3d1" className="animate-[float-gold_${0.7 * speedScale}s_infinite]" style={{ animationDelay: '0.1s' }} />
        </g>
      )}

      {/* Custom Animation Style */}
      <style>{`
        @keyframes drill-shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-1px, 0.5px); }
          50% { transform: translate(1px, 0); }
          75% { transform: translate(-0.5px, -0.5px); }
        }
      `}</style>
    </g>
  );

  // --- TIER 1: Rusty Shovel (Cartoon Digging) ---
  const renderTier1 = () => (
    <g transform="translate(100, 75)">
      {/* Ground Mound */}
      <path d="M-30 60 Q0 50 30 60" fill="none" stroke="#44403c" strokeWidth="2" />
      <path d="M-25 60 Q0 45 25 60 Z" fill="#292524" className={isActive ? "animate-[squash_${2 * speedScale}s_infinite]" : ""} />

      {/* The Rusty Shovel */}
      <g className={isActive ? "animate-[dig-cycle_${2 * speedScale}s_ease-in-out_infinite]" : ""} style={{ transformOrigin: '0 40px' }}>
        {/* Handle */}
        <rect x="-2" y="-50" width="4" height="50" fill="#92400e" stroke="#78350f" strokeWidth="1" rx="1" />
        <circle cx="0" cy="-52" r="4" fill="none" stroke="#78350f" strokeWidth="2" />

        {/* Shovel Head (Rusty) */}
        <path d="M-10 0 L10 0 L8 15 Q0 20 -8 15 Z" fill="#57534e" stroke="#292524" strokeWidth="1" />
        {/* Rust Spots */}
        <circle cx="-5" cy="5" r="2" fill="#ea580c" opacity="0.6" />
        <circle cx="4" cy="10" r="1.5" fill="#ea580c" opacity="0.6" />
        <circle cx="0" cy="8" r="1" fill="#78350f" opacity="0.5" />
      </g>

      {/* Flying Dirt (Throw Phase) */}
      {isActive && (
        <g>
          <circle cx="15" cy="30" r="3" fill="#292524" className="animate-[dirt-fly_${2 * speedScale}s_infinite]" style={{ animationDelay: '1.2s' }} />
          <circle cx="20" cy="25" r="2" fill="#44403c" className="animate-[dirt-fly_${2 * speedScale}s_infinite]" style={{ animationDelay: '1.25s' }} />
          <circle cx="25" cy="35" r="2.5" fill="#1c1917" className="animate-[dirt-fly_${2 * speedScale}s_infinite]" style={{ animationDelay: '1.3s' }} />
        </g>
      )}

      <style>{`
        @keyframes dig-cycle {
           0% { transform: rotate(-10deg) translateY(-10px); } /* Ready */
           30% { transform: rotate(0deg) translateY(5px); } /* Dig Down */
           50% { transform: rotate(0deg) translateY(5px); } /* Pause in dirt */
           70% { transform: rotate(-45deg) translateY(-10px); } /* Scoop/Throw Back */
           100% { transform: rotate(-10deg) translateY(-10px); } /* Return */
        }
        @keyframes squash {
           0%, 100% { transform: scaleY(1); }
           30%, 50% { transform: scaleY(0.9); } /* Squash when dug */
        }
        @keyframes dirt-fly {
           0% { transform: translate(0,0) scale(0); opacity: 0; }
           10% { transform: translate(0,0) scale(1); opacity: 1; } /* Appear at throw start */
           100% { transform: translate(20px, -20px) scale(0.5); opacity: 0; } /* Fly right/up */
        }
      `}</style>
    </g>
  );

  // --- TIER 2: Cartoon Copper Furnace (Steampunk Boiler) ---
  const renderTier2 = () => (
    <g transform="translate(100, 75)">
      {/* Furnace Legs */}
      <path d="M-30 60 L-35 80" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
      <path d="M30 60 L35 80" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />

      {/* Main Boiler Tank */}
      <g className={isActive ? "animate-[shake_${2 * speedScale}s_linear_infinite]" : ""}>
        {/* Tank Body */}
        <rect x="-40" y="-30" width="80" height="90" rx="10" fill="#c2410c" stroke="#7c2d12" strokeWidth="3" />
        {/* Copper Sheen/Highlight */}
        <path d="M-30 -20 L-30 50" stroke="#fdba74" strokeWidth="3" strokeLinecap="round" opacity="0.4" />

        {/* Rivets */}
        <circle cx="-35" cy="-25" r="2" fill="#7c2d12" />
        <circle cx="35" cy="-25" r="2" fill="#7c2d12" />
        <circle cx="-35" cy="55" r="2" fill="#7c2d12" />
        <circle cx="35" cy="55" r="2" fill="#7c2d12" />

        {/* Viewing Window (Porthole) */}
        <circle cx="0" cy="15" r="20" fill="#451a03" stroke="#fdba74" strokeWidth="3" />

        {/* Molten Liquid inside Window */}
        <g clipPath="url(#copper-clip)">
          <rect x="-20" y="5" width="40" height="40" fill="#ea580c" className={isActive ? "animate-[liquid-rise_${2 * speedScale}s_ease-in-out_infinite]" : ""} />
          {/* Bubbles */}
          {isActive && (
            <g>
              <circle cx="-5" cy="20" r="3" fill="#fdba74" className="animate-[float-gold_${1 * speedScale}s_infinite]" />
              <circle cx="8" cy="25" r="2" fill="#fdba74" className="animate-[float-gold_${1.2 * speedScale}s_infinite]" style={{ animationDelay: '0.4s' }} />
            </g>
          )}
        </g>
        <defs>
          <clipPath id="copper-clip">
            <circle cx="0" cy="15" r="17" />
          </clipPath>
        </defs>

        {/* Pressure Gauge */}
        <circle cx="0" cy="-30" r="12" fill="#fef3c7" stroke="#78350f" strokeWidth="2" />
        <line x1="0" y1="-30" x2="0" y2="-40" stroke="#ef4444" strokeWidth="2" className={isActive ? "animate-[gauge-wiggle_${0.5 * speedScale}s_linear_infinite]" : ""} style={{ transformOrigin: '0 -30px' }} />
      </g>

      {/* Steam Pipes & Vents */}
      <path d="M40 -10 L50 -10 L50 10 L60 10" stroke="#9a3412" strokeWidth="4" fill="none" />
      <rect x="55" y="5" width="10" height="10" fill="#7c2d12" />

      {/* Steam Puffs */}
      {isActive && (
        <g transform="translate(60, 10)">
          <circle cx="5" cy="0" r="3" fill="white" opacity="0.6" className="animate-[steam_${1.5 * speedScale}s_infinite]" />
          <circle cx="10" cy="-5" r="4" fill="white" opacity="0.4" className="animate-[steam_${1.5 * speedScale}s_infinite]" style={{ animationDelay: '0.3s' }} />
        </g>
      )}

      {/* Molten Drip Tap */}
      <path d="M-40 40 L-50 40 L-50 45" stroke="#7c2d12" strokeWidth="4" fill="none" />
      {isActive && (
        <g>
          <circle cx="-50" cy="45" r="3" fill="#ea580c" className="animate-[drip_${1 * speedScale}s_cubic-bezier(0.5,0,1,1)_infinite]" />
        </g>
      )}

      <style>{`
        @keyframes gauge-wiggle {
           0% { transform: rotate(-20deg); }
           50% { transform: rotate(20deg); }
           100% { transform: rotate(-20deg); }
        }
        @keyframes liquid-rise {
           0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-5px); }
        }
        @keyframes steam {
           0% { transform: translate(0,0) scale(0.5); opacity: 0.8; }
           100% { transform: translate(10px, -10px) scale(2); opacity: 0; }
        }
        @keyframes drip {
            0% { transform: translateY(0); opacity: 1; }
            80% { transform: translateY(20px); opacity: 1; }
            100% { transform: translateY(25px); opacity: 0; }
        }
        @keyframes shake {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(0.5deg); }
            75% { transform: rotate(-0.5deg); }
        }
      `}</style>
    </g>
  );

  // --- TIER 3: Cartoon Iron Forge (Blacksmith Style) ---
  const renderTier3 = () => (
    <g transform="translate(100, 75)">
      {/* Heavy Base / Floor */}
      <rect x="-40" y="60" width="80" height="15" rx="2" fill="#27272a" stroke="#18181b" strokeWidth="2" />

      {/* The Anvil */}
      <path d="M-25 60 L-20 40 L20 40 L25 60 Z" fill="#52525b" stroke="#3f3f46" strokeWidth="2" />
      <rect x="-25" y="35" width="50" height="10" fill="#71717a" stroke="#52525b" strokeWidth="2" />

      {/* Hot Iron Bar (Target) */}
      <g transform="translate(0, 31)">
        <rect x="-15" y="0" width="30" height="6" rx="1" fill="#f97316" stroke="#ea580c" strokeWidth="1" className={isActive ? "animate-[hot-iron_${2 * speedScale}s_infinite]" : ""} />
        {/* Glow effect */}
        <ellipse cx="0" cy="3" rx="12" ry="4" fill="#fbbf24" opacity="0.5" className={isActive ? "animate-pulse" : ""} />
      </g>

      {/* The Power Hammer Structure */}
      <path d="M-50 60 L-50 -20" stroke="#3f3f46" strokeWidth="12" strokeLinecap="round" />
      <circle cx="-50" cy="-20" r="8" fill="#52525b" stroke="#27272a" strokeWidth="2" />

      {/* The Swinging Arm & Hammer Head */}
      <g className={isActive ? "animate-[hammer-swing_${1.2 * speedScale}s_ease-in-out_infinite]" : ""} style={{ transformOrigin: '-50px -20px' }}>
        {/* Arm */}
        <rect x="-50" y="-24" width="60" height="8" fill="#a1a1aa" stroke="#52525b" strokeWidth="1" rx="4" />

        {/* Hammer Head */}
        <g transform="translate(10, -35)">
          <rect x="-15" y="0" width="30" height="40" rx="4" fill="#52525b" stroke="#27272a" strokeWidth="2" />
          <rect x="-15" y="35" width="30" height="10" rx="1" fill="#3f3f46" stroke="#18181b" strokeWidth="2" />
        </g>
      </g>

      {/* Impact Sparks */}
      {isActive && (
        <g transform="translate(0, 30)">
          {/* Left Spark */}
          <path d="M-5 0 L-10 -10" stroke="#fbbf24" strokeWidth="2" className="animate-[spark-splash_${1.2 * speedScale}s_infinite]" style={{ animationDelay: '0.4s' }} />
          {/* Right Spark */}
          <path d="M5 0 L15 -8" stroke="#fbbf24" strokeWidth="2" className="animate-[spark-splash_${1.2 * speedScale}s_infinite]" style={{ animationDelay: '0.45s' }} />
          {/* Hit Flash */}
          <circle cx="0" cy="0" r="10" fill="white" opacity="0.8" className="animate-[flash_${1.2 * speedScale}s_infinite]" style={{ animationDelay: '0.4s' }} />
        </g>
      )}

      <style>{`
        @keyframes hammer-swing {
           0% { transform: rotate(-20deg); }
           30% { transform: rotate(-45deg); } /* Wind up */
           40% { transform: rotate(5deg); } /* SLAM */
           45% { transform: rotate(0deg); } /* Recoil */
           100% { transform: rotate(-20deg); }
        }
        @keyframes hot-iron {
           0%, 100% { fill: #f97316; transform: scaleX(1); }
           40% { fill: #ef4444; transform: scaleX(1.1) scaleY(0.8); } /* Squash on hit */
           60% { fill: #f97316; transform: scaleX(1); }
        }
        @keyframes spark-splash {
           0% { opacity: 0; transform: scale(0); }
           40% { opacity: 1; transform: scale(1); }
           60% { opacity: 0; transform: translate(5px, -10px) scale(0); }
           100% { opacity: 0; }
        }
        @keyframes flash {
           0%, 35% { opacity: 0; r: 0; }
           40% { opacity: 0.8; r: 15; }
           50% { opacity: 0; r: 20; }
           100% { opacity: 0; r: 0; }
        }
      `}</style>
    </g>
  );

  // --- TIER 4: Cartoon Gold Smelter (Foundry Style) ---
  const renderTier4 = () => (
    <g transform="translate(100, 80)">
      {/* Floor/Base */}
      <rect x="-50" y="55" width="100" height="10" rx="3" fill="#451a03" stroke="#292524" strokeWidth="2" />

      {/* The Smelting Furnace (Pot Belly) */}
      <g transform="translate(0, 10)">
        {/* Main Furnace Body */}
        <path d="M-30 -40 Q-40 0 -30 40 L30 40 Q40 0 30 -40 Z" fill="#b45309" stroke="#78350f" strokeWidth="3" />
        {/* Glow from inside/heat */}
        <ellipse cx="0" cy="10" rx="20" ry="15" fill="#f59e0b" opacity="0.3" className={isActive ? "animate-pulse" : ""} />

        {/* Molten Gold Top (Open) */}
        <ellipse cx="0" cy="-40" rx="30" ry="8" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
        <ellipse cx="0" cy="-40" rx="25" ry="6" fill="#fbbf24" className={isActive ? "animate-pulse" : ""} />

        {/* Bubbles in Molten Gold */}
        {isActive && (
          <g>
            <circle cx="-10" cy="-42" r="3" fill="#fef3c7" className="animate-[bounce_${1 * speedScale}s_infinite]" />
            <circle cx="15" cy="-38" r="2" fill="#fef3c7" className="animate-[bounce_${1.5 * speedScale}s_infinite]" style={{ animationDelay: '0.2s' }} />
            <circle cx="5" cy="-40" r="4" fill="#fef3c7" className="animate-[bounce_${2 * speedScale}s_infinite]" style={{ animationDelay: '0.5s' }} />
          </g>
        )}

        {/* Heat Pipes/Vents */}
        <path d="M-35 -10 L-45 -15 L-45 -30" stroke="#78350f" strokeWidth="4" fill="none" />
        <path d="M35 -10 L45 -15 L45 -30" stroke="#78350f" strokeWidth="4" fill="none" />
      </g>

      {/* Steam Puffs (from vents) */}
      {isActive && (
        <g>
          <circle cx="-45" cy="-35" r="5" fill="white" opacity="0.5" className="animate-[float-gold_1.5s_infinite]" />
          <circle cx="45" cy="-35" r="5" fill="white" opacity="0.5" className="animate-[float-gold_1.5s_infinite]" style={{ animationDelay: '0.5s' }} />
        </g>
      )}

      {/* Production Slide (Gold Bar coming out) */}
      <path d="M20 30 L60 55" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />

      {/* Sliding Gold Bar */}
      {isActive && (
        <g className="animate-[slide-down_${2 * speedScale}s_linear_infinite]">
          <rect x="25" y="25" width="15" height="8" rx="1" fill="#facc15" stroke="#ca8a04" strokeWidth="1" transform="rotate(30)" />
          {/* Shine */}
          <path d="M28 25 L32 33" stroke="white" strokeWidth="2" opacity="0.6" transform="rotate(30)" />
        </g>
      )}

      {/* Piled Gold Bars (Bottom Right) */}
      <g transform="translate(60, 50)">
        <rect x="-10" y="0" width="12" height="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
        <rect x="0" y="0" width="12" height="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
        <rect x="-5" y="-5" width="12" height="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      </g>

      <style>{`
        @keyframes slide-down {
           0% { transform: translate(0, 0) scale(0); opacity: 0; }
           20% { transform: translate(0, 0) scale(1); opacity: 1; }
           80% { transform: translate(30px, 18px); opacity: 1; }
           100% { transform: translate(35px, 21px); opacity: 0; }
        }
      `}</style>
    </g>
  );

  // --- NEW: Coal Mining Machine (TNT Blaster Style) ---
  const renderCoalMachine = () => (
    <g transform="translate(100, 75)">
      {/* Ground Wire */}
      <path d="M-30 70 Q0 60 30 70" stroke="#1c1917" strokeWidth="2" fill="none" />

      {/* DETONATOR BOX (Left) */}
      <g transform="translate(-50, 50)">
        {/* Box Body */}
        <rect x="-15" y="0" width="30" height="25" rx="2" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="2" />
        <rect x="-15" y="0" width="30" height="5" fill="#991b1b" /> {/* Lid shadow */}

        {/* Handle Structure */}
        <rect x="-3" y="-15" width="6" height="15" fill="#d4d4d8" stroke="#52525b" strokeWidth="1" />

        {/* The Plunger Handle (Moving Part) */}
        <g className={isActive ? "animate-[plunge_${2 * speedScale}s_infinite]" : ""}>
          <rect x="-4" y="-25" width="8" height="25" fill="#a1a1aa" stroke="#52525b" strokeWidth="1" />
          <rect x="-12" y="-30" width="24" height="6" rx="2" fill="#52525b" stroke="#27272a" strokeWidth="1" />
        </g>
      </g>

      {/* CAVE ENTRANCE & DYNAMITE (Right) */}
      <g transform="translate(50, 60)">
        {/* Cave Rock Wall / Entrance */}
        <path d="M-40 20 Q-40 -40 0 -40 Q40 -40 40 20 L40 25 L-40 25 Z" fill="#44403c" stroke="#292524" strokeWidth="2" />
        <path d="M-30 25 Q-30 -20 0 -20 Q30 -20 30 25" fill="#0c0a09" /> {/* Dark Cave Mouth */}

        {/* Cracks/Texture on Rock */}
        <path d="M-35 0 L-25 -5 L-30 10" stroke="#292524" strokeWidth="1" fill="none" />
        <path d="M35 -10 L25 -15 L30 5" stroke="#292524" strokeWidth="1" fill="none" />

        {/* Dynamite Sticks */}
        <g transform="rotate(15) translate(0, -5)">
          <rect x="-3" y="-10" width="6" height="15" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
          <path d="M0 -10 L0 -15" stroke="#fcd34d" strokeWidth="1" /> {/* Fuse */}
          {/* Fuse Spark */}
          {isActive && <circle cx="0" cy="-15" r="2" fill="#facc15" className={`animate-[pulse_${0.2 * speedScale}s_infinite]`} />}
        </g>

        {/* EXPLOSION EFFECT */}
        {isActive && (
          <g>
            {/* Growing Explosion Cloud */}
            <circle cx="0" cy="5" r="20" fill="#f59e0b" opacity="0.8" className="animate-[explode_${2 * speedScale}s_infinite]" style={{ animationDelay: '0.9s' }} />
            <circle cx="0" cy="5" r="15" fill="#ef4444" opacity="0.8" className="animate-[explode_${2 * speedScale}s_infinite]" style={{ animationDelay: '1.0s' }} />

            {/* Flying Coal Chunks (Scattered) */}
            <g>
              {/* Left Spurt */}
              <g transform="rotate(-60)" className="animate-[debris_${2 * speedScale}s_infinite]" style={{ animationDelay: '1.0s' }}>
                <circle cx="0" cy="-20" r="3" fill="#292524" />
              </g>
              {/* Top-Left Spurt */}
              <g transform="rotate(-30)" className="animate-[debris_${2 * speedScale}s_infinite]" style={{ animationDelay: '1.0s' }}>
                <circle cx="0" cy="-25" r="4" fill="#1c1917" />
              </g>
              {/* Upward Spurt */}
              <g className="animate-[debris_${2 * speedScale}s_infinite]" style={{ animationDelay: '1.0s' }}>
                <circle cx="0" cy="-30" r="3" fill="#292524" />
                <circle cx="5" cy="-20" r="2" fill="#44403c" />
              </g>
              {/* Top-Right Spurt */}
              <g transform="rotate(30)" className="animate-[debris_${2 * speedScale}s_infinite]" style={{ animationDelay: '1.0s' }}>
                <circle cx="0" cy="-25" r="4" fill="#1c1917" />
              </g>
              {/* Right Spurt */}
              <g transform="rotate(60)" className="animate-[debris_${2 * speedScale}s_infinite]" style={{ animationDelay: '1.0s' }}>
                <circle cx="0" cy="-20" r="3" fill="#292524" />
              </g>
            </g>
          </g>
        )}
      </g>

      <style>{`
        @keyframes plunge {
           0%, 40% { transform: translateY(0); } /* Wait */
           45% { transform: translateY(15px); } /* PUSH DOWN */
           50% { transform: translateY(15px); }
           90% { transform: translateY(0); } /* Reset */
        }
        @keyframes explode {
           0% { transform: scale(0); opacity: 0; }
           1% { transform: scale(0.5); opacity: 1; } /* BOOM starts when plunge hits (approx 45% of 2s = 0.9s) */
           10% { transform: scale(1.5); opacity: 0.8; }
           20% { transform: scale(2); opacity: 0; }
           100% { transform: scale(2); opacity: 0; }
        }
           
        @keyframes debris {
           0% { transform: translate(0,0) scale(0); opacity: 0; }
           5% { transform: translate(0,0) scale(1); opacity: 1; }
           50% { transform: translate(0, -30px) scale(0.5); opacity: 1; } /* Fly up */
           100% { transform: translate(0, 0) scale(0); opacity: 0; }
        }
      `}</style>
    </g>
  );

  // --- TIER 5: Cartoon Diamond Factory (Production Style) ---
  const renderTier5 = () => (
    <g transform="translate(100, 80)">
      {/* Conveyor Belt Base */}
      <rect x="-60" y="50" width="120" height="15" rx="5" fill="#334155" stroke="#1e293b" strokeWidth="2" />
      <path d="M-50 50 L-60 65" stroke="#1e293b" strokeWidth="2" opacity="0.5" />
      <path d="M50 50 L60 65" stroke="#1e293b" strokeWidth="2" opacity="0.5" />
      {/* Belt rollers */}
      <circle cx="-40" cy="58" r="4" fill="#94a3b8" className={isActive ? "animate-[spin_2s_linear_infinite]" : ""} />
      <circle cx="0" cy="58" r="4" fill="#94a3b8" className={isActive ? "animate-[spin_2s_linear_infinite]" : ""} />
      <circle cx="40" cy="58" r="4" fill="#94a3b8" className={isActive ? "animate-[spin_2s_linear_infinite]" : ""} />

      {/* The Diamond Press Machine */}
      <g transform="translate(0, -10)">
        {/* Main Body */}
        <path d="M-30 -50 L-35 50 L35 50 L30 -50 Z" fill="#06b6d4" stroke="#155e75" strokeWidth="3" />
        <path d="M-30 -50 L30 -50" stroke="#bae6fd" strokeWidth="4" />

        {/* Piston Shaft */}
        <rect x="-10" y="-30" width="20" height="40" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />

        {/* The Press Head (Moving Part) */}
        <g className={isActive ? "animate-[press_${1.5 * speedScale}s_ease-in-out_infinite]" : ""}>
          <rect x="-20" y="0" width="40" height="15" rx="3" fill="#164e63" stroke="#0891b2" strokeWidth="2" />
          {/* Hydraulic lines */}
          <path d="M-5 0 L-5 -30" stroke="#94a3b8" strokeWidth="1" />
          <path d="M5 0 L5 -30" stroke="#94a3b8" strokeWidth="1" />
        </g>

        {/* Indicator Light */}
        <circle cx="0" cy="-35" r="5" fill={isActive ? "#4ade80" : "#ef4444"} className={isActive ? "animate-pulse" : ""} stroke="black" strokeWidth="1" />
      </g>

      {/* PRODUCED DIAMONDS (Popping out) */}
      {isActive && (
        <g>
          {/* Diamond 1 (Just pressed) */}
          <g className="animate-[pop-out_${1.5 * speedScale}s_linear_infinite]">
            <path d="M-8 45 L0 35 L8 45 L0 55 Z" fill="#cffafe" stroke="#22d3ee" strokeWidth="1" />
          </g>

          {/* Diamond 2 (Moving on belt) */}
          <g className="animate-[conveyor_${1.5 * speedScale}s_linear_infinite]" style={{ animationDelay: '0.75s' }}>
            <path d="M-8 45 L0 35 L8 45 L0 55 Z" fill="#a5f3fc" stroke="#0891b2" strokeWidth="1" />
          </g>
        </g>
      )}

      {/* Sparkles of value */}
      {isActive && (
        <g transform="translate(30, 30)">
          <path d="M0 -5 L1 -1 L5 0 L1 1 L0 5 L-1 1 L-5 0 L-1 -1 Z" fill="#fef08a" className="animate-[ping_1s_infinite]" />
        </g>
      )}

      <style>{`
        @keyframes press {
            0%, 100% { transform: translateY(0); }
            45% { transform: translateY(35px); } /* Squish down */
            50% { transform: translateY(35px); }
            55% { transform: translateY(0); } /* Retract */
        }
        @keyframes pop-out {
            0% { transform: translate(0, 0) scale(0); opacity: 0; }
            50% { opacity: 0; } /* Wait for press to lift */
            55% { transform: translate(0, 0) scale(0.5); opacity: 1; }
            60% { transform: translate(0, 0) scale(1.2); }
            70% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(20px, 0); opacity: 1; }
        }
         @keyframes conveyor {
            0% { transform: translate(20px, 0); opacity: 1; }
            100% { transform: translate(60px, 0); opacity: 0; }
        }
      `}</style>
    </g>
  );

  // --- TIER 6: GRAND VIBRANIUM REACTOR (Ultima Grade) ---
  const renderTier6 = () => (
    <g transform="translate(100, 85)">

      {/* 1. MASSIVE BASE STATION */}
      <g transform="translate(0, 50)">
        {/* Foundation */}
        <path d="M-60 20 L60 20 L50 40 L-50 40 Z" fill="#1e1b4b" stroke="#581c87" strokeWidth="3" />
        <path d="M-40 0 L40 0 L50 20 L-50 20 Z" fill="#2e1065" stroke="#6b21a8" strokeWidth="3" />

        {/* Energy Piping on Base */}
        <path d="M-30 40 L-30 50" stroke="#a855f7" strokeWidth="4" />
        <path d="M30 40 L30 50" stroke="#a855f7" strokeWidth="4" />

        {/* Platform Glow */}
        <ellipse cx="0" cy="0" rx="45" ry="10" fill="#4c1d95" opacity="0.5" className={isActive ? "animate-pulse" : ""} />
      </g>

      {/* 2. GYROSCOPIC RINGS (The "Atom" look but grander) */}
      <g transform="translate(0, -10)">
        {/* Ring 1: Slow Vertical Spin */}
        <g className={isActive ? "animate-[spin_${10 * speedScale}s_linear_infinite]" : ""}>
          <ellipse cx="0" cy="0" rx="70" ry="20" fill="none" stroke="#6b21a8" strokeWidth="6" transform="rotate(-30)" />
          <ellipse cx="0" cy="0" rx="70" ry="20" fill="none" stroke="#d8b4fe" strokeWidth="1" transform="rotate(-30)" opacity="0.6" />
        </g>

        {/* Ring 2: Medium Horizontal Spin */}
        <g className={isActive ? "animate-[spin_${7 * speedScale}s_linear_infinite_reverse]" : ""}>
          <ellipse cx="0" cy="0" rx="70" ry="20" fill="none" stroke="#a855f7" strokeWidth="5" transform="rotate(30)" />
          <ellipse cx="0" cy="0" rx="70" ry="20" fill="none" stroke="#f0abfc" strokeWidth="1" transform="rotate(30)" opacity="0.6" />
        </g>

        {/* Ring 3: Fast Inner Spin */}
        <g className={isActive ? "animate-[spin_${4 * speedScale}s_linear_infinite]" : ""}>
          <circle cx="0" cy="0" r="50" fill="none" stroke="#d946ef" strokeWidth="4" strokeDasharray="20 10" />
        </g>
      </g>

      {/* 3. THE ULTIMA CORE (Massive Sphere) */}
      <g transform="translate(0, -10)">
        {/* Outer Forcefield */}
        <circle cx="0" cy="0" r="35" fill="#2e1065" stroke="#7e22ce" strokeWidth="2" opacity="0.8" />

        {/* Inner Plasma */}
        {isActive ? (
          <g>
            {/* Core Lightning */}
            <path d="M-15 -15 L15 15 M15 -15 L-15 15" stroke="#f0abfc" strokeWidth="3" className={`animate-[spin_${0.5 * speedScale}s_linear_infinite]`} />
          </g>
        ) : (
          <circle cx="0" cy="0" r="25" fill="#1e1b4b" />
        )}
      </g>

      {/* 4. FLOATING SATELLITES */}
      {isActive && (
        <g transform="translate(0, -10)">
          <circle cx="0" cy="-60" r="6" fill="#f0abfc" className="animate-[bounce_${2 * speedScale}s_infinite]" />
          <circle cx="0" cy="60" r="6" fill="#f0abfc" className="animate-[bounce_${2 * speedScale}s_infinite]" />
        </g>
      )}

      <g>
        {/* Particle Emission */}
        {isActive && (
          <g>
            <circle cx="0" cy="0" r="3" fill="#f0abfc" className="animate-[float-gold_${1 * speedScale}s_infinite]" style={{ '--tx': '40px', '--ty': '-60px' } as any} />
            <circle cx="0" cy="0" r="3" fill="#c084fc" className="animate-[float-gold_1.5s_infinite]" style={{ '--tx': '-40px', '--ty': '-50px' } as any} />
          </g>
        )}
      </g>
    </g>
  );

  const renderVisuals = () => {
    // Name-specific mappings
    if (rigName === 'พลั่วสนิมเขรอะ') return renderTier1(); // Tier 1: Shovel
    if (rigName === 'สว่านพกพา') return renderDrill(); // Tier 2: Drill
    if (rigName === 'เครื่องขุดถ่านหิน') return renderCoalMachine(); // Tier 3: TNT/Coal Blaster
    if (rigName === 'เครื่องขุดทองแดง') return renderTier2(); // Tier 4: Copper Furnace
    if (rigName === 'เครื่องขุดเหล็ก') return renderTier3(); // Tier 5: Iron Forge
    if (rigName === 'เครื่องขุดทองคำ') return renderTier4(); // Tier 6: Gold Smelter
    if (rigName === 'เครื่องขุดเพชร') return renderTier5(); // Tier 7: Diamond Press
    if (rigName.includes('ไวเบรเนียม')) return renderTier6(); // Tier 8: Vibranium Reactor

    // Fallback to tier-based animations
    // Note: The 'tier' prop might not perfectly align if presets changed, so relying on name is safer.
    // Keeping fallbacks just in case.
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