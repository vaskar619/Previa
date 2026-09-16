import { create } from "zustand";
import type { BioData, EncounterInput, Prediction, SymptomContext, Vitals } from "./types";

export const defaultBio = (): BioData => ({
  age: 42,
  sex: "female",
  heightCm: 168,
  weightKg: 70,
  pregnant: false,
  smoker: false,
  alcohol: "none",
  comorbidities: [],
  allergies: "",
  medications: "",
  travel: false,
  notes: "",
});

export const defaultVitals = (): Vitals => ({
  temperatureC: null,
  heartRate: null,
  sbp: null,
  dbp: null,
  spo2: null,
  respRate: null,
});

export const defaultContext = (): SymptomContext => ({
  durationDays: 3,
  severity: 5,
  onset: "gradual",
  progressing: false,
});

type AssessState = {
  step: number;
  bio: BioData;
  vitals: Vitals;
  selected: string[];
  context: SymptomContext;
  prediction: Prediction | null;
  fitting: boolean;
  setStep: (n: number) => void;
  setBio: (p: Partial<BioData>) => void;
  setVitals: (p: Partial<Vitals>) => void;
  setContext: (p: Partial<SymptomContext>) => void;
  toggleSymptom: (id: string) => void;
  setSelected: (ids: string[]) => void;
  setPrediction: (p: Prediction | null) => void;
  setFitting: (v: boolean) => void;
  reset: () => void;
  asInput: () => EncounterInput;
};

export const useAssess = create<AssessState>((set, get) => ({
  step: 0,
  bio: defaultBio(),
  vitals: defaultVitals(),
  selected: [],
  context: defaultContext(),
  prediction: null,
  fitting: false,
  setStep: (step) => set({ step }),
  setBio: (p) => set({ bio: { ...get().bio, ...p } }),
  setVitals: (p) => set({ vitals: { ...get().vitals, ...p } }),
  setContext: (p) => set({ context: { ...get().context, ...p } }),
  toggleSymptom: (id) =>
    set({
      selected: get().selected.includes(id)
        ? get().selected.filter((s) => s !== id)
        : [...get().selected, id],
    }),
  setSelected: (selected) => set({ selected }),
  setPrediction: (prediction) => set({ prediction }),
  setFitting: (fitting) => set({ fitting }),
  reset: () =>
    set({
      step: 0,
      bio: defaultBio(),
      vitals: defaultVitals(),
      selected: [],
      context: defaultContext(),
      prediction: null,
      fitting: false,
    }),
  asInput: () => ({
    bio: get().bio,
    vitals: get().vitals,
    selectedSymptoms: get().selected,
    context: get().context,
  }),
}));
