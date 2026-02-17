import { promises as fs } from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import {
  exchangeCodeForToken,
  getUserInfo,
  generateJWT as generateOAuthJWT,
} from "../../../../lib/googleOAuth";

export const prerender = false;

const JWT_SECRET = process.env.JWT_SECRET || "meamart-jwt-secret-change-in-production";
const USERS_DIR = path.join(process.cwd(), "src/data/users");

// Ensure users directory exists
async function ensureUsersDir() {
  try {
    await fs.mkdir(USERS_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create users directory:", error);
  }
}

// Generate username from email
function generateUsernameFromEmail(email: string): string {
  const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return baseUsername || `user_${Date.now()}`;
}

// Check if username exists
async function usernameExists(username: string): Promise<boolean> {
  try {
    const filePath = path.join(USERS_DIR, `@${username}.json`);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Find available username
async function findAvailableUsername(baseUsername: string): Promise<string> {
  let username = baseUsername;
  let counter = 1;

  while (await usernameExists(username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}

// Find user by email
async function findUserByEmail(email: string): Promise<any> {
  try {
    const files = await fs.readdir(USERS_DIR);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const filePath = path.join(USERS_DIR, file);
        const content = await fs.readFile(filePath, "utf-8");
        const user = JSON.parse(content);
        if (user.email.toLowerCase() === email.toLowerCase()) {
          return user;
        }
      }
    }
  } catch (error) {
    console.error("Error reading users directory:", error);
  }

  return null;
}

export async function GET({ url }: any) {
  try {
    await ensureUsersDir();

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error) {
      return new Response(`Authorization Error: ${errorDescription}`, {
        status: 400,
      });
    }

    if (!code) {
      return new Response("Authorization code not found", {
        status: 400,
      });
    }

    // Get the redirect URI from the request
    const protocol = url.protocol;
    const host = url.host;
    const redirectUri = `${protocol}//${host}/api/auth/google/callback`;

    // Exchange code for token
    const tokenResponse = await exchangeCodeForToken(code, redirectUri);

    // Get user info
    const userInfo = await getUserInfo(tokenResponse.access_token);

    if (!userInfo.verified_email) {
      return new Response("Email not verified with Google account", {
        status: 403,
      });
    }

    // Check if user already exists
    let user = await findUserByEmail(userInfo.email);

    if (!user) {
      // Create new user
      const baseUsername = generateUsernameFromEmail(userInfo.email);
      const username = await findAvailableUsername(baseUsername);

      user = {
        username,
        displayName: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.picture,
        provider: "google",
        googleId: userInfo.id,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        country: "",
        city: "",
        whatsappNumber: "",
        bio: "",
      };

      // Save new user
      const userFile = path.join(USERS_DIR, `@${username}.json`);
      await fs.writeFile(userFile, JSON.stringify(user, null, 2));
    } else {
      // Update last login and link Google ID if not already linked
      user.lastLoginAt = new Date().toISOString();
      if (!user.googleId) {
        user.googleId = userInfo.id;
        user.provider = "google";
      }

      // Save updated user
      const userFile = path.join(USERS_DIR, `@${user.username}.json`);
      await fs.writeFile(userFile, JSON.stringify(user, null, 2));
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      },
      JWT_SECRET,
      { algorithm: "HS256" }
    );

    // Redirect to login page with token
    const redirectUrl = new URL(`/login?success=true`, url.origin);
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set("username", user.username);

    // Set cookie for token
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
        "Set-Cookie": `meamart_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Google OAuth callback error:", errorMessage);

    const errorUrl = new URL("/login?error=authentication_failed", process.env.SITE_URL || "http://localhost:3000");
    return new Response(null, {
      status: 302,
      headers: {
        Location: errorUrl.toString(),
      },
    });
  }
}
