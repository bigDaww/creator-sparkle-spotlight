import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Play, ClipboardPaste, Wand2, Copy, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IphoneHero } from "@/components/IphoneHero";
import { UserMenu } from "@/components/UserMenu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CoraHQ — Better YouTube titles for AI search" },
      { name: "description", content: "Paste your video. Get a title and description written to rank on ChatGPT, Gemini and Perplexity." },
      { property: "og:title", content: "CoraHQ — Better YouTube titles for AI search" },
      { property: "og:description", content: "Paste your video. Get a title and description written to rank on ChatGPT, Gemini and Perplexity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const LLMS = ["ChatGPT", "Perplexity", "Gemini", "Claude", "Copilot", "Grok"];

const STEPS = [
  { icon: ClipboardPaste, title: "Paste your video", body: "Drop in your current title, description and transcript." },
  { icon: Wand2, title: "AI rewrites it", body: "We rewrite them in the format ChatGPT, Gemini and Perplexity actually cite." },
  { icon: Copy, title: "Copy to YouTube", body: "Paste the new title and description into YouTube Studio. Done." },
];

const COMPARE_ROWS = [
  {
    label: "Title",
    before: "My BEST espresso setup for 2025 (you won't believe #3)",
    after: "Best home espresso machine under $500: Breville Bambino Plus review",
  },
  {
    label: "First line of description",
    before: "Hey guys welcome back to the channel, don't forget to like and subscribe!",
    after: "The Breville Bambino Plus pulls 18g double shots in 25 seconds with 9-bar pressure — the closest sub-$500 machine to café output.",
  },
  {
    label: "Structure",
    before: "Wall of hashtags and affiliate links.",
    after: "Specs, timestamps, and a 3-question FAQ AI engines can lift verbatim.",
  },
];

const TESTIMONIALS = [
  { quote: "Two of my old videos started showing up in ChatGPT answers within a week of rewriting the descriptions.", name: "Maya R.", handle: "@mayabuilds · 240k subs" },
  { quote: "The prompt-gap breakdown alone was worth it. I had no idea what questions I was missing.", name: "Devon K.", handle: "@devonexplains · 92k subs" },
];

const FAQS = [
  {
    q: "How is this different from regular YouTube SEO?",
    a: "YouTube SEO optimizes for YouTube's own search and recommendation algorithm. We optimize for how large language models — ChatGPT, Gemini, Perplexity, Claude — read and quote your video's metadata when answering user questions.",
  },
  {
    q: "Do I need to re-upload my video?",
    a: "No. You just copy the new title and description into YouTube Studio. The video, thumbnail and URL stay the same.",
  },
  {
    q: "Will this hurt my existing YouTube rankings?",
    a: "The rewrites keep the entities and keywords YouTube already ranks you for, and add the phrasing AI engines look for. In most cases it helps both.",
  },
  {
    q: "How long until I see citations?",
    a: "AI engines re-crawl at their own pace — usually days to a few weeks. Older, higher-authority videos tend to get picked up first.",
  },
  {
    q: "Do you need my channel login?",
    a: "Never. You paste the title, description and transcript. We give you text back. You paste it into YouTube yourself.",
  },
  {
    q: "What if my video just isn't that useful?",
    a: "We'll tell you. Optimization can't manufacture value that isn't in the content — if the underlying video doesn't answer a real question, the fix is the content, not the metadata.",
  },
];

function Index() {
  const navigate = useNavigate();
  const goOptimize = () => navigate({ to: "/optimize" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2 font-semibold tracking-tight hover:opacity-90">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
              <Play className="h-3.5 w-3.5 fill-foreground text-foreground" />
            </div>
            CoraHQ<span className="text-primary">.</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how" className="story-link transition-colors hover:text-foreground">How it works</a>
            <a href="#compare" className="story-link transition-colors hover:text-foreground">Before / after</a>
            <a href="#faq" className="story-link transition-colors hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <UserMenu />
            <Button
              size="sm"
              onClick={goOptimize}
              className="bg-gradient-primary text-primary-foreground shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95"
            >
              Optimize my video
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(var(--grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--grid-color)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top_right,black_10%,transparent_70%)]"
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="animate-fade-in text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl xl:text-7xl" style={{ animationDelay: "120ms", animationFillMode: "backwards" }}>
                Get your videos cited by ChatGPT, Gemini and Perplexity.
              </h1>
              <p className="mx-auto mt-6 max-w-xl animate-fade-in text-lg text-muted-foreground md:text-xl" style={{ animationDelay: "260ms", animationFillMode: "backwards" }}>
                Paste your title, description and transcript. We rewrite them in the format AI answer engines actually quote — so your video shows up when viewers ask.
              </p>
              <div className="mt-10 flex animate-fade-in flex-col justify-center gap-3 sm:flex-row" style={{ animationDelay: "400ms", animationFillMode: "backwards" }}>
                <Button size="lg" onClick={goOptimize} className="group bg-gradient-primary text-primary-foreground shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:opacity-95">
                  Optimize my video
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button asChild size="lg" variant="outline" className="border-border bg-transparent hover:bg-card/60">
                  <Link to="/auth">Sign in</Link>
                </Button>
              </div>
              <p className="mt-4 animate-fade-in text-xs text-muted-foreground" style={{ animationDelay: "520ms", animationFillMode: "backwards" }}>Free to try · No card required</p>
            </div>

            <div className="animate-fade-in flex justify-center lg:justify-start lg:-translate-x-[10%]" style={{ animationDelay: "300ms", animationFillMode: "backwards" }}>
              <IphoneHero />
            </div>
          </div>

          <div className="mt-20">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Optimized for</p>
            <div className="mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
              <div className="flex w-max animate-marquee gap-14 text-lg font-medium text-muted-foreground/80">
                {[...LLMS, ...LLMS, ...LLMS].map((l, i) => (
                  <span key={`${l}-${i}`} className="whitespace-nowrap transition-colors hover:text-foreground">{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-20">
            <div className="max-w-xs">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">How it works</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Three steps.</h2>
              <p className="mt-4 text-sm text-muted-foreground">No dashboards to learn. No scripts to run. Paste, rewrite, paste back.</p>
            </div>
            <ol className="divide-y divide-border/60">
              {STEPS.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[auto_1fr] gap-6 py-6 first:pt-0 last:pb-0">
                  <div className="font-mono text-sm text-muted-foreground">0{i + 1}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <s.icon className="h-4 w-4 text-foreground/80" strokeWidth={1.5} />
                      <h3 className="text-lg font-semibold">{s.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section id="compare" className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Before / after</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              What changes when we rewrite a video.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Same video. Same creator. The difference is whether ChatGPT can pull an answer out of it.
            </p>
          </div>
          <div className="mt-12 overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[140px_1fr_1fr] border-b border-border bg-background/60 text-xs uppercase tracking-[0.15em] text-muted-foreground">
              <div className="px-5 py-3"></div>
              <div className="border-l border-border px-5 py-3">Before</div>
              <div className="border-l border-border px-5 py-3 text-primary">After</div>
            </div>
            {COMPARE_ROWS.map((row) => (
              <div key={row.label} className="grid grid-cols-[140px_1fr_1fr] border-b border-border/60 last:border-b-0">
                <div className="px-5 py-5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{row.label}</div>
                <div className="border-l border-border/60 px-5 py-5 text-sm leading-relaxed text-muted-foreground line-through decoration-muted-foreground/40">
                  {row.before}
                </div>
                <div className="border-l border-border/60 bg-primary/[0.04] px-5 py-5 text-sm leading-relaxed text-foreground">
                  {row.after}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button size="lg" onClick={goOptimize} className="group bg-gradient-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:opacity-95">
              Optimize my video
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Creators using it</p>
          <div className="mt-8 grid gap-x-16 gap-y-12 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name}>
                <Quote className="h-5 w-5 text-muted-foreground/50" />
                <blockquote className="mt-4 text-xl leading-relaxed text-foreground">"{t.quote}"</blockquote>
                <figcaption className="mt-6 text-sm">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-muted-foreground">{t.handle}</div>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-16">
            <Button size="lg" onClick={goOptimize} className="group bg-gradient-primary text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:opacity-95">
              Optimize my video
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-20">
            <div className="max-w-xs">
              <p className="text-xs uppercase tracking-[0.2em] text-primary">FAQ</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Questions.</h2>
              <p className="mt-4 text-sm text-muted-foreground">Everything creators ask before they paste in their first video.</p>
            </div>
            <dl className="divide-y divide-border/60">
              {FAQS.map((f) => (
                <div key={f.q} className="grid grid-cols-1 gap-2 py-6 first:pt-0 last:pb-0 md:grid-cols-[1fr_1.4fr] md:gap-10">
                  <dt className="text-base font-medium text-foreground">{f.q}</dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10 text-center text-xs text-muted-foreground">
        CoraHQ · Built for YouTubers
      </footer>
    </div>
  );
}