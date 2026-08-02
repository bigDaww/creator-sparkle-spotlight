import { Link } from "@tanstack/react-router";
import { ArrowLeft, Play } from "lucide-react";
import type { ReactNode } from "react";
import { UserMenu } from "@/components/UserMenu";

export function LegalPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
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

      <main className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Legal</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <nav className="mt-5 flex flex-wrap gap-2">
          {[
            { to: "/terms", label: "Terms of Service" },
            { to: "/privacy", label: "Privacy Policy" },
            { to: "/refund-policy", label: "Refund Policy" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary/50 data-[status=active]:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">{intro}</p>
        <div className="mt-10 space-y-10">{children}</div>
      </main>
    </div>
  );
}

export function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-6 md:p-8">
      <h2 className="text-lg font-semibold tracking-tight">
        <span className="mr-2 text-primary">{n}.</span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a:hover]:underline [&_li]:ml-4 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}
