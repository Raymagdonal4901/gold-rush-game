import React from 'react';
// Removed unused imports from lucide-react

interface MaterialIconProps {
    id: number;
    size?: string; // This is usually wrapper className like "w-10 h-10"
    iconSize?: number;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({ id, size = "w-10 h-10", iconSize = 20 }) => {
    // Map ID to filename in /assets/materials/
    const getMaterialImage = () => {
        switch (id) {
            case 0: return 'mystery_ore.png';  // Mystery Ore (Tier 0)
            case 1: return 'coal.png';          // Coal
            case 2: return 'copper.png';
            case 3: return 'iron.png';
            case 4: return 'gold.png';
            case 5: return 'diamond.png';
            case 6: return 'oil.png';          // Synthetic Crude Oil (Tier 6)
            case 7: return 'vibranium.png';    // Vibranium (Tier 7)
            case 8: return 'mystery_ore.png';  // Mystery Ore (Tier 8)
            case 9: return 'legendary_ore.png'; // Legendary Ore (Tier 9)
            default: return 'oil.png';
        }
    };

    const imageFile = getMaterialImage();

    return (
        <div className={`${size} flex items-center justify-center`}>
            <img
                src={`/assets/materials/${imageFile}`}
                alt={`Material ${id}`}
                className="w-full h-full object-contain drop-shadow-md"
            />
        </div>
    );
};
