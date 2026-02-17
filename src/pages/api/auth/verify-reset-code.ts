import { promises as fs } from "fs";
import path from "path";

export const prerender = false;

const RESET_CODES_DIR = path.join(process.cwd(), "src/data/reset-codes");

export async function POST({ request }: { request: Request }): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ message: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
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

    // Check if code has expired
    const expirationTime = new Date(codeData.expiresAt).getTime();
    if (Date.now() > expirationTime) {
      return new Response(
        JSON.stringify({ message: "Reset code has expired" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if code matches
    if (codeData.code !== code) {
      return new Response(
        JSON.stringify({ message: "Invalid reset code" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if code has been used
    if (codeData.used) {
      return new Response(
        JSON.stringify({ message: "Reset code has already been used" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Verify reset code error:", errorMessage);

    return new Response(
      JSON.stringify({ message: "Failed to verify reset code" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
