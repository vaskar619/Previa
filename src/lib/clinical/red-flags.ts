import type { EncounterInput, RedFlagHit } from "./types";

export function evaluateRedFlags(input: EncounterInput): RedFlagHit[] {
  const s = new Set(input.selectedSymptoms);
  const hits: RedFlagHit[] = [];
  const has = (...ids: string[]) => ids.some((id) => s.has(id));
  const vitals = input.vitals;

  if (s.has("suicidal-thoughts")) {
    hits.push({
      id: "crisis-self-harm",
      title: "Thoughts of self-harm",
      detail:
        "This workstation cannot keep you safe. If you are in immediate danger, call local emergency services. In the United States you can call or text 988.",
      action: "Use emergency or crisis services now — do not continue this as a substitute for care.",
    });
  }

  if (
    has("chest-pain", "radiating-arm") &&
    has("sweating", "shortness-of-breath", "nausea", "syncope")
  ) {
    hits.push({
      id: "acs-pattern",
      title: "Possible heart attack pattern",
      detail:
        "Chest pressure with sweating, breathlessness, nausea, or radiation can be acute coronary syndrome.",
      action: "Call emergency services. Do not drive yourself.",
    });
  } else if (has("chest-pain") && (input.bio.age >= 40 || input.bio.smoker || input.bio.comorbidities.includes("diabetes"))) {
    hits.push({
      id: "chest-pain-risk",
      title: "Chest pain in a higher-risk adult",
      detail: "New chest pain with age or vascular risk factors needs an ECG, not watchful waiting.",
      action: "Emergency department evaluation.",
    });
  }

  if (has("weakness-one-side", "facial-droop", "speech-difficulty", "vision-loss") && input.context.onset === "sudden") {
    hits.push({
      id: "stroke-pattern",
      title: "Possible stroke / TIA",
      detail: "Sudden face, arm, speech, or vision change is time-critical. Note the last time you were well.",
      action: "Call emergency services immediately.",
    });
  }

  if (has("worst-headache") || (has("headache", "neck-stiffness", "fever"))) {
    hits.push({
      id: "cns-infection-or-bleed",
      title: "Dangerous headache pattern",
      detail: "Thunderclap headache or headache with fever and neck stiffness can be meningitis or hemorrhage.",
      action: "Emergency department now.",
    });
  }

  if (has("hives", "facial-swelling") && has("wheezing", "shortness-of-breath", "stridor", "syncope")) {
    hits.push({
      id: "anaphylaxis-pattern",
      title: "Possible anaphylaxis",
      detail: "Hives or swelling with breathing difficulty or faintness needs intramuscular epinephrine and EMS.",
      action: "Use an epinephrine autoinjector if you have one and call emergency services.",
    });
  }

  if (has("rlq-pain", "rebound-pain") || (has("rlq-pain") && has("fever", "anorexia"))) {
    hits.push({
      id: "appendicitis-pattern",
      title: "Possible appendicitis",
      detail: "Right-lower pain with fever or peritoneal signs needs surgical assessment.",
      action: "Emergency department; do not eat or drink.",
    });
  }

  if (has("shortness-of-breath", "calf-swelling") || has("hemoptysis")) {
    hits.push({
      id: "pe-pattern",
      title: "Possible clot in the lung",
      detail: "Sudden dyspnea with leg swelling or coughing blood can be pulmonary embolism.",
      action: "Emergency department now.",
    });
  }

  if (has("testicular-pain") && input.bio.sex === "male") {
    hits.push({
      id: "torsion-pattern",
      title: "Acute testicular pain",
      detail: "Sudden testicular pain can be torsion — a matter of hours, not days.",
      action: "Emergency department / urology immediately.",
    });
  }

  if (has("pelvic-pain", "missed-period") && (input.bio.sex === "female" || input.bio.pregnant)) {
    hits.push({
      id: "ectopic-pattern",
      title: "Pain and a missed period",
      detail: "Ectopic pregnancy can rupture. A pregnancy test is required.",
      action: "Emergency department now.",
    });
  }

  if (has("eye-pain", "vision-loss") || has("floaters-flash", "vision-loss")) {
    hits.push({
      id: "eye-emergency",
      title: "Possible sight-threatening eye emergency",
      detail: "Acute glaucoma and retinal detachment can permanently reduce vision within hours.",
      action: "Emergency / eye emergency the same hour.",
    });
  }

  if (has("confusion", "fever") || has("seizure", "fever")) {
    hits.push({
      id: "cns-toxic",
      title: "Fever with confusion or seizure",
      detail: "Encephalitis, meningitis, or sepsis until proven otherwise.",
      action: "Emergency department now.",
    });
  }

  if (vitals.spo2 != null && vitals.spo2 <= 92) {
    hits.push({
      id: "hypoxia",
      title: "Low oxygen saturation",
      detail: `Reported SpO2 of ${vitals.spo2}% is a medical emergency in most adults.`,
      action: "Emergency services; supplemental oxygen in a clinical setting.",
    });
  }

  if (vitals.sbp != null && vitals.sbp < 90 && has("dizziness", "confusion", "syncope")) {
    hits.push({
      id: "shock",
      title: "Low blood pressure with symptoms",
      detail: "Possible shock. Do not remain at home.",
      action: "Call emergency services.",
    });
  }

  if (has("vomiting-blood", "black-stool") || (has("blood-stool") && input.context.severity >= 7) || has("coffee-ground")) {
    hits.push({
      id: "gi-bleed",
      title: "Possible gastrointestinal bleeding",
      detail: "Vomiting blood, coffee-ground emesis, or black stools can represent a brisk bleed.",
      action: "Emergency department now.",
    });
  }

  if (has("saddle-numbness", "urinary-retention") || (has("saddle-numbness") && has("bilateral-leg-weakness"))) {
    hits.push({
      id: "cauda-equina",
      title: "Possible cauda equina compression",
      detail: "Saddle numbness with bladder change or both legs weakening is a surgical emergency.",
      action: "Emergency department now — ask for urgent spine imaging.",
    });
  }

  if (has("ascending-weakness") || (has("bilateral-leg-weakness") && has("tingling") && input.context.progressing)) {
    hits.push({
      id: "gbs-pattern",
      title: "Possible Guillain–Barré pattern",
      detail: "Ascending weakness can reach the breathing muscles over hours to days.",
      action: "Emergency department now.",
    });
  }

  if (has("hot-swollen-joint") && has("fever", "inability-bear-weight", "chills")) {
    hits.push({
      id: "septic-joint",
      title: "Possible septic joint",
      detail: "One red-hot joint you cannot use is infection until a clinician aspirates it.",
      action: "Emergency department now. Do not take leftover antibiotics first.",
    });
  }

  if (
    (input.bio.pregnant || has("missed-period")) &&
    has("headache") &&
    has("blurred-vision", "seeing-halos", "ruq-pain", "seizure")
  ) {
    hits.push({
      id: "preeclampsia-pattern",
      title: "Possible preeclampsia",
      detail: "Headache with visual change or right-upper pain in pregnancy needs obstetric triage.",
      action: "Labor ward / emergency now.",
    });
  }

  if (has("jaw-claudication", "scalp-tenderness") && input.bio.age >= 50) {
    hits.push({
      id: "gca-pattern",
      title: "Possible giant cell arteritis",
      detail: "New temple pain, jaw claudication, or scalp tenderness over 50 can threaten sight the same day.",
      action: "Emergency / eye emergency the same day — do not wait for a clinic biopsy slot.",
    });
  }

  if (has("drooling", "muffled-voice") && has("stridor", "sore-throat", "odynophagia")) {
    hits.push({
      id: "airway-pharynx",
      title: "Threatened airway (epiglottitis / quinsy pattern)",
      detail: "Drooling, muffled voice, or stridor with a severe throat is an airway emergency.",
      action: "Emergency services. Sit forward. Do not inspect the throat at home.",
    });
  }

  if (has("pleuritic-pain", "shortness-of-breath") && input.context.onset === "sudden") {
    hits.push({
      id: "pneumothorax-pe",
      title: "Sudden pleuritic pain and breathlessness",
      detail: "Could be pneumothorax or pulmonary embolism.",
      action: "Emergency department now.",
    });
  }

  return hits;
}

export function isCrisis(hits: RedFlagHit[]): { crisis: boolean; kind: "self-harm" | "emergency" | null } {
  if (hits.some((h) => h.id === "crisis-self-harm")) return { crisis: true, kind: "self-harm" };
  if (hits.length > 0) return { crisis: true, kind: "emergency" };
  return { crisis: false, kind: null };
}
