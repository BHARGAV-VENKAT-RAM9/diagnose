"use client";

import React, { createContext, useContext } from "react";
import locales from "../locales.json";

type Language = "en" | "te";

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, variables?: Record<string, string>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language: Language = "en";

  const setLanguage = (lang: Language) => {
    // No-op to disable switching
  };

  const t = (path: string, variables?: Record<string, string>): string => {
    const keys = path.split(".");
    let translation: any = locales[language];

    for (const key of keys) {
      if (translation && typeof translation === "object" && key in translation) {
        translation = translation[key];
      } else {
        // Fallback to English if translation is missing in Telugu
        let englishFallback: any = locales["en"];
        for (const fallbackKey of keys) {
          if (englishFallback && typeof englishFallback === "object" && fallbackKey in englishFallback) {
            englishFallback = englishFallback[fallbackKey];
          } else {
            return path; // Return the path if key not found anywhere
          }
        }
        translation = englishFallback;
        break;
      }
    }

    if (typeof translation !== "string") {
      return path;
    }

    // Replace variables in string (e.g., {date})
    let result = translation;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{${key}}`, "g"), value);
      });
    }

    return result;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};
