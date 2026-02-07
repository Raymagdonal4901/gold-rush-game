
import React from 'react';
import { Rarity } from '../services/types';

interface InfinityGloveProps {
  rarity?: Rarity;
  className?: string;
  size?: number;
}

export const InfinityGlove: React.FC<InfinityGloveProps> = ({ rarity = 'COMMON', className = "", size = 24 }) => {

  // Determine Star Count based on Rarity
  const getStarCount = () => {
    switch (rarity) {
      case 'COMMON': return 1;
      case 'UNCOMMON': return 2;
      case 'RARE': return 3;
      case 'EPIC': return 4;
      case 'LEGENDARY': return 5;
      default: return 1;
    }
  };

  const count = getStarCount();

  // Card Colors
  const getCardColors = () => {
    switch (rarity) {
      case 'COMMON': return { bg: '#57534e', border: '#78716c', accent: '#a8a29e' };
      case 'UNCOMMON': return { bg: '#14532d', border: '#166534', accent: '#4ade80' };
      case 'RARE': return { bg: '#1e3a8a', border: '#1e40af', accent: '#60a5fa' };
      case 'EPIC': return { bg: '#581c87', border: '#6b21a8', accent: '#c084fc' };
      case 'LEGENDARY': return { bg: '#713f12', border: '#a16207', accent: '#facc15' };
      default: return { bg: '#57534e', border: '#78716c', accent: '#a8a29e' };
    }
  }

  const colors = getCardColors();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-lg ${className}`}
    >
      {/* --- ID Card Body --- */}
      <rect x="15" y="10" width="70" height="85" rx="5" fill={colors.bg} stroke={colors.border} strokeWidth="3" />

      {/* Top Header/Lanyard Hole Area */}
      <rect x="15" y="10" width="70" height="15" rx="5" fill={colors.border} />
      <rect x="42" y="5" width="16" height="4" rx="2" fill="#333" /> {/* Lanyard Clip */}

      {/* Photo Area */}
      <rect x="30" y="32" width="40" height="40" rx="4" fill="#1c1917" stroke={colors.accent} strokeWidth="2" />

      {/* Generic Person Silhouette in Photo */}
      <path d="M50 65 C40 65 35 70 35 72 L65 72 C65 70 60 65 50 65 Z" fill={colors.accent} opacity="0.5" />
      <circle cx="50" cy="50" r="8" fill={colors.accent} opacity="0.5" />

      {/* Text Lines */}
      {/* Name Line */}
      <rect x="25" y="78" width="50" height="4" rx="2" fill={colors.accent} opacity="0.8" />
      {/* Role Line */}
      <rect x="35" y="85" width="30" height="3" rx="1.5" fill={colors.accent} opacity="0.5" />

      {/* --- STARS / RANK --- */}
      <g transform="translate(0, -5)">
        {/* Star 1 */}
        {count >= 1 && <path d="M25 25 L27 30 L32 30 L28 33 L29 38 L25 35 L21 38 L22 33 L18 30 L23 30 Z" fill={count >= 1 ? "#facc15" : "#444"} stroke="#000" strokeWidth="0.5" />}

        {/* Star 2 */}
        {count >= 2 && <path d="M37.5 25 L39.5 30 L44.5 30 L40.5 33 L41.5 38 L37.5 35 L33.5 38 L34.5 33 L30.5 30 L35.5 30 Z" fill={count >= 2 ? "#facc15" : "#444"} stroke="#000" strokeWidth="0.5" />}

        {/* Star 3 (Center) */}
        {count >= 3 && <path d="M50 22 L52 27 L57 27 L53 30 L54 35 L50 32 L46 35 L47 30 L43 27 L48 27 Z" fill={count >= 3 ? "#facc15" : "#444"} stroke="#000" strokeWidth="0.5" transform="scale(1.2) translate(-8, -4)" />}

        {/* Star 4 */}
        {count >= 4 && <path d="M62.5 25 L64.5 30 L69.5 30 L65.5 33 L66.5 38 L62.5 35 L58.5 38 L59.5 33 L55.5 30 L60.5 30 Z" fill={count >= 4 ? "#facc15" : "#444"} stroke="#000" strokeWidth="0.5" />}

        {/* Star 5 */}
        {count >= 5 && <path d="M75 25 L77 30 L82 30 L78 33 L79 38 L75 35 L71 38 L72 33 L68 30 L73 30 Z" fill={count >= 5 ? "#facc15" : "#444"} stroke="#000" strokeWidth="0.5" />}
      </g>

      {/* Shine Effect */}
      <path d="M15 10 L85 10 L65 95 L15 95 Z" fill="white" fillOpacity="0.05" />

    </svg>
  );
};
