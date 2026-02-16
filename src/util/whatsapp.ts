export function normalizeWhatsappNumber(input?: string) {
  if (!input) return "";
  return String(input).replace(/\D/g, "");
}

export function buildWhatsAppUrl(number?: string, message?: string) {
  const digits = normalizeWhatsappNumber(number);
  if (!digits) return "";
  if (!message) return `https://wa.me/${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
