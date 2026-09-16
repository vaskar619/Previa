import type { Specialty, Urgency } from "./types";

export const URGENCY_LABEL: Record<Urgency, string> = {
  emergency: "Emergency",
  urgent: "Urgent",
  soon: "Prompt care",
  routine: "Routine",
  "self-care": "Self-care",
};

export const URGENCY_HINT: Record<Urgency, string> = {
  emergency: "This pattern needs emergency services or an emergency department now.",
  urgent: "Try to be seen the same day. Do not wait it out if you are getting worse.",
  soon: "Plan to be seen in the next 1–3 days, sooner if you deteriorate.",
  routine: "Book an ordinary clinic visit, and come back sooner if warning signs appear.",
  "self-care": "Home care is often reasonable if warning signs are absent.",
};

export const SPECIALTY_LABEL: Record<Specialty, string> = {
  emergency: "Emergency medicine",
  cardiology: "Cardiology",
  pulmonology: "Pulmonology",
  gastroenterology: "Gastroenterology",
  neurology: "Neurology",
  "infectious-disease": "Infectious diseases",
  endocrinology: "Endocrinology",
  nephrology: "Nephrology",
  urology: "Urology",
  rheumatology: "Rheumatology",
  dermatology: "Dermatology",
  hematology: "Hematology",
  psychiatry: "Psychiatry",
  gynecology: "Gynecology",
  otolaryngology: "Otolaryngology",
  ophthalmology: "Ophthalmology",
  orthopedics: "Orthopedics / spine",
  "allergy-immunology": "Allergy & immunology",
  "general-medicine": "General medicine",
  pediatrics: "Pediatrics",
  oncology: "Oncology",
};

export const COMORBIDITY_OPTIONS = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hypertension", label: "Hypertension" },
  { id: "asthma", label: "Asthma" },
  { id: "copd", label: "COPD" },
  { id: "heart-disease", label: "Heart disease" },
  { id: "kidney-disease", label: "Kidney disease" },
  { id: "immunocompromised", label: "Immunocompromise" },
  { id: "cancer", label: "Active cancer" },
] as const;
