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
} from 'lucide-react';
import { useApp, AppPage } from '../../context/AppContext';
import { cn } from '../../utils/cn';

interface NavItem {
  id: AppPage;
  labelKey: keyof typeof import('../../utils/translations').translations['en']['nav'];
  icon: React.ReactNode;
  badge?: number | string;
}

export const Sidebar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    unacknowledgedAlertCount,
    selectedPatient,
    language,
    t,
  } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'command-center',
      labelKey: 'commandCenter',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'patient-360',
      labelKey: 'patient360',
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: 'organ-intelligence',
      labelKey: 'organIntelligence',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'cascade-graph',
      labelKey: 'cascadeGraph',
      icon: <Network className="w-4 h-4" />,
    },
    {
      id: 'futurecast',
      labelKey: 'futurecast',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'whatif',
      labelKey: 'whatif',
      icon: <FlaskConical className="w-4 h-4" />,
    },
    {
      id: 'alerts',
      labelKey: 'alerts',
      icon: <BellRing className="w-4 h-4" />,
      badge: unacknowledgedAlertCount > 0 ? unacknowledgedAlertCount : undefined,
    },
    {
      id: 'data-trust',
      labelKey: 'dataTrust',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-card border-r border-vitalis-border flex flex-col h-screen shrink-0 select-none">
      {/* Brand Logo Header: AngaSutra / अङ्गसूत्र */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-vitalis-border">
        <div className="w-9 h-9 rounded-md bg-vitalis-navy flex items-center justify-center text-white shadow-subtle shrink-0">
          <HeartPulse className="w-5 h-5 text-sky-300" />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-wider text-vitalis-navy truncate">
              {language === 'hi' ? 'अङ्गसूत्र' : 'ANGASUTRA'}
            </span>
            <span className="text-[10px] bg-vitalis-teal/15 text-vitalis-teal px-1 py-0.2 rounded font-semibold uppercase tracking-wider shrink-0">
              ASt
            </span>
          </div>
          <p className="text-[10px] text-vitalis-muted font-medium truncate">
            {language === 'hi' ? 'बहु-अङ्ग प्रज्ञा' : 'Multi-Organ Intelligence'}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-vitalis-muted uppercase tracking-wider">
          {t.nav.suites}
        </div>

        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const label = t.nav[item.labelKey];
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
                    'px-1.5 py-0.2 text-[10px] font-bold rounded-full shrink-0',
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
      </nav>

      {/* Active Patient Focus Card */}
      {selectedPatient && (
        <div className="p-3 border-t border-vitalis-border bg-slate-50/70">
          <div className="text-[10px] font-semibold text-vitalis-muted uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>{t.nav.focusedPatient}</span>
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                selectedPatient.acuityTier === 'Critical'
                  ? 'bg-vitalis-critical'
                  : selectedPatient.acuityTier === 'Urgent'
                  ? 'bg-vitalis-warning'
                  : 'bg-emerald-500'
              )}
            />
          </div>
          <button
            onClick={() => setCurrentPage('patient-360')}
            className="w-full text-left p-2 rounded-md bg-white border border-vitalis-border hover:border-vitalis-blue/40 transition-all shadow-subtle group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-vitalis-text group-hover:text-vitalis-blue truncate">
                {selectedPatient.name}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-vitalis-muted group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-vitalis-muted mt-0.5">
              <span>{selectedPatient.id}</span>
              <span className="font-mono text-[10px]">{selectedPatient.bed}</span>
            </div>
          </button>
        </div>
      )}

      {/* System Version & Integrity */}
      <div className="px-4 py-2.5 border-t border-vitalis-border text-[10px] text-vitalis-muted flex items-center justify-between bg-white">
        <span>ASt v2.4</span>
        <span className="flex items-center gap-1 text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {t.nav.pipelineActive}
        </span>
      </div>
    </aside>
  );
};
