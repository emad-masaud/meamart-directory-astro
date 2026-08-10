export interface WhatsApp2FAStartResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface WhatsApp2FAVerifyResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Initiates the 2FA OTP challenge over WhatsApp.
 * Calls backend endpoint which communicates with Cloudflare Worker / MeaChat WhatsApp API.
 */
export async function startWhatsApp2FA(phone: string, userId?: string): Promise<WhatsApp2FAStartResponse> {
  const res = await fetch('/api/security/whatsapp-2fa/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, userId })
  });
  return res.json();
}

/**
 * Verifies the 6-digit OTP code sent via WhatsApp.
 * Does not expose the OTP code client-side.
 */
export async function verifyWhatsApp2FA(
  phone: string,
  code: string,
  options?: {
    enable2FA?: boolean;
    loginChallenge?: boolean;
    userId?: string;
    pendingSessionData?: any;
  }
): Promise<WhatsApp2FAVerifyResponse> {
  const res = await fetch('/api/security/whatsapp-2fa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      code,
      enable2FA: options?.enable2FA,
      loginChallenge: options?.loginChallenge,
      userId: options?.userId,
      pendingSessionData: options?.pendingSessionData
    })
  });
  return res.json();
}

/**
 * Disables WhatsApp 2FA for the user profile.
 */
export async function disableWhatsApp2FA(userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch('/api/security/whatsapp-2fa/disable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  return res.json();
}
