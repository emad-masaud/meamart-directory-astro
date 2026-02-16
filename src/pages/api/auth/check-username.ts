import { getCollection } from "astro:content";

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
    const users = await getCollection("users");
    const exists = users.some((u) => u.data.username === username);

    return new Response(
      JSON.stringify({
        available: !exists,
        username,
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
