import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requirePaidPlan } from "@/integrations/supabase/require-paid";

const AddInput = z.object({
  channel: z.string().trim().min(2).max(200),
  niche: z.string().trim().min(2).max(120),
  is_competitor: z.boolean().optional().default(false),
});

export const listTrackedChannels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tracked_channels")
      .select("id, channel_input, niche, is_competitor, last_score, last_cited_models, last_checked_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listAlertEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("alert_events")
      .select("id, tracked_channel_id, event_type, old_value, new_value, seen, created_at, tracked_channels(channel_input, is_competitor)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addTrackedChannel = createServerFn({ method: "POST" })
  .middleware([requirePaidPlan])
  .inputValidator((input: unknown) => AddInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("tracked_channels")
      .insert({
        user_id: context.userId,
        channel_input: data.channel,
        niche: data.niche,
        is_competitor: data.is_competitor ?? false,
      })
      .select("id, channel_input, niche, is_competitor, last_score, last_cited_models, last_checked_at, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const removeTrackedChannel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("tracked_channels")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markAlertSeen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("alert_events")
      .update({ seen: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markAllAlertsSeen = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("alert_events")
      .update({ seen: true })
      .eq("user_id", context.userId)
      .eq("seen", false);
    if (error) throw new Error(error.message);
    return { ok: true };
  });