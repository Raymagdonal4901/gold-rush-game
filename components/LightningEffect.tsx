
import React, { useEffect, useState } from 'react';

interface LightningBolt {
    id: number;
    path: string;
    opacity: number;
}

export const LightningEffect: React.FC<{ active?: boolean, intensity?: 'low' | 'high' }> = ({ active = true, intensity = 'high' }) => {
    const [bolts, setBolts] = useState<LightningBolt[]>([]);

    useEffect(() => {
        if (!active) {
            setBolts([]);
            return;
        }

        const createBolt = () => {
            const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
            let startX, startY, endX, endY;

            if (side === 0) { startX = Math.random() * 100; startY = 0; endX = Math.random() * 100; endY = 100; }
            else if (side === 1) { startX = 100; startY = Math.random() * 100; endX = 0; endY = Math.random() * 100; }
            else if (side === 2) { startX = Math.random() * 100; startY = 100; endX = Math.random() * 100; endY = 0; }
            else { startX = 0; startY = Math.random() * 100; endX = 100; endY = Math.random() * 100; }

            const segments = 6 + Math.floor(Math.random() * 6);
            let path = `M ${startX} ${startY}`;
            let currentX = startX;
            let currentY = startY;

            for (let i = 1; i <= segments; i++) {
                const targetX = startX + (endX - startX) * (i / segments);
                const targetY = startY + (endY - startY) * (i / segments);
                currentX = targetX + (Math.random() - 0.5) * 25;
                currentY = targetY + (Math.random() - 0.5) * 25;
                path += ` L ${currentX} ${currentY}`;
            }

            path += ` L ${endX} ${endY}`;

            return {
                id: Math.random(),
                path,
                opacity: 0.7 + Math.random() * 0.3
            };
        };

        const interval = setInterval(() => {
            const numBolts = intensity === 'high' ? 5 + Math.floor(Math.random() * 5) : 1;
            const newBolts = Array.from({ length: numBolts }).map(createBolt);
            setBolts(newBolts);

            // Clear bolts quickly for flickering effect
            setTimeout(() => setBolts([]), 40 + Math.random() * 80);
        }, intensity === 'high' ? 120 : 1500);

        return () => clearInterval(interval);
    }, [active, intensity]);

    if (!active || bolts.length === 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <defs>
                    <filter id="lightning-glow">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                {bolts.map(bolt => (
                    <path
                        key={bolt.id}
                        d={bolt.path}
                        fill="none"
                        stroke="white"
                        strokeWidth="0.8"
                        filter="url(#lightning-glow)"
                        style={{
                            opacity: bolt.opacity,
                            filter: 'drop-shadow(0 0 8px #60a5fa) drop-shadow(0 0 15px #3b82f6)'
                        }}
                        className="animate-pulse"
                    />
                ))}
            </svg>
            <div className={`absolute inset-0 bg-blue-500/10 animate-[flicker_0.1s_infinite] transition-opacity duration-300 ${bolts.length > 0 ? 'opacity-100' : 'opacity-0'}`} />
            <style>{`
                @keyframes flicker {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};
