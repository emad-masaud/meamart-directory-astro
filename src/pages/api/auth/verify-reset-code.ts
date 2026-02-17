import { promises as fs } from "fs";
import path from "path";

export const prerender = false;

const RESET_CODES_DIR = path.join(process.cwd(), "src/data/reset-codes");

export async function POST({ request }: any) {
  try {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ message: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { email, code } = body;

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

    const normalizedEmail = email.trim().toLowerCase();
    const codeFile = path.join(RESET_CODES_DIR, `@${normalizedEmail}.json`);

    try {
      const content = await fs.readFile(codeFile, "utf-8");
      const resetCode = JSON.parse(content);

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

      return new Response(
        JSON.stringify({
          message: "Code verified successfully",
          email: normalizedEmail,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        return new Response(
          JSON.stringify({ message: "No reset request found for this email" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Verify reset code error:", errorMessage);

    return new Response(
      JSON.stringify({ message: "Failed to verify code" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
