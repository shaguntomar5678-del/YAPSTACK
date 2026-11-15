import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useManifest } from '../../lib/hooks';
import { AlertTriangle } from 'lucide-react';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { data: manifest } = useManifest();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-vitalis-text flex-col">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />

          {/* Global Clinical Sub-banner */}
          <div className="bg-sky-50/80 border-b border-sky-100 px-6 py-1.5 flex items-center justify-between text-[11px] text-sky-900 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-vitalis-navy">ANGASETU CLINICAL INTELLIGENCE</span>
              <span>•</span>
              <span className="text-slate-600">Advanced multi-organ failure early warning &amp; cascade dynamics</span>
            </div>
            <span className="font-mono text-[10px] text-sky-800 bg-sky-100 px-2 py-0.5 rounded font-semibold">
              Continuous Telemetry Active
            </span>
          </div>

          {/* Main View Area */}
          <main className="flex-1 overflow-y-auto p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>

          {/* Persistent Disclaimer Footer */}
          <footer className="shrink-0 bg-amber-50 border-t border-amber-200 px-6 py-2 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 leading-relaxed">
              <strong>Simulated patient data only.</strong>{' '}
              {manifest?.disclaimers
                ? manifest.disclaimers.join(' • ')
                : 'Decision support only. Not a diagnosis or treatment recommendation. Risk values are calibrated model outputs on a proxy label, not validated clinical probabilities.'}
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};
