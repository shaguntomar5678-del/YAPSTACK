import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations, Language } from '../utils/translations';
import { OrganType } from '../types/organ';
import { PatientSummary } from '../lib/schemas';
import { fetchPatients } from '../lib/dataClient';

export type AppPage =
  | 'command-center'
  | 'patient-360'
  | 'organ-intelligence'
  | 'cascade-graph'
  | 'futurecast'
  | 'whatif'
  | 'alerts'
  | 'data-trust'
  | 'model-card';

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;

  // Active patient
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;

  // Replay clock: anchor hour selected across Patient 360, FutureCast, DataTrust, etc.
  selectedAnchorHour: number;
  setSelectedAnchorHour: (hour: number) => void;

  // Patient list from JSON (replaces old Patient[] type)
  patients: PatientSummary[];
  loadingPatients: boolean;

  // Organ tab
  selectedOrganTab: OrganType;
  setSelectedOrganTab: (tab: OrganType) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Alert badge count (derived: elevated patients count)
  unacknowledgedAlertCount: number;

  // Navigation helper
  navigateToPatient: (patientId: string, page?: AppPage) => void;

  // Refresh
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currentPage, setCurrentPage] = useState<AppPage>('command-center');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('V-104');
  const [selectedAnchorHour, setSelectedAnchorHour] = useState<number>(92); // latest anchor by default
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(true);
  const [selectedOrganTab, setSelectedOrganTab] = useState<OrganType>('renal');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const t = useMemo(() => translations[language], [language]);

  const loadData = async () => {
    setLoadingPatients(true);
    try {
      const fetched = await fetchPatients();
      setPatients(fetched);
    } catch (err) {
      console.error('Failed to load patient list', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const unacknowledgedAlertCount = useMemo(() => {
    return patients.filter((p) => p.elevated).length;
  }, [patients]);

  const navigateToPatient = (patientId: string, page: AppPage = 'patient-360') => {
    setSelectedPatientId(patientId);
    setCurrentPage(page);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentPage,
        setCurrentPage,
        selectedPatientId,
        setSelectedPatientId,
        selectedAnchorHour,
        setSelectedAnchorHour,
        patients,
        loadingPatients,
        selectedOrganTab,
        setSelectedOrganTab,
        searchQuery,
        setSearchQuery,
        unacknowledgedAlertCount,
        navigateToPatient,
        refreshAll: loadData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useAppContext = useApp;
