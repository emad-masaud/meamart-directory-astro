import type { APIRoute } from "astro";
import config from "@util/themeConfig";

function withOptionalCredentials(payload: Record<string, unknown>) {
  const apiToken = import.meta.env.MEACHAT_API_TOKEN as string | undefined;
  const phoneNumberId = import.meta.env.MEACHAT_PHONE_NUMBER_ID as
    | string
    | undefined;

  return {
    ...payload,
    ...(apiToken ? { apiToken } : {}),
    ...(phoneNumberId ? { phone_number_id: phoneNumberId } : {}),
  };
}

export const POST: APIRoute = async ({ request }) => {
  const submitConfig = config.directoryUI?.grid?.submit;

  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON payload." }),
      { status: 400 },
    );
  }

  // If webhook integration is not configured, just return success
  const apiConfig = submitConfig && (submitConfig as any).api;
  if (!apiConfig?.enabled || !apiConfig.endpoint) {
    return new Response(
      JSON.stringify({ ok: true, skipped: true }),
      { status: 200 },
    );
  }

  const enrichedPayload = withOptionalCredentials(payload);
  const controller = new AbortController();
  const timeoutMs = apiConfig.timeoutMs ?? 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response: Response;
    if (apiConfig.method === "GET") {
      const url = new URL(apiConfig.endpoint);
      const params = new URLSearchParams();
      Object.entries(enrichedPayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, String(value));
        }
      });
      url.search = params.toString();
      response = await fetch(url.toString(), {
        method: "GET",
        signal: controller.signal,
      });
    } else {
      response = await fetch(apiConfig.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enrichedPayload),
        signal: controller.signal,
      });
    }

    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return new Response(
      JSON.stringify({ ok: response.ok, result: body }),
      { status: response.ok ? 200 : 502 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 502 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
};
