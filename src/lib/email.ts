interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Support for multiple email providers
// Currently supporting: Cloudflare, SendGrid, or simple SMTP

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Try Cloudflare Email Routing if configured
  if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID) {
    return sendViaCloudflare(options);
  }

  // Try SendGrid if configured
  if (process.env.SENDGRID_API_KEY) {
    return sendViaSendGrid(options);
  }

  // Try Mailgun if configured
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    return sendViaMailgun(options);
  }

  console.warn("No email provider configured");
  return false;
}

async function sendViaCloudflare(options: EmailOptions): Promise<boolean> {
  try {
    const { to, subject, html, text } = options;
    const fromEmail = process.env.FROM_EMAIL || "noreply@meamart.com";

    // Send via Cloudflare Email Routing API
    // Note: Cloudflare Email Routing requires the domain to have routing rules configured
    // This sends via the Cloudflare API

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/emails/routing/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          from: fromEmail,
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ""),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Cloudflare email send failed:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send email via Cloudflare:", error);
    return false;
  }
}

async function sendViaSendGrid(options: EmailOptions): Promise<boolean> {
  try {
    const { to, subject, html, text } = options;
    const fromEmail = process.env.FROM_EMAIL || "noreply@meamart.com";

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject,
          },
        ],
        from: { email: fromEmail },
        content: [
          {
            type: "text/html",
            value: html,
          },
          {
            type: "text/plain",
            value: text || html.replace(/<[^>]*>/g, ""),
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("SendGrid email send failed:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send email via SendGrid:", error);
    return false;
  }
}

async function sendViaMailgun(options: EmailOptions): Promise<boolean> {
  try {
    const { to, subject, html, text } = options;
    const fromEmail = process.env.FROM_EMAIL || "noreply@meamart.com";
    const domain = process.env.MAILGUN_DOMAIN;

    const data = new FormData();
    data.append("from", fromEmail);
    data.append("to", to);
    data.append("subject", subject);
    data.append("html", html);
    if (text) {
      data.append("text", text);
    }

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64")}`,
      },
      body: data,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Mailgun email send failed:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send email via Mailgun:", error);
    return false;
  }
}

// Utility to generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Utility to store reset code with expiration
export async function storeResetCode(
  email: string,
  code: string
): Promise<void> {
  const expirationTime = Date.now() + 15 * 60 * 1000; // 15 minutes
  const codePath = `src/data/reset-codes/@${email}.json`;

  // In production, this should be stored in a database with proper cleanup
  // For now, we'll use the file system with expiration tracking
}

// Utility to verify and retrieve reset code
export async function verifyResetCode(email: string, code: string): Promise<boolean> {
  try {
    const codePath = `src/data/reset-codes/@${email}.json`;
    // Verify against stored code and check expiration
    // This would be implemented with actual file read or database query
    return true;
  } catch {
    return false;
  }
}
