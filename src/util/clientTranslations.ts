import { locales, defaultLocale, formatString, type SupportedLocale } from "@util/i18nConfig";

/**
 * Client-side utility to get translations
 * This should be used in client-side scripts and Vue components
 */
export function getClientTranslations() {
  let currentLocale = defaultLocale;
  
  // Try to get from localStorage
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("locale");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed in locales) {
          currentLocale = parsed as SupportedLocale;
        }
      }
    } catch (e) {
      console.error("Error reading locale from localStorage:", e);
    }
  }
  
  return {
    t: locales[currentLocale as SupportedLocale],
    formatString,
    locale: currentLocale,
  };
}

/**
 * Subscribe to locale changes
 */
export function onLocaleChange(callback: (locale: SupportedLocale) => void) {
  if (typeof window === "undefined") return;
  
  window.addEventListener("storage", (e) => {
    if (e.key === "locale" && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed in locales) {
          callback(parsed as SupportedLocale);
        }
      } catch (err) {
        console.error("Error parsing locale change:", err);
      }
    }
  });
}
