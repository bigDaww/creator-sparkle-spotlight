import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "./auth-middleware";

/**
 * Error thrown when a free-plan user hits a paid-only server function.
 * The frontend can detect this by message prefix and show an upgrade prompt.
 */
export const PAID_PLAN_REQUIRED = "PAID_PLAN_REQUIRED";

export const requirePaidPlan = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    // Global bypass: when PAYWALL_ENABLED === "false", skip plan checks entirely.
    if (process.env['PAYWALL_ENABLED'] === "false") {
      return next({ context: { plan: "paid" as const } });
    }

    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to verify plan: ${error.message}`);
    if (!data || data.plan !== "paid") {
      throw new Error(`${PAID_PLAN_REQUIRED}: This feature requires a paid plan.`);
    }

    return next({ context: { plan: data.plan as "paid" } });
  });