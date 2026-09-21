import { LOCALES, LOCALE_META, useLocale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">{LOCALE_META[locale].english} language</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        className="h-11 max-w-[9.5rem] shrink-0 rounded-md border border-border bg-paper px-2 text-sm font-semibold text-foreground"
        aria-label="Language"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_META[code].native}
          </option>
        ))}
      </select>
    </label>
  );
}
