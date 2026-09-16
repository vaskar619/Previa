import type { EncounterInput, Prediction } from "./types";

const KEY = "previa.checks.v1";

export type SavedEncounter = {
  id: string;
  createdAt: string;
  input: EncounterInput;
  prediction: Prediction;
};

export function loadHistory(): SavedEncounter[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedEncounter[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEncounter(input: EncounterInput, prediction: Prediction): SavedEncounter {
  const row: SavedEncounter = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    input,
    prediction,
  };
  const next = [row, ...loadHistory()].slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(next));
  return row;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
