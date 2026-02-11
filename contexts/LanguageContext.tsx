import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../services/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, any>) => any;
    getLocalized: (content: string | { th: string; en: string } | undefined) => string;
    formatCurrency: (amount: number, options?: { hideSymbol?: boolean; forceTHB?: boolean; forceUSD?: boolean; showDecimals?: boolean }) => string;
    formatBonus: (amount: number, typeId?: string) => string;
}

const EXCHANGE_RATE = 35; // Standard system rate

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

    const formatCurrency = (amount: number, options?: { hideSymbol?: boolean; forceTHB?: boolean; forceUSD?: boolean; showDecimals?: boolean }): string => {
        const isThai = options?.forceUSD ? false : (language === 'th' || options?.forceTHB);
        let val = isThai ? (options?.showDecimals ? amount * EXCHANGE_RATE : Math.round(amount * EXCHANGE_RATE)) : amount;

        if (Math.abs(val - Math.round(val)) < 0.001) {
            val = Math.round(val);
        }

        const minDecimals = options?.showDecimals ? 2 : (val % 1 === 0 ? 0 : 2);
        const formatted = val.toLocaleString(undefined, {
            minimumFractionDigits: minDecimals,
            maximumFractionDigits: 4
        });

        if (options?.hideSymbol) return formatted;
        return isThai ? `${formatted} ฿` : `$${formatted}`;
    };

    const formatBonus = (amount: number, typeId?: string): string => {
        if (language === 'en') return `+${amount}`;
        if (typeId === 'hat' || (amount > 0.02 && amount < 0.03)) return '+1';
        if (typeId === 'uniform' || (amount > 0.05 && amount < 0.06)) return '+2';
        if (typeId === 'bag' || (amount > 0.08 && amount < 0.09)) return '+3';
        if (typeId === 'boots' || (amount > 0.11 && amount < 0.12)) return '+4';
        if (typeId === 'glasses' || (amount > 0.14 && amount < 0.15)) return '+5';
        if (typeId === 'mobile' || (amount > 0.17 && amount < 0.18)) return '+6';
        if (typeId === 'pc' || (amount > 0.22 && amount < 0.23)) return '+8';
        if (typeId === 'auto_excavator' || (amount > 0.42 && amount < 0.43)) return '+10';
        return `+${amount}`;
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
