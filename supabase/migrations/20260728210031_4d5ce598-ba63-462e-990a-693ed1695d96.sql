
REVOKE EXECUTE ON FUNCTION public.prevent_plan_self_update() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_paid_plan(UUID) FROM PUBLIC, anon;
-- has_paid_plan stays callable by authenticated for backend RPC use if needed
