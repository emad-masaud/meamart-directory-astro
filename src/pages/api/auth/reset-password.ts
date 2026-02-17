import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { sendPasswordResetConfirmationEmail } from "../../../lib/passwordReset";

export const prerender = false;

const RESET_CODES_DIR = path.join(process.cwd(), "src/data/reset-codes");
const USERS_DIR = path.join(process.cwd(), "src/data/users");

export async function POST({ request }: { request: Request }): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ message: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
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

    // Verify reset code
    const codeFile = path.join(RESET_CODES_DIR, `@${normalizedEmail}.json`);

    let codeData;
    try {
      const fileContent = await fs.readFile(codeFile, "utf-8");
      codeData = JSON.parse(fileContent);
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Invalid or expired reset code" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    const expirationTime = new Date(codeData.expiresAt).getTime();
    if (Date.now() > expirationTime) {
      return new Response(
        JSON.stringify({ message: "Reset code has expired" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check code match
    if (codeData.code !== code) {
      return new Response(
        JSON.stringify({ message: "Invalid reset code" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if used
    if (codeData.used) {
      return new Response(
        JSON.stringify({ message: "Reset code has already been used" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find user by email
    let userFilePath: string | null = null;
    let userData: any = null;

    try {
      const files = await fs.readdir(USERS_DIR);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const filePath = path.join(USERS_DIR, file);
          const content = await fs.readFile(filePath, "utf-8");
          const user = JSON.parse(content);
          if (user.email.toLowerCase() === normalizedEmail) {
            userFilePath = filePath;
            userData = user;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error reading users directory:", error);
    }

    if (!userFilePath || !userData) {
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

    await fs.writeFile(userFilePath, JSON.stringify(userData, null, 2));

    // Mark code as used
    codeData.used = true;
    codeData.usedAt = new Date().toISOString();
    await fs.writeFile(codeFile, JSON.stringify(codeData, null, 2));

    // Send confirmation email
    await sendPasswordResetConfirmationEmail(
      normalizedEmail,
      userData.displayName || "User"
    );

    return new Response(
      JSON.stringify({
        message: "Password reset successfully",
        username: userData.username,
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
