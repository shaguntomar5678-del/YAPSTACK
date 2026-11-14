import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useApp } from '../../context/AppContext';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { language } = useApp();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-vitalis-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        {/* Global Clinical Sub-banner */}
        <div className="bg-sky-50/80 border-b border-sky-100 px-6 py-1.5 flex items-center justify-between text-[11px] text-sky-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-vitalis-navy">
              {language === 'hi' ? 'अङ्गसूत्र (AngaSutra) क्लिनिकल इंटेलिजेंस' : 'ANGASUTRA CLINICAL INTELLIGENCE'}
            </span>
            <span>•</span>
            <span className="text-slate-600">
              {language === 'hi'
                ? 'गहन चिकित्सा बहु-अङ्ग विफलता पूर्व-चेतावनी एवं सोपान गतिशीलता'
                : 'Advanced multi-organ failure early warning & cascade dynamics'}
            </span>
          </div>
          <span className="font-mono text-[10px] text-sky-800 bg-sky-100 px-2 py-0.5 rounded font-semibold">
            {language === 'hi' ? 'सक्रिय निगरानी' : 'Continuous Telemetry Active'}
          </span>
        </div>

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
