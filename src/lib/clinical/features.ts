import { SYMPTOM_IDS } from "./symptoms";
import type { EncounterInput } from "./types";

export const BIO_FEATURES = [
  "age",
  "is_female",
  "is_male",
  "bmi",
  "pregnant",
  "smoker",
  "temperature",
  "heart_rate",
  "sbp",
  "dbp",
  "spo2",
  "resp_rate",
  "duration_days",
  "severity",
  "sudden_onset",
  "diabetes",
  "hypertension",
  "asthma",
  "copd",
  "heart_disease",
  "kidney_disease",
  "immunocompromised",
  "cancer",
  "travel",
] as const;

export type BioFeature = (typeof BIO_FEATURES)[number];

export const FEATURE_NAMES: string[] = [...BIO_FEATURES, ...SYMPTOM_IDS];

export const FEATURE_INDEX: Record<string, number> = Object.fromEntries(
  FEATURE_NAMES.map((name, i) => [name, i]),
);

export function bmiOf(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 24;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function vectorize(input: EncounterInput): Float64Array {
  const v = new Float64Array(FEATURE_NAMES.length);
  const { bio, vitals, context, selectedSymptoms } = input;
  const bmi = bmiOf(bio.heightCm, bio.weightKg);
  const set = (name: string, value: number) => {
    const i = FEATURE_INDEX[name];
    if (i != null) v[i] = value;
  };

  set("age", bio.age);
  set("is_female", bio.sex === "female" ? 1 : 0);
  set("is_male", bio.sex === "male" ? 1 : 0);
  set("bmi", bmi);
  set("pregnant", bio.pregnant ? 1 : 0);
  set("smoker", bio.smoker ? 1 : 0);
  set("temperature", vitals.temperatureC ?? 36.8);
  set("heart_rate", vitals.heartRate ?? 78);
  set("sbp", vitals.sbp ?? 122);
  set("dbp", vitals.dbp ?? 78);
  set("spo2", vitals.spo2 ?? 98);
  set("resp_rate", vitals.respRate ?? 16);
  set("duration_days", context.durationDays);
  set("severity", context.severity);
  set("sudden_onset", context.onset === "sudden" ? 1 : 0);
  set("diabetes", bio.comorbidities.includes("diabetes") ? 1 : 0);
  set("hypertension", bio.comorbidities.includes("hypertension") ? 1 : 0);
  set("asthma", bio.comorbidities.includes("asthma") ? 1 : 0);
  set("copd", bio.comorbidities.includes("copd") ? 1 : 0);
  set("heart_disease", bio.comorbidities.includes("heart-disease") ? 1 : 0);
  set("kidney_disease", bio.comorbidities.includes("kidney-disease") ? 1 : 0);
  set("immunocompromised", bio.comorbidities.includes("immunocompromised") ? 1 : 0);
  set("cancer", bio.comorbidities.includes("cancer") ? 1 : 0);
  set("travel", bio.travel ? 1 : 0);

  for (const id of selectedSymptoms) set(id, 1);
  return v;
}

export function emptyVector(): Float64Array {
  return new Float64Array(FEATURE_NAMES.length);
}
