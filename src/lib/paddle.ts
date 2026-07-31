import { initializePaddle, type Paddle } from "@paddle/paddle-js";

export const PADDLE_ENV = (import.meta.env['VITE_PADDLE_ENV'] as string | undefined) ?? "sandbox";
export const PADDLE_CLIENT_TOKEN = (import.meta.env['VITE_PADDLE_CLIENT_TOKEN'] as string | undefined) ?? "";
export const PRICE_MONTHLY = (import.meta.env['VITE_PADDLE_PRICE_MONTHLY'] as string | undefined) ?? "";
export const PRICE_YEARLY = (import.meta.env['VITE_PADDLE_PRICE_YEARLY'] as string | undefined) ?? "";

export const paddleConfigured = Boolean(PADDLE_CLIENT_TOKEN);

let paddlePromise: Promise<Paddle | undefined> | null = null;

export function getPaddle() {
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: PADDLE_ENV === "production" ? "production" : "sandbox",
      token: PADDLE_CLIENT_TOKEN,
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