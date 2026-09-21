export const LOCALES = ["en", "hi", "bn", "es", "ar", "zh", "fr", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<
  Locale,
  { native: string; english: string; dir: "ltr" | "rtl"; html: string }
> = {
  en: { native: "English", english: "English", dir: "ltr", html: "en" },
  hi: { native: "हिन्दी", english: "Hindi", dir: "ltr", html: "hi" },
  bn: { native: "বাংলা", english: "Bengali", dir: "ltr", html: "bn" },
  es: { native: "Español", english: "Spanish", dir: "ltr", html: "es" },
  ar: { native: "العربية", english: "Arabic", dir: "rtl", html: "ar" },
  zh: { native: "中文", english: "Chinese", dir: "ltr", html: "zh-CN" },
  fr: { native: "Français", english: "French", dir: "ltr", html: "fr" },
  pt: { native: "Português", english: "Portuguese", dir: "ltr", html: "pt" },
};
