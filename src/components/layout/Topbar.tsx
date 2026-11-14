import React from 'react';
import {
  Search,
  Bell,
  ChevronRight,
  Globe,
  User,
} from 'lucide-react';
import { useApp, AppPage } from '../../context/AppContext';
import { cn } from '../../utils/cn';

export const Topbar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    selectedPatient,
    searchQuery,
    setSearchQuery,
    unacknowledgedAlertCount,
    language,
    setLanguage,
    t,
  } = useApp();

  const pageTitles: Record<AppPage, { en: string; hi: string }> = {
    'command-center': { en: 'Command Center', hi: 'कमांड सेंटर' },
    'patient-360': { en: 'Patient 360', hi: 'रोगी ३६०°' },
    'organ-intelligence': { en: 'Organ Intelligence', hi: 'अङ्ग प्रज्ञा' },
    'cascade-graph': { en: 'Cascade Graph', hi: 'सोपान आरेख' },
    futurecast: { en: 'FutureCast', hi: 'भविष्य-दर्शन' },
    whatif: { en: 'What-if Lab', hi: 'यदि-प्रयोगशाला' },
    alerts: { en: 'Alert Center', hi: 'चेतावनी केंद्र' },
    'data-trust': { en: 'Data Trust', hi: 'डेटा विश्वसनीयता' },
  };

  const activeTitle = language === 'hi' ? pageTitles[currentPage].hi : pageTitles[currentPage].en;

  return (
    <header className="h-16 bg-card border-b border-vitalis-border px-6 flex items-center justify-between shrink-0 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold text-vitalis-navy tracking-wide">
          {language === 'hi' ? 'अङ्गसूत्र (ASt)' : 'ANGASUTRA'}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-vitalis-muted" />
        <span className="text-vitalis-text font-semibold">{activeTitle}</span>
        {selectedPatient && currentPage !== 'command-center' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-vitalis-muted" />
            <span className="text-vitalis-navy font-semibold bg-vitalis-navy/5 px-2 py-0.5 rounded border border-vitalis-navy/10">
              {selectedPatient.name} ({selectedPatient.id})
            </span>
          </>
        )}
      </div>

      {/* Center Search & Global Filter */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-vitalis-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.topbar.searchPlaceholder}
            className="w-full bg-[#F3F6FA] border border-vitalis-border rounded-md pl-9 pr-3 py-1.5 text-xs text-vitalis-text placeholder:text-vitalis-muted focus:outline-none focus:border-vitalis-blue focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vitalis-muted hover:text-vitalis-text text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Language Switcher, Notifications, User Profile */}
      <div className="flex items-center gap-4">
        {/* Language Switcher (English / हिन्दी) */}
        <div className="flex items-center bg-[#F3F6FA] border border-vitalis-border rounded-md p-0.5 shadow-subtle">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={cn(
              'px-2.5 py-1 text-xs rounded transition-all font-medium',
              language === 'en'
                ? 'bg-vitalis-navy text-white font-semibold shadow-subtle'
                : 'text-vitalis-muted hover:text-vitalis-text'
            )}
            title="Switch to English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={cn(
              'px-2.5 py-1 text-xs rounded transition-all font-medium',
              language === 'hi'
                ? 'bg-vitalis-navy text-white font-semibold shadow-subtle'
                : 'text-vitalis-muted hover:text-vitalis-text'
            )}
            title="हिन्दी में बदलें (Switch to Hindi)"
          >
            हिन्दी
          </button>
        </div>

        {/* Notifications / Alert Trigger */}
        <button
          onClick={() => setCurrentPage('alerts')}
          className="relative p-2 text-vitalis-muted hover:text-vitalis-navy rounded-md hover:bg-slate-100 transition-colors"
          title={language === 'hi' ? 'चिकित्सीय चेतावनियां (Alerts)' : 'Clinical Alerts'}
        >
          <Bell className="w-4 h-4" />
          {unacknowledgedAlertCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-vitalis-critical text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
              {unacknowledgedAlertCount}
            </span>
          )}
        </button>

        {/* User Profile - Indian Attending Physician */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-vitalis-border">
          <div className="w-8 h-8 rounded-full bg-vitalis-navy/10 border border-vitalis-navy/20 flex items-center justify-center text-vitalis-navy font-semibold text-xs">
            AM
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-vitalis-text">
              {language === 'hi' ? 'डॉ. अदिति मुखर्जी, MD' : 'Dr. Aditi Mukherjee, MD'}
            </div>
            <div className="text-[10px] text-vitalis-muted">
              {language === 'hi' ? 'वरिष्ठ गहन चिकित्सा विशेषज्ञ (CCM)' : 'Critical Care Medicine Attending'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
