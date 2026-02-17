import { userSchema } from "@validation/user";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const prerender = false;

interface SignupRequest {
  username: string;
  displayName: string;
  email: string;
  country: string;
  city?: string;
  whatsappNumber: string;
  bio?: string;
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
    const data: SignupRequest = await request.json();

    // Validate required fields
    if (!data.username || !data.displayName || !data.email || !data.whatsappNumber || !data.password) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Normalize username
    const username = data.username.trim().toLowerCase();

    // Validate password
    if (data.password.length < 8) {
      return new Response(
        JSON.stringify({ message: "Password must be at least 8 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate username format
    if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
      return new Response(
        JSON.stringify({ message: "Invalid username format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check username availability by checking file system
    const usersDir = path.join(process.cwd(), "src/data/users");
    const filePath = path.join(usersDir, `@${username}.json`);
    try {
      await fs.access(filePath);
      // File exists, username is taken
      return new Response(
        JSON.stringify({ message: "Username already taken" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      if (err?.code !== "ENOENT") {
        throw err;
      }
      // File doesn't exist, username is available - continue
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return new Response(
        JSON.stringify({ message: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate WhatsApp number
    if (!/^[0-9]{10,15}$/.test(data.whatsappNumber)) {
      return new Response(
        JSON.stringify({ message: "Invalid WhatsApp number" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create new user object
    const newUser = {
      username: data.username,
      displayName: data.displayName,
      email: data.email,
      country: data.country,
      city: data.city?.trim() || undefined,
      phoneNumber: data.whatsappNumber,
      whatsappNumber: data.whatsappNumber,
      bio: data.bio || "",
      website: "",
      avatar: "",
      social: {
        instagram: "",
        twitter: "",
        facebook: "",
      },
      meachat: {
        enabled: false,
        businessAccountId: "",
        catalogId: "",
        apiToken: "",
      },
      googleSheet: {
        enabled: false,
        sheetId: "",
        sheetName: "Sheet1",
        syncInterval: 3600,
      },
      googleMerchant: {
        enabled: false,
        merchantId: "",
        currency: "AED",
        autoSync: false,
      },
      createdAt: new Date().toISOString(),
    };

    // Validate against schema
    const validatedUser = userSchema.parse(newUser);

    // Add hashed password
    const userWithAuth = {
      ...validatedUser,
      password: hashedPassword,
    };

    // Save to JSON file
    const usersDir = path.join(process.cwd(), "src/data/users");
    const filePath = path.join(usersDir, `@${data.username}.json`);

    await fs.mkdir(usersDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(userWithAuth, null, 2));

    // Generate JWT token
    const token = jwt.sign(
      {
        username: data.username,
        displayName: data.displayName,
        email: data.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return new Response(
      JSON.stringify({
        message: "Signup successful",
        username: data.username,
        profile: `/@${data.username}`,
        token,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Signup error:", error);

    if (error.name === "ZodError") {
      return new Response(
        JSON.stringify({ message: "Validation error", errors: error.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: error.message || "Failed to create account" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
