import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Home, Fan, Snowflake, Wind, Star, Zap } from 'lucide-react';
import { RIG_PRESETS } from '../constants';

interface ApartmentAnimationProps {
  isActive: boolean;
  rarity: string;
  tier: number;
  rigName: string;
  isOverdrive?: boolean;
}

export const ApartmentAnimation: React.FC<ApartmentAnimationProps> = ({ isActive, rarity, tier, rigName, isOverdrive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Config based on Tier/Room Type
  const getRoomConfig = (tier: number) => {
    if (tier >= 7) return { type: 'PENTHOUSE', color: '#fbbf24', secondary: '#000', particles: 30 }; // Legendary
    if (tier >= 5) return { type: 'SUITE', color: '#a855f7', secondary: '#f3e8ff', particles: 20 }; // Epic
    if (tier >= 3) return { type: 'CONDO', color: '#3b82f6', secondary: '#dbeafe', particles: 15 }; // Rare/Super Rare
    return { type: 'APARTMENT', color: '#10b981', secondary: '#d1fae5', particles: 8 }; // Common/Uncommon
  };

  const config = getRoomConfig(tier);

  // Canvas Animation Effect (Sparkles, Dust, Glow)
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Simple static effect for now or add particles here
      // This is a placeholder for potential canvas enhancements
      // animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, tier, isOverdrive]);

  const getBuildingIcon = () => {
    // Room Type Icons
    switch (tier) {
      case 1: // Fan Room (Small)
      case 2: // Fan Room (Large)
        return <Fan size={48} className={`text-emerald-500 ${isActive ? 'animate-[spin_4s_linear_infinite]' : 'opacity-50'}`} />;
      case 3: // Aircon Standard
      case 4: // Aircon Deluxe
        return <Snowflake size={48} className={`text-blue-400 ${isActive ? 'animate-pulse' : 'opacity-50'}`} />;
      case 5: // Studio
      case 6: // Suite
        return <Home size={56} className={`text-purple-400 ${isActive ? 'drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'opacity-50'}`} />;
      case 7: // Penthouse
      case 8: // Royal Suite
        return <Star size={64} className={`text-yellow-400 ${isActive ? 'animate-[spin_10s_linear_infinite] drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'opacity-50'}`} />;
      default:
        return <Home size={48} className="text-stone-500" />;
    }
  };

  return (
    <div className="relative w-full h-[140px] flex items-center justify-center overflow-hidden rounded-lg bg-stone-900/50 border border-stone-800">
      {/* Background Atmosphere */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-current/20 to-transparent"
          style={{ color: config.color }}
        ></div>
      </div>

      {/* Room Visuals */}
      <div className="relative z-10 transform transition-all duration-500 hover:scale-105">
        {getBuildingIcon()}
      </div>

      {/* Status Indicators */}
      {isOverdrive && (
        <div className="absolute top-2 right-2 text-purple-400 animate-pulse">
          <Zap size={16} fill="currentColor" />
        </div>
      )}

      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
          <span className="text-xs text-stone-400 font-bold uppercase tracking-widest border border-stone-600 px-2 py-1 rounded">ปิดปรับปรุง</span>
        </div>
      )}

      {/* Canvas Overlay for Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" width={200} height={140} />
    </div>
  );
};