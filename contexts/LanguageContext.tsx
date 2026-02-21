import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../services/translations';
import { EXCHANGE_RATE_USDT_THB } from '../constants';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, any>) => any;
    getLocalized: (content: string | { th: string; en: string } | undefined) => string;
    formatCurrency: (amount: number, options?: { hideSymbol?: boolean; forceTHB?: boolean; forceUSD?: boolean; showDecimals?: boolean; precision?: number }) => string;
    formatBonus: (amount: number, typeId?: string) => string;
}

const THB_TO_USD_RATE = EXCHANGE_RATE_USDT_THB; // 1 USD = 31 THB (USDT real rate)

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

    const getLocalized = (content: any): string => {
        if (!content) return '';
        if (typeof content === 'string') return content;

        // Handle standard { th, en } object or nested objects
        if (typeof content === 'object') {
            const val = content[language] || content['en'];
            if (val && typeof val === 'string') return val;

            // Fallback: if it's still an object, check for common name fields or return empty string
            if (val && typeof val === 'object') {
                return val.th || val.en || val.name || '';
            }

            // Final fallback for any other object structure
            return content.th || content.en || content.name || '';
        }

        return String(content || '');
    };

    const formatCurrency = (amount: number, options?: { hideSymbol?: boolean; forceTHB?: boolean; forceUSD?: boolean; showDecimals?: boolean; precision?: number }): string => {
        // Guard against undefined/NaN
        if (amount === undefined || amount === null || isNaN(Number(amount))) {
            return options?.hideSymbol ? '0' : (language === 'th' || options?.forceTHB) ? '0 ฿' : '$0';
        }

        // Force USD if requested, otherwise follow language but prioritize USD
        const isThai = options?.forceUSD ? false : (options?.forceTHB || language === 'th');

        // All amounts in system are stored as THB (Backend legacy)
        // Convert to USD by dividing by the rate if not in Thai mode
        let val = isThai ? Number(amount) : Number(amount) / THB_TO_USD_RATE;

        // If not forcing decimals and it's basically an integer, round it
        if (!options?.showDecimals && !options?.precision && Math.abs(val - Math.round(val)) < 0.01) {
            val = Math.round(val);
        }

        const defaultMaxDecimals = isThai ? 2 : 2; // Standardize to 2 for both usually, can be 4 for crypto
        const minDecimals = options?.precision !== undefined ? options.precision : (options?.showDecimals ? 2 : (val % 1 === 0 ? 0 : 2));
        const formatted = val.toLocaleString(undefined, {
            minimumFractionDigits: minDecimals,
            maximumFractionDigits: options?.precision !== undefined ? options.precision : defaultMaxDecimals
        });

        if (options?.hideSymbol) return formatted;
        // Prefix $ for USD, suffix ฿ for THB
        return isThai ? `${formatted} ฿` : `$${formatted}`;
    };

    const formatBonus = (amount: number, typeId?: string): string => {
        // Guard against undefined/NaN
        if (amount === undefined || amount === null || isNaN(Number(amount))) return '+0';
        if (amount === 0) return '+0';

        // If amount is small (legacy decimal), scale it up to THB first
        const thbAmount = Number(amount) < 0.5 ? Number(amount) * 35 : Number(amount);

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
