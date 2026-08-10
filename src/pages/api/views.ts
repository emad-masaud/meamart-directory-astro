import { kvGet, kvPut } from "~/utils/kv";

export const prerender = false;

export async function POST(context: any) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ success: false, error: "Missing ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const key = `ad:views:${id}`;
    let currentViews = 0;
    
    const existing = await kvGet(context, key);
    if (existing) {
      currentViews = parseInt(existing, 10);
    }
    
    currentViews += 1;
    await kvPut(context, key, currentViews.toString());

    return new Response(JSON.stringify({ success: true, views: currentViews }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Failed to update views in KV:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
