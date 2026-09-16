export type BodySystem =
  | "constitutional"
  | "heent"
  | "respiratory"
  | "cardiovascular"
  | "gastrointestinal"
  | "genitourinary"
  | "musculoskeletal"
  | "neurologic"
  | "skin"
  | "psychiatric"
  | "endocrine"
  | "hematologic";

export type Specialty =
  | "emergency"
  | "cardiology"
  | "pulmonology"
  | "gastroenterology"
  | "neurology"
  | "infectious-disease"
  | "endocrinology"
  | "nephrology"
  | "urology"
  | "rheumatology"
  | "dermatology"
  | "hematology"
  | "psychiatry"
  | "gynecology"
  | "otolaryngology"
  | "ophthalmology"
  | "orthopedics"
  | "allergy-immunology"
  | "general-medicine"
  | "pediatrics"
  | "oncology";

export type Urgency = "emergency" | "urgent" | "soon" | "routine" | "self-care";

export type Sex = "female" | "male" | "other";

export type Symptom = {
  id: string;
  name: string;
  system: BodySystem;
  redFlag?: boolean;
  hint?: string;
};

export type Medication = {
  class: string;
  examples: string[];
  notes: string;
};

export type Disease = {
  id: string;
  name: string;
  icd10: string;
  specialty: Specialty;
  department: string;
  urgency: Urgency;
  setting: string;
  summary: string;
  /** P(symptom | disease), 0–1. Unlisted symptoms use a small base rate. */
  symptoms: Record<string, number>;
  ageMin: number;
  ageMax: number;
  sexBias?: "female" | "male";
  pregnancyRisk?: boolean;
  vitals: {
    fever?: boolean;
    highFever?: boolean;
    tachy?: boolean;
    brady?: boolean;
    hypoxic?: boolean;
    hypertensive?: boolean;
    hypotensive?: boolean;
  };
  comorbidBoost: string[];
  smokerBoost?: boolean;
  travelBoost?: boolean;
  redFlags: string[];
  workup: string[];
  prevention: string[];
  medications: Medication[];
  selfCare: string[];
  seekCare: string;
};

export type ComorbidityId =
  | "diabetes"
  | "hypertension"
  | "asthma"
  | "copd"
  | "heart-disease"
  | "kidney-disease"
  | "immunocompromised"
  | "cancer"
  | "pregnancy";

export type BioData = {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  pregnant: boolean;
  smoker: boolean;
  alcohol: "none" | "moderate" | "heavy";
  comorbidities: ComorbidityId[];
  allergies: string;
  medications: string;
  travel: boolean;
  notes: string;
};

export type Vitals = {
  temperatureC: number | null;
  heartRate: number | null;
  sbp: number | null;
  dbp: number | null;
  spo2: number | null;
  respRate: number | null;
};

export type SymptomContext = {
  durationDays: number;
  severity: number;
  onset: "sudden" | "gradual" | "unknown";
  progressing: boolean;
};

export type EncounterInput = {
  bio: BioData;
  vitals: Vitals;
  selectedSymptoms: string[];
  context: SymptomContext;
};

export type RankedFinding = {
  diseaseId: string;
  name: string;
  probability: number;
  rfVotes: number;
  profileScore: number;
  matchedHallmarks: string[];
  missingHallmarks: string[];
  urgency: Urgency;
  specialty: Specialty;
  department: string;
  setting: string;
};

export type RedFlagHit = {
  id: string;
  title: string;
  detail: string;
  action: string;
};

export type Prediction = {
  findings: RankedFinding[];
  redFlags: RedFlagHit[];
  crisis: boolean;
  crisisKind: "self-harm" | "emergency" | null;
  nTrees: number;
  nFeatures: number;
  nDiseases: number;
  elapsedMs: number;
};
