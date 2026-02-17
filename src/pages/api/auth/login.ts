import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface LoginRequest {
  username: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "meamart-jwt-secret-change-in-production";

export async function POST({ request }: { request: Request }): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data: LoginRequest = await request.json();

    if (!data.username || !data.password) {
      return new Response(
        JSON.stringify({ message: "Username and password required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const username = data.username.trim().toLowerCase();

    if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
      return new Response(
        JSON.stringify({ message: "Invalid username or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const usersDir = path.join(process.cwd(), "src/data/users");
    const filePath = path.join(usersDir, `@${username}.json`);

    let userData;
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      userData = JSON.parse(fileContent);
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Invalid username or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!userData.password) {
      return new Response(
        JSON.stringify({ message: "Account needs password reset" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify password - support both bcrypt and legacy SHA-256
    let isValid = false;
    if (userData.password.startsWith("$2")) {
      isValid = await bcrypt.compare(data.password, userData.password);
    } else {
      // Legacy SHA-256 - verify and upgrade
      const crypto = await import("crypto");
      const sha256Hash = crypto.createHash("sha256").update(data.password).digest("hex");
      if (sha256Hash === userData.password) {
        isValid = true;
        // Upgrade to bcrypt
        userData.password = await bcrypt.hash(data.password, 10);
        await fs.writeFile(filePath, JSON.stringify(userData, null, 2));
      }
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ message: "Invalid username or password" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        username: userData.username,
        displayName: userData.displayName,
        email: userData.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return new Response(
      JSON.stringify({
        message: "Login successful",
        username: userData.username,
        displayName: userData.displayName,
        profile: `/@${userData.username}`,
        token,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ message: error.message || "Failed to login" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
