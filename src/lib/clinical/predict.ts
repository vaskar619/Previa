import { DISEASES, DISEASE_BY_ID, N_TREES } from "./catalog";
import { FEATURE_NAMES, vectorize } from "./features";
import { forestPredict, getForest } from "./forest";
import { evaluateRedFlags, isCrisis } from "./red-flags";
import { SYMPTOM_BY_ID } from "./symptoms";
import type { EncounterInput, Prediction, RankedFinding } from "./types";

function softmax(xs: number[]): number[] {
  const m = Math.max(...xs);
  const e = xs.map((x) => Math.exp(x - m));
  const s = e.reduce((a, b) => a + b, 0) || 1;
  return e.map((v) => v / s);
}

function profileLogScore(input: EncounterInput, diseaseIndex: number): {
  log: number;
  matched: string[];
  missing: string[];
} {
  const d = DISEASES[diseaseIndex];
  const selected = new Set(input.selectedSymptoms);
  const hallmarks = Object.entries(d.symptoms)
    .filter(([, p]) => p >= 0.8)
    .map(([id]) => id)
    .filter((id) => SYMPTOM_BY_ID[id]);
  const matched = hallmarks.filter((id) => selected.has(id));
  const missing = hallmarks.filter((id) => !selected.has(id));

  let log = 0;
  for (const id of selected) {
    const p = Math.min(0.97, Math.max(0.01, d.symptoms[id] ?? 0.02));
    log += Math.log(p);
  }
  for (const id of missing) {
    const p = d.symptoms[id] ?? 0.9;
    log += Math.log(Math.max(0.05, 1 - p * 0.65));
  }
  log += matched.length * 0.35;

  const age = input.bio.age;
  if (age < d.ageMin - 2 || age > d.ageMax + 2) log -= 2.2;
  else if (age < d.ageMin || age > d.ageMax) log -= 0.7;

  if (d.sexBias === "female" && input.bio.sex === "male") log -= 0.9;
  if (d.sexBias === "male" && input.bio.sex === "female") log -= 0.9;
  if (d.pregnancyRisk && input.bio.pregnant) log += 0.8;
  if (d.smokerBoost && input.bio.smoker) log += 0.35;
  if (d.travelBoost && input.bio.travel) log += 1.1;

  for (const c of d.comorbidBoost) {
    if ((input.bio.comorbidities as string[]).includes(c)) log += 0.4;
  }

  const v = input.vitals;
  if (d.vitals.fever && v.temperatureC != null) {
    if (v.temperatureC >= 38) log += 0.55;
    else log -= 0.25;
  }
  if (d.vitals.highFever && v.temperatureC != null && v.temperatureC >= 39) log += 0.45;
  if (d.vitals.hypoxic && v.spo2 != null) {
    if (v.spo2 <= 94) log += 0.7;
    else log -= 0.15;
  }
  if (d.vitals.tachy && v.heartRate != null && v.heartRate >= 100) log += 0.3;
  if (d.vitals.hypertensive && v.sbp != null && v.sbp >= 160) log += 0.35;
  if (d.vitals.hypotensive && v.sbp != null && v.sbp < 95) log += 0.5;

  if (d.urgency === "emergency" && input.context.onset === "sudden") log += 0.25;
  if (d.urgency === "self-care" && input.context.severity >= 8) log -= 0.4;

  return { log, matched, missing };
}

export function runPrediction(input: EncounterInput): Prediction {
  const started = performance.now();
  const redFlags = evaluateRedFlags(input);
  const crisis = isCrisis(redFlags);

  if (input.selectedSymptoms.length === 0) {
    return {
      findings: [],
      redFlags,
      crisis: crisis.crisis,
      crisisKind: crisis.kind,
      nTrees: N_TREES,
      nFeatures: FEATURE_NAMES.length,
      nDiseases: DISEASES.length,
      elapsedMs: Math.round(performance.now() - started),
    };
  }

  const forest = getForest();
  const x = vectorize(input);
  const rf = forestPredict(forest, x);

  const profiles = DISEASES.map((_, i) => profileLogScore(input, i));
  const profileP = softmax(profiles.map((p) => p.log));

  const blended = DISEASES.map((d, i) => {
    const probability = 0.58 * rf[i] + 0.42 * profileP[i];
    return { i, probability };
  });
  blended.sort((a, b) => b.probability - a.probability);

  const top = blended.slice(0, 8).filter((row, idx) => idx === 0 || row.probability > 0.02);
  const sumTop = top.reduce((a, b) => a + b.probability, 0) || 1;

  const findings: RankedFinding[] = top.map((row) => {
    const d = DISEASES[row.i];
    const p = profiles[row.i];
    return {
      diseaseId: d.id,
      name: d.name,
      probability: row.probability / sumTop,
      rfVotes: Math.round(rf[row.i] * forest.nTrees),
      profileScore: profileP[row.i],
      matchedHallmarks: p.matched,
      missingHallmarks: p.missing,
      urgency: d.urgency,
      specialty: d.specialty,
      department: d.department,
      setting: d.setting,
    };
  });

  return {
    findings,
    redFlags,
    crisis: crisis.crisis,
    crisisKind: crisis.kind,
    nTrees: forest.nTrees,
    nFeatures: forest.nFeatures,
    nDiseases: DISEASES.length,
    elapsedMs: Math.round(performance.now() - started),
  };
}

export { DISEASE_BY_ID };
