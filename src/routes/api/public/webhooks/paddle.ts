import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/webhooks/paddle")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.PADDLE_WEBHOOK_SECRET;
        if (!secret) {
          console.error("PADDLE_WEBHOOK_SECRET is not set");
          return new Response("Webhook secret not configured", { status: 500 });
        }

        const signatureHeader = request.headers.get("paddle-signature");
        if (!signatureHeader) {
          return new Response("Missing signature", { status: 401 });
        }

        const body = await request.text();

        // Parse Paddle-Signature header: ts=...;h1=...
        const parts = Object.fromEntries(
          signatureHeader.split(";").map((part) => {
            const [key, value] = part.split("=");
            return [key.trim(), value.trim()];
          })
        );

        const timestamp = parts.ts;
        const receivedSig = parts.h1;

        if (!timestamp || !receivedSig) {
          return new Response("Invalid signature format", { status: 401 });
        }

        const signedPayload = `${timestamp}:${body}`;
        const expectedSig = createHmac("sha256", secret)
          .update(signedPayload)
          .digest("hex");

        const receivedBuf = Buffer.from(receivedSig);
        const expectedBuf = Buffer.from(expectedSig);

        if (
          receivedBuf.length !== expectedBuf.length ||
          !timingSafeEqual(receivedBuf, expectedBuf)
        ) {
          return new Response("Invalid signature", { status: 401 });
        }

        const event = JSON.parse(body);
        const eventType = event?.event_type;
        const data = event?.data;

        console.log("Paddle webhook received:", eventType, data?.id);

        // Unlock paid plan when subscription is activated or a one-time payment succeeds.
        const unlockEvents = [
          "subscription.activated",
          "subscription.created",
          "subscription.payment.success",
          "transaction.completed",
        ];

        if (unlockEvents.includes(eventType)) {
          const customerId =
            data?.customer_id ?? data?.customer?.id ?? data?.subscription_id;
          const customData = data?.custom_data ?? {};
          const userId = customData?.user_id;

          if (!userId) {
            console.warn("Paddle webhook: no user_id in custom_data", data);
            return new Response("ok");
          }

          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );

          const { error } = await supabaseAdmin
            .from("profiles")
            .update({ plan: "paid" })
            .eq("id", userId);

          if (error) {
            console.error("Failed to update plan:", error);
            return new Response("Failed to update plan", { status: 500 });
          }

          console.log("Activated paid plan for user:", userId);
        }

        // Downgrade on cancellation / past-due if you want strict gating.
        const revokeEvents = [
          "subscription.canceled",
          "subscription.past_due",
          "subscription.payment.failed",
        ];

        if (revokeEvents.includes(eventType)) {
          const customData = data?.custom_data ?? {};
          const userId = customData?.user_id;
          if (userId) {
            const { supabaseAdmin } = await import(
              "@/integrations/supabase/client.server"
            );
            await supabaseAdmin
              .from("profiles")
              .update({ plan: "free" })
              .eq("id", userId);
            console.log("Downgraded user:", userId);
          }
        }

        return new Response("ok");
      },
    },
  },
});
