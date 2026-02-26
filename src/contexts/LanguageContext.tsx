import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'sk' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  sk: {
    // Hero section
    heroTitle: '#klímaKošíc',
    heroDescription: 'Záplavy, horúce letá, drahé teplo — to nie sú vzdialené problémy. Sú to rozhodnutia ľudí, ktorých volíte 25. októbra.',
    viewData: 'Pozrite si údaje',
    learnMore: 'Zistite viac',
    
    // Menu
    climateChange: 'Klimatická zmena',
    joinAction: 'Zapojte sa do akcie',
    supportProject: 'Podporte tento projekt',
    backToHome: 'Späť na hlavnú stránku',
    
    // KPI Section
    keyIndicators: 'Kľúčové klimatické ukazovatele',
    co2Emissions: 'CO₂ emisie',
    co2Unit: 't/osoba',
    co2Description: 'Emisie CO₂ na obyvateľa v roku',
    co2Tooltip: 'CO₂ emisie z fosílnych palív na obyvateľa - kľúčový ukazovateľ uhlíkovej stopy regiónu',
    cleanElectricity: 'Čistá elektrina',
    cleanElectricityDescription: 'Podiel nízkouhlíkovej elektriny',
    cleanElectricityTooltip: 'Percentuálny podiel elektriny z jadrových a obnoviteľných zdrojov',
    warming: 'Otepľovanie',
    warmingDescription: 'Zmena teploty od roku 1950',
    warmingTooltip: 'Priemerná zmena teploty za posledných 5 rokov oproti 50. rokom',
    
    // Charts section
    trendsTitle: 'Analýza klimatických trendov',
    
    // CTA section
    ctaTitle: 'Kríza je tu, aký je váš plán?',
    ctaDescription: 'Klimatická kríza ohrozuje Košice, naše domovy, pracovné miesta a zdravie. Ak ju chceme zastaviť, musíme konať. Teraz.',
    
    // FAQ
    faqTitle: 'Často kladené otázky',
    
    // Language
    language: 'Jazyk',
    
    // Climate Change page
    climateChangeTitle: 'Klimatická zmena v Košickom kraji',
    intro: 'Úvod',
    data: 'Dáta a pozorované zmeny',
    physics: 'Fyzikálne základy a princípy',
    impacts: 'Dopady a budúci vývoj',
    extremes: 'Extrémne javy',
    
    // Region specific
    regionName: 'Košický kraj',
    cityName: 'Košice',
  },
  en: {
    // Hero section
    heroTitle: '#climateKosice',
    heroDescription: 'Floods, hot summers, expensive heating — these are not distant problems. They are decisions of the people you vote for on October 25.',
    viewData: 'View the data',
    learnMore: 'Learn more',
    
    // Menu
    climateChange: 'Climate Change',
    joinAction: 'Join the action',
    supportProject: 'Support this project',
    backToHome: 'Back to home',
    
    // KPI Section
    keyIndicators: 'Key Climate Indicators',
    co2Emissions: 'CO₂ emissions',
    co2Unit: 't/capita',
    co2Description: 'CO₂ emissions per capita in',
    co2Tooltip: 'CO₂ emissions from fossil fuels per capita - key indicator of region carbon footprint',
    cleanElectricity: 'Clean electricity',
    cleanElectricityDescription: 'Share of low-carbon electricity',
    cleanElectricityTooltip: 'Percentage share of electricity from nuclear and renewable sources',
    warming: 'Warming',
    warmingDescription: 'Temperature change since 1950',
    warmingTooltip: 'Average temperature change in the last 5 years compared to the 1950s',
    
    // Charts section
    trendsTitle: 'Climate Trends Analysis',
    
    // CTA section
    ctaTitle: 'The crisis is here, what is your plan?',
    ctaDescription: 'The climate crisis threatens Košice, our homes, jobs and health. If we want to stop it, we must act. Now.',
    
    // FAQ
    faqTitle: 'Frequently Asked Questions',
    
    // Language
    language: 'Language',
    
    // Climate Change page
    climateChangeTitle: 'Climate Change in Košice Region',
    intro: 'Introduction',
    data: 'Data and observed changes',
    physics: 'Physical foundations and principles',
    impacts: 'Impacts and future development',
    extremes: 'Extreme events',
    
    // Region specific
    regionName: 'Košice Region',
    cityName: 'Košice',
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('sk');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.sk] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
