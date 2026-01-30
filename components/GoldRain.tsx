import React, { useEffect, useState } from 'react';
import { Coins, Sparkles } from 'lucide-react';

export const GoldRain: React.FC = () => {
  const [coins, setCoins] = useState<number[]>([]);

  useEffect(() => {
    // Generate particles
    const count = 50;
    const newCoins = Array.from({ length: count }, (_, i) => i);
    setCoins(newCoins);

    // Self cleanup is handled by parent unmounting usually, 
    // but the CSS animations run once per keyframe cycle.
  }, []);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {coins.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 2 + Math.random() * 3;
        const size = 16 + Math.random() * 24;
        
        return (
          <div
            key={i}
            className="absolute -top-10 animate-fall"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          >
            {i % 3 === 0 ? (
                 <div className="text-yellow-300 animate-spin" style={{ animationDuration: `${duration/2}s` }}>
                    <Sparkles size={size} fill="currentColor" />
                 </div>
            ) : (
                <div className="text-yellow-500 animate-[spin_1s_linear_infinite]" style={{ animationDuration: `${Math.random() + 0.5}s` }}>
                    <Coins size={size} fill="#facc15" strokeWidth={1} />
                </div>
            )}
          </div>
        );
      })}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
            animation-name: fall;
            animation-timing-function: linear;
            animation-iteration-count: 1;
        }
      `}</style>
    </div>
  );
};