import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../services/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, any>) => any;
    getLocalized: (content: string | { th: string; en: string } | undefined) => string;
    formatCurrency: (amount: number, options?: { hideSymbol?: boolean; forceTHB?: boolean; forceUSD?: boolean; showDecimals?: boolean; precision?: number }) => string;
    formatBonus: (amount: number, typeId?: string) => string;
}

const THB_TO_USD_RATE = 31; // 1 USD = 31 THB (USDT real rate)

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('game_language');
        return (saved as Language) || 'th';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('game_language', lang);
    };

    const t = (path: string, params?: Record<string, any>): any => {
        const keys = path.split('.');
        let result: any = translations[language];

        for (const key of keys) {
            if (result && result[key] !== undefined) {
                result = result[key];
            } else {
                return path; // Return key if not found
            }
        }

        if (typeof result === 'string' && params) {
            Object.keys(params).forEach(key => {
                const regex = new RegExp(`\\{${key}\\}`, 'gi');
                result = (result as string).replace(regex, params[key]);
            });
        }

        return result;
    };

    const getLocalized = (content: string | { th: string; en: string } | undefined): string => {
        if (!content) return '';
        if (typeof content === 'string') return content;
        return content[language] || content['en'];
    };

    const formatCurrency = (amount: number, options?: { hideSymbol?: boolean; forceTHB?: boolean; forceUSD?: boolean; showDecimals?: boolean; precision?: number }): string => {
        const isThai = options?.forceUSD ? false : (language === 'th' || options?.forceTHB);

        // All amounts in system are stored as THB
        // TH mode: show as-is (THB)
        // EN mode: convert to USD by dividing by 31
        let val = isThai ? amount : amount / THB_TO_USD_RATE;

        // If not forcing decimals and it's basically an integer, round it
        if (!options?.showDecimals && !options?.precision && Math.abs(val - Math.round(val)) < 0.01) {
            val = Math.round(val);
        }

        const defaultMaxDecimals = isThai ? 2 : 4; // USD needs more decimals due to smaller values
        const minDecimals = options?.precision !== undefined ? options.precision : (options?.showDecimals ? 2 : (val % 1 === 0 ? 0 : 2));
        const formatted = val.toLocaleString(undefined, {
            minimumFractionDigits: minDecimals,
            maximumFractionDigits: options?.precision !== undefined ? options.precision : defaultMaxDecimals
        });

        if (options?.hideSymbol) return formatted;
        return isThai ? `${formatted} ฿` : `$${formatted}`;
    };

    const formatBonus = (amount: number, typeId?: string): string => {
        if (amount === 0) return '+0';

        // If amount is small (legacy decimal), scale it up to THB first
        const thbAmount = amount < 0.5 ? amount * 35 : amount;

        // EN mode: convert THB bonus to USD
        const displayAmount = language === 'en' ? thbAmount / THB_TO_USD_RATE : thbAmount;

        const formatted = displayAmount.toLocaleString(undefined, {
            minimumFractionDigits: displayAmount % 1 === 0 ? 0 : 2,
            maximumFractionDigits: language === 'en' ? 4 : 2
        });

        return `+${formatted}`;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, getLocalized, formatCurrency, formatBonus }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const useTranslation = () => useLanguage();
