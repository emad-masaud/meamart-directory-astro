import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { sendPasswordResetConfirmationEmail } from "../../lib/passwordReset";

export const prerender = false;

const RESET_CODES_DIR = path.join(process.cwd(), "src/data/reset-codes");
const USERS_DIR = path.join(process.cwd(), "src/data/users");

export async function POST({ request }: any) {
  try {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ message: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { email, code, newPassword } = body;

    // Validate inputs
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ message: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ message: "Code is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return new Response(
        JSON.stringify({ message: "Password must be at least 8 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const codeFile = path.join(RESET_CODES_DIR, `@${normalizedEmail}.json`);

    // Verify the reset code
    try {
      const codeContent = await fs.readFile(codeFile, "utf-8");
      const resetCode = JSON.parse(codeContent);

      // Check if code has expired
      const expirationTime = new Date(resetCode.expiresAt).getTime();
      if (Date.now() > expirationTime) {
        return new Response(
          JSON.stringify({ message: "Verification code has expired" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Check if code matches
      if (resetCode.code !== code) {
        return new Response(
          JSON.stringify({ message: "Invalid verification code" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Check if code was already used
      if (resetCode.used) {
        return new Response(
          JSON.stringify({ message: "Verification code has already been used" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        return new Response(
          JSON.stringify({ message: "No reset request found for this email" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      throw error;
    }

    // Find and update user
    let userFile: string | null = null;
    let userData: any = null;

    try {
      const files = await fs.readdir(USERS_DIR);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const filePath = path.join(USERS_DIR, file);
          const content = await fs.readFile(filePath, "utf-8");
          const user = JSON.parse(content);
          if (user.email.toLowerCase() === normalizedEmail) {
            userFile = filePath;
            userData = user;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error reading users directory:", error);
    }

    if (!userFile || !userData) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user with new password
    userData.password = hashedPassword;
    userData.passwordResetAt = new Date().toISOString();

    // Save updated user
    await fs.writeFile(userFile, JSON.stringify(userData, null, 2));

    // Mark the reset code as used
    const resetCodeData = JSON.parse(await fs.readFile(codeFile, "utf-8"));
    resetCodeData.used = true;
    resetCodeData.usedAt = new Date().toISOString();
    await fs.writeFile(codeFile, JSON.stringify(resetCodeData, null, 2));

    // Send confirmation email
    await sendPasswordResetConfirmationEmail(normalizedEmail, userData.displayName || "User");

    return new Response(
      JSON.stringify({
        message: "Password reset successfully",
        email: normalizedEmail,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Reset password error:", errorMessage);

    return new Response(
      JSON.stringify({ message: "Failed to reset password" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
