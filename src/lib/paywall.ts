/**
 * Global paywall feature flag.
 *
 * Set PAYWALL_ENABLED (server) and VITE_PAYWALL_ENABLED (client) to "false"
 * to bypass all paid-plan gating. Any other value (or unset) = paywall ON.
 */
export function isPaywallEnabledClient(): boolean {
  return import.meta.env.VITE_PAYWALL_ENABLED !== "false";
}
