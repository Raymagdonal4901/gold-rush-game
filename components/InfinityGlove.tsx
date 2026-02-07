
import React from 'react';
import { Rarity } from '../services/types';

interface InfinityGloveProps {
  rarity?: Rarity;
  className?: string;
  size?: number;
}

export const InfinityGlove: React.FC<InfinityGloveProps> = ({ rarity = 'COMMON', className = "", size = 24 }) => {

  // Determine Gem Count based on Rarity
  const getGemCount = () => {
    switch (rarity) {
      case 'COMMON': return 1;
      case 'RARE': return 2;
      case 'SUPER_RARE': return 3;
      case 'EPIC': return 4;
      case 'LEGENDARY': return 5;
      default: return 1;
    }
  };

  const count = getGemCount();

  // Gem Colors (Infinity Stone Style)
  // 1: Green (Time) - Thumb/Side
  // 2: Purple (Power) - Index
  // 3: Blue (Space) - Middle
  // 4: Red (Reality) - Ring
  // 5: Yellow (Mind) - Center Big

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-lg ${className}`}
    >
      {/* --- Gauntlet Body (Gold/Bronze) --- */}
      <path d="M25 90 L25 50 Q25 35 35 25 L35 10 Q35 5 42 5 L42 20" stroke="#713f12" strokeWidth="2" fill="#b45309" /> {/* Pinky Base */}
      <rect x="30" y="40" width="40" height="50" rx="5" fill="#d97706" stroke="#78350f" strokeWidth="2" /> {/* Main Palm */}

      {/* Fingers */}
      <rect x="32" y="15" width="8" height="35" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="1" /> {/* Pinky */}
      <rect x="41" y="5" width="9" height="45" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="1" /> {/* Ring */}
      <rect x="51" y="2" width="9" height="48" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="1" /> {/* Middle */}
      <rect x="61" y="8" width="9" height="42" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="1" /> {/* Index */}

      {/* Thumb Area */}
      <path d="M70 50 Q85 50 85 70 L85 80" stroke="#78350f" strokeWidth="2" fill="#d97706" />
      <rect x="75" y="55" width="10" height="25" rx="4" transform="rotate(-20 80 67)" fill="#b45309" stroke="#78350f" strokeWidth="1" />

      {/* Wrist Detail */}
      <rect x="22" y="85" width="56" height="12" rx="2" fill="#92400e" stroke="#451a03" strokeWidth="2" />
      <path d="M25 85 L25 95 M35 85 L35 95 M45 85 L45 95 M55 85 L55 95 M65 85 L65 95 M75 85 L75 95" stroke="#451a03" strokeWidth="1" opacity="0.5" />

      {/* --- GEMS --- */}

      {/* Gem 1: Green (Thumb/Side) - Common+ */}
      {count >= 1 && (
        <circle cx="82" cy="65" r="3.5" fill="#22c55e" stroke="#14532d" strokeWidth="1" className="animate-pulse" />
      )}

      {/* Gem 2: Purple (Index Knuckle) - Rare+ */}
      {count >= 2 && (
        <circle cx="65.5" cy="45" r="3" fill="#a855f7" stroke="#581c87" strokeWidth="1" className="animate-pulse" />
      )}

      {/* Gem 3: Blue (Middle Knuckle) - Super Rare+ */}
      {count >= 3 && (
        <circle cx="55.5" cy="42" r="3" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1" className="animate-pulse" />
      )}

      {/* Gem 4: Red (Ring Knuckle) - Epic+ */}
      {count >= 4 && (
        <circle cx="45.5" cy="44" r="3" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" className="animate-pulse" />
      )}

      {/* Gem 5: Yellow (Center Mind Stone) - Legendary Only */}
      {count >= 5 && (
        <g>
          <circle cx="50" cy="70" r="9" fill="#facc15" stroke="#a16207" strokeWidth="1.5" className="animate-[pulse_2s_infinite]" />
          <circle cx="50" cy="70" r="12" stroke="#fef08a" strokeWidth="1" opacity="0.5" className="animate-spin" strokeDasharray="4 4" />
        </g>
      )}

    </svg>
  );
};
