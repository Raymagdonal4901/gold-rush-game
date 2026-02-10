import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../services/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    getLocalized: (content: string | { th: string; en: string } | undefined) => string;
    formatCurrency: (amount: number, options?: { hideSymbol?: boolean; forceTHB?: boolean; forceUSD?: boolean }) => string;
}

const EXCHANGE_RATE = 35; // Standard system rate

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('th');

    useEffect(() => {
        const savedLang = localStorage.getItem('game_language') as Language;
        if (savedLang && (savedLang === 'th' || savedLang === 'en')) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('game_language', lang);
    };

    const t = (path: string): string => {
        const keys = path.split('.');
        let result: any = translations[language];

        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                return path; // Return key if not found
            }
        }

        return typeof result === 'string' ? result : path;
    };

    const getLocalized = (content: string | { th: string; en: string } | undefined): string => {
        if (!content) return '';
        if (typeof content === 'string') return content;
        return content[language] || content['en'];
    };

    const formatCurrency = (amount: number, options?: { hideSymbol?: boolean; forceTHB?: boolean; forceUSD?: boolean }): string => {
        const isThai = options?.forceUSD ? false : (language === 'th' || options?.forceTHB);
        const val = isThai ? amount * EXCHANGE_RATE : amount;
        const formatted = val.toLocaleString(undefined, {
            minimumFractionDigits: val % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 4
        });

        if (options?.hideSymbol) return formatted;
        return isThai ? `${formatted} ฿` : `$${formatted}`;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, getLocalized, formatCurrency }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
