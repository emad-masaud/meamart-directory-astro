import { promises as fs } from "fs";
import path from "path";

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const username = url.searchParams.get("username")?.trim().toLowerCase();

  if (!username) {
    return new Response(
      JSON.stringify({ available: false, error: "Username required" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const usersDir = path.join(process.cwd(), "src/data/users");
    const filePath = path.join(usersDir, `@${username}.json`);
    let exists = false;

    try {
      await fs.access(filePath);
      exists = true;
    } catch (err: any) {
      if (err?.code !== "ENOENT") {
        throw err;
      }
    }

    return new Response(
      JSON.stringify({
        available: !exists,
        username,
        reason: exists ? "taken" : "available",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ available: false, error: "Failed to check username" }),
      { status: 500 }
    );
  }
}
