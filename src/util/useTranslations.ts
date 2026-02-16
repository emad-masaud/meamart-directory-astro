import { getLocale, formatString, type SupportedLocale } from "./i18nConfig";

/**
 * Gets translated strings for the current locale
 * This function is meant to be used in Astro components
 * It reads the locale from cookies or uses default
 */
export function useTranslations(request?: Request, fallbackLocale = "en") {
  const currentLocale = (request
    ? getLocaleFromRequest(request)
    : fallbackLocale) as SupportedLocale;
  const t = getLocale(currentLocale);

  return {
    t,
    formatString,
    locale: currentLocale,
    dir: t.dir,
  };
}

/**
 * Gets the locale from the request cookies or localStorage
 */
export function getLocaleFromRequest(request: Request): string {
  // Try to get from cookie first
  const cookie = request.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/locale=([^;]+)/);
    if (match) {
      return match[1];
    }
  }
  
  // Default to English
  return "en";
}
