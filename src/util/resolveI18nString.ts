import type { LocaleSchema } from "@validation/i18n";

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

export function resolveI18nString(
  value: string | undefined,
  translations: LocaleSchema,
): string | undefined {
  if (!value) return value;

  if (value.startsWith("i18n.")) {
    const key = value.replace(/^i18n\./, "");
    return getNestedValue(translations as Record<string, unknown>, key) ?? value;
  }

  return value;
}
