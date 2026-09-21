import { create } from "zustand";
import { LOCALE_META, LOCALES, type Locale } from "./types";

const KEY = "previa.locale";

function readStored(): Locale {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem(KEY);
  if (v && (LOCALES as readonly string[]).includes(v)) return v as Locale;
  const nav = navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("hi")) return "hi";
  if (nav.startsWith("bn")) return "bn";
  if (nav.startsWith("es")) return "es";
  if (nav.startsWith("ar")) return "ar";
  if (nav.startsWith("zh")) return "zh";
  if (nav.startsWith("fr")) return "fr";
  if (nav.startsWith("pt")) return "pt";
  return "en";
}

function applyDoc(locale: Locale) {
  if (typeof document === "undefined") return;
  const meta = LOCALE_META[locale];
  document.documentElement.lang = meta.html;
  document.documentElement.dir = meta.dir;
}

type State = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocale = create<State>((set) => ({
  locale: "en",
  setLocale: (locale) => {
    try {
      localStorage.setItem(KEY, locale);
    } catch {
      /* ignore */
    }
    applyDoc(locale);
    set({ locale });
  },
}));

export function hydrateLocale() {
  const locale = readStored();
  useLocale.setState({ locale });
  applyDoc(locale);
}
