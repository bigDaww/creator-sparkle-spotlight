import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { trackEvent } from "@/lib/analytics";

export const PADDLE_ENV = (import.meta.env['VITE_PADDLE_ENV'] as string | undefined) ?? "sandbox";
export const PADDLE_CLIENT_TOKEN = (import.meta.env['VITE_PADDLE_CLIENT_TOKEN'] as string | undefined) ?? "";
export const PRICE_MONTHLY = (import.meta.env['VITE_PADDLE_PRICE_MONTHLY'] as string | undefined) ?? "";
export const PRICE_YEARLY = (import.meta.env['VITE_PADDLE_PRICE_YEARLY'] as string | undefined) ?? "";

export const paddleConfigured = Boolean(PADDLE_CLIENT_TOKEN);

export const PADDLE_CHECKOUT_COMPLETED = "paddle:checkout-completed";

let paddlePromise: Promise<Paddle | undefined> | null = null;

export function getPaddle() {
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: PADDLE_ENV === "production" ? "production" : "sandbox",
      token: PADDLE_CLIENT_TOKEN,
      eventCallback: (event) => {
        if (event.name === "checkout.completed" && typeof window !== "undefined") {
          trackEvent("subscription_completed", {
            plan: "paid",
            price_id: String(event.data?.items?.[0]?.price_id ?? ""),
          });
          window.dispatchEvent(new CustomEvent(PADDLE_CHECKOUT_COMPLETED));
        }
      },
    });
  }
  return paddlePromise;
}

export async function openCheckout(opts: {
  priceId: string;
  userId: string;
  email?: string;
  successUrl: string;
}) {
  const paddle = await getPaddle();
  if (!paddle) throw new Error("Checkout unavailable");
  paddle.Checkout.open({
    items: [{ priceId: opts.priceId, quantity: 1 }],
    customData: { user_id: opts.userId },
    ...(opts.email ? { customer: { email: opts.email } } : {}),
    settings: {
      displayMode: "overlay",
      theme: "dark",
      successUrl: opts.successUrl,
    },
  });
}