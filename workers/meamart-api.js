export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (pathname === "/api/auth/check-username") {
      return handleCheckUsername(url, env);
    }

    if (pathname === "/api/auth/signup" && request.method === "POST") {
      return handleSignup(request, env);
    }

    if (pathname === "/api/auth/login" && request.method === "POST") {
      return handleLogin(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// ===== Password Hashing with Web Crypto API =====
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password, hashedPassword) {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

// ===== JWT Token Generation =====
const JWT_SECRET = "meamart-jwt-secret-change-in-production-2026";

async function signJWT(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60), // 7 days
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
  const message = `${encodedHeader}.${encodedPayload}`;
  
  const signature = await sign(message, JWT_SECRET);
  return `${message}.${signature}`;
}

async function verifyJWT(token) {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    const message = `${headerB64}.${payloadB64}`;
    
    const expectedSignature = await sign(message, JWT_SECRET);
    if (signatureB64 !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) {
      return null; // Token expired
    }

    return payload;
  } catch {
    return null;
  }
}

async function sign(message, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  return signatureArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function base64UrlEncode(str) {
  const base64 = btoa(str);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

async function handleCheckUsername(url, env) {
  const username = url.searchParams.get("username")?.trim().toLowerCase();

  if (!username) {
    return json({ available: false, error: "Username required" });
  }

  if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
    return json({ available: false, reason: "invalid" });
  }

  const exists = await env.MEAMART_USERS.get(`user:${username}`);
  return json({
    available: !exists,
    username,
    reason: exists ? "taken" : "available",
  });
}

async function handleSignup(request, env) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ message: "Invalid JSON" }, 400);
  }

  const username = String(payload.username || "").trim().toLowerCase();
  const displayName = String(payload.displayName || "").trim();
  const email = String(payload.email || "").trim();
  const whatsappNumber = String(payload.whatsappNumber || "").trim();
  const password = String(payload.password || "");

  if (!username || !displayName || !email || !whatsappNumber || !password) {
    return json({ message: "Missing required fields" }, 400);
  }

  if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
    return json({ message: "Invalid username format" }, 400);
  }

  if (password.length < 8) {
    return json({ message: "Password must be at least 8 characters" }, 400);
  }

  const existing = await env.MEAMART_USERS.get(`user:${username}`);
  if (existing) {
    return json({ message: "Username already taken" }, 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  const record = {
    username,
    displayName,
    email,
    country: payload.country || "",
    city: payload.city || "",
    whatsappNumber,
    bio: payload.bio || "",
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  await env.MEAMART_USERS.put(`user:${username}`, JSON.stringify(record));

  // Generate JWT token
  const token = await signJWT({
    username,
    displayName,
    email,
  });

  return json({
    message: "Signup successful",
    username,
    profile: `/@${username}`,
    token,
  }, 201);
}

async function handleLogin(request, env) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ message: "Invalid JSON" }, 400);
  }

  const username = String(payload.username || "").trim().toLowerCase();
  const password = String(payload.password || "");

  if (!username || !password) {
    return json({ message: "Username and password required" }, 400);
  }

  // Get user from KV
  const userJson = await env.MEAMART_USERS.get(`user:${username}`);
  if (!userJson) {
    return json({ message: "Invalid username or password" }, 401);
  }

  const user = JSON.parse(userJson);

  // Verify password
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return json({ message: "Invalid username or password" }, 401);
  }

  // Generate JWT token
  const token = await signJWT({
    username: user.username,
    displayName: user.displayName,
    email: user.email,
  });

  return json({
    message: "Login successful",
    username: user.username,
    displayName: user.displayName,
    profile: `/@${user.username}`,
    token,
  });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
