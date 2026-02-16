import { getCollection } from "astro:content";
import { readGoogleSheet } from "@lib/google-sheets";
import { transformGoogleSheetRow } from "@validation/google-sheet-listing";
import {
  syncListingsToCatalog,
  testConnection,
} from "@lib/meachat";

/**
 * POST /api/users/@username/sync-meachat
 * Sync listings from Google Sheet to MeaChat catalog
 * Only works if:
 * - User exists
 * - Google Sheet integration is enabled
 * - MeaChat integration is enabled
 * - Valid API token is configured
 */
export async function POST({
  params,
}: {
  params: Record<string, string>;
}): Promise<Response> {
  const { username } = params;

  try {
    // Get user
    const users = await getCollection("users");
    const user = users.find((u) => u.data.username === username);

    if (!user) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "User not found",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const userData = user.data;

    // Check if Google Sheet is configured
    if (!userData.googleSheet?.enabled || !userData.googleSheet?.sheetId) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Google Sheet integration not enabled or configured",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if MeaChat is configured
    if (!userData.meachat?.enabled || !userData.meachat?.apiToken || !userData.meachat?.businessAccountId || !userData.meachat?.catalogId) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "MeaChat integration not enabled or configured",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Test MeaChat connection
    const businessAccountId = userData.meachat.businessAccountId as string;
    const apiToken = userData.meachat.apiToken;
    const catalogId = userData.meachat.catalogId as string;
    
    const connectionTest = await testConnection({
      businessAccountId,
      apiToken,
    });

    if (!connectionTest.success) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Invalid MeaChat API token",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch listings from Google Sheet
    let listings: any[] = [];
    try {
      const rows = await readGoogleSheet(
        userData.googleSheet.sheetId,
        userData.googleSheet.sheetName || "Sheet1"
      );

      // Transform rows to listings
      listings = rows.map((row) => transformGoogleSheetRow(row));
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Failed to fetch Google Sheet: ${err.message}`,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    if (listings.length === 0) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "No listings found in Google Sheet",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sync to MeaChat
    const syncResult = await syncListingsToCatalog(
      {
        businessAccountId,
        apiToken,
      },
      listings,
      catalogId
    );

    if (!syncResult.success) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: syncResult.error,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Cache for 1 hour
    return new Response(
      JSON.stringify({
        ok: true,
        username,
        synced: syncResult.synced,
        totalListings: listings.length,
        message: "Listings synced to MeaChat successfully",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (error: any) {
    console.error("MeaChat sync error:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function getStaticPaths() {
  const users = await getCollection("users");
  return users.map((user) => ({
    params: { username: user.data.username },
  }));
}

/**
 * GET /api/users/@username/meachat-status
 * Get current sync status and statistics
 */
export async function GET({
  params,
}: {
  params: Record<string, string>;
}): Promise<Response> {
  const { username } = params;

  try {
    const users = await getCollection("users");
    const user = users.find((u) => u.data.username === username);

    if (!user) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "User not found",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const userData = user.data;

    return new Response(
      JSON.stringify({
        ok: true,
        username,
        meachat: {
          enabled: userData.meachat?.enabled || false,
          configured: !!(userData.meachat?.apiToken && userData.meachat?.businessAccountId),
          catalogId: userData.meachat?.catalogId || null,
          hasApiToken: !!userData.meachat?.apiToken,
        },
        googleSheet: {
          enabled: userData.googleSheet?.enabled || false,
          configured: !!userData.googleSheet?.sheetId,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
