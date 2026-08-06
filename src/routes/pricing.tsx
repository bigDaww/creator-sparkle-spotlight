import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Play, Loader2, ArrowLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { openCheckout, paddleConfigured, PRICE_MONTHLY, PRICE_YEARLY } from "@/lib/paddle";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — CoraHQ Pro for YouTube creators" },
      { name: "description", content: "CoraHQ Pro is $25/month or $125/year. Optimize titles, descriptions and transcripts so ChatGPT, Gemini and Perplexity cite your videos." },
      { property: "og:title", content: "Pricing — CoraHQ Pro" },
      { property: "og:description", content: "One plan, $25/month or $125/year. Unlimited video optimizations, transcript citability and AI visibility alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const FEATURES = [
  "Unlimited title & description rewrites",
  "Transcript citability analysis with rewrites",
  "Channel AI-visibility scans across ChatGPT, Gemini, Perplexity & Claude",
  "Tracked channels with change alerts",
  "Competitor positioning and trend history",
  "Priority email support",
];

function PricingPage() {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  const priceId = cycle === "monthly" ? PRICE_MONTHLY : PRICE_YEARLY;

  const subscribe = async () => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    if (!paddleConfigured || !priceId) {
      toast.error("Checkout isn't configured yet. Add your Paddle client token and price IDs.");
      return;
    }
    setLoading(true);
    try {
      trackEvent("checkout_started", {
        plan: "free",
        billing_cycle: cycle,
        price_id: priceId,
      });
      await openCheckout({
        priceId,
        userId: user.id,
        email: user.email ?? undefined,
        successUrl: `${window.location.origin}/welcome`,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't open checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
              <Play className="h-3.5 w-3.5 fill-foreground text-foreground" />
            </div>
            CoraHQ<span className="text-primary">.</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground sm:flex">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            One plan. Everything included.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Get your videos cited by ChatGPT, Gemini and Perplexity — no tiers, no per-seat pricing.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm">
            <button
              onClick={() => setCycle("monthly")}
              className={`rounded-full px-4 py-1.5 transition-colors ${cycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("yearly")}
              className={`rounded-full px-4 py-1.5 transition-colors ${cycle === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Yearly <span className="ml-1 text-xs opacity-80">save 58%</span>
            </button>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-primary/30 bg-card p-8 shadow-card md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Pro</h2>
              <p className="mt-1 text-sm text-muted-foreground">For creators who want to be the answer.</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-semibold tracking-tight">
                ${cycle === "monthly" ? "25" : "125"}
              </div>
              <p className="text-sm text-muted-foreground">
                {cycle === "monthly" ? "per month" : "per year ($10.42/mo)"}
              </p>
            </div>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>

          <Button
            size="lg"
            onClick={subscribe}
            disabled={loading}
            className="mt-8 w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening checkout…</> : user ? "Subscribe to Pro" : "Sign in to subscribe"}
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Secure checkout by Paddle · Cancel anytime
          </p>
        </section>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Questions? <a className="text-primary hover:underline" href="mailto:shahilyadav2912@gmail.com?subject=CoraHQ%20Pro">Email us</a>
        </p>
      </main>
    </div>
  );
}