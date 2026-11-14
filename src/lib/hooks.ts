/**
 * src/lib/hooks.ts
 * React hooks wrapping dataClient — the only way components should access ML data.
 */
import { useState, useEffect } from 'react';
import {
  fetchManifest,
  fetchPatients,
  fetchPatientRecord,
  fetchWhatIf,
  fetchModelCard,
} from './dataClient';
import {
  Manifest,
  PatientSummary,
  PatientRecord,
  WhatIf,
  ModelCard,
} from './schemas';

// ─── Generic async state ─────────────────────────────────────────────────────
export interface AsyncState<T> {
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
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((e) => {
        if (!cancelled) setState({ data: null, loading: false, error: String(e?.message || e) });
      });
    return () => {
      cancelled = true;
    };
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
export function usePatient(id: string | null | undefined): AsyncState<PatientRecord> {
  return useAsync(
    async () => {
      if (!id) throw new Error('No patient ID provided');
      return await fetchPatientRecord(id);
    },
    [id],
  );
}

// ─── What-If ─────────────────────────────────────────────────────────────────
export function useWhatIf(patientId: string | null | undefined): AsyncState<WhatIf> {
  return useAsync(
    async () => {
      if (!patientId) throw new Error('No patient ID provided');
      return await fetchWhatIf(patientId);
    },
    [patientId],
  );
}

// ─── Model Card ───────────────────────────────────────────────────────────────
export function useModelCard(): AsyncState<ModelCard> {
  return useAsync(fetchModelCard, []);
}
