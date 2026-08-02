import { createFileRoute } from "@tanstack/react-router";
import { handlePaddleWebhook, paddleWebhookInfo } from "@/lib/paddle-webhook.server";

export const Route = createFileRoute("/api/webhook/paddle")({
  server: {
    handlers: {
      GET: async () => paddleWebhookInfo(),
      HEAD: async () => new Response(null, { status: 200 }),
      POST: async ({ request }) => handlePaddleWebhook(request),
    },
  },
});
