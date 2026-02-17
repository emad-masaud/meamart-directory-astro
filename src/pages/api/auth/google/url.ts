import { generateGoogleAuthUrl } from "../../../lib/googleOAuth";

export const prerender = false;

export async function POST({ request }: any) {
  try {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ message: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await request.json();
    const { redirectUri } = body;

    if (!redirectUri || typeof redirectUri !== "string") {
      return new Response(
        JSON.stringify({ message: "redirectUri is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const authUrl = generateGoogleAuthUrl(redirectUri);

    return new Response(
      JSON.stringify({
        authUrl,
        message: "Auth URL generated successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Google auth URL generation error:", errorMessage);

    return new Response(
      JSON.stringify({ message: "Failed to generate auth URL" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
