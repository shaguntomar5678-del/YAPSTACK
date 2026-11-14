import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Shell } from './components/layout/Shell';
import { CommandCenter } from './components/pages/CommandCenter';
import { Patient360 } from './components/pages/Patient360';
import { OrganIntelligence } from './components/pages/OrganIntelligence';
import { CascadeGraph } from './components/pages/CascadeGraph';
import { FutureCast } from './components/pages/FutureCast';
import { WhatIfLab } from './components/pages/WhatIfLab';
import { AlertCenter } from './components/pages/AlertCenter';
import { DataTrust } from './components/pages/DataTrust';
import { ModelCard } from './components/pages/ModelCard';

const MainContent: React.FC = () => {
  const { currentPage } = useApp();

  return (
    <Shell>
      {currentPage === 'command-center' && <CommandCenter />}
      {currentPage === 'patient-360' && <Patient360 />}
      {currentPage === 'organ-intelligence' && <OrganIntelligence />}
      {currentPage === 'cascade-graph' && <CascadeGraph />}
      {currentPage === 'futurecast' && <FutureCast />}
      {currentPage === 'whatif' && <WhatIfLab />}
      {currentPage === 'alerts' && <AlertCenter />}
      {currentPage === 'data-trust' && <DataTrust />}
      {currentPage === 'model-card' && <ModelCard />}
    </Shell>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
