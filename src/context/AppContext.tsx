import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Patient } from '../types/patient';
import { ClinicalAlert } from '../types/alert';
import { OrganType } from '../types/organ';
import { patientService } from '../services/patientService';
import { alertService } from '../services/alertService';
import { translations, Language } from '../utils/translations';

export type AppPage =
  | 'command-center'
  | 'patient-360'
  | 'organ-intelligence'
  | 'cascade-graph'
  | 'futurecast'
  | 'whatif'
  | 'alerts'
  | 'data-trust';

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  selectedPatient: Patient | null;
  patients: Patient[];
  loadingPatients: boolean;
  selectedOrganTab: OrganType;
  setSelectedOrganTab: (tab: OrganType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  alerts: ClinicalAlert[];
  unacknowledgedAlertCount: number;
  navigateToPatient: (patientId: string, page?: AppPage) => void;
  acknowledgeAlert: (alertId: string, clinician: string, notes: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currentPage, setCurrentPage] = useState<AppPage>('command-center');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PAT-1082');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(true);
  const [selectedOrganTab, setSelectedOrganTab] = useState<OrganType>('renal');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);

  const t = useMemo(() => translations[language], [language]);

  const loadData = async () => {
    setLoadingPatients(true);
    try {
      const [fetchedPatients, fetchedAlerts] = await Promise.all([
        patientService.getPatients(),
        alertService.getAlerts(),
      ]);
      setPatients(fetchedPatients);
      setAlerts(fetchedAlerts);
    } catch (err) {
      console.error('Failed to load initial clinical data', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0] || null;
  }, [patients, selectedPatientId]);

  const unacknowledgedAlertCount = useMemo(() => {
    return alerts.filter((a) => !a.acknowledged).length;
  }, [alerts]);

  const navigateToPatient = (patientId: string, page: AppPage = 'patient-360') => {
    setSelectedPatientId(patientId);
    setCurrentPage(page);
  };

  const handleAcknowledgeAlert = async (alertId: string, clinician: string, notes: string) => {
    const updated = await alertService.acknowledgeAlert(alertId, clinician, notes);
    if (updated) {
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
    }
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
        selectedPatient,
        patients,
        loadingPatients,
        selectedOrganTab,
        setSelectedOrganTab,
        searchQuery,
        setSearchQuery,
        alerts,
        unacknowledgedAlertCount,
        navigateToPatient,
        acknowledgeAlert: handleAcknowledgeAlert,
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
