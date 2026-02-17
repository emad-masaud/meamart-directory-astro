import { promises as fs } from "fs";
import path from "path";
import { generateVerificationCode, sendEmail } from "../../lib/email";
import { sendResetCodeEmail } from "../../lib/passwordReset";

export const prerender = false;

const RESET_CODES_DIR = path.join(process.cwd(), "src/data/reset-codes");

// Ensure reset codes directory exists
async function ensureResetCodesDir() {
  try {
    await fs.mkdir(RESET_CODES_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create reset codes directory:", error);
  }
}

export async function POST({ request }: any) {
  try {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ message: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    await ensureResetCodesDir();

    const body = await request.json();
    const { email, resend } = body;

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ message: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const usersDir = path.join(process.cwd(), "src/data/users");
    let userFound = false;
    let userData: any = null;

    try {
      const files = await fs.readdir(usersDir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const filePath = path.join(usersDir, file);
          const content = await fs.readFile(filePath, "utf-8");
          const user = JSON.parse(content);
          if (user.email.toLowerCase() === normalizedEmail) {
            userFound = true;
            userData = user;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error reading users directory:", error);
    }

    if (!userFound) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expirationTime = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store the reset code
    const codeFile = path.join(RESET_CODES_DIR, `@${normalizedEmail}.json`);
    await fs.writeFile(
      codeFile,
      JSON.stringify(
        {
          email: normalizedEmail,
          code,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(expirationTime).toISOString(),
          used: false,
        },
        null,
        2
      )
    );

    // Send email with verification code
    const emailSent = await sendResetCodeEmail(
      normalizedEmail,
      userData.displayName || "User",
      code
    );

    if (!emailSent) {
      console.warn("Email sending may have failed, but code was stored");
      // Still return success, as the code is stored
    }

    return new Response(
      JSON.stringify({
        message: "Verification code sent to your email",
        email: normalizedEmail,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Forgot password error:", errorMessage);

    return new Response(
      JSON.stringify({ message: "Failed to process password reset request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
