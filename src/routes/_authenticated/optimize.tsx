import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { optimizeVideo } from "@/lib/optimize.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/optimize")({
  head: () => ({
    meta: [
      { title: "Optimize a video — Mentioned" },
      { name: "description", content: "Rewrite YouTube titles and descriptions for AI answer engines." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OptimizePage,
});

function OptimizePage() {
  const optimize = useServerFn(optimizeVideo);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<unknown>(null);

  const mut = useMutation({
    mutationFn: () =>
      optimize({
        data: {
          current_title: title,
          current_description: description,
          current_tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          transcript,
        },
      }),
    onSuccess: (r) => {
      try {
        setResult(JSON.parse((r as { optimization: string }).optimization));
        toast.success("Optimization ready");
      } catch {
        setResult({ raw: (r as { optimization: string }).optimization });
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Optimize
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Optimize a video for AI search</h1>
        <p className="mt-2 text-muted-foreground">
          Paste your current metadata and full transcript. We'll return a title, description and FAQ block optimized for LLM citations.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!transcript.trim()) return toast.error("Transcript is required");
            mut.mutate();
          }}
          className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8"
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Current title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Current description</Label>
            <Textarea id="desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tags">Current tags (comma separated)</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, tutorial, hooks" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tx">Transcript <span className="text-destructive">*</span></Label>
            <Textarea id="tx" rows={10} value={transcript} onChange={(e) => setTranscript(e.target.value)} required />
          </div>
          <Button
            type="submit"
            disabled={mut.isPending}
            className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          >
            {mut.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Optimizing…</>
            ) : "Optimize"}
          </Button>
        </form>

        {result != null && (
          <section className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-lg font-semibold">Result</h2>
            <pre className="mt-4 max-h-[600px] overflow-auto rounded-xl bg-background/60 p-4 text-xs leading-relaxed">
{JSON.stringify(result, null, 2)}
            </pre>
          </section>
        )}
      </main>
    </div>
  );
}