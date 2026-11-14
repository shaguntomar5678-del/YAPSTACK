/**
 * src/lib/dataClient.ts
 * Centralised fetch layer: sanitises Python bare NaN, validates via Zod, and caches in-memory.
 * Components never fetch directly — they use the hooks in src/lib/hooks.ts.
 */
import {
  ManifestSchema, Manifest,
  PatientsListSchema, PatientSummary,
  PatientRecordSchema, PatientRecord,
  WhatIfSchema, WhatIf,
  ModelCardSchema, ModelCard,
} from './schemas';

// ─── Cache ───────────────────────────────────────────────────────────────────
const cache = new Map<string, unknown>();

// ─── Sanitise Python NaN ─────────────────────────────────────────────────────
function sanitizeNaN(text: string): string {
  // Replace bare NaN (Python JSON output) with null
  return text.replace(/:\s*NaN\b/g, ': null');
}

// ─── Core fetch ──────────────────────────────────────────────────────────────
async function fetchJson(url: string): Promise<unknown> {
  if (cache.has(url)) return cache.get(url);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} loading ${url}`);

  const text = await res.text();
  const sanitized = sanitizeNaN(text);
  const data = JSON.parse(sanitized);
  cache.set(url, data);
  return data;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchManifest(): Promise<Manifest> {
  const raw = await fetchJson('/data/manifest.json');
  const result = ManifestSchema.safeParse(raw);
  if (!result.success) {
    console.error('manifest.json validation error:', result.error.flatten());
    // Return a safe default so the app doesn't crash
    return { disclaimers: ['Decision support only. Not a diagnosis or treatment recommendation.'] };
  }
  return result.data;
}

const INDIAN_PATIENT_INFO: Record<string, { name: string; bed: string }> = {
  'V-104': { name: 'Vikram Sharma', bed: 'ICU-B04' },
  'P-201': { name: 'Priya Patel', bed: 'ICU-A01' },
  'P-202': { name: 'Rajesh Kumar', bed: 'ICU-A02' },
  'P-203': { name: 'Sunita Verma', bed: 'ICU-A03' },
  'P-204': { name: 'Anil Deshmukh', bed: 'ICU-B01' },
  'P-205': { name: 'Kavita Reddy', bed: 'ICU-B02' },
  'P-206': { name: 'Arjun Nair', bed: 'ICU-B03' },
  'P-207': { name: 'Deepak Joshi', bed: 'ICU-C01' },
  'P-208': { name: 'Meera Iyer', bed: 'ICU-C02' },
  'P-209': { name: 'Rohan Gupta', bed: 'ICU-C03' },
  'P-210': { name: 'Ananya Sen', bed: 'ICU-C04' },
};

export async function fetchPatients(): Promise<PatientSummary[]> {
  const raw = await fetchJson('/data/patients.json');
  const result = PatientsListSchema.safeParse(raw);
  if (!result.success) {
    console.error('patients.json validation error:', result.error.flatten());
    return [];
  }
  return result.data.map((p) => {
    const info = INDIAN_PATIENT_INFO[p.id];
    return {
      ...p,
      name: info?.name ?? `Patient ${p.id}`,
      bed: info?.bed ?? 'ICU',
    };
  });
}

export async function fetchPatientRecord(id: string): Promise<PatientRecord> {
  const raw = await fetchJson(`/data/patients/${id}.json`);
  const result = PatientRecordSchema.safeParse(raw);
  if (!result.success) {
    console.error(`patients/${id}.json validation error:`, result.error.flatten());
    throw new Error(`Validation failed for patient record ${id}`);
  }
  return result.data;
}

export async function fetchWhatIf(patientId: string): Promise<WhatIf> {
  const raw = await fetchJson(`/data/whatif_${patientId}.json`);
  const result = WhatIfSchema.safeParse(raw);
  if (!result.success) {
    console.error(`whatif_${patientId}.json validation error:`, result.error.flatten());
    throw new Error(`Validation failed for whatif_${patientId}.json`);
  }
  return result.data;
}

export async function fetchModelCard(): Promise<ModelCard> {
  const raw = await fetchJson('/data/model_card.json');
  const result = ModelCardSchema.safeParse(raw);
  if (!result.success) {
    console.error('model_card.json validation error:', result.error.flatten());
    throw new Error('Validation failed for model_card.json');
  }
  return result.data;
}

/** Clear the in-memory cache (useful for hot-reload in dev) */
export function clearCache(): void {
  cache.clear();
}
