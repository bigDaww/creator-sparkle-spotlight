import { createHmac, timingSafeEqual } from "crypto";

const UNLOCK_EVENTS = [
  "subscription.activated",
  "subscription.created",
  "subscription.payment.success",
  "transaction.completed",
];

const REVOKE_EVENTS = [
  "subscription.canceled",
  "subscription.past_due",
  "subscription.payment.failed",
];

async function setPlan(userId: string, plan: "paid" | "free") {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("profiles").update({ plan }).eq("id", userId);
  if (error) console.error("Failed to update plan:", error);
  return !error;
}

export async function handlePaddleWebhook(request: Request): Promise<Response> {
  const secret = process.env["PADDLE_WEBHOOK_SECRET"];
  if (!secret) {
    console.error("PADDLE_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const signatureHeader = request.headers.get("paddle-signature");
  if (!signatureHeader) return new Response("Missing signature", { status: 401 });

  const body = await request.text();

  // Paddle-Signature format: ts=1671552777;h1=<hex>
  const parts = Object.fromEntries(
    signatureHeader.split(";").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim() ?? "", value?.trim() ?? ""];
    })
  );

  const timestamp = parts["ts"];
  const receivedSig = parts["h1"];
  if (!timestamp || !receivedSig) {
    return new Response("Invalid signature format", { status: 401 });
  }

  // Reject replays older than 5 minutes.
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) {
    return new Response("Stale signature", { status: 401 });
  }

  const expectedSig = createHmac("sha256", secret).update(`${timestamp}:${body}`).digest("hex");
  const receivedBuf = Buffer.from(receivedSig);
  const expectedBuf = Buffer.from(expectedSig);
  if (receivedBuf.length !== expectedBuf.length || !timingSafeEqual(receivedBuf, expectedBuf)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType: string = event?.event_type;
  const userId: string | undefined = event?.data?.custom_data?.user_id;
  console.log("Paddle webhook:", eventType, event?.data?.id, "user:", userId ?? "none");

  if (userId) {
    if (UNLOCK_EVENTS.includes(eventType)) await setPlan(userId, "paid");
    else if (REVOKE_EVENTS.includes(eventType)) await setPlan(userId, "free");
  } else if ([...UNLOCK_EVENTS, ...REVOKE_EVENTS].includes(eventType)) {
    console.warn("Paddle webhook: no user_id in custom_data");
  }

  // Always 200 so Paddle does not retry a delivered-and-understood event.
  return new Response("ok", { status: 200 });
}
