import { getCollection } from "astro:content";

export async function GET({ url }: { url: URL }) {
  const username = url.searchParams.get("username");

  if (!username) {
    return new Response(JSON.stringify({ error: "Username required" }), { status: 400 });
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
    return new Response(JSON.stringify({ error: "Failed to check username" }), {
      status: 500,
    });
  }
}
