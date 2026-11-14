import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Activity,
  Network,
  TrendingUp,
  FlaskConical,
  BellRing,
  ShieldCheck,
  ChevronRight,
  HeartPulse,
  ClipboardList,
} from 'lucide-react';
import { useApp, AppPage } from '../../context/AppContext';
import { cn } from '../../utils/cn';

interface NavItem {
  id: AppPage;
  labelEn: string;
  labelHi: string;
  icon: React.ReactNode;
  badge?: number | string;
}

export const Sidebar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    unacknowledgedAlertCount,
    selectedPatientId,
    language,
  } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'command-center',
      labelEn: 'Command Center',
      labelHi: 'कमांड सेंटर',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'patient-360',
      labelEn: 'Patient 360',
      labelHi: 'रोगी ३६०°',
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: 'organ-intelligence',
      labelEn: 'Organ Intelligence',
      labelHi: 'अंग प्रज्ञा',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'cascade-graph',
      labelEn: 'Cascade Graph',
      labelHi: 'सोपान आरेख',
      icon: <Network className="w-4 h-4" />,
    },
    {
      id: 'futurecast',
      labelEn: 'FutureCast',
      labelHi: 'भविष्य-दर्शन',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'whatif',
      labelEn: 'What-if Lab',
      labelHi: 'यदि-प्रयोगशाला',
      icon: <FlaskConical className="w-4 h-4" />,
    },
    {
      id: 'alerts',
      labelEn: 'Alert Center',
      labelHi: 'चेतावनी केंद्र',
      icon: <BellRing className="w-4 h-4" />,
      badge: unacknowledgedAlertCount > 0 ? unacknowledgedAlertCount : undefined,
    },
    {
      id: 'data-trust',
      labelEn: 'Data Trust',
      labelHi: 'डेटा विश्वसनीयता',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'model-card',
      labelEn: 'Model Card',
      labelHi: 'मॉडल कार्ड',
      icon: <ClipboardList className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-card border-r border-vitalis-border flex flex-col h-full shrink-0 select-none">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-vitalis-border shrink-0">
        <div className="w-9 h-9 rounded-md bg-vitalis-navy flex items-center justify-center text-white shadow-subtle shrink-0">
          <HeartPulse className="w-5 h-5 text-sky-300" />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-wider text-vitalis-navy truncate">
              {language === 'hi' ? 'अंगसूत्र' : 'ANGASUTRA'}
            </span>
            <span className="text-[10px] bg-vitalis-teal/15 text-vitalis-teal px-1 py-0.5 rounded font-semibold uppercase tracking-wider shrink-0">
              ASt
            </span>
          </div>
          <p className="text-[10px] text-vitalis-muted font-medium truncate">
            {language === 'hi' ? 'बहु-अंग प्रज्ञा' : 'Multi-Organ Intelligence'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-vitalis-muted uppercase tracking-wider">
          {language === 'hi' ? 'बुद्धिमत्ता सूट' : 'Intelligence Suites'}
        </div>

        {navItems.slice(0, 8).map((item) => {
          const isActive = currentPage === item.id;
          const label = language === 'hi' ? item.labelHi : item.labelEn;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group',
                isActive
                  ? 'bg-vitalis-navy text-white shadow-subtle'
                  : 'text-vitalis-text hover:bg-slate-100 hover:text-vitalis-navy'
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span
                  className={cn(
                    'transition-colors shrink-0',
                    isActive ? 'text-sky-300' : 'text-vitalis-muted group-hover:text-vitalis-navy'
                  )}
                >
                  {item.icon}
                </span>
                <span className="truncate">{label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 text-[10px] font-bold rounded-full shrink-0',
                    isActive
                      ? 'bg-red-500 text-white'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Divider before Model Card */}
        <div className="pt-2 mt-2 border-t border-vitalis-border">
          <div className="px-3 pb-2 text-[10px] font-semibold text-vitalis-muted uppercase tracking-wider">
            {language === 'hi' ? 'मॉडल सत्यापन' : 'Model Validation'}
          </div>
          {navItems.slice(8).map((item) => {
            const isActive = currentPage === item.id;
            const label = language === 'hi' ? item.labelHi : item.labelEn;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-vitalis-navy text-white shadow-subtle'
                    : 'text-vitalis-text hover:bg-slate-100 hover:text-vitalis-navy'
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={cn(
                      'transition-colors shrink-0',
                      isActive ? 'text-sky-300' : 'text-vitalis-muted group-hover:text-vitalis-navy'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Active Patient Focus Card */}
      {selectedPatientId && (
        <div className="p-3 border-t border-vitalis-border bg-slate-50/70 shrink-0">
          <div className="text-[10px] font-semibold text-vitalis-muted uppercase tracking-wider mb-1.5">
            {language === 'hi' ? 'फ़ोकस्ड रोगी' : 'Focused Patient'}
          </div>
          <button
            onClick={() => setCurrentPage('patient-360')}
            className="w-full text-left p-2 rounded-md bg-white border border-vitalis-border hover:border-vitalis-blue/40 transition-all shadow-subtle group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-vitalis-text group-hover:text-vitalis-blue truncate">
                {selectedPatientId}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-vitalis-muted group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
            <div className="text-[10px] text-vitalis-muted mt-0.5">
              {language === 'hi' ? 'रोगी ३६०° खोलें' : 'Open Patient 360'}
            </div>
          </button>
        </div>
      )}

      {/* System Version */}
      <div className="px-4 py-2.5 border-t border-vitalis-border text-[10px] text-vitalis-muted flex items-center justify-between bg-white shrink-0">
        <span>ASt v2.4 · ML v0</span>
        <span className="flex items-center gap-1 text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {language === 'hi' ? 'पाइपलाइन सक्रिय' : 'Pipeline Active'}
        </span>
      </div>
    </aside>
  );
};
