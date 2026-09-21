import { DISEASE_BY_ID } from "@/lib/clinical/catalog";
import { SYMPTOM_BY_ID, SYSTEM_LABEL } from "@/lib/clinical/symptoms";
import type { BodySystem } from "@/lib/clinical/types";
import { DISEASE_NAMES } from "./diseases";
import { useLocale } from "./store";
import { SYMPTOM_NAMES } from "./symptoms";
import { SYSTEM_NAMES } from "./systems";
import type { Locale } from "./types";
import { t as translate } from "./ui";

export { hydrateLocale, useLocale } from "./store";
export { LOCALES, LOCALE_META, type Locale } from "./types";
export { t } from "./ui";

export function useT() {
  const locale = useLocale((s) => s.locale);
  return {
    locale,
    t: (key: string) => translate(locale, key),
    symptomName: (id: string) => symptomName(locale, id),
    diseaseName: (id: string) => diseaseName(locale, id),
    systemName: (id: BodySystem) => systemName(locale, id),
  };
}

export function symptomName(locale: Locale, id: string): string {
  return SYMPTOM_NAMES[locale]?.[id] ?? SYMPTOM_BY_ID[id]?.name ?? id;
}

export function diseaseName(locale: Locale, id: string): string {
  return DISEASE_NAMES[locale]?.[id] ?? DISEASE_BY_ID[id]?.name ?? id;
}

export function systemName(locale: Locale, id: BodySystem): string {
  return SYSTEM_NAMES[locale]?.[id] ?? SYSTEM_LABEL[id];
}
