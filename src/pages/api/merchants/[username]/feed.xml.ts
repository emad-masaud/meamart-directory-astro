import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { readGoogleSheet } from "@lib/google-sheets";
import { transformGoogleSheetRow } from "@validation/google-sheet-listing";

function escapeXml(str: string | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateMerchantFeed(
  listings: any[],
  config: {
    username: string;
    currency: string;
    baseUrl: string;
  },
): string {
  const { username, currency, baseUrl } = config;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(username)} - Product Feed</title>
    <link>${escapeXml(baseUrl)}/@${escapeXml(username)}</link>
    <description>Google Merchant Center Feed</description>
`;

  listings.forEach((listing) => {
    const price = listing.price || "0";
    const title = escapeXml(listing.title);
    const description = escapeXml(listing.description || "");
    const category = escapeXml(listing.category || "");
    const link = `${baseUrl}/@${escapeXml(username)}/listing/${escapeXml(listing.id)}`;
    const imageUrl = listing.image_url
      ? escapeXml(listing.image_url)
      : "";
    const brand = escapeXml(listing.brand || "");
    const availability = (listing.availability || "in_stock").toLowerCase();
    const condition = (listing.condition || "new").toLowerCase();

    xml += `
    <item>
      <g:id>${escapeXml(listing.id)}</g:id>
      <title>${title}</title>
      <description>${description}</description>
      <link>${link}</link>
      <g:image_link>${imageUrl || `${baseUrl}/placeholder.jpg`}</g:image_link>
      <g:price>${escapeXml(price)}</g:price>
      <g:currency>${currency}</g:currency>
      <g:availability>${availability}</g:availability>
      ${category ? `<g:product_type>${category}</g:product_type>` : ""}
      ${brand ? `<g:brand>${brand}</g:brand>` : ""}
      <g:condition>${condition}</g:condition>
      ${listing.location ? `<g:location>${escapeXml(listing.location)}</g:location>` : ""}
    </item>
`;
  });

  xml += `
  </channel>
</rss>`;

  return xml;
}

export const GET: APIRoute = async ({ params, request, site }) => {
  const { username } = params;

  if (!username) {
    return new Response("Username is required", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  try {
    // Get user from collection
    const users = await getCollection("users");
    const user = users.find((u) => u.data.username === username);

    if (!user) {
      return new Response("User not found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const googleSheet = user.data.googleSheet;
    const googleMerchant = user.data.googleMerchant;

    // Check if integrations are enabled
    if (!googleMerchant?.enabled) {
      return new Response(
        "Google Merchant integration is not enabled for this user",
        {
          status: 400,
          headers: { "Content-Type": "text/plain" },
        },
      );
    }

    if (!googleSheet?.enabled || !googleSheet.sheetId) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>' +
          escapeXml(username) +
          '</title><description>No listings available</description></channel></rss>',
        {
          status: 200,
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        },
      );
    }

    // Read from Google Sheet
    let rows;
    try {
      rows = await readGoogleSheet(googleSheet.sheetId, googleSheet.sheetName);
    } catch (error) {
      return new Response(
        `<?xml version="1.0"?><error>${escapeXml(
          error instanceof Error ? error.message : "Failed to read Google Sheet",
        )}</error>`,
        {
          status: 502,
          headers: { "Content-Type": "application/xml" },
        },
      );
    }

    // Transform rows to listings
    const listings = rows
      .map((row) => transformGoogleSheetRow(row))
      .filter((listing) => listing !== null);

    // Generate XML feed
    const feed = generateMerchantFeed(listings, {
      username,
      currency: googleMerchant.currency || "USD",
      baseUrl: site?.toString().replace(/\/$/, "") || "https://example.com",
    });

    return new Response(feed, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": `attachment; filename="${username}-merchant-feed.xml"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      `<?xml version="1.0"?><error>${escapeXml(message)}</error>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml" },
      },
    );
  }
};
