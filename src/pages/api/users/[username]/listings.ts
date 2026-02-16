import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { readGoogleSheet } from "@lib/google-sheets";
import { transformGoogleSheetRow } from "@validation/google-sheet-listing";

export const GET: APIRoute = async ({ params }) => {
  const { username } = params;

  if (!username) {
    return new Response(JSON.stringify({ error: "Username is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get user from collection
    const users = await getCollection("users");
    const user = users.find((u) => u.data.username === username);

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const googleSheet = user.data.googleSheet;

    // Check if Google Sheet is enabled
    if (!googleSheet?.enabled || !googleSheet.sheetId) {
      return new Response(
        JSON.stringify({
          ok: true,
          error: "Google Sheets integration is not enabled for this user",
          listings: [],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Read from Google Sheet
    let rows;
    try {
      rows = await readGoogleSheet(googleSheet.sheetId, googleSheet.sheetName);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Failed to read Google Sheet: ${message}`,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Transform rows to listings
    const listings = rows
      .map((row) => transformGoogleSheetRow(row))
      .filter((listing) => listing !== null);

    // Add caching headers
    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600", // 1 hour
    });

    return new Response(
      JSON.stringify({
        ok: true,
        username,
        count: listings.length,
        listings,
      }),
      {
        status: 200,
        headers,
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
