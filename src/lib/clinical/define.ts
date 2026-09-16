import type { Disease, Medication, Specialty, Urgency } from "./types";

export type Draft = {
  id: string;
  name: string;
  icd10: string;
  specialty: Specialty;
  department: string;
  urgency: Urgency;
  setting: string;
  summary: string;
  hallmarks: string[];
  supportive?: string[];
  occasional?: string[];
  age?: [number, number];
  sexBias?: "female" | "male";
  pregnancyRisk?: boolean;
  vitals?: Disease["vitals"];
  comorbidBoost?: string[];
  smokerBoost?: boolean;
  travelBoost?: boolean;
  redFlags: string[];
  workup: string[];
  prevention: string[];
  medications: Medication[];
  selfCare: string[];
  seekCare: string;
  pHallmark?: number;
  pSupport?: number;
  pOccasional?: number;
};

export function defineDisease(d: Draft): Disease {
  const symptoms: Record<string, number> = {};
  const pH = d.pHallmark ?? 0.9;
  const pS = d.pSupport ?? 0.48;
  const pO = d.pOccasional ?? 0.18;
  for (const id of d.hallmarks) symptoms[id] = pH;
  for (const id of d.supportive ?? []) if (symptoms[id] == null) symptoms[id] = pS;
  for (const id of d.occasional ?? []) if (symptoms[id] == null) symptoms[id] = pO;
  return {
    id: d.id,
    name: d.name,
    icd10: d.icd10,
    specialty: d.specialty,
    department: d.department,
    urgency: d.urgency,
    setting: d.setting,
    summary: d.summary,
    symptoms,
    ageMin: d.age?.[0] ?? 0,
    ageMax: d.age?.[1] ?? 100,
    sexBias: d.sexBias,
    pregnancyRisk: d.pregnancyRisk,
    vitals: d.vitals ?? {},
    comorbidBoost: d.comorbidBoost ?? [],
    smokerBoost: d.smokerBoost,
    travelBoost: d.travelBoost,
    redFlags: d.redFlags,
    workup: d.workup,
    prevention: d.prevention,
    medications: d.medications,
    selfCare: d.selfCare,
    seekCare: d.seekCare,
  };
}
