import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to CoraHQ Pro" },
      { name: "description", content: "Your CoraHQ Pro subscription is active. Start optimizing your videos for AI answer engines." },
      { property: "og:title", content: "Welcome to CoraHQ Pro" },
      { property: "og:description", content: "Your subscription is active — start optimizing your videos for ChatGPT, Gemini and Perplexity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const queryClient = useQueryClient();
  useEffect(() => {
    // The Paddle webhook flips the plan server-side; refresh cached plan reads.
    const t = setTimeout(() => queryClient.invalidateQueries({ queryKey: ["my-plan"] }), 2500);
    return () => clearTimeout(t);
  }, [queryClient]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">You're on Pro.</h1>
        <p className="mt-3 text-muted-foreground">
          Thanks for subscribing. Your account is being upgraded now — it can take a few seconds for the
          confirmation to land. Then every tool is unlocked.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
            <Link to="/optimize">Optimize a video <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-border bg-transparent hover:bg-card/60">
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}