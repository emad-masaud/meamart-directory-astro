import { getCollection } from "astro:content";
import { userSchema } from "@validation/user";
import { promises as fs } from "fs";
import path from "path";

interface SignupRequest {
  username: string;
  displayName: string;
  email: string;
  country: string;
  city?: string;
  whatsappNumber: string;
  bio?: string;
  whatsappCountryCode?: string;
  whatsappLocalNumber?: string;
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
    if (!data.username || !data.displayName || !data.email || !data.whatsappNumber) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Validate username format
    if (!/^[a-z0-9_-]{3,20}$/.test(data.username)) {
      return new Response(
        JSON.stringify({
          message: "Invalid username format (3-20 chars, lowercase, numbers, dash)",
        }),
        { status: 400 }
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

    // Validate against schema
    const validatedUser = userSchema.parse(newUser);

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
    await fs.writeFile(filePath, JSON.stringify(validatedUser, null, 2));

    return new Response(
      JSON.stringify({
        message: "Signup successful",
        username: data.username,
        profile: `/@${data.username}`,
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
