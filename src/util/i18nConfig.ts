import { localeSchema, type LocaleSchema } from "@validation/i18n";
import enData from "../config/locales/en.toml";
import arData from "../config/locales/ar.toml";

export const locales = {
  en: localeSchema.parse(enData),
  ar: localeSchema.parse(arData),
};

export const defaultLocale = "en";

export type SupportedLocale = keyof typeof locales;

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale in locales;
}

export function getLocale(locale: string | undefined): LocaleSchema {
  if (!locale || !(locale in locales)) {
    return locales[defaultLocale];
  }
  return locales[locale as SupportedLocale];
}

export function formatString(template: string, ...args: string[]): string {
  return template.replace(/{(\d+)}/g, (match, index) => {
    return typeof args[index] !== "undefined" ? args[index] : match;
  });
}
