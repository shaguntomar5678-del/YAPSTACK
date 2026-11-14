/**
 * src/lib/hooks.ts
 * React hooks wrapping dataClient — the only way components should access ML data.
 */
import { useState, useEffect } from 'react';
import {
  fetchManifest, fetchPatients, fetchPatientRecord, fetchWhatIf, fetchModelCard,
} from './dataClient';
import {
  Manifest, PatientSummary, PatientRecord, WhatIf, ModelCard,
} from './schemas';

// ─── Generic async state ─────────────────────────────────────────────────────
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fn()
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((e) => { if (!cancelled) setState({ data: null, loading: false, error: String(e) }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

// ─── Manifest ────────────────────────────────────────────────────────────────
export function useManifest(): AsyncState<Manifest> {
  return useAsync(fetchManifest, []);
}

// ─── Patient list ─────────────────────────────────────────────────────────────
export function usePatients(): AsyncState<PatientSummary[]> {
  return useAsync(fetchPatients, []);
}

// ─── Individual patient record ────────────────────────────────────────────────
export function usePatient(id: string | null): AsyncState<PatientRecord> {
  return useAsync(
    () => (id ? fetchPatientRecord(id) : Promise.resolve(null)),
    [id],
  );
}

// ─── What-If ─────────────────────────────────────────────────────────────────
export function useWhatIf(patientId: string | null): AsyncState<WhatIf> {
  return useAsync(
    () => (patientId ? fetchWhatIf(patientId) : Promise.resolve(null)),
    [patientId],
  );
}

// ─── Model Card ───────────────────────────────────────────────────────────────
export function useModelCard(): AsyncState<ModelCard> {
  return useAsync(fetchModelCard, []);
}
