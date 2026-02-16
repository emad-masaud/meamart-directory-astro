import {
  getLocale,
  formatString,
  isSupportedLocale,
  type SupportedLocale,
} from "./i18nConfig";

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
 * Gets the locale from the request path or cookies
 */
export function getLocaleFromRequest(request: Request): string {
  // First check custom header (set by middleware when rewriting)
  const headerLocale = request.headers.get("x-locale");
  if (headerLocale && isSupportedLocale(headerLocale)) {
    return headerLocale;
  }
  
  const url = new URL(request.url);
  const pathLocale = url.pathname.split("/").filter(Boolean)[0];
  if (pathLocale && isSupportedLocale(pathLocale)) {
    return pathLocale;
  }

  // Try to get from cookie
  const cookie = request.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/locale=([^;]+)/);
    if (match) {
      const cookieLocale = match[1];
      if (isSupportedLocale(cookieLocale)) {
        return cookieLocale;
      }
    }
  }
  
  // Default to English
  return "en";
}
