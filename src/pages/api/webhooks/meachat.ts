import { handleOrderWebhook } from "@lib/meachat";
import { promises as fs } from "fs";
import path from "path";

/**
 * POST /api/webhooks/meachat
 * Handle incoming webhooks from MeaChat
 * Called when:
 * - New order received
 * - Order status updated
 * - Order cancelled
 */
export async function POST({
  request,
}: {
  request: Request;
}): Promise<Response> {
  try {
    // Verify webhook signature (implement in production)
    // const signature = request.headers.get("X-MeaChat-Signature");
    // if (!verifySignature(signature, body)) return new Response("Unauthorized", { status: 401 });

    const payload = await request.json();

    // Validate webhook structure
    if (!payload.event || !payload.order_id || !payload.phone_number) {
      console.warn("Invalid webhook payload:", payload);
      return new Response(JSON.stringify({ ok: false, error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle the webhook
    const { vendorNotification } = handleOrderWebhook(payload);

    // Log webhook (store in file for now, use database in production)
    const webhookLog = {
      timestamp: new Date().toISOString(),
      event: payload.event,
      order_id: payload.order_id,
      phone_number: payload.phone_number,
      status: payload.status,
      total_price: payload.total_price,
    };

    // Append to webhook logs
    const logsDir = path.join(process.cwd(), "src/data/webhooks");
    try {
      await fs.mkdir(logsDir, { recursive: true });
    } catch (err) {
      // Directory may already exist
    }

    const logsFile = path.join(logsDir, "meachat-orders.jsonl");
    try {
      await fs.appendFile(logsFile, JSON.stringify(webhookLog) + "\n");
    } catch (err) {
      console.error("Failed to log webhook:", err);
    }

    // Send vendor notification (implement email/SMS in production)
    console.log("Order notification:", vendorNotification);

    // TODO: In production, implement:
    // - Email notification to vendor
    // - SMS notification via WhatsApp
    // - In-app notification
    // - Webhook forwarding to vendor's webhook (if configured)

    return new Response(
      JSON.stringify({
        ok: true,
        event: payload.event,
        order_id: payload.order_id,
        message: "Webhook received and processed",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Webhook processing error:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || "Failed to process webhook",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * GET /api/webhooks/meachat
 * Health check for webhook endpoint
 */
export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({
      ok: true,
      endpoint: "/api/webhooks/meachat",
      method: "POST",
      description: "MeaChat webhook receiver",
      supported_events: ["order_received", "order_updated", "order_cancelled"],
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
