/**
 * QR & Barcode Generator Stub
 * In a real app, this would use a library like `qrcode` to generate data URIs.
 */

export async function generateQRCode(url: string): Promise<string> {
  // Mock returns a placeholder image
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
}
