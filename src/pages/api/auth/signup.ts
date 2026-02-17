import { getCollection } from "astro:content";
import { userSchema } from "@validation/user";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

interface SignupRequest {
  username: string;
  displayName: string;
  email: string;
  country: string;
  city?: string;
  whatsappNumber: string;
  bio?: string;
  password?: string;
  whatsappCountryCode?: string;
  whatsappLocalNumber?: string;
}

// Simple password hashing for development
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST({ request }: { request: Request }): Promise<Response> {
  // Only accept POST requests
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
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

    // Validate password
    if (data.password.length < 8) {
      return new Response(
        JSON.stringify({ message: "Password must be at least 8 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate username format
    if (!/^[a-z0-9_-]{3,20}$/.test(data.username)) {
      return new Response(
        JSON.stringify({
          message: "Invalid username format (3-20 chars, lowercase, numbers, dash)",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check username availability
    const users = await getCollection("users");
    if (users.some((u) => u.data.username === data.username)) {
      return new Response(JSON.stringify({ message: "Username already taken" }), {
        status: 409,
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return new Response(
        JSON.stringify({ message: "Invalid email format" }),
        { status: 400 }
      );
    }

    // Validate WhatsApp number
    if (!/^[0-9]{10,15}$/.test(data.whatsappNumber)) {
      return new Response(
        JSON.stringify({ message: "Invalid WhatsApp number" }),
        { status: 400 }
      );
    }

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

    // Validate against schema (password not in schema, will be stored separately)
    const validatedUser = userSchema.parse(newUser);

    // Add password hash to the data to be saved (not validated by schema)
    const userWithAuth = {
      ...validatedUser,
      password: hashPassword(data.password),
    };

    // Save to JSON file
    const usersDir = path.join(process.cwd(), "src/data/users");
    const filePath = path.join(usersDir, `@${data.username}.json`);

    // Create users directory if it doesn't exist
    try {
      await fs.mkdir(usersDir, { recursive: true });
    } catch (err) {
      console.error("Failed to create users directory:", err);
    }

    // Write user data to file
    await fs.writeFile(filePath, JSON.stringify(userWithAuth, null, 2));

    // Generate a mock JWT token for development
    const mockToken = Buffer.from(
      JSON.stringify({
        username: data.username,
        displayName: data.displayName,
        email: data.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
      })
    ).toString("base64");

    return new Response(
      JSON.stringify({
        message: "Signup successful",
        username: data.username,
        profile: `/@${data.username}`,
        token: mockToken,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Signup error:", error);

    // Check if it's a validation error
    if (error.name === "ZodError") {
      return new Response(
        JSON.stringify({
          message: "Validation error",
          errors: error.errors,
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        message: error.message || "Failed to create account",
      }),
      { status: 500 }
    );
  }
}
