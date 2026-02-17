import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

interface LoginRequest {
  username: string;
  password: string;
}

// Simple password hashing for development (matches signup.ts)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST({ request }: { request: Request }): Promise<Response> {
  // Only accept POST requests
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data: LoginRequest = await request.json();

    // Validate required fields
    if (!data.username || !data.password) {
      return new Response(
        JSON.stringify({ message: "Username and password required" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Normalize username
    const username = data.username.trim().toLowerCase();

    // Validate username format
    if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
      return new Response(
        JSON.stringify({ message: "Invalid username or password" }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if user file exists
    const usersDir = path.join(process.cwd(), "src/data/users");
    const filePath = path.join(usersDir, `@${username}.json`);

    let userExists = false;
    let userData;

    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      userData = JSON.parse(fileContent);
      userExists = true;
    } catch (error) {
      // User file doesn't exist
      userExists = false;
    }

    if (!userExists) {
      return new Response(
        JSON.stringify({ message: "Invalid username or password" }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // NOTE: For development mode, we're not actually verifying the password
    // In production, the Cloudflare Worker handles proper password hashing/verification
    // For dev purposes, we accept any password if user exists
    
    // Validate password length (minimum requirement)
    if (data.password.length < 8) {
      return new Response(
        JSON.stringify({ message: "Invalid username or password" }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate a mock JWT token for development
    // In production, the Cloudflare Worker generates real JWT tokens
    const mockToken = Buffer.from(
      JSON.stringify({
        username: userData.username,
        displayName: userData.displayName,
        email: userData.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      })
    ).toString("base64");

    return new Response(
      JSON.stringify({
        message: "Login successful",
        username: userData.username,
        displayName: userData.displayName,
        profile: `/@${userData.username}`,
        token: mockToken,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Login error:", error);

    return new Response(
      JSON.stringify({
        message: error.message || "Failed to login",
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
