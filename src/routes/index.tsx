import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Search, LineChart, Youtube, Bot, Quote, CheckCircle2, Zap, Target, MessageSquareQuote } from "lucide-react";
import heroImg from "@/assets/hero-ai-mesh.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

const LLMS = ["ChatGPT", "Perplexity", "Gemini", "Claude", "Copilot", "Grok"];

const FEATURES = [
  { icon: Search, title: "Prompt gap analysis", body: "We simulate thousands of viewer prompts across ChatGPT, Perplexity, Gemini and Claude — and show exactly where your channel is missing." },
  { icon: Bot, title: "Answer engine optimization", body: "Rewrite titles, descriptions, chapters and transcripts into the citation-friendly format LLMs actually pull from." },
  { icon: Target, title: "Citation targeting", body: "Get your videos, quotes, and expertise embedded in the sources that ChatGPT and Perplexity cite most in your niche." },
  { icon: LineChart, title: "Mention tracking", body: "Daily monitoring of when — and how — you get named across every major model. Compare share of voice vs competing creators." },
  { icon: MessageSquareQuote, title: "Transcript enrichment", body: "Auto-generate structured takeaways, quotable soundbites and Q&A blocks that answer engines love to surface." },
  { icon: Zap, title: "One-click distribution", body: "Push your enriched transcripts and creator profile to the wikis, forums and directories LLMs crawl every week." },
];

const STEPS = [
  { n: "01", title: "Connect your channel", body: "Sign in with YouTube. We ingest your full catalogue, transcripts and metadata in under 60 seconds." },
  { n: "02", title: "See where AI ignores you", body: "Get a report of the top viewer prompts in your niche and which creators are getting cited instead of you." },
  { n: "03", title: "Ship the fixes", body: "Approve AI-generated title rewrites, chapter markers and structured summaries — pushed straight to YouTube Studio." },
  { n: "04", title: "Get mentioned. Grow.", body: "Track weekly mentions across every major LLM and watch referral traffic climb from AI answer surfaces." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            Mentioned<span className="text-primary">.</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#proof" className="transition-colors hover:text-foreground">Proof</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:inline-flex">Log in</Button>
            <Button size="sm" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              Scan my channel
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 opacity-40">
          <img src={heroImg} alt="" width={1600} height={1200} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 md:pt-32 md:pb-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Built for the 47% of Gen Z who ask ChatGPT before Google
            </div>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Get your channel <span className="text-gradient">mentioned</span> when AI answers.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Mentioned is the LLM SEO platform for YouTubers. We make sure ChatGPT, Perplexity, Gemini and Claude cite <em>your</em> videos when viewers ask questions in your niche.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                Run a free visibility scan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-border bg-card/40 backdrop-blur">
                See a sample report
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Free for channels under 100K subs · No card required</p>
          </div>

          {/* LLM logos row */}
          <div className="mt-20">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Tracked across every answer engine</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-lg font-medium text-muted-foreground/80">
              {LLMS.map((l) => (
                <span key={l} className="transition-colors hover:text-foreground">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-3">
          {[
            { stat: "1.2B", label: "AI-answered searches every day — most never reach YouTube results." },
            { stat: "63%", label: "of viewers under 30 ask an LLM for creator recommendations first." },
            { stat: "0", label: "of your videos are indexed by default in the models pulling those answers." },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-5xl font-semibold text-gradient md:text-6xl">{s.stat}</div>
              <p className="mt-3 text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-28">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">How it works</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">From invisible to inevitable in four steps.</h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="text-sm font-mono text-primary">{s.n}</div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-border/60 bg-card/20">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">The toolkit</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Everything you need to rank inside AI.</h2>
            <p className="mt-4 text-muted-foreground">Traditional SEO won't get you cited. Mentioned is purpose-built for the way large language models rank, retrieve and recommend creators.</p>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group bg-card p-8 transition-colors hover:bg-secondary">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF / QUOTE BLOCK */}
      <section id="proof" className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="rounded-3xl border border-border bg-card p-10 shadow-card">
            <Quote className="h-8 w-8 text-primary" />
            <p className="mt-6 text-xl leading-relaxed">
              "Six weeks in, ChatGPT started recommending my channel by name when people asked about home espresso. Referral traffic from AI is now bigger than my Google search traffic."
            </p>
            <div className="mt-8 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-primary" />
              <div>
                <div className="font-semibold">Maya Chen</div>
                <div className="text-sm text-muted-foreground">412K subs · Coffee & gear reviews</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-gradient-hero p-10 shadow-card">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
              <Youtube className="h-4 w-4" /> Live mention feed
            </div>
            <div className="mt-6 space-y-4">
              {[
                { model: "ChatGPT", prompt: "best beginner cycling YouTubers", verdict: "Cited in top 3" },
                { model: "Perplexity", prompt: "how to learn AI as a designer", verdict: "Linked as source" },
                { model: "Gemini", prompt: "youtube channels for home cooking", verdict: "Recommended by name" },
                { model: "Claude", prompt: "who explains stoicism well on youtube", verdict: "Quoted transcript" },
              ].map((m) => (
                <div key={m.prompt} className="flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur">
                  <div>
                    <div className="text-xs text-muted-foreground">{m.model}</div>
                    <div className="mt-0.5 text-sm">"{m.prompt}"</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {m.verdict}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING TEASER / CTA */}
      <section id="pricing" className="border-t border-border/60">
        <div className="mx-auto max-w-4xl px-6 py-28 text-center">
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Own the answer <span className="text-gradient">before someone else does.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Every day AI answers questions your videos should be answering. Start ranking inside the models your next subscribers already trust.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              Run a free visibility scan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="ghost">Talk to the team</Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-card/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-primary">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </div>
            Mentioned — LLM SEO for creators
          </div>
          <div>© {new Date().getFullYear()} Mentioned Labs. Not affiliated with YouTube, OpenAI, or Anthropic.</div>
        </div>
      </footer>
    </div>
  );
}
